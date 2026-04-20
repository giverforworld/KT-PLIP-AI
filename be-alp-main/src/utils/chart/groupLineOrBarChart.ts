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
export async function groupLineOrBarChart(
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
    legend = legend.map((item) => {
      if (item === "이동") return options.isPurpose ? "목적" : "수단";
      else return item;
    });
    legend.push(
      category === "timezn"
        ? options.isInflow
          ? "도착"
          : "출발"
        : options.isInflow
        ? "출발"
        : "도착"
    );
    if (x)
      x = x.map((item) => {
        if (item === "이동") return options.isPurpose ? "목적" : "수단";
        else return item;
      });
  }

  const result: ChartHandlerData = {
    summary: [],
    charts: [],
  };
  let stats: StatSummaryObj[] = [];
  let indicateData: Array<Record<string, string | number>> = [];

  //출도착지 비교분석의 전국인 경우
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const weekCdMap = keyMap.weekDays;

  let regionName: string = ""; // 기본값 설정
  for (const regionCode of options.regionArray) {
    regionName = await convertCDtoNM(regionCode);
    const regionData = data.find(
      (item: any) => item.region === Number(regionCode)
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
    if (regionData && regionData.data.length !== 0) {
      regionData.data.forEach((item) => {
        let keyStr =
          category === "rropMons"
            ? `${String(item.key).slice(0, 4)}/${String(item.key).slice(4, 6)}`
            : category === "day" || category === "fornDay"
            ? `${formatDay(item.key as string)}`
            : category.includes("age")
            ? mapAgeToCategory(item.key as string)
            : category === "lastYear" ||
              category === "fornLastYear" ||
              category === "prevMonth" ||
              category === "fornPrevMonth" ||
              category === "sex" ||
              category === "dow" ||
              category === "fornDow" ||
              category === "weekdays" ||
              category === "current"
            ? regionName
            : category === "psex"
            ? x![item.ptrn]
            : item.key;

        let indicateKey =
          category === "rropMons"
            ? item.pop
            : category === "dow" || category === "fornDow"
            ? item.key
            : category === "weekdays"
            ? weekCdMap[regionData.data.indexOf(item)]
            : category === "current"
            ? legend[item.ptrn]
            : item.ptrn !== undefined
            ? x![item.ptrn]
            : options.moveCdArray === undefined
            ? regionName
            : moveCdMap[item.move];
        if (category.includes("sex")) {
          indicateKey = item.key as string;
        }
        if (item.key === "lastYear") {
          const date = getUTCDate(options.start);
          indicateKey = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "start") {
          const date = getUTCDate(options.start);
          indicateKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "prevMonth") {
          const date = getUTCDate(options.start);
          indicateKey = `${date.getFullYear()}년 ${date.getMonth()}월`;

          const year = date.getFullYear();
          const month = date.getMonth();

          let prevYear = year;
          let prevMonth = month;

          if (prevMonth === 0) {
            prevYear = year - 1;
            prevMonth = 12;
          }

          indicateKey = `${prevYear}년 ${prevMonth}월`;
        }

        const indicateEntry: Record<string, string | number> = {
          구분: keyStr,
          [indicateKey]: Math.round(item.value),
        };

        // 기존 데이터와 병합
        const existingEntry = indicateData.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[indicateKey] = indicateEntry[indicateKey];
        } else {
          indicateData.push(indicateEntry);
        }
      });

      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicateData, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicateData, legend, x)
        : undefined;
      if (regionSummary) (result.summary as string[]).push(regionSummary);
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }
    } else {
      if (existSummary) (result.summary as string[]).push(`{${regionName}}`);
      if (existStat) {
        stats.push({
          regionName,
          data: { [category]: "-" },
        });
      }
    }
  }

  //요약때문에 추가한 lastYear 삭제
  if (category === "lastYear" || category === "fornLastYear") {
    const date = getUTCDate(options.start);

    const year = date.getFullYear();
    const month = date.getMonth();

    let prevYear = year;
    let prevMonth = month;

    if (prevMonth === 0) {
      prevYear = year - 1;
      prevMonth = 12;
    }

    const targetKey = `${prevYear}년 ${prevMonth}월`;
    indicateData = indicateData.map((item: any) => {
      const newItem = { ...item };
      if (newItem.hasOwnProperty(targetKey)) {
        delete newItem[targetKey];
      }
      return newItem;
    });
  }

  if (category === "rropMons") {
    result.charts.push({
      regionName,
      name: chartName,
      indicate: indicateData,
    });
  } else {
    result.charts.push({
      name: chartName,
      indicate: indicateData,
    });
  }
  if (existStat) result.stat = stats;

  if (key) {
    return {
      ...result,
      ...(existStat && {
        stat: { [key]: result.stat } as { [key: string]: StatSummaryObj[] },
      }),
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}
