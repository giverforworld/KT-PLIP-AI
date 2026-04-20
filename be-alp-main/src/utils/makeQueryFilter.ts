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
  calcMonthToDate,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { getCompareRegionMap } from "@/helpers/mergeDataByRegion";

export function dateRange(isMonth: boolean, start: string, end: string) {
  //월데이터 아닌데 월별일 경우 일자로 변경해서 조회
  if (!isMonth && typeof start === "string" && start.length <= 6) {
    const convertStartDate = calcMonthToDate(start);
    const convertEndDate = calcMonthToDate(end);
    start = convertStartDate.start;
    end = convertEndDate.end;
  } else if (isMonth && typeof start === "string" && start.length === 8) {
    start = start.substring(0, 6);
    end = start.substring(0, 6);
  }

  return {
    range: {
      [isMonth ? "BASE_YM" : "BASE_YMD"]: {
        gte: start,
        lte: end,
      },
    },
  };
}

export function regionRange(
  regionCodes: string[],
  field: string
): Record<string, any> {
  const rangeQueries = regionCodes.map((code) => ({
    range: {
      [field]: {
        gte: parseInt(code) * 1000,
        lte: (parseInt(code) + 1) * 1000 - 1,
      },
    },
  }));

  return {
    bool: {
      should: rangeQueries,
    },
  };
}
function convertHolidayFilter(holidays: string[], isAlp: boolean = false) {
  //개발용 kt용 수정하기
  // return {
  //   should: [
  //     {
  //       terms: {
  //         DOW_CD: [5, 6],
  //       },
  //     },
  //     {
  //       terms: {
  //         BASE_YMD: holidays,
  //       },
  //     },
  //   ],
  // };
  return {
    should: [
      {
        terms: {
          [isAlp ? "DOW" : "DOW_CD"]: [1, 7],
        },
      },
      {
        terms: {
          BASE_YMD: holidays,
        },
      },
    ],
  };
}
function convertWeekdayFilter(holidays: string[], isAlp: boolean = false) {
  //개발용 kt용 수정하기
  // return {
  //   filter: {
  //     range: { DOW_CD: { gte: 0, lte: 4 } },
  //   },
  //   must_not: [
  //     {
  //       terms: {
  //         BASE_YMD: holidays,
  //       },
  //     },
  //   ],
  // };
  return {
    filter: {
      range: { [isAlp ? "DOW" : "DOW_CD"]: { gte: 2, lte: 6 } },
    },
    must_not: [
      {
        terms: {
          BASE_YMD: holidays,
        },
      },
    ],
  };
}

export function dayFilter(
  holidays: string[],
  dayArray: number[],
  query: any,
  isAlp = false
) {
  //요일, 평일/휴일
  // 평일(8)과 휴일(9) 모두 선택된 경우
  if (dayArray.includes(8) && dayArray.includes(9)) {
    return query;
  } else {
    if (dayArray.includes(8)) {
      //평일
      const dayFilter = convertWeekdayFilter(holidays, isAlp);
      query.query.bool.filter.push(dayFilter.filter);
      query.query.bool.must_not = dayFilter.must_not;
    }
    if (dayArray.includes(9)) {
      //휴일
      const dayFilter = convertHolidayFilter(holidays, isAlp);
      const boolInFilter = query.query.bool.filter.find((item: any) =>
        item.hasOwnProperty("bool")
      );
      if (boolInFilter) {
        boolInFilter.bool.should.push(...dayFilter.should);
      } else {
        query.query.bool.filter.push({ bool: dayFilter });
      }
    }
  }
  if (!dayArray.includes(8) && !dayArray.includes(9)) {
    //개발용 kt용 수정하기
    //요일 값 달라서
    // dayArray = dayArray.map((day) => (day === 1 ? 6 : day - 2));
    //
    const dayFilter = convertToRangeOrTermsFilter(
      dayArray,
      isAlp ? "DOW" : "DOW_CD"
    );
    query.query.bool.filter.push(dayFilter);
  }
  return query;
}

export function getWeekFilters(holidays: string[], isAlp = false) {
  //개발용 kt용
  return {
    filters: {
      weekday: {
        bool: {
          filter: [
            {
              range: { [isAlp ? "DOW" : "DOW_CD"]: { gte: 2, lte: 6 } },
            },
          ],
          must_not: [
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
      weekend: {
        bool: {
          should: [
            {
              terms: {
                [isAlp ? "DOW" : "DOW_CD"]: [1, 7],
              },
            },
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
    },
  };
}
export function getWeekSidoFilters(holidays: string[]) {
  return {
    filters: {
      weekday: {
        bool: {
          filter: [
            {
              // range: { DOW_CD: { gte: 0, lte: 4 } },
              range: { DOW: { gte: 2, lte: 6 } },
            },
          ],
          must_not: [
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
      weekend: {
        bool: {
          should: [
            {
              terms: {
                // DOW_CD: [5, 6],
                DOW: [1, 7],
              },
            },
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
    },
  };
}
export function getWeekAbbFilters(holidays: string[]) {
  return {
    filters: {
      weekday: {
        bool: {
          filter: [
            {
              range: { DOW: { gte: 2, lte: 6 } },
            },
          ],
          must_not: [
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
      weekend: {
        bool: {
          should: [
            {
              terms: {
                DOW: [1, 7],
              },
            },
            {
              terms: {
                BASE_YMD: holidays,
              },
            },
          ],
        },
      },
    },
  };
}
export function convertToRangeOrTermsFilter(
  timeznArray: number[],
  fieldName: string
) {
  const { ranges, terms } = splitContinuousRanges(timeznArray);

  const filters = [];

  // range 필터 생성
  for (const range of ranges) {
    filters.push({ range: { [fieldName]: range } });
  }

  // terms 필터 생성
  if (terms.length > 0) {
    filters.push({ terms: { [fieldName]: terms } });
  }

  // 필터가 하나일 때는 단일 객체를, 여러 개일 때는 bool 필터로 반환
  return filters.length === 1 ? filters[0] : { bool: { should: filters } };
}
function splitContinuousRanges(arr: number[]): {
  ranges: { gte: number; lte: number }[];
  terms: number[];
} {
  arr.sort((a, b) => a - b);
  const ranges = [];
  let terms = [];
  let start = arr[0];
  let end = arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === end + 1) {
      end = arr[i];
    } else {
      if (start !== end) {
        ranges.push({ gte: start, lte: end });
      } else {
        terms.push(start);
      }
      start = arr[i];
      end = arr[i];
    }
  }

  // 마지막 그룹 추가
  if (start !== end) {
    ranges.push({ gte: start, lte: end });
  } else {
    terms.push(start);
  }

  return { ranges, terms };
}
function formatDate(date: string): string {
  if (typeof date !== "string") {
    throw new Error("Invalid input: date must be strings.");
  }
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}
export function getMaxSize(start: string, end: string, base: number) {
  let startStr = start;
  let endStr = end;
  if (typeof start === "string" && start.length === 6) {
    const convertDate = getStartEndDate(start, end);
    startStr = formatDateToYYYYMMDD(convertDate.startDate);
    endStr = formatDateToYYYYMMDD(convertDate.endDate);
  }
  // 대략적인 일 수 계산
  const estimatedBuckets =
    (new Date(formatDate(endStr)).getTime() -
      new Date(formatDate(startStr)).getTime()) /
    (24 * 60 * 60 * 1000);

  // sizeFactor 계산: 조회 기간에 비례하여 크기를 조정 (15일 기준으로 크기 증가)
  const sizeFactor = Math.ceil(estimatedBuckets / 10);
  // maxSize 계산
  const maxResultsPerRequest = 10000;
  const maxSize: { [key: string]: number } = {
    "50": Math.min(sizeFactor * base * 7, maxResultsPerRequest),
    "250": Math.min(sizeFactor * base * 4, maxResultsPerRequest),
    "500": Math.min(sizeFactor * base * 3, maxResultsPerRequest),
    "1000": Math.min(sizeFactor * base * 2, maxResultsPerRequest),
  };

  return maxSize;
}

export const transformRegionArray = (
  regionArray: (string | number)[],
  regionType: string
) => {
  const regionStrings = regionArray.map((region) => String(region)); // 숫자를 문자열로 변환
  const sidoCodes = new Set<string>(); // SIDO 코드(앞 두 자리)를 저장
  const sggCodes = new Set<string>(); // SGG 코드(앞 다섯 자리)를 저장

  // 입력값 분류
  regionStrings.forEach((region) => {
    if (region.length === 2) {
      // 2자리 -> SIDO
      sidoCodes.add(region);
    } else if (region.length === 5) {
      // 5자리 -> SGG
      sggCodes.add(region);
      sidoCodes.add(region.slice(0, 2)); // 상위 두 자리도 SIDO로 추가
    } else if (region.length === 8) {
      // 8자리 -> 하위 행정구역
      sggCodes.add(region.slice(0, 5)); // 상위 5자리만 SGG로 추가
    } else {
      throw new Error(`Invalid region code length: ${region}`);
    }
  });

  // SGG 쿼리 생성
  if (regionType === "SGG") {
    return [
      {
        terms: {
          SIDO_CD: Array.from(sidoCodes),
        },
      },
    ];
  }

  // ADMDONG 쿼리 생성
  if (regionType === "ADMNS_DONG") {
    const termsQuery = {
      terms: {
        SGG_CD: Array.from(sggCodes),
      },
    };

    // range 쿼리에서 중복 제거 (terms에 포함된 SGG_CD 제외)
    const remainingSidoRanges = Array.from(sidoCodes)
      .map((sido) => ({
        gte: Number(sido) * 1000,
        lte: Number(sido) * 1000 + 999,
      }))
      .filter(
        (range) =>
          // 중복 여부 확인
          !Array.from(sggCodes).some(
            (sggCode) =>
              Number(sggCode) >= range.gte && Number(sggCode) <= range.lte
          )
      );

    return [
      termsQuery,
      ...remainingSidoRanges.map((range) => ({
        range: {
          SGG_CD: range,
        },
      })),
    ];
  }
};
export const transformMopRegionArray = async (
  regionArray: (string | number)[],
  regionType: string,
  isInflow: boolean,
  start?: string
) => {
  let regionMap: any = {
    sido: {
      codes: [],
      field: "SIDO",
    },
    sgg: { codes: [], field: "SGG" },
    adm: { codes: [], field: "ADMNS_DONG" },
  };
  let regionStrings = regionArray.map((region) => String(region)); // 숫자를 문자열로 변환
  const sidoCodes = new Set<string>(); // SIDO 코드(앞 두 자리)를 저장
  const sggCodes = new Set<string>(); // SGG 코드(앞 다섯 자리)를 저장
  const admCodes = new Set<string>(); // ADMNS_DONG 저장
  const regionCD = isInflow ? "DETINA" : "PDEPAR";

  regionMap = await getCompareRegionMap(regionStrings, regionMap, start);

  regionStrings = Object.values(regionMap)
    .map((region: any) => region.codes)
    .flat();

  // 입력값 분류 41, 41111, 41115061 => 41 / 41, 41111 / 41115, 41115061
  regionStrings.forEach((region) => {
    if (region.length === 2) {
      // 2자리 -> SIDO
      sidoCodes.add(region);
    } else if (region.length === 5) {
      // 5자리 -> SGG
      sggCodes.add(region);
      regionType !== "ADMNS_DONG" && sidoCodes.add(region.slice(0, 2)); // 상위 두 자리도 SIDO로 추가
    } else if (region.length === 8) {
      // 8자리 -> 하위 행정구역
      sggCodes.add(region.slice(0, 5)); // 상위 5자리만 SGG로 추가
      admCodes.add(region);
    } else {
      throw new Error(`Invalid region code length: ${region}`);
    }
  });
  // SGG 쿼리 생성
  if (regionType === "SGG") {
    const termsQuery = {
      terms: {
        [`${regionCD}_${regionType}_CD`]: Array.from(sggCodes),
      },
    };
    const sidoTermsQuery = {
      terms: {
        [`${regionCD}_SIDO_CD`]: Array.from(sidoCodes),
      },
    };
    // const rangeQueries = Array.from(sidoCodes).map((sidoCode) => ({
    //   gte: Number(sidoCode) * 1000,
    //   lte: Number(sidoCode) * 1000 + 999,
    // }));
    // const deduplicatedRanges = removeOverlappingRanges(rangeQueries).map(
    //   (range) => ({
    //     range: {
    //       [`${regionCD}_${regionType}_CD`]: range,
    //     },
    //   })
    // );

    return [termsQuery, sidoTermsQuery];
  }

  // ADMNS_DONG 쿼리 생성
  if (regionType === "ADMNS_DONG") {
    const result = [];
    if (Array.from(admCodes).length !== 0) {
      result.push({
        terms: {
          [`${regionCD}_${regionType}_CD`]: Array.from(admCodes),
        },
      });
    }
    if (Array.from(sggCodes).length !== 0) {
      result.push({
        terms: {
          [`${regionCD}_SGG_CD`]: Array.from(sggCodes),
        },
      });
    }
    if (Array.from(sidoCodes).length !== 0) {
      const sidoRangeQueries = Array.from(sidoCodes).map((sidoCode) => ({
        gte: Number(sidoCode) * 1000,
        lte: Number(sidoCode) * 1000 + 999,
      }));
      // 중복 제거
      const deduplicatedRanges = removeOverlappingRanges([
        // ...sggRangeQueries,
        ...sidoRangeQueries,
      ]).map((range) => ({
        range: {
          [`${regionCD}_${regionType}_CD`]: range,
        },
      }));

      result.push(...deduplicatedRanges);
    }

    return result;
  }
};

// 중복 범위 제거 함수
const removeOverlappingRanges = (ranges: { gte: number; lte: number }[]) => {
  ranges.sort((a, b) => a.gte - b.gte); // gte 기준으로 정렬
  const deduplicated: { gte: number; lte: number }[] = [];

  ranges.forEach((range) => {
    const last = deduplicated[deduplicated.length - 1];
    if (!last || last.lte < range.gte) {
      // 겹치지 않으면 추가
      deduplicated.push(range);
    } else {
      // 겹치면 범위 병합
      last.lte = Math.max(last.lte, range.lte);
    }
  });

  return deduplicated;
};
export const transformNationRegionArray = (
  regionArray: (string | number)[],
  regionType: string
) => {
  const regionStrings = regionArray.map((region) => String(region)); // 숫자를 문자열로 변환
  const sidoCodes = new Set<string>(); // SIDO 코드(앞 두 자리)를 저장
  const sggCodes = new Set<string>(); // SGG 코드(앞 다섯 자리)를 저장

  // 입력값 분류
  regionStrings.forEach((region) => {
    if (region.length === 2) {
      // 2자리 -> SIDO
      sidoCodes.add(region);
    } else if (region.length === 5) {
      // 5자리 -> SGG
      sggCodes.add(region);
      sidoCodes.add(region.slice(0, 2)); // 상위 두 자리도 SIDO로 추가
    } else if (region.length === 8) {
      // 8자리 -> 하위 행정구역
      sggCodes.add(region.slice(0, 5)); // 상위 5자리만 SGG로 추가
    } else {
      throw new Error(`Invalid region code length: ${region}`);
    }
  });

  // SGG 쿼리 생성
  if (regionType === "SGG") {
    return [
      {
        terms: {
          SGG_GR: Array.from(sidoCodes),
        },
      },
    ];
  }

  // ADMDONG 쿼리 생성
  if (regionType === "ADM") {
    const termsQuery = {
      terms: {
        ADM_GR: Array.from(sggCodes),
      },
    };

    // range 쿼리에서 중복 제거 (terms에 포함된 SGG_CD 제외)
    const remainingSidoRanges = Array.from(sidoCodes)
      .map((sido) => ({
        gte: Number(sido) * 1000,
        lte: Number(sido) * 1000 + 999,
      }))
      .filter(
        (range) =>
          // 중복 여부 확인
          !Array.from(sggCodes).some(
            (sggCode) =>
              Number(sggCode) >= range.gte && Number(sggCode) <= range.lte
          )
      );

    return [
      ...(Array.from(sggCodes).length !== 0 ? [termsQuery] : []),
      ...remainingSidoRanges.map((range) => ({
        range: {
          ADM_GR: range,
        },
      })),
    ];
  }
};
