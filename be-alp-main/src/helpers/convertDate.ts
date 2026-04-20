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

export function calculateDates(start: string): {
  prevMonth: string;
  lastYear: string;
} {
  // 주어진 연월(YYYYMM)을 년도와 월로 분리
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  // 현재 날짜 객체 생성 (UTC 기준)
  const currentDate = getUTCDate(year, month);

  // 이전 달 계산 (1개월 뺌) - UTC 기준으로 설정
  const prevDate = new Date(
    Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1)
  );

  // 이전 년도의 같은 달 계산 (1년 뺌) - UTC 기준으로 설정
  const lastYearDate = new Date(
    Date.UTC(currentDate.getUTCFullYear() - 1, currentDate.getUTCMonth())
  );

  // YYYYMM 형식으로 반환
  const prevMonth = `${prevDate.getUTCFullYear()}${(prevDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  const lastYear = `${lastYearDate.getUTCFullYear()}${(
    lastYearDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  return {
    prevMonth,
    lastYear,
  };
}

export function calcMonthToDate(monthStr: string): {
  start: string;
  end: string;
} {
  // 주어진 연월(YYYYMM)을 년도와 월로 분리
  const year = parseInt(monthStr.substring(0, 4), 10);
  const month = parseInt(monthStr.substring(4, 6), 10);

  // 현재 날짜 객체 생성
  const date = getUTCDate(year, month); //month는 0부터 시작하므로 -1

  // 현재 월의 마지막 날 구하기: 다음 달의 0번째 날은 현재 월의 마지막 날
  const lastDay = getUTCDate(year, month + 1, 0);

  // YYYYMMDD 형식으로 반환
  return {
    start: `${year}${month.toString().padStart(2, "0")}${date
      .getDate()
      .toString()
      .padStart(2, "0")}`,
    end: `${lastDay.getFullYear()}${(lastDay.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${lastDay.getDate().toString().padStart(2, "0")}`,
  };
}

export function getUTCDate(
  dateOrYear: number | string,
  month?: number,
  day = 1
): Date {
  // dateOrYear가 연도로 사용될 때 (연도와 월이 개별 인자로 주어짐)
  if (typeof dateOrYear === "number" && typeof month === "number") {
    return new Date(Date.UTC(dateOrYear, month - 1, day));
  }

  // dateOrYear가 문자열이나 숫자로 형식화된 날짜일 때
  if (typeof dateOrYear === "string" || typeof dateOrYear === "number") {
    const dateString = dateOrYear.toString();
    let year = 0;
    month = 0;

    if (dateString.length === 6) {
      // yyyyMM 형식
      year = parseInt(dateString.slice(0, 4), 10);
      month = parseInt(dateString.slice(4, 6), 10) - 1; // 0부터 시작하는 월 인덱스
    } else if (dateString.length === 8) {
      // yyyyMMDD 형식
      year = parseInt(dateString.slice(0, 4), 10);
      month = parseInt(dateString.slice(4, 6), 10) - 1;
      day = parseInt(dateString.slice(6, 8), 10);
    } else {
      throw new Error("Invalid date format. Use 'yyyyMM' or 'yyyyMMDD'.");
    }

    return new Date(Date.UTC(year, month, day));
  }

  throw new Error(
    "Invalid arguments. Use 'yyyyMM', 'yyyyMMDD', or 'year, month[, day]'."
  );
}

export function formatDay(dateStr: string): string {
  // Check if dateStr has a valid length of 8 (YYYYMMDD)
  if (dateStr.length !== 8) {
    throw new Error("Invalid date format. Expected YYYYMMDD.");
  }

  // Extract month and day
  const month = parseInt(dateStr.slice(4, 6), 10);
  const day = parseInt(dateStr.slice(6, 8), 10);

  // Return formatted date
  return `${month}/${day}`;
}

//요일 변환
//개발용
// export function getKoreanDayOfWeek(day: number | string): string {
//   const days = ["월", "화", "수", "목", "금", "토", "일"];

//   if (typeof day === "string") {
//     day = parseInt(day);
//   }
//   // 소수점을 포함한 경우 정수로 변환
//   //개발용!!
//   // if (day < 0 || day > 6) {
//   //   throw new Error("Invalid day number. Expected a value between 1 and 7.");
//   // }
//   if (day < 1 || day > 7) {
//     throw new Error("Invalid day number. Expected a value between 1 and 7.");
//   }
//   //kt 요일 일(1)~ 토(7)

//   return days[day];
// }
//kt용
export function getKoreanDayOfWeek(day: number | string): string {
  //kt 요일 일(1)~ 토(7)
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  if (typeof day === "string") {
    day = parseInt(day);
  }
  if (day < 1 || day > 7) {
    throw new Error("Invalid day number. Expected a value between 1 and 7.");
  }

  return days[day - 1];
}

export function convertToUnixTimestamp(
  date: string | number,
  endOfDay: boolean = false
): number {
  const dateString = date.toString();
  let year = 0;
  let month = 0;
  let day = 1; // 기본값은 1일로 설정

  if (dateString.length === 6) {
    // yyyyMM 형식
    year = parseInt(dateString.slice(0, 4), 10);
    month = parseInt(dateString.slice(4, 6), 10) - 1; // 월은 0부터 시작하는 인덱스

    if (endOfDay) {
    }
  } else if (dateString.length === 8) {
    // yyyyMMDD 형식
    year = parseInt(dateString.slice(0, 4), 10);
    month = parseInt(dateString.slice(4, 6), 10) - 1;
    day = parseInt(dateString.slice(6, 8), 10);
  } else {
    throw new Error("Invalid date format. Use 'yyyyMM' or 'yyyyMMDD'.");
  }

  // UTC 기준으로 자정 또는 23:00:00 설정
  const utcDate = new Date(
    Date.UTC(year, month, day, endOfDay ? 23 : 0, 0, 0, 0)
  );

  // KST로 변환
  const kstDate = new Date(utcDate.getTime() - 9 * 60 * 60 * 1000); // 9시간 빼기

  // Unix 타임스탬프로 변환
  return Math.floor(kstDate.getTime()); // 밀리초 단위로 반환
}

// 날짜 형식 (YYYYMMDD) 문자열을 Date 객체로 변환하는 함수
export function convertToDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 월은 0부터 시작
  if (dateStr.length === 6) {
    return new Date(Date.UTC(year, month, 1)); // UTC로 생성
  } else {
    const day = parseInt(dateStr.substring(6, 8), 10);
    return new Date(Date.UTC(year, month, day)); // UTC로 생성
  }
}
// yyyyMM 형식으로부터 시작일과 마지막일을 구하는 함수
export function getStartEndDate(
  start: string,
  end: string
): { startDate: Date; endDate: Date } {
  let startDate: Date;
  let endDate: Date;
  if (typeof start !== "string" || typeof end !== "string") {
    throw new Error("string, end must be a string");
  }
  if (start.length === 6 && end.length === 6) {
    // start와 end가 yyyyMM 형식일 경우
    const startYear = parseInt(start.substring(0, 4), 10);
    const startMonth = parseInt(start.substring(4, 6), 10) - 1;
    const endYear = parseInt(end.substring(0, 4), 10);
    const endMonth = parseInt(end.substring(4, 6), 10) - 1;

    // 시작 날짜는 start의 첫날 (UTC 기준), 종료 날짜는 end의 마지막 날 (UTC 기준)
    startDate = new Date(Date.UTC(startYear, startMonth, 1)); // 해당 월의 1일
    endDate = new Date(Date.UTC(endYear, endMonth + 1, 0)); // 해당 월의 마지막 날
  } else {
    // start와 end가 yyyyMMDD 형식일 경우
    startDate = convertToDate(start);
    endDate = convertToDate(end);
  }

  return { startDate, endDate };
}
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear(); // UTC 연도
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // UTC 월 (0부터 시작하므로 +1)
  const day = date.getUTCDate().toString().padStart(2, "0"); // UTC 일

  return `${year}${month}${day}`;
}

export function checkHoliday(timestamp: number, holidays: string[]): boolean {
  // 타임스탬프를 Date 객체로 변환
  const date = new Date(timestamp);

  // 날짜를 KST 기준으로 YYYYMMDD 형식으로 변환
  date.setUTCHours(date.getUTCHours() + 9); // UTC에서 KST 시간으로 보정

  // 날짜를 UTC 기준으로 YYYYMMDD 형식으로 변환
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = date.getUTCDate().toString().padStart(2, "0");

  const formattedDate = `${year}${month}${day}`;

  // 휴일 배열에 해당 날짜가 포함되어 있는지 확인
  return holidays.includes(formattedDate);
}

export function calculateYear(start: string): string {
  if (typeof start !== "string") {
    throw new Error("string  must be a string");
  }
  // 주어진 연월(YYYYMM)을 년도와 월로 분리
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  // 현재 날짜 객체 생성 (UTC 기준)
  const currentDate = new Date(Date.UTC(year, month - 1)); // month는 0 기반으로 변환

  // 작년 같은 달 계산 (1년 뺌)
  const lastYearDate = new Date(
    Date.UTC(currentDate.getUTCFullYear() - 1, currentDate.getUTCMonth())
  );

  // YYYYMM 형식으로 반환
  const lastYear = `${lastYearDate.getUTCFullYear()}${(
    lastYearDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  return lastYear;
}

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr || typeof dateStr !== "string") {
    return "";
  }

  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);

  return `{${year}}년 {${parseInt(month)}}월`;
};

export const chartFormatSlashDate = (dateStr: string | null): string => {
  if (!dateStr || typeof dateStr !== "string") return "";

  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);

  return `${year}/${parseInt(month)}`;
};

export const chartFormatDate = (dateStr: string | null): string => {
  if (!dateStr || typeof dateStr !== "string") return "";

  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);

  return `${year}년 ${parseInt(month)}월`;
};

export const convertToTimeFormat = (hour: number): string => {
  let period = "오전";
  let displayHour = hour;

  if (hour >= 12) {
    period = "오후";
    if (hour > 12) {
      displayHour = hour - 12;
    }
  } else if (hour === 0) {
    displayHour = 12;
  }

  return `${period} ${displayHour}시`;
};

export type YearMonthResult = {
  [key: string]: string;
};

export function calculateFromLastYearMonthToPresentYearMonth(
  start: string
): YearMonthResult {
  if (typeof start !== "string") {
    throw new Error("start must be a string");
  }

  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  const result: YearMonthResult = {};

  for (let i = 1; i <= 12; i++) {
    const currentYear = month - i <= 0 ? year - 1 : year;
    const currentMonth = (month - i <= 0 ? month - i + 12 : month - i)
      .toString()
      .padStart(2, "0");

    result[`prevYear${i}`] = `${currentYear}${currentMonth}`;
  }

  return result;
}
