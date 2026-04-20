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
export async function groupLineOrBarMergedChart(
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
  const chart: MergedChartData = {
    name: chartName,
    data: [],
  };
  let stats: StatSummaryObj[] = [];

  //출도착지 비교분석의 전국인 경우
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;
  const timeCdMap = keyMap.timeDays;
  const ldgmtCdMap = keyMap.ldgmtDays;

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
      // indicate 객체에 지역별 데이터 추가
      let indicateData: Array<Record<string, string | number>> = [];
      if (category === "monsAge") {
        regionData.data.forEach((item) => {
          const month = `${String(item.key).slice(0, 4)}/${String(
            item.key
          ).slice(4, 6)}`;
          const ageGroupData: Record<string, number> = {};

          const values = Array.isArray(item.value) ? item.value : [item.value];
          values.forEach((ageItem: { key: string; value: number }) => {
            const ageGroup = mapAgeToCategory(ageItem.key);
            if (!ageGroupData[ageGroup]) {
              ageGroupData[ageGroup] = 0;
            }
            ageGroupData[ageGroup] += Math.round(ageItem.value);
          });

          indicateData.push({
            구분: month,
            ...ageGroupData,
          });
        });
      } else if (category === "rropSex") {
        for (const item of regionData.data) {
          let indicateEntry: Record<string, string | number> = {
            구분: item.pop,
          };
          indicateEntry[item.key] = item.value;
          const existingEntry = indicateData.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[item.key] = indicateEntry[item.key];
          } else {
            indicateData.push(indicateEntry);
          }
        }
      } else {
        regionData.data.forEach((item) => {
          let keyStr = category.includes("day")
            ? `${formatDay(item.key as string)}`
            : category.includes("age")
            ? mapAgeToCategory(item.key as string)
            : name.includes("체류시간별")
            ? timeCdMap[item.time - 1]
            : name.includes("체류일수별")
            ? stayCdMap[item.stay]
            : name.includes("숙박일수별")
            ? ldgmtCdMap[item.ldgmt - 1]
            : category === "psex"
            ? x![item.ptrn]
            : item.key;

          let indicateKey =
            name.includes("체류시간별") ||
            name.includes("체류일수별") ||
            name.includes("숙박일수별")
              ? item.key
              : legend[0];
          if (category.includes("psex")) {
            indicateKey = item.key as string;
          }
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
          const indicateEntry: Record<string, string | number> = {
            구분: keyStr,
            [indicateKey]: Math.round(item.value),
          };
          indicateData.push(indicateEntry);
        });
      }

      let groupedData: Record<string, string | number>[] = [];
      if (
        category === "stayDayssex" ||
        category === "ldgmtDayssex" ||
        category === "stayTimessex" ||
        category === "psex"
      ) {
        groupedData = Object.values(
          indicateData.reduce((acc, cur) => {
            if (!acc[cur.구분]) {
              acc[cur.구분] = { 구분: String(cur.구분), 남성: 0, 여성: 0 };
            }
            acc[cur.구분].남성 += (cur.남성 as number) || 0;
            acc[cur.구분].여성 += (cur.여성 as number) || 0;
            return acc;
          }, {} as Record<string, { 구분: string; 남성: number; 여성: number }>)
        );
      }
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
      //요약때문에 추가한 prevMonth 삭제
      if (category === "lastYear") {
        const date = getUTCDate(options.start);

        indicateData = indicateData.filter(
          (item) => item.구분 !== `${date.getFullYear()}년 ${date.getMonth()}월`
        );
      }
      chart.data.push({
        regionName,
        indicate:
          category === "stayDayssex" ||
          category === "ldgmtDayssex" ||
          category === "stayTimessex" ||
          category === "psex"
            ? groupedData
            : indicateData,
      });
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
  if (category === "monsAge") {
    chart.data.forEach((item) =>
      result.charts.push({
        name: chart.name,
        regionName: item.regionName,
        indicate: item.indicate,
      })
    );
  } else result.charts.push(chart);

  if (existStat) result.stat = stats;
  if (key) {
    return {
      ...result,
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}
