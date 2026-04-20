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
import {
  regionFlowAggregation,
  regionMOPAggregation,
  regionMopFlowAggregation,
} from "@/utils/chart/regionAggregation";
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
import { getWeekedOccurrences, normalizedMopMoveDowAvgData } from "@/helpers/normalized/normalizedALPData";
import { mergeDataByMopFlowRegion } from "@/helpers/mergeDataByRegion";

export async function moveCdN(options: MopMoveParams) {
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
  holidays: string[],
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
    if (timeRegionData)
      if (region.toString().length > 2)
        timezn = normalizedTimeznADMMoveData(
          timeRegionData.by_time.buckets,
          moveKeys
        );
      else {
        timezn = normalizedTimeznADMMoveData(
          timeRegionData.by_time.buckets,
          moveKeys
        );
      }
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
  return result;
};

async function moveCdInOutN(options: MopMoveParams) {
  const {
    start,
    end,
    regionArray,
    isInflow,
    moveCdArray,
    includeSame,
    isPurpose,
  } = options;
  const holidays = await getHolidays(start, end);

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
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
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

  //개발용 kt에는 M으로 수정
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

  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   includeSame,
  //   isInflow,
  //   indexs,
  //   "moveCd"
  // );
  // return results;

    // let results: any[] = [];
    // results = await Promise.all(regionArray.map(async (region:any) => {
    //   return await regionMopFlowAggregation(
    //     query,
    //     region,
    //     true,
    //     isInflow,
    //     indexs,
    //     "moveCd",
    //     // start,
    //     // regionArray.length === 1
    //   )
    // }));
    // results = results.flat(Infinity);
    // results = await mergeDataByMopFlowRegion(results, regionArray[0]);
    // results = results.flat(Infinity);

    // return results;
    let results: any[] = [];
    results = await Promise.all(regionArray.map(async (region:any) => {
      const response = await regionMopFlowAggregation(
        query,
        region,
        includeSame,
        isInflow,
        indexs,
        "moveCd",
        // start,
        // regionArray.length === 1
      )
      results = await mergeDataByMopFlowRegion(response.flat(Infinity), region);
      return results;
    }));
    results.push(results[0])
    return results.flat(Infinity);
}
async function moveCdInOutNTime(options: MopMoveParams) {
  const {
    start,
    end,
    regionArray,
    isInflow,
    moveCdArray,
    includeSame,
    isPurpose,
  } = options;
  const isMonth = isValidMonth(start);

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

  //개발용 kt에는 M으로 수정
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

  // let results = await regionMOPAggregation(
  //   query,
  //   options,
  //   includeSame,
  //   isInflow,
  //   indexs,
  //   "moveCd"
  // );
  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      isInflow,
      indexs,
      "moveCd1",
      start,
      regionArray.length === 1,
      options
    )
  }));
  results = results.flat(Infinity);
  return results;
}
