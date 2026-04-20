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
  findMaxKeyAndRatio,
  findMaxMinForKeys,
  findMaxTimeForKeys,
  findMaxValue,
  getMaxCategoryDate,
  getMaxCategoryKey,
  getMaxCategoryPercentage,
  getMaxKeyPerDiv,
} from "@/helpers/getMax";

export function flowODTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}는 총 {${Math.round(data[index]).toLocaleString()}}명`;

    if (index === data.length - 1) {
      result += ` 입니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}
export function comparePeriodODTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const regionData = data.find((item: any) => item.구분 === regionName);
  let result = `{${regionName}} \n`;
  if (regionData) {
    const values = Object.values(regionData);
    result += `전년 동월 대비 ${legend[0].slice(0, 2)}은 ${calculateRate(
      values[2] as number,
      values[1] as number
    )},\n`;

    result += ` 전월 대비 ${legend[0].slice(0, 2)}은 ${calculateRate(
      values[2] as number,
      values[3] as number
    )}했습니다.`;
  }
  return result;
}

export function comparePeriodTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `전년 동월 대비 ${key.slice(0, 2)}은 ${calculateRate(
      data[1][key],
      data[0][key]
    )},`;
    if (data.length > 2) {
      result += ` 전월 대비 ${key.slice(0, 2)}은 ${calculateRate(
        data[1][key],
        data[2][key]
      )}`;
    }
    if (index === legend.length - 1) {
      result += `했습니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}

export function groupLineDayTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result +=
      `${key}는 최다: {${
        minMax[key].최대값.구분.split("/")[0] +
        "월 " +
        minMax[key].최대값.구분.split("/")[1] +
        "일"
      }} {${Math.round(minMax[key].최대값.값).toLocaleString()}}명, ` +
      `최소: {${
        minMax[key].최소값.구분.split("/")[0] +
        "월 " +
        minMax[key].최소값.구분.split("/")[1] +
        "일"
      }} {${Math.round(minMax[key].최소값.값).toLocaleString()}}명`;
    if (index === legend.length - 1) {
      result += ` 입니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}
export function groupLineDayMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const minMax = getMaxCategoryDate(data);
  let result = `{${regionName}} \n`;
  result += `최다 이동{${legend[0]}}인 {${minMax.maxCategory}}의 경우\n`;
  result += `{${
    minMax.maxDate.split("/")[0] + "월 " + minMax.maxDate.split("/")[1] + "일"
  }}에 가장 많이 {${legend[1] === "출발" ? "유입" : "유출"}}되었습니다.`;
  return result;
}
export function groupLineDayODTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, [regionName]);
  let result = `{${regionName}} \n`;

  result +=
    `${legend[0]}는 최다: {${
      minMax[regionName].최대값.구분.split("/")[0] +
      "월 " +
      minMax[regionName].최대값.구분.split("/")[1] +
      "일"
    }} {${Math.round(minMax[regionName].최대값.값).toLocaleString()}}명, ` +
    `최소: {${
      minMax[regionName].최소값.구분.split("/")[0] +
      "월 " +
      minMax[regionName].최소값.구분.split("/")[1] +
      "일"
    }} {${Math.round(
      minMax[regionName].최소값.값
    ).toLocaleString()}}명입 니다.`;

  return result;
}
export function groupTimeLineRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, [regionName]);

  let result = `{${regionName}} \n`;
  result += `타지역${
    legend[0] === "유입인구"
      ? "에서 가장 많이 도착하는 "
      : "으로 가장 많이 출발하는 "
  }시간대는 {${minMax[regionName].최대값.구분}}시입니다.\n`;

  return result;
}
export function groupTimeLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;

  legend.forEach((key) => {
    result += `타지역${
      key.includes("유입")
        ? "에서 가장 많이 도착하는 "
        : "으로 가장 많이 출발하는 "
    }시간대는 {${minMax[key].최대값.구분}}시입니다.\n`;
  });

  return result;
}
export function sexTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    const max = data[0][key] > data[1][key] ? x[0] : x[1];
    result += `${key}는 {${max}}`;
    if (index === legend.length - 1) {
      result += `이 많습니다.`;
    } else {
      result += `이,\n`;
    }
  });

  return result;
}
export function groupBarSexTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const regionData = data.find((item: any) => item.구분 === regionName);
  let result = `{${regionName}} \n`;
  result += `${legend[0]}는 {${
    regionData.남성 > regionData.여성 ? "남성" : "여성"
  }}이 많습니다.`;

  return result;
}
export function sexMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const max = findMaxMinForKeys(data, legend.slice(0, 2));
  let result = `{${regionName}} \n`;
  result += `성별 최다 이동{${x[0]}}은\n`;
  result += `여성: {${max.여성.최대값.구분}}, 남성: {${max.남성.최대값.구분}}입니다.`;
  return result;
}
export function ageTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const minMax = findMaxTimeForKeys(data, legend);

  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}는 {${minMax[key].구분}}가(이)`;
    if (index === legend.length - 1) {
      result += ` 많습니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}
export function ageMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const max = getMaxCategoryKey(data);
  let result = `{${regionName}} \n`;
  result += `최다 연령대인 {${max.maxCategoryKey}}의 경우\n`;
  result += `{${max.maxCategory}} {${legend[0]}}이 가장 많습니다.`;
  return result;
}
export function sexAgeTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
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

  return (
    `{${regionName}} \n` +
    `${x[0]}의 남성 비율은 {${maleRatio}}%, 여성 비율은 {${femaleRatio}}% 이며\n` +
    `{${maxAgeGroup.ageGroup}}가(이) {${maxAgeGroupRatio}}%로 전 연령대중 가장 많습니다.`
  );
}
export function groupBarPurposeTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}의 주요 이동목적은 {${minMax[key].최대값.구분}}`;
    if (index === legend.length - 1) {
      result += `입니다`;
    } else {
      result += `이고,\n`;
    }
  });
  return result;
}
export function groupBarWayTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}의 주요 이동수단은 {${minMax[key].최대값.구분}}`;
    if (index === legend.length - 1) {
      result += `입니다.`;
    } else {
      result += `이고,\n`;
    }
  });
  return result;
}
export function groupBarDowTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `최다 ${key.slice(0, 2)} 요일은 {${minMax[key].최대값.구분}}요일`;
    if (index === legend.length - 1) {
      result += `입니다.`;
    } else {
      result += `이며,\n`;
    }
  });
  return result;
}
export function groupBarDowMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const minMax = getMaxCategoryKey(data);

  let result = `{${regionName}} \n`;
  result +=
    `최다 {${legend[1] === "출발" ? "유입" : "유출"}} 요일인 ${
      minMax.maxCategoryKey
    }요일의 경우\n` + `{${minMax.maxCategory}} ${legend[0]}이 가장 많습니다.`;
  return result;
}
export function stackWeekdaysMoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;
  const max = getMaxKeyPerDiv(data);
  result += `평일/휴일별 최다 이동{${legend[0]}}은\n평일 : {${max.평일}}, 휴일 : {${max.휴일}}입니다.`;
  return result;
}
export function stackWeekdaysRatioTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;
  x.forEach((key, index) => {
    const difference =
      ((data[index][legend[1]] - data[index][legend[0]]) /
        data[index][legend[0]]) *
      100;
    const comparison =
      data[index][legend[1]] > data[index][legend[0]] ? "많" : "적";

    result += `${key}는 평일 대비 휴일에 {${Math.abs(difference).toFixed(
      0
    )}}% 더 {${comparison}}`;

    if (index === x.length - 1) {
      result += `습니다.`;
    } else {
      result += `고,\n`;
    }
  });
  return result;
}
// 증감율 계산 함수
export function calculateRate(current: number, previous: number): string {
  if (previous === 0) return "-"; // 이전 값이 0일 경우
  const rate = ((current - previous) / previous) * 100;
  return rate > 0
    ? `{${rate.toFixed(1)}}% {증가}`
    : `{${Math.abs(rate).toFixed(1)}}% {감소}`;
}

export function MoveTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const max = getMaxCategoryPercentage(data, legend)[legend[0]];
  let result = `{${regionName}} \n`;
  result += `주요 {${x[0]}}은 {${max.maxCategory}}(으)로, {${max.percentage}}%를 차지합니다.`;
  return result;
}
export function MoveMergedTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const max = findMaxKeyAndRatio(data);
  let result = `{${regionName}} \n`;
  result += `주요 {${x[0]}}은 {${max?.maxKey}}(으)로, {${max?.ratio.toFixed(
    1
  )}}%를 차지합니다.`;

  return result;
}
export function MoveFlowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const max = getMaxKeyPerDiv(data);
  let result = `{${regionName}} \n`;
  result += `{${legend[1]}}지역별 주요 이동{${legend[0]}}은\n`;

  const formattedResult = Object.entries(max)
    .map(([region, maxKey]) => `{${region}} : {${maxKey}}`)
    .reduce((acc, curr, index) => {
      // 두 개씩 한 줄로 처리
      if (index % 2 === 0) {
        acc.push(curr);
      } else {
        acc[acc.length - 1] += `, ${curr}`;
      }
      return acc;
    }, [] as string[])
    .join(",\n");

  result += formattedResult + `입니다.`;
  return result;
}
export function groupTimeLineMoveTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const max = getMaxCategoryDate(data);
  let result = `{${regionName}} \n`;
  result += `최다 {${legend[1]}}시간대의 주요 이동{${legend[0]}}은 {${max.maxDate}}시 {${max.maxCategory}}입니다.`;

  return result;
}

export function stayDaysRatioNTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): StatSummariesObj | StatSummaryObj {
  // regionName과 일치하는 데이터를 찾아 필터링
  const targetData = data.filter((item: any) => item["구분"] === regionName);

  if (targetData.length === 0) {
    console.error(`No matching data found for region: ${regionName}`);
    return { regionName, data: { stayDays: "No data available" } };
  }

  // undefined 항목을 totalPopulation으로 설정
  const totalPopulation = targetData[0][legend[0]] || 0;

  // 체류일수별 비율 계산
  const percentages = legend.slice(1).map((key: string) => ({
    구분: key,
    비율: totalPopulation
      ? ((targetData[0][key] / totalPopulation) * 100).toFixed(0) // 소수점 제거
      : "0", // 총합이 0인 경우
  }));

  // 비율을 템플릿에 맞게 문자열로 변환
  const ratiosString = percentages
    .map((item: any) => `${item["구분"]} : {${item["비율"]}}%`)
    .join(", ");

  // 최종 출력 문자열 구성
  const stat = `${legend[0]}은 ${ratiosString} 입니다.`;

  // 결과 객체 생성
  const result = {
    regionName,
    data: { stayDays: stat },
  };

  return result;
}

export function inflowRegionRatioMergedTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  const totalPopulation =
    data.find((item) => item["구분"] === undefined)?.["체류인구"] || 0;

  // 비율 계산 및 정렬
  const ratios = data
    .filter((item) => item["구분"]) // '구분'이 undefined가 아닌 경우만 처리
    .map((item) => ({
      category: item["구분"],
      ratio: ((item["체류인구"] / totalPopulation) * 100).toFixed(0), // 정수로 변환
    }))
    .sort((a, b) => Number(b.ratio) - Number(a.ratio)); // 비율 기준 내림차순 정렬

  // 템플릿 생성
  let result = `{${regionName}} \n`;
  ratios.forEach((item, index) => {
    result += `${index === 0 ? "" : ", "}{${item.category}}이 {${item.ratio}}%`;
  });
  result += ` 순으로 많습니다.`;

  return result;
}

// 체류인구현황 - 전년/전월대비 체류인구
export function stayComparePeriodTemplate(
  regionName: string,
  data: any[] | any,
  legend: string[]
): string {
  // 계산 함수: 두 값의 변화율을 계산 (비율 변환 및 정수)
  function calculateRate(current: number, previous: number): string {
    if (previous === 0) return "-"; // 이전 값이 0이면 변화를 계산할 수 없음
    const rate = ((current - previous) / previous) * 100;
    return `{${Math.abs(Number(rate.toFixed(2)))}}% {${
      rate > 0 ? "증가" : "감소"
    }}`;
  }

  // 숫자 포맷팅 함수
  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // 데이터를 정렬 가능한 배열 형태로 변환
  let transformedData: any[];

  if (Array.isArray(data)) {
    // 첫 번째 경우: 이미 배열로 입력됨
    transformedData = data.map((item) => ({
      구분: item.구분,
      value: item[legend[0]] || 0,
    }));
  } else {
    // 두 번째 경우: 단일 객체로 입력됨
    transformedData = Object.keys(data)
      .filter((key) => key !== "구분")
      .map((key) => ({
        구분: key,
        value: data[key],
      }))
      .sort((a, b) => {
        const aKey = a.구분.replace(/년|월/g, "").trim();
        const bKey = b.구분.replace(/년|월/g, "").trim();
        return parseInt(bKey) - parseInt(aKey); // 내림차순 정렬
      });
  }

  // 데이터 정렬: 구분값 기준 내림차순 정렬
  const sortedData = transformedData.sort((a, b) => {
    const aKey = a.구분.replace(/년|월/g, "").trim();
    const bKey = b.구분.replace(/년|월/g, "").trim();
    return parseInt(bKey) - parseInt(aKey);
  });

  // 필요한 데이터 추출 (최신, 전년 동월, 전월 데이터)
  const currentData = sortedData[0] || {};
  const previousYearData =
    sortedData.find((item) =>
      item.구분.includes(`${parseInt(currentData.구분.slice(0, 4)) - 1}년`)
    ) || {};
  const previousMonthData =
    sortedData.find((item) =>
      item.구분.includes(
        `${parseInt(currentData.구분.slice(0, 4))}년 ${parseInt(
          currentData.구분.slice(4, 6)
        )}월`
      )
    ) || {};

  // 본문 작성 시작
  let result = `{${regionName}} \n`;
  result += `체류인구 총 {${formatNumber(currentData.value || 0)}}명,\n`;

  // 체류 인구 변화율 비교
  legend.forEach((key, index) => {
    const yearOnYearRate =
      currentData.value && previousYearData.value
        ? calculateRate(currentData.value, previousYearData.value)
        : "-";
    const monthOnMonthRate =
      currentData.value && previousMonthData.value
        ? calculateRate(currentData.value, previousMonthData.value)
        : "-";
    result += `전년 동월 대비 ${yearOnYearRate}`;
    if (Object.keys(previousMonthData).length > 0) {
      result += ` 및 전월 대비 ${monthOnMonthRate}`;
    }
    if (index === legend.length - 1) {
      result += `했습니다.`;
    } else {
      result += `,\n`;
    }
  });

  return result;
}

// 체류인구현황 - 일별 체류인구 추이
export function stayDaysTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[]
): string {
  // 숫자 포맷 함수
  function formatNumber(num: number): string {
    return num?.toLocaleString() ?? "0"; // undefined나 null 처리
  }

  // 날짜 포맷 함수
  function formatDate(dateString: string): string {
    const [month, day] = dateString.split("/").map(Number);
    return `${month}월 ${day}일`;
  }

  // 데이터 키 추출
  const populationKey = legend[0] === "지역" ? regionName : legend[0];
  if (!populationKey || !data.every((d) => populationKey in d)) {
    throw new Error(`Invalid legend key: ${populationKey}`);
  }

  // 가장 많은 체류 인구와 가장 적은 체류 인구를 찾기
  const maxData = data.reduce((max, current) =>
    current[populationKey] > max[populationKey] ? current : max
  );
  const minData = data.reduce((min, current) =>
    current[populationKey] < min[populationKey] ? current : min
  );

  // 결과 작성
  const result =
    `{${regionName}} \n` +
    `{${formatDate(maxData["구분"])}}이 {${formatNumber(
      maxData[populationKey]
    )}}명으로 가장 많으며,\n` +
    `{${formatDate(minData["구분"])}}이 {${formatNumber(
      minData[populationKey]
    )}}명으로 가장 적습니다.`;

  return result;
}

// 체류인구현황 - 평일/휴일별 체류인구
export function stayDowTemplate(
  regionName: string,
  data: { [key: string]: any } | { [key: string]: any }[],
  legend: string[]
) {
  // 배열 확인 및 변환
  if (!Array.isArray(data)) {
    data = [data]; // 배열로 변환
  }

  let totalWeekday = 0;
  let totalHoliday = 0;
  const isSingle = data.length > 0 && data.every((d: any) => "체류인구" in d);
  if (isSingle) {
    // 첫 번째 형식 처리: '체류인구' 키가 있는 경우
    (data as { [key: string]: any }[]).forEach((item) => {
      if (item["구분"] === "평일") totalWeekday += item["체류인구"];
      if (item["구분"] === "휴일") totalHoliday += item["체류인구"];
    });
  } else {
    // 두 번째 형식 처리: '평일', '휴일' 키가 있는 경우
    (data as { [key: string]: any }[]).forEach((item) => {
      totalWeekday += item["평일"];
      totalHoliday += item["휴일"];
    });
  }

  const avgWeekday = Math.round((totalWeekday / (totalWeekday + totalHoliday)) * 100);
  const avgHoliday = Math.round((totalHoliday / (totalWeekday + totalHoliday)) * 100);
  // 퍼센트 증가율 계산
  const percentIncrease = avgWeekday - avgHoliday;

  // 결과 문자열 생성
  let result = `{${regionName}} \n`;
  result += `평일 {${totalWeekday.toLocaleString()}}명, 휴일 {${totalHoliday.toLocaleString(
    
  )}}명으로\n`;
  // result += `평일이 휴일에 비해 {${Math.abs(percentIncrease).toFixed(1)}}% 더 ${
  //   percentIncrease > 0 ? "많" : "적"
  // }습니다`;
  result += `전체 대비 평일 평균 체류인구 비중은 {${(avgWeekday.toFixed(1))}}%, 휴일 평균 체류인구 비중은 {${(avgHoliday.toFixed(1))}}%로, ${Math.abs(percentIncrease).toFixed(1)}% 차이 납니다.`
  return result;
}

// 체류인구현황 - 성연령별 체류인구
export function staySexAgeTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[]
) {
  // 전체 인구(남성+여성) 데이터
  const totalData = data.find((item) => item["구분"] === "기타");
  if (!totalData) {
    throw new Error("기타 데이터가 없습니다.");
  }

  const totalMale = totalData["남성"];
  const totalFemale = totalData["여성"];
  const totalPopulation = totalMale + totalFemale;

  // 성별 비율 계산
  const malePercentage = ((totalMale / totalPopulation) * 100).toFixed(1);
  const femalePercentage = ((totalFemale / totalPopulation) * 100).toFixed(1);

  // 각 연령대의 인구 비율 계산
  const ageGroupPercentages = data
    .filter((item) => item["구분"] !== "기타")
    .map((item) => {
      const groupPopulation = item["남성"] + item["여성"];
      const percentage = (groupPopulation / totalPopulation) * 100;
      return { group: item["구분"], percentage: percentage.toFixed(1) };
    });

  // 가장 큰 비율을 가진 연령대 찾기
  const maxAgeGroup = ageGroupPercentages.reduce((max, current) =>
    parseFloat(current.percentage) > parseFloat(max.percentage) ? current : max
  );

  // 결과 문자열 생성
  const result = `{${regionName}}\n남성 비율은 {${malePercentage}}%, 여성 비율은 {${femalePercentage}}%이며,\n{${maxAgeGroup.group}}가(이) {${maxAgeGroup.percentage}}%로 전 연령대 중 가장 많습니다.`;

  return result.trim();
}

// 체류인구현황 - 월별 연령대별 체류인구
export function stayMonsAgeTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[]
) {
  const sortedData = data.sort((a, b) => a.구분.localeCompare(b.구분));
  // 가장 최근 데이터와 바로 이전 데이터 선택
  const currentYear = sortedData[sortedData.length - 1];
  const previousYear = sortedData[0];

  // 증가한 연령대 필터링
  const ageGroups = [
    "10세 미만",
    "10~14세",
    "15~19세",
    "20~24세",
    "25~29세",
    "30~34세",
    "35~39세",
    "40~44세",
    "45~49세",
    "50~54세",
    "55~59세",
    "60~64세",
    "65~69세",
    "70~74세",
    "75~79세",
    "80세 이상",
  ];
  const increasedAges = ageGroups.filter((ageGroup) => {
    return currentYear[ageGroup] > previousYear[ageGroup];
  });

  // 연령대 표시 형식 변환
  const uniqueCategories = Array.from(new Set(increasedAges));
  const ageResult = uniqueCategories.join(", ");
  const IncreasedType =
    increasedAges.length === 0
      ? 0
      : ageGroups.length !== increasedAges.length
      ? 1
      : 2;
  // 결과 메시지 생성
  return IncreasedType === 0
    ? `{${regionName}}\n전년 동월 대비 체류인구가 \n증가한 연령대가 없습니다.`
    : IncreasedType === 1
    ? `{${regionName}}\n전년 동월 대비 체류인구가 \n증가한 연령대는 {${ageResult}} 입니다.`
    : `{${regionName}}\n전년 동월 대비 체류인구는 모든 연령대가 증가하였습니다.`;
}

// 체류인구현황 - 주민등록인구 대비 체류인구 비교
export function stayRropTemplate(
  regionName: string,
  data: { [key: string]: any }[]
) {
  // 데이터 추출
  const residentData = data.find((item) => item["구분"] === "주민등록인구");
  const stayData = data.find((item) => item["구분"] === "체류인구");

  // 필요한 값 계산
  const residentPopulation = residentData?.["체류인구"] || 0;
  const stayPopulation = stayData?.["체류인구"] || 0;
  const ratio =
    stayPopulation && residentPopulation
      ? (stayPopulation / residentPopulation).toFixed(1)
      : 0;

  // 결과 문자열 생성
  const result = `{${regionName}}\n주민등록인구는 총 {${residentPopulation.toLocaleString()}}명,\n체류인구는 {${stayPopulation.toLocaleString()}}명으로\n주민등록인구 대비 체류인구는 {${ratio}}배 많습니다.`;

  return result;
}

// 체류인구현황 - 성별비교
export function staySexTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[]
) {
  let result = `{${regionName}}\n`;

  data.forEach((item) => {
    const category = item["구분"];
    const male = item["남성"];
    const female = item["여성"];
    const total = male + female;

    if (total === 0) return; // 비율 계산 불가 시 건너뜀

    const malePercentage = Math.round((male / total) * 100);
    const femalePercentage = 100 - malePercentage;

    if (malePercentage > femalePercentage) {
      result += `${category}는 {남성}이 {${malePercentage}%}로 더 많고,\n`;
    } else if (malePercentage === femalePercentage) {
      result += `${category}는 {남성}과 {여성}이 {${femalePercentage}%}로 같고,\n`;
    } else {
      result += `${category}는 {여성}이 {${femalePercentage}%}로 더 많고,\n`;
    }
  });

  // 마지막 줄의 "그리고"를 제거
  result = result.trim().replace(/고,$/, "습니다.").trim();
  return result.trim();
}

// 체류인구현황 - 연령별비교
// export function stayAgeTemplate(
//   regionName: string,
//   data: { [key: string]: any }[],
//   legend: string[]
// ) {
//   // 총합 계산
//   const totalPopulation = data.reduce(
//     (acc, curr) => {
//       acc["주민등록인구"] += curr["주민등록인구"];
//       acc["체류인구"] += curr["체류인구"];
//       return acc;
//     },
//     { 주민등록인구: 0, 체류인구: 0 }
//   );

//   // 가장 많은 값 계산
//   const maxGroups = legend.reduce((acc: any, key) => {
//     const maxGroup = data.reduce(
//       (max, curr) =>
//         curr[key] > max.value ? { group: curr["구분"], value: curr[key] } : max,
//       { group: "", value: 0 }
//     );
//     acc[key] = maxGroup;
//     return acc;
//   }, {} as { [key: string]: { group: string; value: number } });

//   // 비율 계산
//   const maxGroupPercent = {
//     주민등록인구: (
//       (maxGroups["주민등록인구"].value / totalPopulation["주민등록인구"]) *
//       100
//     ).toFixed(0),
//     체류인구: (
//       (maxGroups["체류인구"].value / totalPopulation["체류인구"]) *
//       100
//     ).toFixed(0),
//   };
//   // 결과 문자열 생성
//   const result = `
//   {${regionName}}
//   주민등록인구는 {${maxGroups["주민등록인구"].group}}가(이) {${maxGroupPercent["주민등록인구"]}}%로 가장 많고
//   체류인구는 {${maxGroups["체류인구"].group}}가(이) {${maxGroupPercent["체류인구"]}}%로 가장 많습니다.
//   `;

//   return result.trim();
// }

export function stayAgeTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[]
) {
  // 총합 계산
  const totalPopulation = data.reduce(
    (acc, curr) => {
      acc["주민등록인구"] += curr["주민등록인구"];
      acc["체류인구"] += curr["체류인구"];
      return acc;
    },
    { 주민등록인구: 0, 체류인구: 0 }
  );

  // 가장 많은 값 계산
  const maxGroups = legend.reduce((acc: any, key) => {
    const maxGroup = data.reduce(
      (max, curr) =>
        curr[key] > max.value ? { group: curr["구분"], value: curr[key] } : max,
      { group: "", value: 0 }
    );
    acc[key] = maxGroup;
    return acc;
  }, {} as { [key: string]: { group: string; value: number } });

  // 비율 계산
  const maxGroupPercent = {
    주민등록인구: (
      (maxGroups["주민등록인구"].value / totalPopulation["주민등록인구"]) *
      100
    ).toFixed(0),
    체류인구: (
      (maxGroups["체류인구"].value / totalPopulation["체류인구"]) *
      100
    ).toFixed(0),
  };

  // 결과 문자열 생성
  const result = `
  {${regionName}}
  주민등록인구는 ${
    maxGroups["주민등록인구"].group !== ""
      ? "{" + maxGroups["주민등록인구"].group + "}"
      : "-"
  }가(이) ${
    maxGroupPercent["주민등록인구"] !== "NaN"
      ? "{" + maxGroupPercent["주민등록인구"] + "}"
      : "-"
  }%로 가장 많고
  체류인구는 {${maxGroups["체류인구"].group}}가(이) {${
    maxGroupPercent["체류인구"]
  }}%로 가장 많습니다.
  `;

  return result.trim();
}

// 체류인구특성 - 체류일수별 특성/숙박일수별 특성/체류시간별 특성
export function stayDTRatioTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
): string {
  const isTimeIncluded = legend[0].includes("시간");
  let ratios: any = [];
  let result = `{${regionName}} \n`;
  if (isTimeIncluded) {
    data.forEach((item, index) => {
      if (item["구분"]) {
        result += `${index === 0 ? "" : ", \n"}${item["구분"]}는 {${item[
          legend[0]
        ].toLocaleString()}}명 `;
      }
    });
    result = result.slice(0, -2);
    result += "입니다.";
  } else {
    const totalPopulation = Array.isArray(data)
      ? data.find((item) => item["구분"] === undefined)?.[legend[0]]
      : data["전체"];
    if (Array.isArray(data)) {
      ratios = data
        .filter((item) => item["구분"])
        .map((item) => ({
          category: item["구분"],
          ratio: ((item[legend[0]] / totalPopulation) * 100).toFixed(0),
        }))
        .sort((a, b) => Number(b.ratio) - Number(a.ratio));
    } else {
      for (const label of x) {
        ratios.push({
          category: label,
          ratio: ((data[label] / totalPopulation) * 100).toFixed(0),
        });
      }
    }
  }

  // 템플릿 생성
  ratios.forEach((item: any, index: number) => {
    result += `${index === 0 ? "" : ", \n"}{${item.category}}이 {${
      item.ratio
    }}%`;
  });
  if (!isTimeIncluded) result += ` 순으로 많습니다.`;
  return result;
}

// 체류인구특성 - 평균 체류일수/평균 숙박일수/평균 체류시간
export function stayDTAvgRatioTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  if (!regionName || !data || !legend || legend.length === 0) {
    throw new Error("Invalid input parameters");
  }
  const legendKey = legend[0];
  const isTimeIncluded = legendKey.includes("시간");
  const avgRegionData = data.find(
    (item) => item["구분"] === "인구감소지역 평균"
  );
  let targetData: any = {};
  if (data.length === 2) {
    targetData = data.find((item) => item["구분"] !== "인구감소지역 평균");
  }
  targetData = data.find((item) => item["구분"] === regionName);

  if (!targetData || !avgRegionData) {
    throw new Error("Missing required data for region or average");
  }
  const regionValue = parseFloat(targetData[legendKey]);
  const avgValue = avgRegionData[legendKey];
  if (regionValue == null || avgValue == null) {
    throw new Error("Missing required legend values in data");
  }
  const comparison =
    regionValue > avgValue ? "높" : regionValue === avgValue ? "같" : "낮";

  if (isTimeIncluded) {
    return `{${regionName}} ${legendKey}은 {${regionValue.toFixed(
      2
    )}} 시간으로,\n 인구감소지역 평균${
      comparison === "같" ? "과" : "에 비해"
    } {${comparison}}습니다.`;
  } else {
    return `{${regionName}} ${legendKey}는 {${regionValue}}일로,\n 인구감소지역 평균${
      comparison === "같" ? "과" : "에 비해"
    } {${comparison}}습니다.`;
  }
}
// 체류인구특성 - 체류일수별 성연령별 분포/숙박일수별 성연령별 분포
export function stayDaysSexAgeRatioTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  if (!regionName || !data || !legend || legend.length === 0) {
    throw new Error("Invalid input parameters");
  }

  // 남성/여성 데이터 추출
  const maleData = data.find((item) => item["구분"] === "남성");
  const femaleData = data.find((item) => item["구분"] === "여성");

  if (!maleData || !femaleData) {
    throw new Error("성별 데이터가 없습니다");
  }

  const maleCount = maleData["1일"];
  const femaleCount = femaleData["1일"];

  if (maleCount == null || femaleCount == null) {
    throw new Error("데이터가 없습니다");
  }

  const comparison = maleCount > femaleCount ? "남성" : "여성";

  // 연령대별 데이터 추출
  const ageGroupMax = data
    .filter((item) => item["구분"].includes("세"))
    .map((item) => {
      const total = legend.reduce((sum, key) => sum + (item[key] || 0), 0);
      return { ageGroup: item["구분"], total };
    })
    .reduce((max, current) => (current.total > max.total ? current : max), {
      ageGroup: "",
      total: 0,
    });
  // 결과 문장 반환
  return `{${regionName}}\n${
    legend[0].includes("일") ? "1일 이하로 체류한" : "1박 이상 숙박한"
  } 체류인구는 {${comparison}}이 {${
    comparison === "남성" ? "여성" : "남성"
  }}보다 많고, {${ageGroupMax.ageGroup}}가(이) 가장 많습니다.`;
}
// 체류인구특성 - 유입지역별 특성
export function inflowRegionRatioTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  let result = [];
  if (data.length === 1) {
    // 지역별 비율 계산
    result = data.map((item) => {
      const total = legend
        .filter((key) => key !== "외부유입지역")
        .reduce((sum, key) => sum + (item[key] || 0), 0);

      // 타시도와 외부 유입 비율 계산
      const otherRegionRatio =
        total > 0 ? ((item["타시도"] / total) * 100).toFixed(0) : 0;
      const externalRegionRatio =
        total > 0 ? item["외부유입지역"].toFixed(1) : 0;

      // 결과 문장 생성
      return `{${item["구분"]}} \n타시도 거주자 체류 비중은 {${otherRegionRatio}}%로,\n외부 유입 비율은 {${item["외부유입지역명"]}}에서 {${externalRegionRatio}}%로 가장 높습니다.`;
    });
  } else {
    const filteredData = data.filter((d) => d["구분"] === regionName);
    result = filteredData?.map((item: any) => {
      const total = legend
        .filter((key) => key !== "외부유입지역")
        .reduce((sum, key) => sum + (item[key] || 0), 0);

      // 타시도와 외부 유입 비율 계산
      const otherRegionRatio =
        total > 0 ? ((item["타시도"] / total) * 100).toFixed(0) : 0;
      const externalRegionRatio =
        total > 0 ? item["외부유입지역"].toFixed(1) : 0;

      // 결과 문장 생성
      return `{${item["구분"]}} \n타시도 거주자 체류 비중은 {${otherRegionRatio}}%로,\n외부 유입 비율은 {${item["외부유입지역명"]}}에서 {${externalRegionRatio}}%로 가장 높습니다.`;
    });
  }

  return result.join("\n");
}
// 체류인구특성 - 유입지역별 체류일수별 특성
export function inflowDaysSexTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  // 필요한 데이터 추출
  const oneDayData = data.find((item) => item["구분"] === "1일");
  const averageData = data.find((item) => item["구분"] === "평균 체류일수");
  const totalOneDay = Object.entries(oneDayData ?? {}).reduce(
    (sum, [key, value]) => (key !== "구분" ? sum + Number(value) : sum),
    0
  );

  // 가장 큰 유입 지역 계산
  let maxRegion = "";
  let maxRegionPercent = 0;
  if (oneDayData) {
    Object.entries(oneDayData).forEach(([key, value]) => {
      if (key !== "구분") {
        const percent = ((Number(value) / totalOneDay) * 100).toFixed(1);
        if (Number(percent) > maxRegionPercent) {
          maxRegionPercent = Number(percent);
          maxRegion = key;
        }
      }
    });
  }

  // 평균 체류일수 추출
  const averageStay = Number(averageData?.["평균 체류일수"]).toFixed(1);

  // 결과 템플릿 생성
  const result = `{${regionName}} \n1일 이하 체류인구의 유입지역은 {${maxRegion}}가 {${maxRegionPercent}%}로 가장 많으며,\n {${maxRegion}}에서 유입된 체류인구의 평균 체류일수는 {${averageStay}}일 입니다.`;

  return result;
}
// 체류인구특성 - 체류시간별 일별 추이
export function stayTimeTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  let result = `{${regionName}} \n일별 체류시간별 차이는\n`;

  // 일별 최대 및 최소 체류인구 찾기
  let maxPopulation = -Infinity;
  let minPopulation = Infinity;
  let maxDate = "";
  let minDate = "";

  data.forEach((item) => {
    const date = item["구분"];
    const population = item["undefined"];

    // 최대값 확인
    if (population > maxPopulation) {
      maxPopulation = population;
      maxDate = date;
    }

    // 최소값 확인
    if (population < minPopulation) {
      minPopulation = population;
      minDate = date;
    }
  });

  // 날짜 형식 변환 (YYYYMMDD -> MM월 DD일)
  const formattedMaxDate = `${parseInt(
    maxDate.substring(4, 6),
    10
  )}월 ${parseInt(maxDate.substring(6, 8), 10)}일`;
  const formattedMinDate = `${parseInt(
    minDate.substring(4, 6),
    10
  )}월 ${parseInt(minDate.substring(6, 8), 10)}일`;

  // 결과 문장 생성
  result += `{${formattedMaxDate}}이 {${maxPopulation.toLocaleString()}}명으로 가장 많으며,\n`;
  result += `{${formattedMinDate}}이 {${minPopulation.toLocaleString()}}명으로 가장 적습니다.`;

  return result;
}
// 체류인구특성 - 체류시간별 성별 분포
export function stayTimeSexTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  // 동일한 '구분'을 합쳐 남성/여성 값을 합산한 새로운 구조 생성
  const combinedData = data.reduce((acc, curr) => {
    const existing = acc.find((item: any) => item["구분"] === curr["구분"]);
    if (existing) {
      // 남성, 여성 값이 있는 경우 합산
      if (curr["남성"] !== undefined) existing["남성"] += curr["남성"];
      if (curr["여성"] !== undefined) existing["여성"] += curr["여성"];
    } else {
      // 새로운 구분인 경우 객체 추가
      acc.push({
        구분: curr["구분"],
        남성: curr["남성"] || 0,
        여성: curr["여성"] || 0,
      });
    }
    return acc;
  }, [] as { 구분: string; 남성: number; 여성: number }[]);

  let result = `{${regionName}} \n`;

  combinedData.forEach((item: any, index: number) => {
    const stayTime = item["구분"];
    const maleCount = item["남성"];
    const femaleCount = item["여성"];

    const total = maleCount + femaleCount;
    const malePercentage = parseFloat(((maleCount / total) * 100).toFixed(1));
    const femalePercentage = parseFloat(
      ((femaleCount / total) * 100).toFixed(1)
    );
    const difference = parseFloat(
      (malePercentage - femalePercentage).toFixed(1)
    );
    const compareVal = Math.sign(difference) === 1 ? "많" : "적";

    result += `${stayTime}는 {남성}이 {${malePercentage}}%로 {여성} 대비 {${Math.abs(
      difference
    )}}% ${compareVal}${
      index === combinedData.length - 1 ? "습니다." : "으며,"
    }\n`;
  });

  return result.trim();
}

// 체류인구특성 - 체류시간별 연령대별 분포
export function stayTimeAgeTemplate(
  regionName: string,
  data: { [key: string]: any }[],
  legend: string[],
  x: string[]
) {
  let result = `{${regionName}} \n`;
  const totalPopulationByTime = data.reduce((acc, entry) => {
    if (entry["구분"] === "기타") return acc;
    acc[entry["구분"]] = legend.reduce(
      (sum, timeKey) => sum + (entry[timeKey] || 0),
      0
    ); // 값 검증
    return acc;
  }, {} as { [key: string]: number });

  const filteredData = data.filter((entry) => entry["구분"] !== "기타");
  const findMaxValue = (data: any[], keys: string[]) => {
    return keys.reduce((acc, key) => {
      const maxEntry = data.reduce(
        (max, current) => (current[key] > max[key] ? current : max),
        data[0]
      );
      acc[key] = {
        value: calculateGroupRatios(maxEntry, keys)[key],
        group: maxEntry["구분"],
      };
      return acc;
    }, {} as { [key: string]: { value: string; group: string } });
  };

  const calculateGroupRatios = (
    entry: { [key: string]: any },
    keys: string[]
  ) => {
    const totalSum = keys.reduce((sum, key) => sum + entry[key], 0);

    return keys.reduce((ratios, key) => {
      ratios[key] =
        totalSum > 0 ? ((entry[key] / totalSum) * 100).toFixed(1) : "0";
      return ratios;
    }, {} as { [key: string]: string });
  };

  const maxValArr = findMaxValue(filteredData, legend);
  legend.forEach((timeKey) => {
    result += `${timeKey}는 {${maxValArr[timeKey].group}}가(이) {${maxValArr[timeKey].value}%},\n`;
  });

  result = result.trim().replace(/,$/, "로 많습니다.");

  return result;
}
