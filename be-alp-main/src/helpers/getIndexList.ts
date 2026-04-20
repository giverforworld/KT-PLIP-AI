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
import client from "@/config/opensearchClient";

// 캐시된 인덱스 목록을 저장하는 변수
const indexCache = new Set<string>();
let lastUpdated = Date.now();

// 인덱스 목록을 주기적으로 갱신할 주기 (예: 하루)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 하루

// 전체 인덱스 목록을 로드하여 캐시 갱신
export async function loadExistingIndices() {
  try {
    const { body } = await client.cat.indices({ format: "json" });

    if (!body || body.length === 0) {
      console.error("No indices found.");
      return;
    }

    // 캐시된 인덱스 목록을 초기화하고, 새로운 인덱스를 캐시
    indexCache.clear();
    body.forEach((index: { index: string }) => {
      if (index.index) {
        if (
          !index.index.startsWith(".") &&
          !index.index.startsWith("security") &&
          !index.index.startsWith("test")
        )
          indexCache.add(index.index);
      } else {
        console.warn("Index name missing:", index);
      }
    });
    lastUpdated = Date.now();
  } catch (error) {
    console.error("Failed to load indices:", error);
  }
};

// 캐시된 인덱스를 사용하여 인덱스 존재 여부를 확인하는 함수
const checkIndexExists = (index: string): boolean => {
  return indexCache.has(index);
};

// 인덱스 존재 여부를 확인하고 필요한 경우 캐시를 갱신
const checkIndex = async (index: string): Promise<boolean> => {
  const currentTime = Date.now();

  // 캐시가 비어있다면 초기 로드
  if (indexCache.size === 0) {
    await loadExistingIndices();
  }

  // 캐시 갱신이 필요한 경우
  if (currentTime - lastUpdated > CACHE_EXPIRATION_TIME) {
    await loadExistingIndices();
  }

  return checkIndexExists(index);
};

// Bulk 요청으로 여러 인덱스를 확인하는 함수
// TO BE CHECKED 추후에 날짜 범위 인덱스 저장 범위 반영 부분 추가
const filterExistingIndices = async (indices: string[]): Promise<string[]> => {
  const existingIndices: string[] = [];

  for (const index of indices) {
    const exists = await checkIndex(index); // 캐시 또는 새로 로드된 인덱스 목록으로 확인
    if (exists) {
      existingIndices.push(index);
    }
  }
  return existingIndices;
};

export function getLastUpdated(): { lastUpdated: number; indices: string[]; } {
  return { 
    lastUpdated,
    indices: Array.from(indexCache),
  };
}

//TO BE CHECKED 추후에 날짜 범위 인덱스 저장 범위 반영시 삭제 여부 확인하기
// Helper 함수: 인덱스 존재 여부 확인
// const filterExistingIndices = async (indices: string[]): Promise<string[]> => {
//   const existingIndices: string[] = [];

//   for (const index of indices) {
//     try {
//       const exists = await client.indices.exists({ index });
//       if (exists.body) {
//         existingIndices.push(index);
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   return existingIndices;
// };
// Helper 함수: start와 end 날짜로 인덱스 목록 생성
export const getIndexMMList = async (
  start: string,
  end: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startDate = start.substring(0, 6); // YYYYMM
  const endDate = end.substring(0, 6); // YYYYMM
  const indices: string[] = [];
  let currentDate = startDate;

  // 날짜 범위가 endDate보다 같거나 이전일 때까지 반복
  while (currentDate <= endDate) {
    indices.push(`${aliasPrefix}_${currentDate}`);

    const year = parseInt(currentDate.substring(0, 4), 10);
    const month = parseInt(currentDate.substring(4, 6), 10);

    // 월을 1 증가시켜서 새로운 YYYYMM 값 계산
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    // 다음 월의 YYYYMM 계산
    currentDate = `${nextYear}${String(nextMonth).padStart(2, "0")}`;
  }
  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    // throw new Error(`조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`);
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};

// Helper 함수: start와 end 날짜로 인덱스 목록 생성 (작년 월 추가)
export const getIndexCompareMMList = async (
  start: string,
  end: string,
  aliasPrefix: string,
  needPrevMons = true
): Promise<string[]> => {
  const startDate = start.substring(0, 6); // YYYYMM
  const endDate = end.substring(0, 6); // YYYYMM
  const indices: string[] = [];
  let currentDate = startDate;

  // 날짜 범위가 endDate보다 같거나 이전일 때까지 반복
  while (currentDate <= endDate) {
    indices.push(`${aliasPrefix}_${currentDate}`);

    // 작년 월 추가
    const year = parseInt(currentDate.substring(0, 4), 10);
    const month = parseInt(currentDate.substring(4, 6), 10);
    const lastYear = year - 1;

    // 작년 월의 YYYYMM 추가
    const lastYearDate = `${lastYear}${String(month).padStart(2, "0")}`;
    indices.push(`${aliasPrefix}_${lastYearDate}`);

    if (needPrevMons) {
      // 전월 추가
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevMonthDate = `${prevYear}${String(prevMonth).padStart(2, "0")}`;
      indices.push(`${aliasPrefix}_${prevMonthDate}`);
    }

    // 월을 1 증가시켜서 새로운 YYYYMM 값 계산
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    // 다음 월의 YYYYMM 계산
    currentDate = `${nextYear}${String(nextMonth).padStart(2, "0")}`;
  }
  // 중복 제거
  const uniqueIndices = Array.from(new Set(indices));
  // 존재하는 인덱스만 필터링
  const validIndices = await filterExistingIndices(uniqueIndices);
  if (validIndices.length === 0) {
    // throw new Error(`조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`);
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};

export const getIndexYList = async (
  start: string,
  end: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4); // YYYY
  const endYear = end.substring(0, 4); // YYYY
  const indices: string[] = [];
  let currentYear = startYear;

  // 날짜 범위가 endYear보다 같거나 이전일 때까지 반복
  while (currentYear <= endYear) {
    indices.push(`${aliasPrefix}_${currentYear}`);

    // 년도를 1 증가시켜서 새로운 YYYY 값 계산
    currentYear = String(parseInt(currentYear, 10) + 1);
  }

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    // throw new Error(`조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`);
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};

export const getIndexCompareYList = async (
  start: string,
  end: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4); // YYYY
  const endYear = end.substring(0, 4); // YYYY
  const indices: string[] = [];
  let currentYear = startYear;

  // 날짜 범위가 endYear보다 같거나 이전일 때까지 반복
  while (currentYear <= endYear) {
    indices.push(`${aliasPrefix}_${currentYear}`);

    const lastYear = parseInt(currentYear, 10) - 1;

    // 작년 월의 YYYYMM 추가
    const lastYearDate = `${lastYear}`;
    indices.push(`${aliasPrefix}_${lastYearDate}`);

    // 년도를 1 증가시켜서 새로운 YYYY 값 계산
    currentYear = String(parseInt(currentYear, 10) + 1);
  }

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }
  return validIndices;
};

export const getIndexMList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 6);
  const indices: string[] = [];

  indices.push(`${aliasPrefix}_${startYear}`);

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }
  return validIndices;
};

export const getIndexCompareMList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const indices: string[] = [];
  let currentDate = start;

  indices.push(`${aliasPrefix}_${currentDate}`);

  const year = parseInt(currentDate.substring(0, 4), 10);
  const month = parseInt(currentDate.substring(4, 6), 10);
  const lastYear = year - 1;

  const lastYearDate = `${lastYear}${String(month).padStart(2, "0")}`;
  indices.push(`${aliasPrefix}_${lastYearDate}`);

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month - 1;

  currentDate = `${nextYear}${String(nextMonth).padStart(2, "0")}`;

  const uniqueIndices = Array.from(new Set(indices));
  const validIndices = await filterExistingIndices(uniqueIndices);
  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }
  return validIndices;
};

export const getIndexCompareYYList = async (
  start: string,
  end: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4); // YYYY
  const endYear = end.substring(0, 4); // YYYY
  const indices: string[] = [];
  let currentYear = startYear;

  // 날짜 범위가 endYear보다 같거나 이전일 때까지 반복
  while (currentYear <= endYear) {
    indices.push(`${aliasPrefix}_${currentYear}`);

    // 년도를 1 증가시켜서 새로운 YYYY 값 계산
    currentYear = String(parseInt(currentYear, 10) + 1);
  }

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }
  return validIndices;
};

export const getYIndexList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4);
  const indices: string[] = [];

  indices.push(`${aliasPrefix}_${startYear}`);

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};

export const getCompareYIndexList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4); // YYYY
  const endYear = String(Number(startYear) - 1); // 작년 YYYY
  const indices: string[] = [];

  // 인덱스 추가: 현재 연도와 작년
  indices.push(`${aliasPrefix}_${startYear}`);
  indices.push(`${aliasPrefix}_${endYear}`);

  // 존재하는 인덱스 필터링
  const validIndices = await filterExistingIndices(indices);

  if (validIndices.length === 0) {
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }

  return validIndices;
};

export const getCompareMIndexList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = start.substring(0, 4);
  const startMonth = start.substring(4, 6);
  const endYear = String(Number(startYear) - 1);

  const getPreviousMonth = (year: string, month: string): string => {
    const numericMonth = Number(month);
    if (numericMonth === 1) {
      return `${String(Number(year) - 1)}12`;
    }
    const prevMonth = numericMonth - 1;
    return `${year}${prevMonth < 10 ? `0${prevMonth}` : prevMonth}`;
  };

  const prevMonth = getPreviousMonth(startYear, startMonth);

  const indices: string[] = [];

  indices.push(`${aliasPrefix}_${start}`);
  indices.push(`${aliasPrefix}_${prevMonth}`);
  indices.push(`${aliasPrefix}_${endYear}${startMonth}`);

  const validIndices = await filterExistingIndices(indices);

  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }

  return validIndices;
};

export const get12MIndexList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startYear = Number(start.substring(0, 4));
  const startMonth = Number(start.substring(4, 6));

  const getPreviousMonth = (
    year: number,
    month: number
  ): { year: number; month: number } => {
    if (month === 1) {
      return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
  };

  const indices: string[] = [];

  let currentYear = startYear;
  let currentMonth = startMonth;

  for (let i = 0; i < 13; i++) {
    const formattedMonth =
      currentMonth < 10 ? `0${currentMonth}` : String(currentMonth);
    indices.push(`${aliasPrefix}_${currentYear}${formattedMonth}`);
    const previous = getPreviousMonth(currentYear, currentMonth);
    currentYear = previous.year;
    currentMonth = previous.month;
  }

  const validIndices = await filterExistingIndices(indices);

  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }

  return validIndices;
};

export const getIndexCompare3MList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const indices: string[] = [];
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  indices.push(`${aliasPrefix}_${start}`);

  const getPreviousMonth = (year: number, month: number): string => {
    if (month === 1) {
      return `${year - 1}12`;
    }
    const prevMonth = month - 1;
    return `${year}${String(prevMonth).padStart(2, "0")}`;
  };

  const prevMonth = getPreviousMonth(year, month);
  indices.push(`${aliasPrefix}_${prevMonth}`);

  const lastYear = year - 1;
  const lastYearDate = `${lastYear}${String(month).padStart(2, "0")}`;
  indices.push(`${aliasPrefix}_${lastYearDate}`);

  const uniqueIndices = Array.from(new Set(indices));
  const validIndices = await filterExistingIndices(uniqueIndices);

  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }

  return validIndices;
};

export const getIndexCompare2MList = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const indices: string[] = [];
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);
  const startDate = String(month).padStart(2, "0");
  indices.push(`${aliasPrefix}_${year}${startDate}`);

  const lastYear = year - 1;
  const lastYearDate = `${lastYear}${String(month).padStart(2, "0")}`;
  indices.push(`${aliasPrefix}_${lastYearDate}`);

  const uniqueIndices = Array.from(new Set(indices));
  const validIndices = await filterExistingIndices(uniqueIndices);

  if (validIndices.length === 0) {
    throw new Error(
      `조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`
    );
  }
  return validIndices;
};

export const getGisIndex = async (
  start: string,
  aliasPrefix: string
): Promise<string[]> => {
  const startDate = start.substring(0, 6); // YYYYMM
  const indices: string[] = [];
  let currentDate = startDate;
 
  indices.push(`${aliasPrefix}_${currentDate}`);

  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    // throw new Error(`조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`);
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};

export const getGisDayIndex = async (
  start: string,
  end: string,
  regionArray: string[],
  aliasPrefix: string
): Promise<string[]> => {
  const indices: string[] = [];
  const regionValue = regionArray[0].slice(0, 2);
  let startDay = parseInt(start, 10);
  let endDay = parseInt(end, 10);

  while (startDay <= endDay) {
    indices.push(`${aliasPrefix}_${startDay}`);
    startDay += 1;
  }
  const validIndices = await filterExistingIndices(indices);
  if (validIndices.length === 0) {
    // throw new Error(`조건에 맞는 유효한 인덱스가 존재하지 않습니다. ${indices}`);
    console.error("조건에 맞는 유효한 인덱스가 존재하지 않습니다.", indices);
  }
  return validIndices;
};
