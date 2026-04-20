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
  findMaxMinForKeys,
  findMaxTimeForKeys,
  findMaxTimeForKeyStr,
  findMaxValue,
  getAgeGroupWithHighestRatio,
  getMaxAgeGroupWithMaxCategory,
  getMaxCategoryDate,
  getMaxCategoryKey,
  getMaxCategoryPercentage,
  getMaxKeyPerDiv,
} from "@/helpers/getMax";
import { keyMap } from "@/config/keyMapConfig";

export function flowODTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let tot = "";
  let flow = "";
  legend.forEach((key, index) => {
    tot += `${key}는 총 {${
      data[index].tot ? Math.round(data[index].tot).toLocaleString() : "-"
    }}명`;
    flow += `최다 ${key.slice(0, 2)}지는 {${data[index].flow ?? "-"}}`;
    if (index === legend.length - 1) {
      tot += ` 입니다.`;
      flow += `입니다.`;
    } else {
      tot += `,\n`;
      flow += `이며,\n`;
    }
  });

  let result = {
    regionName,
    data: { tot, flow },
  };
  return result;
}
export function groupTimeLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const minMax = findMaxMinForKeys(data, legend);

  let stat = "";

  legend.forEach((key, index) => {
    stat += `최다 ${key.includes("유입") ? "유입" : "유출"}시간대는 {${
      minMax[key].최대값.구분 ?? "-"
    }}시`;
    if (index === legend.length - 1) {
      stat += `입니다.`;
    } else {
      stat += `이며,\n`;
    }
  });
  let result = {
    regionName,
    data: { timezn: stat },
  };
  return result;
}
export function groupTimeLineRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const minMax = findMaxMinForKeys(data, [regionName]);

  let stat = "";

  stat += `최다 ${legend.includes("유입") ? "유입" : "유출"}시간대는 {${
    minMax[regionName].최대값.구분 ?? "-"
  }}시입니다.\n`;

  let result = {
    regionName,
    data: { timezn: stat },
  };
  return result;
}
export function sexTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "";
  stat += `성별 비율은\n`;
  legend.forEach((key, index) => {
    if (legend.length > 1) {
      stat += `${key}의 경우 `;
    }
    const max = (data[0][key] > data[1][key] ? x[0] : x[1]) ?? "-";
    const maxValue =
      (data[0][key] > data[1][key] ? data[0][key] : data[1][key]) ?? "-";
    const ratio =
      ((maxValue / (data[0][key] + data[1][key])) * 100).toFixed(1) ?? "-";
    stat += `{${max}}이 {${ratio}}%로 더 `;
    if (index === legend.length - 1) {
      stat += `많습니다.`;
    } else {
      stat += `많으며,\n`;
    }
  });
  let result = {
    regionName,
    data: { sex: stat },
  };
  return result;
}
export function groupBarSexTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "";
  const regionData = data.find((item: any) => item.구분 === regionName);
  const maxValue =
    regionData.남성 > regionData.여성 ? regionData.남성 : regionData.여성;

  const ratio = (
    (maxValue / (regionData.남성 + regionData.여성)) *
    100
  ).toFixed(1);
  stat += `성별 비율은\n`;
  stat += `{${
    regionData.남성 > regionData.여성 ? "남성" : "여성"
  }}이 {${ratio}}% 로 더 많습니다.`;
  let result = {
    regionName,
    data: { sex: stat },
  };
  return result;
}
export function sexMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "";
  const max = findMaxMinForKeys(data, legend.slice(0, 2));
  stat += `성별 최다 {이동${x[0]}}은\n`;
  stat += `여성: {${max.여성.최대값.구분}}, 남성: {${max.남성.최대값.구분}}입니다.`;
  let result = {
    regionName,
    data: { sex: stat },
  };
  return result;
}
export function ageTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "연령대별 비율은\n";
  legend.forEach((key, index) => {
    const ratio = getAgeGroupWithHighestRatio(data, key);

    if (legend.length > 1) {
      stat += `${key}의 경우 `;
    }
    stat += `{${ratio.ageGroup}}가(이) {${ratio.ratio.toFixed(1)}}%로 가장`;
    if (index === legend.length - 1) {
      stat += ` 많습니다.`;
    } else {
      stat += ` 많으며,\n`;
    }
  });
  let result = {
    regionName,
    data: { age: stat },
  };
  return result;
}
export function ageMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxAgeGroupWithMaxCategory(data);
  let stat = "";
  stat += `최다 연령대인 {${max.maxAgeGroup}}의 경우\n`;
  stat += `{${max.maxCategory}} {${legend[0]}}이 가장 많습니다.`;
  let result = {
    regionName,
    data: { age: stat },
  };
  return result;
}
export function stackWeekdaysRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "";
  stat += `평일/휴일별 비율은\n`;
  x.forEach((key, index) => {
    const ratioWeek =
      (data[index][legend[0]] /
        (data[index][legend[1]] + data[index][legend[0]])) *
      100;
    const ratioWeeked =
      (data[index][legend[1]] /
        (data[index][legend[1]] + data[index][legend[0]])) *
      100;
    if (x.length > 1) {
      stat += `${key}의 경우 `;
    }
    stat += `평일 평균 {${ratioWeek.toFixed(
      1
    )}}%, 휴일 평균 {${ratioWeeked.toFixed(1)}}%`;

    if (index === x.length - 1) {
      stat += `입니다.`;
    } else {
      stat += `이며,\n`;
    }
  });
  let result = {
    regionName,
    data: { weekdays: stat },
  };
  return result;
}
export function MoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxCategoryPercentage(data, legend)[legend[0]];
  let stat = "";
  stat += `최다 {${x[0]}}은 {${max.maxCategory}}입니다.`;
  let result = {
    regionName,
    data: { move: stat },
  };
  return result;
}

//출도착지역 선택있는 경우에 출도착지역별 이동별 분석 차트 없어서
export function MoveNTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxCategoryPercentage(data, legend)[legend[0]];
  let stat = "";
  let flowStat = "";
  stat += `최다 {${x[0]}}은 {${max.maxCategory}}입니다.`;

  flowStat += `최다 {${legend[0].includes("유입") ? "출발" : "도착"}}지역은 {${
    legend[0].includes("유입")
      ? regionName.split(" -> ")[0]
      : regionName.split(" -> ")[1]
  }}이며,\n`;
  flowStat += `주요 {${x[0]}}은 {${max.maxCategory}}입니다.`;

  let result = {
    regionName,
    data: { move: stat, flowRegion: flowStat },
  };

  return result;
}
export function MoveMergedTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxKeyPerDiv(data);
  let stat = "";
  stat += `최다 {${x[0]}}은 {${max[regionName]}}입니다.`;
  let flowStat = "";

  flowStat += `최다 {${legend[0].includes("유입") ? "출발" : "도착"}}지역은 {${
    legend[0].includes("유입")
      ? regionName.split(" -> ")[0]
      : regionName.split(" -> ")[1]
  }}이며,\n`;
  flowStat += `주요 {${x[0]}}은 {${max[regionName]}}입니다.`;

  let result = {
    regionName,
    data: { move: stat, flowRegion: flowStat },
  };
  return result;
}
export function MoveFlowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxKeyPerDiv([data[0]]);
  let stat = "";
  stat += `최다 {${legend[1]}}지역은 {${data[0].구분}}이며,\n`;
  stat += `주요 {이동${legend[0]}}은 {${Object.values(max)[0]}}입니다.`;
  let result = {
    regionName,
    data: { flowRegion: stat },
  };
  return result;
}
export function stackWeekdaysMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxKeyPerDiv(data);
  let stat = "";
  stat += `평일/휴일별 최다 {이동${legend[0]}}은\n평일 : {${max.평일}}, 휴일 : {${max.휴일}}입니다.`;
  let result = {
    regionName,
    data: { weekdays: stat },
  };
  return result;
}
export function groupTimeLineMoveTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxCategoryDate(data);
  let stat = "";

  stat += `최다 {${legend[1]}}시간대의 주요 {이동${legend[0]}}은 {${max.maxDate}}시 {${max.maxCategory}}입니다.`;
  let result = {
    regionName,
    data: { timezn: stat },
  };
  return result;
}
export function mopTotalTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // 카테고리별 문구를 정의

  const categoryMessages: Record<string, string> = {
    inflowPop: `유입인구는\n총 {} 명 입니다.`,
    inflowRegion: `최다 유입지는\n{}입니다.`,
    flowPur: `최다 이동 목적은 {}입니다.`,
    outflowPop: `유출인구는\n총 {} 명 입니다.`,
    outflowRegion: `최다 유출지는\n{}입니다.`,
    flowWay: `최다 이동 수단은 {}입니다.`,
  };
  // 카테고리별 데이터 변환 로직 정의
  const categoryTransformers: Record<string, (value: any) => string> = {
    inflowPop: (value) => `${Math.round(value).toLocaleString()}`, // 숫자 포맷
    inflowRegion: (value) => `${value}`, // 문자열 그대로 사용
    flowPur: (value) => `${keyMap["purpose"][value]}`,
    outflowPop: (value) => `${Math.round(value).toLocaleString()}`, // 숫자 포맷
    outflowRegion: (value) => `${value}`, // 문자열 그대로 사용
    flowWay: (value) => `${keyMap["way"][value]}`,
  };

  // 결과 객체 초기화
  let result: StatSummaryObj = {
    regionName,
    data: {},
  };

  // 데이터 배열을 순회하며 key에 해당하는 메시지 생성
  data.forEach((item: any) => {
    const messageTemplate = categoryMessages[item.key]; // key에 해당하는 템플릿 가져오기
    const transformer = categoryTransformers[item.key]; // key에 해당하는 변환 함수 가져오기

    if (messageTemplate && transformer) {
      const transformedValue = transformer(item.value); // 데이터를 변환
      const message = messageTemplate.replace("{}", `{${transformedValue}}`); // {}를 변환된 값으로 대체
      result.data[item.key] = message; // 결과 객체에 추가
    }
  });
  return result;
}

// 체류인구현황 - 총 체류일수
export function stayStatTotalTemplate(
  regionName: string,
  data: any[],
  legend: string[],
  x: string[]
) {
  let stat = "";
  data.forEach((item) => {
    if (item["체류인구"]) {
      const val = item["체류인구"];
      stat = `체류인구는\n총 {${val?.toLocaleString() ?? "-"}}명 입니다.\n`;
    } else {
      stat = "";
    }
  });

  // 결과 객체 생성
  const result = {
    regionName,
    data: { prevMonth: stat.trim() },
  };

  return result;
}

// 체류인구현황 - 주민등록인구 대비 체류인구
export function stayStatResidRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
) {
  const residentPopulation =
    data.find((item: any) => item["구분"] === "주민등록인구")?.["체류인구"] ||
    0;
  const stayPopulation =
    data.find((item: any) => item["구분"] === "체류인구")?.["체류인구"] || 0;

  const ratio =
    stayPopulation && residentPopulation
      ? (stayPopulation / residentPopulation).toFixed(1)
      : 0;

  const stat = `${x[0]} 대비 ${x[1]}는\n{${ratio}}배 많습니다.`;

  const result = {
    regionName,
    data: { rropPop: stat },
  };

  return result;
}

// 체류인구현황 - 전년동기대비
export function stayStatLastRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
) {
  // 날짜 문자열을 파싱하여 타임스탬프로 변환하는 유틸리티 함수
  const parseDate = (str: string): number => {
    const match = /(\d{4})년 (\d{1,2})월/.exec(str);
    if (!match) return 0;
    return new Date(
      parseInt(match[1], 10),
      parseInt(match[2], 10) - 1
    ).getTime();
  };

  // 첫 번째 형식 데이터 처리 함수
  const processFirstFormat = (data: any[]): [number, number] => {
    const [lastYearData, currentYearData] = data.sort(
      (a, b) => parseDate(a["구분"]) - parseDate(b["구분"])
    );

    return [
      lastYearData?.["체류인구"] ?? null,
      currentYearData?.["체류인구"] ?? null,
    ];
  };
  // 두 번째 형식 데이터 처리 함수
  const processSecondFormat = (
    data: any[],
    regionName: string
  ): [number, number] => {
    const targetRegion = data.find((item) => item["구분"] === regionName);

    if (!targetRegion) {
      throw new Error(`Region "${regionName}" not found in data.`);
    }

    const dates = Object.keys(targetRegion).filter((key) =>
      /(\d{4})년 (\d{1,2})월/.test(key)
    );

    const sortedDates = dates.sort((a, b) => parseDate(a) - parseDate(b));
    return [targetRegion[sortedDates[0]], targetRegion[sortedDates[2]]];
  };

  // 데이터를 처리하여 인구수 반환
  let lastYearPopulation: number;
  let currentYearPopulation: number;

  try {
    if (Array.isArray(data) && data.some((item) => item["체류인구"])) {
      [lastYearPopulation, currentYearPopulation] = processFirstFormat(data);
    } else {
      [lastYearPopulation, currentYearPopulation] = processSecondFormat(
        data,
        regionName
      );
    }
  } catch (error) {
    console.error(error);
    return {
      regionName,
      data: { lastYear: "-" },
    };
  }
  if (currentYearPopulation) {
    // 증감 계산 및 결과 생성
    const diff = currentYearPopulation - lastYearPopulation;
    const percentage = ((diff / lastYearPopulation) * 100).toFixed(1);
    const status = diff > 0 ? "증가" : "감소";

    const stat = `전년 동기 대비 {${Math.abs(
      Number(percentage)
    )}}% ${status}하였습니다.`;
    return {
      regionName,
      data: { lastYear: stat },
    };
  }
  return { regionName, data: { lastYear: "-" } };
}

// 체류인구현황 - 성별비율
export function stayStatSexRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
) {
  const otherData = data.find((item: any) => item["구분"] === "기타");
  const male = otherData["남성"] || 0;
  const female = otherData["여성"] || 0;
  const total = male + female;

  let stat = "";

  if (total > 0) {
    const maleRatio = Math.round((male / total) * 100);
    const femaleRatio = 100 - maleRatio;

    // 성별 비율 메시지 생성
    if (maleRatio > femaleRatio) {
      stat = `성별 비율은\n{남성}이 {${maleRatio}}%로 더 많습니다.`;
    } else if (femaleRatio > maleRatio) {
      stat = `성별 비율은\n{여성}이 {${femaleRatio}}%로 더 많습니다.`;
    } else {
      stat = "성별 비율은\n남성과 여성이 {50}%로 동일합니다.";
    }
  } else {
    stat = "-";
  }

  return {
    regionName,
    data: { sexAge: stat },
  };
}

// 체류인구현황 - 연령대비율
export function stayStatAgeRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
) {
  if (!data || data.length === 0) {
    return {
      regionName,
      data: { monsAge: "-." },
    };
  }

  const ageData = data[0];
  const totalPopulation = Object.values(ageData)
    .filter((value) => typeof value === "number")
    .reduce((sum, value) => sum + value, 0);

  const ageRatios = Object.entries(ageData)
    .filter(([key, value]) => typeof value === "number")
    .map(([key, value]) => ({
      ageGroup: key,
      ratio: ((value as number) / totalPopulation) * 100,
    }));

  // 가장 높은 비율 찾기
  const maxAgeGroup = ageRatios.reduce((prev, current) =>
    prev.ratio > current.ratio ? prev : current
  );

  const stat = `연령대별 비율은\n{${
    maxAgeGroup.ageGroup
  }}가(이) {${maxAgeGroup.ratio.toFixed(1)}}%로 가장 많습니다.`;

  return {
    regionName,
    data: { monsAge: stat },
  };
}

// 체류인구현황 - 평일휴일비율
export function stayStatWeekRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
) {
  if (!data || data.length === 0) {
    return {
      regionName,
      data: { weekdays: "-." },
    };
  }

  let weekdayPopulation = 0;
  let holidayPopulation = 0;

  if (
    Array.isArray(data) &&
    typeof data[0] === "object" &&
    "체류인구" in data[0]
  ) {
    // 첫 번째 데이터 구조: 평일/휴일이 각각 객체로 존재
    const weekdayData = data.find((item) => item["구분"] === "평일");
    const holidayData = data.find((item) => item["구분"] === "휴일");

    weekdayPopulation = weekdayData ? weekdayData["체류인구"] : 0;
    holidayPopulation = holidayData ? holidayData["체류인구"] : 0;
  } else if (
    Array.isArray(data) &&
    typeof data[0] === "object" &&
    regionName &&
    data.some((item) => item["구분"] === regionName)
  ) {
    // 두 번째 데이터 구조: 지역별 평일/휴일 값이 존재
    const targetRegionData = data.find((item) => item["구분"] === regionName);
    weekdayPopulation = targetRegionData ? targetRegionData["평일"] : 0;
    holidayPopulation = targetRegionData ? targetRegionData["휴일"] : 0;
  }

  const totalPopulation = weekdayPopulation + holidayPopulation;
  if (totalPopulation === 0) {
    return {
      regionName,
      data: { weekdays: "유효한 데이터가 없습니다." },
    };
  }

  const weekdayRatio = ((weekdayPopulation / totalPopulation) * 100).toFixed(1);
  const holidayRatio = ((holidayPopulation / totalPopulation) * 100).toFixed(1);

  const stat = `평일/휴일별 비율은\n평일 평균 {${weekdayRatio}}%, 휴일 평균 {${holidayRatio}}% 입니다.`;

  return {
    regionName,
    data: { weekdays: stat },
  };
}

// 체류인구특성 - 일별 체류일수 비율(단일지역)
export function stayDaysRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // undefined 항목을 totalPopulation으로 설정
  const totalPopulation =
    data.find((item: any) => item["구분"] === undefined)?.[legend[0]] || 0;

  // 체류일수별 비율 계산
  const percentages = data
    .filter((item: any) => item["구분"] !== undefined) // undefined 항목 제외
    .map((item: any) => ({
      구분: item["구분"],
      비율: totalPopulation
        ? ((item[legend[0]] / totalPopulation) * 100).toFixed(0) // 소수점 제거
        : "0", // 총합이 0인 경우
    }));

  // 비율을 템플릿에 맞게 문자열로 변환
  let ratiosString = percentages
    .map((item: any, index: number) =>
      legend[0].includes("숙박") && index === 1
        ? `${item["구분"]} : {${item["비율"]}}%,\n`
        : `${item["구분"]} : {${item["비율"]}}%`
    )
    .join(", ");

  // 최종 출력 문자열 구성
  const stat = `${legend[0]}은\n${ratiosString.replace("\n,", "\n")} 입니다.`;
  // 결과 객체 생성
  const result = {
    regionName,
    data: { [legend[0].includes("체류일수") ? "stayDays" : "ldgmtDays"]: stat },
  };

  return result;
}

// 체류인구특성 - 유입지역별 특성
export function inflowRegionRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  const max = getMaxCategoryPercentage(data, legend)[legend[0]];
  // 최종 출력 문자열 구성
  const stat = `유입지역별 비율은\n{${max.maxCategory}}에서 {${max.percentage}}%로 가장 많습니다.`;
  // 결과 객체 생성
  const result = {
    regionName,
    data: { inflowSgg: stat },
  };

  return result;
}
// 체류인구특성 - 평균 체류일수/평균 숙박일수/평균 체류시간
export function stayTimeAvgTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // regionName에 해당하는 데이터 검색
  const regionData = data.find((item: any) => item["구분"] === regionName);
  // 평균 체류일수 문자열 생성
  const stat = regionData
    ? `${legend[0]}${legend[0].includes("시간") ? "은" : "는"} {${
        regionData[legend[0]]
      }}${legend[0].includes("시간") ? "시간" : "일"} 입니다`
    : `-`;

  // 결과 객체 생성
  const result = {
    regionName,
    data: {
      [legend[0].includes("시간")
        ? "stayTimesAvg"
        : legend[0].includes("체류일수")
        ? "stayDaysAvg"
        : "ldgmtDaysAvg"]: stat,
    },
  };

  return result;
}
// 체류인구특성 - 일별 체류일수 비율/일별 숙박일수 비율(지역비교)
export function stayDaysRatioNTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let result = "";
  const regionData = data.find((item: any) => item["구분"] === regionName);

  const totalPopulation = regionData?.["전체"];
  const percentages = [];
  // 체류일수별 비율 계산
  for (const label of x) {
    percentages.push({
      구분: label,
      비율: totalPopulation
        ? ((regionData[label] / totalPopulation) * 100).toFixed(1)
        : "0",
    });
  }

  const ratiosString = percentages
    .map((item: any) => `${item["구분"]} : {${item["비율"]}}%`)
    .join(", ");

  result = `${legend[0]}은\n ${ratiosString} 입니다.`;

  return {
    regionName,
    data: {
      [legend[0].includes("체류") ? "stayDays" : "ldgmtDays"]: result,
    },
  };
}

export function llpTotalTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // 카테고리별 문구를 정의
  const stayPop = `체류인구는 총 {${Math.round(
    data.stayPop[0].value
  ).toLocaleString()}} 명입니다.`;
  const resid = `주민등록인구 대비 체류인구는 {${(
    data.stayPop[0].value / data.residPop[0].value
  ).toFixed(1)}}배 많습니다.`;
  const stayTimesAvg = data.stayTimesAvg
    ? `평균 체류시간은 {${data.stayTimesAvg[1].value}}시간 입니다.`
    : "-";
  const stayDays = data.stayDays
    ? `체류일수별 비율은\n1일 : {${Math.round(
        (data.stayDays[1].value / data.stayDays[0].value) * 100
      )}}%, 2~7일 : {${Math.round(
        (data.stayDays[2].value / data.stayDays[0].value) * 100
      )}}%, 8일 이상: {${Math.round(
        (data.stayDays[3].value / data.stayDays[0].value) * 100
      )}}% 입니다.`
    : "-";

  //숙박 일수
  const ratioDays = data.ldgmtDays
    ? `숙박일수별 비율은 \n무박 : {${Math.round(
        (data.ldgmtDays[1].value / data.ldgmtDays[0].value) * 100
      )}}%, 1박 : {${Math.round(
        (data.ldgmtDays[2].value / data.ldgmtDays[0].value) * 100
      )}}%,\n2박 : {${Math.round(
        (data.ldgmtDays[3].value / data.ldgmtDays[0].value) * 100
      )}}%, 3박 이상 : {${Math.round(
        (data.ldgmtDays[4].value / data.ldgmtDays[0].value) * 100
      )}}%\n입니다`
    : "-";

  const flowRegion = `유입지역별 비율은\n{${
    data.flowRegion[0].key
  }}에서 {${data.flowRegion[0].value.toFixed(1)}}%로 가장 많습니다.`;

  let result: StatSummaryObj = {
    regionName,
    data: {
      stayPop,
      resid,
      stayTimesAvg,
      stayDays,
      day: ratioDays,
      flowRegion,
    },
  };

  return result;
}

export function groupLineDowTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "";
  const minMax = findMaxMinForKeys(data, legend);

  legend.forEach((key, index) => {
    stat += `${key}는 {${minMax[key].최대값.구분}요일}`;
    if (index === legend.length - 1) {
      stat += `에 가장 많습니다.`;
    } else {
      stat += `,\n`;
    }
  });
  return {
    regionName,
    data: { dow: stat },
  };
}
export function ptrnsexAgeTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let age = "";
  let ratio = "생활인구 비율은\n";
  const ageData = data.filter(
    (item: any) => item["구분"] !== "남성" && item["구분"] !== "여성"
  );
  const ageMax = findMaxTimeForKeys(ageData, legend);

  const mtot = data.find((item: any) => item.구분 === "남성");
  const ftot = data.find((item: any) => item.구분 === "여성");
  const totData = data.filter(
    (item: any) => item.구분 === "남성" || item.구분 === "여성"
  );

  const tot = legend.reduce(
    (sum, key) =>
      sum +
      totData.reduce(
        (acc: any, entry: any) => acc + (Number(entry[key]) || 0),
        0
      ),
    0
  );
  legend.forEach((key, index) => {
    const sexMax = mtot[key] > ftot[key] ? "남성" : "여성";
    age += `${key}는 {${sexMax}}과 {${ageMax[key].구분}}`;

    const categoryTot = mtot[key] + ftot[key];
    ratio += `${key} : {${((categoryTot / tot) * 100).toFixed(1)}}%`;
    if (index === legend.length - 1) {
      age += `가 가장 많습니다.`;
      ratio += ` 입니다.`;
    } else if (index === 0) {
      age += `,\n`;
      ratio += `,`;
    } else {
      age += `,\n`;
      ratio += `,\n`;
    }
  });
  return { regionName, data: { age, ratio } };
}
export function ptrnDayLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let pday = "";

  const minMax = findMaxTimeForKeys(data, legend);

  legend.forEach((key, index) => {
    pday += `${key}는 {${
      minMax[key].구분.split("/")[0] +
      "월 " +
      minMax[key].구분.split("/")[1] +
      "일"
    }} {${minMax[key].최대값.toLocaleString()}}명`;

    if (index === legend.length - 1) {
      pday += `으로 가장 많습니다.`;
    } else {
      pday += `,\n`;
    }
  });

  return { regionName, data: { pday } };
}
export function totTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const isForn = legend[0].includes("외국인");
  let stat = "";

  //단일지역일경우 구분이 날짜
  //비교지역일경우 구분이 지역명
  stat += `${isForn ? "외국인" : "내국인"} 생활인구는\n`;
  if (data[0].구분.includes("년")) {
    stat += `{${data[1][legend[0]].toLocaleString()}}명 입니다.`;
  } else {
    const regionData = data.find((item: any) => item.구분 === regionName);
    const values: any = Object.values(regionData);
    stat += `{${values[2].toLocaleString()}}명 입니다.`;
  }

  return { regionName, data: { [isForn ? "fornTot" : "tot"]: stat } };
}

export function fornTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let fornNat = "";
  fornNat += `국가별 외국인 생활인구는\n{${data[0].구분}} 비중이 가장 많습니다.`;

  return { regionName, data: { fornNat } };
}
export function sexAgeTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  let sex = "";
  let age = "";
  // 남성 비율, 여성 비율, 최다 연령대 계산
  const totalMale = data.reduce(
    (sum: any, item: { 남성: any }) => sum + item.남성,
    0
  );
  const totalFemale = data.reduce(
    (sum: any, item: { 여성: any }) => sum + item.여성,
    0
  );

  const totalPopulation = totalMale + totalFemale;
  const maleRatio = ((totalMale / totalPopulation) * 100).toFixed(1);
  const femaleRatio = ((totalFemale / totalPopulation) * 100).toFixed(1);
  const maxRatio = maleRatio > femaleRatio ? maleRatio : femaleRatio;

  sex += `내국인 성별 비율은\n{${
    maleRatio > femaleRatio ? "남성" : "여성"
  }}이 {${maxRatio}}%로 더 많습니다.`;

  const maxAgeGroup = data.reduce(
    (max: { total: number }, item: { 구분: any; 남성: any; 여성: any }) => {
      const groupTotal = item.남성 + item.여성;
      if (groupTotal > max.total) {
        return { ageGroup: item.구분, total: groupTotal };
      }
      return max;
    },
    { ageGroup: "", total: 0 }
  );

  const maxAgeGroupRatio = (
    (maxAgeGroup.total / totalPopulation) *
    100
  ).toFixed(1);
  age += `내국인 연령대별 비율은\n{${maxAgeGroup.ageGroup}}가(이) {${maxAgeGroupRatio}}%로 가장 많습니다.`;

  return { regionName, data: { sex, age } };
}
export function inflowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = "내국인의 최다 유입지역은\n";
  //평일 값 data.length - 1 에 추가해둠
  stat += `평일에는 {${data[data.length - 1].구분}},`;
  stat += `휴일에는 {${data[0].구분}}입니다.`;
  return { regionName, data: { inflowWeek: stat } };
}
export function residTotTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let stat = `주민등록인구는 {${data[1].인구.toLocaleString()}}명,\n`;
  stat += `실제 거주하는 인구는 {${data[0].인구.toLocaleString()}}명 입니다.`;
  return { regionName, data: { tot: stat } };
}
export function residGroupTotTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const regionData = data.find((item: any) => item.구분 === regionName);

  let stat = `주민등록인구는 {${regionData.주민등록인구.toLocaleString()}}명,\n`;
  stat += `실제 거주하는 인구는 {${regionData.거주인구.toLocaleString()}}명 입니다.`;
  return { regionName, data: { tot: stat } };
}
export function residDayLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  const minMax = findMaxMinForKeys(data, legend);
  let stat = `{${regionName}} \n`;

  //주민등록인구
  stat += `주민등록인구는 {${minMax[
    legend[2]
  ].최대값.값.toLocaleString()}}명,\n`;
  stat += `거주인구는 ${legend[1].slice(5)}에 `;
  stat += `{${
    minMax[legend[1]].최대값.구분.split("/")[0] +
    "월 " +
    minMax[legend[1]].최대값.구분.split("/")[1] +
    "일"
  }} {${minMax[legend[1]].최대값.값.toLocaleString()}}명으로 가장 많고,\n`;
  stat += `${legend[0].slice(5)}에 `;
  stat += `{${
    minMax[legend[0]].최소값.구분.split("/")[0] +
    "월 " +
    minMax[legend[0]].최소값.구분.split("/")[1] +
    "일"
  }} {${minMax[legend[0]].최소값.값.toLocaleString()}}명으로 가장 적습니다.`;

  return { regionName, data: { pday: stat } };
}
export function residsexAgeTemplate(
  regionName: string,
  data: any,
  legend: string[]
): StatSummariesObj | StatSummaryObj {
  let age = "";
  let sex = "";
  const ageData = data.filter(
    (item: any) => item["구분"] !== "남성" && item["구분"] !== "여성"
  );
  const ageMax = findMaxTimeForKeys(ageData, legend);

  const mtot = data.find((item: any) => item.구분 === "남성");
  const ftot = data.find((item: any) => item.구분 === "여성");

  ["주민등록인구", "거주인구"].forEach((key, index) => {
    const sexMax = mtot[key] > ftot[key] ? "남성" : "여성";
    sex += `${key}는 {${sexMax}}이`;
    age += `${key}는 {${ageMax[key].구분}}`;

    if (index === legend.length - 1) {
      sex += `이 더 많습니다.`;
      age += `가 가장 많습니다.`;
    } else {
      sex += `,\n`;
      age += `,\n`;
    }
  });
  return { regionName, data: { age, sex } };
}

export function alpTotalTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // 카테고리별 문구를 정의
  let tot = "-";
  let age = "";
  let ratio = "-";

  if (data.tot) {
    tot = `생활인구는 {${Math.round(
      data.tot[0].value
    ).toLocaleString()}}명 입니다.`;

    ratio = "생활인구 비율은\n";
    const ageData = data.age.filter(
      (item: any) => item["구분"] !== "남성" && item["구분"] !== "여성"
    );
    const ptrn = ["거주인구", "직장인구", "방문인구"];
    const sex = ["남성", "여성"];
    const ageMax = findMaxTimeForKeys(ageData, ptrn);

    const mtot = data.age.find((item: any) => item.구분 === "남성");
    const ftot = data.age.find((item: any) => item.구분 === "여성");
    const totData = data.age.filter(
      (item: any) => item.구분 === "남성" || item.구분 === "여성"
    );

    const totPop = ptrn.reduce(
      (sum, key) =>
        sum +
        totData.reduce(
          (acc: any, entry: any) => acc + (Number(entry[key]) || 0),
          0
        ),
      0
    );
    ptrn.forEach((key, index) => {
      const sexMax = mtot[key] > ftot[key] ? "남성" : "여성";
      age += `${key}는 {${sexMax}}과 {${ageMax[key].구분}}`;

      const categoryTot = mtot[key] + ftot[key];
      ratio += `${key} : {${((categoryTot / totPop) * 100).toFixed(1)}}%`;
      if (index === ptrn.length - 1) {
        age += `가 가장 많습니다.`;
        ratio += ` 입니다.`;
      } else if (index === 0) {
        age += `,\n`;
        ratio += `,`;
      } else {
        age += `,\n`;
        ratio += `,\n`;
      }
    });
  }

  let inflowWeek = "-";
  if (data.inflowWeek) {
    inflowWeek = "최다 유입지역은\n";
    //평일 값 data.length - 1 에 추가해둠
    inflowWeek += `평일에는 {${data.inflowWeek[0].key}},`;
    inflowWeek += `휴일에는 {${data.inflowWeeked[0].key}}입니다.`;
  }
  let result: StatSummaryObj = {
    regionName,
    data: { tot, inflowWeek, ratio, age },
  };

  return result;
}
