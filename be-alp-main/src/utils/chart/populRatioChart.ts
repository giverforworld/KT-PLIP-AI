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
import { chartMapping } from "@/config/chartConfig";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";

export async function populRatioChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedData[],
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: [],
    charts: [],
  };
  let indicate: any = [];
  let stats: StatSummaryObj[] = [];

  const ratioMapData = data.find((item) => item.name === "ratioMap");
  const ratioTableData = data.find((item) => item.name === "ratioTable");
  let mapArr: any = [];
  let tableArr: any = [];
  const processRegionData = (mapData: any, tableData: any) => {
    const dprsRegions = mapData.data.map((item: any) =>
      options.regionArray.includes(String(item.key))
    );
    if (dprsRegions.some((val: any) => val === true)) {
      mapData.data.map(async (item: any) => {
        mapArr.push({
          // idx: item.idx,
          구분: await convertCDtoNM(item.key),
          배수: Number(item.value.toFixed(1)),
          sggCode: item.key,
        });
      });
      tableData.data.map(async (item: any) => {
        tableArr.push({
          // idx: item.idx,
          구분: await convertCDtoNM(item.key),
          배수: Number(item.value.toFixed(1)),
          증감수: Number(item.rate.toFixed(1)),
          // ssgCode: item.key,
        });
      });
    }
  };
  processRegionData(ratioMapData, ratioTableData);
  const isGroup = options.regionArray.length > 1;

  let regionName = "";
  for (const regionCode of options.regionArray) {
    regionName = await convertCDtoNM(regionCode);
  }
  if (mapArr.length !== 0 && tableArr.length !== 0)
    indicate.push(
      {
        ...(!isGroup && { regionName }),
        indicate: mapArr,
      },
      {
        ...(!isGroup && { regionName }),
        indicate: tableArr,
      }
    );

  const regionSummary = existSummary
    ? generateSummaryByChartId(id, regionName, indicate, legend, x)
    : undefined;
  const stat = existStat
    ? generateStatByChartId(id, regionName, indicate, legend, x)
    : undefined;
  if (regionSummary) (result.summary as string[]).push(regionSummary);
  if (stat) {
    stats.push(stat as StatSummaryObj);
  } else {
    if (existSummary) (result.summary as string[]).push(`{${regionName}}`);
    if (existStat) {
      stats.push({
        regionName,
        data: { [category]: "-" },
      });
    }
  }
  if (indicate.length !== 0)
    result.charts.push({
      name: chartName,
      data: indicate,
    });

  if (existStat) result.stat = stats;

  return result;
}
