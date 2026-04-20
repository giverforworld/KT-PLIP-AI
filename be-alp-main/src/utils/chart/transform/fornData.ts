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
import { convertCDtoNM, convertFornNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";
import { findOverallMaxObj, getTop10Countries } from "@/helpers/getMax";
import { sortByDow } from "@/helpers/sortByDow";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
export async function transFornData(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<
  Record<string, StatSummariesObj[] | Record<string, ChartDataContainer>>
> {
  let results: Record<string, ChartDataContainer> = {
    day: {
      title: "일별 외국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    dowTime: {
      title: "요일별, 시간대별 외국인 생활인구",
      summary: [],
      charts: [],
    },
    timezn: {
      title: "시간대별 국가별 외국인 생활인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    country: {
      title: "국가별 외국인 생활인구 비중",
      summary: isGroup ? [] : "",
      charts: [],
    },
  };
  let stats: StatSummariesObj[] = [];

  const indicateDayData: Indicate[] = [];
  const indicateTimeData: Indicate[] = [];

  const oneChart: Record<string, BaseChartData> = {
    day: {
      name: `foreignerMonthData${isGroup ? "Group" : ""}`,
      indicate: [],
    },
    dow: {
      name: `foreignerWeekData${isGroup ? "Group" : ""}`,
      indicate: [],
    },
    time: {
      name: `foreignerTimeData${isGroup ? "Group" : ""}`,
      indicate: [],
    },
  };
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    let statObj = stats.find((stat) => stat.regionName === regionName);

    // 없다면 새로 생성하여 추가
    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }
    const nCharts: Record<string, BaseChartData> = {
      timezn: {
        regionName,
        name: `foreignerTimeCountryData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      country: {
        regionName,
        name: `foreignerData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
    };
    const regionData = data.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (hasExtraProperties(regionData)) {
      //시간대별 국가별
      // 전체 시간대에서 상위 10개 국가를 선정
      const top10Countries = getTop10Countries(regionData.by_timezn);

      for (const timeznBucket of regionData.by_timezn.buckets) {
        const countryData = timeznBucket.by_timezn_country_sums.value;

        // 시간대별로 상위 10개 국가의 데이터를 필터링
        const top10CountryValues = top10Countries.reduce((acc, country) => {
          const value = countryData[country] || 0;
          acc[country] = value;

          return acc;
        }, {} as { [country: string]: number });

        // 시간대별 국가 데이터 추가
        nCharts.timezn.indicate.push({
          구분: `${timeznBucket.key}`,
          ...convertFornNM(top10CountryValues),
        });
      }
      results.timezn.charts.push(nCharts.timezn);
      const convertFornSum = convertFornNM(
        regionData.top10_country.value.top10_sums
      );
      const convertFornAvg = convertFornNM(
        regionData.top10_country.value.top10_avgs
      );

      Object.entries(convertFornSum).forEach(([key, value]) =>
        nCharts.country.indicate.push({ 구분: key, 외국인생활인구: value })
      );

      results.country.charts.push(nCharts.country);
      const timeznMax = findOverallMaxObj(nCharts.timezn.indicate);
      const countryRatio = (
        (Object.values(convertFornSum)[0] / regionData.tot_sum.value) *
        100
      ).toFixed(0);
      const timeznSummary =
        `{${regionName}}\n` +
        `최다 외국인 생활인구 국가는 {${timeznMax?.key ?? "-"}}(으)로 {${
          formatTimeZone(timeznMax?.구분) ?? "-"
        }}에 가장 많습니다.`;
      const countrySummary =
        `{${regionName}}\n` +
        `외국인 생활인구 비중은 {${
          Object.keys(convertFornSum)[0]
        }}(이)가 {${countryRatio}}%로 가장 많습니다.`;
      statObj.data.Sum = {
        forn:
          `외국인 생활인구는\n` +
          `{${Math.round(
            regionData.tot_sum.value
          ).toLocaleString()}}명 입니다.`,
        fornCountry:
          `국가별 외국인 생활인구는\n` +
          `{${Object.keys(convertFornSum)[0]}} 비중이 가장 많습니다.`,
      };
      statObj.data.Avg = {
        forn:
          `외국인 생활인구는\n` +
          `{${Math.round(
            regionData.tot_avg.value
          ).toLocaleString()}}명 입니다.`,
        fornCountry:
          `국가별 외국인 생활인구는\n` +
          `{${Object.keys(convertFornAvg)[0]}} 비중이 가장 많습니다.`,
      };
      const maxDay = getUTCDate(regionData[`day_max_sum`].keys[0]);
      const minDay = getUTCDate(regionData[`day_min_sum`].keys[0]);
      const maxDow = regionData[`dow_max_sum`].keys[0];
      const minDow = regionData[`dow_min_sum`].keys[0];
      const maxTime = regionData[`time_max_sum`].keys[0];
      const minTime = regionData[`time_min_sum`].keys[0];

      const regionDaySummary =
        `{${regionName}}\n` +
        `{${maxDay.getMonth() + 1}}월 {${maxDay.getDate()}}일 {${Math.round(
          regionData[`day_max_sum`].value
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `{${minDay.getMonth() + 1}}월 {${minDay.getDate()}}일 {${Math.round(
          regionData[`day_min_sum`].value
        ).toLocaleString()}}명으로 가장 적습니다.`;

      const regionDowSummary =
        `{${regionName}}\n` +
        `{${getKoreanDayOfWeek(maxDow)}요일}에 {${Math.round(
          regionData[`dow_max_sum`].value
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `{${getKoreanDayOfWeek(minDow)}요일}에 {${Math.round(
          regionData[`dow_min_sum`].value
        ).toLocaleString()}}명으로 가장 적습니다.`;

      const regionTimeSummary =
        `{${regionName}}\n` +
        `{${formatTimeZone(maxTime)}}에 {${Math.round(
          regionData[`time_max_sum`].value
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `{${formatTimeZone(minTime)}}에 {${Math.round(
          regionData[`time_min_sum`].value
        ).toLocaleString()}}명으로 가장 적습니다.`;

      (results.dowTime.summary as string[]).push(regionDowSummary);
      (results.dowTime.summary as string[]).push(regionTimeSummary);

      if (isGroup) {
        (results.day.summary as string[]).push(regionDaySummary);
        (results.timezn.summary as string[]).push(timeznSummary);
        (results.country.summary as string[]).push(countrySummary);

        //요일별, 시간대별
        const indicateDow: Record<string, number | string> = {
          구분: regionName,
        };
        for (const bucket of sortByDow(regionData[`by_dow`].buckets)) {
          indicateDow[getKoreanDayOfWeek(bucket.key)] = Math.round(
            bucket[`tot_sum`].value
          );
        }
        oneChart.dow.indicate.push(indicateDow);
      } else {
        oneChart.day.regionName = regionName;
        results.day.summary = regionDaySummary;
        results.timezn.summary = timeznSummary;
        results.country.summary = countrySummary;

        const indicateDow = [];
        for (const bucket of regionData[`by_dow`].buckets) {
          // indicate 객체에 지역별 데이터 추가

          indicateDow.push({
            구분: `${getKoreanDayOfWeek(bucket.key)}`,
            외국인생활인구: Math.round(bucket.tot_sum.value),
          });
        }
        oneChart.dow.regionName = regionName;
        oneChart.time.regionName = regionName;
        oneChart.dow.indicate = indicateDow;
      }
      //시간대별
      for (const bucket of regionData[`by_timezn`].buckets) {
        // indicate 객체에 지역별 데이터 추가
        const indicateEntry: Record<string, string | number> = {
          구분: `${bucket.key}`,
          [isGroup ? regionName : "외국인생활인구"]: Math.round(
            bucket.tot_sum.value
          ),
        };

        // 기존 데이터와 병합
        const existingEntry = indicateTimeData.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[isGroup ? regionName : "외국인생활인구"] =
            indicateEntry[isGroup ? regionName : "외국인생활인구"];
        } else {
          indicateTimeData.push(indicateEntry);
        }
      }
      //일별
      for (const bucket of regionData[`by_day`].buckets) {
        // indicate 객체에 지역별 데이터 추가
        const indicateEntry: Record<string, string | number> = {
          구분: `${formatDay(bucket.key_as_string)}`,
          [isGroup ? regionName : "외국인생활인구"]: Math.round(
            bucket.tot_sum.value
          ),
        };

        // 기존 데이터와 병합
        const existingEntry = indicateDayData.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[isGroup ? regionName : "외국인생활인구"] =
            indicateEntry[isGroup ? regionName : "외국인생활인구"];
        } else {
          indicateDayData.push(indicateEntry);
        }
      }
    } else {
      if (isGroup) {
        (results.day.summary as string[]).push("-");
        (results.timezn.summary as string[]).push("-");
        (results.country.summary as string[]).push("-");
      } else {
        results.day.summary = "-";
        results.timezn.summary = "-";
        results.country.summary = "-";
      }
      (results.dowTime.summary as string[]).push("-");
      statObj.data.Sum = {
        forn: "-",
        fornCountry: "-",
      };
      statObj.data.Avg = {
        forn: "-",
        fornCountry: "-",
      };
    }
    statObj.data.Unique = {
      forn: "-",
      fornCountry: "-",
    };
  }
  oneChart.day.indicate = indicateDayData;
  oneChart.time.indicate = indicateTimeData;

  results.day.charts.push(oneChart.day);
  results.dowTime.charts.push(oneChart.dow);
  results.dowTime.charts.push(oneChart.time);
  return {
    stat: stats,
    data: results,
  };
}
