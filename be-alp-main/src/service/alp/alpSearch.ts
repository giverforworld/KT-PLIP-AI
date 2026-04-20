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
import { alp_regionAggregation, regionAggregation } from "@/utils/chart/regionAggregation";
import { dateRange } from "@/utils/makeQueryFilter";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { generateSexAge } from "@/utils/generateSexAge";
import { isValidMonth } from "@/middlewares/validators";
import { getTotalDays } from "@/helpers/normalized/normalizedALPData";
import { normalizedGetMaxAgeGroups } from "@/helpers/normalized/normalizedData";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { sortByRegionKeys } from "@/helpers/sortByRegionArray";
import { addUnionRegionMap, mergeUnionByAlp } from "@/helpers/mergeDataByRegion";

export async function alpSearch(options: AlpParams) {
  const [
    timeResult,
    periodTimeResult,
    periodNativeResult,
    monsResult,
    flowResult,
    fornResult,
  ] = await Promise.all([
    timeAggs(options),
    comparePeriodTime(options),
    comparePeriodNative(options),
    nativeMons(options),
    flowAggs(options),
    fornAggs(options),
  ]);

  //opensearh데이터 정규화
  const result = normalized(
    timeResult,
    periodTimeResult,
    periodNativeResult,
    monsResult,
    flowResult,
    fornResult,
    options
  );
  return result;
}

const normalized = (
  timeResult: any,
  periodTimeResult: any,
  periodNativeResult: any,
  monsResult: any,
  flowResult: any,
  fornResult: any,
  options: AlpParams
) => {
  // const result: NormalizedSearch[] = [];
  const startTotalDays = getTotalDays(options.start, options.end);
  const isMonth = options.start.length === 6;

  const result: NormalizedObj = { Avg: [], Unique: [] };

  const ptrnMap = ["rsdn", "wkplc", "vist"];
  timeResult.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;

    const total = Math.round(data.total.value / (startTotalDays * 24));
    const male = Math.round(data.total_male.value / (startTotalDays * 24));
    const female = Math.round(data.total_female.value / (startTotalDays * 24));

    regionData.push({
      key: "male",
      value: parseFloat(((male / total) * 100).toFixed(1)),
    });
    regionData.push({
      key: "female",
      value: parseFloat(((female / total) * 100).toFixed(1)),
    });

    const ageGroup = normalizedGetMaxAgeGroups(data);
    regionData.push({
      key: `ageGroup`,
      value: ageGroup.maxAgeGroup,
    });
    regionData.push({
      key: `timezn`,
      value: data.max_timezn.buckets[0].key,
    });
    data.by_ptrn.buckets.forEach((bucket: any) => {
      const ptrn = Math.round(bucket.total.value / (startTotalDays * 24));

      regionData.push({
        key: ptrnMap[bucket.key],
        value: parseFloat(((ptrn / total) * 100).toFixed(1)),
      });
    });
    result["Avg"].push({
      region,
      data: regionData,
    });
  });
  periodTimeResult.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;
    regionData.push({
      key: "region",
      value: region,
    });
    const current = Math.round(
      data.by_start.pop_by_start.value / (startTotalDays * 24)
    );
    const previous = Math.round(
      data.by_lastYear.pop_by_lastYear.value / (startTotalDays * 24)
    );
    regionData.push({
      key: "totPop",
      value: current,
    });
    const rate = parseFloat(
      (((current - previous) / previous) * 100).toFixed(2)
    );

    regionData.push({
      key: "compare",
      value: rate,
    });

    result["Avg"].push({
      region,
      data: regionData,
    });
  });

  if (isMonth) {
    periodNativeResult.forEach((data: any) => {
      const regionData: NormalizedChartData[] = [];

      const region = data.key;
      regionData.push({
        key: "region",
        value: region,
      });
      const current = Math.round(data.by_start.pop_by_start.value);
      const previous = Math.round(data.by_lastYear.pop_by_lastYear.value);
      regionData.push({
        key: "totPop",
        value: current,
      });
      const rate = parseFloat(
        (((current - previous) / previous) * 100).toFixed(2)
      );

      regionData.push({
        key: "compare",
        value: rate,
      });
      const male = Math.round(data.by_start.total_male.value);
      const female = Math.round(data.by_start.total_female.value);

      regionData.push({
        key: "male",
        value: parseFloat(((male / current) * 100).toFixed(1)),
      });
      regionData.push({
        key: "female",
        value: parseFloat(((female / current) * 100).toFixed(1)),
      });

      const ageGroup = normalizedGetMaxAgeGroups(data.by_start);
      regionData.push({
        key: `ageGroup`,
        value: ageGroup.maxAgeGroup,
      });

      result["Unique"].push({
        region,
        data: regionData,
      });
    });

    monsResult.forEach((data: any) => {
      const regionData: NormalizedChartData[] = [];

      const region = data.key;

      const total = Math.round(data.total.value);
      data.by_ptrn.buckets.forEach((bucket: any) => {
        const ptrn = Math.round(bucket.total.value);
        regionData.push({
          key: ptrnMap[bucket.key],
          value: parseFloat(((ptrn / total) * 100).toFixed(1)),
        });
      });
      result["Unique"].push({
        region,
        data: regionData,
      });
    });
  }
  ["detina", "pdepar"].forEach((flow) => {
    flowResult[`by_${flow}`]?.forEach((data: any) => {
      const regionData: NormalizedChartData[] = [];
      const region = data.key;
      const isSido = region.length === 2;
      const flowKey =
      data[`group_by_${flow === "detina" ? "pdepar" : "detina"}_sum`]
      ?.buckets[0].key;
      const flowRegion = isSido
        ? flowKey.toString().slice(0, 2)
        : flowKey.toString();
      regionData.push({
        key: flow === "detina" ? "inflowRegion" : "outflowRegion",
        value: flowRegion,
      });

      result["Avg"].push({
        region: Number(region),
        data: regionData,
      });
    });
  });
  fornResult.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;
    const total = Math.round(data.tot_sum.value / (startTotalDays * 24));

    regionData.push({
      key: "fornTotPop",
      value: total,
    });

    result["Avg"].push({
      region,
      data: regionData,
    });
  });
  return transformData(result);
};

function transformData(data: NormalizedObj) {
  const resultMap = new Map<
    number,
    Map<string, { Avg?: number | string; Unique?: number | string }>
  >();
  function processCategory(
    category: "Avg" | "Unique",
    items: NormalizedData[]
  ) {
    for (const item of items) {
      if (!resultMap.has(item.region as number)) {
        resultMap.set(item.region as number, new Map());
      }
      const regionMap = resultMap.get(item.region as number)!;

      for (const data of item.data) {
        if (!regionMap.has(data.key as string)) {
          regionMap.set(data.key as string, { Avg: "-", Unique: "-" });
        }
        regionMap.get(data.key as string)![category] = data.value;
      }
    }
  }

  processCategory("Avg", data.Avg);
  processCategory("Unique", data.Unique);

  return Array.from(resultMap.entries()).map(([region, dataMap]) => ({
    region,
    data: Array.from(dataMap.entries()).map(([key, value]) => ({
      key,
      value: { Avg: value.Avg ?? "-", Unique: value.Unique ?? "-" },
    })),
  }));
}

async function timeAggs(options: AlpParams) {
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
          ...generateSexAge(false),
          max_timezn: {
            terms: {
              field: "TIME",
              size: 1,
              order: { total: "desc" },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
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
  return results;
}
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
          total: {
            sum: {
              field: "TOT",
            },
          },
          by_ptrn: {
            terms: {
              field: "PTRN",
              size: 3,
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
async function flowAggs(options: AlpParams) {
  const { start, end, regionArray } = options;
  const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]
  const category = "alp_OD"

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
  };
  const results: {
    by_pdepar: any[];
    by_detina: any[];
  } = {
    by_pdepar: [],
    by_detina: [],
  };

  // 존재하는 인덱스만 필터링
  let regionMap: {
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
      if (region.length === 2) {
        regionMap.sido.codes.push(region);
      } else if (region.length === 5) {
        regionMap.sgg.codes.push(region);
      } else {
        regionMap.adm.codes.push(region);
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
          detinaRegionQuery.aggs.by_detina.aggs.group_by_pdepar_sum.terms.script =
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
                  must_not: [{ term: { [pdepar]: Number(code) } }, { term: { [pdepar]: 99 }}],
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
              source: "Math.round(doc['DSGG'].value/1000) * 1000",
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
                  must_not: [{ term: { [detina]: Number(code) } }, { term: { [detina]: 99}}],
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
  results.by_pdepar = await mergeUnionByAlp(results.by_pdepar, regionArray, category)
  results.by_detina = await mergeUnionByAlp(results.by_detina, regionArray, category)

  results.by_pdepar = sortByRegionKeys(regionArray, results.by_pdepar);
  results.by_detina = sortByRegionKeys(regionArray, results.by_detina);
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
  const transData = await mergeUnionByAlp(results, regionArray, category)
  return transData;
}
