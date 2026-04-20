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
import { formatDay, getUTCDate } from "@/helpers/convertDate";
export async function stackBarMergedChart(
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

    if (x)
      x = x.map((item) => {
        if (item === "이동") return options.isPurpose ? "이동목적" : "이동수단";
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
  let indicate: Indicate[] = [];
  let stat;
  let regionSummary;
  let stats: StatSummaryObj[] = [];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;
  const weekCdMap = keyMap.weekDays;
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
      if (category === "inflowSido") {
        // inflowSido 처리
        const sameRegionValue = regionData.data
          .filter(
            (item) =>
              item.key.toString() === regionData.region?.toString().slice(0, 2)
          )
          .reduce((sum, item) => sum + item.value, 0);

        const otherRegionValue = regionData.data
          .filter(
            (item) =>
              item.key.toString() !== regionData.region?.toString().slice(0, 2)
          )
          .reduce((sum, item) => sum + item.value, 0);
        const otherRegionTopkey = await convertCDtoNM(
          regionData.data.find((data) => data.key.toString().length > 2)?.key
        );
        const otherRegionTopValue = regionData.data.find(
          (data) => data.key.toString().length > 2
        )?.value;

        indicate.push({
          구분: regionName,
          타시도: Math.round(otherRegionValue),
          동일시도: Math.round(sameRegionValue),
          외부유입지역명: `${otherRegionTopkey}`,
          외부유입지역: otherRegionTopValue as number,
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
      } else if (category === "day") {
        for (const item of regionData.data) {
          let indicateEntry: Record<string, string | number> = {
            구분: `${formatDay(item.key as string)}`,
          };
          let regionName = await convertCDtoNM(regionCode);
          indicateEntry[regionName] = Math.round(item.value);
          const existingEntry = indicate.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[regionName] = indicateEntry[regionName];
          } else {
            indicate.push(indicateEntry);
          }
        }
        regionSummary = existSummary
          ? generateSummaryByChartId(id, regionName, indicate, legend, x)
          : undefined;
      } else if (category === "rropMons") {
        for (const item of regionData.data) {
          const month = `${String(item.key).slice(0, 4)}/${String(
            item.key
          ).slice(4, 6)}`;
          let indicateEntry: Record<string, string | number> = {
            구분: month,
          };
          indicateEntry[item.month] = Math.round(item.value);
          const existingEntry = indicate.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[item.month] = indicateEntry[item.month];
          } else {
            indicate.push(indicateEntry);
          }
        }
        indicate = indicate.sort((a: any, b: any) =>
          a.구분.localeCompare(b.구분)
        );
      } else {
        let indicateEntry: Record<string, string | number> = {
          구분: regionName,
        };
        for (const item of regionData.data) {
          let regionName = await convertCDtoNM(item.key);
          let newCategory =
            category === "stayDays"
              ? stayCdMap[item.stay]
              : category === "ldgmtDays"
              ? ldgmtCdMap[item.ldgmt - 1]
              : category === "inflowDaysAvg"
              ? regionName
              : category === "weekdays"
              ? weekCdMap[regionData.data.indexOf(item)]
              : moveCdMap[item.move as number];
          const date = getUTCDate(options.start);

          if (item.key === "lastYear") {
            newCategory = `${date.getFullYear() - 1}년 ${
              date.getMonth() + 1
            }월`;
          }
          if (item.key === "start") {
            newCategory = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
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

            newCategory = `${prevYear}년 ${prevMonth}월`;
          }

          if (category === "stayDays" && item.key === "by_stay_total") {
            newCategory = "전체";
          }
          if (category === "ldgmtDays" && item.key === "by_ldgmt_total") {
            newCategory = "전체";
          }

          if (newCategory) {
            indicateEntry[newCategory] = Math.round(item.value);
          }
        }
        indicate.push(indicateEntry);

        regionSummary = existSummary
          ? generateSummaryByChartId(id, regionName, indicateEntry, legend, x)
          : undefined;
        if (category === "prevMonth") {
          const date = getUTCDate(options.start);
          const targetKey = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

          const filteredData = indicate
            .map((item) => {
              const region = item["구분"]; // '구분' 값
              const value = item[targetKey]; // 현재 연도와 월이 일치하는 값
              return value !== undefined
                ? { 구분: region, 체류인구: value }
                : null; // 값이 있으면 저장, 없으면 null
            })
            .filter((item) => item !== null); // null 제거
          stat = existStat
            ? generateStatByChartId(id, regionName, filteredData, legend, x)
            : undefined;
        } else {
          stat = existStat
            ? generateStatByChartId(id, regionName, indicate, legend, x)
            : undefined;
        }
      }
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
    const excludeKey = `${prevYear}년 ${prevMonth}월`;
    indicate = indicate.map((entry) => {
      const filteredEntry = { ...entry };
      if (filteredEntry[excludeKey] !== undefined) {
        delete filteredEntry[excludeKey];
      }
      return filteredEntry;
    });
  }

  if (category === "stayDays" || category === "ldgmtDays") {
    const excludeKey = "전체";
    indicate = indicate.map((entry) => {
      const filteredEntry = { ...entry };
      if (filteredEntry[excludeKey] !== undefined) {
        delete filteredEntry[excludeKey];
      }
      return filteredEntry;
    });
  }
  if (category === "inflowSido") {
    indicate = indicate.map((item) => {
      const { 외부유입지역명, 외부유입지역: _, ...rest } = item; // 외부유입지역을 제거
      return rest;
    });
  }

  result.charts.push({
    name: chartName,
    indicate: indicate,
  });
  if (existStat) result.stat = stats;

  return result;
}
