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
import { regionMopFlowAggregation, regionMOPODAggregation } from "@/utils/chart/regionAggregation";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  normalizedAgeMoveData,
  normalizedDayMoveData,
  normalizedDowMoveData,
  normalizedMoveData,
  normalizedMoveFlowRegionData,
  normalizedSexMoveData,
  normalizedTimeznADMMoveData,
  normalizedTimeznMoveData,
  normalizedWeekdaysMoveData,
} from "@/helpers/normalized/normalizedData";
import { getHolidays } from "@/utils/holidays";
import { getIndexMMList, getIndexYList } from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { getWeekedOccurrences, normalizedMopDowAvgData, normalizedMopMoveDowAvgData } from "@/helpers/normalized/normalizedALPData";
import { addUnionRegionMap, getCompareMopRegionMap, mergeDataByMopFlowRegion } from "@/helpers/mergeDataByRegion";
import { setTokenSourceMapRange } from "typescript";

export async function moveCdODN(options: MopMoveFlowParams) {
  const holidays = await getHolidays(options.start, options.end);
  const [queryResult, timeResult] = await Promise.all([
    moveCdInOutN(options),
    moveCdInOutNTime(options),
  ]);
  //opensearh데이터 정규화
  const data = normalized(
    queryResult,
    timeResult,
    options.isPurpose,
    options.moveCdArray,
    options,
    holidays,
  );
  return data;
}

const normalized = (
  queryData: any,
  timeData: any,
  isPurpose: boolean,
  moveKeys: number[],
  options: any,
  holidays: string[]
) => {
  //이동별, 지역별, 일별, 요일별, 시간대별, 성연령
  const result: NormalizedObj = {
    move: [],
    flowRegion: [],
    day: [],
    dow: [],
    weekdays: [],
    timezn: [],
    sex: [],
    age: [],
  };
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );
  queryData.forEach((data: any) => {
    const region = data.key;
    const move = normalizedMoveData(data.by_move.buckets, moveKeys);
    result.move.push({
      region: region,
      data: move,
    });
    const flowRegion = normalizedMoveFlowRegionData(
      data.by_flow.buckets,
      moveKeys
    );
    result.flowRegion.push({
      region: region,
      data: flowRegion,
    });
    const day = normalizedDayMoveData(data.by_day.buckets, moveKeys);
    result.day.push({
      region: region,
      data: day,
    });
    
    // const dow = normalizedDowMoveData(data.by_dow.buckets, moveKeys);
    const dow = normalizedMopMoveDowAvgData(
      data.by_dow.buckets,
      options.start,
      options.end,
      moveKeys
    );
    result.dow.push({
      region: region,
      data: dow,
    });
    const weekdays = normalizedWeekdaysMoveData(
      data.by_weekdays.buckets,
      weekdayCnt,
      holidayCnt,
      moveKeys
    );
    result.weekdays.push({
      region: region,
      data: weekdays,
    });
    const timeRegionData = timeData.find((item: any) => item.key === region);
    let timezn = [];
    timezn = normalizedTimeznADMMoveData(
          timeRegionData.by_time.buckets,
          moveKeys
        );
    // if (timeRegionData)
    //   if (region.toString().length > 2)
    //     timezn = normalizedTimeznADMMoveData(
    //       timeRegionData.by_time.buckets,
    //       moveKeys
    //     );
    //   else {
    //     timezn = normalizedTimeznMoveData(
    //       timeRegionData.by_time.buckets,
    //       moveKeys
    //     );
    //   }
    result.timezn.push({
      region: region,
      data: timezn,
    });
    const sex = normalizedSexMoveData(data.by_move.buckets, moveKeys);
    result.sex.push({
      region: region,
      data: sex,
    });
    const age = normalizedAgeMoveData(data.by_move.buckets, moveKeys);
    result.age.push({
      region: region,
      data: age,
    });
  });
  // console.log(util.inspect(result, {showHidden:false, depth:null ,colors:true}))
  return result;
};

async function moveCdInOutN(options: MopMoveFlowParams) {
  const { start, end, region, regionArray, isInflow, moveCdArray, isPurpose } =
    options;
  let isOD = "";
  
  if (region.length === 2) {
      isOD = `${isInflow ? "PDEPAR" : "DETINA"}_SIDO_CD`
  } else if (region.length === 5) {
    isOD = `${isInflow ? "PDEPAR" : "DETINA"}_SGG_CD`
  } else {
    isOD = `${isInflow ? "PDEPAR" : "DETINA"}_ADMNS_DONG_CD`
  }
  
  const holidays = await getHolidays(start, end);

  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_age_sgg_day`
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_age_admdong_day`
  );

  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };
  
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

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            terms: {
              [isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD"]: moveCdArray,
            },
          },
          {
            terms: {
              [isOD] : [region]
            }
          }
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
        },
        aggs: {
          by_flow: {
            terms: {
              field: "",
              size: 4,
              order: { pop_by_flow: "desc" },
            },
            aggs: {
              pop_by_flow: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
              by_move: {
                terms: {
                  field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
                  size: isPurpose ? 7 : 8,
                  order: { _key: "asc" },
                },
                aggs: {
                  pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
                },
              },
            },
          },
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: { _key: "asc" },
            },
            aggs: {
              by_move: {
                terms: {
                  field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
                  size: isPurpose ? 7 : 8,
                  order: { _key: "asc" },
                },
                aggs: {
                  pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
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
              by_move: {
                terms: {
                  field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
                  size: isPurpose ? 7 : 8,
                  order: { _key: "asc" },
                },
                aggs: {
                  pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
                },
              },
            },
          },
          by_weekdays: {
            filters: getWeekFilters(holidays),
            aggs: {
              by_move: {
                terms: {
                  field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
                  size: isPurpose ? 7 : 8,
                  order: { _key: "asc" },
                },
                aggs: {
                  pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
                },
              },
            },
          },
          by_move: {
            terms: {
              field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
              size: isPurpose ? 7 : 8,
              order: { _key: "asc" },
            },
            aggs: {
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
      },
    },
  };

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      true,
      isInflow,
      indexs,
      "move",
      start,
      regionArray.length === 1,
    )
  }));
  return results.flat(Infinity);
}

async function moveCdInOutNTime(options: MopMoveFlowParams) {
  const { start, end, region, regionArray, isInflow, moveCdArray, isPurpose } =
    options;
  const isMonth = isValidMonth(start);
  let isOD = "";
  if (region.length === 2) {
    isOD = `${isInflow ? "PDEPAR" : "DETINA"}_SIDO_CD`
  } else if (region.length === 5) {
    isOD = `${isInflow ? "PDEPAR" : "DETINA"}_SGG_CD`
  } else {
    isOD = `${isInflow ? "PDEPAR" : "DETINA"}_ADMNS_DONG_CD`
  }

  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_time_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_time_sgg_day`
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    `native_${isPurpose ? "prps" : "way"}_time_admdong_${
      isMonth ? "day" : "day"
    }`
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

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
        filter: [
          // dateRange(isMonth, start, end),
          dateRange(false, start, end),
          {
            terms: {
              [isOD]: [region]
            }
          }
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
        },
        aggs: {
          by_time: {
            terms: {
              field: "",
              size: 24,
              order: { _key: "asc" },
            },
            aggs: {
              total: { sum: { field: "TOT_POPUL_NUM" } },
            },
          },
        },
      },
    },
  };

  // let results = await regionMOPODAggregation(query, options, indexs, "timezn");
  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      true,
      isInflow,
      indexs,
      "timezn",
      start,
      regionArray.length === 1,
      undefined,
      moveCdArray,
      isPurpose
    )
  }));
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results.flat(Infinity);
}
