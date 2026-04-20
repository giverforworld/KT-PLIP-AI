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
import { convertCDtoNM } from "@/helpers/convertNM";
import { sortByDow } from "@/helpers/sortByDow";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
export async function transformByDay(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<Record<string, ChartDataContainer>> {
  let daySummaries: Summaries = { Avg: [], Sum: [], Unique: [] };
  let daySummary: Summary = {};
  let dowSummaries: Summaries = { Avg: [], Sum: [] };
  let dowSummary: Summaries = { Avg: [], Sum: [] };

  let oneRegionName = ""; //지역이 하나일때

  let results: Record<string, ChartDataContainer> = {};

  const keys: Array<{
    key: string;
    name: string;
    prop: string;
  }> = [
    { key: "avg", name: "Avg", prop: "tot_avg" },
    { key: "sum", name: "Sum", prop: "tot_sum" },
  ];
  let charts: {
    day: BaseChartData[];
    dow: BaseChartData[];
  } = { day: [], dow: [] };
  for (const { key, name, prop } of keys) {
    const chart: Record<string, BaseChartData> = {
      day: {
        name: isGroup ? `monthDataGroup${name}` : `monthData${name}`,
        indicate: [],
      },
      week: {
        name: isGroup ? `weekDataGroup${name}` : `weekData${name}`,
        indicate: [],
      },
      weeked: {
        name: isGroup ? `weekedDataGroup${name}` : `weekedData${name}`,
        indicate: [],
      },
    };
    const indicateDayData: Indicate[] = [];

    for (const regionCode of regionArray) {
      const regionName = await convertCDtoNM(regionCode);

      const regionData = data.avgSum.find(
        (item: any) => item.key.toString() === regionCode
      );
      //평균 합계 데이터
      if (hasExtraProperties(regionData)) {
        const maxDay = getUTCDate(regionData[`day_max_${key}`].keys[0]);
        const minDay = getUTCDate(regionData[`day_min_${key}`].keys[0]);
        const maxDow = regionData[`dow_max_${key}`].keys[0];
        const minDow = regionData[`dow_min_${key}`].keys[0];

        const regionDaySummary =
          `{${regionName}}\n` +
          `{${maxDay.getMonth() + 1}}월 {${maxDay.getDate()}}일 {${Math.round(
            regionData[`day_max_${key}`].value
          ).toLocaleString()}}명으로 가장 많고,\n` +
          `{${minDay.getMonth() + 1}}월 {${minDay.getDate()}}일 {${Math.round(
            regionData[`day_min_${key}`].value
          ).toLocaleString()}}명으로 가장 적습니다.`;

        const regionDowSummary =
          `{${regionName}}\n` +
          `{${getKoreanDayOfWeek(maxDow)}요일}에 {${Math.round(
            regionData[`dow_max_${key}`].value
          ).toLocaleString()}}명으로 가장 많고,\n` +
          `{${getKoreanDayOfWeek(minDow)}요일}에 {${Math.round(
            regionData[`dow_min_${key}`].value
          ).toLocaleString()}}명으로 가장 적습니다.`;

        const regionWeekedSummary =
          `{${regionName}}\n` +
          `평일에는 {${Math.round(
            regionData.weekday_weekend_buckets.buckets.weekday[`tot_${key}`]
              .value
          ).toLocaleString()}}명,\n` +
          `휴일에는 {${Math.round(
            regionData.weekday_weekend_buckets.buckets.weekend[`tot_${key}`]
              .value
          ).toLocaleString()}}명 입니다.`;

        if (isGroup) {
          daySummaries[name].push(regionDaySummary);
          dowSummaries[name].push(regionDowSummary);
          dowSummaries[name].push(regionWeekedSummary);
        } else {
          chart.day.regionName = regionName;
          daySummary[name] = regionDaySummary;
          dowSummary[name].push(regionDowSummary);
          dowSummary[name].push(regionWeekedSummary);
          oneRegionName = regionName;
        }

        //indicate 생성
        //일별
        for (const bucket of regionData[`by_day`].buckets) {
          // indicate 객체에 지역별 데이터 추가
          const indicateEntry: Record<string, string | number> = {
            구분: `${formatDay(bucket.key_as_string)}`,
            [isGroup ? regionName : "생활인구"]: Math.round(bucket[prop].value),
          };

          // 기존 데이터와 병합
          const existingEntry = indicateDayData.find(
            (entry) => entry["구분"] === indicateEntry["구분"]
          );

          if (existingEntry) {
            existingEntry[isGroup ? regionName : "생활인구"] =
              indicateEntry[isGroup ? regionName : "생활인구"];
          } else {
            indicateDayData.push(indicateEntry);
          }
        }
        //요일별
        if (isGroup) {
          const indicate: Record<string, number | string> = {
            구분: regionName,
          };
          for (const bucket of regionData[`by_dow`].buckets) {
            indicate[getKoreanDayOfWeek(bucket.key)] = Math.round(
              bucket[`tot_${key}`].value
            );
          }
          chart.week.indicate.push(indicate);
          chart.weeked.indicate.push({
            구분: regionName,
            평일: Math.round(
              regionData.weekday_weekend_buckets.buckets.weekday[`tot_${key}`]
                .value
            ),
            휴일: Math.round(
              regionData.weekday_weekend_buckets.buckets.weekend[`tot_${key}`]
                .value
            ),
          });
        } else {
          const indicate = [];
          for (const bucket of regionData[`by_dow`].buckets) {
            // indicate 객체에 지역별 데이터 추가

            indicate.push({
              구분: `${getKoreanDayOfWeek(bucket.key)}`,
              생활인구: Math.round(bucket[prop].value),
            });
          }
          chart.week.regionName = oneRegionName;
          chart.week.indicate = indicate;
          chart.weeked.regionName = oneRegionName;
          chart.weeked.indicate = [
            {
              구분: "평일",
              생활인구: Math.round(
                regionData.weekday_weekend_buckets.buckets.weekday[`tot_${key}`]
                  .value
              ),
            },
            {
              구분: "휴일",
              생활인구: Math.round(
                regionData.weekday_weekend_buckets.buckets.weekend[`tot_${key}`]
                  .value
              ),
            },
          ];
        }
      } else {
        if (isGroup) {
          daySummaries[name].push(`{${regionName}}\n` + "-");
          dowSummaries[name].push(
            ...[`{${regionName}}\n` + "-", `{${regionName}}\n` + "-"]
          );
        } else {
          daySummary[name] = `{${regionName}}\n` + "-";
          dowSummaries[name].push(
            ...[`{${regionName}}\n` + "-", `{${regionName}}\n` + "-"]
          );
        }
      }
    }

    chart.day.indicate = indicateDayData;
    charts.day.push(chart.day);
    charts.dow.push(chart.week);
    charts.dow.push(chart.weeked);
  }

  const chart: BaseChartData = {
    name: isGroup ? `monthDataGroupUnique` : `monthDataUnique`,
    indicate: [],
  };
  const indicateUniqueData: Indicate[] = [];
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    //유니크 데이터
    const regionData = data.unique.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (hasExtraProperties(regionData)) {
      const maxDay = getUTCDate(
        regionData.ymd_max_popul.hits.hits[0]._source.BASE_YMD
      );
      const minDay = getUTCDate(
        regionData.ymd_min_popul.hits.hits[0]._source.BASE_YMD
      );

      const summary =
        `{${regionName}}\n` +
        `{${maxDay.getMonth() + 1}}월 {${maxDay.getDate()}}일 {${Math.round(
          regionData.ymd_max_popul.hits.hits[0]._source.TOT_POPUL_NUM
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `{${minDay.getMonth() + 1}}월 {${minDay.getDate()}}일 {${Math.round(
          regionData.ymd_min_popul.hits.hits[0]._source.TOT_POPUL_NUM
        ).toLocaleString()}}명으로 가장 적습니다.`;

      if (isGroup) {
        daySummaries["Unique"].push(summary);
      } else {
        chart.regionName = oneRegionName;
        daySummary["Unique"] = summary;
      }
      for (const hit of regionData[`sorted_by_ymd`].hits.hits) {
        // indicate 객체에 지역별 데이터 추가
        const indicateEntry: Record<string, string | number> = {
          구분: `${formatDay(hit._source.BASE_YMD.toString())}`,
          [isGroup ? regionName : "생활인구"]: Math.round(
            hit._source.TOT_POPUL_NUM
          ),
        };

        // 기존 데이터와 병합
        const existingEntry = indicateUniqueData.find(
          (entry) => entry["구분"] === indicateEntry["구분"]
        );

        if (existingEntry) {
          existingEntry[isGroup ? regionName : "생활인구"] =
            indicateEntry[isGroup ? regionName : "생활인구"];
        } else {
          indicateUniqueData.push(indicateEntry);
        }
      }
    } else {
      if (isGroup) {
        daySummaries["Unique"].push(`{${regionName}}\n` + "-");
      } else {
        daySummary["Unique"] = `{${regionName}}\n` + "-";
      }
    }
  }
  chart.indicate = indicateUniqueData;
  charts.day.push(chart);

  results["day"] = {
    title: "일별 내국인 생활인구",
    summary: isGroup ? daySummaries : daySummary,
    charts: charts.day,
  };

  results["dow"] = {
    title: "요일별 내국인 생활인구",
    summary: isGroup ? dowSummaries : dowSummary,
    charts: charts.dow,
  };

  return results;
}

export async function transByDayPattern(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<
  Record<string, StatSummariesObj[] | Record<string, ChartDataContainer>>
> {
  let daySummaries: Summaries = { Avg: [], Sum: [], Unique: [] };
  let daySummary: Summary = {};
  let dowSummaries: Summaries = { Avg: [], Sum: [] };
  let dowSummary: Summaries = { Avg: [], Sum: [] };

  let oneRegionName = ""; //지역이 하나일때
  let stats: StatSummariesObj[] = [];

  let results: Record<string, ChartDataContainer> = {
    day: {
      title: "일별 거주/직장/방문 인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
    dow: {
      title: "요일별(평일/휴일) 거주/직장/방문 인구",
      summary: isGroup ? [] : "",
      charts: [],
    },
  };

  const keys: Array<{
    key: string;
    name: string;
    prop: string;
  }> = [
    { key: "avg", name: "Avg", prop: "tot_avg" },
    { key: "sum", name: "Sum", prop: "tot_sum" },
  ];
  const patterns = [
    { pattern: "rsdn", value: "거주인구", unique: "RSDN" },
    { pattern: "wkplc", value: "직장인구", unique: "WKPLC" },
    { pattern: "vist", value: "방문인구", unique: "VIST" },
  ];

  for (const { key, name, prop } of keys) {
    const groupChart: MergedChartData = {
      name: `pWeekedDataGroup${name}`,
      data: [],
    };
    const chart: BaseChartData = {
      name: isGroup ? `pWeekedDataGroup${name}` : `pWeekedData${name}`,
      indicate: [],
    };
    for (const regionCode of regionArray) {
      const regionName = await convertCDtoNM(regionCode);

      let statObj = stats.find((stat) => stat.regionName === regionName);

      // 없다면 새로 생성하여 추가
      if (!statObj) {
        statObj = { regionName, data: {} };
        stats.push(statObj);
      }
      const regionData = data.avgSum.find(
        (item: any) => item.key.toString() === regionCode
      );

      const nCharts: Record<string, BaseChartData> = {
        day: {
          regionName,
          name: isGroup ? `pDayDataGroup${name}` : `pDayData${name}`,
          indicate: [],
        },
        week: {
          regionName,
          name: isGroup ? `pWeekDataGroup${name}` : `pWeekData${name}`,
          indicate: [],
        },
      };
      //평균 합계 데이터
      if (hasExtraProperties(regionData)) {
        let regionDaySummary = `{${regionName}}\n`;
        let regionDowSummary = `{${regionName}}\n`;
        let regionWeekedSummary = `{${regionName}}\n`;
        patterns.forEach(({ pattern, value }) => {
          const maxDay = getUTCDate(
            regionData[`day_${pattern}_max_${key}`].keys[0]
          );
          regionDaySummary += `${value}는 {${
            maxDay.getMonth() + 1
          }}월 {${maxDay.getDate()}}일 {${Math.round(
            regionData[`day_${pattern}_max_${key}`].value
          ).toLocaleString()}}명${
            pattern === "vist" ? "으로 가장 많습니다." : ",\n"
          }`;

          regionDowSummary += `${value}는 {${getKoreanDayOfWeek(
            regionData[`dow_${pattern}_max_${key}`].keys[0]
          )}요일}${pattern === "vist" ? "에 가장 많습니다." : ",\n"}`;

          const maxWeek =
            regionData.weekday_weekend_buckets.buckets.weekday[
              `${pattern}_${key}`
            ].value >
            regionData.weekday_weekend_buckets.buckets.weekend[
              `${pattern}_${key}`
            ].value
              ? "평일"
              : "휴일";

          regionWeekedSummary += `${value}는 {${maxWeek}}${
            pattern === "vist" ? "에 많습니다." : ","
          }\n`;
        });

        statObj.data[name] = { day: regionDaySummary, dow: regionDowSummary };
        const indicateData = [];
        //평일/휴일
        indicateData.push({
          구분: "평일",
          거주인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekday[`rsdn_${key}`]
                .value
            ) || 0,
          직장인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekday[`wkplc_${key}`]
                .value
            ) || 0,
          방문인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekday[`vist_${key}`]
                .value
            ) || 0,
        });
        indicateData.push({
          구분: "휴일",
          거주인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekend[`rsdn_${key}`]
                .value
            ) || 0,
          직장인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekend[`wkplc_${key}`]
                .value
            ) || 0,
          방문인구:
            Math.round(
              regionData.weekday_weekend_buckets.buckets.weekend[`vist_${key}`]
                .value
            ) || 0,
        });
        if (isGroup) {
          daySummaries[name].push(regionDaySummary);
          dowSummaries[name].push(regionDowSummary);
          dowSummaries[name].push(regionWeekedSummary);

          groupChart.data.push({ regionName, indicate: indicateData });
        } else {
          daySummary[name] = regionDaySummary;
          dowSummary[name].push(regionDowSummary);
          dowSummary[name].push(regionWeekedSummary);
          oneRegionName = regionName;
          //평일/휴일
          chart.regionName = regionName;
          chart.indicate = indicateData;
        }

        //일별
        nCharts.day.regionName = regionName;
        for (const bucket of regionData.by_day.buckets) {
          nCharts.day.indicate.push({
            구분: bucket.key_as_string,
            거주인구: Math.round(bucket[`rsdn_${key}`].value),
            직장인구: Math.round(bucket[`wkplc_${key}`].value),
            방문인구: Math.round(bucket[`vist_${key}`].value),
          });
        }
        //요일별
        nCharts.week.regionName = regionName;

        for (const bucket of sortByDow(regionData.by_dow.buckets)) {
          nCharts.week.indicate.push({
            구분: getKoreanDayOfWeek(bucket.key),
            거주인구: Math.round(bucket[`rsdn_${key}`].value),
            직장인구: Math.round(bucket[`wkplc_${key}`].value),
            방문인구: Math.round(bucket[`vist_${key}`].value),
          });
        }
      } else {
        if (isGroup) {
          daySummaries[name].push("-");
          dowSummaries[name].push(...["-", "-"]);
        } else {
          daySummary[name] = "-";
          dowSummaries[name].push(...["-", "-"]);
        }
      }

      results.day.charts.push(nCharts.day);
      results.dow.charts.push(nCharts.week);
      if (!isGroup) results.dow.charts.push(chart);
    }

    if (isGroup) {
      results.dow.charts.push(groupChart);
    }
  }

  //유니크 데이터 - 일별만 있음
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    let statObj = stats.find((stat) => stat.regionName === regionName);

    // 없다면 새로 생성하여 추가
    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }
    const regionUniqueData = data.unique.find(
      (item: any) => item.key.toString() === regionCode
    );

    const nCharts: Record<string, BaseChartData> = {
      day: {
        regionName,
        name: isGroup ? `pDayDataGroupUnique` : `pDayDataUnique`,
        indicate: [],
      },
    };
    if (hasExtraProperties(regionUniqueData)) {
      let regionDaySummary = `{${regionName}}\n`;
      patterns.forEach(({ pattern, value }) => {
        const maxDay = getUTCDate(
          regionUniqueData[`${pattern}_max_popul`].hits.hits[0]._source.BASE_YMD
        );
        regionDaySummary += `${value}는 {${
          maxDay.getMonth() + 1
        }}월 {${maxDay.getDate()}}일 {${Math.round(
          regionUniqueData[`${pattern}_max_popul`].hits.hits[0]._source.BASE_YMD
        ).toLocaleString()}}명${
          pattern === "vist" ? "으로 가장 많습니다." : ","
        }\n`;
      });

      nCharts.day.regionName = regionName;
      for (const hit of regionUniqueData.by_day.hits.hits) {
        nCharts.day.indicate.push({
          구분: hit._source.BASE_YMD,
          거주인구: Math.round(
            hit._source.RSDN_MALE_POPUL_NUM + hit._source.RSDN_FEML_POPUL_NUM
          ),
          직장인구: Math.round(
            hit._source.WKPLC_MALE_POPUL_NUM + hit._source.WKPLC_FEML_POPUL_NUM
          ),
          방문인구: Math.round(
            hit._source.VIST_MALE_POPUL_NUM + hit._source.VIST_FEML_POPUL_NUM
          ),
        });
      }
      statObj.data["Unique"] = { day: regionDaySummary };
      if (isGroup) {
        daySummaries["Unique"].push(regionDaySummary);
      } else {
        daySummary["Unique"] = regionDaySummary;
      }
    }
    // else {
    //   if (isGroup) {
    //     daySummaries["Unique"].push("-");
    //   } else {
    //     daySummary["Unique"] = "-";
    //   }
    // }
    results.day.charts.push(nCharts.day);
  }

  results.day.summary = isGroup ? daySummaries : daySummary;
  results.dow.summary = isGroup ? dowSummaries : dowSummary;

  return { stat: stats, data: results };
}
