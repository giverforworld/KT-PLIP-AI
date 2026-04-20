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
import { chartMapping } from "@/config/chartConfig";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
export async function flowNChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: any,
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];

  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];
  let flowData = data;
  if (category === "llp") {
    flowData = data.flow;
  }
  const isGroup = options.regionArray.length > 1;
  for (const regionCode of options.regionArray) {
    const regionName = await convertCDtoNM(Number(regionCode));
    const regionFullName = await convertCDtoFullNM(Number(regionCode));
    const regionData = flowData.find(
      (item: any) => item.region.toString() === regionCode
    );
    if (regionData) {
      // 차트 데이터 생성
      let indicateData: Array<Record<string, string | number>> = [];
      for (const item of regionData.data) {
        if (item.key !== "tot") {
          const name = await convertCDtoFullNM(item.key);

          indicateData.push({
            구분: `${name} 유입`,
            [legend[0]]: regionFullName,
            [legend[1]]: Math.round(item.value),
          });
        }
      }
      result.charts.push({
        regionName,
        name: `${chartName}${isGroup ? "Group" : ""}`,
        indicate: indicateData,
      });
    }
  }

  for (const regionCode of options.regionArray) {
    // 지역 이름 변환
    const regionName = await convertCDtoNM(regionCode);

    // 지역별 데이터 필터링
    const regionData: { [key: string]: { key: string; value: any }[] } = {};
    for (const [key, value] of Object.entries(data)) {
      const regionEntry = (value as Array<any>).find(
        (entry: { region: any }) => entry.region!.toString() === regionCode
      );

      if (regionEntry) {
        // `regionEntry.data` 배열의 각 항목을 `regionData`에 추가
        if (key.includes("Region")) {
          const flowRegionNM = await convertCDtoFullNM(
            Number(regionEntry.data[0].key)
          );
          regionData[key] = [
            {
              key: flowRegionNM,
              value: Math.round(regionEntry.data[0].value),
            },
          ];
        } else regionData[key] = regionEntry.data;
      }
    }

    // 존재하는 통계라면 stat 생성
    const stat = existStat
      ? generateStatByChartId(id, regionName, regionData, legend, undefined)
      : undefined;

    if (stat) {
      stats.push(stat as StatSummaryObj);
    }
  }
  if (existStat) result.stat = stats;
  return result;
}
