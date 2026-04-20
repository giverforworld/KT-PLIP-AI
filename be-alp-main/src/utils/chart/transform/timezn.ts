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

import { sortByAgeOrder } from "@/helpers/sortByAgeOrder";
import { convertCDtoNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
import { findMaxTimeForKeys, findOverallMaxObj } from "@/helpers/getMax";
import { getKoreanDayOfWeek } from "@/helpers/convertDate";

export async function transTimezn(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer[]> {
  let results: Record<string, ChartDataContainer> = {
    sex: {
      title: "시간대별 성별 내국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    age: {
      title: "시간대별 연령대별 내국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    dow: {
      title: "시간대별 요일별 내국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    week: {
      title: "시간대별 평일/휴일별 내국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
  };

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    const chartsData: Record<string, BaseChartData> = {
      sex: {
        regionName,
        name: `timeGenderPopData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      age: {
        regionName,
        name: `timeAgePopData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      dow: {
        regionName,
        name: `timeDayPopData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      week: {
        regionName,
        name: `timeWeekPopData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
    };

    const regionData = data.find(
      (item: any) => item.key.toString() === regionCode
    );
    //지역 for문 돌면서  summary추가 charts[] BaseChartData  regionName 추가 데이터 추가
    //chartMap 별로 데이터 생성
    if (hasExtraProperties(regionData)) {
      for (const timeznBucket of regionData.by_timezn.buckets) {
        //성별
        chartsData.sex.indicate.push({
          구분: `${timeznBucket.key}`,
          남성: timeznBucket.male.value,
          여성: timeznBucket.female.value,
        });
        //연령대별
        const ageValues = sortByAgeOrder(
          timeznBucket.age_groups.value.age_groups,
          true
        );
        chartsData.age.indicate.push({
          구분: `${timeznBucket.key}`,
          ...ageValues,
        });
        //요일별
        const dayValues = timeznBucket.dow_buckets.buckets.reduce(
          (acc: Record<string, number>, dowBucket: any) => {
            const dayName = getKoreanDayOfWeek(dowBucket.key);
            acc[dayName] = dowBucket.tot_sum.value;
            return acc;
          },
          {} as Record<string, number>
        );
        chartsData.dow.indicate.push({
          구분: `${timeznBucket.key}`,
          ...dayValues,
        });
        //평일 휴일별
        chartsData.week.indicate.push({
          구분: `${timeznBucket.key}`,
          평일: timeznBucket.weekday_weekend_buckets.buckets.weekday.tot_sum
            .value,
          휴일: timeznBucket.weekday_weekend_buckets.buckets.weekend.tot_sum
            .value,
        });
      }
      const ageMax = findOverallMaxObj(chartsData.age.indicate);
      const dowMax = findOverallMaxObj(chartsData.dow.indicate);
      const weekMax = findMaxTimeForKeys(chartsData.week.indicate, [
        "평일",
        "휴일",
      ]);
      const sexSummary =
        `{${regionName}}\n` +
        `남성 {${formatTimeZone(regionData.max_male.keys) ?? "-"}},\n` +
        `여성 {${
          formatTimeZone(regionData.max_female.keys) ?? "-"
        }}에 가장 많습니다.\n`;
      const ageSummary =
        `{${regionName}}\n` +
        `최다 연령대는 {${ageMax?.key ?? "-"}}으로 {${
          formatTimeZone(ageMax?.구분) ?? "-"
        }}에 가장 많습니다.`;
      const dowSummary =
        `{${regionName}}\n` +
        `최다 요일은 {${dowMax?.key ?? "-"}요일}으로 {${
          formatTimeZone(dowMax?.구분) ?? "-"
        }}에 가장 많습니다.`;
      const weekSummary =
        `{${regionName}}\n` +
        `평일에는 {${formatTimeZone(weekMax["평일"].구분) ?? "-"}}, \n` +
        `휴일에는 {${
          formatTimeZone(weekMax["휴일"].구분) ?? "-"
        }}에 가장 많습니다.`;
      if (isGroup) {
        (results.sex.summary as string[]).push(sexSummary);
        (results.age.summary as string[]).push(ageSummary);
        (results.dow.summary as string[]).push(dowSummary);
        (results.week.summary as string[]).push(weekSummary);
      } else {
        results.sex.summary = sexSummary;
        results.age.summary = ageSummary;
        results.dow.summary = dowSummary;
        results.week.summary = weekSummary;
      }
    } else {
      if (isGroup) {
        (results.sex.summary as string[]).push("-");
        (results.age.summary as string[]).push("-");
        (results.dow.summary as string[]).push("-");
        (results.week.summary as string[]).push("-");
      } else {
        results.sex.summary = "-";
        results.age.summary = "-";
        results.dow.summary = "-";
        results.week.summary = "-";
      }
    }

    results.sex.charts.push(chartsData.sex);
    results.age.charts.push(chartsData.age);
    results.dow.charts.push(chartsData.dow);
    results.week.charts.push(chartsData.week);
  }
  return Object.values(results);
}

export async function transTimeznPattern(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let result: ChartDataContainer = {
    title: "시간대별 거주/직장/방문 인구",
    summary: isGroup ? [] : "",
    charts: [],
  };
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    const chartsData: BaseChartData = {
      regionName,
      name: `pTimeData${isGroup ? "Group" : ""}`,
      indicate: [],
    };

    const regionData = data.find(
      (item: any) => item.key.toString() === regionCode
    );
    //지역 for문 돌면서  summary추가 charts[] BaseChartData  regionName 추가 데이터 추가
    //chartMap 별로 데이터 생성
    if (hasExtraProperties(regionData)) {
      for (const timeznBucket of regionData.by_timezn.buckets) {
        //성별
        chartsData.indicate.push({
          구분: `${timeznBucket.key}`,
          거주인구: Math.round(timeznBucket.rsdn.value),
          직장인구: Math.round(timeznBucket.wkplc.value),
          방문인구: Math.round(timeznBucket.vist.value),
        });
      }
      const summary =
        `{${regionName}}\n` +
        `거주인구는 {${regionData.max_rsdn.keys ?? "-"}시},\n` +
        `직장인구는 {${regionData.max_wkplc.keys ?? "-"}시},\n` +
        `방문인구는 {${regionData.max_vist.keys ?? "-"}시}에 가장 많습니다.\n`;
      if (isGroup) {
        (result.summary as string[]).push(summary);
      } else {
        result.summary = summary;
      }
    } else {
      if (isGroup) {
        (result.summary as string[]).push("-");
      } else {
        result.summary = "-";
      }
    }
    result.charts.push(chartsData);
  }
  return result;
}
