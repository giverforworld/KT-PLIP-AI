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
export async function flowChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend } = chartMapping[id.split("_")[0]][id];

  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];

  //기준지역 1개만 - 출도착지역 전국이라서
  const regionCode = options.region;
  const regionData = data.find(
    (item: NormalizedData) => item.region!.toString() === regionCode
  );

  const indicate: {
    구분: string;
    [key: string]: string | number;
  }[] = [];

  const regionName = await convertCDtoNM(Number(regionCode));
  const regionFullName = await convertCDtoFullNM(Number(regionCode));

  const regionStr = options.isInflow
    ? `전국 -> ${regionName}`
    : `${regionName} -> 전국`;

  if (regionData) {
    // 차트 데이터 생성
    for (const item of regionData.data) {
      if (item.key !== "tot") {
        const name = await convertCDtoFullNM(item.key);
        if (options.isInflow) {
          indicate.push({
            구분: `${name} 유입`,
            [legend[0]]: regionFullName,
            [legend[1]]: Math.round(item.value),
          });
        } else {
          indicate.push({
            구분: regionFullName,
            [legend[0]]: `${name} 유출`,
            [legend[1]]: Math.round(item.value),
          });
        }
      }
    }
    result.charts.push({
      regionName,
      name: chartName,
      indicate: indicate,
    });
    const tot = regionData.data.find((item) => item.key === "tot");

    const regionSummary = existSummary
      ? generateSummaryByChartId(
          id,
          regionStr,
          [tot?.value || 0],
          options.isInflow ? ["유입인구"] : ["유출인구"]
        )
      : undefined;
    if (existStat) {
      const max = await convertCDtoFullNM(regionData.data[0].key);

      const stat = generateStatByChartId(
        id,
        regionStr,
        [{ tot: tot?.value, flow: max }],
        options.isInflow ? ["유입인구"] : ["유출인구"]
      );
      stats.push(stat as StatSummaryObj);
    }
    if (regionSummary) result.summary = regionSummary;
  } else {
    if (existSummary) result.summary = `${regionStr}`;
    if (existStat)
      stats.push({
        regionName: regionStr,
        data: { tot: "-", flow: "-" },
      });
  }

  if (existStat) result.stat = stats;
  return result;
}
