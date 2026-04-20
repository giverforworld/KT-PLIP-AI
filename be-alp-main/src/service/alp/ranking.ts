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
  transformNationRegionArray,
} from "@/utils/makeQueryFilter";
import {
  calcMonthToDate,
  calculateDates,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { getIndexCompareYList } from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { normalizedDayData } from "@/helpers/normalized/normalizedData";
import { getHolidays } from "@/utils/holidays";
import { getTotalDays } from "@/helpers/normalized/normalizedALPData";
import { getChangedRegion } from "@/utils/changedRegionCache";
import { mergeDataByRanking } from "@/helpers/mergeDataByRegion";

export async function alpRanking(options: AlpRankParams) {
  //기준지역, 비교지역에 읍면동이 있으면 시군구 랭킹 X
  const existAdm = options.regionArray.find((region) => region.length === 8);

  //opensearh데이터 정규화
  const result: NormalizedObj = {
    sgg: [],
    adm: [],
  };
  const [sggCompare, admCompare] = await Promise.all([
    rankingComparePeriod(options, "SGG"),
    rankingComparePeriod(options, "ADM"),
  ]);
  if (!existAdm) {
    const sggResult = normalized(sggCompare, options);
    const filteredSggResult = sggResult.filter(item => item.data.length !== 2);
    result.sgg.push(...filteredSggResult);
  }

  const admResult = normalized(admCompare, options);
  const filteredAdmResult = admResult.filter(item => item.data.length !== 2);
  result.adm.push(...filteredAdmResult);
  return result;
}

const normalized = (compareResult: any, options: AlpRankParams) => {
  const result: NormalizedData[] = [];
  const startTotalDays = getTotalDays(options.start, options.end);

  compareResult.forEach((data: any) => {
    const regionResult: NormalizedChartData[] = [];
    const region = data.key;
    const day = normalizedDayData(
      data.current_daily.daily_population.buckets,
      false
    );
    regionResult.push(...day);

    data.popul_by_year.buckets.forEach((item: any) => {
      regionResult.push({
        key: item.key,
        value: item.popul_sum.value / (startTotalDays * 24),
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
  options: AlpRankParams,
  regionType: string
) {
  const {
    start,
    end,
    regionArray,
    patternArray,
    sexArray,
    dayArray,
    isGen,
    ageArray,
  } = options;
  const existAdm = options.regionArray.find((region) => region.length === 8);
  if (existAdm && regionType === "SGG") {
    return null;
  }
  const { lastYear } = calculateDates(start);
  const convertDate = getStartEndDate(lastYear, start);
  const startStr = formatDateToYYYYMMDD(convertDate.startDate);
  const endStr = formatDateToYYYYMMDD(convertDate.endDate);
  const holidays = await getHolidays(startStr, endStr);
  const convertLastYear = calcMonthToDate(lastYear);
  const changeRegion = await getChangedRegion("sido");
  const addOneYear = (baseYm: string) => {
    const year = parseInt(baseYm.slice(0, 4), 10);
    const month = parseInt(baseYm.slice(4, 6), 10);
    const newYear = year + 1;
    return `${newYear}${month.toString().padStart(2, "0")}`;
  };

  const sumScripts = sumScript(sexArray, ageArray, isGen);
  const regionMap: {
    [key: string]: {
      codes: string[];
      index: string;
    }
  } = {
    region: {
      codes: [],
      index: (await (getIndexCompareYList(start, end, "native_time_nation_day"))).join(",")
    },
  }

  regionArray.forEach((region) => {
    const regionCode = Number(region.slice(0, 2));
    const regionPart = Number(region.slice(2));
    const regionInfo = changeRegion.find((info) => info.SIDO === regionCode);
    

    if (regionInfo && start) {
      const startDate = Number(start.slice(0, 6));

      const baseYm = regionInfo.BASE_YM;
      const baseYmPlusOneYear = Number(addOneYear(baseYm.toString()));

      if (startDate <= baseYmPlusOneYear) {
        const oldRegionCode = regionInfo.OSIDO.toString();
        const checkRegionCode = oldRegionCode + regionPart
        if (region.length === 2 && !regionArray.includes(checkRegionCode)) {
          regionArray.push(oldRegionCode)
        } else if (!regionArray.includes(checkRegionCode)){
          regionArray.push(oldRegionCode + regionPart);
        } else {
          return regionArray;
        }
      }
    }
  });

  let query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          {
            terms: {
              PTRN: patternArray,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
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

  if (start.length === 6) {
    //날짜 필터
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
        from: convertLastYear.start,
        to: convertLastYear.end,
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
        from: convertLastYear.start,
        to: convertLastYear.end,
      },
    ];
  }
 
  //요일 평일 휴일
  query = dayFilter(holidays, dayArray, query, true);
  query.aggs.by_region.terms.order = {
    current_year_popul_sum: "desc",
  };
  query.aggs.by_region.aggs.current_daily.aggs.daily_population.aggs = {
    pop_by_day: {
      ...sumScripts,
    },
  };
  query.aggs.by_region.aggs.popul_by_year.aggs = {
    popul_sum: {
      ...sumScripts,
    },
  };
  query.aggs.by_region.aggs.current_year_popul_sum = { ...sumScripts };

  const regionRange = transformNationRegionArray(regionArray, regionType) || [];
  if (regionRange.length > 1) {
    const boolInFilter = query.query.bool.filter.find((item: any) =>
      item.hasOwnProperty("bool")
    );
    if (boolInFilter) {
      boolInFilter.bool.should.push(...regionRange);
    } else {
      query.query.bool.filter.push({
        bool: {
          should: [regionRange],
          minimum_should_match: 1,
        },
      });
    }
  } else {
    query.query.bool.filter.push(...regionRange);
  }

  const getIndex = (
    await getIndexCompareYList(start, end, `native_time_nation_day`)
  ).join(",");
  try {
    const response = await searchWithLogging({
      index: getIndex,
      body: query,
    });
    const data = response.body.aggregations.by_region.buckets;
    const transData = await mergeDataByRanking(data, regionArray)
    return response.body.aggregations.by_region.buckets;
  } catch (error) {
    console.error(error);
  }
}
function sumScript(
  selectedSex: string[],
  selectedAges: string[],
  isGen: boolean
) {
  const ageMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10"],
    "15": ["15"],
    "20": ["20"],
    "25": ["25"],
    "30": ["30"],
    "35": ["35"],
    "40": ["40"],
    "45": ["45"],
    "50": ["50"],
    "55": ["55"],
    "60": ["60"],
    "65": ["65"],
    "70": ["70"],
    "75": ["75"],
    "80": ["80"],
  };
  const ageGenMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10", "15"],
    "20": ["20", "25"],
    "30": ["30", "35"],
    "40": ["40", "45"],
    "50": ["50", "55"],
    "60": ["60", "65"],
    "70": ["70", "75"],
    "80": ["80"],
  };
  let aggs: Record<string, object> = {};
  const ages = isGen ? ageGenMap : ageMap;

  const scriptParts: string[] = [];
  // 선택된 나이 그룹 순회
  selectedAges.forEach((ageGroup) => {
    if (ages[ageGroup] === undefined) {
      throw new Error(`Invalid age group: ${ageGroup}`);
    }

    // 선택된 성별에 따라 스크립트 생성

    ages[ageGroup].forEach((age) => {
      selectedSex.forEach((sex) => {
        scriptParts.push(
          `(doc.containsKey('${sex}${age}') && doc['${sex}${age}'].size() > 0 ? doc['${sex}${age}'].value : 0.0)`
        );
      });
    });
  });
  // 집계 스크립트 생성

  aggs = {
    sum: {
      script: {
        source: scriptParts.join(" + "), // 모든 스크립트를 합침
        lang: "painless",
      },
    },
  };

  return aggs;
}
