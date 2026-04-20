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
import { getIndexCompareYList, getIndexYList } from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  regionAggregation,
  // regionCompareAggregation,
} from "@/utils/chart/regionAggregation";
import { generateSexAge } from "@/utils/generateSexAge";
import {
  normalizedAgeData,
  normalizedBucketData,
  normalizedDayData,
  normalizedSexAgeData,
  normalizedSexData,
} from "@/helpers/normalized/normalizedData";
import {
  getTotalDays,
  getWeekedOccurrences,
  normalizedDowAvgData,
  normalizedHourlyAvg,
  normalizedWeekdaysAvgData,
} from "@/helpers/normalized/normalizedALPData";

export async function patternN(options: AlpParams) {
  const holidays = await getHolidays(options.start, options.end);

  const [
    timeResult,
    timeMonthlyResult,
    nativeMonthlyResult,
    nativeDayResult,
    monsResult,
  ] = await Promise.all([
    timeAggs(options, holidays),
    timeMonthly(options),
    nativeMonthly(options),
    nativeDay(options),
    nativeMons(options),
  ]);

  //opensearh데이터 정규화
  const purposeData = normalized(
    timeResult,
    timeMonthlyResult,
    nativeMonthlyResult,
    nativeDayResult,
    monsResult,
    options,
    holidays
  );
  // console.log(
  //   util.inspect(periodTimeResult, {
  //     showHidden: false,
  //     depth: null,
  //     colors: true,
  //   })
  // );
  return purposeData;
}

const normalized = (
  timeResult: any,
  timeMonthlyResult: any,
  nativeMonthlyResult: any,
  nativeDayResult: any,
  monsResult: any,
  options: AlpParams,
  holidays: string[]
) => {
  const isMonth = options.start.length === 6;
  const result: NestedNormalizedObj = {
    current: { Avg: [], Unique: [] },
    month: { Avg: [], Unique: [] },
    pday: { Avg: [], Unique: [] },
    psex: { Avg: [], Unique: [] },
    age: { Avg: [], Unique: [] },
    sexAgeRsdn: { Avg: [], Unique: [] },
    sexAgeWkplc: { Avg: [], Unique: [] },
    sexAgeVist: { Avg: [], Unique: [] },
    dow: { Avg: [] },
    weekdays: { Avg: [] },
    pTimezn: { Avg: [] },
  };
  // console.log(
  //   util.inspect(timeResult, {
  //     showHidden: false,
  //     depth: null,
  //     colors: true,
  //   })
  // );
  const startTotalDays = getTotalDays(options.start, options.end);
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );
  const ptrnMap = ["sexAgeRsdn", "sexAgeWkplc", "sexAgeVist"];
  timeResult.forEach((data: any) => {
    const region = data.key;

    let dayPtrn: any[] = [];
    let sexPtrn: any[] = [];
    let agePtrn: any[] = [];
    let weekdaysPtrn: any[] = [];
    let dowPtrn: any[] = [];
    let timeznPtrn: any[] = [];

    data.by_ptrn.buckets.forEach((bucket: any) => {
      const pday = normalizedDayData(bucket.by_day.buckets, false, bucket.key);
      dayPtrn.push(...pday);

      const pSex = normalizedSexData(bucket, undefined, bucket.key);
      sexPtrn.push(...normalizedHourlyAvg(pSex, startTotalDays));
      const pAge = normalizedAgeData(bucket, undefined, bucket.key);
      agePtrn.push(...normalizedHourlyAvg(pAge, startTotalDays));

      const sexAge = normalizedSexAgeData(bucket);
      result[ptrnMap[bucket.key]]["Avg"].push({
        region: region,
        data: normalizedHourlyAvg(sexAge, startTotalDays),
      });

      const dow = normalizedDowAvgData(
        bucket.by_dow.buckets,
        options.start,
        options.end,
        bucket.key
      );
      dowPtrn.push(...dow);

      const weekdays = normalizedWeekdaysAvgData(
        bucket.by_weekdays.buckets,
        weekdayCnt,
        holidayCnt,
        bucket.key
      );
      weekdaysPtrn.push(...weekdays);

      const timezn = normalizedBucketData(bucket.by_timezn.buckets, bucket.key);
      timeznPtrn.push(...normalizedHourlyAvg(timezn, startTotalDays, true));
    });
    result.pday["Avg"].push({
      region: region,
      data: dayPtrn,
    });
    result.psex["Avg"].push({
      region: region,
      data: sexPtrn,
    });
    result.age["Avg"].push({
      region: region,
      data: [...agePtrn, ...sexPtrn],
    });
    result.dow["Avg"].push({
      region: region,
      data: dowPtrn,
    });
    result.weekdays["Avg"].push({
      region: region,
      data: weekdaysPtrn,
    });
    result.pTimezn["Avg"].push({
      region: region,
      data: timeznPtrn,
    });
  });
  nativeDayResult.forEach((data: any) => {
    const region = data.key;

    let dayPtrn: any[] = [];
    data.by_ptrn.buckets.forEach((bucket: any) => {
      const pday = normalizedDayData(bucket.by_day.buckets, true, bucket.key);
      dayPtrn.push(...pday);
    });
    result.pday["Unique"].push({
      region: region,
      data: dayPtrn,
    });
  });

  // 월 조회시만
  if (isMonth) {
    timeMonthlyResult.forEach((data: any) => {
      const region = data.key;

      let monthP: any[] = [];
      let currentP: any[] = [];

      data.by_ptrn.buckets.forEach((bucket: any) => {
        const pMons = normalizedBucketData(bucket.by_month.buckets, bucket.key);
        const avg = normalizedHourlyAvg(pMons, startTotalDays);
        monthP.push(...avg);
        currentP.push(avg[avg.length - 1]);
      });

      result.month["Avg"].push({
        region: region,
        data: monthP,
      });
      result.current["Avg"].push({
        region: region,
        data: currentP,
      });
    });
    nativeMonthlyResult.forEach((data: any) => {
      const region = data.key;

      let monthP: any[] = [];
      let currentP: any[] = [];
      data.by_ptrn.buckets.forEach((bucket: any) => {
        const pMons = normalizedBucketData(bucket.by_month.buckets, bucket.key);
        monthP.push(...pMons);
        currentP.push(pMons[pMons.length - 1]);
      });

      result.month["Unique"].push({
        region: region,
        data: monthP,
      });
      result.current["Unique"].push({
        region: region,
        data: currentP,
      });
    });

    monsResult.forEach((data: any) => {
      const region = data.key;
      let sexPtrn: any[] = [];
      let agePtrn: any[] = [];

      data.by_ptrn.buckets.forEach((bucket: any) => {
        const pSex = normalizedSexData(bucket, undefined, bucket.key);
        sexPtrn.push(...pSex);
        const pAge = normalizedAgeData(bucket, undefined, bucket.key);
        agePtrn.push(...pAge);
        const sexAge = normalizedSexAgeData(bucket);
        result[ptrnMap[bucket.key]]["Unique"].push({
          region: region,
          data: sexAge,
        });
      });
      result.psex["Unique"].push({
        region: region,
        data: sexPtrn,
      });
      result.age["Unique"].push({
        region: region,
        data: [...agePtrn, ...sexPtrn],
      });
    });
  }
  return result;
};
//day, psex, age, sexAgeRsdn, sexAgeWkplc, sexAgeVist, dow, weekdays, timezn
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
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
            },
            aggs: {
              ...generateSexAge(false),
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
                  total: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
            },
          },
          // by_ptrn: {
          //   terms: {
          //     field: "PTRN",
          //     size: 3,
          //   },
          //   aggs: {
          //     ...generateSexAge(false),
          //   },
          // },
        },
      },
    },
  };
  const getIndex = (
    await getIndexCompareYList(start, end, `native_time_nation_day`)
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

  return results;
}
//월 조회시에만 current, month
async function timeMonthly(options: AlpParams) {
  const { start, end, regionArray } = options;

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];

  const { lastYear } = calculateDates(start);

  const convertStart = calcMonthToDate(start);
  const convertLastYear = calcMonthToDate(lastYear);

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertLastYear.start,
                lte: convertStart.end,
              },
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO, SGG, ADM
          size: 0,
        },
        aggs: {
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
            },
            aggs: {
              by_month: {
                date_histogram: {
                  field: "BASE_YMD",
                  calendar_interval: "1M",
                  format: "yyyyMM",
                  order: {
                    _key: "asc",
                  },
                  min_doc_count: 1,
                  extended_bounds: {
                    min: Number(convertLastYear.start),
                    max: Number(convertStart.end),
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
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexCompareYList(start, end, `native_time_nation_day`)
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

  return results;
}
//day
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
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
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

  return results;
}
//월 조회시에만 current, month
async function nativeMonthly(options: AlpParams) {
  const { start, end, regionArray } = options;

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];

  const { lastYear } = calculateDates(start);

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, lastYear, start)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO, SGG, ADM
          size: 0,
        },
        aggs: {
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
            },
            aggs: {
              by_month: {
                terms: {
                  field: "BASE_YM",
                  size: 13,
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
            },
          },
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
  let results = await regionAggregation(
    query,
    regionArray,
    indexs,
    "nativeTime"
  );

  return results;
}
// psex, age, sexAgeRsdn, sexAgeWkplc, sexAgeVist
async function nativeMons(options: AlpParams) {
  const { start, end, regionArray } = options;

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "", //SIDO, SGG, ADM
          size: 0,
        },
        aggs: {
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
            },
            aggs: {
              ...generateSexAge(false),
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexYList(start, end, `native_unique_nation_mons`)
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

  return results;
}
