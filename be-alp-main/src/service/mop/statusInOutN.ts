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
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { mergeDataByMopFlowRegion, mergeDataByRegion } from "@/helpers/mergeDataByRegion";
import { getWeekedOccurrences, normalizedMopDowAvgData, normalizedWeekdaysAvgData } from "@/helpers/normalized/normalizedALPData";

export async function statusInOutN(options: MopParams) {
  const holidays = await getHolidays(options.start, options.end);
  const [
    purposeInResult,
    purposeOutResult,
    purposeInPeriodResult,
    purposeOutPeriodResult,
    purposeInTimeResult,
    purposeOutTimeResult,
    wayInResult,
    wayOutResult,
  ] = await Promise.all([
    statusInOutNPurpose(options, true),
    statusInOutNPurpose(options, false),
    statusInOutNPurposeComparePeriod(options, true),
    statusInOutNPurposeComparePeriod(options, false),
    statusInOutNTime(options, true),
    statusInOutNTime(options, false),
    statusInOutNWay(options, true),
    statusInOutNWay(options, false),
  ]);
  //opensearh데이터 정규화
  const purposeInData = normalized(
    purposeInResult,
    purposeInPeriodResult,
    purposeInTimeResult,
    wayInResult,
    options,
    holidays,
  );
  const purposeOutData = normalized(
    purposeOutResult,
    purposeOutPeriodResult,
    purposeOutTimeResult,
    wayOutResult,
    options,
    holidays,
  );
  return [purposeInData, purposeOutData];
}

const normalized = (
  purposeData: any,
  periodData: any,
  timeData: any,
  wayData: any,
  options: any,
  holidays: string[]
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
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );
  purposeData.forEach((data: any) => {
    const region = data.key;
    const flow = normalizedFlowData(data.by_flow.buckets);
    result.flow.push({
      region: region,
      data: [...flow, { key: "tot", value: data.total.value }],
    });
    const day = normalizedDayData(data.by_day.buckets);
    result.day.push({
      region: region,
      data: day,
    });
    const dow = normalizedMopDowAvgData(
      data.by_dow.buckets,
      options.start,
      options.end
    );
    result.dow.push({
      region: region,
      data: dow,
    });
    // const weekdays = normalizedWeekdaysData(data.by_weekdays.buckets);
    const weekdays = normalizedWeekdaysAvgData(
      data.by_weekdays.buckets,
      weekdayCnt,
      holidayCnt,
    );
    result.weekdays.push({
      region: region,
      data: weekdays,
    });

    const purpose = normalizedPurposeData(data.by_purpose.buckets);
    result.purpose.push({
      region: region,
      data: purpose,
    });
    result.sex.push({
      region: region,
      data: [
        { key: "남성", value: data.total_male.value },
        { key: "여성", value: data.total_female.value },
      ],
    });
    const age = normalizedAgeData(data);
    result.age.push({
      region: region,
      data: age,
    });
    const sexAge = normalizedSexAgeData(data);
    result.sexAge.push({
      region: region,
      data: sexAge,
    });
    const periodRegionData = periodData.find(
      (item: any) => item.key === region
    );

    if (periodRegionData.by_prevMonth) {
      result.prevMonth.push({
        region: region,
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
        region: region,
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
        region: region,
        data: [
          {
            key: "lastYear",
            value: periodRegionData.by_lastYear.pop_by_lastYear.value,
          },
          { key: "start", value: periodRegionData.by_start.pop_by_start.value },
        ],
      });
    }
    const timeRegionData = timeData.find((item: any) => item.key === region);
    const timezn = timeRegionData
      ? normalizedBucketData(timeRegionData.by_time.buckets)
      : [];
    result.timezn.push({
      region: region,
      data: timezn,
    });

    const wayRegionData = wayData.find((item: any) => item.key === region);
    const way = wayRegionData
      ? normalizedWayData(wayRegionData?.by_way.buckets)
      : [];
    result.way.push({
      region: region,
      data: way,
    });
  });
  return result;
};

// 흐름, 일별, 요일별, 성연령별, 목적별 - day
//전년전월 - day
// 도착시간, 출발시간, 시간대별 - time_mons(읍면동만), time_day
async function statusInOutNPurpose(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;
  const holidays = await getHolidays(start, end);

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
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
          by_flow: {
            terms: {
              field: "",
              size: 5,
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
  //   "status"
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
        "status",
        start,
        regionArray.length === 1
      )
    }));
    results = results.flat(Infinity);
    return results;
}
async function statusInOutNWay(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
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
  //   "way"
  // );
  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    const res = await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      isInflow,
      indexs,
      "way",
      start,
      regionArray.length === 1
    )
    return res.flat()
  }));  
  return results.flat(Infinity);
}
async function statusInOutNPurposeComparePeriod(
  options: MopParams,
  isInflow: boolean
) {
  const { start, end, regionArray, includeSame } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);
  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: { filter: [] },
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

  let needPrevMons = false;
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

  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   includeSame,
  //   isInflow,
  //   indexs,
  //   "period",
  //   start,
  //   regionArray.length === 1
  // );

  // 수정
  // results = await mergeDataByRegion(results, regionArray);
  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
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
async function statusInOutNTime(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;
  const isMonth = isValidMonth(start);

  const query = {
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
          by_time: {
            terms: {
              field: "",
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

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
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
    `native_prps_time_admdong_${isMonth ? "day" : "day"}`
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
  //   "statusTime"
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
      "statusTime",
      start,
      regionArray.length === 1,
      options
    )
  }));
  results = results.flat(Infinity);
  return results;
}
