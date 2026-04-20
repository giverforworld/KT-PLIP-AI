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
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  normalizedAgeData,
  normalizedDayData,
  normalizedDowData,
  normalizedFlowData,
  normalizedPurposeData,
  normalizedSexAgeData,
  normalizedBucketData,
  normalizedWayData,
  normalizedWeekdaysData,
} from "@/helpers/normalized/normalizedData";
import { getHolidays } from "@/utils/holidays";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import {
  regionAggregation,
  regionFlowAggregation,
  regionMOPAggregation,
  regionMopFlowAggregation,
} from "@/utils/chart/regionAggregation";
import { isValidMonth } from "@/middlewares/validators";
import { normalizedMopDowAvgData } from "@/helpers/normalized/normalizedALPData";
import { addUnionRegionMap, getCompareMopRegionMap, mergeDataByMopFlowRegion, mergeDataByRegion } from "@/helpers/mergeDataByRegion";

export async function statusODN(options: MopFlowParams) {
  const [purposeResult, purposePeriodResult, timeResult, wayResult] =
    await Promise.all([
      statusODInOutNPurpose(options),
      statusODInOutNComparePeriod(options),
      statusODInOutNTime(options),
      statusODInOutNWay(options),
    ]);
  //opensearh데이터 정규화
  const purposeData = normalized(
    purposeResult,
    purposePeriodResult,
    timeResult,
    wayResult,
    options.region,
    options,
  );
  return purposeData;
}

const normalized = (
  purposeData: any,
  periodData: any,
  timeData: any,
  wayData: any,
  region: string,
  options: any,
) => {
  //흐름, 일별, 요일별, 시간대별, 목적별, 성연령
  const result: NormalizedObj = {
    flow: [],
    lastYear: [],
    prevMonth: [],
    day: [],
    dow: [],
    weekdays: [],
    timezn: [],
    purpose: [],
    way: [],
    sex: [],
    age: [],
    sexAge: [],
  };
  const flow = normalizedFlowData(purposeData.by_flow.buckets);
  result.flow.push({
    region: region,
    data: [...flow, { key: "tot", value: purposeData.total.value }],
  });
  purposeData.by_region.buckets.forEach((data: any) => {
    const flowRegion = data.key;
    const day = normalizedDayData(data.by_day.buckets);
    result.day.push({
      region: flowRegion,
      data: day,
    });
    const dow = normalizedMopDowAvgData(
      data.by_dow.buckets,
      options.start,
      options.end
    );
    result.dow.push({
      region: flowRegion,
      data: dow,
    });
    const weekdays = normalizedWeekdaysData(data.by_weekdays.buckets);
    result.weekdays.push({
      region: flowRegion,
      data: weekdays,
    });
    const purpose = normalizedPurposeData(data.by_purpose.buckets);
    result.purpose.push({
      region: flowRegion,
      data: purpose,
    });
    result.sex.push({
      region: flowRegion,
      data: [
        { key: "남성", value: data.total_male.value },
        { key: "여성", value: data.total_female.value },
      ],
    });
    const age = normalizedAgeData(data);
    result.age.push({
      region: flowRegion,
      data: age,
    });
    const sexAge = normalizedSexAgeData(data);
    result.sexAge.push({
      region: flowRegion,
      data: sexAge,
    });
    
    const periodRegionData = periodData.find(
      (item: any) => item.key === flowRegion
    );

    if (periodRegionData.by_prevMonth) {
      result.prevMonth.push({
        region: flowRegion,
        data: [
          {
            key: "prevMonth",
            value: periodRegionData.by_prevMonth.pop_by_prevMonth.value,
          },
          { key: "start", value: periodRegionData.by_start.pop_by_start.value },
        ],
      });
      //summary때문에 prevMonth 추가
      result.lastYear.push({
        region: flowRegion,
        data: [
          {
            key: "lastYear",
            value: periodRegionData.by_lastYear.pop_by_lastYear.value,
          },
          { key: "start", value: periodRegionData.by_start.pop_by_start.value },
          {
            key: "prevMonth",
            value: periodRegionData.by_prevMonth.pop_by_prevMonth.value,
          },
        ],
      });
    } else {
      result.lastYear.push({
        region: flowRegion,
        data: [
          {
            key: "lastYear",
            value: periodRegionData.by_lastYear.pop_by_lastYear.value,
          },
          { key: "start", value: periodRegionData.by_start.pop_by_start.value },
        ],
      });
    }
    const timeRegionData = timeData.by_region.buckets.find(
      (item: any) => item.key === flowRegion
    );
    const timezn = timeRegionData
      ? normalizedBucketData(timeRegionData.by_time.buckets)
      : [];
    result.timezn.push({
      region: flowRegion,
      data: timezn,
    });

    const wayRegionData = wayData.by_region.buckets.find(
      (item: any) => item.key === flowRegion
    );
    const way = wayRegionData
      ? normalizedWayData(wayRegionData?.by_way.buckets)
      : [];
    result.way.push({
      region: flowRegion,
      data: way,
    });
  });
  return result;
};

async function statusODInOutNPurpose(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

  const holidays = await getHolidays(start, end);

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

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
          {
            terms: {
              [`${flowCD}_${field}_CD`]: changeRegionArr,
            },
          },
        ],
      },
    },
    aggs: {
      by_flow: {
        terms: {
          field: `${flowCD}_${field}_CD`,
          size: changeRegionArr.length,
          order: { pop_by_flow: "desc" },
        },
        aggs: {
          pop_by_flow: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      total: { sum: { field: "TOT_POPUL_NUM" } },
      by_region: {
        terms: {
          field: `${flowCD}_${field}_CD`,
          size: changeRegionArr.length,
        },
        aggs: {
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_day: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_dow: {
            terms: {
              field: "DOW_CD",
              size: 7,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_dow: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_weekdays: {
            filters: getWeekFilters(holidays),
            aggs: {
              pop_by_weekdays: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },

          by_purpose: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_purpose: {
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

  try {
    const response = await searchWithLogging({
      index: indexs[field],
      body: query,
    });
    
    let resultBucket: any = [];
    for (const [key, value] of newMap) {
      let arr:any = [];
      response.body.aggregations.by_flow.buckets.map((bucket:any) => {        
        if (value.find((el:any) => el === bucket.key.toString())) {
          arr.push(bucket)
        }
      })
      const bucketOne = await mergeDataByMopFlowRegion(arr, key)
      resultBucket.push(...bucketOne.flat(Infinity));
    }
    response.body.aggregations.by_flow.buckets = resultBucket;
    
    resultBucket = [];
    for (const [key, value] of newMap) {
      let arr:any = [];
      response.body.aggregations.by_region.buckets.map((bucket:any) => {        
        if (value.find((el:any) => el === bucket.key.toString())) {
          arr.push(bucket)
        }
      })
      const bucketOne = await mergeDataByMopFlowRegion(arr, key)
      resultBucket.push(...bucketOne.flat(Infinity));
    }
    response.body.aggregations.by_region.buckets = resultBucket;
    return response.body.aggregations;
  } catch (error) {
    console.error(error);
  }
}
async function statusODInOutNComparePeriod(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;
  
  let regionArr: string[] = []
  regionArr.push(region)

  const field =
    region.length === 2 ? "SIDO" : region.length === 5 ? "SGG" : "ADMNS_DONG";
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);
  let needPrevMons = false;
  // 기간 일 선택한 경우 전월 데이터 없음
  if (start.length === 6) {
    needPrevMons = true;
  }
  const validIndicesSido = await getIndexCompareMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_sgg_day",
    needPrevMons
  );
  const validIndicesAdm = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_admdong_day",
    needPrevMons
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.sido },
    sgg: { codes: [], field: "MOPP", index: indexs.sgg },
    adm: { codes: [], field: "MOPP", index: indexs.adm },
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
      sido: { codes: [], field: "MOPP", index: indexs.sido },
      sgg: { codes: [], field: "MOPP", index: indexs.sgg },
      adm: { codes: [], field: "MOPP", index: indexs.adm },
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
        filter: [],
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
  needPrevMons = false;
  query.query.bool.filter.push({
      terms: { [`${flowCD}_${field}_CD`]: regionArr },
    });
  
  // 기간 일 선택한 경우 전월 데이터 없음
  if (start.length === 6) {
    needPrevMons = true;
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(false, convertLastY.start, convertLastY.end),
          dateRange(false, convertPrevMonth.start, convertPrevMonth.end),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.by_prevMonth = {
      filter: dateRange(false, prevMonth, prevMonth),
      aggs: {
        pop_by_prevMonth: {
          sum: {
            field: "TOT_POPUL_NUM",
          },
        },
      },
    };
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

  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   true,
  //   isInflow,
  //   indexs,
  //   "period",
  //   start,
  //   regionArray.length === 1
  // );
  
  // results = await mergeDataByRegion(results, regionArray);
  // return results;
  // try {
  //   const response = await searchWithLogging({
  //     index: indexs[field],
  //     body: query,
  //   });
    
  //   return response.body.aggregations;
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
      regionArray.length === 1,
    )
  }));
  return results.flat(Infinity);
}
async function statusODInOutNWay(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

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

  const query = {
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
          {
            terms: {
              [`${flowCD}_${field}_CD`]: changeRegionArr,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${flowCD}_${field}_CD`,
          size: changeRegionArr.length,
        },
        aggs: {
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_way: {
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
async function statusODInOutNTime(options: MopFlowParams) {
  const { start, end, region, regionArray, isInflow } = options;

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

  const query = {
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
          {
            terms: {
              [`${flowCD}_${field}_CD`]: changeRegionArr,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${flowCD}_${field}_CD`,
          size: changeRegionArr.length,
          order: { _key: "asc" },
        },
        aggs: {
          by_time: {
            terms: {
              field: `${isInflow ? "ARVL" : "STRNG"}_TIMEZN_CD`,
              size: 24,
              order: { _key: "asc" },
            },
            aggs: {
              total: {
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
