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

import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import util from "util";
export async function transMopFlow(
  region: string,
  data: any,
  type: string
): Promise<TransResult> {
  let summary = "";
  const regionName = await convertCDtoFullNM(Number(region));
  summary += `{${regionName}}\n`;
  let chart: BaseChartData = {
    regionName,
    name: "",
    indicate: [],
  };
  let stats: StatSummaryObj[] = [];

  if (type === "flow") {
    chart.name = "mopFlowData";
    for (const bucket of data.inflow.by_pdepar.buckets) {
      const name = await convertCDtoFullNM(Number(bucket.key));
      chart.indicate.push({
        구분: name + " 유입",
        지역: regionName,
        생활인구: Math.round(bucket.inflow_popul_sum?.value || 0),
      });
    }
    for (const bucket of data.outflow.by_detina.buckets) {
      const name = await convertCDtoFullNM(Number(bucket.key));
      chart.indicate.push({
        구분: regionName,
        지역: name + " 유출",
        생활인구: Math.round(bucket.outflow_popul_sum?.value || 0),
      });
    }
    summary += `유입인구는 총 {${Math.round(
      data.inflow.tot_sum.value
    ).toLocaleString()}}명,\n`;
    summary += `유출인구는 총 {${Math.round(
      data.outflow.tot_sum.value
    ).toLocaleString()}}명 입니다.`;
    stats.push({
      regionName,
      data: {
        flow:
          `유입인구는 총 {${Math.round(
            data.inflow.tot_sum.value
          ).toLocaleString()}}명,\n` +
          `유출인구는 총 {${Math.round(
            data.outflow.tot_sum.value
          ).toLocaleString()}}명 입니다.`,
      },
    });
  } else if (type === "inflow") {
    chart.name = `oddFlowData`;
    for (const bucket of data.inflow.by_pdepar.buckets) {
      const name = await convertCDtoFullNM(Number(bucket.key));
      chart.indicate.push({
        구분: name + " 유입",
        지역: regionName,
        생활인구: Math.round(bucket.inflow_popul_sum?.value || 0),
      });
    }

    summary += `유입인구는 총 {${Math.round(
      data.inflow.tot_sum.value
    ).toLocaleString()}}명,\n`;

    stats.push({
      regionName,
      data: {
        flow: `{유입인구는 총 {${Math.round(
          data.inflow.tot_sum.value
        ).toLocaleString()}}명입니다.`,
      },
    });
  } else {
    chart.name = `oddFlowData`;
    for (const bucket of data.outflow.by_detina.buckets) {
      const name = await convertCDtoFullNM(Number(bucket.key));
      chart.indicate.push({
        구분: regionName,
        지역: name + " 유출",
        생활인구: Math.round(bucket.outflow_popul_sum?.value || 0),
      });
    }

    summary += `유출인구는 총 {${Math.round(
      data.outflow.tot_sum.value
    ).toLocaleString()}}명입니다.`;
    stats.push({
      regionName,
      data: {
        flow: `{유출}인구는 총 {${Math.round(
          data.outflow.tot_sum.value
        ).toLocaleString()}}명 입니다.`,
      },
    });
  }
  return {
    stat: stats,
    data: {
      title: "생활 이동 흐름",
      summary: summary,
      charts: [chart],
    },
  };
}

export async function transMopODFlow(
  region: string,
  flowRegionArray: string[],
  data: any,
  isGroup: boolean,
  type: string
): Promise<TransResult> {
  let summaries = [];
  const regionName = await convertCDtoFullNM(Number(region));

  let chart: BaseChartData = {
    regionName,
    name: "",
    indicate: [],
  };
  let stats: StatSummaryObj[] = [];

  chart.name = `oddFlowData${isGroup ? "Group" : ""}`;

  for (const flowCode of flowRegionArray) {
    const name = await convertCDtoFullNM(Number(flowCode));

    const bucket = data[type].find(
      (item: any) => item.key.toString() === flowCode
    );
    let summary = "";

    if (type === "inflow") {
      summary += `{${name} -> ${regionName}}\n`;

      chart.indicate.push({
        구분: name + " 유입",
        지역: regionName,
        생활인구: Math.round(bucket.tot_sum.value || 0),
      });
      summary += `유입인구는 총 {${Math.round(
        bucket.tot_sum.value || 0
      ).toLocaleString()}}명 입니다.`;
    } else {
      summary += `{${regionName} -> ${name}}\n`;
      chart.indicate.push({
        구분: regionName,
        지역: name + " 유출",
        생활인구: Math.round(bucket.tot_sum.value || 0),
      });
      summary += `유출인구는 총 {${Math.round(
        bucket.tot_sum.value || 0
      ).toLocaleString()}}명 입니다.`;
    }
    summaries.push(summary);
    stats.push({
      regionName: name,
      data: {
        flow: summary,
      },
    });
  }

  return {
    stat: stats,
    data: {
      title: "생활 이동 흐름",
      summary: summaries,
      charts: [chart],
    },
  };
}
