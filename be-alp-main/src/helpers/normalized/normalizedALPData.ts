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
import util from "util";
import { formatKSTTimestamp } from "../convertTime";
import { convertToDate, getStartEndDate } from "../convertDate";
import { getDowAvgData } from "@/utils/dashboard/calcList";

export function normalizedMopDowAvgData(data: any, start: string, end: string) {
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(Number(a.key)) - dayOrder.indexOf(Number(b.key));
  });

  const days = keyMap["dow"];
  const occurrences = getDowOccurrences(start, end);
  return sortedData.map((dow: any) => {
    const dayCnt = occurrences[dow.key] || 1;

    if (dow?.by_move?.buckets) {
      return {
        key: days[dow.key - 1],
        value: dow.by_move.buckets[0].pop_by_move.value / dayCnt, //1일 단위 평균
      };
    } else {
      return {
        key: days[dow.key - 1],
        value: dow.pop_by_dow.value / dayCnt, //1일 단위 평균
      };
    }
  });
}
export function normalizedMopMoveDowAvgData(
  data: any,
  start: string,
  end: string,
  moveKeys: number[]
): any {
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(Number(a.key)) - dayOrder.indexOf(Number(b.key));
  });
  const days = keyMap["dow"];
  const occurrences = getDowOccurrences(start, end);
  const result: any[] = [];

  sortedData.forEach((dow: any) => {
    // 기존 데이터를 기반으로 moveKey별로 매핑 생성
    const moveMap = new Map<number, number>();
    dow.by_move.buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    const dayCnt = occurrences[dow.key] || 1;
    // 모든 moveKeys를 순회하며 누락된 값은 0으로 채움
    moveKeys.forEach((moveKey) => {
      result.push({
        key: days[dow.key - 1],
        move: moveKey,
        value:
          moveMap.get(moveKey) !== undefined
            ? moveMap.get(moveKey)! / dayCnt
            : 0,
      });
    });
  });

  return result;
}
export function normalizedTmstData(data: any) {
  return data.map((tmst: any) => ({
    key: formatKSTTimestamp(tmst.key),
    value: tmst.total.value,
  }));
}
export function normalizedDowAvgData(
  data: any,
  start: string,
  end: string,
  ptrn?: number
) {
  //   //kt 요일 일(1)~ 토(7)
  //요일 순서 월요일부터 시작하도록 재정렬
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(Number(a.key)) - dayOrder.indexOf(Number(b.key));
  });

  const days = keyMap["dow"];
  const occurrences = getDowOccurrences(start, end); //요일별 등장 횟수 계산
  return sortedData.map((dow: any) => {
    const dayCnt = occurrences[dow.key] || 1; //해당 요일이 없으면 1로 방어처리

    return {
      key: days[dow.key - 1],
      ...(ptrn !== undefined && { ptrn: ptrn }),
      value: dow.pop_by_dow.value / (dayCnt * 24), //1시간 단위 평균
    };
  });
}

export function normalizedWeekdaysAvgData(
  data: any,
  weekdayCnt: number,
  holidayCnt: number,
  ptrn?: number
) {
  return [
    {
      key: "weekday",
      ...(ptrn !== undefined && { ptrn: ptrn }),
      value: Math.round(data.weekday.pop_by_weekdays.value / (weekdayCnt * 24)),
    },
    {
      key: "weekend",
      ...(ptrn !== undefined && { ptrn: ptrn }),
      value: Math.round(data.weekend.pop_by_weekdays.value / (holidayCnt * 24)),
    },
  ];
}
export function normalizedHourlyAvg(
  data: NormalizedChartData[],
  totalDays: number,
  isTime: boolean = false
) {
  return data.map((item) => {
    const keyStr = String(item.key);
    let days = totalDays;

    if (/^\d{6}$/.test(keyStr)) {
      const year = Number(keyStr.slice(0, 4));
      const month = Number(keyStr.slice(4,6));
      days = new Date(year, month, 0).getDate();
    }
    return { 
      ...item,
      value: item.value / (days * (isTime ? 1 : 24))
    }
  })
  // return data.map((item) => ({
  //   ...item,
  //   value: item.value / (totalDays * (isTime ? 1 : 24)),
  // }));
}
export function normalizedHourlyDayAvg(
  data: NormalizedChartData[],
  start: string,
  end: string,
) {
  return data.map((item) => {
    const keyStr = String(item.key);
    let days = 1;
    const { sunCnt, monCnt, tueCnt, wedCnt, thuCnt, friCnt, satCnt} = getDowAvgData(start, end)

    switch(item.key) {
      case "일":
        days = sunCnt
        break;
      case "월":
        days = monCnt
        break;
      case "화":
        days = tueCnt
        break;
      case "수":
        days = wedCnt
        break;
      case "목":
        days = thuCnt
        break;
      case "금":
        days = friCnt
        break;
      case "토":
        days = satCnt
        break;
    }

    return { 
      ...item,
      value: item.value / (days)
    }
  })
}

export function normalizedSexTimeznData(data: any) {
  const result: any[] = [];

  // 누락된 moveKeys 처리
  data.forEach((timebucket: any) => {
    // 남성 데이터 추가
    result.push({
      key: "남성",
      time: timebucket.key,
      value: timebucket?.total_male?.value || 0, // 값이 없으면 0으로 설정
    });

    // 여성 데이터 추가
    result.push({
      key: "여성",
      time: timebucket.key,
      value: timebucket?.total_female?.value || 0, // 값이 없으면 0으로 설정
    });
  });

  return result;
}
export function normalizedAgeTimeznData(data: any) {
  const result: any[] = [];

  data.forEach((timebucket: any) => {
    const ageStartRange = 0;
    const ageEndRange = 80;
    // Generate male population fields
    for (let i = ageStartRange; i <= ageEndRange; i += 10) {
      const key = `${i.toString().padStart(2, "0")}`;
      const numKey = i
      const maleKey = `m${key}`;
      const nextMale = `m${numKey+5}`
      const femaleKey = `f${key}`;
      const nextFemale = `f${numKey+5}`

      if (i === 0 || i === 80) {
        result.push({
          key: key,
          time: timebucket.key,
          value: timebucket[maleKey].value + timebucket[femaleKey].value || 0, // 값이 없으면 0으로 설정
        });
      } else {
        result.push({
          key: key,
          time: timebucket.key,
          value: timebucket[maleKey].value + timebucket[nextMale].value + timebucket[femaleKey].value + timebucket[nextFemale].value
        })
      }
    }
  });

  return result;
}

export function normalizedTimeznDowData(data: any) {
  const result: any[] = [];
  //요일 순서 월요일부터 시작하도록 재정렬
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  data.forEach((timebucket: any) => {
    const sortedData = timebucket.dow_buckets.buckets.sort((a: any, b: any) => {
      return dayOrder.indexOf(a.key) - dayOrder.indexOf(b.key);
    });
    
    const days = keyMap.dow;
    result.push(
      ...sortedData.map((dow: any) => ({
        key: days[dow.key - 1],
        time: timebucket.key,
        value: dow.total.value,
      }))
    );
  });
  return result;
}
export function normalizedTimeznWeekData(
  data: any,
  weekdayCnt: number,
  holidayCnt: number
) {
  const result: any[] = [];

  // 누락된 moveKeys 처리
  data.forEach((timebucket: any) => {
    result.push({
      key: "weekday",
      time: timebucket.key,
      value:
        timebucket.weekday_weekend_buckets.buckets.weekday.pop_by_weekdays
          .value / weekdayCnt || 0, // 값이 없으면 0으로 설정
    });

    result.push({
      key: "weekend",
      time: timebucket.key,
      value:
        timebucket.weekday_weekend_buckets.buckets.weekend.pop_by_weekdays
          .value / holidayCnt || 0, // 값이 없으면 0으로 설정
    });
  });

  return result;
}
export function normalizedSubzoneTimeznData(data: any) {
  const result: any[] = [];

  data.forEach((timebucket: any) => {
    timebucket.by_subzone.buckets.forEach((subzone: any) => {
      result.push({
        key: subzone.key,
        time: timebucket.key,
        value: subzone.total.value || 0, // 값이 없으면 0으로 설정
      });
    });
  });

  return result;
}
export function normalizedInOutData(
  data: any,
  region: string,
  totalDays: number
) {
  const isSido = region.length === 2;
  return data
    .filter(
      (item: any) =>
        (isSido ? item.key.toString().slice(0, 2) : item.key.toString())
          .length === region.length
    )
    .slice(0, 10)
    .map((item: any) => ({
      key: Number(
        isSido ? item.key.toString().slice(0, 2) : item.key.toString()
      ),
      value: item.total.value / (totalDays * 24),
    }));
}

export function normalizedFornTop(data: any, totalDays: number) {
  const countrySums: any = {};
  keyMap.forn.map((country) => {
    if (data[country].value) {
      countrySums[country] = data[country].value;
    }
  });
  // 상위 10개 국가 추출
  const topCountry = Object.entries(countrySums)
    .map(([key, value]) => ({
      key,
      value: value as number / (totalDays * 24),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return topCountry;
}
export function normalizedFornTimezn(
  data: any,
  keys: string[],
  totalDays: number
) {
  const result: any[] = [];
  data.forEach(
    (timebucket: {
      key: number;
      doc_count: number;
      [country: string]: any;
    }) => {
      const { key, doc_count, ...countries } = timebucket;
      keys.forEach((country) => {
        if (countries[country] && countries[country].value !== undefined)
          //상위 10개 나라만 처리
          result.push({
            key: country,
            time: key,
            value: countries[country].value / totalDays || 0, // 값이 없으면 0으로 설정
          });
      });
    }
  );

  return result;
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
export function getWeekedOccurrences(
  start: string,
  end: string,
  holidays: string[]
): { weekdayCnt: number; holidayCnt: number } {
  const { startDate, endDate } = getStartEndDate(start, end);

  let weekdayCnt = 0;
  let holidayCnt = 0;

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const jsDayOfWeek = currentDate.getDay(); // 0 = 일요일, 6 = 토요일
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, ""); //YYYYMMDD 형식 변환

    if (jsDayOfWeek === 0 || jsDayOfWeek === 6 || holidays.includes(dateStr)) {
      //토(6), 일(0) -> 무조건 휴일
      // 월금 중 holidays이면 휴일
      holidayCnt += 1; //휴일 카운트 증가
    } else {
      weekdayCnt += 1; //평일 카운트 증가
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { weekdayCnt, holidayCnt };
}

export function getTotalDays(start: string, end: string) {
  const parseDate = getStartEndDate(start, end);

  // 총 일수 계산
  const totalDays =
    Math.ceil(
      (parseDate.endDate.getTime() - parseDate.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return totalDays;
}

export function normalizedDayAddResidData(
  data: any,
  ptrn: number,
  residValue: number
) {
  return data.map((day: any) => [
    {
      key: day.key_as_string || day.key,
      ...(ptrn !== undefined && { ptrn: ptrn }),
      value: day.pop_by_day.value,
    },
    {
      key: day.key_as_string || day.key,
      ...(ptrn !== undefined && { ptrn: 2 }),
      value: residValue,
    },
  ]);
}
export function normalizedODFlowData(
  data: any,
  region: string,
  totalDays: number,
  isInflow: string
) {
  const isSido = region.length === 2;
  return data
    .filter(
      (item: any) =>
        (isSido ? item.key.toString().slice(0, 2) : item.key.toString())
          .length === region.length
    )
    .slice(0, 10)
    .map((item: any) => ({
      flow: isInflow,
      key: Number(
        isSido ? item.key.toString().slice(0, 2) : item.key.toString()
      ),
      value: item.total.value / (totalDays * 24),
    }));
}
