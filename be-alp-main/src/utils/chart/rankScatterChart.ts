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
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import { chartMapping } from "@/config/chartConfig";
import { findMaxTimeForKeys } from "@/helpers/getMax";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
import { ageGroupOrder, mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
import { getUpperRegion } from "@/helpers/sortByRegionArray";
export async function rankScatterChart(
  id: string,
  name: string,
  category: string[],
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedObj,
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };

  let stats: StatSummaryObj[] = [];

  const isGroup = options.regionArray.length > 1;
  const upperRegion = getUpperRegion(options.regionArray[0]);

  const chart: MergedChartData = {
    name: chartName + (isGroup ? "Group" : ""),
    data: [],
  }; 

  // 상위 지역 추가 삭제
  // const scatterRegionArray =
  //   options.regionArray[0]?.length === 2
  //     ? [...options.regionArray]
  //     : [...options.regionArray, upperRegion];

  const scatterRegionArray = [...options.regionArray];
  for (const regionCode of scatterRegionArray) {
    let regionName = await convertCDtoFullNM(Number(regionCode));

    //선택한 지역이거나 기준 지역의 상위 지역일 경우
    const regionInData = data.compareIn.find(
      (item: NormalizedData) => item.region!.toString() === regionCode
    );
    const regionOutData = data.compareOut.find(
      (item: NormalizedData) => item.region!.toString() === regionCode
    );

    let indicateData: Array<Record<string, string | number>> = [];

    if (regionInData && regionOutData) {
      // 차트 데이터 생성
      for (const item of regionInData.data) {
        const outData = regionOutData.data.find((out) => out.key === item.key);
        const name = await convertCDtoFullNM(item.key);
        indicateData.push({
          구분: name,
          [legend[0]]: outData ? outData.value : 0,
          [legend[1]]: item.value,
        });
      }

      chart.data.push({
        regionName,
        indicate: indicateData,
      });
    }
  }
  result.charts.push(chart);
  for (const regionCode of options.regionArray) {
    // 지역 이름 변환
    const regionName = await convertCDtoNM(regionCode);

    // 지역별 데이터 필터링
    const regionData: { key: string; value: any }[] = [];
    for (const [category, entries] of Object.entries(data)) {
      const regionEntry = entries.find(
        (entry) => entry.region!.toString() === regionCode
      );
      if (regionEntry) {
        for (const item of regionEntry.data) {
          let value: any = item.value;
          if (category.includes("Region")) {
            value = await convertCDtoFullNM(item.value);
          }
          regionData.push({ key: category, value: value });
        }
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
