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
import { convertCDtoNM } from "@/helpers/convertNM";
import { sortByAgeOrder, sortBySexAgeOrder } from "@/helpers/sortByAgeOrder";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";

export async function transMopSexAge(
  data: any,
  regionArray: string[],
  isGroup: boolean,
  type: string
): Promise<Record<string, ChartDataContainer>> {
  let results: Record<string, ChartDataContainer> = {
    sexAge: {
      title: "성연령별 이동 분석",
      summary: [],
      charts: [],
    },
  };
  if (type === "inflow") {
    results.inflow = {
      title: "성연령별 유입인구",
      summary: {},
      charts: [],
    };
  } else if (type === "outflow") {
    results.outflow = {
      title: "성연령별 유출인구",
      summary: {},
      charts: [],
    };
  } else {
    results.inflow = {
      title: "성연령별 유입인구",
      summary: {},
      charts: [],
    };
    results.outflow = {
      title: "성연령별 유출인구",
      summary: {},
      charts: [],
    };
  }
  let groupSexCharts: MergedChartData[] = [];

  let summaryList: Record<string, string> = {
    sexAge: "",
  };
  if (type === "inflow" || type === "flow") {
    summaryList.inflow = "";
  }
  if (type === "outflow" || type === "flow") {
    summaryList.outflow = "";
  }

  let summariesList: Record<string, string[]> = {
    sexAge: [],
  };
  if (type === "inflow" || type === "flow") {
    summariesList.inflow = [];
  }
  if (type === "outflow" || type === "flow") {
    summariesList.outflow = [];
  }

  const flow = [
    {
      flow: "inflow",
      value: "유입인구",
      colName: "INFLOW",
      chartName: "Inflow",
    },
    {
      flow: "outflow",
      value: "유출인구",
      colName: "OUTFLOW",
      chartName: "Outflow",
    },
  ];

  // 필터링 예외처리
  let filteredFlow = flow;
  if (type === "inflow") {
    filteredFlow = flow.filter(({ flow }) => flow === "inflow");
  } else if (type === "outflow") {
    filteredFlow = flow.filter(({ flow }) => flow === "outflow");
  }
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoNM(regionCode);

    const chartsData: Record<string, BaseChartData> = {
      sex: {
        regionName,
        name: `${type === "flow" ? "mop" : "odd"}GenderData${
          isGroup ? "Group" : ""
        }`,
        indicate: [],
      },
      age: {
        regionName,
        name: `${type === "flow" ? "mop" : "odd"}AgeData${
          isGroup ? "Group" : ""
        }`,
        indicate: [],
      },
    };

    if (data) {
      let summariesSex = `{${regionName}}\n`;
      let summariesAge = `{${regionName}}\n`;

      filteredFlow.forEach(({ flow, value, colName, chartName }) => {
        let regionFlowData;
        if (type === "inflow" || type === "outflow") {
          regionFlowData = data[type].find(
            (item: any) => item.key.toString() === regionCode
          );
        } else {
          regionFlowData = data[flow].find(
            (item: any) => item.key.toString() === regionCode
          );
        }

        if (regionFlowData) {
          const totalData = regionFlowData.tot_sum.value;
          const maleSexData = regionFlowData.male_sum.value;
          const femaleSexData = regionFlowData.female_sum.value;
          const ageData = sortByAgeOrder(
            regionFlowData.popul_age_groups.value,
            false
          );
          // const ageData = regionFlowData.popul_age_groups.value;
          const genderAgeData = regionFlowData.popul_groups.value;

          // 성별 비율 계산
          const maleRatio = (maleSexData / totalData) * 100;
          const femaleRatio = (femaleSexData / totalData) * 100;

          // 성별
          updateIndicateData(
            chartsData.sex.indicate,
            "남성",
            flow,
            maleSexData
          );
          updateIndicateData(
            chartsData.sex.indicate,
            "여성",
            flow,
            femaleSexData
          );

          // 연령별
          const ageIndicate = generateAgeIndicate(ageData, flow);
          chartsData.age.indicate = mergeAgeData(
            chartsData.age.indicate,
            ageIndicate
          );

          // 성/연령별
          updateGenderAgeCharts(
            results[flow]?.charts || [],
            regionName,
            genderAgeData,
            type,
            flow,
            isGroup
          );

          // 성별 유입/유출 요약
          if (type === "inflow") {
            summariesSex += `${value}는 ${
              maleSexData > femaleSexData ? "남성" : "여성"
            }이 많습니다.`;
          } else if (type === "outflow") {
            summariesSex += `${value}는 ${
              maleSexData > femaleSexData ? "남성" : "여성"
            }이 많습니다.`;
          } else {
            if (flow === "inflow") {
              summariesSex += `${value}는 {${
                maleSexData > femaleSexData ? "남성" : "여성"
              }}이`;
            } else if (flow === "outflow") {
              summariesSex += `${value}는 {${
                maleSexData > femaleSexData ? "남성" : "여성"
              }}이 많습니다.`;
            }
          }

          // 연령대별 최고값 계산
          const highestAgeGroup = Object.entries(ageData).reduce(
            (max, [ageGroup, value]) => {
              // value가 숫자인지 확인
              if (typeof value === "number" && value > max.value) {
                return { group: ageGroup, value };
              }
              return max;
            },
            { group: "", value: 0 } // 초기값
          );

          // 연령별 유입/유출 요약
          if (type === "inflow") {
            summariesAge += ` {${highestAgeGroup.group}}가 가장 많습니다.`;
          } else if (type === "outflow") {
            summariesAge += ` {${highestAgeGroup.group}}가 가장 많습니다.`;
          } else {
            if (flow === "inflow") {
              summariesAge += `{${highestAgeGroup.group}}가,\n`;
            } else if (flow === "outflow") {
              summariesAge += `{${highestAgeGroup.group}}가 가장 많습니다.`;
            }
          }

          //유입인구 연령 최대값
          const highestFlowAgeGroup = Object.entries(genderAgeData).reduce(
            (max, [ageGroup, value]) => {
              if (typeof value === "number" && value > max.value) {
                return { group: ageGroup, value };
              }
              return max;
            },
            { group: "", value: 0 } // 초기값
          );
          const highestAgeRatio = (highestFlowAgeGroup.value / totalData) * 100;

          // 유입/유출인구 요약
          const summary = `{${regionName}} {${value}}의 남성 비율은 {${maleRatio.toFixed(
            1
          )}}%, 여성 비율은 {${femaleRatio.toFixed(1)}}%이며, {${
            highestFlowAgeGroup.group.split("_")[1]
          }}가 {${highestAgeRatio.toFixed(1)}}%로 전 연령대 중 가장 많습니다.`;
          if (isGroup) {
            summariesList[flow].push(summary);
          } else {
            summaryList[flow] = summary;
          }
        }
      });

      summariesList.sexAge.push(summariesSex);
      summariesList.sexAge.push(summariesAge);
    }
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
    results.sexAge.charts.push(chartsData.age);
  }

  // 요약 결과를 results에 추가
  if (!results.sexAge.summary) {
    results.sexAge.summary = [];
  }
  (results.sexAge.summary as string[]).push(...summariesList.sexAge);
  if (isGroup) {
    if (type === "inflow" || type === "flow") {
      results.inflow.summary = summariesList.inflow;
    }
    if (type === "outflow" || type === "flow") {
      results.outflow.summary = summariesList.outflow;
    }
  } else {
    if (type === "inflow" || type === "flow") {
      results.inflow.summary = summaryList.inflow;
    }
    if (type === "outflow" || type === "flow") {
      results.outflow.summary = summaryList.outflow;
    }
  }
  if (isGroup) {
    results.sexAge.charts.unshift(...groupSexCharts);
  }
  return results;
}

function updateIndicateData(
  indicate: any[],
  gender: string,
  flowType: string,
  value: number
) {
  const existingData = indicate.find((item) => item.구분 === gender);
  const key = flowType === "inflow" ? "유입인구" : "유출인구";

  if (existingData) {
    existingData[key] = Math.round(value);
  } else {
    const newData: Record<string, any> = {
      구분: gender,
    };
    newData[key] = Math.round(value);
    indicate.push(newData);
  }
}

function generateAgeIndicate(
  ageData: Record<string, number>,
  flow: string
): Record<string, any>[] {
  return Object.keys(ageData).map((ageGroup) => ({
    구분: ageGroup,
    [flow === "inflow" ? "유입인구" : "유출인구"]: Math.round(
      ageData[ageGroup]
    ),
  }));
}

function mergeAgeData(
  existing: Record<string, any>[],
  newData: Record<string, any>[]
): Record<string, any>[] {
  const merged = [...existing];

  newData.forEach((item) => {
    const existingItem = merged.find((data) => data.구분 === item.구분);
    if (existingItem) {
      Object.assign(existingItem, item); // 기존 데이터에 새로운 데이터를 병합
    } else {
      merged.push(item); // 기존에 없는 경우 추가
    }
  });

  return merged;
}

function generateGenderAgeIndicate(
  genderAgeData: Record<string, number>,
  flow: string
): Record<string, any>[] {
  // 데이터를 연령별로 분류하여 반환
  const groupedData: Record<string, any> = {};

  Object.entries(genderAgeData).forEach(([key, value]) => {
    const [gender, ageGroup] = key.split("_");
    const genderLabel = gender === "MALE" ? "남성" : "여성";

    if (!groupedData[ageGroup]) {
      groupedData[ageGroup] = { 구분: ageGroup, 남성: 0, 여성: 0 };
    }
    groupedData[ageGroup][genderLabel] += Math.round(value);
  });

  // 연령대 정렬을 위해 숫자와 특수 연령대를 처리하는 로직
  const ageOrder = (age: string): number => {
    if (age === "10세 미만") return -1; // 가장 먼저
    if (age === "80세 이상") return 999; // 가장 마지막
    return parseInt(age.replace("세", ""), 10) || 0; // 숫자 추출
  };

  // Object.values로 데이터 추출 후 정렬
  const sortedData = Object.values(groupedData).sort((a, b) => {
    return ageOrder(a.구분) - ageOrder(b.구분);
  });

  return sortedData;
}

function updateGenderAgeCharts(
  charts: any[],
  regionName: string,
  genderAgeData: Record<string, number>,
  type: string,
  flow: string,
  isGroup: boolean
) {
  const chartName =
    flow === "inflow"
      ? `${type === "flow" ? "mop" : "odd"}GenderAgeInflowData${
          isGroup ? "Group" : ""
        }`
      : `${type === "flow" ? "mop" : "odd"}GenderAgeOutflowData${
          isGroup ? "Group" : ""
        }`;

  const indicate = generateGenderAgeIndicate(genderAgeData, flow);

  charts.push({
    regionName,
    name: chartName,
    indicate,
  });
}
