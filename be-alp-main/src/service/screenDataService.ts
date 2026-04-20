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
import { screenMapping, screenOPMapping } from "@/config/screenConfig";
import {
  mergeAndSortKeyStatSummary,
  mergeAndSortStatSummary,
} from "@/helpers/sortStatSummary";
import { getGroupIdsForCharts } from "./bookmark/bookmark";
import { isValidMonth } from "@/middlewares/validators";

export const getScreenData = async (
  userId: string,
  screenId: string,
  options: ParamsOptions
) => {
  const screenConfig = screenMapping[screenId];
  if (!screenConfig) throw new Error("Invalid screen ID");
  const opHandler = screenOPMapping[screenId];
  if (!opHandler)
    throw new Error(`No handler found for Screen ID "${screenId}"`);

  const dataGroups: DataGroup[] = [];
  const statResults: any[] = [];
  const start = Date.now();
  const fetchStart = Date.now();
  console.log("Start fetching data == " + screenId);
  const chartsData = await opHandler.charts(options);
  console.log(`fetching opensearch data took : ${Date.now() - fetchStart}ms`);
  console.log("Start transforming data");

  const transformStart = Date.now();

  //차트들 북마크 정보 가져오기
  const groupIdsMap = await getGroupIdsForCharts(userId, screenId, options);
  for (const dataGroup of screenConfig.dataGroup) {
    const chartResults: ChartDataContainer[] = [];
    for (const chart of dataGroup.charts) {
      // `handler` 배열을 순회하면서 각각 실행
      const isMOP = screenId.includes("MOP") && !screenId.startsWith("MOP5");
      const isLLP = screenId.includes("LLP") && !screenId.startsWith("LLP4");
      const isALP = screenId.includes("ALP");
      let chartData =
        isMOP || isLLP
          ? await handleMOPChartData(chart, chartsData, options)
          : isALP
          ? await handleALPNativeChartData(chart, chartsData, options)
          : await Promise.all(
              chart.handler.map((handlerFn: any, index: number) =>
                handlerFn(
                  chart.id + (index === 0 ? "" : `_${index}`),
                  chart.name,
                  chart.category[index],
                  chart.existStat[index],
                  chart.existSummary[index],
                  chartsData,
                  options
                )
              )
            );

      chartData = chartData?.filter((data) => data !== undefined);
      if (chart.name === "체류인구 배수" && chartData?.[0].charts.length === 0)
        continue;
      if (chartData?.length !== 0 && chartData !== undefined) {
        // 북마크된 차트인지 체크
        const { dataId, bookmarkedGroupIds } = isBookmarked(
          chart.id,
          groupIdsMap
        );
        let chartName = chart.name;
        //이동목적, 수단별에서 차트 이름
        if ("isPurpose" in options && options.isPurpose === false) {
          chartName = chart.name.replace("목적", "수단");
        }
        if ("isInflow" in options && options.isInflow === false) {
          chartName = chart.name.replace("유입", "유출");
        }
        const summayData = handleSummaryData(chart.existSummary, chartData);
        

        // 생활인구 랭킹 지역현황 모아보기(ALP40010_01) summary 예외
        chartResults.push({
          id: chart.id,
          title: chartName,
          ...(chart.id !== "ALP40010_01" && { summary: summayData }),
          charts: chartData.flatMap((data) =>
            data === undefined ? [] : data.charts
          ),
          isBookmarked: dataId ? true : false,
          dataId,
          bookmarkedGroupIds: bookmarkedGroupIds || [],
        });
        statResults.push(
          ...chartData
            .filter((data) => data?.stat) // stat이 있는 데이터만 필터링
            .flatMap((data) => data.stat as StatSummaryObj[]) // stat을 평탄화하여 추출
        );
      }
    }
    if (chartResults.length > 0) {
      dataGroups.push({
        title: dataGroup.title,
        data: chartResults,
      });
    }
  }
  const statSummary =
    screenId.includes("ALP") && !screenId.includes("ALP3")
      ? mergeAndSortKeyStatSummary(statResults, screenConfig.stat!)
      : mergeAndSortStatSummary(
          statResults as StatSummaryObj[],
          screenConfig.stat!
        );
  //기간 선택시 유니크 숨김
  const isMonth = isValidMonth(options.start);
  if (screenId.includes("ALP") && !screenId.includes("ALP3") && !isMonth) {
    statSummary.forEach((stat) => delete stat.data.Unique);
  }
  if (screenId.includes("MOP")) {
    for (let i = 0; i < statSummary.length; i++) {
      if (statSummary[i].data[0] === "-" && "isInflow" in options && options.isInflow === false) {
        const temp = "유출 인구는 0명 입니다."
        statSummary[i].data[0] = temp
      } else if (statSummary[i].data[0] === "-" && "isInflow" in options && options.isInflow === true) {
        const temp = "유입 인구는 0명 입니다."
        statSummary[i].data[0] = temp
      }
    }
  }
  console.log(`Transforming data took : ${Date.now() - transformStart}ms`);
  const totalDuration = Date.now() - start;
  console.log(`Total API processing time: ${totalDuration}ms`);
  return { statSummary: statSummary, dataGroups: dataGroups };
};

const handleMOPChartData = async (
  chart: any,
  chartsData: any,
  options: Record<string, any>
) => {
  const isFlow = options.isInflow; //유입 유출 처리

  // 데이터가 모두 빈 배열인지 확인
  const isLLPAllEmptyArrays = (data: any) => {
    if (Array.isArray(data)) {
      return data.every((entry) =>
        Object.keys(entry).every(
          (key) => Array.isArray(entry[key]) && entry[key].length === 0
        )
      );
    }
    return false;
  };

  // 모든 chartsData가 빈 배열이면 return
  if (chart.id.includes("LLP") && isLLPAllEmptyArrays(chartsData)) {
    return;
  }

  if (isFlow === undefined) {
    // 비교분석
    return await Promise.all(
      chart.type === "concat"
        ? chart.handler.map((handlerFn: any, index: number) => {
            return handlerFn(
              chart.id + (index === 0 ? "" : `_${index}`),
              chart.name,
              chart.category[index],
              chart.existStat[index],
              chart.existSummary[index],
              chartsData[0][chart.category[index]],
              chartsData[1][chart.category[index]],
              options
            );
          })
        : chart.handler.map((handlerFn: any, index: number) => {
            if (chartsData[0][chart.category[index]]?.length === 0) {
              return; // 빈값 반환
            }

            return handlerFn(
              chart.id + (index === 0 ? "" : `_${index}`),
              chart.name,
              chart.category[index],
              chart.existStat[index],
              chart.existSummary[index],
              chartsData[chart.type === "outflow" ? 1 : 0][
                chart.category[index]
              ],
              options
            );
          })
    );
  } else {
    if (
      chart.type === (options.isInflow === true ? "inflow" : "outflow") ||
      chart.type === "default"
    ) {
      return await Promise.all(
        chart.handler.map((handlerFn: any, index: number) =>
          handlerFn(
            chart.id + (index === 0 ? "" : `_${index}`),
            chart.name,
            chart.category[index],
            chart.existStat[index],
            chart.existSummary[index],
            chartsData[chart.category[index]],
            options
          )
        )
      );
    }
  }
};
const handleALPNativeChartData = async (
  chart: any,
  chartsData: NestedNormalizedObj,
  options: Record<string, any>
) => {
  // 데이터가 모두 빈 배열인지 확인
  const isAllEmptyArrays = (data: NestedNormalizedObj) => {
    return Object.values(data).every((entry) =>
      Object.values(entry).every((arr) => arr.length === 0)
    );
  };

  // 모든 chartsData가 빈 배열이면 return
  if (isAllEmptyArrays(chartsData)) {
    return;
  }
  return await Promise.all(
    chart.handler.flatMap((handlerFn: any, index: number) => {
      const keys: string[] = chart.id.startsWith("ALP4")
        ? ["Avg", "Unique"]
        : Object.keys(chartsData[chart.category[index]]);

      return keys.map((key) => {
        if (
          !chart.id.startsWith("ALP4") &&
          chartsData[chart.category[index]][key].length === 0
        ) {
          return; // 빈값 반환
        }
        const result = handlerFn(
          chart.id + (index === 0 ? "" : `_${index}`),
          chart.name + key,
          chart.category[index],
          chart.existStat[index],
          chart.existSummary[index],
          chart.id.startsWith("ALP4")
            ? chartsData
            : chartsData[chart.category[index]][key],
          options,
          ...(keys.length > 1 ? [key] : [])
        );
        return result;
      });
    })
  );
};
const handleSummaryData = (
  existSummary: boolean[],
  chartData: ChartHandlerData[]
) => {
  const summaryIdx = existSummary.findIndex((item) => item === true);
  if (summaryIdx === -1) return [];
  const isObj =
    typeof chartData[0].summary === "object" &&
    !Array.isArray(chartData[0].summary);
  if (isObj) {
    const summayData = chartData.reduce((acc, data) => {
      Object.entries(data.summary).forEach(([key, value]) => {
        const isArray = Array.isArray(value);
        if (value !== "") {
          if (!acc[key]) {
            acc[key] = isArray ? [] : "";
          }
          const valuesArray = isArray ? groupSummariesByRegion(value) : value;

          acc[key] = isArray ? [...acc[key], ...valuesArray] : valuesArray;
        }
      });
      return acc;
    }, {} as Summary | Summaries);
    return summayData;
  } else {
    const summary = chartData[summaryIdx].summary;
    const summayData =
      existSummary.filter((item) => item === true).length > 1
        ? groupSummariesByRegion(
            chartData.flatMap((data) => data.summary as string[])
          )
        : summary;
    return summayData;
  }
};
function groupSummariesByRegion(summary: string[]): string[] {
  const groupedSummary: Record<string, string[]> = {};
  // 지역 이름별로 그룹화
  summary.forEach((entry) => {
    const match = entry.match(/\{(.*?)\}/); // `{지역명}` 추출
    if (match) {
      const regionName = match[1]; // 지역명 추출
      if (!groupedSummary[regionName]) {
        groupedSummary[regionName] = [];
      }
      groupedSummary[regionName].push(entry); // 해당 지역 그룹에 추가
    }
  });

  // 그룹화된 데이터를 다시 배열로 변환
  const result: string[] = [];
  Object.keys(groupedSummary).forEach((region) => {
    result.push(...groupedSummary[region]); // 각 지역 데이터를 순서대로 병합
  });

  return result;
}

function isBookmarked(chartId: string, groupIdsMap: Record<string, string[]>) {
  const result = Object.keys(groupIdsMap).find((key) =>
    key.startsWith(chartId)
  );

  return {
    dataId: result,
    bookmarkedGroupIds: result ? groupIdsMap[result] : undefined,
  };
}
const handleStatData = (
  existStat: boolean[],
  chartData: ChartHandlerData[]
) => {
  const statIdx = existStat.findIndex((item) => item === true);
  if (statIdx === -1) return [];
  const isObj =
    typeof chartData[0].stat === "object" && !Array.isArray(chartData[0].stat);
  if (isObj) {
    const summayData = chartData.reduce((acc, data) => {
      Object.entries(data.stat!).forEach(([key, value]) => {
        const isArray = Array.isArray(value);
        if (value !== "") {
          if (!acc[key]) {
            acc[key] = isArray ? [] : "";
          }
          const valuesArray = isArray ? groupSummariesByRegion(value) : value;

          acc[key] = isArray ? [...acc[key], ...valuesArray] : valuesArray;
        }
      });
      return acc;
    }, {} as Summary | Summaries);
    return summayData;
  } else {
    return chartData
      .filter((data) => data?.stat) // stat이 있는 데이터만 필터링
      .flatMap((data) => data.stat as StatSummaryObj[]); // stat을 평탄화하여 추출
  }
};
