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
import { getUTCDate } from "@/helpers/convertDate";
import { generateStatByChartId } from "./generateSummary";
import { mapAgeToCategory } from "@/helpers/sortByAgeOrder";

export async function alpRankRatioChart(
  id: string,
  name: string,
  category: string[],
  existStat: boolean,
  existSummary: boolean,
  data: NestedNormalizedObj,
  options: any,
  key: string
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const isGroup = options.regionArray.length > 1;

  chartName += isGroup ? "Group" : "";
  if (key) chartName += key;
  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];

  for (const regionCode of options.regionArray) {
    let regionName = await convertCDtoNM(regionCode);

    const rsdnData = data.rsdn[key].find(
      (item: any) => item.region.toString() === regionCode
    );
    const wkplcData = data.wkplc[key].find(
      (item: any) => item.region.toString() === regionCode
    );
    const vistData = data.vist[key].find(
      (item: any) => item.region.toString() === regionCode
    );
    const inflowData = data.inflow[key]?.find(
      (item: any) => item.region.toString() === regionCode
    );
    const outflowData = data.outflow[key]?.find(
      (item: any) => item.region.toString() === regionCode
    );
    let indicateData: Array<Record<string, string | number>> = [];

    if (rsdnData) {
      // 차트 데이터 생성
      for (const rsdn of rsdnData.data) {
        const wkplcValue =
          wkplcData!.data.find((item: any) => item.key === rsdn.key)?.value ??
          "-";
        const vistValue =
          vistData!.data.find((item: any) => item.key === rsdn.key)?.value ??
          "-";
        const inflowValue =
          inflowData?.data.find((item: any) => item.key === rsdn.key)?.value ??
          "-";
        const outflowValue =
          outflowData?.data.find((item: any) => item.key === rsdn.key)?.value ??
          "-";

        let indicateEntry: Record<string, string | number> = {};
        let keyStr = "";
        if (rsdn.key === "lastYear") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (rsdn.key === "start") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        indicateEntry = {
          구분: keyStr,
          거주인구비율: rsdn.value,
          직장인구비율: wkplcValue,
          방문인구비율: vistValue,
          유입인구비율: inflowValue,
          유출인구비율: outflowValue,
        };

        indicateData.push(indicateEntry);
      }

      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicateData,
      });
    }
  }

  for (const regionCode of options.regionArray) {
    // 지역 이름 변환
    const regionName = await convertCDtoNM(regionCode);
    // 지역별 데이터 필터링
    const regionData: { [key: string]: { [key: string]: any }[] } = {};
    for (const [objKey, value] of Object.entries(data)) {
      const regionEntry = (value[key] as any).find(
        (entry: { region: any }) => entry.region!.toString() === regionCode
      );

      if (regionEntry) {
        // `regionEntry.data` 배열의 각 항목을 `regionData`에 추가
        if (objKey.includes("inflowWeek")) {
          const flowRegionNM = await convertCDtoFullNM(
            Number(regionEntry.data[0].key)
          );
          regionData[objKey] = [
            {
              key: flowRegionNM,
              value: Math.round(regionEntry.data[0].value),
            },
          ];
        } else if (objKey.includes("age")) {
          const ptrn = ["거주인구", "직장인구", "방문인구"];
          let indicateData: Array<Record<string, string | number>> = [];
          for (const item of regionEntry.data) {
            let indicateEntry: Record<string, string | number> = {};

            let keyStr = item.key;
            if (item.key !== "남성" && item.key !== "여성")
              keyStr = mapAgeToCategory(item.key as string);

            const indicateKey = ptrn[item.ptrn];

            indicateEntry = {
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
          }
          regionData[objKey] = indicateData;
        } else regionData[objKey] = regionEntry.data;
      }
    }

    // 존재하는 통계라면 stat 생성
    let stat = undefined;
    if (existStat)
      if (options.start.length > 6 && key === "Unique") stat = undefined;
      else
        stat = generateStatByChartId(
          id,
          regionName,
          regionData,
          legend,
          undefined
        );

    if (stat) {
      stats.push(stat as StatSummaryObj);
    }
  }

  if (existStat) result.stat = stats;
  if (key) {
    return {
      ...result,
      ...(existStat && {
        stat: { [key]: result.stat } as { [key: string]: StatSummaryObj[] },
      }),
      summary: { [key]: "" } as Summary | Summaries,
    };
  }
  return result;
}
