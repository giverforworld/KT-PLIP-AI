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
import { dateRange } from "@/utils/makeQueryFilter";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { normalizedGetMaxAgeGroups } from "@/helpers/normalized/normalizedData";
import { isValidMonth } from "@/middlewares/validators";
import { addUnionRegionMap, getCompareMopRegionMap, mergeDataByMopFlowRegion, mergeDataByRegion } from "@/helpers/mergeDataByRegion";
import { regionFlowAggregation, regionMopFlowAggregation } from "@/utils/chart/regionAggregation";

export async function statusSearchFlow(options: MopFlowParams) {
  const [purposeResult, purposePeriodResult, timeResult, wayResult] =
    await Promise.all([
      statusFlowSearch(options),
      statusFlowComparePeriod(options),
      statusFlowTime(options),
      statusFlowWay(options),
    ]);

  //opensearh데이터 정규화
  const purposeData = normalized(
    purposeResult,
    purposePeriodResult,
    timeResult,
    wayResult,
    options
  );

  const result: NormalizedData[] = [];
  for (const item of purposeData) {
    const regionData: NormalizedChartData[] = [];
    regionData.push({ key: "region", value: item.region as number });
    regionData.push(...item.data);
    result.push({
      region: item.region,
      data: regionData,
    });
  }

  return result;
}

const normalized = (
  purposeData: any,
  periodData: any,
  timeData: any,
  wayData: any,
  options: MopFlowParams
) => {
  const result: NormalizedData[] = [];
  purposeData.by_region.buckets.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;
    const pop = data.total.value;
    regionData.push({
      key: `flowPop`,
      value: pop,
    });
    // const periodRegionData = periodData.by_region.buckets.find(
    const periodRegionData = periodData.find(
      (item: any) => item.key === region
    );
    const compare = periodRegionData.by_lastYear.pop_by_lastYear.value
      ? Number(
          (
            ((periodRegionData.by_start.pop_by_start.value -
              periodRegionData.by_lastYear.pop_by_lastYear.value) /
              periodRegionData.by_lastYear.pop_by_lastYear.value) *
            100
          ).toFixed(2)
        )
      : 0;
    regionData.push({
      key: `compare`,
      value: compare,
    });
    const pur = data.max_flow_prps.buckets[0].key;
    regionData.push({
      key: `flowPur`,
      value: pur,
    });
    // console.log('wayData',wayData);
    // const wayRegionData = wayData[0].max_flow_way.buckets.find(
    //   (item: any) => item.key === region
    // );
    // console.log('wayRegionData',wayRegionData);
    
    const way = wayData[0]?.max_flow_way.buckets[0].key || 0;
    regionData.push({
      key: `flowWay`,
      value: way,
    });
    const male = Number(
      ((data.total_male.value / data.total.value) * 100).toFixed(0)
    );
    regionData.push({
      key: `male`,
      value: male,
    });
    const female = Number(
      ((data.total_female.value / data.total.value) * 100).toFixed(0)
    );
    regionData.push({
      key: `female`,
      value: female,
    });

    const ageGroup = normalizedGetMaxAgeGroups(data);
    regionData.push({
      key: `ageGroup`,
      value: ageGroup.maxAgeGroup,
    });

    const timeRegionData = timeData.by_region.buckets.find(
      (item: any) => item.key === region
    );
    const timezn = timeRegionData?.max_flow_time.buckets[0].key || 0;
    regionData.push({
      key: `time`,
      value: timezn,
    });

    result.push({
      region,
      data: regionData,
    });
  });

  return result;
};

//인구수, 목적, 남성, 여성, 연령대, 시간대
async function statusFlowSearch(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

  //출도착지가 전국인경우
  const isNationWide = region === regionArray[0];

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_prps_age_sgg_day"
  );

  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_prps_age_admdong_day"
  );

  const indexs = {
    SIDO: validIndicesSido.join(","),
    SGG: validIndicesSgg.join(","),
    ADMNS_DONG: validIndicesAdm.join(","),
  };

  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.SIDO },
    sgg: { codes: [], field: "MOPP", index: indexs.SGG },
    adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
  };
  regionMap = await getCompareMopRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  regionMap = await addUnionRegionMap(region, regionMap);
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";
  regionMap.sgg.codes = Array.from(new Set(regionMap.sgg.codes));
  regionMap = {
    SIDO: regionMap.sido,
    SGG: regionMap.sgg,
    ADMNS_DONG: regionMap.adm,
  }
  let regionCodes: any = [];
  if (region.length === 5) {
    regionCodes = regionMap.SGG.codes
  } else {
    regionCodes.push(region)
  }

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.SIDO },
      sgg: { codes: [], field: "MOPP", index: indexs.SGG },
      adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))
  
  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            terms: {
              [`${regionCD}_${field}_CD`]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
          order: { _key: "asc" },
        },
        aggs: {
          max_flow_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 1,
              order: { max_prps_pop: "desc" },
            },
            aggs: {
              max_prps_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          max_flow_time: {
            terms: {
              field: isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD",
              size: 1,
              order: { time_pop: "desc" },
            },
            aggs: {
              time_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          m00: { sum: { field: "MALE_00_POPUL_NUM" } },
          m10: { sum: { field: "MALE_10_POPUL_NUM" } },
          m15: { sum: { field: "MALE_15_POPUL_NUM" } },
          m20: { sum: { field: "MALE_20_POPUL_NUM" } },
          m25: { sum: { field: "MALE_25_POPUL_NUM" } },
          m30: { sum: { field: "MALE_30_POPUL_NUM" } },
          m35: { sum: { field: "MALE_35_POPUL_NUM" } },
          m40: { sum: { field: "MALE_40_POPUL_NUM" } },
          m45: { sum: { field: "MALE_45_POPUL_NUM" } },
          m50: { sum: { field: "MALE_50_POPUL_NUM" } },
          m55: { sum: { field: "MALE_55_POPUL_NUM" } },
          m60: { sum: { field: "MALE_60_POPUL_NUM" } },
          m65: { sum: { field: "MALE_65_POPUL_NUM" } },
          m70: { sum: { field: "MALE_70_POPUL_NUM" } },
          m75: { sum: { field: "MALE_75_POPUL_NUM" } },
          m80: { sum: { field: "MALE_80_POPUL_NUM" } },
          f00: { sum: { field: "FEML_00_POPUL_NUM" } },
          f10: { sum: { field: "FEML_10_POPUL_NUM" } },
          f15: { sum: { field: "FEML_15_POPUL_NUM" } },
          f20: { sum: { field: "FEML_20_POPUL_NUM" } },
          f25: { sum: { field: "FEML_25_POPUL_NUM" } },
          f30: { sum: { field: "FEML_30_POPUL_NUM" } },
          f35: { sum: { field: "FEML_35_POPUL_NUM" } },
          f40: { sum: { field: "FEML_40_POPUL_NUM" } },
          f45: { sum: { field: "FEML_45_POPUL_NUM" } },
          f50: { sum: { field: "FEML_50_POPUL_NUM" } },
          f55: { sum: { field: "FEML_55_POPUL_NUM" } },
          f60: { sum: { field: "FEML_60_POPUL_NUM" } },
          f65: { sum: { field: "FEML_65_POPUL_NUM" } },
          f70: { sum: { field: "FEML_70_POPUL_NUM" } },
          f75: { sum: { field: "FEML_75_POPUL_NUM" } },
          f80: { sum: { field: "FEML_80_POPUL_NUM" } },
          total: { sum: { field: "TOT_POPUL_NUM" } },
          total_male: { sum: { field: "MALE_POPUL_NUM" } },
          total_female: { sum: { field: "FEML_POPUL_NUM" } },
        },
      },
    },
  };

  //출도착지역 전국일 경우
  if (isNationWide) {
    query.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  } else {
    query.query.bool.filter.push({
      terms: {
        // [`${flowCD}_${field}_CD`]: regionArray,
        [`${flowCD}_${field}_CD`]: changeRegionArr,
      },
    });
    query.aggs.by_region.terms.field = `${flowCD}_${field}_CD`;
  }

  const response = await searchWithLogging({
    index: indexs[field],
    body: query,
  });
  let resultBucket: any = [];
  for (const [key, value] of newMap) {
    let arr:any = [];
    response.body.aggregations.by_region.buckets.map((bucket:any) => {
      if (value.find((el:any) => el === bucket.key.toString())) {
        arr.push(bucket)
      }
    })
    const bucketOne = await mergeDataByMopFlowRegion(arr, key);
    resultBucket.push(...bucketOne.flat(Infinity));
  }
  response.body.aggregations.by_region.buckets = resultBucket;
  return response.body.aggregations;
}

//전년동기
async function statusFlowComparePeriod(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;
  const { lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);

  //출도착지가 전국인경우
  const isNationWide = region === regionArray[0];

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          // {
          //   term: {
          //     [`${regionCD}_${field}_CD`]: region,
          //   },
          // },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          // field: `${regionCD}_${field}_CD`,
          field: ``,
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          by_start: {
            filter: dateRange(false, start, end),
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

  //출도착지역 전국일 경우
  // if (isNationWide) {
  //   query.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  // } else {
  //   query.query.bool.filter.push({
  //     terms: {
  //       [`${flowCD}_${field}_CD`]: regionArray,
  //     },
  //   });
  //   query.aggs.by_region.terms.field = `${flowCD}_${field}_CD`;
  // }

  if (start.length === 6) {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(false, convertLastY.start, convertLastY.end),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });

    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      convertLastY.start,
      convertLastY.end
    );
  } else {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(
            false,
            lastYear + start.substring(6, 8),
            lastYear + end.substring(6, 8)
          ),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      lastYear + start.substring(6, 8),
      lastYear + end.substring(6, 8)
    );
  }
  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexCompareMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_sgg_day",
    false
  );
  const validIndicesAdm = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_admdong_day",
    false
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

  // try {
  //   let results = await regionFlowAggregation(
  //     query,
  //     regionArray,
  //     true,
  //     isInflow,
  //     indexs,
  //     "period",
  //     start,
  //     regionArray.length === 1
  //   );

  //   results = await mergeDataByRegion(results, regionArray);
  //   return results;
  // } catch (error) {
  //   console.error(error);
  // }
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      true,
      isInflow,
      indexs,
      "period",
      start,
      regionArray.length === 1
    )
  }));
  results = results.flat(Infinity);
  return results;
}

// 최다유입/유출수단
async function statusFlowWay(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

  //출도착지가 전국인경우
  const isNationWide = region === regionArray[0];

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_way_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_way_age_sgg_day"
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_way_age_admdong_day"
  );

  const indexs = {
    SIDO: validIndicesSido.join(","),
    SGG: validIndicesSgg.join(","),
    ADMNS_DONG: validIndicesAdm.join(","),
  };

  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.SIDO },
    sgg: { codes: [], field: "MOPP", index: indexs.SGG },
    adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
  };
  regionMap = await getCompareMopRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  regionMap = await addUnionRegionMap(region, regionMap);
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";
  regionMap.sgg.codes = Array.from(new Set(regionMap.sgg.codes));
  regionMap = {
    SIDO: regionMap.sido,
    SGG: regionMap.sgg,
    ADMNS_DONG: regionMap.adm,
  }
  let regionCodes: any = [];
  if (region.length === 5) {
    regionCodes = regionMap.SGG.codes
  } else {
    regionCodes.push(region)
  }

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.SIDO },
      sgg: { codes: [], field: "MOPP", index: indexs.SGG },
      adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            terms: {
              [`${regionCD}_${field}_CD`]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
          // size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          max_flow_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 1,
              order: { max_way_pop: "desc" },
            },
            aggs: {
              max_way_pop: {
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

  //출도착지역 전국일 경우
  if (isNationWide) {
    query.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  } else {
    query.query.bool.filter.push({
      terms: {
        [`${flowCD}_${field}_CD`]: changeRegionArr,
        // [`${flowCD}_${field}_CD`]: regionArray,
      },
    });
    query.aggs.by_region.terms.field = `${flowCD}_${field}_CD`;
  }
  // 존재하는 인덱스만 필터링
  // const validIndicesSido = await getIndexMMList(
  //   start,
  //   end,
  //   `native_way_age_sgg_day`
  // );
  // const validIndicesSgg = await getIndexMMList(
  //   start,
  //   end,
  //   "native_way_age_sgg_day"
  // );
  // const validIndicesAdm = await getIndexMMList(
  //   start,
  //   end,
  //   "native_way_age_admdong_day"
  // );
  // const indexs = {
  //   SIDO: validIndicesSido.join(","),
  //   SGG: validIndicesSgg.join(","),
  //   ADMNS_DONG: validIndicesAdm.join(","),
  // };
  try {
    const response = await searchWithLogging({
      index: indexs[field],
      body: query,
    });
    // const results = await mergeDataByMopFlowRegion(response.body.aggregations.by_region.buckets, region);
    // return results.flat(Infinity);
    let resultBucket: any = [];
    for (const [key, value] of newMap) {
      let arr:any = [];
      response.body.aggregations.by_region.buckets.map((bucket:any) => {
        if (value.find((el:any) => el === bucket.key.toString())) {
          arr.push(bucket)
        }
      })
      const bucketOne = await mergeDataByMopFlowRegion(arr, key);
      resultBucket.push(...bucketOne.flat(Infinity));
    }
    response.body.aggregations.by_region.buckets = resultBucket;
    return response.body.aggregations;
  } catch (error) {
    console.error(error);
  }
}

async function statusFlowTime(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

  //출도착지가 전국인경우
  const isNationWide = region === regionArray[0];
  const isMonth = isValidMonth(start);

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_prps_time_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    `native_prps_time_sgg_day`
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    `native_prps_time_admdong_day`
  );
  const indexs = {
    SIDO: validIndicesSido.join(","),
    SGG: validIndicesSgg.join(","),
    ADMNS_DONG: validIndicesAdm.join(","),
  };

  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.SIDO },
    sgg: { codes: [], field: "MOPP", index: indexs.SGG },
    adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
  };
  regionMap = await getCompareMopRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  regionMap = await addUnionRegionMap(region, regionMap);
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";
  regionMap.sgg.codes = Array.from(new Set(regionMap.sgg.codes));
  regionMap = {
    SIDO: regionMap.sido,
    SGG: regionMap.sgg,
    ADMNS_DONG: regionMap.adm,
  }
  let regionCodes: any = [];
  if (region.length === 5) {
    regionCodes = regionMap.SGG.codes
  } else {
    regionCodes.push(region)
  }

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.SIDO },
      sgg: { codes: [], field: "MOPP", index: indexs.SGG },
      adm: { codes: [], field: "MOPP", index: indexs.ADMNS_DONG },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          // dateRange(isMonth, start, end),
          dateRange(false, start, end),
          {
            terms: {
              [`${regionCD}_${field}_CD`]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
          order: { _key: "asc" },
        },
        aggs: {
          max_flow_time: {
            terms: {
              field: isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD",
              size: 1,
              order: { time_pop: "desc" },
            },
            aggs: {
              time_pop: {
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

  //출도착지역 전국일 경우
  if (isNationWide) {
    query.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  } else {
    query.query.bool.filter.push({
      terms: {
        [`${flowCD}_${field}_CD`]: changeRegionArr,
      },
    });
    query.aggs.by_region.terms.field = `${flowCD}_${field}_CD`;
  }

  try {
    const response = await searchWithLogging({
      index: indexs[field],
      body: query,
    });
    let resultBucket: any = [];
    for (const [key, value] of newMap) {
      let arr:any = [];
      response.body.aggregations.by_region.buckets.map((bucket:any) => {        
        if (value.find((el:any) => el === bucket.key.toString())) {
          arr.push(bucket)
        }
      })
      const bucketOne = await mergeDataByMopFlowRegion(arr, key);
      resultBucket.push(...bucketOne.flat(Infinity));
    }
    response.body.aggregations.by_region.buckets = resultBucket;
    return response.body.aggregations;
  } catch (error) {
    console.error(error);
  }
}
