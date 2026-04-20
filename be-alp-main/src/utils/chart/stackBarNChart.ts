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
import { mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
export async function stackBarNChart(
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
  legend = legend.map((item) => item);
  const isGroup = options.regionArray.length > 1;
  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];
  const stayCdMap = keyMap.stayDays;
  const timeCdMap = keyMap.timeDays;

  for (const regionCode of options.regionArray) {
    let regionName = await convertCDtoNM(regionCode);
    const regionData = data.find(
      (item: any) => item.region.toString() === regionCode
    );
    if (regionData) {
      let indicate: Indicate[] = [];

      for (const item of regionData.data) {
        if (category === "inflowDays") {
          if (item.key === "by_stay_1_max_avg") {
            indicate.push({
              구분: "평균 체류일수",
              "평균 체류일수": item.value,
            });
          }
        }

        const month = `${String(item.key).slice(0, 4)}/${String(item.key).slice(
          4,
          6
        )}`;
        const indicateKey =
          category === "stayTimes"
            ? timeCdMap[item.time - 1]
            : category === "rropMons"
            ? month
            : stayCdMap[item.stay];
        const keyStr =
          category === "rropMons"
            ? item.month
            : await convertCDtoFullNM(item.region);

        if (!indicateKey) continue;

        // 기존 데이터와 병합
        const existingEntry = indicate.find(
          (entry) => entry["구분"] === indicateKey
        );

        if (existingEntry) {
          existingEntry[keyStr] = Math.round(item.value);
        } else {
          const newEntry = {
            구분: indicateKey,
            [keyStr]: Math.round(item.value),
          };
          indicate.push(newEntry);
        }
      }

      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;

      if (category === "inflowDays")
        indicate = indicate.filter((item) => item["구분"] !== "평균 체류일수");
      if (category === "rropMons")
        indicate = indicate.sort((a: any, b: any) =>
          a.구분.localeCompare(b.구분)
        );
      result.charts.push({
        regionName,
        name: chartName,
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
      if (existSummary) {
        if (isGroup) {
          (result.summary as string[]).push(`{${regionName}}`);
        } else {
          result.summary = `{${regionName}}`;
        }
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
  if (key) {
    return {
      ...result,
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}

function transSexAgeData(data: NormalizedData) {
  const ageGroups: Record<string, { 남성: number; 여성: number }> = {};

  // 데이터 처리: 연령대별로 그룹화
  data.data.forEach((item) => {
    const gender = (item.key as string).startsWith("M") ? "남성" : "여성";
    const ageGroup = mapAgeToCategory((item.key as string).substring(1));

    if (!ageGroups[ageGroup]) {
      ageGroups[ageGroup] = { 남성: 0, 여성: 0 };
    }

    ageGroups[ageGroup][gender] += item.value;
  });
  return ageGroups;
}
