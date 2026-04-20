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

import { convertCDtoNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";
import { findMaxRegionTime } from "@/helpers/getMax";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
export async function transSubzone(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let result: ChartDataContainer = {
    title: "하위 행정구역별, 시간대별 내국인 생활인구",
    summary: isGroup ? [] : "",
    charts: [],
  };

  for (const regionCode of regionArray) {
    //읍면동 단위 일때는 데이터 없음
    if (regionCode.length > 5) continue;
    const regionName = await convertCDtoNM(regionCode);
    const regionData = data.find(
      (item: any) => item.key.toString() === regionCode
    );

    const indicate: Indicate[] = [];
    if (hasExtraProperties(regionData)) {
      for (const timeznBucket of regionData.by_timezn.buckets) {
        for (const subzoneBucket of timeznBucket.by_subzone.buckets) {
          const subzoneName = await convertCDtoNM(subzoneBucket.key);
          indicate.push({
            구분: subzoneName,
            시간: `${timeznBucket.key}`,
            생활인구: subzoneBucket.tot_sum.value,
          });
        }
      }
      // 지역별로 먼저 정렬하고, 그 안에서 시간 순으로 정렬
      indicate.sort((a, b) => {
        // 지역명 기준으로 먼저 정렬
        if (a.구분 < b.구분) return -1;
        if (a.구분 > b.구분) return 1;

        // 시간 기준으로 정렬 (0~23시)
        const hourA =
          typeof a.시간 === "string"
            ? parseInt(a.시간.replace("시", ""), 10)
            : a.시간;
        const hourB =
          typeof b.시간 === "string"
            ? parseInt(b.시간.replace("시", ""), 10)
            : b.시간;
        return hourA - hourB;
      });

      const regionMax = findMaxRegionTime(indicate);

      const regionSummary =
        `{${regionName}}\n` +
        `{${regionMax.구분}}에서 {${formatTimeZone(
          regionMax.시간
        )}}에 {${Math.round(
          regionMax.생활인구
        ).toLocaleString()}}명으로 가장 많습니다.`;
      if (isGroup) {
        (result.summary as string[]).push(regionSummary);
      } else {
        result.summary = regionSummary;
      }
    } else {
      if (isGroup) {
        (result.summary as string[]).push("-");
      } else {
        result.summary = "-";
      }
      //데이터 없으면 차트 추가X
      continue;
    }
    result.charts.push({
      regionName,
      name: isGroup ? "districtDataGroup" : "districtData",
      indicate: indicate,
    });
  }
  return result;
}

export async function transSubzoneComparative(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let result: ChartDataContainer = {
    title: "하위 행정구역별 거주인구와 주민등록인구 비교",
    summary: isGroup ? [] : "",
    charts: [],
  };
  let summary: string = "";
  let summaries: string[] = [];

  for (const regionCode of regionArray) {
    //읍면동 단위 일때는 데이터 없음
    if (regionCode.length > 5) continue;
    const regionName = await convertCDtoNM(regionCode);

    const regionRsdnData = data.rsdn.find(
      (item: any) => item.key.toString() === regionCode
    );
    const regionUniqueData = data.unique.find((item: any) => item[regionCode])[
      regionCode
    ];

    const chartsData: Record<string, BaseChartData> = {
      sub: {
        ...(isGroup && { regionName }),
        name: `cDistrictData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      stack: {
        ...(isGroup && { regionName }),
        name: `cDistrictStackData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
    };

    if (hasExtraProperties(regionRsdnData) && regionUniqueData) {
      let maxRatio = -Infinity; // 거주인구가 많은 구분의 비율을 추적
      let minRatio = Infinity; // 거주인구가 적은 구분의 비율을 추적
      let maxRatioName = "-"; // 거주인구가 많은 구분의 이름
      let minRatioName = "-"; // 거주인구가 적은 구분의 이름

      for (const subzone of regionRsdnData.by_subzone.buckets) {
        const name = await convertCDtoNM(subzone.key); // 이름 변환
        const uniqueBucket = regionUniqueData.by_subzone.buckets.find(
          (uniqueSub: any) => uniqueSub.key === subzone.key
        );

        if (uniqueBucket) {
          const 거주인구 = subzone.tot_sum.value;
          const 주민등록인구 = uniqueBucket.tot_sum.value;

          // 차트 데이터 생성
          chartsData.sub.indicate.push({
            구분: name,
            거주인구,
            주민등록인구,
          });

          // 거주인구 대비 주민등록인구 비율 계산
          const ratio = 주민등록인구 > 0 ? 거주인구 / 주민등록인구 : 0;

          // 거주인구가 많은 구분을 찾기
          if (거주인구 > 주민등록인구 && ratio > maxRatio) {
            maxRatio = ratio;
            maxRatioName = name;
          }

          // 거주인구가 적은 구분을 찾기
          if (거주인구 < 주민등록인구 && ratio < minRatio) {
            minRatio = ratio;
            minRatioName = name;
          }
        }
      }
      const subSummary =
        `${regionName}\n` +
        `주민등록인구 대비 거주인구가 많은 곳은 {${maxRatioName}}이며,\n` +
        `주민등록인구 대비 거주인구가 적은 곳은 {${minRatioName}}입니다.`;

      if (isGroup) {
        summaries.push(subSummary);
      } else {
        summary = subSummary;
      }

      chartsData.stack.indicate = chartsData.sub.indicate;
    } else {
      if (isGroup) {
        summaries.push(`{${regionName}}\n` + "-");
      } else {
        summary = `{${regionName}}\n` + "-";
      }
    }
    result.summary = isGroup ? summaries : summary;

    result.charts.push(chartsData.sub);
    result.charts.push(chartsData.stack);
  }
  return result;
}
