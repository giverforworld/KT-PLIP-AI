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
import {
  convertCDtoFullNM,
  convertCDtoNM,
  convertFornNM,
  countryCodeToName,
} from "@/helpers/convertNM";

import { chartMapping } from "@/config/chartConfig";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
import { formatDay, getUTCDate } from "@/helpers/convertDate";
import { mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";

export async function groupLineOrBarNChart(
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
      chartName = chartName.replace("Arrive", "Depart");
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

  //출도착지 비교분석의 전국인 경우
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;
  const timeCdMap = keyMap.timeDays;
  const ldgmtCdMap = keyMap.ldgmtDays;
  const isGroup = options.regionArray.length > 1;

  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
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
    if (regionData && regionData.data.length !== 0) {
      // indicate 객체에 지역별 데이터 추가
      let indicateData: Array<Record<string, string | number>> = [];
      for (const item of regionData.data) {
        let indicateEntry: Record<string, string | number> = {};
        if (category === "monsAge") {
          const month = `${String(item.month).slice(0, 4)}/${String(
            item.month
          ).slice(4, 6)}`;
          const indicateKey = mapAgeToCategory(item.key as string);
          indicateEntry = {
            구분: month,
            [item.key]: Math.round(item.value),
          };
          // 기존 데이터와 병합
          const existingEntry = indicateData.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[indicateKey] =
              ((existingEntry[indicateKey] as number) || 0) +
              Math.round(item.value);
          } else {
            indicateEntry = {
              구분: month,
              [indicateKey]: Math.round(item.value),
            };
            indicateData.push(indicateEntry);
          }
        } else {
          let keyStr =
            category === "inflowSgg" || category === "inflowDays"
              ? await convertCDtoFullNM(item.key)
              : category === "subzone"
              ? await convertCDtoNM(item.key)
              : category === "fornNat"
              ? countryCodeToName[`${item.key as string}_POPUL_NUM`]
              : category === "day" || category === "pday"
              ? item.key === "ratio"
                ? item.key
                : `${formatDay(item.key as string)}`
              : category.includes("age") || category === "rropAge"
              ? mapAgeToCategory(
                  item.key as string,
                  category === "ldgmtDaysage"
                )
              : category === "stayTimes"
              ? timeCdMap[item.time - 1]
              : category === "rropSex"
              ? item.pop
              : category === "stayDayTimes"
              ? item.key
              : item.time !== undefined
              ? item.time
              : item.key;

          const indicateKey =
            options.moveCdArray === undefined
              ? category === "inflowSgg" || category === "stayTimes"
                ? legend[0]
                : category === "stayDayssex" || category === "stayDaysage"
                ? stayCdMap[item.stay]
                : category === "stayDayTimes" ||
                  category === "stayTimessex" ||
                  category === "stayTimesage"
                ? timeCdMap[item.time - 1]
                : category === "ldgmtDayssex" || category === "ldgmtDaysage"
                ? ldgmtCdMap[item.ldgmt - 1]
                : category === "rropAge"
                ? item.pop
                : category === "rropSex"
                ? item.key
                : category === "fornNatTime"
                ? countryCodeToName[`${item.key as string}_POPUL_NUM`]
                : category === "pday" ||
                  category === "month" ||
                  category === "dow" ||
                  category === "pTimezn"
                ? legend[item.ptrn]
                : item.time !== undefined
                ? category.includes("Age")
                  ? mapAgeToCategory(item.key as string, true)
                  : category.includes("Week")
                  ? weekMap[item.key]
                  : item.key
                : item.ptrn !== undefined
                ? x![item.ptrn]
                : regionName
              : moveCdMap[item.move];

          if (category.includes("sex")) {
            indicateEntry = {
              구분: indicateKey,
              [item.key]: Math.round(item.value),
            };

            // 기존 데이터와 병합
            const existingEntry = indicateData.find(
              (entry) => entry["구분"] === indicateEntry["구분"]
            );

            if (existingEntry) {
              existingEntry[item.key] = indicateEntry[item.key];
            } else {
              indicateData.push(indicateEntry);
            }
          } else {
            if (category === "stayDaysage" || category === "ldgmtDaysage") {
              indicateEntry = {
                구분: String(item.key).includes("성")
                  ? item.key
                  : mapAgeToCategory(item.key as string),
                [String(item.key).includes("성") ? "1일" : indicateKey]:
                  Math.round(item.value),
              };
            } else {
              indicateEntry = {
                구분: keyStr,
                [indicateKey]: Math.round(item.value),
              };
            }

            // 기존 데이터와 병합
            const existingEntry = indicateData.find(
              (entry) => entry["구분"] === indicateEntry["구분"]
            );

            if (existingEntry) {
              existingEntry[indicateKey] = indicateEntry[indicateKey];
            } else {
              indicateData.push(indicateEntry);
            }
          }
        }
      }

      let stat;
      if (category === "monsAge") {
        const targetValue = `${options.start.slice(0, 4)}/${options.start.slice(
          4,
          6
        )}`;
        const filteredData = indicateData.filter(
          (item) => item.구분 === targetValue
        );

        stat = existStat
          ? generateStatByChartId(id, regionName, filteredData, legend, x)
          : undefined;
      } else {
        stat = existStat
          ? generateStatByChartId(id, regionName, indicateData, legend, x)
          : undefined;
      }
      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicateData, legend, x)
        : undefined;
      if (category === "stayDayTimes")
        indicateData = indicateData.map((item) => {
          const { undefined: _, ...rest } = item;
          return rest;
        });
      else if (category === "stayTimesage")
        indicateData = indicateData.filter((item) => item.구분 !== "기타");
      else if (category === "stayDaysage" || category === "ldgmtDaysage")
        indicateData = indicateData
          .filter((item) => item !== undefined)
          .filter((item) => !String(item.구분).includes("성"));
      else if (category === "inflowSgg")
        indicateData = indicateData
          .sort(
            (a: any, b: any) =>
              (b[legend[0]] as number) - (a[legend[0]] as number)
          )
          .slice(0, 10);

      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicateData,
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
const weekMap: { [key: string]: string } = { weekday: "평일", weekend: "휴일" };
