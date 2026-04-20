/* 
* ALP version 1.0

* Copyright © 2024 kt corp. All rights reserved.

* 

* This is a proprietary software of kt corp, and you may not use this file except in

* compliance with license agreement with kt corp. Any redistribution or use of this

* software, with or without modification shall be strictly prohibited without prior written

* approval of kt corp, and the copyright notice above does not evidence any actual or

* intended publication of such software.

*/

import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexYList,
  getIndexMList,
  getIndexCompare2MList,
  getYIndexList,
} from "@/helpers/getIndexList";
import {
  getCompareRegionMap,
  mergeDataByRegion,
} from "@/helpers/mergeDataByRegion";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { dash_regionAggregation, llpAggregation } from "@/utils/chart/regionAggregation";
import { dateRange } from "@/utils/makeQueryFilter";
import util from "util";

export async function llpStatusSearch(options: LlpParams) {
  const [
    popData,
    kindData,
    ageData,
    avgStayDayData,
    avgldgmtDayData,
    avgStayTimeData,
  ] = await Promise.all([
    statusStayPop(options),
    statusKindStayPop(options),
    statusStayAgePop(options),
    avgStayDay(options),
    avgLDGMTDay(options),
    avgStayTime(options),
  ]);

  const stayData = normalized(
    popData,
    kindData,
    ageData,
    avgStayDayData,
    avgldgmtDayData,
    avgStayTimeData
  );

  return stayData;
}

const normalized = (
  popData: any,
  kindData: any,
  ageData: any,
  avgStayDayData: any,
  avgldgmtDayData: any,
  avgStayTimeData: any
) => {
  const result: NormalizedData[] = [];
  popData.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;

    regionData.push({
      key: "region",
      value: region,
    });
    const current_pop = Math.round(data.by_start?.pop_by_start?.value);

    regionData.push({
      key: "stayPop",
      value: current_pop,
    });
    const last_pop = Math.round(data.by_lastYear?.pop_by_lastYear?.value);
    const ratio: number =
      last_pop === 0
        ? 0
        : parseFloat((((current_pop - last_pop) / last_pop) * 100).toFixed(1));

    regionData.push({
      key: "ratio",
      value: ratio,
    });

    const kindRegionData = kindData.find((item: any) => item.key === region);
    const men = Math.round(kindRegionData?.male_pop.value);
    const women = Math.round(kindRegionData?.female_pop.value);
    const mRatio: number = parseFloat(((men / (men + women)) * 100).toFixed(1));
    regionData.push({
      key: "male",
      value: mRatio,
    });
    const fRatio: number = parseFloat(
      ((women / (men + women)) * 100).toFixed(1)
    );
    regionData.push({
      key: "female",
      value: fRatio,
    });
    const maxbucket = kindRegionData?.max_stay_region.buckets || [];

    const ageRegionData = ageData.find((item: any) => item.key === region);
    const ageGroups = [
      10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
    ];
    const numMap: Record<number, number> = {};

    ageGroups.forEach((age) => {
      numMap[age] = ageRegionData?.[`total_${age}_num`]?.value ?? 0;
    });

    const ageSums: Record<string, number> = {
      0: numMap[0o0],
      1: numMap[10] + numMap[15],
      2: numMap[20] + numMap[25],
      3: numMap[30] + numMap[35],
      4: numMap[40] + numMap[45],
      5: numMap[50] + numMap[55],
      6: numMap[60] + numMap[65],
      7: numMap[70] + numMap[75],
      8: numMap[80],
    };

    let maxAgeGroup = 0;
    let maxValue = 0;

    for (const [ageGroup, sum] of Object.entries(ageSums)) {
      if (sum > maxValue) {
        maxValue = sum;
        maxAgeGroup = Number(ageGroup);
      }
    }

    regionData.push({
      key: "ageGroup",
      value: maxAgeGroup,
    });

    for (const item of maxbucket) {
      const maxKey = Number(item.key);

      regionData.push({
        key: "rsdnRegion",
        value: maxKey,
      });
    }

    const stayDayRegionData = avgStayDayData.find(
      (item: any) => item.key === region
    );

    const avg_stay_day = Math.round(stayDayRegionData?.avg_stay_day.value) ?? 0;
    regionData.push({
      key: "avgStayDay",
      value: avg_stay_day,
    });

    const ldgmtDayData = avgldgmtDayData.find(
      (item: any) => item.key === region
    );
    const avg_ldgmt_day_tp = ldgmtDayData?.avg_day.value ?? 0;
    const avg_ldgmt_day = parseFloat(avg_ldgmt_day_tp.toFixed(1));
    regionData.push({
      key: "avgAccDay",
      value: avg_ldgmt_day,
    });
    const stayAvgValue = avgStayTimeData[0][region]?.stay_avg?.value ?? 0;
    const stay_avg_tp = stayAvgValue / 60;
    const stay_avg = parseFloat(stay_avg_tp.toFixed(1));

    regionData.push({
      key: "avgStayTime",
      value: stay_avg,
    });

    result.push({
      region,
      data: regionData,
    });
  });

  return result;
};

async function statusStayPop(options: LlpParams) {
  const { start, end, regionArray } = options;
  const { lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [{ term: { STAY_TIME_CD: 3 } }],
        should: [dateRange(true, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          by_start: {
            filter: dateRange(true, start, end),
            aggs: {
              pop_by_start: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_lastYear: {
            filter: {},
            aggs: {
              pop_by_lastYear: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };

  query.query.bool.should.push(
    dateRange(true, convertLastY.start, convertLastY.end)
  );

  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    true,
    convertLastY.start,
    convertLastY.end
  );

  const validIndices = await getIndexCompare2MList(start, "stay_sgg_mons");
  // const index = validIndices.join(",");
  
  const indexs = {
    sido: '',
    sgg: validIndices.join(","),
    adm: '',
  };

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (item:any) => {
    return await llpAggregation(
      query,
      item,
      indexs,
      start,
      "llp",
    )
  }));

  return results.flat(Infinity);
}

// 남성, 여성, 최다 유입지역
async function statusKindStayPop(options: LlpParams) {
  const { start, end, regionArray } = options;
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          { term: { STAY_TIME_CD: 3 } },
          ,
          { term: { INOUT_DIV: 2 } },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          male_pop: { sum: { field: "MALE_POPUL_NUM" } },
          female_pop: { sum: { field: "FEML_POPUL_NUM" } },
          max_stay_region: {
            terms: {
              field: "RSDN_SIDO_CD",
              size: 1,
            },
          },
        },
      },
    },
  };

  const validIndices = await getIndexMList(start, "stay_sgg_mons");
  let results: any[] = [];
  const indexs = {
    sido: '',
    sgg: validIndices.join(","),
    adm: '',
  };

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));

  return results.flat(Infinity);
}

// 최다 연령대
async function statusStayAgePop(options: LlpParams) {
  const { start, end, regionArray } = options;
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          { term: { STAY_TIME_CD: 3 } },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          total_00_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_00_POPUL_NUM') && doc['MALE_00_POPUL_NUM'].size() > 0 ? doc['MALE_00_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_00_POPUL_NUM') && doc['FEML_00_POPUL_NUM'].size() > 0 ? doc['FEML_00_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_10_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_10_POPUL_NUM') && doc['MALE_10_POPUL_NUM'].size() > 0 ? doc['MALE_10_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_10_POPUL_NUM') && doc['FEML_10_POPUL_NUM'].size() > 0 ? doc['FEML_10_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_15_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_15_POPUL_NUM') && doc['MALE_15_POPUL_NUM'].size() > 0 ? doc['MALE_15_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_15_POPUL_NUM') && doc['FEML_15_POPUL_NUM'].size() > 0 ? doc['FEML_15_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_20_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_20_POPUL_NUM') && doc['MALE_20_POPUL_NUM'].size() > 0 ? doc['MALE_20_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_20_POPUL_NUM') && doc['FEML_20_POPUL_NUM'].size() > 0 ? doc['FEML_20_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_25_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_25_POPUL_NUM') && doc['MALE_25_POPUL_NUM'].size() > 0 ? doc['MALE_25_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_25_POPUL_NUM') && doc['FEML_25_POPUL_NUM'].size() > 0 ? doc['FEML_25_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_30_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_30_POPUL_NUM') && doc['MALE_30_POPUL_NUM'].size() > 0 ? doc['MALE_30_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_30_POPUL_NUM') && doc['FEML_30_POPUL_NUM'].size() > 0 ? doc['FEML_30_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_35_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_35_POPUL_NUM') && doc['MALE_35_POPUL_NUM'].size() > 0 ? doc['MALE_35_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_35_POPUL_NUM') && doc['FEML_35_POPUL_NUM'].size() > 0 ? doc['FEML_35_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_40_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_40_POPUL_NUM') && doc['MALE_40_POPUL_NUM'].size() > 0 ? doc['MALE_40_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_40_POPUL_NUM') && doc['FEML_40_POPUL_NUM'].size() > 0 ? doc['FEML_40_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_45_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_45_POPUL_NUM') && doc['MALE_45_POPUL_NUM'].size() > 0 ? doc['MALE_45_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_45_POPUL_NUM') && doc['FEML_45_POPUL_NUM'].size() > 0 ? doc['FEML_45_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_50_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_50_POPUL_NUM') && doc['MALE_50_POPUL_NUM'].size() > 0 ? doc['MALE_50_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_50_POPUL_NUM') && doc['FEML_50_POPUL_NUM'].size() > 0 ? doc['FEML_50_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_55_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_55_POPUL_NUM') && doc['MALE_55_POPUL_NUM'].size() > 0 ? doc['MALE_55_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_55_POPUL_NUM') && doc['FEML_55_POPUL_NUM'].size() > 0 ? doc['FEML_55_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_60_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_60_POPUL_NUM') && doc['MALE_60_POPUL_NUM'].size() > 0 ? doc['MALE_60_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_60_POPUL_NUM') && doc['FEML_60_POPUL_NUM'].size() > 0 ? doc['FEML_60_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_65_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_65_POPUL_NUM') && doc['MALE_65_POPUL_NUM'].size() > 0 ? doc['MALE_65_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_65_POPUL_NUM') && doc['FEML_65_POPUL_NUM'].size() > 0 ? doc['FEML_65_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_70_num: {
            sum: {
              script: {
                source: `
                                    double malePop = doc.containsKey('MALE_70_POPUL_NUM') && doc['MALE_70_POPUL_NUM'].size() > 0 ? doc['MALE_70_POPUL_NUM'].value : 0;
          double femalePop = doc.containsKey('FEML_70_POPUL_NUM') && doc['FEML_70_POPUL_NUM'].size() > 0 ? doc['FEML_70_POPUL_NUM'].value : 0;
          return malePop + femalePop; 
                                `,
              },
            },
          },
          total_75_num: {
            sum: {
              script: {
                source: `
                                      double malePop = doc.containsKey('MALE_75_POPUL_NUM') && doc['MALE_75_POPUL_NUM'].size() > 0 ? doc['MALE_75_POPUL_NUM'].value : 0;
            double femalePop = doc.containsKey('FEML_75_POPUL_NUM') && doc['FEML_75_POPUL_NUM'].size() > 0 ? doc['FEML_75_POPUL_NUM'].value : 0;
            return malePop + femalePop;
                                  `,
              },
            },
          },
          total_80_num: {
            sum: {
              script: {
                source: `
                                      double malePop = doc.containsKey('MALE_80_POPUL_NUM') && doc['MALE_80_POPUL_NUM'].size() > 0 ? doc['MALE_80_POPUL_NUM'].value : 0;
            double femalePop = doc.containsKey('FEML_80_POPUL_NUM') && doc['FEML_80_POPUL_NUM'].size() > 0 ? doc['FEML_80_POPUL_NUM'].value : 0;
            return malePop + femalePop;
                                  `,
              },
            },
          },
        },
      },
    },
  };

  const validIndices = await getIndexMList(start, "stay_sgg_day");

  let results: any[] = [];
  const indexs = {
    sido: '',
    sgg: validIndices.join(","),
    adm: '',
  };

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  results = await Promise.all(regionArray.map(async (item:any) => {
    return await llpAggregation(
      query,
      item,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat();
}

async function avgStayDay(options: LlpParams) {
  const { start, end, regionArray } = options;
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          { term: { STAY_TIME_CD: 3 } },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          avg_stay_day: {
            avg: {
              field: "STAY_DAY",
            },
          },
        },
      },
    },
  };

  const validIndices = await getIndexMList(start, "stay_sgg_mons");
  let results: any[] = [];
  const indexs = {
    sido: '',
    sgg: validIndices.join(","),
    adm: '',
  };
  
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  results = await Promise.all(regionArray.map(async (item:any) => {
    return await llpAggregation(
      query,
      item,
      indexs,
      start,
      "llp",
    )
  }));
  return results.flat(Infinity);
}

async function avgLDGMTDay(options: LlpParams) {
  const { start, end, regionArray } = options;
  const regionType = regionArray[0].length === 5 ? 0 : 1;
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          avg_day: {
            avg: {
              field: "LDGMT_DAY_NUM",
            },
          },
        },
      },
    },
  };
  const validIndices =
    regionType === 0
      ? await getYIndexList(start, "native_ldgmt_sgg")
      : await getYIndexList(start, "native_ldgmt_sido");
  let results: any[] = [];
  const indexs = {
    sido: '',
    sgg: validIndices.join(","),
    adm: '',
  };

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
  } catch (error) {
    console.error("Error:", error);
  }

  results = await Promise.all(regionArray.map(async (item:any) => {
    return await llpAggregation(
      query,
      item,
      indexs,
      start,
      "llp",
    )
  }));
  return results.flat(Infinity);
}

async function avgStayTime(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const query: any = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, start, end)],
        should: isSido
          ? regionArray.map((region) => ({
              range: {
                SGG_CD: {
                  gte: Number(`${region}000`),
                  lte: Number(`${region}999`),
                },
              },
            }))
          : regionArray.map((region) => ({
              range: {
                SGG_CD: {
                  gte: Number(region),
                  lte: Number(region),
                },
              },
            })),
        minimum_should_match: 1,
      },
    },
    aggs: {
      by_cd: {
        filters: {
          filters: regionArray.reduce<
            Record<string, { range: { SGG_CD: { gte: number; lte: number } } }>
          >((acc, region) => {
            acc[region] = {
              range: {
                SGG_CD: isSido
                  ? {
                      gte: Number(`${region}000`),
                      lte: Number(`${region}999`),
                    }
                  : {
                      gte: Number(region),
                      lte: Number(region),
                    },
              },
            };
            return acc;
          }, {}),
        },
        aggs: {
          stay_avg: {
            avg: {
              field: "STAY_AVG",
            },
          },
        },
      },
    },
  };

  const validIndices = await getIndexYList(start, end, "stay_ratio_mons");
  const results: any[] = [];

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });

    results.push(response.body.aggregations.by_cd.buckets);

    return results;
  } catch (error) {
    console.error("Error:", error);
  }

  return results;
}
