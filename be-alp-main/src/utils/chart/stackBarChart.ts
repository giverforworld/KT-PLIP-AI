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
import { ageGroupOrder, mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
export async function stackBarChart(
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
    summary: isGroup ? [] : "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;

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
      let indicate: Indicate[] = [];
      if (category.startsWith("sexAge")) {
        let transData: Record<string, { 남성: number; 여성: number }> = {};
        if (id.includes("LLP")) {
          transData = {
            ...transSexAgeData(regionData, true),
            ...transSexData(regionData),
          };
        } else {
          transData = transSexAgeData(regionData, false);
        }
        indicate = Object.entries(transData)
          .map(([ageGroup, values]) => ({
            구분: ageGroup,
            남성: values.남성,
            여성: values.여성,
          }))
          .sort((a, b) => ageGroupOrder(a.구분, b.구분));
      } else if (legend.includes("목적") || legend.includes("수단")) {
        legend.push(options.isInflow ? "출발" : "도착");
        for (const item of regionData.data) {
          const indicateKey = moveCdMap[item.move];
          let keyStr = item.key;
          if (x?.includes("지역")) {
            keyStr = await convertCDtoFullNM(item.key);
          } else if (x?.includes("평일")) {
            const weekMap: { [key: string]: string } = {
              weekday: "평일",
              weekend: "휴일",
            };
            keyStr = weekMap[item.key];
          } else if (category === "age") {
            keyStr = mapAgeToCategory(item.key as string);
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
      } else if (legend.length >= 2 && legend.includes("거주인구")) {
        for (const item of regionData.data) {
          const indicateKey = legend[item.ptrn];
          const weekMap: { [key: string]: string } = {
            weekday: "평일",
            weekend: "휴일",
          };
          let keyStr = weekMap[item.key];
          if (category === "age") {
            if (item.key !== "남성" && item.key !== "여성")
              keyStr = mapAgeToCategory(item.key as string);
            else keyStr = item.key;
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
      } else if (category === "weekdays") {
        const keyMap: { [key: string]: string } = {
          weekday: "평일",
          weekend: "휴일",
        };
        indicate = [
          {
            구분: id.includes("LLP") ? regionName : x![0],
            [keyMap[regionData.data[0].key]]: regionData.data[0].value,
            [keyMap[regionData.data[1].key]]: regionData.data[1].value,
          },
        ];
      } else if (category === "inflowSido") {
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
      } else {
        indicate = regionData.data.map((item) => {
          return {
            구분: item.key,
            [legend[0]]: Math.round(item.value),
            [legend[1]]: Math.round(item.value),
          };
        });
      }

      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;

      if (regionSummary)
        if (isGroup) {
          (result.summary as string[]).push(regionSummary);
        } else {
          result.summary = regionSummary;
        }
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }

      if (category === "sexAge" || category === "age") {
        indicate = indicate.filter((item) => item["구분"] !== "기타");
      }
      // 요약때문에 추가한 거 삭제
      if (category === "age") {
        indicate = indicate.filter(
          (item) => item["구분"] !== "남성" && item["구분"] !== "여성"
        );
      }
      if (category === "inflowSido") {
        indicate = indicate.map((item) => {
          const { 외부유입지역명, 외부유입지역: _, ...rest } = item; // 외부유입지역을 제거
          return rest;
        });
      }

      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicate,
      });
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
      ...(existStat && {
        stat: { [key]: result.stat } as { [key: string]: StatSummaryObj[] },
      }),
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}

function transSexAgeData(data: any, isLLP: boolean) {
  const ageGroups: Record<string, { 남성: number; 여성: number }> = {};
  // 데이터 처리: 연령대별로 그룹화
  (isLLP ? data.data.sexAge : data.data).forEach((item: any) => {
    const gender = (item.key as string).startsWith("M") ? "남성" : "여성";
    const ageGroup = mapAgeToCategory((item.key as string).substring(1));
    if (!ageGroups[ageGroup]) {
      ageGroups[ageGroup] = { 남성: 0, 여성: 0 };
    }

    ageGroups[ageGroup][gender] += Math.round(item.value);
  });
  return ageGroups;
}

function transSexData(data: any) {
  const filteredData = data.data.sex.filter(
    (item: any) => item.pop === "체류인구"
  );
  const result = {
    기타: filteredData.reduce(
      (acc: any, curr: any) => {
        acc[curr.key] = (acc[curr.key] || 0) + curr.value; // 남성과 여성 값을 누적
        return acc;
      },
      { 남성: 0, 여성: 0 }
    ),
  };
  return result;
}
