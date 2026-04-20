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

import { calculateDates } from "@/helpers/convertDate";
import { getIndexCompareYList, getIndexYList } from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  regionAggregation,
  // regionCompareAggregation,
} from "@/utils/chart/regionAggregation";
import { generateResidSexAge, generateSexAge } from "@/utils/generateSexAge";
import {
  normalizedAgeData,
  normalizedBucketData,
  normalizedDayData,
  normalizedSexAgeData,
  normalizedSexData,
} from "@/helpers/normalized/normalizedData";
import { normalizedDayAddResidData } from "@/helpers/normalized/normalizedALPData";
import { searchWithLogging } from "@/lib/searchWithLogiging";

export async function comparativeN(options: AlpParams) {
  const [
    timeResult,
    nativeMonsResult,
    nativeMonthlyResult,
    nativeSubzoneResult,
    residResult,
    residMonthlyResult,
    residSubzoneResult,
    // 상세분석
    regidDetailPopResult,
    regidDetailYearResult,
    extincRegionResult,
    genderAgeResult
  ] = await Promise.all([
    timeAggs(options),
    nativeMons(options),
    nativeMonthly(options),
    nativeSubzone(options),
    residAggs(options),
    residMonthly(options),
    residSubzone(options),
    // 상세분석
    residDetailPop(options),
    residPopByYear(options),
    extincRegion(options),
    genderAge(options)
  ]);

  //opensearh데이터 정규화
  const purposeData = normalized(
    timeResult,
    nativeMonsResult,
    nativeMonthlyResult,
    nativeSubzoneResult,
    residResult,
    residMonthlyResult,
    residSubzoneResult,
    // 상세분석
    regidDetailPopResult,
    regidDetailYearResult,
    extincRegionResult,
    genderAgeResult,
    options
  );
  return purposeData;
}

const normalized = (
  timeResult: any,
  nativeMonsResult: any,
  nativeMonthlyResult: any,
  nativeSubzoneResult: any,
  residResult: any,
  residMonthlyResult: any,
  residSubzoneResult: any,
  // 상세분석
  regidDetailPopResult: any,
  regidDetailYearResult: any,
  extincRegionResult: any,
  genderAgeResult: any,
  options: AlpParams
) => {
  const isMonth = options.start.length === 6;
  const result: NestedNormalizedObj = {
    current: { Avg: [] },
    month: { Avg: [] },
    pday: { Avg: [] },
    psex: { Avg: [] },
    age: { Avg: [] },
    sexAgeRsdn: { Avg: [] },
    sexAgeResid: { Avg: [] },
    subzone: { Avg: [] },
    // 상세분석
    residPop: { Avg: [] },
    residPopYear: { Avg: [] },
    extincRegion: { Avg: [] },
    genderAge: { Avg: [] },
    mostAge: { Avg: [] },
  };

  const nativeTimeMap: Record<number, string> = {
    2: "거주인구 오전 2시",
    14: "거주인구 오후 2시",
  };
  nativeMonthlyResult.forEach((data: any) => {
    const region = data.key;
    const month = normalizedBucketData(data.by_month.buckets, 0);
    result.month["Avg"].push({
      region: region,
      data: month,
    });
  });
  residMonthlyResult.forEach((data: any) => {
    const region = data.key;
    const month = normalizedBucketData(data.by_month.buckets, 1);
    result.month["Avg"].push({
      region: region,
      data: month,
    });
  });
  nativeSubzoneResult.forEach((data: any) => {
    const region = data.key;
    const subzone = normalizedBucketData(data.by_subzone.buckets, 0);
    result.subzone["Avg"].push({
      region: region,
      data: subzone,
    });
  });
  residSubzoneResult.forEach((data: any) => {
    const region = data.key;
    const subzone = normalizedBucketData(data.by_subzone.buckets, 1);
    result.subzone["Avg"].push({
      region: region,
      data: subzone,
    });
  });
  nativeMonsResult.forEach((data: any) => {
    const region = data.key;
    result.current["Avg"].push({
      region: region,
      data: [{ key: "인구", ptrn: 0, value: data.total.value }],
    });

    const pSex = normalizedSexData(data, undefined, 0);
    const pAge = normalizedAgeData(data, undefined, 0);
    result.psex["Avg"].push({
      region: region,
      data: pSex,
    });
    result.age["Avg"].push({
      region: region,
      data: [...pAge, ...pSex],
    });

    const sexAge = normalizedSexAgeData(data);
    result.sexAgeRsdn["Avg"].push({
      region: region,
      data: sexAge,
    });
  });
  // 주민등록인구
  residResult.forEach((data: any) => {
    const region = data.key;
    result.current["Avg"].push({
      region: region,
      data: [{ key: "인구", ptrn: 1, value: data.total.value }],
    });
    const pSex = normalizedSexData(data, undefined, 1);
    const pAge = normalizedAgeData(data, undefined, 1);
    pAge[1].value +=pAge[0].value
    result.psex["Avg"].push({
      region: region,
      data: pSex,
    });
    result.age["Avg"].push({
      region: region,
      data: [...pAge, ...pSex],
    });

    const sexAge = normalizedSexAgeData(data);
    result.sexAgeResid["Avg"].push({
      region: region,
      data: sexAge,
    });
  });

  // 거주 주민 데이터 합치기
  result.current["Avg"] = mergedData(result.current["Avg"]);
  result.month["Avg"] = mergedData(result.month["Avg"]);
  result.psex["Avg"] = mergedData(result.psex["Avg"]);
  result.age["Avg"] = mergedData(result.age["Avg"]);
  result.subzone["Avg"] = mergedData(result.subzone["Avg"]);
  result.subzone["Avg"] = mergedData2(result.subzone["Avg"]);

  timeResult.forEach((data: any) => {
    const region = data.key;

    let dayPtrn: any[] = [];
    const residRegion = result.current["Avg"].find(
      (item) => item.region === region
    );
    const residValue =
      residRegion?.data.find((item) => item.ptrn === 1)?.value || 0;

    data.by_timezn.buckets.forEach((bucket: any) => {
      const key: number = bucket.key === 2 ? 0 : 1;
      const pday =
        bucket.key === 2
          ? normalizedDayData(bucket.by_day.buckets, true, key)
          : normalizedDayAddResidData(
              bucket.by_day.buckets,
              key,
              residValue
            ).flatMap((item: any) => item);
      dayPtrn.push(...pday);
    });

    result.pday["Avg"].push({
      region: region,
      data: dayPtrn,
    });
  });

  // 상세분석
  result.residPop["Avg"].push({
    // region,
    data: regidDetailPopResult
  });
  // });

  result.residPopYear["Avg"].push({
    data: regidDetailYearResult
  });

  result.extincRegion["Avg"].push({
    data: extincRegionResult
  });

  result.genderAge["Avg"].push({
    data: extincRegionResult  
  });

  result.mostAge["Avg"].push({
    data: extincRegionResult
  })
  return result;
};
//pday
async function timeAggs(options: AlpParams) {
  const { start, end, regionArray } = options;

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          {
            term: {
              PTRN: "0",
            },
          },
          {
            terms: {
              TIME: ["2", "14"], // 오전 2시, 오후 2시
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
          by_timezn: {
            terms: {
              field: "TIME",
              size: 2,
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
  return results;
}

//current, sex, age, sexAgeRsdn, subzone
async function nativeMons(options: AlpParams) {
  const { start, end, regionArray } = options;

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];
  const isAdm = regionArray.findIndex((code) => code.length > 6);

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            term: {
              PTRN: "0",
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
          ...generateSexAge(false),
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
    "nativeMons"
  );
  return results;
}
// month
async function nativeMonthly(options: AlpParams) {
  const { start, end, regionArray } = options;

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];
  const { lastYear } = calculateDates(start);

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, lastYear, start),
          {
            term: {
              PTRN: "0",
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
async function nativeSubzone(options: AlpParams) {
  const { start, end, regionArray } = options;
  const isAdm = regionArray.findIndex((code) => code.length > 6);

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
          field: "",
          size: 0,
        },
        aggs: {
          by_subzone: {
            terms: {
              field: "", //하위 행정구역 코드
              size: isAdm ? 1000 : 100,
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

  const results: any[] = [];
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
    if (region.length === 2) regionMap.sido.codes.push(region);
    else if (region.length === 5) regionMap.sgg.codes.push(region);
  });

  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(async ({ codes, field, sub, index }) => {
      if (codes.length) {
        const regionQuery = JSON.parse(JSON.stringify(query));
        regionQuery.query.bool.filter.push({ terms: { [field]: codes } });
        regionQuery.query.bool.filter.push({ term: { PTRN: 0 } });
        regionQuery.aggs.by_region.terms.field = field;
        regionQuery.aggs.by_region.terms.size = codes.length;
        regionQuery.aggs.by_region.aggs.by_subzone.terms.field = sub;

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
  return results;
}
// 주민등록인구 current, sex, age, sexAgeResid, subzone
async function residAggs(options: AlpParams) {
  let { start, end, regionArray } = options;
  if (regionArray[0].slice(0, 2) === '45' && start === '202401') {regionArray[0] = '52'+regionArray[0].slice(2)}
  const isMonth = isValidMonth(start);
  if (!isMonth) return [];

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            terms: {
              RGN_CD: regionArray,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "RGN_CD", //SIDO, SGG, ADM
          size: 4,
        },
        aggs: {
          ...generateResidSexAge(),
        },
      },
    },
  };

  const getIndex = (
    await getIndexYList(start, end, `resid_popul_num_mons`)
  ).join(",");

  // 최종 쿼리 결과 저장
  try {
    const response = await searchWithLogging({
      index: getIndex,
      body: query,
    });
    return response.body.aggregations.by_region.buckets || [];
  } catch (error) {
    console.error(error);
  }
}
// 주민등록인구 subzone
async function residSubzone(options: AlpParams) {
  const { start, end, regionArray } = options;

  const isMonth = isValidMonth(start);
  if (!isMonth) return [];
  const isAdm = regionArray.findIndex((code) => code.length > 6);

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
          by_subzone: {
            terms: {
              field: "",
              size: isAdm ? 1000 : 100,
              order: {
                _key: "asc",
              },
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
  const results: any[] = [];
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
      field: "SIDO_CD",
      sub: "SGG_CD",
      index: (await getIndexYList(start, end, `resid_sgg_sex_age`)).join(","),
    },
    sgg: {
      codes: [],
      field: "SGG_CD",
      sub: "ADMDONG_CD",
      index: (await getIndexYList(start, end, `resid_admdong_sex_age`)).join(
        ","
      ),
    },
  };

  // 지역 코드를 길이에 따라 분류 읍면동 제외
  regionArray.forEach((region) => {
    if (region.length === 2) regionMap.sido.codes.push(region);
    else if (region.length === 5) regionMap.sgg.codes.push(region);
  });

  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(async ({ codes, field, sub, index }) => {
      if (codes.length) {
        const regionQuery = JSON.parse(JSON.stringify(query));
        regionQuery.query.bool.filter.push({ terms: { [field]: codes } });
        regionQuery.aggs.by_region.terms.field = field;
        regionQuery.aggs.by_region.terms.size = codes.length;
        regionQuery.aggs.by_region.aggs.by_subzone.terms.field = sub;

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
  return results;
}
// 주민등록인구 month
async function residMonthly(options: AlpParams) {
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
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };
  const getIndex = (
    await getIndexCompareYList(start, end, `resid_admdong_sex_age`)
  ).join(",");
  const indexs = {
    sido: getIndex,
    sgg: getIndex,
    adm: getIndex,
  };
  // 최종 쿼리 결과 저장
  let results = await regionAggregation(query, regionArray, indexs, "resid");
  return results;
}

function mergedData(data: NormalizedData[]) {
  const mergedData = data.reduce<NormalizedData[]>((acc, { region, data }) => {
    let existing = acc.find((item) => item.region === region);
    if (existing) {
      existing.data.push(...data);
    } else {
      acc.push({ region, data: [...data] });
    }
    return acc;
  }, []);
  return mergedData;
}
function mergedData2(data: NormalizedData[]): NormalizedData[] {
  return data.map(regionItem => {
    const ptrn0 = regionItem.data.filter(d => d.ptrn === 0);
    const ptrn1 = regionItem.data.filter(d => d.ptrn === 1);

    const newPtrn1: NormalizedChartData[] = ptrn0.map((d, i) => ({
      key: d.key,
      value: ptrn1[i]?.value ?? 0,
      ptrn: 1
    }))
    return {
      ...regionItem,
      data: [...ptrn0, ...newPtrn1]
    }
  });
}

//  주민등록인구 상세분석
async function residDetailPop(options: AlpParams) {
  let {start, end, regionArray} = options;
  const region = regionArray[0];
  if (start.length > 6) {start = start.slice(0, 6);}
  
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              // RGN_CD: getGteLteByRegion(region)
              RGN_CD: getGteLteByRegion(start === '202401' && region.slice(0, 2) === '45' ? '52'+region.slice(2) : region)
            }
          },
          {
            term: {
              BASE_YM: start
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: "RGN_CD",
          size: 100,
          order: {
            tot: "desc"
          }
        },
        aggs: {
          tot: {
            sum: {
              field: "TOT_POPUL_NUM"
            }
          }
        }
      }
    }
  }
  const index = `resid_popul_num_mons_${start.slice(0, 4)}`;

  let results: any = [];
  try {
    const response = await searchWithLogging({
      index: index,
      body: query,
    });
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
  return results;
}

// 연도별 주민등록인구
async function residPopByYear(options: AlpParams) {
  let {start, end, regionArray} = options;
  const region = regionArray[0];
  if (start.length > 6) {start = start.slice(0, 6);}
  let index = '';
  let query = {};

  const union: any = {
    '41110' : ['41111', '41113', '41115', "41117"], 
    '41130' : ["41131", "41133", "41135"], 
    '41170' : ["41171", "41173"], 
    '41190' : ["41192", "41194", "41196"], 
    '41270' : ["41271", "41273"], 
    '41280' : ["41281", "41285", "41287"], 
    '41460' : ["41461", "41463", "41465"]
  };

  let results: any = [];
  if (region.length === 2) {

    // 2022년 강원, 2022, 2023 전북 추가
    if (region === '51' || region === '52') {
      let query3 = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                range: {
                  SGG_CD: getGWGB(region)
                }
              },
              {
                terms: {
                  BASE_YM: [202312, 202212]
                }
              }
            ]
          }
        },
        aggs: {
          by_year: {
            terms: {
              field: "BASE_YM",
              size: 13,
              order: {
                _key: "asc"
              }
            },
            aggs: {
              tot: {
                sum: {
                  field: "TOT_POPUL_NUM"
                }
              }
            }
          }
        }
      }
      // index = `resid_sgg_sex_age_2023,resid_sgg_sex_age_2022,`;
      const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
      index = (await getIndexYList(tenYearsAgo, end, `resid_sgg_sex_age`)).join(",");
      
      try {
        const response = await searchWithLogging({
          index: index,
          body: query3,
        });
        results.push(...(response.body.aggregations.by_year.buckets || []));
      } catch (error) {
        console.error(error);
      } 
    }
    let query1 = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              range: {
                SGG_CD: getGteLteByRegion(region+'000')
              }
            },
            {
              terms: {
                BASE_YM: get10Years(Number(start.slice(0, 4)))
              }
            }
          ]
        }
      },
      aggs: {
        by_year: {
          terms: {
            field: "BASE_YM",
            size: 13,
            order: {
              _key: "asc"
            }
          },
          aggs: {
            tot: {
              sum: {
                field: "TOT_POPUL_NUM"
              }
            }
          }
        }
      }
    }
    // index = `resid_sgg_sex_age_2025,resid_sgg_sex_age_2024,resid_sgg_sex_age_2023,resid_sgg_sex_age_2022`;
    const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
    index = (await getIndexYList(tenYearsAgo, end, `resid_sgg_sex_age`)).join(",");

    try {
      const response = await searchWithLogging({
        index: index,
        body: query1,
      });
      results.push(...(response.body.aggregations.by_year.buckets || []));
    } catch (error) {
      console.error(error);
    }
    // 2024는 통합시군구가 없음
    if (start.slice(0, 4) === '2025' && region === '41') {
      let query2 = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                terms: {
                  SGG_CD: ['41111', '41113', '41115', "41117","41131", "41133", "41135","41171", "41173","41192", "41194", "41196","41271", "41273","41281", "41285", "41287","41461", "41463", "41465" ]
                }
              },
              {
                terms: {
                  BASE_YM: [202412]
                }
              }
            ]
          }
        },
        aggs: {
          by_year: {
            terms: {
              field: "BASE_YM",
              size: 13,
              order: {
                _key: "asc"
              }
            },
            aggs: {
              tot: {
                sum: {
                  field: "TOT_POPUL_NUM"
                }
              }
            }
          }
        }
      }
      index = `resid_sgg_sex_age_2024`;
  
      try {
        const response = await searchWithLogging({
          index: index,
          body: query2,
        });
        results.push(...(response.body.aggregations.by_year.buckets || []));
        results[2].tot.value += results[3].tot.value;
        results.pop();
      } catch (error) {
        console.error(error);
      } 
    }

    return results;
  }
  
  else if (region.length === 5) {
    let regionArr = [];

    // 2022년 강원, 2022, 2023 전북 추가
    if (region.slice(0, 2) === '51' || region.slice(0, 2) === '52') {
      let query3 = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                range: {
                  SGG_CD: getGWGB(region)
                }
              },
              {
                terms: {
                  BASE_YM: [202312, 202212]
                }
              }
            ]
          }
        },
        aggs: {
          by_year: {
            terms: {
              field: "BASE_YM",
              size: 13,
              order: {
                _key: "asc"
              }
            },
            aggs: {
              tot: {
                sum: {
                  field: "TOT_POPUL_NUM"
                }
              }
            }
          }
        }
      }
      // index = `resid_sgg_sex_age_2023,resid_sgg_sex_age_2022,`;
      const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
      index = (await getIndexYList(tenYearsAgo, end, `resid_sgg_sex_age`)).join(",");
  
      try {
        const response = await searchWithLogging({
          index: index,
          body: query3,
        });
        results.push(...(response.body.aggregations.by_year.buckets || []));
      } catch (error) {
        console.error(error);
      } 
    }
    if (union[region]) {regionArr = union[region]}
    else {regionArr.push(region)}

    const hwasungRegions = ["41591", "41593", "41595", "41597"]
    let checkday = Number(start.slice(0, 6))
    let baseYm = get10Years(Number(start.slice(0, 4)))
    if (checkday < 202612 && regionArr.some((r: string) => hwasungRegions.includes(r)))  {
      baseYm = [checkday.toString()]
    }

    query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                SGG_CD: regionArr
              }
            },
            {
              terms: {
                BASE_YM: baseYm
              }
            }
          ]
        }
      },
      aggs: {
        by_year: {
          terms: {
            field: "BASE_YM",
            size: 13,
            order: {
              _key: "asc"
            }
          },
          aggs: {
            tot: {
              sum: {
                field: "TOT_POPUL_NUM"
              }
            }
          }
        }
      }
    }

    index = `resid_sgg_sex_age_2025,resid_sgg_sex_age_2024,resid_sgg_sex_age_2023,resid_sgg_sex_age_2022`;
    const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
    index = (await getIndexYList(tenYearsAgo, end, `resid_sgg_sex_age`)).join(",");
    
  }
  else if (region.length === 8) {
    
    let regionArr: string[] = [];
    // 2022년 강원, 2022, 2023 전북 추가
    if (region.slice(0, 2) === '51' || region.slice(0, 2) === '52') {
      let preReg = region.slice(0, 2) === '51' ? '42' : '45';
      
      let query3 = {
        size: 0,
        query: {
          bool: {
            filter: [
              {
                term: {
                  ADMDONG_CD: preReg+region.slice(2)
                }
              },
              {
                terms: {
                  BASE_YM: [202212, 202312]
                }
              }
            ]
          }
        },
        aggs: {
          by_year: {
            terms: {
              field: "BASE_YM",
              size: 13,
              order: {
                _key: "asc"
              }
            },
            aggs: {
              tot: {
                sum: {
                  field: "TOT_POPUL_NUM"
                }
              }
            }
          }
        }
      }
      // index = `resid_admdong_sex_age_2023,resid_admdong_sex_age_2022,`;
      const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
      index = (await getIndexYList(tenYearsAgo, end, `resid_admdong_sex_age`)).join(",");
  
      try {
        const response = await searchWithLogging({
          index: index,
          body: query3,
        });
        results.push(...(response.body.aggregations.by_year.buckets || []));
      } catch (error) {
        console.error(error);
      } 
    }
    const hwasungAmdMap: string[] = [
      "41591250", "41591253", "41591256", "41591310", "41591320", "41591330", "41591340", "41591350", "41591360", "41591510",
      "41593250", "41593310", "41593320", "41593330", "41593510", 
      "41595510", "41595520", "41595530", "41595540", "41595550",
      "41597510", "41597520", "41597530", "41597540", "41597550", "41597560", "41597570", "41597580", "41597590"
    ]
    let checkday = Number(start.slice(0, 6))
    let baseYm = get10Years(Number(start.slice(0, 4)))
    regionArr.push(region)
    if (checkday < 202612 && regionArr.some((r: string) => hwasungAmdMap.includes(r)) ) {
      baseYm = [checkday.toString()]
    }

    query = {
      size: 0,
      query: {
        bool: {
          filter: [
            {
              terms: {
                ADMDONG_CD: regionArr
              }
            },
            {
              terms: {
                BASE_YM: baseYm
              }
            }
          ]
        }
      },
      aggs: {
        by_year: {
          terms: {
            field: "BASE_YM",
            size: 13,
            order: {
              _key: "asc"
            }
          },
          aggs: {
            tot: {
              sum: {
                field: "TOT_POPUL_NUM"
              }
            }
          }
        }
      }
    }

    // index = `resid_admdong_sex_age_2025,resid_admdong_sex_age_2024,resid_admdong_sex_age_2023,resid_admdong_sex_age_2022`
    const tenYearsAgo = start.length === 6 ? (Number(start)-1000).toString() : (Number(start)-100000).toString()
    index = (await getIndexYList(tenYearsAgo, end, `resid_admdong_sex_age`)).join(",");
  }

  // let results: any = [];
  try {
    const response = await searchWithLogging({
      index: index,
      body: query,
    });
    results.push(...(response.body.aggregations.by_year.buckets || []));
  } catch (error) {
    console.error(error);
  }
  return results;
}

// 지방소멸위험지수
async function extincRegion(options: AlpParams) {
  let {start , regionArray} = options;

  const region = regionArray[0];
  if (start.length > 6) {start = start.slice(0, 6);}
  
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              // RGN_CD: getGteLteByRegion(region)
              RGN_CD: getGteLteByRegion(start === '202401' && region.slice(0, 2) === '45' ? '52'+region.slice(2) : region)
            }
          },
          {
            term: {
              BASE_YM: start
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: 'RGN_CD',
          size: 100,
        },
        aggs: {
          female_tot: {
            sum: {
              field: 'FEML_TOT_POPUL_NUM'
            }
          },
          male_tot: {
            sum: {
              field: 'MALE_TOT_POPUL_NUM'
            }
          },
          tot_20_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_00_POPUL_NUM'].value + doc['FEML_00_POPUL_NUM'].value + doc['MALE_05_POPUL_NUM'].value + doc['FEML_05_POPUL_NUM'].value +
                doc['MALE_10_POPUL_NUM'].value + doc['FEML_10_POPUL_NUM'].value + doc['MALE_15_POPUL_NUM'].value + doc['FEML_15_POPUL_NUM'].value
              `}
            }
          },
          tot_35_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_20_POPUL_NUM'].value + doc['FEML_20_POPUL_NUM'].value + doc['MALE_25_POPUL_NUM'].value + doc['FEML_25_POPUL_NUM'].value +
                doc['MALE_30_POPUL_NUM'].value + doc['FEML_30_POPUL_NUM'].value + doc['MALE_35_POPUL_NUM'].value + doc['FEML_35_POPUL_NUM'].value
              `}
            }
          },
          tot_65_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_40_POPUL_NUM'].value + doc['FEML_40_POPUL_NUM'].value + doc['MALE_45_POPUL_NUM'].value + doc['FEML_45_POPUL_NUM'].value +
                doc['MALE_50_POPUL_NUM'].value + doc['FEML_50_POPUL_NUM'].value + doc['MALE_55_POPUL_NUM'].value + doc['FEML_55_POPUL_NUM'].value+ doc['MALE_60_POPUL_NUM'].value + doc['FEML_60_POPUL_NUM'].value
              `}
            }
          },
          tot_80_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_65_POPUL_NUM'].value + doc['FEML_65_POPUL_NUM'].value + doc['MALE_70_POPUL_NUM'].value + doc['FEML_70_POPUL_NUM'].value +
                doc['MALE_75_POPUL_NUM'].value + doc['FEML_75_POPUL_NUM'].value + doc['MALE_80_POPUL_NUM'].value + doc['FEML_80_POPUL_NUM'].value
              `}
            }
          },
          female_index: {
            sum: {
              script: {
                source: `
                doc['FEML_20_POPUL_NUM'].value + doc['FEML_25_POPUL_NUM'].value + doc['FEML_30_POPUL_NUM'].value + doc['FEML_35_POPUL_NUM'].value
              `}
            }
          }
        }
      }
    }
  }
  const index = `resid_popul_num_mons_${start.slice(0, 4)}`;
  let results:any = [];
  try {
    const response = await searchWithLogging({
      index: index,
      body: query,
    });
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
  return results;
}

// 성별/연령대별 현황
async function genderAge(options: AlpParams) {
}

const get10Years = (start: number) => {
  let result = [];
  for (let i = 1; i < 11; i++) {
    result.push(start-i+'12');
  }
  return result;
}

const get10YearsIndex = (index: string, start: number) => {
  let result = [];
  for (let i = 1; i < 11; i++) {
    result.push(`${index}${start-i}`);
  }
  return result.join(',');
};

const getGteLteByRegion = (region: string) => {
  const len = region.length;
  const result = len === 2
    ? {
      gte: 0, lte: 55
    }
    : len === 5 
    ? {
      gte: Number(region.slice(0, 2) + '000'), lte: Number(region.slice(0, 2) + '999')
    }
    : { gte: Number(region.slice(0, 5) + '000'), lte: Number(region.slice(0, 5) + '999')}
    return result;
}
const getGWGB = (region: string) => {
  let reg = '';
  if (region.slice(0, 2) === '51') {
    reg = region.replace('51', '42');
  } else if (region.slice(0, 2) === '52') {
    reg = region.replace('52', '45');
  } else { reg = region }
  
  const len = reg.length;
  const result = len === 2
    ? {
      gte: Number(reg.slice(0, 2) + '000'), lte: Number(reg.slice(0, 2) + '999')
    }
    : len === 5 
    ? {
      gte: Number(reg), lte: Number(reg)
    }
    : { gte: Number(reg), lte: Number(reg)}
    return result;
}