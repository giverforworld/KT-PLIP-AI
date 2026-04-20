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
import { convertCDtoFullNM } from "@/helpers/convertNM";
import { chartMapping } from "@/config/chartConfig";
export async function rankRacingChart(
  id: string,
  name: string,
  category: string[],
  data: NormalizedObj,
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: [],
    charts: [],
  };
  const isGroup = options.regionArray.length > 1;

  for (const [key, value] of Object.entries(data)) {
    const isSgg = key === "sgg";
    let indicateDataObj: { [key: string]: Record<string, string | number>[] } =
      {
        rate: [{ 구분: "구분" }],
        pop: [],
      };
    for (const regionData of value) {
      if (regionData.data.length !== 0) {
        const regionName = await convertCDtoFullNM(Number(regionData.region));

        if (category.includes("mop") || category.includes("alp")) {
          //lastYear와 current 값 분리 및 증감률 계산
          const lastYear =
            regionData.data.find((d) => d.key === "lastYear")?.value || 0;
          const current =
            regionData.data.find((d) => d.key === "current")?.value || 0;
          const growthRate = ((current - lastYear) / lastYear) * 100;
          indicateDataObj.rate[0][regionName] = Number(growthRate.toFixed(1));
        } else {
          //resid, stay 값 분리 및 증감률 계산
          const resid =
            regionData.data.find((d) => d.key === "resid")?.value || 0;
          const stay =
            regionData.data.find((d) => d.key === "stay")?.value || 0;
          let growthRate = 0;
          if (resid !== 0) {
            growthRate = stay / resid;
          }
          indicateDataObj.rate[0][regionName] = Number(growthRate.toFixed(1));
        }
        for (const item of regionData.data.filter(
          (d) => !isNaN(Number(d.key)) && d.value > 0
        )) {
          let indicateEntry: Record<string, string | number> = {};

          indicateEntry = {
            구분: item.key,
            [regionName]: Math.round(item.value),
          };
          // 기존 데이터와 병합
          const existingEntry = indicateDataObj.pop.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[regionName] = indicateEntry[regionName];
          } else {
            indicateDataObj.pop.push(indicateEntry);
          }
        }
      }
    }
    if (indicateDataObj.pop.length !== 0) {
      result.charts.push({
        regionName: "",
        name: `${chartName + (isSgg ? "" : "Town")}Data${
          isGroup ? "Group" : ""
        }${category.includes("alp") ? "Avg" : ""}`,
        indicate: indicateDataObj.pop,
      });
      result.charts.push({
        regionName: "",
        name: `${chartName + (isSgg ? "" : "Town")}Data${
          isGroup ? "Group" : ""
        }${category.includes("alp") ? "Avg" : ""}`,
        indicate: indicateDataObj.rate,
      });
    }
  }
  return result;
}
