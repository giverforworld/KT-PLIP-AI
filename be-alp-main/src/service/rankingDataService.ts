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

export const getRankingData = async (
  screenId: string,
  options: Record<string, any>
) => {
  const screenConfig = screenMapping[screenId];
  if (!screenConfig) throw new Error("Invalid screen ID");
  const opHandler = screenOPMapping[screenId];
  if (!opHandler)
    throw new Error(`No handler found for Screen ID "${screenId}"`);
  const start = Date.now();
  const fetchStart = Date.now();
  console.log("Start fetching Ranking data == " + screenId);
  const chartsData = await opHandler.charts(options);
  console.log(`fetching opensearch data took : ${Date.now() - fetchStart}ms`);
  console.log("Start transforming data");

  const transformStart = Date.now();

  const chartResults: ChartDataContainer = { title: "", charts: [] };

  for (const dataGroup of screenConfig.dataGroup) {
    for (const chart of dataGroup.charts) {
      // `handler` 배열을 순회하면서 각각 실행

      const chartData = await Promise.all(
        chart.handler.map((handlerFn) =>
          handlerFn(
            chart.id,
            chart.name,
            chart.category,
            chartsData,
            options,
            ...(screenId.startsWith("ALP") ? ["Avg"] : [])
          )
        )
      );

      if (chartData) {
        chartResults.title = chart.name;
        chartResults.charts = chartData.flatMap((data) => data.charts);
      }
    }
  }

  console.log(`Transforming data took : ${Date.now() - transformStart}ms`);
  const totalDuration = Date.now() - start;
  console.log(`Total API processing time: ${totalDuration}ms`);
  return chartResults;
};
