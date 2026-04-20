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
import { formatDay, getUTCDate } from "@/helpers/convertDate";
import { findMaxMinForKeys } from "@/helpers/getMax";
import { chartMapping } from "@/config/chartConfig";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
import { ageGroupOrder, mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
export async function groupLineOrBarConcatMergedChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  dataOne: NormalizedData[],
  dataTwo: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  const isGroup = options.regionArray.length > 1;
  const { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  const chart: MergedChartData = {
    name: chartName,
    data: [],
  };
  let stats: StatSummaryObj[] = [];

  let keys: string[] | number[] = [];
  if (["purpose", "way"].includes(category)) {
    keys = keyMap[category];
  }
  for (const regionCode of options.regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const regionDataOne = dataOne.find(
      (item: any) => item.region.toString() === regionCode
    );

    const regionDataTwo = dataTwo.find(
      (item: any) => item.region.toString() === regionCode
    );
    if (regionDataOne && regionDataTwo) {
      // 두 데이터의 key를 합쳐 고유 key 집합 생성
      if (keys.length === 0) {
        const allKeys = new Set([
          ...regionDataOne.data.map((item) => item.key),
          ...regionDataTwo.data.map((item) => item.key),
        ]);
        keys = Array.from(allKeys) as string[] | number[];
      }
      let indicate = keys.map((key) => {
        const dataOne = regionDataOne.data.find((item) => item.key === key);
        const dataTwo = regionDataTwo.data.find((item) => item.key === key);

        let keyStr = category.includes("day")
          ? `${formatDay(key as string)}`
          : category.includes("age")
          ? mapAgeToCategory(key as string)
          : key;
        const date = getUTCDate(options.start);

        if (key === "lastYear") {
          keyStr = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (key === "start") {
          keyStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        if (key === "prevMonth") {
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
        return {
          구분: keyStr,
          [legend[0]]: dataOne ? Math.round(dataOne.value) : 0, // dataOne 값이 없으면 0으로 처리
          [legend[1]]: dataTwo ? Math.round(dataTwo.value) : 0, // dataTwo 값이 없으면 0으로 처리
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
  result.charts.push(chart);
  if (existStat) result.stat = stats;

  return result;
}
