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

import util from "util";
import { llpAggregation, regionAggregation } from "@/utils/chart/regionAggregation";
import { dateRange } from "@/utils/makeQueryFilter";
import {
  normalizedInflowData,
  normalizedStayAgeData,
  normalizedStayDaysAvgData,
  normalizedStayDayData,
  normalizedStaySexData,
  normalizedLdgmtDayData,
  normalizedLdgmtDaysAvgData,
  normalizedStayTimesData,
  normalizedStayTimesSexData,
  normalizedStayTimesAgeData,
  normalizedstayDayTimesData,
  normalizedStayTimesAvgData,
  normalizedLdgmtAgeData,
  normalizedLdgmtSexData,
} from "@/helpers/normalized/normalizedData";
import { generateSexAge } from "@/utils/generateSexAge";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getIndexMMList, getIndexYList } from "@/helpers/getIndexList";

export async function traitsAggs(options: LlpParams) {
  const [
    traitsMonsResult,
    traitsDaysResult,
    traitsLdgmtResult,
    traitsLdgmtSexAgeResult,
    stayTimesAvgResult,
    decreasePopDayResult,
    decreasePopLdgmptResult,
    decreasePopTimeResult,
    inflowResult,
    inflowDaysResult,
  ] = await Promise.all([
    stayMonsTraits(options),
    stayDaysTraits(options),
    ldgmtDaysTraits(options),
    ldgmtSexAgeTraits(options),
    stayTimesAvg(options),
    decreasePopDay(options),
    decreasePopLdmgt(options),
    decreasePopTime(options),
    inflowTraits(options),
    inflowDaysTraits(options),
  ]);

  //opensearh데이터 정규화
  const traitsInData = normalized(
    traitsMonsResult,
    traitsDaysResult,
    traitsLdgmtResult,
    traitsLdgmtSexAgeResult,
    stayTimesAvgResult,
    decreasePopDayResult,
    decreasePopLdgmptResult,
    decreasePopTimeResult,
    inflowResult,
    inflowDaysResult
  );

  return [traitsInData];
}

const normalized = (
  traitsMonsData: any,
  traitsDaysData: any,
  traitsLdgmtData: any,
  traitsLdgmtSexAgeData: any,
  stayTimesAvgData: any,
  decreasePopDayData: any,
  decreasePopLdgmtData: any,
  decreasePopTimeData: any,
  inflowData: any,
  inflowDaysData: any
) => {
  //흐름, 일별, 요일별, 시간대별, 목적별, 성연령
  const result: NormalizedObj = {
    stayDays: [],
    stayDaysAvg: [],
    stayDayssex: [],
    stayDaysage: [],
    ldgmtDays: [],
    ldgmtDaysAvg: [],
    ldgmtDayssex: [],
    ldgmtDaysage: [],
    stayTimes: [],
    stayDayTimes: [],
    stayTimesAvg: [],
    stayTimessex: [],
    stayTimesage: [],
    inflowSido: [],
    inflowSgg: [],
    inflowDays: [],
    inflowDaysAvg: [],
  };

  const stayDiv = ["1", "2-7", "8"];
  const ldgmtDiv = ["1", "2", "3", "4"];

  const tempStayAvg: { data: any[] }[] = [];
  const tempLdgmtAvg: { data: any[] }[] = [];
  const tempTimesAvg: { data: any[] }[] = [];

  if (traitsMonsData)
    for (const data of traitsMonsData) {
      const region = data.key;
      const stayDays = normalizedStayDayData(data, stayDiv);
      result.stayDays.push({ region, data: stayDays });

      const stayAvg = normalizedStayDaysAvgData(data);
      tempStayAvg.push(...stayAvg);

      const stayDaysSex = normalizedStaySexData(data, stayDiv);
      result.stayDayssex.push({ region, data: stayDaysSex });

      const stayDaysAge = normalizedStayAgeData(data, stayDiv);
      result.stayDaysage.push({
        region,
        data: [
          ...stayDaysAge,
          ...stayDaysSex
            .filter((sex: any) => sex.stay === 0)
            .map((data: any) => ({
              key: data.key,
              value: data.value,
            })),
        ],
      });
    }

  if (traitsLdgmtData)
    for (const data of traitsLdgmtData) {
      const region = data.key;
      const ldgmtDays = normalizedLdgmtDayData(data, ldgmtDiv);
      result.ldgmtDays.push({ region, data: ldgmtDays });
      const ldgmtAvg = normalizedLdgmtDaysAvgData(data);
      tempLdgmtAvg.push(...ldgmtAvg);
    }

  if (traitsLdgmtSexAgeData)
    for (const data of traitsLdgmtSexAgeData) {
      const region = data.key;
      const ldgmtDaysSex = normalizedLdgmtSexData(data).sort(
        (a: any, b: any) => (a.ldgmt as number) - (b.ldgmt as number)
      );
      result.ldgmtDayssex.push({ region, data: ldgmtDaysSex });

      const ldgmtDaysAge = normalizedLdgmtAgeData(data).sort(
        (a: any, b: any) => {
          if ((a.key as number) < (b.key as number)) return -1;
          if ((a.key as number) > (b.key as number)) return 1;
          return a.ldgmt - b.ldgmt;
        }
      );

      result.ldgmtDaysage.push({
        region,
        data: [
          ...ldgmtDaysAge,
          ...Object.entries(
            ldgmtDaysSex
              .filter((sex: any) => sex.ldgmt !== 1)
              .reduce((acc: Record<string, number>, curr: any) => {
                acc[curr.key] = (acc[curr.key] || 0) + curr.value;
                return acc;
              }, {})
          ).map(([key, value]: any) => ({ key, value })),
        ],
      });
    }

  for (const data of inflowData) {
    const region = data.key;
    const inflowSido = normalizedInflowData(data.by_sido, "pop_by_sido");

    const inflowSgg = normalizedInflowData(data.by_sgg, "pop_by_sgg", region);
    result.inflowSgg.push({ region, data: inflowSgg });

    const inflowTotal = inflowSgg
      .map((d: any) => d.value)
      .reduce((sum: any, val: any) => sum + val, 0);
    const inflowTopRatio = (inflowSgg[0].value / inflowTotal) * 100;

    result.inflowSido.push({
      region,
      data: [...inflowSido, { key: inflowSgg[0].key, value: inflowTopRatio }],
    });
  }

  if (inflowDaysData)
    for (const data of inflowDaysData) {
      const region = data.key;
      const inflowDays = normalizedStayDayData(
        data.by_stay_sido.buckets,
        stayDiv
      );

      const maxStayByRegion = inflowDays
        .filter((item: any) => item.key === "by_stay_1")
        .reduce((max: any, item: any) => (item.value > max.value ? item : max));

      const filterTotal = data.by_stay_sido.buckets.filter(
        (d: any) => d.by_stay_total
      );

      const inflowDaysAvg = normalizedStayDayData(filterTotal);

      const matchedAvg = inflowDaysAvg.find(
        (avg: any) => avg.key === maxStayByRegion.region
      );

      if (matchedAvg) {
        inflowDays.push({
          region: maxStayByRegion.region,
          key: "by_stay_1_max_avg",
          value: matchedAvg.value,
        });
      }

      result.inflowDays.push({ region, data: inflowDays });
      result.inflowDaysAvg.push({ region, data: inflowDaysAvg });
    }
  for (const data of traitsDaysData) {
    const region = data.key;
    const dayData = data.pop_by_day.buckets;
    const timeData = data.by_stay_time.buckets;
    const stayTimes = normalizedStayTimesData(timeData);
    result.stayTimes.push({ region, data: stayTimes });

    const stayDayTimes = normalizedstayDayTimesData(dayData);
    result.stayDayTimes.push({ region, data: stayDayTimes });

    const stayTimesSex = normalizedStayTimesSexData(timeData);
    result.stayTimessex.push({ region, data: stayTimesSex });

    const stayTimesAge = normalizedStayTimesAgeData(timeData);
    result.stayTimesage.push({ region, data: stayTimesAge });
  }

  for (const data of stayTimesAvgData) {
    const stayTimesAvg = normalizedStayTimesAvgData(data);

    tempTimesAvg.push(...stayTimesAvg);
  }

  const dpar_tot = decreasePopDayData.value.dpar_tot_pop.value;
  const dpar_idx = decreasePopDayData.value.dpar_tot_index.value;
  const decreasePopDay = dpar_idx / dpar_tot;
  decreasePopDayData.value = decreasePopDay;

  const dpar_tot_time = decreasePopTimeData.value.dpar_tot_pop.value;
  const dpar_idx_time = decreasePopTimeData.value.dpar_tot_index.value;
  const decreasePopTime = dpar_idx_time / dpar_tot_time;
  decreasePopTimeData.value = decreasePopTime;

  if (tempStayAvg && tempStayAvg.length > 0) {
    const regionData = {
      data: [decreasePopDayData, ...tempStayAvg],
    };
    result.stayDaysAvg = [regionData];
  }

  if (tempLdgmtAvg && tempLdgmtAvg.length > 0) {
    const regionData = {
      data: [decreasePopLdgmtData, ...tempLdgmtAvg],
    };
    result.ldgmtDaysAvg = [regionData];
  }

  if (tempTimesAvg && tempTimesAvg.length > 0) {
    const regionTimeData = {
      data: [decreasePopTimeData, ...tempTimesAvg],
    };
    result.stayTimesAvg = [regionTimeData];
  }

  return result;
};

// 체류일수별 특성, 체류일수별 성별, 연령별 분포
async function stayMonsTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  if (start.length !== 6) return;
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
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
          by_stay_total: {
            filter: {
              range: { STAY_DAY: { gte: 1 } },
            },
            aggs: generateSexAge(true),
          },
          by_stay_1: {
            filter: {
              term: { STAY_DAY: 1 },
            },
            aggs: generateSexAge(true),
          },
          "by_stay_2-7": {
            filter: {
              range: { STAY_DAY: { gte: 2, lte: 7 } },
            },
            aggs: generateSexAge(true),
          },
          by_stay_8: {
            filter: {
              range: { STAY_DAY: { gte: 8 } },
            },
            aggs: generateSexAge(true),
          },
          tot_pop: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
          tot_pop_index: {
            sum: {
              field: "TOT_STAY_INDEXN_VAL",
            },
          },
        },
      },
    },
  };
  const indexArray = await getIndexMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  let results: any[] = [];
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

// 체류시간별 특성, 체류시간별 성별, 연령별 분포
async function stayDaysTraits(options: LlpParams) {
  const { start, end, regionArray } = options;

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            term: {
              INOUT_DIV: 2,
            },
          },
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
          by_time_total: {
            terms: {
              field: "SGG_CD",
              size: 1,
            },
            aggs: {
              by_time_total: {
                sum: { field: "TOT_POPUL_NUM" },
              },
            },
          },
          pop_by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              daily_total: { sum: { field: "TOT_POPUL_NUM" } },
              by_stay_time: {
                terms: {
                  field: "STAY_TIME_CD",
                  size: 5,
                },
                aggs: {
                  pop_by_day: {
                    sum: { field: "TOT_POPUL_NUM" },
                  },
                },
              },
            },
          },
          by_stay_time: {
            terms: {
              field: "STAY_TIME_CD",
              size: 5,
            },
            aggs: generateSexAge(true),
          },
        },
      },
    },
  };
  const indexArray = await getIndexMMList(start, end, "stay_sgg_day");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };
  
  let results: any[] = [];
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

// 숙박일수별 특성, 숙박일수별 비율, 평균 숙박일수
async function ldgmtDaysTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  if (start.length !== 6) return;

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
          by_ldgmt_total: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
          by_ldgmt_1: {
            filter: {
              term: { LDGMT_CD: 1 },
            },
            aggs: {
              tot_pop_num: {
                sum: {
                  field: "LDGMT_POPUL_NUM",
                },
              },
            },
          },
          by_ldgmt_2: {
            filter: {
              term: { LDGMT_CD: 2 },
            },
            aggs: {
              tot_pop_num: {
                sum: {
                  field: "LDGMT_POPUL_NUM",
                },
              },
            },
          },
          by_ldgmt_3: {
            filter: {
              term: { LDGMT_CD: 3 },
            },
            aggs: {
              tot_pop_num: {
                sum: {
                  field: "LDGMT_POPUL_NUM",
                },
              },
            },
          },
          by_ldgmt_4: {
            filter: {
              term: { LDGMT_CD: 4 },
            },
            aggs: {
              tot_pop_num: {
                sum: {
                  field: "LDGMT_POPUL_NUM",
                },
              },
            },
          },
          avg_ldgmt: {
            avg: {
              field: "LDGMT_DAY_NUM",
            },
          },
        },
      },
    },
  };

  const indexs = {
    sido: (await getIndexYList(start, end, "native_ldgmt_sido")).join(","),
    sgg: (await getIndexYList(start, end, "native_ldgmt_sgg")).join(","),
  };

  let results: any[] = [];
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

// 숙박일수별 성별 분포, 숙박일수별 연령별 분포
async function ldgmtSexAgeTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  if (start.length !== 6) return;

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
          by_sex: {
            terms: {
              field: "SEX_DIV_CD",
            },
            aggs: {
              by_ldgmt_1: {
                sum: {
                  field: "NN_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_2: {
                sum: {
                  field: "ONE_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_3: {
                sum: {
                  field: "TWO_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_4: {
                sum: {
                  field: "MRTH_THREE_LDGMT_POPUL_NUM",
                },
              },
            },
          },
          by_age: {
            terms: {
              field: "AGEGRD_DIV_CD",
            },
            aggs: {
              by_ldgmt_1: {
                sum: {
                  field: "NN_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_2: {
                sum: {
                  field: "ONE_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_3: {
                sum: {
                  field: "TWO_LDGMT_POPUL_NUM",
                },
              },
              by_ldgmt_4: {
                sum: {
                  field: "MRTH_THREE_LDGMT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };

  const indexs = {
    sido: (
      await getIndexYList(start, end, "native_sex_agegrd_ldgmt_sido")
    ).join(","),
    sgg: (await getIndexYList(start, end, "native_sex_agegrd_ldgmt_sgg")).join(
      ","
    ),
  };

  let results: any[] = [];
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

// 평균 체류시간
async function stayTimesAvg(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const query: any = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, start, end), { term: { STAY_TIME_CD: 3 } }],
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

// 인구감소지역 일평균
async function decreasePopDay(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const query: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
      },
    },
    aggs: {
      dpar_tot_pop: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
      dpar_tot_index: {
        sum: {
          field: "TOT_STAY_INDEXN_VAL",
        },
      },
    },
  };

  const indexArray = await getIndexMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  const response = await searchWithLogging({
    index: isSido ? indexs.sido : indexs.sgg,
    body: query,
  });

  return {
    key: "인구감소지역 평균",
    value: response.body.aggregations,
  };
}

async function decreasePopLdmgt(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const query: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
        ],
      },
    },
    aggs: {
      avg_decrease_ldgmt: {
        avg: {
          field: "LDGMT_DAY_NUM",
        },
      },
    },
  };

  const indexs = {
    sido: (await getIndexYList(start, end, "native_ldgmt_sido")).join(","),
    sgg: (await getIndexYList(start, end, "native_ldgmt_sgg")).join(","),
  };

  const response = await searchWithLogging({
    index: isSido ? indexs.sido : indexs.sgg,
    body: query,
  });

  return {
    key: "인구감소지역 평균",
    value: response.body.aggregations.avg_decrease_ldgmt.value,
  };
}

// 인구감소지역 시간평균
async function decreasePopTime(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const query: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
          {
            term: {
              INOUT_DIV: 2,
            },
          },
        ],
      },
    },
    aggs: {
      dpar_tot_pop: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
      dpar_tot_index: {
        sum: {
          field: "TOT_STAY_INDEXN_VAL",
        },
      },
    },
  };

  const indexArray = await getIndexMMList(start, end, "stay_sgg_day");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  const response = await searchWithLogging({
    index: isSido ? indexs.sido : indexs.sgg,
    body: query,
  });

  return {
    key: "인구감소지역 평균",
    value: response.body.aggregations,
  };
}

// 유입지역별 특성
async function inflowTraits(options: LlpParams) {
  const { start, end, regionArray } = options;

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
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
          by_sido: {
            terms: {
              field: "RSDN_SIDO_CD",
              size: 20,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_sido: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_sgg: {
            terms: {
              field: "RSDN_SGG_CD",
              size: 10,
              order: { pop_by_sgg: "desc" },
            },
            aggs: {
              pop_by_sgg: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          total_pop_by_sido: {
            sum_bucket: {
              buckets_path: "by_sido>pop_by_sido",
            },
          },
          total_pop_by_sgg: {
            sum_bucket: {
              buckets_path: "by_sgg>pop_by_sgg",
            },
          },
        },
      },
    },
  };
  const indexArray = await getIndexMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };
  let results = await regionAggregation(query, regionArray, indexs, "traits");
  return results;
}

// 유입지역별 체류일수별 특성
async function inflowDaysTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  if (start.length !== 6) return;

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
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
          by_stay_sido: {
            terms: {
              field: "RSDN_SIDO_CD",
              size: 5,
              order: { by_stay_total: "desc" },
            },
            aggs: {
              by_stay_total: {
                sum: {
                  field: "STAY_DAY",
                },
              },
              tot_pop_index: {
                sum: {
                  field: "TOT_STAY_INDEXN_VAL",
                },
              },
              filtered_by_stay_days: {
                filters: {
                  filters: {
                    by_stay_1: { term: { STAY_DAY: 1 } },
                    "by_stay_2-7": {
                      range: {
                        STAY_DAY: { gte: 2, lte: 7 },
                      },
                    },
                    by_stay_8: {
                      range: {
                        STAY_DAY: { gte: 8 },
                      },
                    },
                  },
                },
                aggs: {
                  stay_day_sum: {
                    sum: { field: "STAY_DAY" },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const indexArray = await getIndexMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  let results = await regionAggregation(query, regionArray, indexs, "traits");

  return results;
}
