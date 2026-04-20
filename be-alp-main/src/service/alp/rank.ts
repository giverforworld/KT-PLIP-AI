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
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { dateRange } from "@/utils/makeQueryFilter";
import { alp_regionAggregation, regionAggregation } from "@/utils/chart/regionAggregation";
import { generateSexAge } from "@/utils/generateSexAge";
import {
  normalizedAgeData,
  normalizedSexData,
} from "@/helpers/normalized/normalizedData";
import {
  getTotalDays,
  getWeekedOccurrences,
  normalizedHourlyAvg,
  normalizedInOutData,
  normalizedODFlowData,
} from "@/helpers/normalized/normalizedALPData";
import { sortByRegionKeys } from "@/helpers/sortByRegionArray";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { mergeDataByRegion, mergeRawData, mergeUnionByAlpStatus } from "@/helpers/mergeDataByRegion";
import { getChangedRegion } from "@/utils/changedRegionCache";

const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]

export async function alpRank(options: AlpParams) {
  const holidays = await getHolidays(options.start, options.end);

  const [timeResult, nativeResult, weekResult, flowResult, compareFlowResult] =
    await Promise.all([
      comparePeriodTime(options),
      comparePeriodNative(options),
      weekFlowAggs(options, holidays),
      flowAggs(options),
      compareFlowAggs(options),
    ]);

  //opensearh데이터 정규화
  const data = normalized(
    timeResult,
    nativeResult,
    weekResult,
    flowResult,
    compareFlowResult,
    options,
    holidays
  );
  return data;
}

const normalized = (
  timeResult: any,
  nativeResult: any,
  weekResult: any,
  flowResult: any,
  compareFlowResult: any,
  options: AlpParams,
  holidays: string[]
) => {
  const isMonth = options.start.length === 6;
  const result: NestedNormalizedObj = {
    //통계요약
    tot: { Avg: [], Unique: [] },
    inflowWeek: { Avg: [], Unique: [] },
    inflowWeeked: { Avg: [], Unique: [] },
    age: { Avg: [], Unique: [] },
    //지역 현황 모아보기
    rsdn: { Avg: [], Unique: [] },
    wkplc: { Avg: [], Unique: [] },
    vist: { Avg: [], Unique: [] },
    inflow: { Avg: [], Unique: [] },
    outflow: { Avg: [], Unique: [] },
    //유입-유출 분포
    flow: { Avg: [], Unique: [] },
  };
  const startTotalDays = getTotalDays(options.start, options.end);
  const { prevMonth, lastYear } = calculateDates(options.start);
  const lastYearTotalDays = getTotalDays(
    isMonth ? lastYear : lastYear + options.start.substring(6, 8),
    isMonth ? lastYear : lastYear + options.end.substring(6, 8)
  );
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );

  timeResult.forEach((data: any) => {
    const region = data.key;

    let sexPtrn: any[] = [];
    let agePtrn: any[] = [];
    let rsdn: any[] = [];
    let wkplc: any[] = [];
    let vist: any[] = [];

    const total = data.by_start.total.value / (startTotalDays * 24);
    const lastTotal = data.by_lastYear.total.value / (lastYearTotalDays * 24);

    data.by_start.by_ptrn.buckets.forEach((bucket: any) => {
      const pSex = normalizedSexData(bucket, undefined, bucket.key);
      sexPtrn.push(...normalizedHourlyAvg(pSex, startTotalDays));
      const pAge = normalizedAgeData(bucket, undefined, bucket.key);
      agePtrn.push(...normalizedHourlyAvg(pAge, startTotalDays));
      //  ((total( - ptrn) / ptrn)*100).toFixed(1);
      const ptrn = Math.round(bucket.total.value / (startTotalDays * 24));
      if (bucket.key === 0) {
        rsdn.push({
          key: "start",
          value: parseFloat(((ptrn / total) * 10).toFixed(1)),
        });
      } else if (bucket.key === 1) {
        wkplc.push({
          key: "start",
          value: parseFloat(((ptrn / total) * 10).toFixed(1)),
        });
      } else {
        vist.push({
          key: "start",
          value: parseFloat(((ptrn / total) * 10).toFixed(1)),
        });
      }
    });

    data.by_lastYear.by_ptrn.buckets.forEach((bucket: any) => {
      const ptrn = Math.round(bucket.total.value / (lastYearTotalDays * 24));
      if (bucket.key === 0) {
        rsdn.push({
          key: "lastYear",
          value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
        });
      } else if (bucket.key === 1) {
        wkplc.push({
          key: "lastYear",
          value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
        });
      } else {
        vist.push({
          key: "lastYear",
          value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
        });
      }
    });
    result.age["Avg"].push({
      region: region,
      data: [...agePtrn, ...sexPtrn],
    });
    result.rsdn["Avg"].push({
      region: region,
      data: rsdn,
    });
    result.wkplc["Avg"].push({
      region: region,
      data: wkplc,
    });
    result.vist["Avg"].push({
      region: region,
      data: vist,
    });
    result.tot["Avg"].push({
      region: region,
      data: [
        {
          key: "tot",
          value: total,
        },
      ],
    });
  });

  weekResult[`by_detina`]["week"]?.forEach((data: any) => {
    const region = data.key;
    const weekAvg = normalizedInOutData(
      data[`group_by_pdepar_sum`]?.buckets || [],
      region,
      weekdayCnt
    );
    result[`inflowWeek`]["Avg"].push({
      region: region,
      data: weekAvg,
    });
  });
  weekResult[`by_detina`]["weeked"]?.forEach((data: any) => {
    const region = data.key;
    const weekedAvg = normalizedInOutData(
      data[`group_by_pdepar_sum`]?.buckets || [],
      region,
      holidayCnt
    );
    //summary때문에 Weeked에 최다 week 추가
    const weekData = result[`inflowWeek`]["Avg"].find(
      (item) => item.region === region
    );
    result[`inflowWeeked`]["Avg"].push({
      region: region,
      data: [...weekedAvg, weekData?.data[0]],
    });
  });

  // 월 조회시만
  if (isMonth) {
    nativeResult.forEach((data: any) => {
      const region = data.key;
      let sexPtrn: any[] = [];
      let agePtrn: any[] = [];
      let rsdn: any[] = [];
      let wkplc: any[] = [];
      let vist: any[] = [];

      const total = data.by_start.total.value;
      const lastTotal = data.by_lastYear.total.value;

      data.by_start.by_ptrn.buckets.forEach((bucket: any) => {
        const pSex = normalizedSexData(bucket, undefined, bucket.key);
        sexPtrn.push(...pSex);
        const pAge = normalizedAgeData(bucket, undefined, bucket.key);
        agePtrn.push(...pAge);

        const ptrn = Math.round(bucket.total.value);
        if (bucket.key === 0) {
          rsdn.push({
            key: "start",
            value: parseFloat(((ptrn / total) * 10).toFixed(1)),
          });
        } else if (bucket.key === 1) {
          wkplc.push({
            key: "start",
            value: parseFloat(((ptrn / total) * 10).toFixed(1)),
          });
        } else {
          vist.push({
            key: "start",
            value: parseFloat(((ptrn / total) * 10).toFixed(1)),
          });
        }
      });

      data.by_lastYear.by_ptrn.buckets.forEach((bucket: any) => {
        const ptrn = Math.round(bucket.total.value);
        if (bucket.key === 0) {
          rsdn.push({
            key: "lastYear",
            value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
          });
        } else if (bucket.key === 1) {
          wkplc.push({
            key: "lastYear",
            value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
          });
        } else {
          vist.push({
            key: "lastYear",
            value: parseFloat(((ptrn / lastTotal) * 10).toFixed(1)),
          });
        }
      });
      result.age["Unique"].push({
        region: region,
        data: [...agePtrn, ...sexPtrn],
      });
      result.rsdn["Unique"].push({
        region: region,
        data: rsdn,
      });
      result.wkplc["Unique"].push({
        region: region,
        data: wkplc,
      });
      result.vist["Unique"].push({
        region: region,
        data: vist,
      });
      result.tot["Unique"].push({
        region: region,
        data: [
          {
            key: "tot",
            value: data.by_start.total.value,
          },
        ],
      });
    });
  }

  compareFlowResult[`by_detina`].forEach((data: any) => {
    const region = data.key;
    const pdeparData = compareFlowResult[`by_pdepar`].find(
      (data: any) => data.key === region
    );

    const inflowLast = data.by_lastYear.total.value / (lastYearTotalDays * 24);
    const inflowStart = data.by_start.total.value / (startTotalDays * 24);
    const outflowLast =
      pdeparData.by_lastYear.total.value / (lastYearTotalDays * 24);
    const outflowStart =
      pdeparData.by_start?.total.value / (startTotalDays * 24);

    result.inflow["Avg"].push({
      region: region,
      data: [
        {
          key: "lastYear",
          value: parseFloat(
            ((inflowLast / (inflowLast + outflowLast)) * 10).toFixed(1)
          ),
        },
        {
          key: "start",
          value: parseFloat(
            ((inflowStart / (inflowStart + outflowStart)) * 10).toFixed(1)
          ),
        },
      ],
    });
    result.outflow["Avg"].push({
      region: region,
      data: [
        {
          key: "lastYear",
          value: parseFloat(
            ((outflowLast / (inflowLast + outflowLast)) * 10).toFixed(1)
          ),
        },
        {
          key: "start",
          value: parseFloat(
            ((outflowStart / (inflowStart + outflowStart)) * 10).toFixed(1)
          ),
        },
      ],
    });
  });
  flowResult[`by_detina`].forEach((data: any) => {
    const region = data.key;
    const pdeparData = flowResult[`by_pdepar`].find(
      (data: any) => data.key === region
    );
    const inflow = normalizedODFlowData(
      data.group_by_pdepar_sum.buckets,
      region,
      startTotalDays,
      "inflow"
    );
    const outflow = normalizedODFlowData(
      pdeparData.group_by_detina_sum.buckets,
      region,
      startTotalDays,
      "outflow"
    );
    result.flow["Avg"].push({
      region: region,
      data: [...inflow, ...outflow],
    });
  });
  return result;
};
//tot, psex, age, rsdn, wkplc, vist
async function comparePeriodTime(options: AlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);

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
              total: { sum: { field: "TOT" } },
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
          by_lastYear: {
            filter: {},
            aggs: {
              total: { sum: { field: "TOT" } },
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
      ],
      minimum_should_match: 1,
    },
  });
  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    false,
    lastYear + start.substring(6, 8),
    lastYear + end.substring(6, 8)
  );

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
  return results;
}
//tot, psex, age, rsdn, wkplc, vist
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
              total: { sum: { field: "TOT" } },
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
          by_lastYear: {
            filter: {},
            aggs: {
              total: { sum: { field: "TOT" } },
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
      ],
      minimum_should_match: 1,
    },
  });
  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    true,
    lastYear + start.substring(6, 8),
    lastYear + end.substring(6, 8)
  );

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
                  size: 1,
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
                  size: 1,
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
              source: "Math.round(doc['PSGG'].value/1000) * 100",
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
                    {
                      term: { PSGG: 99}
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [detina]: Number(code) } }],
                  must_not: [{ term: { [pdepar]: Number(code) } }, {term: { [pdepar]: 99}}],
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
              source: "Math.round(doc['DSGG'].value/1000) * 100",
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
                    {
                      term: { DSGG: 99}
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [pdepar]: Number(code) } }],
                  must_not: [{ term: { [detina]: Number(code) } }, { term: { [detina]: 99}}],
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

          // 집계 결과 저장
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
  results.by_pdepar.weeked = await mergeUnionByAlpStatus(regionArray, results.by_pdepar.weeked, category);
  results.by_detina.week = await mergeUnionByAlpStatus(regionArray, results.by_detina.week, category);
  results.by_detina.weeked = await mergeUnionByAlpStatus(regionArray, results.by_detina.weeked, category);

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
  return results;
}
async function flowAggs(options: AlpParams) {
  const { start, end, regionArray } = options;
  const category = "rankFlow"

  const detinaQuery = {
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_detina: {
        filters: {
          filters: {},
        },
        aggs: {
          group_by_pdepar_sum: {
            terms: {
              size: 10,
              order: { total: "desc" },
            },
            aggs: {
              total: { sum: { field: "TOT" } },
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
      by_pdepar: {
        filters: {
          filters: {},
        },
        aggs: {
          group_by_detina_sum: {
            terms: {
              size: 10,
              order: { total: "desc" },
            },
            aggs: {
              total: { sum: { field: "TOT" } },
            },
          },
        },
      },
    },
  };
  const results: {
    by_pdepar: any[];
    by_detina: any[];
  } = {
    by_pdepar: [],
    by_detina: [],
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
          detinaRegionQuery.aggs.by_detina.aggs.group_by_pdepar_sum.terms.script =
            {
              source: "Math.round(doc['PSGG'].value/1000) * 100",
              lang: "painless",
            };
        } else {
          detinaRegionQuery.query.bool.filter.push({
            terms: {
              [detina]: codes,
            },
          });
          detinaRegionQuery.aggs.by_detina.aggs.group_by_pdepar_sum.terms.field =
            pdepar;
        }

        detinaRegionQuery.aggs.by_detina.filters.filters = codes.reduce(
          (acc: Record<string, object>, code) => {
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
                    {
                      term: { PSGG: 99}
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [detina]: Number(code) } }],
                  must_not: [{ term: { [pdepar]: Number(code) } }, { term: { [pdepar]: 99}}],
                },
              };
            }
            return acc;
          },
          {} as Record<string, object>
        );

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
          pdeparRegionQuery.aggs.by_pdepar.aggs.group_by_detina_sum.terms.script =
            {
              source: "Math.round(doc['DSGG'].value/1000) * 100",
              lang: "painless",
            };
        } else {
          pdeparRegionQuery.query.bool.filter.push({
            terms: {
              [pdepar]: codes,
            },
          });

          pdeparRegionQuery.aggs.by_pdepar.aggs.group_by_detina_sum.terms.field =
            detina;
        }
        pdeparRegionQuery.aggs.by_pdepar.filters.filters = codes.reduce(
          (acc: Record<string, object>, code) => {
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
                    {
                      term: { DSGG: 99 }
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [pdepar]: Number(code) } }],
                  must_not: [{ term: { [detina]: Number(code) } }, { term: { [detina]: 99 }}],
                },
              };
            }
            return acc;
          },
          {} as Record<string, { term: Record<string, number> }>
        );

        try {
          const detinaResponse = await searchWithLogging({
            index: index,
            body: detinaRegionQuery,
          });
          // 집계 결과 저장
          results.by_detina.push(
            ...(Object.entries(
              detinaResponse.body.aggregations.by_detina.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
          const pdeparResponse = await searchWithLogging({
            index: index,
            body: pdeparRegionQuery,
          });
          results.by_pdepar.push(
            ...(Object.entries(
              pdeparResponse.body.aggregations.by_pdepar.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
        } catch (error) {
          console.error(error);
        }
      }
    })
  );
  results.by_pdepar = await mergeUnionByAlpStatus(regionArray, results.by_pdepar, category)
  results.by_detina = await mergeUnionByAlpStatus(regionArray, results.by_detina, category)

  results.by_pdepar = sortByRegionKeys(regionArray, results.by_pdepar);
  results.by_detina = sortByRegionKeys(regionArray, results.by_detina);
  return results;
}
async function compareFlowAggs(options: AlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const changeRegion = await getChangedRegion("sido");
  const addOneYear = (baseYm: string) => {
    const year = parseInt(baseYm.slice(0, 4), 10);
    const month = parseInt(baseYm.slice(4, 6), 10);
    const newYear = year + 1;
    return `${newYear}${month.toString().padStart(2, "0")}`;
  };
  const category = "rankCompareFlow"
  const detinaQuery = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            bool: {
              should: [
                dateRange(
                  false,
                  convertLastY.start,
                  convertLastY.end
                ),
                dateRange(false, start, end),
              ],
              minimum_should_match: 1,
            },
          },
        ],
      },
    },
    aggs: {
      by_detina: {
        filters: {
          filters: {},
        },
        aggs: {
          by_start: {
            filter: dateRange(false, start, end),
            aggs: {
              total: { sum: { field: "TOT" } },
            },
          },
          by_lastYear: {
            filter: dateRange(
              false,
              convertLastY.start,
              convertLastY.end
            ),
            aggs: {
              total: { sum: { field: "TOT" } },
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
        filter: [
          {
            bool: {
              should: [
                dateRange(
                  false,
                  convertLastY.start,
                  convertLastY.end
                ),
                dateRange(false, start, end),
              ],
              minimum_should_match: 1,
            },
          },
        ],
      },
    },
    aggs: {
      by_pdepar: {
        filters: {
          filters: {},
        },
        aggs: {
          by_start: {
            filter: dateRange(false, start, end),
            aggs: {
              total: { sum: { field: "TOT" } },
            },
          },
          by_lastYear: {
            filter: dateRange(
              false,
              convertLastY.start,
              convertLastY.end
            ),
            aggs: {
              total: { sum: { field: "TOT" } },
            },
          },
        },
      },
    },
  };
  const results: {
    by_pdepar: any[];
    by_detina: any[];
  } = {
    by_pdepar: [],
    by_detina: [],
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
        await getIndexCompareYList(start, end, "native_ingrs_egrs_sgg_day")
      ).join(","),
    },
    sgg: {
      codes: [],
      detina: "DSGG",
      pdepar: "PSGG",
      index: (
        await getIndexCompareYList(start, end, "native_ingrs_egrs_sgg_day")
      ).join(","),
    },
    adm: {
      codes: [],
      detina: "DADM",
      pdepar: "PADM",
      index: (
        await getIndexCompareMMList(start, end, "native_ingrs_egrs_admdong_day")
      ).join(","),
    },
  };

  // 지역 코드를 길이에 따라 분류
  regionArray.forEach((region) => {
    const regionCode = Number(region.slice(0, 2));
    const regionInfo = changeRegion.find((info) => info.SIDO === regionCode);

    if (regionInfo && start) {
      const startDate = Number(start.slice(0, 6));

      const baseYm = regionInfo.BASE_YM;
      const baseYmPlusOneYear = Number(addOneYear(baseYm.toString()));

      if (startDate <= baseYmPlusOneYear) {
        const oldRegionCode = regionInfo.OSIDO.toString();
        if (region.length === 2) {
          regionMap.sido.codes.push(oldRegionCode, region);
        } else if (region.length === 5) {
          regionMap.sgg.codes.push(oldRegionCode + region.slice(2, 5), region);
        } else {
          regionMap.adm.codes.push(oldRegionCode + region.slice(2), region);
        }
      } else {
        if (region.length === 2) regionMap.sido.codes.push(region);
        else if (region.length === 5) regionMap.sgg.codes.push(region);
        else regionMap.adm.codes.push(region);
      }
    } else {
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
        } else {
          detinaRegionQuery.query.bool.filter.push({
            terms: {
              [detina]: codes,
            },
          });
        }

        detinaRegionQuery.aggs.by_detina.filters.filters = codes.reduce(
          (acc: Record<string, object>, code) => {
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
                    {
                      term: { PSGG: 99 }
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [detina]: Number(code) } }],
                  must_not: [{ term: { [pdepar]: Number(code) } }, { term: { [pdepar]: 99}}],
                },
              };
            }
            return acc;
          },
          {} as Record<string, object>
        );

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
        } else {
          pdeparRegionQuery.query.bool.filter.push({
            terms: {
              [pdepar]: codes,
            },
          });
        }
        pdeparRegionQuery.aggs.by_pdepar.filters.filters = codes.reduce(
          (acc: Record<string, object>, code) => {
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
                    {
                      term: { DSGG: 99 }
                    }
                  ],
                },
              };
            } else {
              acc[code.toString()] = {
                bool: {
                  filter: [{ term: { [pdepar]: Number(code) } }],
                  must_not: [{ term: { [detina]: Number(code) } }, { term: { [detina]: 99 }}],
                },
              };
            }
            return acc;
          },
          {} as Record<string, { term: Record<string, number> }>
        );

        try {
          const detinaResponse = await searchWithLogging({
            index: index,
            body: detinaRegionQuery,
          });
          // 집계 결과 저장
          results.by_detina.push(
            ...(Object.entries(
              detinaResponse.body.aggregations.by_detina.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
          const pdeparResponse = await searchWithLogging({
            index: index,
            body: pdeparRegionQuery,
          });
          results.by_pdepar.push(
            ...(Object.entries(
              pdeparResponse.body.aggregations.by_pdepar.buckets
            ).map(([key, value]: [string, any]) => ({ [key]: value })) || [])
          );
        } catch (error) {
          console.error(error);
        }
      }
    })
  );
  results.by_pdepar = await mergeUnionByAlpStatus(regionArray, results.by_pdepar, category)
  results.by_detina = await mergeUnionByAlpStatus(regionArray, results.by_detina, category)

  const pdepar_data = await mergeRawData(results.by_pdepar, regionArray);
  const detina_data = await mergeRawData(results.by_detina, regionArray);

  results.by_pdepar = sortByRegionKeys(regionArray, pdepar_data);
  results.by_detina = sortByRegionKeys(regionArray, detina_data);
  return results;
}
