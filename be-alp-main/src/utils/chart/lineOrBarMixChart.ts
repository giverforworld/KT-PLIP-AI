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

export async function lineOrBarMixChart(
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
    legend = legend.map((item) => item);
  }
  if (options.moveCdArray !== undefined) {
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
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;
  const ldgmtCdMap = keyMap.ldgmtDays;
  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  let indicate: any[] = [];

  let stats: StatSummaryObj[] = [];
  let regionName = "";
  for (const regionCode of options.regionArray) {
    regionName = await convertCDtoNM(regionCode);

    const regionData = data.find((item: any) => item.data);
    if (regionData && indicate.length === 0) {
      for (const item of regionData.data) {
        let keyStr = category.includes("day")
          ? `${formatDay(item.key as string)}`
          : category.includes("age")
          ? mapAgeToCategory(item.key as string)
          : category === "move"
          ? moveCdMap[item.move]
          : // : category === "stayDays"
            // ? stayCdMap[item.stay]
            // : category === "ldgmtDays"
            // ? ldgmtCdMap[item.ldgmt]
            item.key;
        if (x?.includes("지역")) {
          if (typeof item.key === "number")
            keyStr = await convertCDtoNM(item.key);
        }
        const date = getUTCDate(options.start);

        if (item.key === "lastYear") {
          keyStr = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "start") {
          keyStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "prevMonth") {
          const year = date.getFullYear();
          const month = date.getMonth();

          let prevYear = year;
          let prevMonth = month;

          if (prevMonth === 0) {
            prevYear = year - 1;
            prevMonth = 12;
          }
          keyStr = `${prevYear}년 ${prevMonth}월`;
        }
        indicate.push({
          구분: keyStr,
          [legend[0]]: id.includes("LLP2")
            ? Math.round(item.value)
            : Number(item.value).toFixed(2),
        });
      }
    }

    let stat;
    const filterDataByCategory = (
      category: string,
      indicate: any[],
      options: any
    ) => {
      const currentYearMonth = options.start;
      const currentYear = parseInt(currentYearMonth.slice(0, 4), 10);
      const currentMonth = currentYearMonth.slice(4, 6);

      return indicate.filter((item) => {
        const match = item["구분"].match(/(\d{4})년 (\d{1,2})월/);
        if (!match) return false;

        const year = parseInt(match[1], 10);
        const month = match[2].padStart(2, "0");
        if (category === "prevMonth") {
          return `${year}${month}` === `${currentYear}${currentMonth}`;
        } else if (category === "lastYear" || category === "fornLastYear") {
          return (
            `${year}${month}` === currentYearMonth ||
            `${year}${month}` === `${currentYear - 1}${currentMonth}`
          );
        }
        return true;
      });
    };

    const filteredData = filterDataByCategory(category, indicate, options);

    stat = existStat
      ? generateStatByChartId(
          id,
          regionName,
          id.includes("LLP2") ? filteredData : indicate,
          legend,
          x
        )
      : undefined;

    const regionSummary = existSummary
      ? generateSummaryByChartId(id, regionName, indicate, legend, x)
      : undefined;

    //요약때문에 추가한 prevMonth 삭제
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

      indicate = indicate.filter(
        (item) => item.구분 !== `${prevYear}년 ${prevMonth}월`
      );
    }

    if (regionSummary)
      if (isGroup) {
        (result.summary as string[]).push(regionSummary);
      } else {
        result.summary = regionSummary;
      }
    if (stat) {
      stats.push(stat as StatSummaryObj);
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
  if (indicate.length > 0) {
    result.charts.push({
      ...(options.regionArray.length === 1 && { regionName }),
      name: chartName,
      indicate: indicate,
    });
  }

  if (existStat) result.stat = stats;

  return result;
}
