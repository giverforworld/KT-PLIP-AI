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
import { keyMap } from "@/config/keyMapConfig";
export async function stackBarGroupMergedChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedData[],
  options: any,
  key?: string
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  if (key) chartName += key;
  if (options.isInflow !== undefined) {
    legend = legend.map((item) => {
      if (item === "인구") return options.isInflow ? "유입인구" : "유출인구";
      else return item;
    });
    if (x)
      x = x.map((item) => {
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
      chartName = chartName.replace("Arrive", "Depart");
    }

    legend = legend.map((item) => {
      if (item === "이동") return options.isPurpose ? "목적" : "수단";
      else return item;
    });
  }
  const isGroup = options.regionArray.length > 1;
  //출도착지 비교분석의 전국인 경우
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const result: ChartHandlerData = {
    summary: [],
    charts: [],
  };

  const chart: MergedChartData = {
    name: chartName,
    data: [],
  };
  let stats: StatSummaryObj[] = [];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;

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
      const indicate: Indicate[] = [];
      if (
        legend.includes("목적") ||
        legend.includes("수단") ||
        id.includes("LLP")
      ) {
        legend.push(options.isInflow ? "출발" : "도착");
      }
      for (const item of regionData.data) {
        const indicateKey =
          id.includes("LLP") && category.includes("age")
            ? stayCdMap[item.stay]
            : item.ptrn !== undefined
            ? legend[item.ptrn]
            : moveCdMap[item.move];
        let keyStr = item.key;
        if (x?.includes("지역")) {
          keyStr = await convertCDtoFullNM(item.key);
        } else if (x?.includes("평일")) {
          const weekMap: { [key: string]: string } = {
            weekday: "평일",
            weekend: "휴일",
          };
          keyStr = weekMap[item.key];
        }
        const indicateEntry: Record<string, string | number> = {
          구분: keyStr,
          [indicateKey]: Math.round(item.value),
        };

        // 기존 데이터와 병합
        const existingEntry = indicate.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[indicateKey] = indicateEntry[indicateKey];
        } else {
          indicate.push(indicateEntry);
        }
      }
      chart.data.push({
        regionName,
        indicate: indicate,
      });
      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;
      if (regionSummary) (result.summary as string[]).push(regionSummary);
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }
    } else {
      if (existSummary) (result.summary as string[]).push(`${regionName}`);
      if (existStat) {
        stats.push({
          regionName,
          data: { [category]: "-" },
        });
      }
    }
  }
  result.charts.push(chart);
  if (existStat) result.stat = stats;
  if (key) {
    return {
      ...result,
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}
