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



import { keyMap } from "@/config/keyMapConfig";
import {
  getStartEndDate
} from "@/helpers/convertDate";
/**
 * Calculate the percentage change compared to the previous value.
 * @param currentValue - Current population value.
 * @param prevValue - Previous population value.
 * @returns Percentage change rounded to two decimal places.
 */
export function calculatePrevRatio(
  currentValue: number,
  prevValue: number
): number {
  return prevValue !== 0
    ? Number((((currentValue - prevValue) / prevValue) * 100).toFixed(1))
    : 0;
}

/**
 * Calculate the percentage change compared to the last year's value.
 * @param currentValue - Current population value.
 * @param lastValue - Last year's population value.
 * @returns Percentage change rounded to two decimal places.
 */
export function calculateLastRatio(
  currentValue: number,
  lastValue: number
): number {
  return lastValue !== 0
    ? Number((((currentValue - lastValue) / lastValue) * 100).toFixed(2))
    : 0;
}

/**
 * 7개의 단일 값 중에서 최대값과 최소값을 계산하고, 최대값을 가진 요일도 반환합니다.
 * @param sun - 일요일의 인구 수
 * @param mon - 월요일의 인구 수
 * @param tue - 화요일의 인구 수
 * @param wed - 수요일의 인구 수
 * @param thu - 목요일의 인구 수
 * @param fri - 금요일의 인구 수
 * @param sat - 토요일의 인구 수
 * @returns 최대값, 최소값과 최대값을 가진 요일을 포함한 객체
 */
export function calculateMaxMinPopulation(
  sun: number,
  mon: number,
  tue: number,
  wed: number,
  thu: number,
  fri: number,
  sat: number
): { maxValue: number; minValue: number; maxDay: string } {
  // 최대값과 최소값 계산
  const maxValue = Math.max(sun, mon, tue, wed, thu, fri, sat);
  const minValue = Math.min(sun, mon, tue, wed, thu, fri, sat);

  // 최대값을 가진 요일 찾기
  let maxDay = "";
  if (maxValue === sun) maxDay = "일";
  else if (maxValue === mon) maxDay = "월";
  else if (maxValue === tue) maxDay = "화";
  else if (maxValue === wed) maxDay = "수";
  else if (maxValue === thu) maxDay = "목";
  else if (maxValue === fri) maxDay = "금";
  else if (maxValue === sat) maxDay = "토";

  return { maxValue, minValue, maxDay };
}

export function calculateSexMaxMinPopulation(
  maleValues: number[],
  femaleValues: number[]
): {
  maleMaxValue: number;
  maleMaxIndex: number;
  femaleMaxValue: number;
  femaleMaxIndex: number;
} {
  // 남성 최대값과 인덱스 계산
  let maleMaxValue = -Infinity;
  let maleMaxIndex = -1;

  for (let i = 0; i < maleValues.length - 1; i++) {
    // 기타 제외
    if (maleValues[i] > maleMaxValue) {
      maleMaxValue = maleValues[i];
      maleMaxIndex = i;
    }
  }

  // 여성 최대값과 인덱스 계산
  let femaleMaxValue = -Infinity;
  let femaleMaxIndex = -1;

  for (let i = 0; i < femaleValues.length - 1; i++) {
    // 기타 제외
    if (femaleValues[i] > femaleMaxValue) {
      femaleMaxValue = femaleValues[i];
      femaleMaxIndex = i;
    }
  }

  return {
    maleMaxValue,
    maleMaxIndex,
    femaleMaxValue,
    femaleMaxIndex,
  };
}

export function calculateAgeMaxMinPopulation(
  ageGroups: number[],
  ageGroupNames: string[],
  prpsAgeList: string[]
): {
  maxValue: number;
  maxAgeGroup: string;
  maxAgeGroupSum: number;
  maxAgeGroupSumName: string;
} {
  let maxValue = -Infinity;
  let maxAgeGroup = "";
  let num = ageGroupNames.length;
  let num1 = prpsAgeList.length;
  let ageGroupSums = new Array(prpsAgeList.length).fill(0);
  let ageGroupMaxSum = -Infinity;
  let maxAgeGroupSumName = "";

  for (let i = 0; i < ageGroups.length; i++) {
    if (ageGroups[i] > maxValue) {
      maxValue = ageGroups[i];
      maxAgeGroup = ageGroupNames[i];
    }
  }

  for (let i = 0; i < ageGroups.length; i++) {
    const groupIndex = i % num1;
    ageGroupSums[groupIndex] += ageGroups[i];
  }

  for (let i = 0; i < ageGroupSums.length; i++) {
    if (ageGroupSums[i] > ageGroupMaxSum) {
      ageGroupMaxSum = ageGroupSums[i];
      maxAgeGroupSumName = prpsAgeList[i];
    }
  }

  return {
    maxValue,
    maxAgeGroup,
    maxAgeGroupSum: ageGroupMaxSum,
    maxAgeGroupSumName,
  };
}

export function maxValueinIndicate(indicate: any[]) {
  let maxValue = -Infinity;
  let maxCategory = "";
  let maxGuBun = "";

  for (const item of indicate) {
    const values: number[] = Object.entries(item)
      .filter(([key]) => key !== "기타" && typeof item[key] === "number")
      .map(([_, value]) => value as number);

    if (values.length > 0) {
      const maxInItem = Math.max(...values);

      if (maxInItem > maxValue) {
        maxValue = maxInItem;
        maxCategory =
          Object.keys(item).find(
            (key) => item[key] === maxInItem && key !== "기타"
          ) || "";
        maxGuBun = item["구분"];
      }
    }
  }

  return { maxValue, maxGuBun, maxCategory };
}

export function maxWayIndicate(indicate: any[]) {
  let maxInboundValue = -Infinity;
  let maxOutboundValue = -Infinity;
  let maxInboundGuBun = "";
  let maxOutboundGuBun = "";

  for (const item of indicate) {
    if (item["구분"] !== "기타") {
      const inboundPopulation = item["유입인구"];
      const outboundPopulation = item["유출인구"];

      if (
        typeof inboundPopulation === "number" &&
        inboundPopulation > maxInboundValue
      ) {
        maxInboundValue = inboundPopulation;
        maxInboundGuBun = item["구분"];
      }

      if (
        typeof outboundPopulation === "number" &&
        outboundPopulation > maxOutboundValue
      ) {
        maxOutboundValue = outboundPopulation;
        maxOutboundGuBun = item["구분"];
      }
    }
  }

  return {
    maxInboundGuBun,
    maxInboundValue,
    maxOutboundGuBun,
    maxOutboundValue,
  };
}

export function countWeekendAndHolidays(
  start: string,
  end: string,
  holidays: string[]
) {
  const startDate = new Date(
    `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`
  );
  const endDate = new Date(
    `${end.slice(0, 4)}-${end.slice(4, 6)}-${end.slice(6, 8)}`
  );

  let weekendCount = 0;
  let holidayCount = 0;
  let weekdayCount = 0;

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayOfWeek = currentDate.getDay();
    const formattedDate = `${currentDate.getFullYear()}${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}${String(currentDate.getDate()).padStart(2, "0")}`;

    if (holidays.includes(formattedDate)) {
      holidayCount++;
      holidays.splice(holidays.indexOf(formattedDate), 1);
      continue;
    }

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  }
  const weekendandholidayCount = weekendCount + holidayCount;

  return { weekendandholidayCount, weekdayCount };
}

export function calculateStayRatio(
  value1: number,
  value2: number,
  value3: number
): {
  value1_ratio: number;
  value2_ratio: number;
  value3_ratio: number;
} {
  const value_sum = value1 + value2 + value3;

  if (value_sum === 0) {
    return {
      value1_ratio: 0,
      value2_ratio: 0,
      value3_ratio: 0,
    };
  }

  return {
    value1_ratio: parseFloat(((value1 / value_sum) * 100).toFixed(1)),
    value2_ratio: parseFloat(((value2 / value_sum) * 100).toFixed(1)),
    value3_ratio: parseFloat(((value3 / value_sum) * 100).toFixed(1)),
  };
}

export function countDays(start: string): [number, number, number] {
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new Error("Invalid start format. Provide a string in YYYYMM format.");
  }

  const currentMonthDays = new Date(year, month, 0).getDate();
  const previousMonthDays = new Date(year, month - 1, 0).getDate();
  const lastYearMonthDays = new Date(year - 1, month, 0).getDate();

  return [currentMonthDays, previousMonthDays, lastYearMonthDays];
}

export function defineMonth(start: string): [string, string, string] {
  const year = parseInt(start.substring(0, 4), 10);
  const month = parseInt(start.substring(4, 6), 10);

  const currentYearMonth = `${year}${month.toString().padStart(2, "0")}`;

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYearMonth = `${prevYear}${prevMonth.toString().padStart(2, "0")}`;
  const lastYearMonth = `${year - 1}${month.toString().padStart(2, "0")}`;

  return [currentYearMonth, prevYearMonth, lastYearMonth];
}

export function rankandratioValue(
  one_popul: number,
  two_popul: number,
  eight_popul: number
) {
  const total = one_popul + two_popul + eight_popul;

  const ratios = [
    { label: "1일", value: one_popul, ratio: (one_popul / total) * 100 },
    { label: "2~7일", value: two_popul, ratio: (two_popul / total) * 100 },
    {
      label: "8일 이상",
      value: eight_popul,
      ratio: (eight_popul / total) * 100,
    },
  ];

  ratios.sort((a, b) => a.value - b.value);

  return {
    max_label: ratios[2].label,
    mid_label: ratios[1].label,
    min_label: ratios[0].label,
    max_ratio: ratios[2].ratio,
    mid_ratio: ratios[1].ratio,
    min_ratio: ratios[0].ratio,
  };
}

export function rankandratiovalue1(
  one_population: number,
  two_population: number,
  three_population: number,
  four_population: number,
) {
  const total = one_population + two_population + three_population + four_population;

  const ratios = [
    { label: "무박", value: one_population, ratio : (one_population / total) * 100 },
    { label: "1박", value: two_population, ratio : (two_population/ total) * 100 },
    { label: "2박", value: three_population, ratio : (three_population / total) * 100},
    { label: "3박 이상", value: four_population, ratio : (four_population / total) * 100},
  ];
  ratios.sort((a, b) => a.value - b.value);

  return {
    first_label: ratios[3].label,
    second_label: ratios[2].label,
    third_label: ratios[1].label,
    fourth_label: ratios[0].label,
    first_ratio: ratios[3].ratio,
    second_ratio: ratios[2].ratio,
    third_ratio: ratios[1].ratio,
    fourth_ratio: ratios[0].ratio,
  }
}
type AgeGroupData = {
  [key: string]: number;
}
export function findLargestAgeGroup(data: AgeGroupData[]): string {
  let maxAgeGroup = "";
  let maxValue = -Infinity

  for (const entry of data) {
    for (const [ageGroup, value] of Object.entries(entry)) {
      if (value > maxValue) {
        maxValue = value;
        maxAgeGroup = ageGroup
      }
    }
  }
  return maxAgeGroup
}

export function getDowAvgData(start: string, end: string) {

  const days = keyMap["dow"];
  const occurrences = getDowOccurrences(start, end);
  const sunCnt = occurrences[1]
  const monCnt = occurrences[2]
  const tueCnt = occurrences[3]
  const wedCnt = occurrences[4]
  const thuCnt = occurrences[5]
  const friCnt = occurrences[6]
  const satCnt = occurrences[7]
  
  return { sunCnt, monCnt, tueCnt, wedCnt, thuCnt, friCnt, satCnt}
}

function getDowOccurrences(start: string, end: string): Record<number, number> {
  const { startDate, endDate } = getStartEndDate(start, end);

  const dayCnt: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const jsDayOfWeek = currentDate.getDay(); // 0 = 일요일, 6 = 토요일
    const mappedDay = jsDayOfWeek + 1; //JS 기준을 데이터 기준(1=일요일)으로 변환

    dayCnt[mappedDay] += 1;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dayCnt;
}
