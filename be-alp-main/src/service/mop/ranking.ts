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
  dateRange,
  dayFilter,
  transformMopRegionArray,
} from "@/utils/makeQueryFilter";
import {
  calcMonthToDate,
  calculateDates,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { getIndexCompareMMList } from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { normalizedDayData } from "@/helpers/normalized/normalizedData";
import { generateSexAgeSumScript } from "@/utils/generateScript";
import { getHolidays } from "@/utils/holidays";
import { mergeDataByRegion } from "@/helpers/mergeDataByRegion";

export async function mopRanking(options: MopRankParams) {
  //기준지역, 비교지역에 읍면동이 있으면 시군구 랭킹 X
  const existAdm = options.regionArray.find((region) => region.length === 8);

  //opensearh데이터 정규화
  const result: NormalizedObj = {
    sgg: [],
    adm: [],
  };
  if (!existAdm) {
    const [compareResult] = await Promise.all([
      rankingComparePeriod(options, "SGG"),
    ]);
    const sggResult = normalized(compareResult, options);
    result.sgg.push(...sggResult);
  }
  const [compareResult] = await Promise.all([
    rankingComparePeriod(options, "ADMNS_DONG"),
  ]);

  const admResult = normalized(compareResult, options);
  result.adm.push(...admResult);
  return result;
}

const normalized = (compareResult: any, options: MopParams) => {
  const result: NormalizedData[] = [];
  compareResult.forEach((data: any) => {
    const regionResult: NormalizedChartData[] = [];
    const region = data.key;
    const day = normalizedDayData(data.current_daily.daily_population.buckets);
    regionResult.push(...day);

    data.popul_by_year.buckets.forEach((item: any) => {
      regionResult.push({
        key: item.key,
        value: item.popul_sum.value,
      });
    });

    result.push({
      region,
      data: regionResult,
    });
  });
  return result;
};

//전년동기
async function rankingComparePeriod(
  options: MopRankParams,
  regionType: string
) {
  const {
    start,
    end,
    regionArray,
    isInflow,
    includeSame,
    sexArray,
    dayArray,
    isGen,
    ageArray,
  } = options;

  const { lastYear } = calculateDates(start);
  const convertDate = getStartEndDate(lastYear, start);
  const startStr = formatDateToYYYYMMDD(convertDate.startDate);
  const endStr = formatDateToYYYYMMDD(convertDate.endDate);
  const holidays = await getHolidays(startStr, endStr);

  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  const regionRange =
    (await transformMopRegionArray(regionArray, regionType, isInflow)) || [];
  const sumScript = generateSexAgeSumScript(sexArray, ageArray, isGen);

  let query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          {
            bool: {
              should: [...regionRange],
              minimum_should_match: 1,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: `${regionCD}_${regionType}_CD`,
          size: 10,
          order: { _key: "asc" },
        },
        aggs: {
          current_daily: {
            filter: {},
            aggs: {
              daily_population: {
                date_histogram: {
                  field: "BASE_YMD",
                  calendar_interval: "day",
                  order: {
                    _key: "asc",
                  },
                },
                aggs: {},
              },
            },
          },
          popul_by_year: {
            date_range: {
              field: "BASE_YMD",
              ranges: [],
            },
            aggs: {},
          },
        },
      },
    },
  };

  if (!includeSame) {
    query.query.bool.must_not = [
      { terms: { [`${flowCD}_${regionType}_CD`]: regionArray } },
    ];
  }
  if (options.isPurpose && options.moveCdArray.length < 7) {
    query.query.bool.filter.push({
      terms: {
        MOV_PRPS_CD: options.moveCdArray,
      },
    });
  } else if (!options.isPurpose && options.moveCdArray.length < 8) {
    query.query.bool.filter.push({
      terms: {
        MOV_WAY_CD: options.moveCdArray,
      },
    });
  }
  //날짜 필터
  if (start.length === 6) {
    const convertStart = calcMonthToDate(start);
    query.query.bool.filter.push(dateRange(false, lastYear, end));

    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(false, lastYear, lastYear),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.current_daily.filter = {
      range: {
        BASE_YMD: {
          gte: convertStart.start,
          lte: convertStart.end,
        },
      },
    };
    query.aggs.by_region.aggs.popul_by_year.date_range.ranges = [
      {
        key: "current",
        from: convertStart.start,
        to: convertStart.end,
      },
      {
        key: "lastYear",
        from: lastYear + convertStart.start.substring(6, 8),
        to: lastYear + convertStart.end.substring(6, 8),
      },
    ];
  } else {
    // query.query.bool.filter.push({
    //   range: {
    //     BASE_YMD: {
    //       gte: lastYear + start.substring(6, 8),
    //       lte: end,
    //     },
    //   },
    // });
    query.query.bool.filter.push(
      dateRange(false, lastYear + start.substring(6, 8), end)
    );

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
    query.aggs.by_region.aggs.current_daily.filter = {
      range: {
        BASE_YMD: {
          gte: start,
          lte: end,
        },
      },
    };
    query.aggs.by_region.aggs.popul_by_year.date_range.ranges = [
      {
        key: "current",
        from: start,
        to: end,
      },
      {
        key: "lastYear",
        from: lastYear + start.substring(6, 8),
        to: lastYear + end.substring(6, 8),
      },
    ];
  }
  //요일 평일 휴일
  query = dayFilter(holidays, dayArray, query);
  query.aggs.by_region.terms.order = {
    current_year_popul_sum: "desc",
  };
  query.aggs.by_region.aggs.current_daily.aggs.daily_population.aggs = {
    pop_by_day: {
      ...sumScript,
    },
  };
  query.aggs.by_region.aggs.popul_by_year.aggs = {
    popul_sum: {
      ...sumScript,
    },
  };
  query.aggs.by_region.aggs.current_year_popul_sum = { ...sumScript };

  // 개발용 kt compareM으로 변경하기
  // 존재하는 인덱스만 필터링
  const validIndicesSgg = await getIndexCompareMMList(
    start,
    end,
    `native_${options.isPurpose ? "prps" : "way"}_age_sgg_day`,
    false
  );
  const validIndicesAdm = await getIndexCompareMMList(
    start,
    end,
    `native_${options.isPurpose ? "prps" : "way"}_age_admdong_day`,
    false
  );

  const indexs: Record<string, string> = {
    SGG: validIndicesSgg.join(","),
    ADMNS_DONG: validIndicesAdm.join(","),
  };
  // console.log(
  //   util.inspect(query, {
  //     showHidden: false,
  //     depth: null,
  //     colors: true,
  //   })
  // );
  const isAMD = regionArray.some(str => str.length > 5);
  try {
    const response = await searchWithLogging({
      index: indexs[isAMD ? regionType : 'SGG'],
      body: query,
    });

    // console.log(
    //   util.inspect(response.body.aggregations, {
    //     showHidden: false,
    //     depth: null,
    //     colors: true,
    //   })
    // );

    // const updateData = response.body.aggregations.by_region.buckets.map(
    //   ({ key, popul_by_year }: any) => ({ key, popul_by_year })
    // );

    // const results = await mergeDataByRegion(updateData, regionArray, true);

    // console.log(
    //   util.inspect(results, {
    //     showHidden: false,
    //     depth: null,
    //     colors: true,
    //   })
    // );

    let results = response.body.aggregations.by_region.buckets;

    // results = await mergeDataByRegion(results, regionArray);
    return results;
    // return response.body.aggregations.by_region.buckets;
  } catch (error) {
    console.error(error);
  }
}
