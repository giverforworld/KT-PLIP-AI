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
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { normalizedDayData } from "@/helpers/normalized/normalizedData";
import { generateSexAgeSumScript } from "@/utils/generateScript";
import { getIndexMMList, getIndexYList } from "@/helpers/getIndexList";

export async function llpRanking(options: LlpRankParams) {
  //opensearh데이터 정규화
  const result: NormalizedObj = {
    sgg: [],
  };

  const [monsResult, dayResult, residResult] = await Promise.all([
    stayMonsRanking(options),
    stayDaysTraits(options),
    residData(options),
  ]);
  const admResult = normalized(monsResult, dayResult, residResult, options);

  result.sgg.push(...admResult);
  return result;
}

const normalized = (
  monsResult: any,
  dayResult: any,
  residResult: any,
  options: LlpRankParams
) => {
  const result: NormalizedData[] = [];
  monsResult.forEach((data: any) => {
    const regionResult: NormalizedChartData[] = [];
    const region = data.key;
    const dayData = dayResult.find((item: any) => item.key === region);
    const day = normalizedDayData(dayData.daily_population.buckets);
    regionResult.push(...day);

    regionResult.push({
      key: "stay",
      value: data.current_year_popul_sum.value,
    });

    const residData = residResult.find((item: any) => item.key === region);

    regionResult.push({
      key: "resid",
      value: residData?.current_year_popul_sum.value || 0,
    });

    result.push({
      region,
      data: regionResult,
    });
  });
  return result;
};

async function stayMonsRanking(options: LlpRankParams) {
  const {
    start,
    end,
    regionArray,
    stayDayArray,
    sexArray,
    dayArray,
    isGen,
    ageArray,
  } = options;

  const sumScript = generateSexAgeSumScript(sexArray, ageArray, isGen);
  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const regions = formatAndRemoveDuplicates(regionArray);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            terms: {
              [`SIDO_CD`]: regions,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "SGG_CD",
          size: 10 * regionArray.length,
          order: {
            current_year_popul_sum: "desc",
          },
        },
        aggs: {
          current_year_popul_sum: {
            ...sumScript,
          },
        },
      },
    },
  };

  if (regionType === "SGG") {
    query.query.bool.filter.push({
      term: {
        STAY_TIME_CD: 3,
      },
    });
  }
  // const stayDayFilters = [];

  // if (stayDayArray.length !== 0 && stayDayArray.length !== 3) {
  //   if (stayDayArray.includes(0)) {
  //     // 1-day stay
  //     stayDayFilters.push({ term: { STAY_DAY: 1 } });
  //   }

  //   if (stayDayArray.includes(1)) {
  //     // 2-7 days stay
  //     stayDayFilters.push({
  //       range: {
  //         STAY_DAY: {
  //           gte: 2,
  //           lte: 7,
  //         },
  //       },
  //     });
  //   }

  //   if (stayDayArray.includes(2)) {
  //     // 8 or more days stay
  //     stayDayFilters.push({
  //       range: {
  //         STAY_DAY: {
  //           gte: 8,
  //         },
  //       },
  //     });
  //   }

  //   query.query.bool.should = stayDayFilters;
  // }

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
async function stayDaysTraits(options: LlpRankParams) {
  const {
    start,
    end,
    regionArray,
    stayDayArray,
    sexArray,
    dayArray,
    isGen,
    ageArray,
  } = options;

  const sumScript = generateSexAgeSumScript(sexArray, ageArray, isGen);
  const regionType = regionArray[0].length === 2 ? "SIDO" : "SGG";

  const regions = formatAndRemoveDuplicates(regionArray);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start.slice(0, 6), end.slice(0, 6)),
          {
            terms: {
              [`SIDO_CD`]: regions,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "SGG_CD",
          size: 1000,
          order: { _key: "asc" },
        },
        aggs: {
          daily_population: {
            date_histogram: {
              field: "BASE_YMD",
              calendar_interval: "day",
              order: {
                _key: "asc",
              },
            },
            aggs: {
              pop_by_day: {
                ...sumScript,
              },
            },
          },
        },
      },
    },
  };
  if (regionType === "SGG") {
    query.query.bool.filter.push({
      term: {
        STAY_TIME_CD: 3,
      },
    });
  }
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

//주민등록인구
async function residData(options: LlpRankParams) {
  const {
    start,
    end,
    regionArray,
    stayDayArray,
    sexArray,
    dayArray,
    isGen,
    ageArray,
  } = options;

  const sumScript = generateSexAgeSumScript(sexArray, ageArray, isGen);
  const regions = formatAndRemoveDuplicates(regionArray);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, start, end),
          {
            terms: {
              [`SIDO_CD`]: regions,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "SGG_CD",
          size: 1000,
          order: { _key: "asc" },
        },
        aggs: {
          current_year_popul_sum: {
            ...sumScript,
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

function formatAndRemoveDuplicates(regionArray: string[]): string[] {
  // 숫자에서 앞 2자리만 추출하고 중복을 제거
  const formattedSet = new Set(regionArray.map((region) => region.slice(0, 2))); // 앞 2자리만 남기기 위해 100으로 나누고 내림 처리

  // Set을 배열로 변환하여 반환
  return Array.from(formattedSet);
}
