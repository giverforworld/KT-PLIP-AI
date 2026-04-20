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
import { getUTCDate } from "@/helpers/convertDate";
import {
  convertCDtoFullNM,
  convertCDtoNM,
  findCDValue,
} from "@/helpers/convertNM";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import { isValidMonth } from "@/middlewares/validators";

export async function transformComparePeriod(
  start: string,
  data: OpenSearchData,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let summariesObj: Record<string, string[]> = {};
  const summaryObj: Record<string, string> = {};
  const date = getUTCDate(start);
  const lastYearYM = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
  const prevMonthYM = `${date.getFullYear()}년 ${date.getMonth()}월`;
  const startYM = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  const charts: Array<{
    regionName?: string;
    name: string;
    indicate: Record<string, string | number>[];
  }> = [];
  // Prop을 keyof로 지정하여 안전한 접근
  const keys: Array<{
    name: string;
    prop: keyof OpenSearchData["avgSum"][number]["start"];
  }> = [
    { name: "Avg", prop: "tot_avg" },
    { name: "Sum", prop: "tot_sum" },
  ];

  const isMonth = isValidMonth(start as string);
  if (!isGroup) {
    // 한 개의 지역일 경우 처리
    for (const region of data.avgSum) {
      for (const { name, prop } of keys) {
        const currentVal = region.start[prop].value || 0;
        const lastYearVal = region.lastYear[prop].value || 0;
        const regionName = await convertCDtoNM(region.key);

        // 전년 동기 대비 증감율 계산
        const lastYearText = calculateRate(currentVal, lastYearVal);

        charts.push({
          regionName: regionName,
          name: `lastyearData${name}`,
          indicate: [
            { 구분: lastYearYM, 생활인구: Math.round(lastYearVal) },
            { 구분: startYM, 생활인구: Math.round(currentVal) },
          ],
        });
        // 전월 대비 증감율 계산
        let prevMonthText = "-";
        if (isMonth && region.prevMonth) {
          const prevMonthVal = region.prevMonth?.[prop]?.value || 0;
          prevMonthText = calculateRate(currentVal, prevMonthVal);

          charts.push({
            regionName: regionName,
            name: `preMonthData${name}`,
            indicate: [
              { 구분: prevMonthYM, 생활인구: Math.round(prevMonthVal) },
              { 구분: startYM, 생활인구: Math.round(currentVal) },
            ],
          });
        }

        summaryObj[name] =
          `{${regionName}}\n` +
          `내국인 생활인구 총 {${Math.round(
            currentVal
          ).toLocaleString()}}명,\n` +
          `전년 동기 대비  ${lastYearText} 및 전월 대비 ${prevMonthText}했습니다.`;
      }
    }
    // Unique 데이터 처리
    const uniqueData = data.unique;
    if (uniqueData && uniqueData.length !== 0) {
      // unique 데이터를 전년도와 조회 월로 나누어 추가
      const lastYearObj = uniqueData.find(
        (unique) =>
          `${Math.floor(unique._source.BASE_YM / 100)}년 ${
            unique._source.BASE_YM % 100
          }월` === lastYearYM
      );

      const startObj = uniqueData.find(
        (unique) =>
          `${Math.floor(unique._source.BASE_YM / 100)}년 ${
            unique._source.BASE_YM % 100
          }월` === startYM
      );
      const regionName = await convertCDtoNM(uniqueData[0]?._source);

      //데이터 없는 경우 0으로 추가해주기
      charts.push({
        regionName: regionName,
        name: "lastyearDataUnique",
        indicate: [
          {
            구분: lastYearYM,
            생활인구: Math.round(
              lastYearObj ? lastYearObj._source.TOT_POPUL_NUM : 0
            ),
          },
          {
            구분: startYM,
            생활인구: Math.round(startObj ? startObj._source.TOT_POPUL_NUM : 0),
          },
        ],
      });

      let lastYearText = "";
      let prevMonthText = "";
      const lastYearUnique = lastYearObj
        ? lastYearObj._source.TOT_POPUL_NUM
        : 0;

      const currentVal = startObj ? startObj._source.TOT_POPUL_NUM : 0;

      lastYearText = calculateRate(currentVal, lastYearUnique);

      if (isMonth) {
        const prevMonthObj = uniqueData.find(
          (unique) =>
            `${Math.floor(unique._source.BASE_YM / 100)}년 ${
              unique._source.BASE_YM % 100
            }월` === prevMonthYM
        );
        charts.push({
          regionName: regionName,
          name: "preMonthDataUnique",
          indicate: [
            {
              구분: prevMonthYM,
              생활인구: prevMonthObj
                ? Math.round(prevMonthObj._source.TOT_POPUL_NUM)
                : 0,
            },
            {
              구분: startYM,
              생활인구: startObj
                ? Math.round(startObj._source.TOT_POPUL_NUM)
                : 0,
            },
          ],
        });

        const preMonthUnique = prevMonthObj
          ? prevMonthObj._source.TOT_POPUL_NUM
          : 0;

        prevMonthText = calculateRate(currentVal, preMonthUnique);
      }

      summaryObj.Unique =
        `{${regionName}}\n` +
        `내국인 생활인구 ${Math.round(currentVal).toLocaleString()}명으로,\n` +
        `전년 동기 대비 ${lastYearText} 및 전월 대비 ${prevMonthText}했습니다.`;
    }
  } else {
    // 여러 개의 지역일 경우 처리
    await Promise.all(
      keys.map(async ({ name, prop }) => {
        const indicatesPromises = regionArray.map(async (regionCode) => {
          const regionName = await convertCDtoNM(regionCode);
          const regionData = data.avgSum.find(
            (item) => item.key.toString() === regionCode
          );
          return {
            구분: regionName,
            [lastYearYM]: Math.round(regionData?.lastYear[prop]?.value || 0),
            [startYM]: Math.round(regionData?.start[prop]?.value || 0),
          };
        });

        // 모든 Promise가 완료될 때까지 기다린 후 결과를 사용
        const indicates = await Promise.all(indicatesPromises);
        charts.push({
          name: `lastyearDataGroup${name}`,
          indicate: indicates,
        });
        if (isMonth) {
          const preMonthPromises = regionArray.map(async (regionCode) => {
            const regionName = await convertCDtoNM(regionCode);
            const regionData = data.avgSum.find(
              (item) => item.key.toString() === regionCode
            );
            return {
              구분: regionName,
              [prevMonthYM]: regionData?.prevMonth
                ? Math.round(regionData.prevMonth[prop]?.value || 0)
                : 0,
              [startYM]: Math.round(regionData?.start[prop]?.value || 0),
            };
          });

          const preMonthIndicates = await Promise.all(preMonthPromises);
          charts.push({
            name: `preMonthDataGroup${name}`,
            indicate: preMonthIndicates,
          });
        }
      })
    );

    // Unique 데이터 처리
    const uniqueData = data.unique;

    const existUnique = !!(uniqueData && uniqueData.length !== 0);
    if (existUnique) {
      // unique 데이터를 전년도와 조회 월로 나누어 추가
      const uniqueIndicate = {
        lastyearDataGroupUnique: [] as Array<{
          [key: string]: number | string;
        }>,
        preMonthDataGroupUnique: [] as Array<{
          [key: string]: number | string;
        }>,
      };
      // for...of를 사용하여 비동기 처리 대기
      for (const regionCode of regionArray) {
        const regionName = await convertCDtoNM(regionCode); // await 사용
        const regionUniqueDataList = uniqueData.filter(
          (item) => findCDValue(item._source) === regionCode
        );

        //데이터 없는 경우
        if (regionUniqueDataList.length === 0) {
          uniqueIndicate.lastyearDataGroupUnique.push({
            구분: regionName,
          });
          uniqueIndicate.preMonthDataGroupUnique.push({
            구분: regionName,
          });
        }
        regionUniqueDataList.forEach(async (data) => {
          const { BASE_YM, TOT_POPUL_NUM } = data._source;
          const yearMonth = `${Math.floor(BASE_YM / 100)}년 ${BASE_YM % 100}월`;

          if (yearMonth === lastYearYM) {
            const found = uniqueIndicate.lastyearDataGroupUnique.find(
              (item) => item.구분 === regionName
            );
            if (found) {
              found[lastYearYM] = Math.round(TOT_POPUL_NUM); // 기존 값에 추가
            } else {
              uniqueIndicate.lastyearDataGroupUnique.push({
                구분: regionName,
                [lastYearYM]: Math.round(TOT_POPUL_NUM),
              });
            }
          } else if (yearMonth === prevMonthYM) {
            const found = uniqueIndicate.preMonthDataGroupUnique.find(
              (item) => item.구분 === regionName
            );
            if (found) {
              found[prevMonthYM] = Math.round(TOT_POPUL_NUM); // 기존 값에 추가
            } else {
              uniqueIndicate.preMonthDataGroupUnique.push({
                구분: regionName,
                [prevMonthYM]: Math.round(TOT_POPUL_NUM),
              });
            }
          } else if (yearMonth === startYM) {
            const prefound = uniqueIndicate.preMonthDataGroupUnique.find(
              (item) => item.구분 === regionName
            );
            if (prefound) {
              prefound[startYM] = Math.round(TOT_POPUL_NUM); // 기존 값에 추가
            } else {
              uniqueIndicate.preMonthDataGroupUnique.push({
                구분: regionName,
                [startYM]: Math.round(TOT_POPUL_NUM),
              });
            }
            const lastfound = uniqueIndicate.lastyearDataGroupUnique.find(
              (item) => item.구분 === regionName
            );
            if (lastfound) {
              lastfound[startYM] = Math.round(TOT_POPUL_NUM); // 기존 값에 추가
            } else {
              uniqueIndicate.lastyearDataGroupUnique.push({
                구분: regionName,
                [startYM]: Math.round(TOT_POPUL_NUM),
              });
            }
          }
        });
      }
      //데이터가 없는 경우 0으로 설정
      addMissingDataWithReordering(
        uniqueIndicate.lastyearDataGroupUnique,
        startYM,
        lastYearYM
      );

      charts.push({
        name: "lastyearDataGroupUnique",
        indicate: uniqueIndicate.lastyearDataGroupUnique,
      });
      if (isMonth) {
        addMissingDataWithReordering(
          uniqueIndicate.preMonthDataGroupUnique,
          startYM,
          prevMonthYM
        );
        charts.push({
          name: "preMonthDataGroupUnique",
          indicate: uniqueIndicate.preMonthDataGroupUnique,
        });
      }
    }

    summariesObj = generateSummariesObj(
      charts,
      existUnique,
      startYM,
      lastYearYM,
      prevMonthYM
    );
  }

  return {
    title: "전년/전월 동기 대비 생활인구",
    summary: isGroup ? summariesObj : summaryObj,
    charts,
  };
}

export async function transformComparePeriodForn(
  start: string,
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let summaries: string[] = [];
  let summary = "";
  const date = getUTCDate(start);
  const lastYearYM = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
  const prevMonthYM = `${date.getFullYear()}년 ${date.getMonth()}월`;
  const startYM = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  const charts: Array<{
    regionName?: string;
    name: string;
    indicate: Record<string, string | number>[];
  }> = [];

  const isMonth = isValidMonth(start as string);

  if (!isGroup) {
    // 한 개의 지역일 경우 처리
    for (const region of data) {
      const currentVal = region.start["tot_sum"].value || 0;
      const lastYearVal = region.lastYear["tot_sum"].value || 0;

      const regionName = await convertCDtoNM(region.key);

      // 전년 동기 대비 증감율 계산
      const lastYearText = calculateRate(currentVal, lastYearVal);

      // 전월 대비 증감율 계산
      const prevMonthVal = region.prevMonth?.["tot_sum"]?.value || 0;
      const prevMonthText = calculateRate(currentVal, prevMonthVal);

      summary =
        `{${regionName}}\n` +
        `외국인 생활인구 총 {${Math.round(currentVal).toLocaleString()}}명,\n` +
        `전년 동기 대비  ${lastYearText} 및 전월 대비 ${prevMonthText}했습니다.`;

      charts.push({
        regionName: regionName,
        name: `foreignerLastyearData`,
        indicate: [
          { 구분: lastYearYM, 외국인생활인구: Math.round(lastYearVal) },
          { 구분: startYM, 외국인생활인구: Math.round(currentVal) },
        ],
      });

      if (isMonth && region.prevMonth) {
        charts.push({
          regionName: regionName,
          name: `foreignerPreMonthData`,
          indicate: [
            { 구분: prevMonthYM, 외국인생활인구: Math.round(prevMonthVal) },
            { 구분: startYM, 외국인생활인구: Math.round(currentVal) },
          ],
        });
      }
    }
  } else {
    // 여러 개의 지역일 경우 처리
    const indicate: { [key: string]: Record<string, string | number>[] } = {
      last: [],
      prev: [],
    };
    for (const regionCode of regionArray) {
      const regionName = await convertCDtoNM(regionCode);
      const regionData = data.find(
        (item: any) => item.key.toString() === regionCode
      );
      const currentVal = regionData?.start["tot_sum"].value || 0;
      const lastYearVal = regionData?.lastYear["tot_sum"].value || 0;

      // 전년 동기 대비 증감율 계산
      const lastYearText = calculateRate(currentVal, lastYearVal);

      // 전월 대비 증감율 계산
      const prevMonthVal = regionData?.prevMonth?.["tot_sum"]?.value || 0;
      const prevMonthText = calculateRate(currentVal, prevMonthVal);

      summaries.push(
        `{${regionName}}\n` +
          `외국인 생활인구 총 {${Math.round(
            currentVal
          ).toLocaleString()}}명,\n` +
          `전년 동기 대비  ${lastYearText} 및 전월 대비 ${prevMonthText}했습니다.`
      );
      indicate.last.push({
        구분: regionName,
        [lastYearYM]: Math.round(regionData?.lastYear["tot_sum"]?.value || 0),
        [startYM]: Math.round(regionData?.start["tot_sum"]?.value || 0),
      });
      if (isMonth)
        indicate.prev.push({
          구분: regionName,
          [prevMonthYM]: regionData?.prevMonth
            ? Math.round(regionData.prevMonth["tot_sum"]?.value || 0)
            : 0,
          [startYM]: Math.round(regionData?.start["tot_sum"]?.value || 0),
        });
    }
    charts.push({
      name: `foreignerLastyearDataGroup`,
      indicate: indicate.last,
    });
    if (isMonth)
      charts.push({
        name: `foreignerPreMonthDataGroup`,
        indicate: indicate.prev,
      });
  }

  return {
    title: "전년/전월 동기 대비 외국인 생활인구",
    summary: isGroup ? summaries : summary,
    charts,
  };
}

export async function transMonsPattern(
  start: string,
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<ChartDataContainer> {
  let summariesObj: Summaries = { Avg: [], Sum: [], Unique: [] };
  const summaryObj: Record<string, string> = {};
  const charts: BaseChartData[] = [];

  const keys: Array<{
    key: string;
    name: string;
  }> = [
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];
  const patterns = [
    { pattern: "rsdn", value: "거주인구", unique: "RSDN" },
    { pattern: "wkplc", value: "직장인구", unique: "WKPLC" },
    { pattern: "vist", value: "방문인구", unique: "VIST" },
  ];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const regionData = data.avgSum.find(
      (item: any) => item.key.toString() === regionCode
    );
    for (const { key, name } of keys) {
      const chart: Record<string, BaseChartData> = {
        month: {
          name: isGroup ? `pCurrentDataGroup${name}` : `pCurrentData${name}`,
          indicate: [],
        },
        monthly: {
          name: isGroup ? `pMonthDataGroup${name}` : `pMonthData${name}`,
          indicate: [],
        },
      };

      if (hasExtraProperties(regionData)) {
        const monthSummary =
          `{${regionName}}\n` +
          `거주인구는 {${Math.round(
            regionData.month[`rsdn_${key}`].value
          ).toLocaleString()}}명, 직장인구는 {${Math.round(
            regionData.month[`wkplc_${key}`].value
          ).toLocaleString()}}명, 방문인구는 {${Math.round(
            regionData.month[`vist_${key}`].value
          ).toLocaleString()}}명 입니다.`;
        if (!isGroup) {
          chart.month.regionName = regionName;
          patterns.forEach(({ pattern, value }) =>
            chart.month.indicate.push({
              구분: value,
              인구: Math.round(regionData.month[`${pattern}_${key}`].value),
            })
          );
          summaryObj[name] = monthSummary;
          charts.push(chart.month);
        } else {
          summariesObj[name].push(monthSummary);
          chart.month.indicate.push({
            구분: regionName,
            거주인구: Math.round(regionData.month[`rsdn_${key}`].value),
            직장인구: Math.round(regionData.month[`wkplc_${key}`].value),
            방문인구: Math.round(regionData.month[`vist_${key}`].value),
          });

          const existingData = charts.find(
            (item) => item.name === chart.month.name
          );
          if (existingData) {
            existingData.indicate.push(...chart.month.indicate);
          } else {
            charts.push(chart.month);
          }
        }

        chart.monthly.regionName = regionName;
        for (const bucket of regionData[`monthly_data`].buckets) {
          chart.monthly.indicate.push({
            구분: bucket.key_as_string,
            거주인구: Math.round(bucket[`rsdn_${key}`].value),
            직장인구: Math.round(bucket[`wkplc_${key}`].value),
            방문인구: Math.round(bucket[`vist_${key}`].value),
          });
        }
        charts.push(chart.monthly);
      } else {
        if (isGroup) {
          summariesObj[name].push(`{${regionName}}\n` + "-");
        } else {
          summaryObj[name] = `{${regionName}}\n` + "-";
        }
      }
    }
  }

  const uniqueChart: Record<string, BaseChartData> = {
    month: {
      name: isGroup ? `pCurrentDataGroupUnique` : `pCurrentDataUnique`,
      indicate: [],
    },
    monthly: {
      name: isGroup ? `pMonthDataGroupUnique` : `pMonthDataUnique`,
      indicate: [],
    },
  };
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    //유니크
    const regionUniqueData = data.unique.find(
      (item: any) => item.key.toString() === regionCode
    );

    if (hasExtraProperties(regionUniqueData)) {
      const monthData = regionUniqueData.month.popul_doc.hits.hits[0]._source;
      const monthSummary =
        `{${regionName}}\n` +
        `거주인구는 {${Math.round(
          monthData.RSDN_MALE_POPUL_NUM + monthData.RSDN_FEML_POPUL_NUM
        ).toLocaleString()}}명, 직장인구는 {${Math.round(
          monthData.WKPLC_MALE_POPUL_NUM + monthData.WKPLC_FEML_POPUL_NUM
        ).toLocaleString()}}명, 방문인구는 {${Math.round(
          monthData.VIST_MALE_POPUL_NUM + monthData.VIST_FEML_POPUL_NUM
        ).toLocaleString()}}명 입니다.`;
      if (!isGroup) {
        summaryObj["Unique"] = monthSummary;

        patterns.forEach(({ unique, value }) =>
          uniqueChart.month.indicate.push({
            구분: value,
            인구: Math.round(
              monthData[`${unique}_MALE_POPUL_NUM`] +
                monthData[`${unique}_FEML_POPUL_NUM`]
            ),
          })
        );
        uniqueChart.month.regionName = regionName;
      } else {
        summariesObj["Unique"].push(monthSummary);

        uniqueChart.month.indicate.push({
          구분: regionName,
          거주인구: Math.round(
            monthData.RSDN_MALE_POPUL_NUM + monthData.RSDN_FEML_POPUL_NUM
          ),
          직장인구: Math.round(
            monthData.WKPLC_MALE_POPUL_NUM + monthData.WKPLC_FEML_POPUL_NUM
          ),
          방문인구: Math.round(
            monthData.VIST_MALE_POPUL_NUM + monthData.VIST_FEML_POPUL_NUM
          ),
        });
      }

      uniqueChart.monthly.regionName = regionName;
      for (const bucket of regionUniqueData[`monthly_data`].buckets) {
        uniqueChart.monthly.indicate.push({
          구분: bucket.key_as_string,
          거주인구: Math.round(
            bucket.popul_doc.hits.hits[0]._source.RSDN_MALE_POPUL_NUM +
              bucket.popul_doc.hits.hits[0]._source.RSDN_FEML_POPUL_NUM
          ),
          직장인구: Math.round(
            bucket.popul_doc.hits.hits[0]._source.WKPLC_MALE_POPUL_NUM +
              bucket.popul_doc.hits.hits[0]._source.WKPLC_FEML_POPUL_NUM
          ),
          방문인구: Math.round(
            bucket.popul_doc.hits.hits[0]._source.VIST_MALE_POPUL_NUM +
              bucket.popul_doc.hits.hits[0]._source.VIST_FEML_POPUL_NUM
          ),
        });
      }

      charts.push(uniqueChart.month);
      charts.push(uniqueChart.monthly);
    }
    // else {
    //   if (isGroup) {
    //     summariesObj["Unique"].push("-");
    //   } else {
    //     summaryObj["Unique"] = "-";
    //   }
    // }
  }

  return {
    title: "월별 거주/직장/방문 인구",
    summary: isGroup ? summariesObj : summaryObj,
    charts: charts,
  };
}
export async function transMonsComparative(
  start: string,
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<Record<string, StatSummaryObj[] | ChartDataContainer[]>> {
  let summaries = [];
  let summary = "";
  let daySummaries: string[] = [];
  let daySummary = "";
  const charts: BaseChartData[] = [];
  const dayCharts: BaseChartData[] = [];
  let stats: StatSummaryObj[] = [];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    // 이미 해당 regionName에 대한 객체가 있는지 확인
    let statObj = stats.find((stat) => stat.regionName === regionName);

    // 없다면 새로 생성하여 추가
    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }
    const regionRsdnData = data.rsdn.find(
      (item: any) => item.key.toString() === regionCode
    );
    const regionUniqueData = data.unique.find(
      (item: any) => item.key.toString() === regionCode
    );
    const oneChart: Record<string, BaseChartData> = {
      current: {
        name: isGroup ? `currentDataGroup` : `currentData`,
        indicate: [],
      },
      month: {
        ...(isGroup ? { regionName } : {}),
        name: isGroup ? `cMonthDataGroup` : `cMonthData`,
        indicate: [],
      },
    };
    const uniqueMonthValue =
      regionUniqueData.month.popul_doc.hits.hits[0]._source.TOT_POPUL_NUM || 0;
    //월별
    if (
      hasExtraProperties(regionRsdnData) &&
      hasExtraProperties(regionUniqueData)
    ) {
      const rsdnData = regionRsdnData.month.popul_doc.hits.hits[0]._source;
      const uniqueData = regionUniqueData.month.popul_doc.hits.hits[0]._source;

      const regionSummary =
        `{${regionName}}\n` +
        `주민등록인구는 {${Math.round(
          uniqueData.TOT_POPUL_NUM
        ).toLocaleString()}}명, 거주인구는 {${Math.round(
          rsdnData.RSDN_MALE_POPUL_NUM + rsdnData.RSDN_FEML_POPUL_NUM
        ).toLocaleString()}}명 입니다.`;
      const statSummary = `주민등록인구는 {${Math.round(
        uniqueData.TOT_POPUL_NUM
      ).toLocaleString()}}명, 실제 거주하는 인구는 {${Math.round(
        rsdnData.RSDN_MALE_POPUL_NUM + rsdnData.RSDN_FEML_POPUL_NUM
      ).toLocaleString()}}명 입니다.`;
      statObj.data.tot = statSummary;

      if (!isGroup) {
        summary = regionSummary;
        oneChart.current.regionName = regionName;

        oneChart.current.indicate.push({
          구분: "거주인구",
          인구: Math.round(
            rsdnData.RSDN_MALE_POPUL_NUM + rsdnData.RSDN_FEML_POPUL_NUM
          ),
        });
        oneChart.current.indicate.push({
          구분: "주민등록인구",
          인구: Math.round(uniqueData.TOT_POPUL_NUM),
        });
        charts.push(oneChart.current);
      } else {
        summaries.push(regionSummary);

        oneChart.current.indicate.push({
          구분: regionName,
          거주인구: Math.round(
            rsdnData.RSDN_MALE_POPUL_NUM + rsdnData.RSDN_FEML_POPUL_NUM
          ),
          주민등록인구: Math.round(uniqueData.TOT_POPUL_NUM),
        });
        const existingData = charts.find(
          (item) => item.name === oneChart.current.name
        );
        if (existingData) {
          existingData.indicate.push(...oneChart.current.indicate);
        } else {
          charts.push(oneChart.current);
        }
      }

      oneChart.month.regionName = regionName;
      for (const bucket of regionRsdnData[`monthly_data`].buckets) {
        const monthKey = bucket.key_as_string;

        const uniqueBucket = regionUniqueData[`monthly_data`].buckets.find(
          (unique: any) => unique.key_as_string === monthKey
        );
        oneChart.month.indicate.push({
          구분: bucket.key_as_string,
          거주인구: Math.round(
            bucket.popul_doc.hits.hits[0]._source.RSDN_MALE_POPUL_NUM +
              bucket.popul_doc.hits.hits[0]._source.RSDN_FEML_POPUL_NUM
          ),
          주민등록인구: Math.round(
            uniqueBucket?.popul_doc.hits.hits[0]._source.TOT_POPUL_NUM || 0
          ),
        });
      }

      charts.push(oneChart.month);
    } else {
      if (isGroup) {
        summaries.push(`{${regionName}}\n` + "-");
      } else {
        summary = `{${regionName}}\n` + "-";
      }
    }
    //일별
    const regionRsdnDayData = data.rsdnDay.find(
      (item: any) => item.key.toString() === regionCode
    );
    const dayOneChart: BaseChartData = {
      ...(isGroup ? { regionName } : {}),
      name: isGroup ? `cDayDataGroup` : `cDayData`,
      indicate: [],
    };
    if (hasExtraProperties(regionRsdnDayData)) {
      const minDay = getUTCDate(regionRsdnDayData[`day_min_2`].keys[0]);
      const maxDay = getUTCDate(regionRsdnDayData[`day_max_14`].keys[0]);

      const rsdnDaySummary =
        `주민등록인구는 {${Math.round(
          uniqueMonthValue
        ).toLocaleString()}}명,\n` +
        `거주인구는 오후 2시에 {${
          maxDay.getMonth() + 1
        }}월 {${maxDay.getDate()}}일 {${Math.round(
          regionRsdnDayData[`day_max_14`].value
        ).toLocaleString()}}명으로 가장 많고,\n` +
        `오전 2시에 {${
          minDay.getMonth() + 1
        }}월 {${minDay.getDate()}}일 {${Math.round(
          regionRsdnDayData[`day_min_2`].value
        ).toLocaleString()}}명으로 가장 적습니다.`;

      if (isGroup) {
        daySummaries.push(`{${regionName}}\n` + rsdnDaySummary);
      } else {
        daySummary = `{${regionName}}\n` + rsdnDaySummary;
      }
      statObj.data.day = rsdnDaySummary;

      dayOneChart.regionName = regionName;
      for (const bucket of regionRsdnDayData.by_day.buckets) {
        dayOneChart.indicate.push({
          구분: bucket.key_as_string,
          "거주인구 오전 2시": Math.round(
            bucket.time_zone_2.total_population.value
          ),
          "거주인구 오후 2시": Math.round(
            bucket.time_zone_14.total_population.value
          ),
          주민등록인구: Math.round(uniqueMonthValue),
        });
      }
      dayCharts.push(dayOneChart);
    } else {
      if (isGroup) {
        daySummaries.push(`{${regionName}}\n` + "-");
      } else {
        daySummary = `{${regionName}}\n` + "-";
      }
    }
  }

  return {
    stat: stats,
    data: [
      {
        title: "월별 주민등록인구 대비 거주인구 비교",
        summary: isGroup ? summaries : summary,
        charts,
      },
      {
        title: "일별 주민등록인구 대비 생활인구 비교",
        summary: isGroup ? daySummaries : daySummary,
        charts: dayCharts,
      },
    ],
  };
}
export async function transCompareRank(
  start: string,
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<any> {
  const results: BaseChartData[] = [];

  const keys = [
    { key: "unique", name: "Unique" },
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];

  const flowKeys = [
    { LOkey: "by_detina", name: "유입" },
    { LOkey: "by_pdepar", name: "유출" },
  ];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const chartsData: Record<string, BaseChartData> = {};

    for (const { key, name } of keys) {
      // unique key 처리 여부를 결정
      if (key === "unique" && (!data.unique || data.unique.length === 0)) {
        continue;
      }

      const result = {
        sum: [],
        avg: [],
        unique: [],
      };

      const patternArray = getPatternArray(key, data, regionCode);
      const patternRatio = await transFormPatternRatio(
        patternArray,
        key,
        start,
        result
      );

      if (key === "unique") {
        processUniqueFlowData(result, start);
      } else {
        const flowArray = getFlowArray(data, regionCode);

        const flowResult = transFormFlowRatio(
          flowArray,
          key,
          regionCode,
          result,
          flowKeys,
          start
        );
      }
      chartsData[name] = {
        regionName,
        name: `preYearData${isGroup ? "Group" : ""}${name}`,
        indicate: patternRatio[key],
      };
    }

    results.push(...Object.values(chartsData));
  }
  return results;
}

function getPatternArray(key: string, data: any, regionCode: string) {
  if (key === "unique")
    return data.unique.filter(
      (item: any) => item._source.SGG_CD === regionCode
    );
  return (
    data.avgSum.filter((item: any) => item.key === parseInt(regionCode)) || []
  );
}

async function transFormPatternRatio(
  patterns: any[],
  key: string,
  startDate: string,
  result: { [key: string]: { [key: string]: string | number }[] }
) {
  patterns.forEach((pattern: any) => {
    if (key === "unique") {
      const {
        BASE_YM,
        TOT_POPUL_NUM,
        RSDN_MALE_POPUL_NUM,
        RSDN_FEML_POPUL_NUM,
        WKPLC_MALE_POPUL_NUM,
        WKPLC_FEML_POPUL_NUM,
        VIST_MALE_POPUL_NUM,
        VIST_FEML_POPUL_NUM,
      } = pattern._source;

      result.unique.push({
        구분: `${BASE_YM}`,
        거주인구비율: calcRankingRatio(
          TOT_POPUL_NUM,
          RSDN_FEML_POPUL_NUM + RSDN_MALE_POPUL_NUM
        ),
        직장인구비율: calcRankingRatio(
          TOT_POPUL_NUM,
          WKPLC_MALE_POPUL_NUM + WKPLC_FEML_POPUL_NUM
        ),
        방문인구비율: calcRankingRatio(
          TOT_POPUL_NUM,
          VIST_MALE_POPUL_NUM + VIST_FEML_POPUL_NUM
        ),
      });
    } else {
      const { lastYear, start } = pattern;
      result[key].push(
        calculateValues(lastYear, getPreviousYear(startDate)),
        calculateValues(start, startDate)
      );
    }
  });
  return result;
}

function processUniqueFlowData(
  result: { [key: string]: { [key: string]: string | number }[] },
  startDate: string
) {
  const previousYear = getPreviousYear(startDate);
  result.unique.forEach((entry: any) => {
    if (entry.구분 === previousYear || entry.구분 === startDate) {
      entry["유입인구비율"] = "-";
      entry["유출인구비율"] = "-";
    }
  });
}

function getFlowArray(data: any, regionCode: string) {
  return data.flowAvgSum.map((flowData: any) => {
    return {
      by_detina: {
        lastYear: filterFlowData(flowData.by_detina.lastYear, regionCode),
        start: filterFlowData(flowData.by_detina.start, regionCode),
      },
      by_pdepar: {
        lastYear: filterFlowData(flowData.by_pdepar.lastYear, regionCode),
        start: filterFlowData(flowData.by_pdepar.start, regionCode),
      },
    };
  });
}

function filterFlowData(flowData: any[], regionCode: string) {
  return flowData.filter((item: any) =>
    Object.keys(item).some((key) => key.includes(regionCode))
  );
}

function transFormFlowRatio(
  flowArray: any[],
  key: string,
  regionCode: string,
  result: { [key: string]: { [key: string]: string | number }[] },
  flowKeys: Array<{ LOkey: string; name: string }>,
  startDate: string
) {
  const previousYear = getPreviousYear(startDate);

  flowArray.forEach((flowData: any) => {
    flowKeys.forEach(({ LOkey, name }) => {
      const { by_detina, by_pdepar } = flowData;
      const inflowOutflowRatios = calculateInflowOutflowRatios(
        by_detina,
        by_pdepar,
        key,
        regionCode
      );

      result[key].forEach((entry: any) => {
        if (entry.구분 === previousYear) {
          entry["유입인구비율"] = inflowOutflowRatios.inflowLastYear ?? "-";
          entry["유출인구비율"] = inflowOutflowRatios.outflowLastYear ?? "-";
        }
        if (entry.구분 === startDate) {
          entry["유입인구비율"] = inflowOutflowRatios.inflowStart ?? "-";
          entry["유출인구비율"] = inflowOutflowRatios.outflowStart ?? "-";
        }
      });
    });
  });
  return result;
}

function calculateInflowOutflowRatios(
  by_detina: any,
  by_pdepar: any,
  key: string,
  regionCode: string
) {
  const inflowLastYear = calcFlowRatio(by_detina?.lastYear, regionCode, key);
  const inflowStart = calcFlowRatio(by_detina?.start, regionCode, key);
  const outflowLastYear = calcFlowRatio(by_pdepar?.lastYear, regionCode, key);
  const outflowStart = calcFlowRatio(by_pdepar?.start, regionCode, key);

  return { inflowLastYear, inflowStart, outflowLastYear, outflowStart };
}

function calcFlowRatio(flowData: any[], regionCode: string, key: string) {
  const data = flowData?.find((item: any) =>
    Object.keys(item).some((k) => k === regionCode)
  );
  const includeData = flowData?.find((item: any) =>
    Object.keys(item).some((k) => k === `${regionCode}_include`)
  );
  if (data && includeData) {
    return calcRankingRatio(
      includeData[`${regionCode}_include`][`tot_${key}`].value,
      data[regionCode][`tot_${key}`].value
    );
  }
  return undefined;
}

function calcRankingRatio(total: number, part: number): string {
  return ((total - part) / part).toFixed(1);
}

function getPreviousYear(dateString: string) {
  let year = parseInt(dateString.substring(0, 4)) - 1;
  let month = parseInt(dateString.substring(4, 6));
  const formattedMonth = month < 10 ? `0${month}` : month;
  return `${year}${formattedMonth}`;
}

function calculateValues(data: any, date: string) {
  return {
    구분: date,
    거주인구비율: calcRankingRatio(
      data[`tot_avg`].value,
      data[`rsdn_avg`].value
    ),
    직장인구비율: calcRankingRatio(
      data[`tot_avg`].value,
      data[`wkplc_avg`].value
    ),
    방문인구비율: calcRankingRatio(
      data[`tot_avg`].value,
      data[`vist_avg`].value
    ),
  };
}

function addMissingDataWithReordering(
  indicateArray: any[],
  startYM: string,
  key: string
) {
  // 1. 값이 없는 경우 yearMonth 값을 추가
  indicateArray.forEach((item) => {
    if (!item[key]) {
      item[key] = 0;
    }
    if (!item[startYM]) {
      item[startYM] = 0;
    }
    // 2. startYM을 마지막에 위치시키기 위해 새 객체 생성
    if (startYM in item) {
      // startYM 속성 값 저장 후 item 객체에서 삭제
      const startYMValue = item[startYM];
      delete item[startYM];

      // 기존 item에 startYM 속성을 마지막에 추가
      item[startYM] = startYMValue;
    }
  });
}

// 증감율 계산 함수
function calculateRate(current: number, previous: number): string {
  if (previous === 0) return "-"; // 이전 값이 0일 경우
  const rate = ((current - previous) / previous) * 100;
  return rate > 0
    ? `{${rate.toFixed(1)}}% {증가}`
    : `{${Math.abs(rate).toFixed(1)}}% {감소}`;
}

// 요약 객체 생성 함수
function generateSummariesObj(
  dataArray: any[],
  existUnique: boolean,
  startYM: string,
  lastYearYM: string,
  prevMonthYM: string
): Record<string, string[]> {
  const summariesObj: {
    Avg: string[];
    Sum: string[];
    Unique?: string[];
  } = {
    Avg: [],
    Sum: [],
  };

  const lastYearDataMap = new Map<
    string,
    { avg: number; sum: number; unique?: number }
  >();
  const preMonthDataMap = new Map<
    string,
    { avg: number; sum: number; unique?: number }
  >();
  const startDataMap = new Map<
    string,
    { avg: number; sum: number; unique?: number }
  >();
  // 전년도 데이터 수집
  dataArray.forEach((chart) => {
    if (chart.name.startsWith("lastyear")) {
      chart.indicate.forEach((item: any) => {
        const existingData = lastYearDataMap.get(item.구분) || {
          avg: 0,
          sum: 0,
          ...(existUnique ? { unique: 0 } : {}),
        };

        if (chart.name.includes("Avg")) {
          existingData.avg = item[lastYearYM] || 0;
        } else if (chart.name.includes("Sum")) {
          existingData.sum = item[lastYearYM] || 0;
        } else if (chart.name.includes("Unique")) {
          existingData.unique = item[lastYearYM] || 0;
        }

        lastYearDataMap.set(item.구분, existingData);
      });
    } else if (chart.name.startsWith("preMonth")) {
      chart.indicate.forEach((item: any) => {
        const existingData = preMonthDataMap.get(item.구분) || {
          avg: 0,
          sum: 0,
          ...(existUnique ? { unique: 0 } : {}),
        };

        if (chart.name.includes("Avg")) {
          existingData.avg = item[prevMonthYM] || 0;
        } else if (chart.name.includes("Sum")) {
          existingData.sum = item[prevMonthYM] || 0;
        } else if (chart.name.includes("Unique")) {
          existingData.unique = item[prevMonthYM] || 0;
        }

        preMonthDataMap.set(item.구분, existingData);
      });
    }
    chart.indicate.forEach((item: any) => {
      const existingData = startDataMap.get(item.구분) || {
        avg: 0,
        sum: 0,
        ...(existUnique ? { unique: 0 } : {}),
      };

      if (chart.name.includes("Avg")) {
        existingData.avg = item[startYM] || 0;
      } else if (chart.name.includes("Sum")) {
        existingData.sum = item[startYM] || 0;
      } else if (chart.name.includes("Unique")) {
        existingData.unique = item[startYM] || 0;
      }

      startDataMap.set(item.구분, existingData);
    });
  });
  // 각 데이터 그룹에 대한 요약 생성
  startDataMap.forEach((startData, region) => {
    const lastYearData = lastYearDataMap.get(region) || {
      avg: 0,
      sum: 0,
      ...(existUnique ? { unique: 0 } : {}),
    };
    const preMonthData = preMonthDataMap.get(region) || {
      avg: 0,
      sum: 0,
      ...(existUnique ? { unique: 0 } : {}),
    };

    // Current data for the region
    const { avg: currentAvg, sum: currentSum } = startData;

    // Calculate year-on-year and month-on-month percentage changes
    const lastYearTextAvg = calculateRate(currentAvg, lastYearData.avg);
    const prevMonthTextAvg = calculateRate(currentAvg, preMonthData.avg);

    const lastYearTextSum = calculateRate(currentSum, lastYearData.sum);
    const prevMonthTextSum = calculateRate(currentSum, preMonthData.sum);

    // Format and add strings to summariesObj
    summariesObj.Avg.push(
      `{${region}}\n내국인 생활인구 {${Math.round(
        currentAvg
      ).toLocaleString()}}명으로,\n전년 동기 대비 ${lastYearTextAvg} 및 전월 대비 ${prevMonthTextAvg}했습니다.`
    );

    summariesObj.Sum.push(
      `{${region}}\n내국인 생활인구 {${Math.round(
        currentSum
      ).toLocaleString()}}명으로,\n전년 동기 대비 ${lastYearTextSum} 및 전월 대비 ${prevMonthTextSum}했습니다.`
    );

    if (existUnique) {
      if (!summariesObj.Unique) {
        summariesObj.Unique = [];
      }

      const currentUnique = startData.unique!;
      const lastYearTextUnique = calculateRate(
        currentUnique,
        lastYearData.unique || 0
      );
      const prevMonthTextUnique = calculateRate(
        currentUnique,
        preMonthData.unique || 0
      );
      summariesObj.Unique.push(
        `{${region}}\n내국인 생활인구 {${Math.round(
          currentUnique
        ).toLocaleString()}}명으로,\n전년 동기 대비 ${lastYearTextUnique} 및 전월 대비 ${prevMonthTextUnique}했습니다.`
      );
    }
  });

  return summariesObj;
}

type OpenSearchData = {
  avgSum: Array<{
    key: number;
    doc_count: number;
    prevMonth?: {
      tot_avg: { value: number | null };
      tot_sum: { value: number | null };
    };
    lastYear: {
      tot_avg: { value: number | null };
      tot_sum: { value: number | null };
    };
    start: {
      tot_avg: { value: number | null };
      tot_sum: { value: number | null };
    };
    top_hits_docs: {
      hits: {
        hits: Array<{
          _source: {
            SIDO_CD?: number;
            SGG_CD?: number;
            ADMNS_DONG_CD?: number;
            BASE_YMD: number;
          };
        }>;
      };
    };
  }>;
  unique?: Array<{
    _source: {
      SIDO_CD?: number;
      SGG_CD?: number;
      ADMNS_DONG_CD?: number;
      BASE_YM: number;
      TOT_POPUL_NUM: number;
    };
  }>;
};
