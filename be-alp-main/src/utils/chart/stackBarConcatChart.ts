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
import { convertCDtoNM } from "@/helpers/convertNM";
import { chartMapping } from "@/config/chartConfig";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
export async function stackBarConcatChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  dataOne: NormalizedData[],
  dataTwo: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  const { chartName, legend, x } = chartMapping[id.split("_")[0]][id];

  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];

  const keyMap = category === "weekdays" ? weekMap : weekMap;
  for (const regionCode of options.regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const regionDataOne = dataOne.find(
      (item: any) => item.region.toString() === regionCode
    );

    const regionDataTwo = dataTwo.find(
      (item: any) => item.region.toString() === regionCode
    );

    if (regionDataOne && regionDataTwo) {
      const indicate: Indicate[] = [];

      [regionDataOne, regionDataTwo].forEach((regionData, index) => {
        const row: Indicate = { 구분: x![index] };

        legend.forEach((key) => {
          const dataItem = regionData.data.find((d) => d.key === keyMap[key]);
          row[key] = dataItem ? dataItem.value : 0; // Default to 0 if key is not found
        });

        indicate.push(row);
      });

      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicate,
      });
      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;
      if (regionSummary) result.summary = regionSummary;
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }
    } else {
      if (existSummary) result.summary = `${regionName}`;
      if (existStat) {
        stats.push({
          regionName,
          data: { [category]: "-" },
        });
      }
    }
  }
  if (existStat) result.stat = stats;
  return result;
}

const weekMap: { [key: string]: string } = { 평일: "weekday", 휴일: "weekend" };
