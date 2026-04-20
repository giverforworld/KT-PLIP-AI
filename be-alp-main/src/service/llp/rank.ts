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
import {
  normalizedFlowData,
  normalizedLdgmtDayData,
  normalizedLdgmtDaysAvgData,
  normalizedStayDayData,
  normalizedStayDaysAvgData,
  normalizedStayTimesAvgData,
} from "@/helpers/normalized/normalizedData";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getIndexMMList, getIndexYList } from "@/helpers/getIndexList";
import { convertMinutesToHoursDecimal } from "@/helpers/convertTime";
import { llpAggregation, regionAggregation } from "@/utils/chart/regionAggregation";

export async function llpRank(options: LlpParams) {
  const [
    traitsMonsResult,
    traitsDaysResult,
    traitsLdgmtResult,
    residResult,
    decreasePopDayResult,
    decreasePopTimeResult,
    stayTimesAvgResult,
    decreaseStayDateResult,
    residDatePopSumResult,
  ] = await Promise.all([
    stayMonsTraits(options),
    stayDaysTraits(options),
    ldgmtDaysTraits(options),
    residData(options),
    decreasePopDay(options),
    decreasePopTime(options),
    stayTimesAvg(options),
    decreaseStayDateSum(options),
    residDatePopSum(options)
  ]);
  //opensearh데이터 정규화
  const result = normalized(
    traitsMonsResult,
    traitsDaysResult,
    traitsLdgmtResult,
    residResult,
    decreasePopDayResult,
    decreasePopTimeResult,
    stayTimesAvgResult,
    decreaseStayDateResult,
    residDatePopSumResult,
  );

  return result;
}

const normalized = (
  traitsMonsData: any,
  traitsDaysData: any,
  traitsLdgmtData: any,
  residData: any,
  decreasePopDayData: any,
  decreasePopTimeData: any,
  stayTimesAvgData: any,
  decreaseStayDateData : any,
  residDatePopSumData : any,
) => {
  const result: NormalizedObj = {
    //통계요약
    stayPop: [], //총 체류인구
    residPop: [], //주민등록 대비
    stayTimesAvg: [], //평균 체류시간
    stayDays: [], //체류일수별 비율
    flowRegion: [], //유입지역별
    //증감
    decreasePop: [],
    stayDaysAvg: [], //평균 체류일수
    // inflowSido: [], //타시도 거주자
    //흐름
    flow: [],
    ldgmtDays: [],
    // 인구감소 총 체류인구/주민등록 인구
    decreaseStayPop: [], 
    residDatePop : [],
    decreaseAvgPop : []
  };

  const stayDiv = ["1", "2-7", "8"];
  const ldgmtDiv = ["1", "2", "3", "4"];
  const stat: NormalizedChartData[] = [];

  const compareData: NormalizedData[] = [];
  const tempLdgmtAvg: { data: any[] }[] = [];

  let sumOfRatios = 0;
  let regionCount = 0;

  traitsDaysData.forEach((data: any) => {
    const region = data.key;

    let flow = [];

    let stayPop = 0;

    if (traitsMonsData) {
      const monsData = traitsMonsData.find((item: any) => item.key === region);
      flow = normalizedFlowData(monsData.by_flow.buckets);
      stayPop = monsData.tot_pop.value || 0;
      if (traitsLdgmtData)
        for (const data of traitsLdgmtData) {
          const region = data.key;
          const ldgmtDays = normalizedLdgmtDayData(data, ldgmtDiv);
          result.ldgmtDays.push({ region, data: ldgmtDays });
          const ldgmtAvg = normalizedLdgmtDaysAvgData(data);
          tempLdgmtAvg.push(...ldgmtAvg);
        }
    } else {
      flow = normalizedFlowData(data.by_flow.buckets);
      stayPop = data.tot_pop.value;
    }
    result.flow.push({
      region: region,
      data: [...flow],
    });
    result.stayPop.push({
      region: region,
      data: [{ key: "stayPop", value: stayPop }],
    });

    result.flowRegion.push({
      region: region,
      data: [{
        key : flow[0].key,
        value: (flow[0].value / stayPop) * 100,
      }]
    })
    // 주민등록
    const residRegionData = residData.find((item: any) => item.key === region);
    result.residPop.push({
      region: region,
      data: [
        { key: "residPop", value: residRegionData?.popul_sum.value || 0 },
      ],
    });

    // 인구감소지역 주민등록
    const decreaseResidRegionData = residDatePopSumData?.popul_sum.value;
    // const regionResidPop = decreaseResidRegionData ? decreaseResidRegionData.popul_sum.value : 0;

    // 인구감소지역의 총 체류인구
    const stayDateForRegion = decreaseStayDateData?.popul_sum.value;
    // const getDecreaseStayMonsPop = stayDateForRegion ? stayDateForRegion.popul_sum.value : decreaseStayDateData.reduce(
    //   (sum : number, cur: any) => sum + (cur.popul_sum.value || 0),
    // );

    // 인구감소지역의 지역별 체류인구 배수 (총 체류인구/총 주민등록인구)
    const decreaseRegionRatio = decreaseResidRegionData === 0 ? 0 : stayDateForRegion / decreaseResidRegionData;

    // 누적 계산
    sumOfRatios += decreaseRegionRatio;
    regionCount++;

    // 인구감소지역의 각 지역별 배수 저장
    result.decreaseStayPop.push({
      region: region,
      data: [{ key : "residSumPop", value : decreaseRegionRatio}]
    });

    // 전체 평균 
    const averageRatio = regionCount > 0 ? sumOfRatios / regionCount : 0;
    result.decreaseAvgPop.push({
      region: "전체평균",
      data: [{ key : "decreasePopAvg", value : averageRatio}]
    })
    const decreasePop = decreasePopDayData.value.dpar_tot_pop_avg.value;
    result.decreasePop.push({
      region: region,
      data: [{ key: "decreasePop", value: decreasePop }],
    });
  });

  const dpar_tot = decreasePopDayData.value.dpar_tot_pop.value;
  const dpar_idx = decreasePopDayData.value.dpar_tot_index.value;
  const decreasePopDay = dpar_idx / dpar_tot;
  decreasePopDayData.value = decreasePopDay;

  const dpar_tot_time = decreasePopTimeData.value.dpar_tot_pop.value;
  const dpar_idx_time = decreasePopTimeData.value.dpar_tot_index.value;
  const decreasePopTime = dpar_idx_time / dpar_tot_time;
  decreasePopTimeData.value = decreasePopTime;

  //if (traitsMonsData) {
  //  for (const data of traitsMonsData) {/
  // const sidoValue = data.by_sido.buckets
  //   .filter(
  //     (bucket: any) =>
  //       bucket.key.toString() !== region.toString().slice(0, 2)
  //   ) // 제외할 key를 필터링
  //   .reduce(
  //     (sum: number, bucket: any) => sum + bucket.pop_by_sido.value,
  //     0
  //   );
  // const totalValue = data.total_pop_by_sido.value;
  // result.inflowSido.push({
  //   region,
  //   data: [{ key: "inflowSido", value: (sidoValue / totalValue) * 100 }],
  // });
  //}
  //}
  if (traitsMonsData) {
    for (const data of traitsMonsData) {
      const region = data.key;
      const stayDays = normalizedStayDayData(data, stayDiv);
      result.stayDays.push({ region, data: stayDays });
      const stayAvg = normalizedStayDaysAvgData(data);

      result.stayDaysAvg.push({
        region,
        data: [decreasePopDayData, ...stayAvg],
      });
    }
  }

  for (const [key, value] of Object.entries(stayTimesAvgData) as [
    keyof any,
    any
  ]) {
    result.stayTimesAvg.push({
      region: key,
      data: [
        decreasePopTimeData,
        {
          key: Number(key),
          value: convertMinutesToHoursDecimal(value.stay_avg.value),
        },
      ],
    });
  }

  return result;
};

//체류일수별 비율, 평균 체류일수 타시도 거주자 비중
async function stayMonsTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  if (typeof start === "string" && start.length !== 6) return;
  const query: any = {
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
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
          {
            terms: {
              [`${regionType}_CD`]: regionArray,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${regionType}_CD`,
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
          total_pop_by_sido: {
            sum_bucket: {
              buckets_path: "by_sido>pop_by_sido",
            },
          },
          by_stay_total: {
            filter: {
              range: { STAY_DAY: { gte: 1 } },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_stay_1: {
            filter: {
              term: { STAY_DAY: 1 },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          "by_stay_2-7": {
            filter: {
              range: { STAY_DAY: { gte: 2, lte: 7 } },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_stay_8: {
            filter: {
              range: { STAY_DAY: { gte: 8 } },
            },
            aggs: {
              total: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
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
          by_flow: {
            terms: {
              field: `RSDN_${regionType}_CD`,
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
        },
      },
    },
  };
  const validIndices = await getIndexMMList(start, end, "stay_sgg_mons");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });

    return response.body.aggregations.by_region.buckets;
  } catch (error) {
    console.error(error);
  }
}

//체류시간별 특성
async function stayDaysTraits(options: LlpParams) {
  const { start, end, regionArray } = options;
  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const query: any = {
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
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
          {
            terms: {
              [`${regionType}_CD`]: regionArray,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${regionType}_CD`,
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          tot_pop: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
          by_flow: {
            terms: {
              field: `RSDN_${regionType}_CD`,
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
          // by_stay_time: {
          //   terms: {
          //     field: "STAY_TIME_CD",
          //     size: 5,
          //   },
          //   aggs: {
          //     total: {
          //       sum: {
          //         field: "TOT_POPUL_NUM",
          //       },
          //     },
          //   },
          // },
        },
      },
    },
  };
  const validIndices = await getIndexMMList(start, end, "stay_sgg_day");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });

    return response.body.aggregations.by_region.buckets;
  } catch (error) {
    console.error(error);
  }
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
          {
            term: {
              STAY_TIME_CD: 3,
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
      dpar_tot_pop_avg: {
        avg: {
          field: "TOT_POPUL_NUM",
        },
      },
    },
  };
  const validIndices = await getIndexMMList(start, end, "stay_sgg_mons");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });

    return {
      key: "인구감소지역 평균",
      value: response.body.aggregations,
    };
  } catch (error) {
    console.error(error);
  }
}

// 인구감소지역 시간평균
async function decreasePopTime(options: LlpParams) {
  const { start, end, regionArray } = options;

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
  const validIndices = await getIndexMMList(start, end, "stay_sgg_day");
  const response = await searchWithLogging({
    index: validIndices.join(","),
    body: query,
  });

  return {
    key: "인구감소지역 평균",
    value: response.body.aggregations,
  };
}

// 인구감소지역 총 체류인구
async function decreaseStayDateSum(options: LlpParams) {
  const { start, end, regionArray } = options;

  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const query: any = {
    track_total_hits: true,
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
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
        ],
      },
    },
    // aggs: {
      // by_region : {
      //   terms : {
      //     field: `${regionType}_CD`,
      //     include : regionArray,
      //     size: 4,
      //   },
        aggs : {
          popul_sum: {
            sum: {
              field: "TOT_POPUL_NUM"
            }
          }
      //   },
      // },
    },
  };
  const validIndices = await getIndexMMList(start, end, "stay_sgg_mons");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    return response.body.aggregations;
  } catch (error) {
    console.error(error);
  }
}

//주민등록인구
async function residData(options: LlpParams) {
  const { start, end, regionArray } = options;

  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            terms: {
              [`${regionType}_CD`]: regionArray,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${regionType}_CD`,
          size: 4,
        },
        aggs: {
          popul_sum: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
          decrease_resid: {
            filter: {
              term: {
                POPUL_DCRS_RGN_DIV_CD: 1,
              },
            },
            aggs: {
              popul_avg: {
                avg: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };
  const validIndices = await getIndexYList(start, end, "resid_sgg_sex_age");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    return response.body.aggregations.by_region.buckets;
  } catch (error) {
    console.error(error);
  }
}

// 인구감소지역 주민등록인구 집계
async function residDatePopSum(options:LlpParams) {
  const { start, end, regionArray } = options;

  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          }
        ],
      },
    },
    // aggs: {
    //   by_region : {
    //     terms : {
    //       [`${regionType}_CD`] : regionArray
    //     },
        aggs : {
          popul_sum: {
            sum: {
              field: "TOT_POPUL_NUM"
            }
          }
      //   },
      // },
    },
  };
  const validIndices = await getIndexYList(start, end, "resid_sgg_sex_age");
  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    return response.body.aggregations;
  } catch (error) {
    console.error(error);
  }
}

//평균체류시간
async function stayTimesAvg(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isSido = regionArray[0].length === 2;

  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";
  const query: any = {
    track_total_hits: true,
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

  try {
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    return response.body.aggregations.by_cd.buckets;
  } catch (error) {
    console.error(error);
  }
}

// 숙박일수 비율
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

  // let results = await regionAggregation(query, regionArray, indexs, "ldgmt");

  // return results;
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