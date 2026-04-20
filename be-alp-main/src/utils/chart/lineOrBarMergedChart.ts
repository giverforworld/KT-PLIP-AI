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
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
import { formatDay, getUTCDate } from "@/helpers/convertDate";
import { mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
export async function lineOrBarMergedChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  if (options.isInflow !== undefined) {
    legend = legend.map((item) => {
      if (item === "인구") return options.isInflow ? "유입인구" : "유출인구";
      else return item;
    });
  }
  if (options.moveCdArray !== undefined) {
    // isPurpose가 false인 경우 purpose를 trans 변경
    if (options.isPurpose === false) {
      chartName = chartName.replace("purpose", "trans");
      chartName = chartName.replace("oddPur", "oddTra");
    }
    if (options.isInflow === false) {
      chartName = chartName.replace("Inflow", "Outflow");
    }
    if (x)
      x = x.map((item) => {
        if (item === "이동") return options.isPurpose ? "이동목적" : "이동수단";
        else return item;
      });
  }

  const isGroup = options.regionArray.length > 1;
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;

  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  const chart: MergedChartData = {
    name: chartName,
    data: [],
  };
  let stats: StatSummaryObj[] = [];

  for (const regionCode of options.regionArray) {
    let regionName = await convertCDtoNM(regionCode);
    const regionData = data.find(
      (item: any) => item.region.toString() === regionCode
    );
    //출도착지역인 경우
    if (options.region !== undefined && options.isInflow !== undefined) {
      const originName = await convertCDtoNM(options.region);
      const flowName = isNationWide
        ? "전국"
        : await convertCDtoFullNM(Number(regionCode));

      regionName = options.isInflow
        ? `${flowName} -> ${originName}`
        : `${originName} -> ${flowName}`;
    }
    if (regionData) {
      let indicate = regionData.data.map((item) => {
        let keyStr = category.includes("day")
          ? `${formatDay(item.key as string)}`
          : category.includes("age")
          ? mapAgeToCategory(item.key as string)
          : category === "move"
          ? moveCdMap[item.move]
          : item.key;
        if (item.key === "lastYear") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "start") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "prevMonth") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear()}년 ${date.getMonth()}월`;
        }

        return {
          구분: keyStr,
          [legend[0]]: Math.round(item.value),
        };
      });
      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;

      //요약때문에 추가한 prevMonth 삭제
      if (category === "lastYear") {
        const date = getUTCDate(options.start);

        indicate = indicate.filter(
          (item) => item.구분 !== `${date.getFullYear()}년 ${date.getMonth()}월`
        );
      }
      chart.data.push({
        regionName,
        indicate: indicate,
      });

      if (regionSummary)
        if (isGroup) {
          (result.summary as string[]).push(regionSummary);
        } else {
          result.summary = regionSummary;
        }
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }
    } else {
      if (existSummary)
        if (isGroup) {
          (result.summary as string[]).push(`{${regionName}}`);
        } else {
          result.summary = `{${regionName}}`;
        }
      if (existStat) {
        stats.push({
          regionName,
          data: { [category]: "-" },
        });
      }
    }
  }
  if (existStat) result.stat = stats;
  result.charts.push(chart);

  return result;
}
