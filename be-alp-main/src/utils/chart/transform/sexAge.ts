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

import { convertCDtoNM } from "@/helpers/convertNM";
import {
  sortByAgeOrder,
  sortByPatternAgeOrder,
  sortBySexAgeOrder,
} from "@/helpers/sortByAgeOrder";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import util from "util";
export async function transformSexAge(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<TransResult> {
  let summaries: Summaries = { Avg: [], Sum: [] };
  let summary: Summary = {};

  const keys: Array<{
    key: string;
    name: string;
  }> = [
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];

  let charts: BaseChartData[] = [];
  let stats: StatSummariesObj[] = [];
  for (const { key, name } of keys) {
    for (const regionCode of regionArray) {
      const regionName = await convertCDtoNM(regionCode);
      const chart: BaseChartData = {
        regionName,
        name: isGroup ? `genderageDataGroup${name}` : `genderageData${name}`,
        indicate: [],
      };
      // 이미 해당 regionName에 대한 객체가 있는지 확인
      let statObj = stats.find((stat) => stat.regionName === regionName);

      // 없다면 새로 생성하여 추가
      if (!statObj) {
        statObj = { regionName, data: {} };
        stats.push(statObj);
      }

      const regionData = data.avgSum.find(
        (item: any) => item.key.toString() === regionCode
      );

      if (hasExtraProperties(regionData)) {
        const transData = transformDataForChart({
          male_age_groups:
            regionData.age_groups.value[`${key}_male_age_groups`],
          female_age_groups:
            regionData.age_groups.value[`${key}_female_age_groups`],
        });

        chart.indicate = transData.chartData;
        const tot_value = Math.round(regionData[`tot_${key}`].value);
        const maleRatio =
          (Math.round(regionData[`male_${key}`].value) / tot_value) * 100;
        const femaleRatio =
          (Math.round(regionData[`female_${key}`].value) / tot_value) * 100;
        const ageRatio = (transData.maxAgeGroup.합계 / tot_value) * 100;
        const groupRatio = (transData.maxGroup.합계 / tot_value) * 100;
        statObj.data[name] = {
          tot: `내국인 생활인구는\n{${tot_value.toLocaleString()}} 명 입니다.`,
          sex: `내국인 성별 비율은\n{${
            maleRatio > femaleRatio ? "남성" : "여성"
          }}이 {${Math.max(maleRatio, femaleRatio).toFixed(
            1
          )}}% 로 더 많습니다.`,
          age:
            `내국인 연령대별 비율은\n` +
            `{${transData.maxGroup.구분}}가 {${groupRatio.toFixed(
              1
            )}}%로 가장 많습니다.`,
        };
        const regionSummary =
          `{${regionName}}\n` +
          `남성은 {${maleRatio.toFixed(1)}}%, 여성은 {${femaleRatio.toFixed(
            1
          )}}% 이며,\n` +
          `{${transData.maxAgeGroup.구분}}가(이) {${ageRatio.toFixed(
            1
          )}}%로 가장 많습니다.`;

        if (isGroup) {
          summaries[name].push(regionSummary);
        } else {
          summary[name] = regionSummary;
        }
      } else {
        if (isGroup) {
          summaries[name].push(`{${regionName}}\n` + "-");
        } else {
          summary[name] = `{${regionName}}\n` + "-";
        }
        statObj.data[name] = {
          tot: "-",
          sex: "-",
          age: "-",
        };
      }
      charts.push(chart);
    }
  }

  //유니크 데이터

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    const chart: BaseChartData = {
      regionName,
      name: isGroup ? `genderageDataGroupUnique` : `genderageDataUnique`,
      indicate: [],
    };
    // 이미 해당 regionName에 대한 객체가 있는지 확인
    let statObj = stats.find((stat) => stat.regionName === regionName);

    // 없다면 새로 생성하여 추가
    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }

    const regionData = data.unique?.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (hasExtraProperties(regionData)) {
      if (!summaries.Unique) {
        summaries.Unique = [];
      }
      const transData = transformDataForChart({
        male_age_groups: regionData.age_groups.value[`male_age_groups`],
        female_age_groups: regionData.age_groups.value[`female_age_groups`],
      });
      chart.indicate = transData.chartData;

      const tot_value = Math.round(
        regionData.top_hits_docs.hits.hits[0]._source.TOT_POPUL_NUM
      );
      const maleRatio =
        (Math.round(
          regionData.top_hits_docs.hits.hits[0]._source.MALE_POPUL_NUM
        ) /
          tot_value) *
        100;

      const femaleRatio =
        (Math.round(
          regionData.top_hits_docs.hits.hits[0]._source.FEML_POPUL_NUM
        ) /
          tot_value) *
        100;
      const ageRatio = (transData.maxAgeGroup.합계 / tot_value) * 100;
      const groupRatio = (transData.maxGroup.합계 / tot_value) * 100;
      statObj.data.Unique = {
        tot: `내국인 생활인구는 {${tot_value.toLocaleString()}} 명 입니다.`,
        sex: `내국인 성별 비율은 {${
          maleRatio > femaleRatio ? "남성" : "여성"
        }}이 {${Math.max(maleRatio, femaleRatio).toFixed(1)}}% 로 더 많습니다.`,
        age:
          `내국인 연령대별 비율은\n` +
          `{${transData.maxGroup.구분}}가 {${groupRatio.toFixed(
            1
          )}}%로 가장 많습니다.`,
      };

      const regionSummary =
        `{${regionName}}\n` +
        `남성은 {${maleRatio.toFixed(1)}}%, 여성은 {${femaleRatio.toFixed(
          1
        )}}% 이며,\n` +
        `{${transData.maxAgeGroup.구분}}가(이) {${ageRatio.toFixed(
          1
        )}}%로 가장 많습니다.`;

      if (isGroup) {
        summaries["Unique"].push(regionSummary);
      } else {
        summary["Unique"] = regionSummary;
      }
    } else {
      if (regionData !== undefined) {
        if (isGroup) {
          summaries.Unique = [];
          summaries["Unique"].push("-");
        } else {
          summary["Unique"] = "-";
        }
      }
      statObj.data.Unique = {
        tot: "-",
        sex: "-",
        age: "-",
      };
    }
    charts.push(chart);
  }

  return {
    stat: stats,
    data: {
      title: "성연령별 내국인 생활인구",
      summary: isGroup ? summaries : summary,
      charts: charts,
    },
  };
}

export async function transSexAgePattern(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<
  Record<string, StatSummariesObj[] | Record<string, ChartDataContainer>>
> {
  let results: Record<string, ChartDataContainer> = {
    sexAge: {
      title: "성연령별 거주/직장/방문 인구",
      summary: {},
      charts: [],
    },
    rsdn: {
      title: "성연령별 거주인구",
      summary: {},
      charts: [],
    },
    wkplc: {
      title: "성연령별 직장인구",
      summary: {},
      charts: [],
    },
    vist: {
      title: "성연령별 방문인구",
      summary: {},
      charts: [],
    },
  };

  let summaryObj: Record<string, Summary> = {
    sex: {},
    rsdn: {},
    wkplc: {},
    vist: {},
  };
  let summariesObj: Record<string, Summaries> = {
    sex: { Avg: [], Sum: [] },
    rsdn: { Avg: [], Sum: [] },
    wkplc: { Avg: [], Sum: [] },
    vist: { Avg: [], Sum: [] },
  };
  const keys: Array<{
    key: string;
    name: string;
  }> = [
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];
  const patterns = [
    {
      pattern: "rsdn",
      value: "거주인구",
      colName: "RSDN",
      chartName: "Residence",
    },
    {
      pattern: "wkplc",
      value: "직장인구",
      colName: "WKPLC",
      chartName: "Worker",
    },
    {
      pattern: "vist",
      value: "방문인구",
      colName: "VIST",
      chartName: "Visitor",
    },
  ];
  let groupSexCharts: MergedChartData[] = [];
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
    for (const { key, name } of keys) {
      const chartsData: Record<string, BaseChartData> = {
        sex: {
          regionName,
          name: `pGenderData${isGroup ? "Group" : ""}${name}`,
          indicate: [],
        },
        age: {
          regionName,
          name: `pAgeData${isGroup ? "Group" : ""}${name}`,
          indicate: [],
        },
      };
      const regionData = data.avgSum.find(
        (item: any) => item.key.toString() === regionCode
      );

      if (hasExtraProperties(regionData)) {
        let regionSexSummary = `{${regionName}}\n`;
        const splitData = transformPatternsData(
          regionData.popul_groups.value[`popul_${key}`]
        );
        const sexData = regionData.popul_sex_groups.value[`popul_${key}`];

        patterns.forEach(({ pattern, value, colName, chartName }) => {
          const transData = transformDataForChart(splitData[colName]);
          const nChart = {
            regionName,
            name: `pGenderAge${chartName}Data${isGroup ? "Group" : ""}${name}`,
            indicate: transData.chartData,
          };
          results[pattern].charts.push(nChart);

          //성별
          chartsData.sex.indicate.push({
            구분: value,
            남성: sexData[`${colName}_MALE`],
            여성: sexData[`${colName}_FEML`],
          });
          //요약
          regionSexSummary += `${value}는 {${
            sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
              ? "남성"
              : "여성"
          }}과 {${transData.maxGroup.구분}}${
            pattern === "vist" ? "가 가장 많습니다." : ",\n"
          }`;
          const summary =
            `{${regionName}}\n` +
            `${value}는 연령대 중 {${transData.maxGroup.구분}}가(이) 가장 많으며,\n` +
            `구성 비율은 남성은 {${(
              (sexData[`${colName}_MALE`] / regionData[`tot_${key}`].value) *
              100
            ).toFixed(1)}}%, 여성은 {${(
              (sexData[`${colName}_FEML`] / regionData[`tot_${key}`].value) *
              100
            ).toFixed(1)}}%입니다.`;
          if (!isGroup) {
            summaryObj[pattern][name] = summary;
          } else {
            summariesObj[pattern][name].push(summary);
          }
        });
        const ratioSummary =
          `생활인구 비율은\n` +
          `거주인구 : {${(
            (regionData[`rsdn_${key}`].value / regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}%, 직장인구 : {${(
            (regionData[`wkplc_${key}`].value /
              regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}%,\n` +
          `방문인구 : {${(
            (regionData[`vist_${key}`].value / regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}% 입니다.`;
        statObj.data[name] = { ratio: ratioSummary, sex: regionSexSummary };

        if (!isGroup) {
          summaryObj.sex[name] = regionSexSummary;

          results.sexAge.charts.push(chartsData.sex);
        } else {
          summariesObj.sex[name].push(regionSexSummary);

          const existingData = groupSexCharts.find(
            (chart) => chart.name === chartsData.sex.name
          );
          if (existingData) {
            existingData.data.push({
              regionName,
              indicate: chartsData.sex.indicate,
            });
          } else {
            groupSexCharts.push({
              name: chartsData.sex.name,
              data: [
                {
                  regionName,
                  indicate: chartsData.sex.indicate,
                },
              ],
            });
          }
        }
        // 연령대
        const ageData = regionData.popul_age_groups.value[`popul_${key}`];
        const sortedAgeData = sortByPatternAgeOrder("RSDN", ageData, false); // 연령대 정렬
        const ageChartData = Object.entries(sortedAgeData).map(
          ([age, value]) => ({
            구분: age,
            거주인구: value,
            직장인구: ageData[`WKPLC_${age}`] || 0,
            방문인구: ageData[`VIST_${age}`] || 0,
          })
        );
        chartsData.age.indicate = ageChartData;
        results.sexAge.charts.push(chartsData.age);
      } else {
        if (!isGroup) {
          summaryObj.sex[name] = `{${regionName}}\n` + "-";
          summaryObj.rsdn[name] = `{${regionName}}\n` + "-";
          summaryObj.wkplc[name] = `{${regionName}}\n` + "-";
          summaryObj.vist[name] = `{${regionName}}\n` + "-";
        } else {
          summariesObj.sex[name].push(`{${regionName}}\n` + "-");
          summariesObj.rsdn[name].push(`{${regionName}}\n` + "-");
          summariesObj.wkplc[name].push(`{${regionName}}\n` + "-");
          summariesObj.vist[name].push(`{${regionName}}\n` + "-");
        }
      }
    }

    const uniqueData = data.unique?.find(
      (item: any) => item.key.toString() === regionCode
    );

    if (hasExtraProperties(uniqueData)) {
      if (!summariesObj.sex.Unique) {
        summariesObj.sex.Unique = [];
        summariesObj.rsdn.Unique = [];
        summariesObj.wkplc.Unique = [];
        summariesObj.vist.Unique = [];
      }
      const chartsData: Record<string, BaseChartData> = {
        sex: {
          regionName,
          name: `pGenderData${isGroup ? "Group" : ""}Unique`,
          indicate: [],
        },
        age: {
          regionName,
          name: `pAgeData${isGroup ? "Group" : ""}Unique`,
          indicate: [],
        },
      };

      const splitData = transformPatternsData(uniqueData.popul_groups.value);
      const sexData = uniqueData.popul_sex_groups.value;
      let regionSexSummary = `{${regionName}}\n`;

      patterns.forEach(({ pattern, value, colName, chartName }) => {
        const transData = transformDataForChart(splitData[colName]);

        const nChart = {
          regionName,
          name: `pGenderAge${chartName}Data${isGroup ? "Group" : ""}Unique`,
          indicate: transData.chartData,
        };
        results[pattern].charts.push(nChart);
        //성별
        chartsData.sex.indicate.push({
          구분: value,
          남성: sexData[`${colName}_MALE`],
          여성: sexData[`${colName}_FEML`],
        });
        //요약
        regionSexSummary += `${value}는 {${
          sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
            ? "남성"
            : "여성"
        }}과 {${transData.maxGroup.구분}}${
          pattern === "vist" ? "가 가장 많습니다." : ",\n"
        }`;

        const summary =
          `{${regionName}}\n` +
          `${value}는 연령대 중 {${transData.maxGroup.구분}}가(이) 가장 많으며,\n` +
          `구성 비율은 남성은 {${(
            (sexData[`${colName}_MALE`] /
              uniqueData.top_hits_docs.hits.hits[0]._source.TOT_POPUL_NUM) *
            100
          ).toFixed(1)}}%, 여성은 {${(
            (sexData[`${colName}_FEML`] /
              uniqueData.top_hits_docs.hits.hits[0]._source.TOT_POPUL_NUM) *
            100
          ).toFixed(1)}}%입니다.`;
        if (!isGroup) {
          summaryObj[pattern]["Unique"] = summary;
        } else {
          summariesObj[pattern]["Unique"].push(summary);
        }
      });
      if (!isGroup) {
        summaryObj.sex["Unique"] = regionSexSummary;
      } else {
        summariesObj.sex["Unique"].push(regionSexSummary);
      }
      const source = uniqueData.top_hits_docs.hits.hits[0]._source;
      const ratioSummary =
        `생활인구 비율은\n` +
        `거주인구 : {${(
          ((source.RSDN_MALE_POPUL_NUM + source.RSDN_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}%, 직장인구 : {${(
          ((source.WKPLC_MALE_POPUL_NUM + source.WKPLC_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}%,\n` +
        `방문인구 : {${(
          ((source.VIST_MALE_POPUL_NUM + source.VIST_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}% 입니다.`;
      statObj.data["Unique"] = { ratio: ratioSummary, sex: regionSexSummary };
      if (!isGroup) {
        results.sexAge.charts.push(chartsData.sex);
      } else {
        const existingData = groupSexCharts.find(
          (chart) => chart.name === chartsData.sex.name
        );
        if (existingData) {
          existingData.data.push({
            regionName,
            indicate: chartsData.sex.indicate,
          });
        } else {
          groupSexCharts.push({
            name: chartsData.sex.name,
            data: [
              {
                regionName,
                indicate: chartsData.sex.indicate,
              },
            ],
          });
        }
      }
      // 연령대
      const ageData = uniqueData.popul_age_groups.value;
      const sortedAgeData = sortByPatternAgeOrder("RSDN", ageData, false); // 연령대 정렬
      const ageChartData = Object.entries(sortedAgeData).map(
        ([age, value]) => ({
          구분: age,
          거주인구: value,
          직장인구: ageData[`WKPLC_${age}`] || 0,
          방문인구: ageData[`VIST_${age}`] || 0,
        })
      );
      chartsData.age.indicate = ageChartData;
      results.sexAge.charts.push(chartsData.age);
    } else {
      if (!uniqueData) {
        if (!isGroup) {
          summaryObj.sex.Unique = `{${regionName}}\n` + "-";
          summaryObj.rsdn.Unique = `{${regionName}}\n` + "-";
          summaryObj.wkplc.Unique = `{${regionName}}\n` + "-";
          summaryObj.vist.Unique = `{${regionName}}\n` + "-";
        } else {
          if (!summariesObj.sex.Unique) {
            summariesObj.sex.Unique = [];
            summariesObj.rsdn.Unique = [];
            summariesObj.wkplc.Unique = [];
            summariesObj.vist.Unique = [];
          }
          summariesObj.sex.Unique.push(`{${regionName}}\n` + "-");
          summariesObj.rsdn.Unique.push(`{${regionName}}\n` + "-");
          summariesObj.wkplc.Unique.push(`{${regionName}}\n` + "-");
          summariesObj.vist.Unique.push(`{${regionName}}\n` + "-");
        }
      }
    }
  }
  if (isGroup) {
    results.sexAge.charts.unshift(...groupSexCharts);
  }
  results.sexAge.summary = (isGroup ? summariesObj : summaryObj).sex;
  results.rsdn.summary = (isGroup ? summariesObj : summaryObj).rsdn;
  results.wkplc.summary = (isGroup ? summariesObj : summaryObj).wkplc;
  results.vist.summary = (isGroup ? summariesObj : summaryObj).vist;
  return {
    stat: stats,
    data: results,
  };
}
export async function transSexAgeComparative(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<
  Record<string, StatSummaryObj[] | Record<string, ChartDataContainer>>
> {
  let results: Record<string, ChartDataContainer> = {
    sexAge: {
      title: "성연령별 거주인구와 주민등록인구 비교",
      summary: {},
      charts: [],
    },
    rsdn: {
      title: "성연령별 거주인구",
      summary: {},
      charts: [],
    },
    unique: {
      title: "성연령별 주민등록인구",
      summary: {},
      charts: [],
    },
  };

  let summaryList: Record<string, string> = {
    sexAge: "",
    rsdn: "",
    unique: "",
  };
  let summariesList: Record<string, string[]> = {
    sexAge: [],
    rsdn: [],
    unique: [],
  };

  const comparative = [
    {
      comparative: "unique",
      value: "주민등록인구",
      colName: "UNIQUE",
      chartName: "Registered",
    },
    {
      comparative: "rsdn",
      value: "거주인구",
      colName: "RSDN",
      chartName: "Residence",
    },
  ];
  let groupSexCharts: MergedChartData[] = [];
  let stats: StatSummaryObj[] = [];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);
    let statObj = stats.find((stat) => stat.regionName === regionName);

    if (!statObj) {
      statObj = { regionName, data: {} };
      stats.push(statObj);
    }
    const chartsData: Record<string, BaseChartData> = {
      sex: {
        regionName,
        name: `cGenderData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
      age: {
        regionName,
        name: `cAgeData${isGroup ? "Group" : ""}`,
        indicate: [],
      },
    };
    const regionRsdnData = data.rsdn.find(
      (item: any) => item.key.toString() === regionCode
    );
    const regionUniqueData = data.unique.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (
      hasExtraProperties(regionRsdnData) &&
      hasExtraProperties(regionUniqueData)
    ) {
      let regionCompareSummary = `{${regionName}}\n`;
      let statSex = ``;
      let statAge = ``;
      const rsdnData = transformComparativeData(
        regionRsdnData.popul_groups.value
      );

      const uniqueData = transformUniqueData(
        regionUniqueData.popul_doc.hits.hits[0]._source
      );

      const splitData = { ...rsdnData, ...uniqueData };

      comparative.forEach(({ comparative, value, colName, chartName }) => {
        const rsdnSexData = regionRsdnData.popul_sex_groups.value;
        const uniqueSexData = transformSexData(regionUniqueData.popul_doc);
        const transData = transformDataForChart(splitData[colName]);
        const nChart = {
          regionName,
          name: `cGenderAge${chartName}Data${isGroup ? "Group" : ""}`,
          indicate: transData.chartData,
        };
        results[comparative].charts.push(nChart);

        const sexData = comparative === "rsdn" ? rsdnSexData : uniqueSexData;

        //성별
        chartsData.sex.indicate.push({
          구분: value,
          남성: sexData[`${colName}_MALE`],
          여성: sexData[`${colName}_FEML`],
        });

        //요약
        regionCompareSummary += `${value}는 {${
          sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
            ? "남성"
            : "여성"
        }}과 {${transData.maxGroup.구분}}${
          comparative === "rsdn" ? "가 가장 많습니다." : ","
        }`;
        statSex += `${value}는 {${
          sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
            ? "남성"
            : "여성"
        }}이${value === "주민등록인구" ? "," : " 더 많습니다."}\n`;
        statAge += `${value}는 {${transData.maxGroup.구분}} ${
          value === "주민등록인구" ? "," : "가 가장 많습니다."
        }\n`;
        // 총 인구
        const regionData =
          comparative === "rsdn"
            ? regionRsdnData.top_hits_docs.hits.hits[0]._source
            : regionUniqueData.popul_doc.hits.hits[0]._source;

        const regionSexAgeSummary =
          `{${regionName}}\n` +
          `${value}는 연령대 중 {${transData.maxGroup.구분}}가(이) 가장 많으며,\n` +
          `구성 비율은 남성은 {${(
            (sexData[`${colName}_MALE`] / regionData.TOT_POPUL_NUM) *
            100
          ).toFixed(1)}}%, 여성은 {${(
            (sexData[`${colName}_FEML`] / regionData.TOT_POPUL_NUM) *
            100
          ).toFixed(1)}}%입니다.`;

        if (!isGroup) {
          summaryList[comparative] = regionSexAgeSummary;
        } else {
          summariesList[comparative].push(regionSexAgeSummary);
        }
      });

      if (!isGroup) {
        summaryList.sexAge = regionCompareSummary;

        results.sexAge.charts.push(chartsData.sex);
      } else {
        summariesList.sexAge.push(regionCompareSummary);

        const existingData = groupSexCharts.find(
          (chart) => chart.name === chartsData.sex.name
        );
        if (existingData) {
          existingData.data.push({
            regionName,
            indicate: chartsData.sex.indicate,
          });
        } else {
          groupSexCharts.push({
            name: chartsData.sex.name,
            data: [
              {
                regionName,
                indicate: chartsData.sex.indicate,
              },
            ],
          });
        }
      }

      statObj.data.sex = statSex;
      statObj.data.age = statAge;

      // 연령대
      const rsdnAgeData = regionRsdnData.popul_groups.value;
      const sortedRsdnAgeData = sortBySexAgeOrder("rsdn", rsdnAgeData, false);
      const sortedUniqueAgeData = sortBySexAgeOrder(
        "unique",
        regionUniqueData,
        false
      ); // 연령대 정렬
      const ageChartData = Object.entries(sortedRsdnAgeData).map(
        ([age, value]) => ({
          구분: age,
          거주인구: value,
          주민등록인구: sortedUniqueAgeData[age],
        })
      );
      chartsData.age.indicate = ageChartData;
      results.sexAge.charts.push(chartsData.age);
    } else {
      if (!isGroup) {
        summaryList.sexAge = `{${regionName}}\n` + "-";
        summaryList.rsdn = `{${regionName}}\n` + "-";
        summaryList.unique = `{${regionName}}\n` + "-";
      } else {
        summariesList.sexAge.push(`{${regionName}}\n` + "-");
        summariesList.rsdn.push(`{${regionName}}\n` + "-");
        summariesList.unique.push(`{${regionName}}\n` + "-");
      }
    }
  }
  if (isGroup) {
    results.sexAge.charts.unshift(...groupSexCharts);
  }
  results.sexAge.summary = (isGroup ? summariesList : summaryList).sexAge;
  results.rsdn.summary = (isGroup ? summariesList : summaryList).rsdn;
  results.unique.summary = (isGroup ? summariesList : summaryList).unique;
  return {
    stat: stats,
    data: results,
  };
}
//랭킹분석 통계요약
export async function transSexAgeRankStat(
  data: any,
  regionArray: string[],
  isGroup: boolean
): Promise<Record<string, StatSummariesObj[]>> {
  const keys: Array<{
    key: string;
    name: string;
  }> = [
    { key: "avg", name: "Avg" },
    { key: "sum", name: "Sum" },
  ];
  const patterns = [
    {
      pattern: "rsdn",
      value: "거주인구",
      colName: "RSDN",
      chartName: "Residence",
    },
    {
      pattern: "wkplc",
      value: "직장인구",
      colName: "WKPLC",
      chartName: "Worker",
    },
    {
      pattern: "vist",
      value: "방문인구",
      colName: "VIST",
      chartName: "Visitor",
    },
  ];
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
    for (const { key, name } of keys) {
      const regionData = data.avgSum.find(
        (item: any) => item.key.toString() === regionCode
      );

      if (hasExtraProperties(regionData)) {
        let regionSexSummary = `{${regionName}}\n`;
        const splitData = transformPatternsData(
          regionData.popul_groups.value[`popul_${key}`]
        );
        const sexData = regionData.popul_sex_groups.value[`popul_${key}`];

        patterns.forEach(({ pattern, value, colName, chartName }) => {
          const transData = transformDataForChart(splitData[colName]);
          //패턴 성연령별 요약
          regionSexSummary += `${value}는 {${
            sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
              ? "남성"
              : "여성"
          }}과 {${transData.maxGroup.구분}}${
            pattern === "vist" ? "가 가장 많습니다." : ","
          }`;
        });
        const ratioSummary =
          `생활인구 비율은\n` +
          `거주인구 : {${(
            (regionData[`rsdn_${key}`].value / regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}%, 직장인구 : {${(
            (regionData[`wkplc_${key}`].value /
              regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}%,\n` +
          `방문인구 : {${(
            (regionData[`vist_${key}`].value / regionData[`tot_${key}`].value) *
            100
          ).toFixed(1)}}% 입니다.`;
        const totSummary = `생활인구는 {${Math.round(
          regionData[`tot_${key}`].value
        ).toLocaleString()}}명 입니다.`;
        statObj.data[name] = {
          ratio: ratioSummary,
          sex: regionSexSummary,
          tot: totSummary,
        };
      }
    }

    const uniqueData = data.unique?.find(
      (item: any) => item.key.toString() === regionCode
    );
    if (hasExtraProperties(uniqueData)) {
      const splitData = transformPatternsData(uniqueData.popul_groups.value);
      const sexData = uniqueData.popul_sex_groups.value;
      let regionSexSummary = `{${regionName}}\n`;

      patterns.forEach(({ pattern, value, colName, chartName }) => {
        const transData = transformDataForChart(splitData[colName]);

        //요약
        regionSexSummary += `${value}는 {${
          sexData[`${colName}_MALE`] > sexData[`${colName}_FEML`]
            ? "남성"
            : "여성"
        }}과 {${transData.maxGroup.구분}}${
          pattern === "vist" ? "가 가장 많습니다." : ","
        }`;
      });
      const source = uniqueData.top_hits_docs.hits.hits[0]._source;
      const ratioSummary =
        `생활인구 비율은\n` +
        `거주인구 : {${(
          ((source.RSDN_MALE_POPUL_NUM + source.RSDN_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}%, 직장인구 : {${(
          ((source.WKPLC_MALE_POPUL_NUM + source.WKPLC_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}%,\n` +
        `방문인구 : {${(
          ((source.VIST_MALE_POPUL_NUM + source.VIST_FEML_POPUL_NUM) /
            source.TOT_POPUL_NUM) *
          100
        ).toFixed(1)}}% 입니다.`;

      const totSummary = `생활인구는 {${Math.round(
        uniqueData.top_hits_docs.hits.hits[0]._source.TOT_POPUL_NUM
      ).toLocaleString()}}명 입니다.`;
      statObj.data["Unique"] = {
        ratio: ratioSummary,
        sex: regionSexSummary,
        tot: totSummary,
      };
    }
  }

  return {
    stat: stats,
  };
}
function transformDataForChart(
  data: any,
  isFive?: boolean
): {
  chartData: Record<string, string | number>[];
  maxAgeGroup: { 구분: string; 합계: number };
  maxGroup: { 구분: string; 합계: number };
} {
  const { male_age_groups, female_age_groups } = data;

  const chartData = [];
  const groupedData = [];
  let maxAgeGroup = { 구분: "", 합계: 0 };
  let maxGroup = { 구분: "", 합계: 0 };

  // 대별 그룹 정의
  const ageRanges: { [key: string]: string[] } =
    // isFive
    //   ?
    {
      "10세 미만": ["10세 미만"],
      "10세": ["10세"],
      "15세": ["15세"],
      "20세": ["20세"],
      "25세": ["25세"],
      "30세": ["30세"],
      "35세": ["35세"],
      "40세": ["40세"],
      "45세": ["45세"],
      "50세": ["50세"],
      "55세": ["55세"],
      "60세": ["60세"],
      "65세": ["65세"],
      "70세": ["70세"],
      "75세": ["75세"],
      "80세 이상": ["80세 이상"],
    };
  // : {
  //     "10세 미만": ["10세 미만"],
  //     "10대": ["10세", "15세"],
  //     "20대": ["20세", "25세"],
  //     "30대": ["30세", "35세"],
  //     "40대": ["40세", "45세"],
  //     "50대": ["50세", "55세"],
  //     "60대": ["60세", "65세"],
  //     "70대": ["70세", "75세"],
  //     "80세 이상": ["80세 이상"],
  //   };

  const groups = sortByAgeOrder(male_age_groups, false);

  // 연령대를 기준으로 데이터를 변환
  for (const ageGroup of Object.keys(groups)) {
    const male = Math.round(male_age_groups[ageGroup]);
    const female = Math.round(female_age_groups[ageGroup]);
    const total = male + female;

    chartData.push({
      구분: ageGroup,
      남성: male,
      여성: female,
    });

    // 최대값 갱신
    if (total > maxAgeGroup.합계) {
      maxAgeGroup = { 구분: ageGroup, 합계: total };
    }
  }
  // 대별 데이터 처리
  for (const [group, ages] of Object.entries(ageRanges)) {
    let groupSum = 0;

    for (const age of ages) {
      const male = Math.round(male_age_groups[age]) || 0;
      const female = Math.round(female_age_groups[age]) || 0;
      groupSum += male + female;
    }

    groupedData.push({
      구분: group,
      합계: groupSum,
    });

    // 최대값 갱신 (대별)
    if (groupSum > maxGroup.합계) {
      maxGroup = { 구분: group, 합계: groupSum };
    }
  }

  return { chartData, maxAgeGroup, maxGroup };
}

const transformPatternsData = (data: PopulationGroups): CategoryResult => {
  const result: CategoryResult = {};
  const AGE_GROUPS = [
    "10세 미만",
    "10세",
    "15세",
    "20세",
    "25세",
    "30세",
    "35세",
    "40세",
    "45세",
    "50세",
    "55세",
    "60세",
    "65세",
    "70세",
    "75세",
    "80세 이상",
  ];
  // 초기화
  ["RSDN", "VIST", "WKPLC"].forEach((category) => {
    result[category] = {
      male_age_groups: Object.fromEntries(AGE_GROUPS.map((age) => [age, 0])),
      female_age_groups: Object.fromEntries(AGE_GROUPS.map((age) => [age, 0])),
    };
  });
  // 데이터 처리
  Object.entries(data).forEach(([key, value]) => {
    const [category, gender, ageGroup] = key.split("_");

    // 잘못된 키 무시
    if (!category || !gender || !ageGroup || !result[category]) return;

    const groupKey =
      gender === "MALE" ? "male_age_groups" : "female_age_groups";

    result[category][groupKey][ageGroup] += value;
  });

  return result;
};

const transformComparativeData = (data: PopulationGroups): CategoryResult => {
  const result: CategoryResult = {};
  const AGE_GROUPS = [
    "10세 미만",
    "10세",
    "15세",
    "20세",
    "25세",
    "30세",
    "35세",
    "40세",
    "45세",
    "50세",
    "55세",
    "60세",
    "65세",
    "70세",
    "75세",
    "80세 이상",
  ];

  // 초기화
  ["RSDN"].forEach((category) => {
    result[category] = {
      male_age_groups: Object.fromEntries(AGE_GROUPS.map((age) => [age, 0])),
      female_age_groups: Object.fromEntries(AGE_GROUPS.map((age) => [age, 0])),
    };
  });
  // 데이터 처리
  Object.entries(data).forEach(([key, value]) => {
    const [category, gender, ageGroup] = key.split("_");

    // 잘못된 키 무시
    if (!category || !gender || !ageGroup || !result[category]) return;

    const groupKey =
      gender === "MALE" ? "male_age_groups" : "female_age_groups";

    result[category][groupKey][ageGroup] += value;
  });

  return result;
};

function transformUniqueData(data: PopulationGroups): CategoryResult {
  const maleKeys = Object.keys(data).filter((key) => key.startsWith("MALE_"));
  const femaleKeys = Object.keys(data).filter((key) => key.startsWith("FEML_"));

  const ageRanges = [
    { label: "10세 미만", keys: ["00", "05"] },
    { label: "10세", keys: ["10"] },
    { label: "15세", keys: ["15"] },
    { label: "20세", keys: ["20"] },
    { label: "25세", keys: ["25"] },
    { label: "30세", keys: ["30"] },
    { label: "35세", keys: ["35"] },
    { label: "40세", keys: ["40"] },
    { label: "45세", keys: ["45"] },
    { label: "50세", keys: ["50"] },
    { label: "55세", keys: ["55"] },
    { label: "60세", keys: ["60"] },
    { label: "65세", keys: ["65"] },
    { label: "70세", keys: ["70"] },
    { label: "75세", keys: ["75"] },
    { label: "80세 이상", keys: ["80"] },
  ];

  const calculateAgeGroups = (
    keys: string[],
    ranges: { label: string; keys: string[] }[]
  ): PopulationGroups => {
    return ranges.reduce((acc, range) => {
      acc[range.label] = range.keys.reduce((sum, suffix) => {
        const key = keys.find((k) => k.includes(`_${suffix}_`));
        return sum + ((data[key!] as number) || 0);
      }, 0);
      return acc;
    }, {} as PopulationGroups);
  };

  return {
    UNIQUE: {
      male_age_groups: calculateAgeGroups(maleKeys, ageRanges),
      female_age_groups: calculateAgeGroups(femaleKeys, ageRanges),
    },
  };
}

const transformSexData = (data: any): CategoryResult => {
  const hit = data.hits.hits[0]; // 첫 번째 hit에서 데이터를 가져옴
  if (!hit || !hit._source) {
    throw new Error("Invalid data format.");
  }

  const { FEML_TOT_POPUL_NUM, MALE_TOT_POPUL_NUM } = hit._source;

  return {
    UNIQUE_FEML: FEML_TOT_POPUL_NUM,
    UNIQUE_MALE: MALE_TOT_POPUL_NUM,
  };
};

type PopulationGroups = {
  [key: string]: number;
};

type ResultGroups = {
  male_age_groups: { [key: string]: number };
  female_age_groups: { [key: string]: number };
};

type CategoryResult = {
  [key: string]: ResultGroups;
};
