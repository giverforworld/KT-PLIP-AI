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

import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import util from "util";

export async function transRank(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let results: ChartDataContainer = {
    title: "지역 랭킹",
    charts: [],
  };
  let stats: StatSummariesObj[] = [];
  //조회 지역에 읍면동 있으면 시군구 차트 없음 data.sgg === undefined

  // 처리할 키 목록 정의
  const keys: Array<{
    key: string;
    name: string;
  }> = [
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];

  const chartsData: Record<string, BaseChartData> = {};

  const regionName = "";

  // sgg와 adm 데이터 처리
  for (const { key, name } of keys) {
    const sggRegionArray = data.sgg?.[0]?.[key] || [];
    const admRegionArray = data.adm?.[0]?.[key] || [];

    const sggRankingData = await transformRankingData(sggRegionArray, key);
    const admRankingData = await transformRankingData(admRegionArray, key);
    const sggRatioData = await transformRankingRatioData(sggRegionArray, key);
    const admRatioData = await transformRankingRatioData(admRegionArray, key);

    // sgg 데이터 추가 (sgg가 있는 경우)
    if (data.sgg) {
      chartsData[`sggRanking${name}`] = {
        regionName,
        name: `alpRaceData${isGroup ? "Group" : ""}${name}`,
        indicate: sggRankingData,
      };
      chartsData[`sggRatio${name}`] = {
        regionName,
        name: `alpRaceData${isGroup ? "Group" : ""}${name}`,
        indicate: sggRatioData,
      };
    }

    // adm 데이터 추가
    chartsData[`admRanking${name}`] = {
      regionName,
      name: `alpRaceTownData${isGroup ? "Group" : ""}${name}`,
      indicate: admRankingData,
    };

    chartsData[`admRatio${name}`] = {
      regionName,
      name: `alpRaceTownData${isGroup ? "Group" : ""}${name}`,
      indicate: admRatioData,
    };
  }

  // chartsData의 값들을 results.charts에 추가
  results.charts.push(...Object.values(chartsData));

  return results;
}

async function transformRankingData(regionArray: any, key: string) {
  // 시군구 랭킹데이터
  const result: any = [];
  const dateMap: any = {};

  for (const region of regionArray) {
    const regionName = await convertCDtoFullNM(region.key);
    region.current_daily?.daily_population.buckets.forEach((popData: any) => {
      // popData와 daily_popul_avg 검증
      if (popData?.[`daily_popul_${key}`]) {
        const date = popData.key_as_string;
        const value = popData[`daily_popul_${key}`].value;

        // dateMap 초기화
        if (!dateMap[date]) {
          dateMap[date] = { 구분: date };
        }

        // 값 할당 (null 또는 undefined 방지)
        dateMap[date][regionName] = Math.round(value) || 0;
      }
    });
  }
  for (const date in dateMap) {
    const values = Object.keys(dateMap[date])
      .filter((key) => key !== "구분")
      .map((key) => dateMap[date][key]);
    const allZero = values.every((value) => value === 0);
    if (!allZero) result.push(dateMap[date]);
  }
  return result;
}

async function transformRankingRatioData(regionArray: any, key: string) {
  // 시군구 랭킹 데이터
  const result: any = [];
  const ratioMap: any = { 구분: "구분" }; // 결과 맵, '구분' 키 추가

  for (const region of regionArray) {
    const regionName = await convertCDtoFullNM(region.key);

    let lastYearData: number | null = null;
    let currentData: number | null = null;
    // region.popul_by_year.buckets 처리
    region.popul_by_year?.buckets.forEach((popData: any) => {
      if (popData?.key === "last_year") {
        lastYearData = popData[`popul_${key}`]?.value;
      } else if (popData?.key === "current") {
        currentData = popData[`popul_${key}`]?.value;
      }
    });

    // 증감률 계산
    if (lastYearData !== null && currentData !== null && lastYearData !== 0) {
      const changeRate = (currentData - lastYearData) / lastYearData; // 증감률 계산
      ratioMap[regionName] = parseFloat(changeRate.toFixed(1)); // 소수점 2자리까지 반올림하여 저장
    } else {
      ratioMap[regionName] = null; // 데이터 부족 시 null 처리
    }
  }

  // 결과 배열에 추가 (객체 형태로)
  result.push(ratioMap);

  return result;
}
