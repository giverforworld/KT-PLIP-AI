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
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
export async function transformWeekFlow(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<Record<string, TransResult>> {
  let summary: Summaries | Summary = isGroup
    ? { inflow: [] as string[], outflow: [] as string[] }
    : { inflow: "", outflow: "" };

  let charts: Record<string, BaseChartData[]> = { inflow: [], outflow: [] };
  let stats: StatSummariesObj[] = [];

  const keyMap = [
    {
      field: "by_detina",
      other: "by_pdepar",
      key: "inflow",
      name: "Inflow",
      str: "유입",
    },
    {
      field: "by_pdepar",
      other: "by_detina",
      key: "outflow",
      name: "Outflow",
      str: "유출",
    },
  ];
  for (const { field, other, key, name, str } of keyMap) {
    for (const regionCode of regionArray) {
      const regionName = await convertCDtoNM(regionCode);
      // 이미 해당 regionName에 대한 객체가 있는지 확인
      let statObj = stats.find((stat) => stat.regionName === regionName);

      // 없다면 새로 생성하여 추가
      if (!statObj) {
        statObj = { regionName, data: {} };
        stats.push(statObj);
      }
      const chart: Record<string, BaseChartData> = {
        [`${key}Week`]: {
          regionName,
          name: isGroup ? `${key}DataGroup` : `${key}Data`,
          indicate: [],
        },
        [`${key}Weeked`]: {
          regionName,
          name: isGroup ? `weekend${name}DataGroup` : `weekend${name}Data`,
          indicate: [],
        },
      };
      const regionWeekData = data[field].week.find(
        (item: any) => item.key.toString() === regionCode
      );
      const regionWeekedData = data[field].weeked.find(
        (item: any) => item.key.toString() === regionCode
      );
      if (hasExtraProperties(regionWeekData)) {
        for (const bucket of regionWeekData[`group_${other}_sum`].buckets) {
          const name = await convertCDtoNM(bucket.key);
          chart[`${key}Week`].indicate.push({
            구분: name,
            생활인구: Math.round(bucket.tot_sum.value),
          });
        }
        for (const bucket of regionWeekedData[`group_${other}_sum`].buckets) {
          const name = await convertCDtoNM(bucket.key);
          chart[`${key}Weeked`].indicate.push({
            구분: name,
            생활인구: Math.round(bucket.tot_sum.value),
          });
        }
        const weekMax = chart[`${key}Week`].indicate.find(
          (item) => item.구분 !== regionName
        );
        const weekedMax = chart[`${key}Weeked`].indicate.find(
          (item) => item.구분 !== regionName
        );
        if (key === "inflow") {
          statObj.data.Sum = {
            inflow:
              `내국인의 최다 유입지역은\n` +
              `평일에는 {${weekMax?.구분 ?? "-"}}, 휴일에는 {${
                weekedMax?.구분 ?? "-"
              }}입니다.`,
          };
          //평균에서 최대값 구하기
          const weekAvg = regionWeekData[`group_${other}_avg`].buckets.find(
            (item: any) => item.key !== regionCode
          );
          const weekedAvg = regionWeekedData[`group_${other}_avg`].buckets.find(
            (item: any) => item.key !== regionCode
          );
          statObj.data.Avg = {
            inflow:
              `내국인의 최다 유입지역은\n` +
              `평일에는 {${
                (await convertCDtoNM(weekAvg.key)) ?? "-"
              }}, 휴일에는 {${
                (await convertCDtoNM(weekedAvg.key)) ?? "-"
              }}입니다.`,
          };
          statObj.data.Unique = { inflow: "-" };
        }

        const summaryStr =
          `{${regionName}}\n` +
          `평일 최다 ${str}지역은 {${weekMax?.구분 ?? "-"}}이며,\n` +
          `휴일 최다 ${str}지역은 {${weekedMax?.구분 ?? "-"}}이며,\n`;

        if (isGroup) {
          (summary[key] as string[]).push(summaryStr);
        } else {
          summary[key] = summaryStr;
        }
      } else {
        if (isGroup) {
          (summary[key] as string[]).push("-");
        } else {
          summary[key] = "-";
        }

        statObj.data.Avg = { inflow: "-" };
        statObj.data.Sum = { inflow: "-" };
        statObj.data.Unique = { inflow: "-" };
      }
      charts[key].push(...Object.values(chart));
    }
  }
  return {
    inflow: {
      stat: stats,
      data: {
        title: "평일, 휴일별 유입지역",
        summary: summary.inflow,
        charts: charts.inflow,
      },
    },
    outflow: {
      data: {
        title: "평일, 휴일별 유출지역",
        summary: summary.outflow,
        charts: charts.outflow,
      },
    },
  };
}

export async function transFlow(
  regionArray: string[],
  data: any,
  isGroup: boolean
): Promise<BaseChartData[]> {
  let results: BaseChartData[] = [];
  const keys: Array<{
    key: string;
    name: string;
    prop: string;
  }> = [
    { key: "avg", name: "Avg", prop: "tot_avg" },
    { key: "sum", name: "Sum", prop: "tot_sum" },
  ];

  for (const { key, name, prop } of keys) {
    for (const regionCode of regionArray) {
      const chart: BaseChartData = {
        name: isGroup ? `flowDataGroup${name}` : `flowData${name}`,
        indicate: [],
      };
      const regionName = await convertCDtoNM(regionCode);
      const inflowData = data.inflow.find((item: any) => item[regionCode]);
      const outflowData = data.outflow.find((item: any) => item[regionCode]);

      for (const bucket of inflowData[regionCode].buckets) {
        const name = await convertCDtoFullNM(bucket.key);
        chart.indicate.push({
          구분: name,
          지역: regionName,
          생활인구: Math.round(bucket[prop].value || 0),
        });
      }
      for (const bucket of outflowData[regionCode].buckets) {
        const name = await convertCDtoFullNM(bucket.key);
        chart.indicate.push({
          구분: regionName,
          지역: name + " 유출",
          생활인구: Math.round(bucket[prop].value || 0),
        });
      }
      chart.regionName = regionName;
      results.push(chart);
    }
  }
  return results;
}
export async function transformFlowStatus(
  regionArray: string[],
  data: any
): Promise<any> {
  let stats: StatSummariesObj[] = [];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    // 이미 해당 regionName에 대한 객체가 있는지 확인
    let statObj = stats.find((stat) => stat.regionName === regionName);

    // 없다면 새로 생성하여 추가
    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }

    const regionWeekData = data.by_detina.week.find(
      (item: any) => item[regionCode]
    )[regionCode];
    const regionWeekedData = data.by_detina.weeked.find(
      (item: any) => item[regionCode]
    )[regionCode];
    if (regionWeekData) {
      statObj.data.Sum = {
        flow:
          `내국인의 최다 유입지역은\n` +
          `평일에는 {${await convertCDtoNM(
            regionWeekData.group_by_pdepar_sum.buckets[0].key
          )}}, 휴일에는 {${await convertCDtoNM(
            regionWeekedData.group_by_pdepar_sum.buckets[0].key
          )}}입니다.`,
      };
      statObj.data.Avg = {
        flow:
          `내국인의 최다 유입지역은\n` +
          `평일에는 {${await convertCDtoNM(
            regionWeekData.group_by_pdepar_avg.buckets[0].key
          )}}, 휴일에는 {${
            (await convertCDtoNM(
              regionWeekedData.group_by_pdepar_avg.buckets[0].key
            )) ?? "-"
          }}입니다.`,
      };
    }
  }
  return stats;
}
