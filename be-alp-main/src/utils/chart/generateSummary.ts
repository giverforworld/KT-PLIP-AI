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

import { statTemplates } from "@/config/statConfig";
import { summaryTemplates } from "@/config/summaryConfig";

export function generateSummaryByChartId(
  chartId: string,
  regionName: string,
  data: any,
  legend?: string[],
  x?: string[]
): string {
  const template = summaryTemplates[chartId.split("_")[0]][chartId];
  if (!template) {
    throw new Error(`Chart ID '${chartId}'에 대한 템플릿이 존재하지 않습니다.`);
  }

  return template.summaryTemplate(regionName, data, legend, x);
}
export function generateStatByChartId(
  chartId: string,
  regionName: string,
  data: any,
  legend?: string[],
  x?: string[]
): StatSummariesObj | StatSummaryObj {
  const template = statTemplates[chartId.split("_")[0]][chartId];
  if (!template) {
    throw new Error(`Chart ID '${chartId}'에 대한 템플릿이 존재하지 않습니다.`);
  }

  return template.statTemplate(regionName, data, legend, x);
}
