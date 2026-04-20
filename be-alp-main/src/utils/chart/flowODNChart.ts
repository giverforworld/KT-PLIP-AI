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
export async function flowODNChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NestedNormalizedObj,
  options: any,
  key: string
): Promise<ChartHandlerData> {
  let { chartName, legend } = chartMapping[id.split("_")[0]][id];

  const isGroup = options.regionArray.length > 1;
  chartName += isGroup ? "Group" : "";
  if (key) chartName += key;
  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];
  for (const regionCode of options.regionArray) {
    const regionName = await convertCDtoNM(Number(regionCode));
    const regionFullName = await convertCDtoFullNM(Number(regionCode));
    const regionData = data.flow[key].find(
      (item: any) => item.region.toString() === regionCode
    );
    if (regionData) {
      // 차트 데이터 생성
      let indicateData: Array<Record<string, string | number>> = [];
      for (const item of regionData.data) {
        if (item.flow === "inflow") {
          const name = await convertCDtoFullNM(item.key);
          indicateData.push({
            구분: `${name} 유입`,
            [legend[0]]: regionFullName,
            [legend[1]]: Math.round(item.value),
          });
        } else {
          const name = await convertCDtoFullNM(item.key);
          indicateData.push({
            구분: regionFullName,
            [legend[0]]: `${name} 유출`,
            [legend[1]]: Math.round(item.value),
          });
        }
      }
      result.charts.push({
        regionName,
        name: `${chartName}`,
        indicate: indicateData,
      });
    }
  }

  return result;
}
