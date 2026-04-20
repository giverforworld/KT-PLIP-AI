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

import {
  convertToDate,
  getStartEndDate,
  getUTCDate,
} from "@/helpers/convertDate";
import { getHolidaysFromOpenSearch } from "@/service/holidays";

const memoryCache: { holidayDates?: HolidayCache } = {};
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

// 공휴일 데이터를 메모리 캐시에 저장하는 함수 (1년 치 전체 저장)
function setHolidayCache(holidayDates: string[]): void {
  const now = Date.now();
  memoryCache.holidayDates = {
    data: holidayDates,
    timestamp: now,
    start: holidayDates[0], // 캐시의 시작 날짜
    end: holidayDates[holidayDates.length - 1], // 캐시의 종료 날짜
  };
}

// 공휴일 데이터를 캐시에서 가져오는 함수 (요청 범위에 맞게 필터링)
function getHolidayCache(start: string, end: string): string[] | null {
  const cache = memoryCache.holidayDates;

  if (cache) {
    const now = Date.now();

    // 캐시 유효성 검사 (하루 이내에 캐시된 데이터 사용)
    if (now - cache.timestamp < CACHE_EXPIRATION_MS) {
      // 요청 범위에 맞게 데이터 필터링하여 반환
      const { startDate, endDate } = getStartEndDate(start, end);

      // 요청된 범위에 맞는 데이터를 필터링하여 반환
      const filteredHolidays = cache.data.filter((holiday) => {
        const holidayDate = convertToDate(holiday);
        return holidayDate >= startDate && holidayDate <= endDate;
      });

      return filteredHolidays;
    }
  }

  return null; // 캐시가 없거나 유효하지 않을 경우
}

// 범위에 맞는 공휴일 데이터를 필터링하여 반환하는 함수
export async function getHolidays(
  start: string,
  end: string
): Promise<string[]> {
  if (typeof start !== "string" || typeof end !== "string") {
    throw new Error("region must be a string");
  }

  // 메모리 캐시에서 요청 범위에 맞는 데이터 가져오기
  const cachedHolidays = getHolidayCache(start, end);
  // 캐시에 유효한 데이터가 있는 경우 반환
  if (cachedHolidays) {
    return cachedHolidays;
  }
  // 캐시에 데이터가 없으면 1년 치 공휴일 데이터를 OpenSearch에서 가져와 캐시에 저장
  try {
    const startOfYear = `${start.slice(0, 4)}0101`;
    const endOfYear = `${end.slice(0, 4)}1231`;
    const holidayDates = await getHolidaysFromOpenSearch(
      startOfYear,
      endOfYear
    );

    // 주말 제외하고 캐시에 저장
    const noWeekendHolidays = holidayDates.filter((holiday) => {
      const date = getUTCDate(holiday);
      const day = date.getDay();
      return day !== 0 && day !== 6; // 일요일(0) 또는 토요일(6)
    });

    // 1년 치 데이터를 캐시에 저장
    setHolidayCache(noWeekendHolidays);
    // 요청된 범위에 맞는 날짜 형식이 yyyyMM일 경우 처리
    const { startDate, endDate } = getStartEndDate(start, end);

    // 요청된 범위에 맞는 데이터를 필터링하여 반환
    const filteredHolidays = noWeekendHolidays.filter((holiday) => {
      const holidayDate = convertToDate(holiday);
      return holidayDate >= startDate && holidayDate <= endDate;
    });

    return filteredHolidays;
  } catch (error) {
    console.error(error);
    throw new Error("failed get holidays from opensearch");
  }
}
