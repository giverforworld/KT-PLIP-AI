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

import {
  formatDay,
  getKoreanDayOfWeek,
  getUTCDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
export async function transMopByDay(
  data: any,
  regionArray: string[],
  isGroup: boolean,
  type: string
): Promise<ChartDataContainer[]> {
  let daySummary = isGroup ? [] : "";
  let weekSummary = [];

  let results: Record<string, ChartDataContainer> = {};
  const flowType = type === "flow" ? ["inflow", "outflow"] : [type];
  let charts: {
    day: BaseChartData[];
    dow: any[];
  } = { day: [], dow: [] };

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const chart: Record<string, BaseChartData | MergedChartData> = {
      day: {
        regionName,
        name: isGroup
          ? `${type === "flow" ? "mop" : "odd"}DailyMoveTrendDataGroup`
          : `${type === "flow" ? "mop" : "odd"}DailyMoveTrendData`,
        indicate: [],
      },
      week: {
        regionName,
        name: isGroup
          ? `${type === "flow" ? "mop" : "odd"}WeekPopDataGroup`
          : `${type === "flow" ? "mop" : "odd"}WeekPopData`,
        indicate: [],
      },
      weeked: {
        ...(isGroup ? {} : { regionName }),
        name: isGroup
          ? `${type === "flow" ? "mop" : "odd"}WeekdayHolidayMoveDataGroup`
          : `${type === "flow" ? "mop" : "odd"}WeekdayHolidayMoveData`,
        ...(isGroup ? { data: [] } : { indicate: [] }),
      },
    };
    const indiCateData: Record<string, Indicate[]> = {
      day: [],
      dow: [],
      weeked: [],
    };
    let regionDaySummary = "";
    let regionDowSummary = "";
    let regionWeekSummary = "";
    for (const flow of flowType) {
      const regionData = data[flow].find(
        (item: any) => item.key.toString() === regionCode
      );
      //평균 합계 데이터
      if (hasExtraProperties(regionData)) {
        const maxDay = getUTCDate(regionData[`day_max_sum`].keys[0]);
        const minDay = getUTCDate(regionData[`day_min_sum`].keys[0]);
        const maxDow = regionData[`dow_max_avg`].keys[0];
        const minDow = regionData[`dow_min_avg`].keys[0];

        regionDaySummary +=
          `{${regionName}}\n` +
          `${flow === "inflow" ? "유입" : "유출"}인구는 최다 : {${
            maxDay.getMonth() + 1
          }월 ${maxDay.getDate()}일} {${Math.round(
            regionData[`day_max_sum`].value
          ).toLocaleString()}}명, ` +
          `최소 : {${
            minDay.getMonth() + 1
          }월 ${minDay.getDate()}일} {${Math.round(
            regionData[`day_min_sum`].value
          ).toLocaleString()}}명${flow === "inflow" ? "," : " 입니다."}`;

        regionDowSummary +=
          `{${regionName}}\n` +
          `최다 ${
            flow === "inflow" ? "유입" : "유출"
          } 요일은 {${getKoreanDayOfWeek(maxDow)}요일}이며,\n`;

        const inflowDifference =
          ((regionData.weekday_weekend_buckets.buckets.weekend.tot_avg.value -
            regionData.weekday_weekend_buckets.buckets.weekday.tot_avg.value) /
            regionData.weekday_weekend_buckets.buckets.weekday.tot_avg.value) *
          100;
        const inflowMoreOrLess = inflowDifference > 0 ? "많" : "적";

        regionWeekSummary +=
          `{${regionName}}\n` +
          `${
            flow === "inflow" ? "유입" : "유출"
          }인구는 평일 대비 휴일에 ${Math.abs(inflowDifference).toFixed(
            0
          )}% 더 ${inflowMoreOrLess}${
            flow === "inflow" ? "고, " : "습니다."
          } \n`;

        //indicate 생성
        //flow 일별

        for (const bucket of regionData[`by_day`].buckets) {
          // indicate 객체에 지역별 데이터 추가
          const indicateEntry: Record<string, string | number> = {
            구분: `${formatDay(bucket.key_as_string)}`,
            [type === "flow"
              ? flow === "inflow"
                ? "유입인구"
                : "유출인구"
              : "인구"]: Math.round(bucket["tot_sum"].value),
          };

          // 기존 데이터와 병합
          const existingEntry = indiCateData.day.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[
              type === "flow"
                ? flow === "inflow"
                  ? "유입인구"
                  : "유출인구"
                : "인구"
            ] =
              indicateEntry[
                type === "flow"
                  ? flow === "inflow"
                    ? "유입인구"
                    : "유출인구"
                  : "인구"
              ];
          } else {
            indiCateData.day.push(indicateEntry);
          }
        }

        //요일별
        for (const bucket of regionData[`by_dow`].buckets) {
          // indicate 객체에 지역별 데이터 추가
          const indicateEntry: Record<string, string | number> = {
            구분: `${getKoreanDayOfWeek(bucket.key)}`,
            [flow === "inflow" ? "유입인구" : "유출인구"]: Math.round(
              bucket["tot_avg"].value
            ),
          };

          // 기존 데이터와 병합
          const existingEntry = indiCateData.dow.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[flow === "inflow" ? "유입인구" : "유출인구"] =
              indicateEntry[flow === "inflow" ? "유입인구" : "유출인구"];
          } else {
            indiCateData.dow.push(indicateEntry);
          }
        }

        const indicateEntry: Record<string, string | number> = {
          구분: flow === "inflow" ? "유입인구" : "유출인구",
          평일: regionData.weekday_weekend_buckets.buckets.weekday[`tot_avg`]
            .value,
          휴일: regionData.weekday_weekend_buckets.buckets.weekend[`tot_avg`]
            .value,
        };
        const existingEntry = indiCateData.weeked.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[flow === "inflow" ? "유입인구" : "유출인구"] =
            indicateEntry[flow === "inflow" ? "유입인구" : "유출인구"];
        } else {
          indiCateData.weeked.push(indicateEntry);
        }
      } else {
        if (isGroup) {
          (daySummary as string[]).push("-");
        } else {
          daySummary = "-";
        }
        weekSummary.push(...["-", "-"]);
      }
    }
    if (isGroup) {
      (daySummary as string[]).push(regionDaySummary);

      (chart.weeked as MergedChartData).data.push({
        regionName,
        indicate: [...indiCateData.weeked],
      });

      const existingData = charts.dow.find(
        (data) => data.name === chart.weeked.name
      );
      if (existingData) {
        existingData.data.push({
          regionName,
          indicate: [...indiCateData.weeked],
        });
      } else {
        charts.dow.push(chart.weeked as MergedChartData);
      }
    } else {
      daySummary = regionDaySummary;
      (chart.weeked as BaseChartData).indicate = indiCateData.weeked;

      charts.dow.push(chart.weeked as BaseChartData);
    }
    weekSummary.push(regionDowSummary);
    weekSummary.push(regionWeekSummary);
    (chart.day as BaseChartData).indicate = indiCateData.day;
    charts.day.push(chart.day as BaseChartData);
    (chart.week as BaseChartData).indicate = indiCateData.dow;
    charts.dow.unshift(chart.week as BaseChartData);
  }
  // charts.dow.push(chart.week);
  // charts.dow.push(chart.weeked);
  results["day"] = {
    title: "일별 이동 추이",
    summary: daySummary,
    charts: charts.day,
  };

  results["dow"] = {
    title: "요일별 이동 분석",
    summary: weekSummary,
    charts: charts.dow,
  };

  return Object.values(results);
}
