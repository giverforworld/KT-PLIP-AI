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

import { getHolidays } from "@/utils/holidays";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  alp_regionAggregation,
  regionAggregation,
  // regionCompareAggregation,
} from "@/utils/chart/regionAggregation";
import { generateSexAge } from "@/utils/generateSexAge";
import {
  normalizedBucketData,
  normalizedDayData,
  normalizedSexAgeData,
} from "@/helpers/normalized/normalizedData";
import {
  getTotalDays,
  getWeekedOccurrences,
  normalizedAgeTimeznData,
  normalizedDowAvgData,
  normalizedFornTimezn,
  normalizedFornTop,
  normalizedHourlyAvg,
  normalizedHourlyDayAvg,
  normalizedInOutData,
  normalizedSexTimeznData,
  normalizedSubzoneTimeznData,
  normalizedTimeznDowData,
  normalizedTimeznWeekData,
  normalizedTmstData,
  normalizedWeekdaysAvgData,
} from "@/helpers/normalized/normalizedALPData";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { sortByRegionKeys } from "@/helpers/sortByRegionArray";
import { keyMap } from "@/config/keyMapConfig";
import { mergeUnionByAlpStatus, mergeUnionByAlpStatusForn, mergeUnionBySubzone } from "@/helpers/mergeDataByRegion";

const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]

export async function statusN(options: AlpParams) {
  const holidays = await getHolidays(options.start, options.end);

  const [
    timeReault,
    periodTimeResult,
    periodNativeResult,
    nativeDayResult,
    subzoneResult,
    inOutResult,
    fornResult,
    compareFornResult,
  ] = await Promise.all([
    timeAggs(options, holidays),
    comparePeriodTime(options),
    comparePeriodNative(options),
    nativeDay(options),
    subzoneAggs(options),
    weekFlowAggs(options, holidays),
    fornAggs(options),
    comparePeriodForn(options),
  ]);

  //opensearh데이터 정규화
  const purposeData = normalized(
    timeReault,
    periodTimeResult,
    periodNativeResult,
    nativeDayResult,
    subzoneResult,
    inOutResult,
    fornResult,
    compareFornResult,
    options,
    holidays
  );
  return purposeData;
}

const normalized = (
  timeData: any,
  periodTimeResult: any,
  periodNativeResult: any,
  nativeDayResult: any,
  subzoneResult: any,
  inOutResult: any,
  fornResult: any,
  compareFornResult: any,
  options: AlpParams,
  holidays: string[]
) => {
  const isMonth = options.start.length === 6;
  const result: NestedNormalizedObj = {
    //내국인
    timezn: { Avg: [] },
    // lastYear: isMonth ? { Avg: [], Unique: [] } : { Avg: [] },
    // prevMonth: isMonth ? { Avg: [], Unique: [] } : { Avg: [] },
    lastYear: { Avg: [], Unique: [] },
    prevMonth: { Avg: [], Unique: [] },
    day: { Avg: [], Unique: [] },
    // sexAge: isMonth ? { Avg: [], Unique: [] } : { Avg: [] },
    sexAge: { Avg: [], Unique: [] },
    dow: { Avg: [] },
    weekdays: { Avg: [] },
    //시간대별
    timeznSex: { Avg: [] },
    timeznAge: { Avg: [] },
    timeznDow: { Avg: [] },
    timeznWeekdays: { Avg: [] },
    subzone: { Avg: [] },
    //유입/유출 , stat 때문에 Avg 추가
    inflowWeek: { Avg: [] },
    inflowWeeked: { Avg: [] },
    outflowWeek: { Avg: [] },
    outflowWeeked: { Avg: [] },
    //외국인
    fornLastYear: { Avg: [] },
    fornPrevMonth: { Avg: [] },
    fornDay: { Avg: [] },
    fornDow: { Avg: [] },
    fornTimezn: { Avg: [] },
    fornNatTime: { Avg: [] },
    fornNat: { Avg: [] },
  };

  //총 일수 계산
  const { prevMonth, lastYear } = calculateDates(options.start);
  const prevTotalDays = getTotalDays(prevMonth, prevMonth);
  const lastYearTotalDays = getTotalDays(
    isMonth ? lastYear : lastYear + options.start.substring(6, 8),
    isMonth ? lastYear : lastYear + options.end.substring(6, 8)
  );
  const startTotalDays = getTotalDays(options.start, options.end);
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );
  timeData.forEach((data: any) => {
    const region = data.key;

    const timezn = normalizedTmstData(data.by_tmst.buckets);
    result.timezn["Avg"].push({
      region: region,
      data: timezn,
    });

    const day = normalizedDayData(data.by_day.buckets, false);
    result.day["Avg"].push({
      region: region,
      data: day,
    });

    const dow = normalizedDowAvgData(
      data.by_dow.buckets,
      options.start,
      options.end
    );
    result.dow["Avg"].push({
      region: region,
      data: dow,
    });

    const weekdays = normalizedWeekdaysAvgData(
      data.by_weekdays.buckets,
      weekdayCnt,
      holidayCnt
    );
    result.weekdays["Avg"].push({
      region: region,
      data: weekdays,
    });

    const timeznSex = normalizedSexTimeznData(data.by_timezn.buckets);
    result.timeznSex["Avg"].push({
      region: region,
      data: normalizedHourlyAvg(timeznSex, startTotalDays, true),
    });

    const timeznAge = normalizedAgeTimeznData(data.by_timezn.buckets);
    result.timeznAge["Avg"].push({
      region: region,
      data: normalizedHourlyAvg(timeznAge, startTotalDays, true),
    });

    const timeznDow = normalizedTimeznDowData(data.by_timezn.buckets);
    result.timeznDow["Avg"].push({
      region: region,
      data: normalizedHourlyDayAvg(timeznDow, options.start, options.end)
    })
    // console.log(util.inspect(result.timeznDow, {showHidden:false, depth:null, colors:true}))

    const timeznWeekdays = normalizedTimeznWeekData(
      data.by_timezn.buckets,
      weekdayCnt,
      holidayCnt
    );
    result.timeznWeekdays["Avg"].push({
      region: region,
      data: timeznWeekdays,
    });
  });

  periodTimeResult.forEach((data: any) => {
    const region = data.key;

    const sexAge = normalizedSexAgeData(data.by_start);
    result.sexAge["Avg"].push({
      region: region,
      data: normalizedHourlyAvg(sexAge, startTotalDays),
    });
    if (data.by_prevMonth) {
      result.prevMonth["Avg"].push({
        region: region,
        data: [
          {
            key: "prevMonth",
            value:
              data.by_prevMonth.pop_by_prevMonth.value / (prevTotalDays * 24),
          },
          {
            key: "start",
            value: data.by_start.pop_by_start.value / (startTotalDays * 24),
          },
        ],
      });
    }
    //summary때문에 prevMonth 있으면 추가
    result.lastYear["Avg"].push({
      region: region,
      data: [
        {
          key: "lastYear",
          value:
            data.by_lastYear.pop_by_lastYear.value / (lastYearTotalDays * 24),
        },
        {
          key: "start",
          value: data.by_start.pop_by_start.value / (startTotalDays * 24),
        },
        ...(data.by_prevMonth
          ? [
              {
                key: "prevMonth",
                value:
                  data.by_prevMonth.pop_by_prevMonth.value /
                  (prevTotalDays * 24),
              },
            ]
          : []),
      ],
    });
  });

  if (isMonth) {
    periodNativeResult.forEach((data: any) => {
      const region = data.key;

      const sexAge = normalizedSexAgeData(data.by_start);
      result.sexAge["Unique"].push({
        region: region,
        data: sexAge,
      });
      result.prevMonth["Unique"].push({
        region: region,
        data: [
          {
            key: "prevMonth",
            value: data.by_prevMonth.pop_by_prevMonth.value,
          },
          { key: "start", value: data.by_start.pop_by_start.value },
        ],
      });

      //summary때문에 prevMonth 있으면 추가
      result.lastYear["Unique"].push({
        region: region,
        data: [
          {
            key: "lastYear",
            value: data.by_lastYear.pop_by_lastYear.value,
          },
          { key: "start", value: data.by_start.pop_by_start.value },
          {
            key: "prevMonth",
            value: data.by_prevMonth.pop_by_prevMonth.value,
          },
        ],
      });
    });
  }
  nativeDayResult.forEach((data: any) => {
    const region = data.key;
    const day = normalizedDayData(data.by_day.buckets);
    result.day["Unique"].push({
      region: region,
      data: day,
    });
  });
  subzoneResult.forEach((data: any) => {
    const region = data.key;
    const subzone = normalizedSubzoneTimeznData(data.by_timezn.buckets);
    result.subzone["Avg"].push({
      region: region,
      data: normalizedHourlyAvg(subzone, startTotalDays, true),
    });
  });
  ["detina", "pdepar"].forEach((flow) => {
    // ["week", "weeked"]
    inOutResult[`by_${flow}`]["week"]?.forEach((data: any) => {
      const region = data.key;
      const weekAvg = normalizedInOutData(
        data[`group_by_${flow === "detina" ? "pdepar" : "detina"}_sum`]
          ?.buckets || [],
        region,
        weekdayCnt
      );
      result[`${flow === "detina" ? "inflow" : "outflow"}Week`]["Avg"].push({
        region: region,
        data: weekAvg,
      });
    });

    inOutResult[`by_${flow}`]["weeked"]?.forEach((data: any) => {
      const region = data.key;
      const weekedAvg = normalizedInOutData(
        data[`group_by_${flow === "detina" ? "pdepar" : "detina"}_sum`]
          ?.buckets || [],
        region,
        holidayCnt
      );
      //summary때문에 Weeked에 최다 week 추가
      const weekData = result[
        `${flow === "detina" ? "inflow" : "outflow"}Week`
      ]["Avg"].find((item) => item.region === region);
      result[`${flow === "detina" ? "inflow" : "outflow"}Weeked`]["Avg"].push({
        region: region,
        data: [...weekedAvg, weekData?.data[0]],
      });
    });
  });
  fornResult.forEach((data: any) => {
    const region = data.key;
    const day = normalizedDayData(data.by_day.buckets, false);
    result.fornDay["Avg"].push({
      region: region,
      data: day,
    });

    const dow = normalizedDowAvgData(
      data.by_dow.buckets,
      options.start,
      options.end
    );
    result.fornDow["Avg"].push({
      region: region,
      data: dow,
    });

    const timezn = normalizedBucketData(data.by_timezn.buckets);
    result.fornTimezn["Avg"].push({
      region: region,
      data: normalizedHourlyAvg(timezn, startTotalDays, true),
    });

    const topCountry = normalizedFornTop(data, startTotalDays);
    result.fornNat["Avg"].push({
      region: region,
      data: topCountry,
    });
    const topCountryKeys: string[] = topCountry.map((country) => country.key);

    const fornNatTime = normalizedFornTimezn(
      data.by_timezn.buckets,
      topCountryKeys,
      startTotalDays
    );
    result.fornNatTime["Avg"].push({
      region: region,
      data: fornNatTime,
    });
  });

  compareFornResult.forEach((data: any) => {
    const region = data.key;
    if (data.by_prevMonth) {
      result.fornPrevMonth["Avg"].push({
        region: region,
        data: [
          {
            key: "prevMonth",
            value:
              data.by_prevMonth.pop_by_prevMonth.value / (prevTotalDays * 24),
          },
          {
            key: "start",
            value: data.by_start.pop_by_start.value / (startTotalDays * 24),
          },
        ],
      });
    }
    //summary때문에 prevMonth 추가
    result.fornLastYear["Avg"].push({
      region: region,
      data: [
        {
          key: "lastYear",
          value:
            data.by_lastYear.pop_by_lastYear.value / (lastYearTotalDays * 24),
        },
        {
          key: "start",
          value: data.by_start.pop_by_start.value / (startTotalDays * 24),
        },
        ...(data.by_prevMonth
          ? [
              {
                key: "prevMonth",
                value:
                  data.by_prevMonth.pop_by_prevMonth.value /
                  (prevTotalDays * 24),
              },
            ]
          : []),
      ],
    });
  });
  return result;
};

// timezn, dow, weekdays, timeznSex, timeznAge, timeznDow, timeznWeekdays, subzone
async function timeAggs(options: AlpParams, holidays: string[]) {
  const { start, end, regionArray } = options;

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO, SGG, ADM
          size: 0,
        },
        aggs: {
          by_tmst: {
            terms: {
              field: "TMST",
              size: 800,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              pop_by_day: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_dow: {
            terms: {
              field: "DOW",
              size: 7,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_dow: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_weekdays: {
            filters: getWeekFilters(holidays, true),
            aggs: {
              pop_by_weekdays: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_timezn: {
            terms: {
              field: "TIME",
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              dow_buckets: {
                terms: {
                  field: "DOW",
                  size: 7,
                  order: {
                    _key: "asc",
                  },
                },
                aggs: {
                  total: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
              weekday_weekend_buckets: {
                filters: getWeekFilters(holidays, true),
                aggs: {
                  pop_by_weekdays: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
              ...generateSexAge(false),
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexYList(start, end, `native_time_nation_day`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };

  // 최종 쿼리 결과 저장
  let results = await regionAggregation(
    query,
    regionArray,
    indexs,
    "nativeTime"
  );
  // console.log("sido: O, sgg: O, adm: O, union: O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  // console.log("=================================================================================")
  return results;
}
async function comparePeriodTime(options: AlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertPrevMonth = calcMonthToDate(prevMonth);

  const isMonth = isValidMonth(start);

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
                  field: "TOT",
                },
              },
              ...generateSexAge(false),
            },
          },
          by_lastYear: {
            filter: {},
            aggs: {
              pop_by_lastYear: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
    },
  };
  // 기간 일 선택한 경우 전월 데이터 없음
  query.query.bool.filter.push({
    bool: {
      should: [
        dateRange(
          false,
          lastYear + start.substring(6, 8),
          lastYear + end.substring(6, 8)
        ),
        dateRange(false, start, end),
        ...(isMonth
          ? [dateRange(false, convertPrevMonth.start, convertPrevMonth.end)]
          : []),
      ],
      minimum_should_match: 1,
    },
  });
  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    false,
    lastYear + start.substring(6, 8),
    lastYear + end.substring(6, 8)
  );
  if (isMonth) {
    query.aggs.by_region.aggs.by_prevMonth = {
      filter: dateRange(false, prevMonth, prevMonth),
      aggs: {
        pop_by_prevMonth: {
          sum: {
            field: "TOT",
          },
        },
      },
    };
  }

  const getIndex = (
    await getIndexCompareYList(start, end, `native_time_nation_day`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  // let results = await regionAggregation(query, regionArray, indexs, "native");
  // results = sortByRegionArray(regionArray, results);
  let results = await alp_regionAggregation(query, regionArray, indexs, start, "native")
  // console.log("sido: O, sgg: O, adm: O, union: O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  // console.log("=================================================================================")
  return results;
}

// 월 조회시에만
async function comparePeriodNative(options: AlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertPrevMonth = calcMonthToDate(prevMonth);

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];

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
            filter: dateRange(true, start, end),
            aggs: {
              pop_by_start: {
                sum: {
                  field: "TOT",
                },
              },
              ...generateSexAge(false),
            },
          },
          by_lastYear: {
            filter: {},
            aggs: {
              pop_by_lastYear: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
    },
  };

  query.query.bool.filter.push({
    bool: {
      should: [
        dateRange(
          true,
          lastYear + start.substring(6, 8),
          lastYear + end.substring(6, 8)
        ),
        dateRange(true, start, end),
        ...(isMonth
          ? [dateRange(true, convertPrevMonth.start, convertPrevMonth.end)]
          : []),
      ],
      minimum_should_match: 1,
    },
  });
  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    true,
    lastYear + start.substring(6, 8),
    lastYear + end.substring(6, 8)
  );

  query.aggs.by_region.aggs.by_prevMonth = {
    filter: dateRange(true, prevMonth, prevMonth),
    aggs: {
      pop_by_prevMonth: {
        sum: {
          field: "TOT",
        },
      },
    },
  };

  const getIndex = (
    await getIndexCompareYList(start, end, `native_unique_nation_mons`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  // let results = await regionAggregation(query, regionArray, indexs, "native");
  // results = sortByRegionArray(regionArray, results);
  let results = await alp_regionAggregation(query, regionArray, indexs, start, "native")
  // console.log("월 조회? , sido: O, sgg: O, adm: O, union: O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  // console.log("=================================================================================")
  return results;
}

async function nativeDay(options: AlpParams) {
  const { start, end, regionArray } = options;

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO, SGG, ADM
          size: 0,
        },
        aggs: {
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              pop_by_day: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexYList(start, end, `native_unique_nation_day`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  let results = await regionAggregation(
    query,
    regionArray,
    indexs,
    "nativeTime"
  );
  // console.log("sido: O, sgg: O, adm: O, union: O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  // console.log("=================================================================================")
  return results;
}
async function subzoneAggs(options: AlpParams) {
  const { start, end, regionArray } = options;

  const query = {
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
          size: 0,
        },
        aggs: {
          by_timezn: {
            terms: {
              field: "TIME",
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_subzone: {
                terms: {
                  field: "", //하위 행정구역 코드
                  size: 70,
                },
                aggs: {
                  total: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexYList(start, end, `native_time_nation_day`)
  ).join(",");

  let results: any[] = [];
  const regionMap: {
    [key: string]: {
      codes: string[];
      field: string;
      sub: string;
      index: string;
    };
  } = {
    sido: {
      codes: [],
      field: "SGG_GR",
      sub: "SGG",
      index: getIndex,
    },
    sgg: {
      codes: [],
      field: "ADM_GR",
      sub: "ADM",
      index: getIndex,
    },
  };

  // 지역 코드를 길이에 따라 분류 읍면동 제외
  regionArray.forEach((region) => {
    if (unionArray.includes(region)) {
      switch (region) {
        case "41110":
          regionMap.sgg.codes.push("41111", "41113", "41115", "41117")
          break;
        case "41130":
          regionMap.sgg.codes.push("41131", "41133", "41135")
          break;
        case "41170":
          regionMap.sgg.codes.push("41171", "41173")
          break;
        case "41190":
          regionMap.sgg.codes.push("41192", "41194", "41196")
          break;
        case "41270":
          regionMap.sgg.codes.push("41271", "41273")
          break;
        case "41280":
          regionMap.sgg.codes.push("41281", "41285", "41287")
          break;
        case "41460":
          regionMap.sgg.codes.push("41461", "41463", "41465")
          break;
        }
    } else {
      if (region.length === 2) regionMap.sido.codes.push(region);
      else if (region.length === 5) regionMap.sgg.codes.push(region);
    }
  });
  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(async ({ codes, field, sub, index }) => {
      if (codes.length) {
        const regionQuery = JSON.parse(JSON.stringify(query));
        regionQuery.query.bool.filter.push({ terms: { [field]: codes } });
        regionQuery.aggs.by_region.terms.field = field;
        regionQuery.aggs.by_region.terms.size = codes.length;
        regionQuery.aggs.by_region.aggs.by_timezn.aggs.by_subzone.terms.field =
          sub;

        try {
          const response = await searchWithLogging({
            index: index,
            body: regionQuery,
          });
          // 집계 결과 저장
          results.push(...(response.body.aggregations.by_region.buckets || []));
        } catch (error) {
          console.error(error);
        }
        return results;
      }
    })
  );
  results = await mergeUnionBySubzone(regionArray, results)
  // console.log("sido: O, sgg: O, adm: O, union: X ")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  // console.log("=================================================================================")
  return results;
}
async function weekFlowAggs(options: AlpParams, holidays: string[]) {
  const { start, end, regionArray } = options;
  const category = "weekFlow"

  const weekFilter = {
    filters: {
      weekday: {
        bool: {
          filter: [
            {
              term: { HDAY: 0 },
            },
          ],
          ...(holidays.length !== 0 && {
            must_not: [
              {
                terms: {
                  BASE_YMD: holidays,
                },
              },
            ],
          }),
        },
      },
      weekend: {
        bool: {
          should: [
            {
              term: { HDAY: 1 },
            },
            ...(holidays.length !== 0
              ? [
                  {
                    terms: {
                      BASE_YMD: holidays,
                    },
                  },
                ]
              : []),
          ],
        },
      },
    },
  };
  const detinaQuery = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      weekday_weekend_buckets: {
        filters: weekFilter,
        aggs: {
          by_detina: {
            filters: {
              filters: {},
            },
            aggs: {
              group_by_pdepar_sum: {
                terms: {
                  size: 11,
                  order: { total: "desc" },
                },
                aggs: {
                  total: { sum: { field: "TOT" } },
                },
              },
            },
          },
        },
      },
    },
  };
  const pdeparQuery = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      weekday_weekend_buckets: {
        filters: weekFilter,
        aggs: {
          by_pdepar: {
            filters: {
              filters: {},
            },
            aggs: {
              group_by_detina_sum: {
                terms: {
                  size: 11,
                  order: { total: "desc" },
                },
                aggs: {
                  total: { sum: { field: "TOT" } },
                },
              },
            },
          },
        },
      },
    },
  };
  const results: {
    by_pdepar: { week: any[]; weeked: any[] };
    by_detina: { week: any[]; weeked: any[] };
  } = {
    by_pdepar: { week: [], weeked: [] },
    by_detina: { week: [], weeked: [] },
  };

  // 존재하는 인덱스만 필터링
  const regionMap: {
    [key: string]: {
      codes: string[];
      detina: string;
      pdepar: string;
      index: string;
    };
  } = {
    sido: {
      codes: [],
      detina: "DSIDO",
      pdepar: "PSIDO",
      index: (
        await getIndexYList(start, end, "native_ingrs_egrs_sgg_day")
      ).join(","),
    },
    sgg: {
      codes: [],
      detina: "DSGG",
      pdepar: "PSGG",
      index: (
        await getIndexYList(start, end, "native_ingrs_egrs_sgg_day")
      ).join(","),
    },
    adm: {
      codes: [],
      detina: "DADM",
      pdepar: "PADM",
      index: (
        await getIndexMMList(start, end, "native_ingrs_egrs_admdong_day")
      ).join(","),
    },
  };

  // 지역 코드를 길이에 따라 분류
  regionArray.forEach((region) => {
    if (unionArray.includes(region)) {
      switch (region) {
        case "41110":
          regionMap.sgg.codes.push("41111", "41113", "41115", "41117")
          break;
        case "41130":
          regionMap.sgg.codes.push("41131", "41133", "41135")
          break;
        case "41170":
          regionMap.sgg.codes.push("41171", "41173")
          break;
        case "41190":
          regionMap.sgg.codes.push("41192", "41194", "41196")
          break;
        case "41270":
          regionMap.sgg.codes.push("41271", "41273")
          break;
        case "41280":
          regionMap.sgg.codes.push("41281", "41285", "41287")
          break;
        case "41460":
          regionMap.sgg.codes.push("41461", "41463", "41465")
          break;
        }
    } else {
      if (region.length === 2) regionMap.sido.codes.push(region);
      else if (region.length === 5) regionMap.sgg.codes.push(region);
      else regionMap.adm.codes.push(region);
    }
  });
  await Promise.all(
    Object.values(regionMap).map(async ({ codes, detina, pdepar, index }) => {
      if (codes.length) {
        const detinaRegionQuery = JSON.parse(JSON.stringify(detinaQuery));
        //유입지역
        if (detina === "DSIDO") {
          const ranges = codes.map((sido) => ({
            range: {
              ["DSGG"]: { gte: sido + "000", lte: sido + "999" },
            },
          }));
          detinaRegionQuery.query.bool.filter.push({
            bool: { should: [...ranges] },
          });
          detinaRegionQuery.aggs.weekday_weekend_buckets.aggs.by_detina.aggs.group_by_pdepar_sum.terms.script =
            {
              source: "Math.round(doc['PSGG'].value/1000) * 1000",
              lang: "painless",
            };
        } else {
          detinaRegionQuery.query.bool.filter.push({
            terms: {
              [detina]: codes,
            },
          });
          detinaRegionQuery.aggs.weekday_weekend_buckets.aggs.by_detina.aggs.group_by_pdepar_sum.terms.field =
            pdepar;
        }

        detinaRegionQuery.aggs.weekday_weekend_buckets.aggs.by_detina.filters.filters =
          codes.reduce((acc: Record<string, object>, code) => {
            if (detina === "DSIDO") {
              acc[code.toString().slice(0, 2)] = {
                bool: {
                  filter: [
                    {
                      range: { DSGG: { gte: code + "000", lte: code + "999" } },
                    },
                  ],
                  must_not: [
                    {
                      range: { PSGG: { gte: code + "000", lte: code + "999" } },
                    },
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [detina]: Number(code) } }],
                  must_not: [{ term: { [pdepar]: Number(code) } }],
                },
              };
            }
            return acc;
          }, {} as Record<string, object>);

        //유출지역
        const pdeparRegionQuery = JSON.parse(JSON.stringify(pdeparQuery));
        if (pdepar === "PSIDO") {
          const ranges = codes.map((sido) => ({
            range: {
              ["PSGG"]: { gte: sido + "000", lte: sido + "999" },
            },
          }));
          pdeparRegionQuery.query.bool.filter.push({
            bool: { should: [...ranges] },
          });
          pdeparRegionQuery.aggs.weekday_weekend_buckets.aggs.by_pdepar.aggs.group_by_detina_sum.terms.script =
            {
              source: "Math.round(doc['DSGG'].value/1000) * 1000",
              lang: "painless",
            };
        } else {
          pdeparRegionQuery.query.bool.filter.push({
            terms: {
              [pdepar]: codes,
            },
          });

          pdeparRegionQuery.aggs.weekday_weekend_buckets.aggs.by_pdepar.aggs.group_by_detina_sum.terms.field =
            detina;
        }
        pdeparRegionQuery.aggs.weekday_weekend_buckets.aggs.by_pdepar.filters.filters =
          codes.reduce((acc: Record<string, object>, code) => {
            if (pdepar === "PSIDO") {
              acc[code.toString().slice(0, 2)] = {
                bool: {
                  filter: [
                    {
                      range: { PSGG: { gte: code + "000", lte: code + "999" } },
                    },
                  ],
                  must_not: [
                    {
                      range: { DSGG: { gte: code + "000", lte: code + "999" } },
                    },
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [pdepar]: Number(code) } }],
                  must_not: [{ term: { [detina]: Number(code) } }],
                },
              };
            }
            return acc;
          }, {} as Record<string, { term: Record<string, number> }>);

        try {
          const detinaResponse = await searchWithLogging({
            index: index,
            body: detinaRegionQuery,
          });
          results.by_detina.week.push(
            ...(Object.entries(
              detinaResponse.body.aggregations.weekday_weekend_buckets.buckets
                .weekday.by_detina.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
          results.by_detina.weeked.push(
            ...(Object.entries(
              detinaResponse.body.aggregations.weekday_weekend_buckets.buckets
                .weekend.by_detina.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
          const pdeparResponse = await searchWithLogging({
            index: index,
            body: pdeparRegionQuery,
          });
          results.by_pdepar.week.push(
            ...(Object.entries(
              pdeparResponse.body.aggregations.weekday_weekend_buckets.buckets
                .weekday.by_pdepar.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
          results.by_pdepar.weeked.push(
            ...(Object.entries(
              pdeparResponse.body.aggregations.weekday_weekend_buckets.buckets
                .weekend.by_pdepar.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
        } catch (error) {
          console.error(error);
        }
      }
    })
  );
  results.by_pdepar.week = await mergeUnionByAlpStatus(regionArray, results.by_pdepar.week, category);
  results.by_pdepar.weeked = await mergeUnionByAlpStatus(regionArray, results.by_pdepar.weeked, "weeked");
  results.by_detina.week = await mergeUnionByAlpStatus(regionArray, results.by_detina.week, category);
  results.by_detina.weeked = await mergeUnionByAlpStatus(regionArray, results.by_detina.weeked, "weeked");

  results.by_pdepar.week = sortByRegionKeys(
    regionArray,
    results.by_pdepar.week
  );
  results.by_pdepar.weeked = sortByRegionKeys(
    regionArray,
    results.by_pdepar.weeked
  );
  results.by_detina.week = sortByRegionKeys(
    regionArray,
    results.by_detina.week
  );
  results.by_detina.weeked = sortByRegionKeys(
    regionArray,
    results.by_detina.weeked
  );
  // console.log(util.inspect(results.by_pdepar.weeked, {showHidden:false, depth:null, colors:true}))
  return results;
}
async function fornAggs(options: AlpParams) {
  const { start, end, regionArray } = options;
  const category = "alp_forn"
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO_CD, SGG_CD, ADMNS_DONG_CD
          size: 0,
        },
        aggs: {
          tot_sum: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
          tot_avg: {
            avg: {
              field: "TOT_POPUL_NUM",
            },
          },
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: {
                _key: "asc",
              },
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
              field: "DOW_CD", //"DOW_CD.keyword",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              pop_by_dow: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          ...Object.fromEntries(
            keyMap.forn.map((country) => [
              country,
              { sum: { field: `${country}_POPUL_NUM` } },
            ])
          ),
          by_timezn: {
            terms: {
              field: "TIMEZN_CD", // "TIMEZN_CD.keyword"
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              total: { sum: { field: "TOT_POPUL_NUM" } },
              ...Object.fromEntries(
                keyMap.forn.map((country) => [
                  country,
                  { sum: { field: `${country}_POPUL_NUM` } },
                ])
              ),
            },
          },
        },
      },
    },
  };

  const getIndex = (
    await getIndexYList(start, end, `forn_time_nation_day`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  let results = await regionAggregation(query, regionArray, indexs, category);
  // results = sortByRegionArray(regionArray, results);
  results = await mergeUnionByAlpStatusForn(regionArray, results, category)
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}
async function comparePeriodForn(options: AlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);

  const isMonth = isValidMonth(start);
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
            filter: dateRange(isMonth, start, end),
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

  // 기간 일 선택한 경우 전월 데이터 없음
  if (isMonth) {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(isMonth, convertLastY.start, convertLastY.end),
          dateRange(isMonth, convertPrevMonth.start, convertPrevMonth.end),
          dateRange(isMonth, start, end),
        ],
        minimum_should_match: 1,
      },
    });

    query.aggs.by_region.aggs.by_prevMonth = {
      filter: dateRange(isMonth, prevMonth, prevMonth),
      aggs: {
        pop_by_prevMonth: {
          sum: {
            field: "TOT_POPUL_NUM",
          },
        },
      },
    };
    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      isMonth,
      convertLastY.start,
      convertLastY.end
    );
  } else {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(
            isMonth,
            lastYear + start.substring(6, 8),
            lastYear + end.substring(6, 8)
          ),
          dateRange(isMonth, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      isMonth,
      lastYear + start.substring(6, 8),
      lastYear + end.substring(6, 8)
    );
  }

  const getIndex = (
    await getIndexCompareYList(
      start,
      end,
      `forn_${isMonth ? "" : "time_"}nation_${isMonth ? "mons" : "day"}`
    )
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  // let results = await regionAggregation(query, regionArray, indexs);
  // results = sortByRegionArray(regionArray, results);
  let results = await alp_regionAggregation(query, regionArray, indexs, start, "forn")
  return results;
}
