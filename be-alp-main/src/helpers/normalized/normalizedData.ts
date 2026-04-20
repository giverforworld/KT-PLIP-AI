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
import {
  convertMinutesToHoursDecimal,
  formatKSTTimestamp,
} from "../convertTime";
import { getStartEndDate } from "../convertDate";
export function normalizedFlowData(data: any) {
  return data.map((flow: any) => ({
    key: flow.key,
    value: flow.pop_by_flow.value,
  }));
}
export function normalizedPrevMonthData(data: any) {
  return data.map((day: any) => ({
    key: day.key_as_string,
    value: day.pop_by_day.value,
  }));
}

export function normalizedMoveData(data: any, moveKeys: number[]) {
  const result: any[] = [];
  // 각 flowRegion에서 moveKeys에 해당하는 값을 확인
  const moveMap = new Map<number, number>();
  // 기존 데이터에서 moveBucket.key를 기준으로 값 매핑
  data.forEach((moveBucket: any) => {
    moveMap.set(moveBucket.key, moveBucket.total.value);
  });

  moveKeys.forEach((moveKey) => {
    result.push({
      key: moveKey, // flowRegion의 key
      move: moveKey, // moveKey 값
      value: moveMap.get(moveKey) || 0, // 값이 없으면 0으로 설정
    });
  });

  return result;
}
export function normalizedMoveFlowRegionData(data: any, moveKeys: number[]) {
  const result: any[] = [];

  data.forEach((flowRegion: any) => {
    // 각 flowRegion에서 moveKeys에 해당하는 값을 확인
    const moveMap = new Map<number, number>();

    // 기존 데이터에서 moveBucket.key를 기준으로 값 매핑
    flowRegion.by_move.buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    // moveKeys에 대해 반복하며 값이 없으면 0으로 채우기
    moveKeys.forEach((moveKey) => {
      result.push({
        key: flowRegion.key, // flowRegion의 key
        move: moveKey, // moveKey 값
        value: moveMap.get(moveKey) || 0, // 값이 없으면 0으로 설정
      });
    });
  });

  return result;
}

export function normalizedMonsAgeData(data: any) {
  const ageOrder = [
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
    "60",
    "65",
    "70",
    "75",
    "80",
  ];

  return data.map((monsData: any) => {
    const ageRanges: Record<string, number> = {};

    // f/m 연령대별 값 누적
    Object.entries(monsData)
      .filter(([key]) => key.startsWith("f") || key.startsWith("m"))
      .forEach(([key, entry]) => {
        const ageGroup = key.slice(1); // 키에서 연령대 추출 (예: "10")
        if (typeof entry === "object" && entry !== null && "value" in entry) {
          const value = (entry as { value: number }).value;
          ageRanges[ageGroup] = (ageRanges[ageGroup] || 0) + value;
        }
      });

    // 결과를 정렬된 형식으로 반환
    const sortedAgeData = ageOrder.map((age) => ({
      key: age,
      value: ageRanges[age] || 0, // 누적된 값이 없으면 0 반환
    }));

    return {
      key: monsData.key_as_string, // 월 키
      value: sortedAgeData, // 연령대별 누적값
    };
  });
}

export function normalizedDayData(
  data: any,
  isSum: boolean = true,
  ptrn?: number
) {
  return data.map((day: any) => ({
    key: day.key_as_string || day.key,
    ...(ptrn !== undefined && { ptrn: ptrn }),
    value: isSum ? day.pop_by_day.value : day.pop_by_day.value / 24,
  }));
}

export function normalizedStayTimesData(data: any) {
  const result: any[] = [];

  data.forEach((entry: { [key: string]: { [key: string]: number } }) => {
    result.push({
      key: entry.key,
      time: entry.key,
      value: entry.total.value,
    });
  });

  return result;
}

export function normalizedstayDayTimesData(data: any) {
  const result: any[] = [];

  data.forEach((entry: any) => {
    const dateKey = entry.key_as_string;
    const total = entry.daily_total.value;
    const buckets = entry.by_stay_time.buckets;

    buckets.forEach((bucket: any) => {
      result.push({
        key: dateKey,
        time: bucket.key,
        value: bucket.pop_by_day.value,
      });
      result.push({
        key: dateKey,
        time: 4,
        value: total,
      });
    });
  });

  return result;
}

export function normalizedDayMoveData(data: any, moveKeys: number[]) {
  const result: any[] = [];

  data.forEach((day: any) => {
    // day의 by_move.buckets에서 moveKey에 맞는 값을 매핑
    const moveMap = new Map<number, number>();

    // 기존 데이터를 기반으로 moveKey별로 매핑 생성
    day.by_move.buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    // moveKeys에 대한 값을 추가
    moveKeys.forEach((moveKey) => {
      result.push({
        key: day.key_as_string, // day의 key_as_string 사용
        move: moveKey, // moveKey 값
        value: moveMap.get(moveKey) || 0, // moveMap에 값이 없으면 0으로 설정
      });
    });
  });

  return result;
}
export function normalizedDowMoveData(data: any, moveKeys: number[]) {
  //   //kt 요일 일(1)~ 토(7)
  //   const days = [];
  //개발용
  const days = keyMap["dow"];
  const result: any[] = [];

  //요일 순서 월요일부터 시작하도록 재정렬
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(a.key) - dayOrder.indexOf(b.key);
  });
  sortedData.forEach((dow: any) => {
    // 기존 데이터를 기반으로 moveKey별로 매핑 생성
    const moveMap = new Map<number, number>();
    dow.by_move.buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    // 모든 moveKeys를 순회하며 누락된 값은 0으로 채움
    moveKeys.forEach((moveKey) => {
      result.push({
        key: days[dow.key - 1],
        move: moveKey,
        value: moveMap.get(moveKey) ?? 0, // 없으면 기본값 0
      });
    });
  });

  return result;
}
export function normalizedDowData(data: any) {
  //   const days = [];

  //개발용
  // const days = keyMap["dow"];
  // return data.map((dow: any) => ({
  //   key: days[dow.key],
  //   value: dow.pop_by_dow.value,
  // }));
  //   //kt 요일 일(1)~ 토(7)
  //요일 순서 월요일부터 시작하도록 재정렬
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(Number(a.key)) - dayOrder.indexOf(Number(b.key));
  });

  const days = keyMap["dow"];
  return sortedData.map((dow: any) => ({
    key: days[dow.key - 1],
    value: dow.pop_by_dow.value,
  }));
}
export function normalizedWeekdaysMoveData(data: any, weekdayCnt: number, holidayCnt:number, moveKeys: number[]) {
  const result: any[] = [];
  const processBuckets = (buckets: any[], key: string) => {
    const moveMap = new Map<number, number>();
    buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    for (let i = 0; i <=7; i++) {
      const key = moveMap.get(i)
      if (key === undefined) {
        moveMap.set(i, 0)
      }
    }

    moveKeys.forEach((moveKey) => {
      if (key === 'weekday') {
        result.push({
          key, // "weekday" or "weekend"
          move: moveKey, // Move key
          value: moveMap.get(moveKey)! / weekdayCnt,
        });  
      } else {
        result.push({
          key, // "weekday" or "weekend"
          move: moveKey, // Move key
          value: moveMap.get(moveKey)! / holidayCnt,
        });
      }
    });
  };

  processBuckets(data.weekday.by_move.buckets, "weekday");
  processBuckets(data.weekend.by_move.buckets, "weekend");

  return result;
}
export function normalizedWeekdaysData(data: any) {
  return [
    {
      key: "weekday",
      value: Math.round(data.weekday.pop_by_weekdays.value),
    },
    {
      key: "weekend",
      value: Math.round(data.weekend.pop_by_weekdays.value),
    },
  ];
}
export function normalizedWeekdaysData2(data: any, weekdayCnt: number, holidayCnt:number) {
  return [
    {
      key: "weekday",
      value: Math.round(data.weekday.pop_by_weekdays.value) / weekdayCnt,
    },
    {
      key: "weekend",
      value: Math.round(data.weekend.pop_by_weekdays.value) / holidayCnt,
    },
  ];
}
export function normalizedTimeznADMMoveData(data: any, moveKeys: number[]) {
  const result: any[] = [];
  data.forEach((timezn: any) => {
    // 모든 moveKeys에 대해 기본값을 처리
    moveKeys.forEach((moveKey) => {
      result.push({
        key: timezn.key, // 시간대 키
        move: moveKey, // 이동 키
        value: timezn[`MOV${moveKey}`]?.value || 0, // 값이 없으면 0으로 설정
      });
    });
  });

  return result;
}
export function normalizedTimeznMoveData(data: any, moveKeys: number[]) {
  const result: any[] = [];
  data.forEach((timezn: any) => {
    // 모든 moveKeys에 대해 기본값을 처리
    const moveMap = new Map<number, number>();
    timezn.by_move.buckets.forEach((moveBucket: any) => {
      moveMap.set(moveBucket.key, moveBucket.pop_by_move.value);
    });

    moveKeys.forEach((moveKey) => {
      result.push({
        key: timezn.key, // 시간대 키
        move: moveKey, // 이동 키
        value: moveMap.get(moveKey) || 0, // 값이 없으면 0으로 설정
      });
    });
  });

  return result;
}

export function normalizedBucketData(data: any, ptrn?: number) {
  return data.map((bucket: any) => ({
    key: bucket.key_as_string || bucket.key,
    ...(ptrn !== undefined && { ptrn: ptrn }),
    value: bucket.total.value,
  }));
}

export function normalizedPurposeData(data: any) {
  const map = keyMap["purpose"];
  return data.map((purpose: any) => ({
    key: map[purpose.key],
    value: purpose.pop_by_purpose.value,
  }));
}

export function normalizedWayData(data: any) {
  const map = keyMap["way"];
  return data.map((way: any) => ({
    key: map[way.key],
    value: way.pop_by_way.value,
  }));
}
export function normalizedSexMoveData(data: any, moveKeys: number[]) {
  const result: any[] = [];

  // 누락된 moveKeys 처리
  moveKeys.forEach((moveKey) => {
    // moveKey에 해당하는 데이터를 찾음
    const moveData = data.find((move: any) => move.key === moveKey);

    // 남성 데이터 추가
    result.push({
      key: "남성",
      move: moveKey,
      value: moveData?.total_male?.value || 0, // 값이 없으면 0으로 설정
    });

    // 여성 데이터 추가
    result.push({
      key: "여성",
      move: moveKey,
      value: moveData?.total_female?.value || 0, // 값이 없으면 0으로 설정
    });
  });

  return result;
}

export function normalizedSexData(data: any, keyStr?: string, ptrn?: number) {
  const result: any = [];
  // stayDiv의 각 키를 처리
  Object.entries(data)
    .filter(([key]) => key.startsWith("total_"))
    .forEach(([key, { value }]: any) => {
      if (key === "total_male")
        result.push({
          key: "남성",
          ...(keyStr !== undefined && { pop: keyStr }),
          ...(ptrn !== undefined && { ptrn: ptrn }),
          value: Math.round(value) || 0,
        });
      // 여성 데이터 추가
      else
        result.push({
          key: "여성",
          ...(keyStr !== undefined && { pop: keyStr }),
          ...(ptrn !== undefined && { ptrn: ptrn }),
          value: Math.round(value) || 0,
        });
    });
  return result;
}

export function normalizedAgeData(
  data: Record<string, any>,
  keyStr?: string,
  ptrn?: number
) {
  const ageRanges: Record<string, number> = {};

  // 입력 데이터 순회
  Object.entries(data)
    .filter(([key]) => /^f\d{2,}$|^m\d{2,}$/.test(key)) // 'fXX' 또는 'mXX' 형식만 포함
    .forEach(([key, { value }]) => {
      const ageGroup = key.slice(1); // 연령대 추출 (예: "f20"에서 "20")
      if (!ageRanges[ageGroup]) {
        ageRanges[ageGroup] = 0; // 초기화
      }
      ageRanges[ageGroup] += value; // 연령별로 값을 누적
    });

  // 결과를 배열 형식으로 반환
  const result = Object.entries(ageRanges).map(([age, total]) => ({
    key: age, // 연령대
    ...(keyStr !== undefined && { pop: keyStr }),
    ...(ptrn !== undefined && { ptrn: ptrn }),
    value: total, // 해당 연령대의 총합
  }));

  // 정렬 기준 정의
  const ageOrder = [
    "00",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
    "60",
    "65",
    "70",
    "75",
    "80",
  ];

  // 연령대 순서대로 정렬
  result.sort((a, b) => ageOrder.indexOf(a.key) - ageOrder.indexOf(b.key));
  return result;
}

export function normalizedAgeMoveData(
  data: Record<string, any>,
  moveKeys: number[]
) {
  const result: any[] = [];
  // 연령대 순서와 초기화 값 정의
  const ageOrder = [
    "00",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
    "60",
    "65",
    "70",
    "75",
    "80",
  ];

  // 각 moveKey에 대해 처리
  moveKeys.forEach((moveKey) => {
    // 연령대별 초기값 생성
    const ageRanges: Record<string, number> = {};
    ageOrder.forEach((age) => {
      ageRanges[age] = 0;
    });

    // data 배열에서 해당 moveKey와 관련된 데이터만 처리
    data
      .filter((bucket: any) => bucket.key === moveKey)
      .forEach((moveBucket: any) => {
        Object.entries(moveBucket)
          .filter(([key]) => key.startsWith("f") || key.startsWith("m"))
          .forEach(([key, { value }]: any) => {
            const ageGroup = key.slice(1); // 연령대 추출
            if (ageRanges[ageGroup] !== undefined) {
              ageRanges[ageGroup] += value; // 값 누적
            }
          });
      });

    // 결과에 데이터 추가
    const ageResult = ageOrder.map((age) => ({
      key: age,
      move: moveKey,
      value: ageRanges[age], // 값이 없으면 기본값 0
    }));

    result.push(...ageResult);
  });
  return result;
}

export function normalizedSexAgeData(
  data: Record<string, any>,
  keyStr?: string,
  ptrn?: number
) {
  return Object.entries(data)
    .filter(
      ([key]) =>
        (key.startsWith("f") || key.startsWith("m")) &&
        key.toLowerCase() !== "meta"
    )
    .map(([key, value]: [string, { value: number }]) => ({
      key: key.toUpperCase(), // 예: F10, M20
      ...(keyStr !== undefined && { pop: keyStr }),
      ...(ptrn !== undefined && { ptrn: ptrn }),
      value: value.value,
    }));
}

export function normalizedStayDayData(data: any, stayDiv?: string[]) {
  const result: any = [];
  if (Array.isArray(data)) {
    if (stayDiv) {
      // 데이터가 배열 형식일 때 처리
      data.forEach(({ key, filtered_by_stay_days, by_stay_total }) => {
        result.push({
          region: key,
          key: "by_stay_total",
          stay: 3,
          value: by_stay_total.value,
        });

        Object.entries(filtered_by_stay_days.buckets).forEach(
          ([stayKey, bucket]: any) => {
            const idx = stayKey.split("_")[stayKey.split("_").length - 1];
            return result.push({
              region: key,
              key: stayKey,
              stay: stayDiv.indexOf(idx),
              value: bucket.stay_day_sum.value,
            });
          }
        );
      });
    } else {
      data.forEach(({ key, by_stay_total, tot_pop_index }) => {
        result.push({
          key: key,
          value: tot_pop_index.value / by_stay_total.value,
        });
      });
    }
  } else {
    // 데이터가 객체 형식일 때 처리
    result.push({
      key: "by_stay_total",
      stay: 3,
      value: data["by_stay_total"]?.total?.value || 0,
    });

    stayDiv?.forEach((key, idx) => {
      const stayData = data[`by_stay_${key}`];
      if (stayData) {
        result.push({
          key: `by_stay_${key}`,
          stay: idx,
          value: stayData.total?.value || 0,
        });
      }
    });
  }

  return result;
}

export function normalizedLdgmtDayData(data: any, ldgmt?: string[]) {
  const result: any = [];
  if (Array.isArray(data)) {
    if (ldgmt) {
      // 데이터가 배열 형식일 때 처리
      data.forEach(({ key, filtered_by_ldgmt_days, by_ldgmt_total }) => {
        result.push({
          region: key,
          key: "by_ldgmt_total",
          ldgmt: 5,
          value: by_ldgmt_total.value,
        });

        Object.entries(filtered_by_ldgmt_days.buckets).forEach(
          ([ldmgtKey, bucket]: any) => {
            const idx = ldmgtKey.split("_")[ldmgtKey.split("_").length - 1];
            return result.push({
              region: key,
              key: ldmgtKey,
              ldgmt: ldgmt.indexOf(idx) + 1,
              value: bucket.tot_pop_num.value,
            });
          }
        );
      });
    } else {
      data.forEach(({ key, by_ldgmt_total, tot_pop_index }) => {
        result.push({
          key: key,
          value: tot_pop_index.value / by_ldgmt_total.value,
        });
      });
    }
  } else {
    // 데이터가 객체 형식일 때 처리
    result.push({
      key: "by_ldgmt_total",
      ldgmt: 5,
      value: data["by_ldgmt_total"]?.value || 0,
    });

    ldgmt?.forEach((key, idx) => {
      const ldgmtData = data[`by_ldgmt_${key}`];

      if (ldgmtData) {
        result.push({
          key: `by_ldgmt_${key}`,
          ldgmt: idx + 1,
          value: ldgmtData.tot_pop_num?.value || 0,
        });
      }
    });
  }

  return result;
}

export function normalizedStayDaysAvgData(data: any) {
  const result: any = [];

  const select_tot = data.tot_pop.value;
  const select_idx = data.tot_pop_index.value;
  const selectPop = select_idx / select_tot;

  result.push({
    key: data.key,
    value: selectPop,
  });
  return result;
}

export function normalizedLdgmtDaysAvgData(data: any) {
  const result: any = [];
  result.push({
    key: data.key,
    value: data.avg_ldgmt.value,
  });
  return result;
}

export function normalizedStayTimesAvgData(
  data: Record<
    string,
    {
      doc_count: number;
      stay_avg: { value: number };
    }
  >
) {
  const result: any = [];
  for (const [key, value] of Object.entries(data)) {
    result.push({
      key: Number(key),
      value: convertMinutesToHoursDecimal(value.stay_avg.value),
    });
  }
  return result;
}

export function normalizedStaySexData(data: any, stayDiv: string[]) {
  const result: any = [];

  // stayDiv의 각 키를 처리
  stayDiv.forEach((key, idx) => {
    const stayKey = `by_stay_${key}`;
    if (data[stayKey]) {
      const stayData = data[stayKey];

      // 남성 데이터 추가
      result.push({
        stay: idx,
        key: "남성",
        value: stayData.total_male?.value || 0,
      });

      // 여성 데이터 추가
      result.push({
        stay: idx,
        key: "여성",
        value: stayData.total_female?.value || 0,
      });
    } else {
      // 누락된 moveKeys 처리 (기본값 추가)
      result.push({
        stay: idx,
        key: "남성",
        value: 0,
      });
      result.push({
        stay: idx,
        key: "여성",
        value: 0,
      });
    }
  });

  return result;
}

export function normalizedLdgmtSexData(data: any) {
  return data.by_sex.buckets.flatMap((bucket: any) => {
    const sex = bucket.key === 0 ? "남성" : "여성";
    return Object.entries(bucket)
      .filter(([key, obj]) => key.startsWith("by_ldgmt"))
      .map(([ldgmtKey, { value }]: any) => ({
        ldgmt: parseInt(ldgmtKey.split("_")[2], 10),
        key: sex,
        value,
      }));
  });
}

export function normalizedStayTimesSexData(data: any) {
  const result: any = [];

  data.forEach((entry: { [key: string]: { [key: string]: number } }) => {
    const timeKey = entry.key;
    const maleValue = entry.total_male.value;
    const femaleValue = entry.total_female.value;

    result.push({ time: timeKey, key: "남성", value: maleValue });
    result.push({ time: timeKey, key: "여성", value: femaleValue });
  });

  return result;
}

export function normalizedStayAgeData(data: any, stayDiv: string[]) {
  const result: any = [];

  // stayDiv의 각 키를 처리
  stayDiv.forEach((key, idx) => {
    const stayKey = `by_stay_${key}`;
    if (data[stayKey]) {
      const stayData = data[stayKey];

      const ageOrder = [
        "00",
        "10",
        "15",
        "20",
        "25",
        "30",
        "35",
        "40",
        "45",
        "50",
        "55",
        "60",
        "65",
        "70",
      ];

      const ageRanges: Record<string, number> = {};
      ageOrder.forEach((age) => {
        ageRanges[age] = 0;
      });

      // data 배열에서 해당 moveKey와 관련된 데이터만 처리
      Object.entries(stayData)
        .filter(([key]) => key.startsWith("f") || key.startsWith("m"))
        .forEach(([key, { value }]: any) => {
          const ageGroup = key.slice(1); // 연령대 추출
          if (ageRanges[ageGroup] !== undefined) {
            ageRanges[ageGroup] += value; // 값 누적
          }
        });

      // 결과에 데이터 추가
      const ageResult = ageOrder.map((age) => ({
        key: age,
        stay: idx,
        value: ageRanges[age], // 값이 없으면 기본값 0
      }));

      result.push(...ageResult);
    }
  });
  return result;
}

export function normalizedLdgmtAgeData(data: any) {
  return data.by_age.buckets.flatMap((bucket: any) => {
    const ageKey = bucket.key.toString();
    return Object.entries(bucket)
      .filter(([key]) => key.startsWith("by_ldgmt"))
      .map(([ldgmtKey, { value }]: any) => ({
        ldgmt: parseInt(ldgmtKey.split("_")[2], 10),
        key: ageKey,
        value,
      }));
  });
}

export function normalizedStayTimesAgeData(data: any) {
  const result: any = [];
  data;
  const ageOrder = [
    "00",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
    "60",
    "65",
    "70",
    "75",
    "80",
  ];

  data.forEach((entry: { [key: string]: { [key: string]: number } }) => {
    ageOrder.forEach((age) => {
      const maleKey = `m${age}`;
      const femaleKey = `f${age}`;

      if (entry[maleKey] && entry[femaleKey]) {
        // Calculate the average value for the current age group
        const averageValue =
          (entry[maleKey].value + entry[femaleKey].value) / 2;

        // Push the normalized data into the result array
        result.push({
          key: age,
          time: entry.key, // Use the `key` from the entry as `time`
          value: averageValue,
        });
        result.push({
          key: undefined,
          time: entry.key,
          value: entry["total"].value,
        });
      }
    });
  });
  return result;
}

export function normalizedInflowData(data: any, key: string, region?: number) {
  const result: any = [];

  data.buckets.forEach((bucket: any) => {
    if (region && bucket.key === region) return;
    result.push({
      key: bucket.key,
      value: bucket[key].value,
    });
  });
  return result;
}

export function normalizedGetMaxAgeGroups(data: any) {
  // Define age groups
  const ageGroups: Record<number, string[]> = {
    0: ["f00", "m00"],
    1: ["f10", "m10", "f15", "m15"],
    2: ["f20", "m20", "f25", "m25"],
    3: ["f30", "m30", "f35", "m35"],
    4: ["f40", "m40", "f45", "m45"],
    5: ["f50", "m50", "f55", "m55"],
    6: ["f60", "m60", "f65", "m65"],
    7: ["f70", "m70", "f75", "m75"],
    8: ["f80", "m80"],
  };

  let maxAgeGroup = 0;
  let maxGroupValue = 0;

  // Calculate the total value for each age group and find the maximum
  for (const [group, keys] of Object.entries(ageGroups)) {
    const groupTotal = keys.reduce(
      (sum, key) => sum + (data[key]?.value || 0),
      0
    );
    if (groupTotal > maxGroupValue) {
      maxGroupValue = groupTotal;
      maxAgeGroup = Number(group);
    }
  }

  return { maxAgeGroup, maxGroupValue };
}

export function calculateCompare(data: any): number {
  if (data.by_lastYear.pop_by_lastYear.value === 0) {
    return 0;
  }
  return (
    Number(
      (
        ((data.by_start.pop_by_start.value -
          data.by_lastYear.pop_by_lastYear.value) /
          data.by_lastYear.pop_by_lastYear.value) *
        100
      ).toFixed(2)
    ) || 0
  );
}

export function normalizedRatioPop(data: any) {
  const result: any = [];

  data.map((bucket: any) => {
    result.push({
      key: bucket.key,
      value: bucket.pop_by_sido.value,
    });
  });
  return result;
}

export function normalizedMonsData(data: any, keyStr: string) {
  const result: any = [];

  data.map((bucket: any) => {
    result.push({
      key: bucket.key_as_string,
      month: keyStr,
      value: bucket.pop_by_month.value,
    });
  });
  return result;
}

export function normalizedMixRropStatus(data: any, keyStr: string) {
  const result: any = [];
  data.forEach((item: any) => {
    const { key, value } = item;

    value.forEach((entry: any) => {
      result.push({ key: entry.key, [keyStr]: key, value: entry.value });
    });
  });

  return result;
}
