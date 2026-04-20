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

// 원하는 연령대 순서 배열
const ageOrder = [
  "10세 미만",
  "10세",
  "15세",
  "20세",
  "25세",
  "30세",
  "35세",
  "40세",
  "45세",
  "50세",
  "55세",
  "60세",
  "65세",
  "70세",
  "75세",
  "80세 이상",
];
const ageGenOrder = [
  "10세 미만",
  "10대",
  "20대",
  "30대",
  "40대",
  "50대",
  "60대",
  "70대",
  "80세 이상",
];
// 데이터 정렬 함수
export function sortByAgeOrder(ageData: AgeData, isGen: boolean): AgeData {
  return (isGen ? ageGenOrder : ageOrder).reduce((sorted, ageGroup) => {
    if (ageData[ageGroup] !== undefined) {
      sorted[ageGroup] = ageData[ageGroup];
    }
    return sorted;
  }, {} as Record<string, number>);
}
export function sortByPatternAgeOrder(
  pattern: string,
  ageData: AgeData,
  isGen: boolean
): AgeData {
  return (isGen ? ageGenOrder : ageOrder).reduce((sorted, ageGroup) => {
    if (ageData[`${pattern}_${ageGroup}`] !== undefined) {
      sorted[ageGroup] = ageData[`${pattern}_${ageGroup}`];
    }
    return sorted;
  }, {} as Record<string, number>);
}
type AgeData = Record<string, number>;

export function sortBySexAgeOrder(
  comparative: string,
  ageData: SexAgeData,
  isGen: boolean
): Record<string, number> {
  return (isGen ? ageGenOrder : ageOrder).reduce((sorted, ageGroup) => {
    if (comparative === "unique") {
      // unique일 때: 단일 값
      const ageGroupData = ageData[ageGroup];
      if (
        ageGroupData &&
        typeof ageGroupData === "object" &&
        "value" in ageGroupData
      ) {
        sorted[ageGroup] = ageGroupData.value;
      } else {
        sorted[ageGroup] = 0; // 기본값
      }
    } else {
      // unique가 아닐 때: 여러 값을 합산
      const total = Object.entries(ageData)
        .filter(([key]) => key.includes(ageGroup)) // 특정 ageGroup이 포함된 항목 필터링
        .reduce((sum, [, value]) => {
          if (typeof value === "object" && "value" in value) {
            return sum + value.value;
          } else if (typeof value === "number") {
            return sum + value;
          }
          return sum; // 다른 경우는 무시
        }, 0);

      sorted[ageGroup] = total;
    }

    return sorted;
  }, {} as Record<string, number>);
}

type SexAgeData = Record<string, { value: number } | number>;

// 연령대를 매핑하는 함수
export function mapAgeToCategory(ageKey: string, isFive?: boolean): string {
  const age = parseInt(ageKey, 10);

  if (isFive) {
    if (isNaN(age)) return "기타";

    if (age < 10) return "10세 미만";
    if (age < 20) return "10대";
    if (age < 30) return "20대";
    if (age < 40) return "30대";
    if (age < 50) return "40대";
    if (age < 60) return "50대";
    if (age < 70) return "60대";
    if (age < 80) return "70대";

    return "80세 이상";
  } else {
    if (isNaN(age)) return "기타";

    // 이 부분 확인 필요
    if (age < 10) return "10세 미만";
    if (age < 15) return "10~14세";
    if (age < 20) return "15~19세";
    if (age < 25) return "20~24세";
    if (age < 30) return "25~29세";
    if (age < 35) return "30~34세";
    if (age < 40) return "35~39세";
    if (age < 45) return "40~44세";
    if (age < 50) return "45~49세";
    if (age < 55) return "50~54세";
    if (age < 60) return "55~59세";
    if (age < 65) return "60~64세";
    if (age < 70) return "65~69세";
    if (age < 75) return "70~74세";
    if (age < 80) return "75~79세";

    return "80세 이상";
  }
}
// 연령대 정렬을 위한 함수
export function ageGroupOrder(a: string, b: string): number {
  const ageOrder = keyMap["age"];
  return ageOrder.indexOf(a) - ageOrder.indexOf(b);
}
