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
export async function flowConcatChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  inflow: NormalizedData[],
  outflow: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  const { chartName, legend } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];

  //기준지역 1개만
  const regionCode = options.regionArray[0];
  const regionInData = inflow.find(
    (item: NormalizedData) => item.region!.toString() === regionCode
  );
  const regionOutData = outflow.find(
    (item: NormalizedData) => item.region!.toString() === regionCode
  );

  const indicate: {
    구분: string;
    [key: string]: string | number;
  }[] = [];

  const regionName = await convertCDtoNM(Number(regionCode));
  const regionFullName = await convertCDtoFullNM(Number(regionCode));
  if (regionInData && regionOutData) {
    // 차트 데이터 생성
    for (const item of regionInData.data) {
      if (item.key !== "tot") {
        const name = await convertCDtoFullNM(item.key);
        indicate.push({
          구분: `${name} 유입`,
          [legend[0]]: regionFullName,
          [legend[1]]: Math.round(item.value),
        });
      }
    }
    for (const item of regionOutData.data) {
      if (item.key !== "tot") {
        const name = await convertCDtoFullNM(item.key);
        indicate.push({
          구분: regionFullName,
          [legend[0]]: `${name} 유출`,
          [legend[1]]: Math.round(item.value),
        });
      }
    }
    result.charts.push({
      regionName,
      name: chartName,
      indicate: indicate,
    });
    const inTot = regionInData.data.find((item) => item.key === "tot");
    const outTot = regionOutData.data.find((item) => item.key === "tot");

    const regionSummary = existSummary
      ? generateSummaryByChartId(
          id,
          regionName,
          [inTot?.value ?? 0, outTot?.value ?? 0],
          ["유입인구", "유출인구"]
        )
      : undefined;

    if (regionSummary) result.summary = regionSummary;
  } else {
    if (existSummary) result.summary = `${regionName}`;
  }

  //통계요약
  if (existStat) {
    for (const regionCode of options.regionArray) {
      const regionInData = inflow.find(
        (item: NormalizedData) => item.region!.toString() === regionCode
      );
      const regionOutData = outflow.find(
        (item: NormalizedData) => item.region!.toString() === regionCode
      );

      if (regionInData && regionOutData) {
        const regionName = await convertCDtoNM(Number(regionCode));

        const inTot = regionInData.data.find((item) => item.key === "tot");
        const outTot = regionOutData.data.find((item) => item.key === "tot");

        const inMax = await convertCDtoFullNM(regionInData.data[0].key);
        const outMax = await convertCDtoFullNM(regionInData.data[0].key);
        const stat = generateStatByChartId(
          id,
          regionName,
          [
            { tot: inTot?.value, flow: inMax },
            { tot: outTot?.value, flow: outMax },
          ],
          ["유입인구", "유출인구"]
        );
        stats.push(stat as StatSummaryObj);
      } else {
        stats.push({
          regionName,
          data: { tot: "-", flow: "-" },
        });
      }
    }
    result.stat = stats;
  }

  return result;
}
