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

import { getUTCDate } from "@/helpers/convertDate";
import { convertCDtoNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";

export async function transformTimeData(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  const summaries: string[] = [];
  let summary: string = "";
  const indicateData: Array<Record<string, string | number>> = [];
  let oneRegionName = ""; //지역이 하나일때

  //지역 순서대로
  for (const regionCode of regionArray) {
    const regionData = data.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (hasExtraProperties(regionData)) {
      // 지역의 max, min 인구 정보 추출
      const maxPopSource = regionData.max_population.hits.hits[0]._source;
      const minPopSource = regionData.min_population.hits.hits[0]._source;
      const regionName = await convertCDtoNM(regionData.key);

      // summary 생성
      const maxDate = getUTCDate(maxPopSource.BASE_YMD);
      const minDate = getUTCDate(minPopSource.BASE_YMD);

      const regionSummary =
        `{${regionName}}\n` +
        `{${
          maxDate.getMonth() + 1
        }}월 {${maxDate.getDate()}}일 {${formatTimeZone(
          maxPopSource.TIMEZN_CD
        )}} {${Math.round(
          maxPopSource.TOT_POPUL_NUM
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `{${
          minDate.getMonth() + 1
        }}월 {${minDate.getDate()}}일 {${formatTimeZone(
          minPopSource.TIMEZN_CD
        )}} {${Math.round(
          minPopSource.TOT_POPUL_NUM
        ).toLocaleString()}}명으로 가장 적습니다.`;

      if (isGroup) {
        summaries.push(regionSummary);
      } else {
        summary = regionSummary;
        oneRegionName = regionName;
      }

      // by_tmst 데이터를 사용하여 indicate 데이터 생성
      for (const bucket of regionData.by_tmst.buckets) {
        const bucketSource = bucket.sorted_docs.hits.hits[0]._source;
        const bucketDate = getUTCDate(bucketSource.BASE_YMD);

        // indicate 객체에 지역별 데이터 추가
        const indicateEntry: Record<string, string | number> = {
          구분: `${bucketDate.getMonth() + 1}/${bucketDate.getDate()} ${
            bucketSource.TIMEZN_CD
          }:00`,
          [isGroup ? regionName : "생활인구"]: Math.round(
            bucketSource.TOT_POPUL_NUM
          ),
        };

        // 기존 데이터와 병합
        const existingEntry = indicateData.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[isGroup ? regionName : "생활인구"] =
            indicateEntry[isGroup ? regionName : "생활인구"];
        } else {
          indicateData.push(indicateEntry);
        }
      }
    } else {
      if (isGroup) {
        summaries.push("-");
      } else {
        summary = "-";
        oneRegionName = "-";
      }
    }
  }
  return {
    title: "시계열 생활인구",
    summary: isGroup ? summaries : summary,
    charts: [
      {
        ...(!isGroup && { regionName: oneRegionName }),
        name: isGroup ? "timeSeriesDataGroup" : "timeSeriesData",
        indicate: indicateData,
      },
    ],
  };
}
