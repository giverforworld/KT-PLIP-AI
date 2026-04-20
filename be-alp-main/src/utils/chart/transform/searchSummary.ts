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
import { convertCDtoFullNM } from "@/helpers/convertNM";
import { hasExtraProperties } from "@/helpers/sortByRegionArray";
import { formatTimeZone } from "@/helpers/convertTime";

export async function tranfromCommon(
  data: CommonData,
  regionArray: string[]
): Promise<SearchSummary[]> {
  const resultObj: Record<
    string,
    { data: SearchSummaryDataObj[]; unit?: string; type?: string }
  > = {
    행정구역명: {
      data: [] as SearchSummaryDataObj[],
    },
    "내국인 생활인구 수": {
      data: [] as SearchSummaryDataObj[],
      unit: "(명)",
    },
    "전년동기대비증감(내국인)": {
      data: [] as SearchSummaryDataObj[],
      type: "variance",
      unit: "%",
    },
    "남성 비율(내국인)": {
      data: [] as SearchSummaryDataObj[],
      unit: "%",
    },
    "여성 비율(내국인)": {
      data: [] as SearchSummaryDataObj[],
      unit: "%",
    },
    "최다 연령대(내국인)": {
      data: [] as SearchSummaryDataObj[],
    },
    "최다 시간대(내국인)": {
      data: [] as SearchSummaryDataObj[],
    },
    "거주인구 비율(내국인)": {
      data: [] as SearchSummaryDataObj[],
      unit: "%",
    },
    "직장인구 비율(내국인)": {
      data: [] as SearchSummaryDataObj[],
      unit: "%",
    },
    "방문인구 비율(내국인)": {
      data: [] as SearchSummaryDataObj[],
      unit: "%",
    },
  };

  const dataMap: { title: string; Sum: string; Avg: string; Unique: string }[] =
    [
      {
        title: "내국인 생활인구 수",
        Sum: "tot_sum",
        Avg: "tot_avg",
        Unique: "TOT_POPUL_NUM",
      },
      {
        title: "전년동기대비증감(내국인)",
        Sum: "tot_sum_lastYear",
        Avg: "tot_avg_lastYear",
        Unique: "TOT_POPUL_NUM",
      },
      {
        title: "남성 비율(내국인)",
        Sum: "male_sum",
        Avg: "male_avg",
        Unique: "MALE_POPUL_NUM",
      },
      {
        title: "여성 비율(내국인)",
        Sum: "female_sum",
        Avg: "female_avg",
        Unique: "FEML_POPUL_NUM",
      },
      {
        title: "최다 연령대(내국인)",
        Sum: "maxSumAgeGroup",
        Avg: "maxAvgAgeGroup",
        Unique: "age_groups",
      },
      {
        title: "최다 시간대(내국인)",
        Sum: "max_sum_timezn",
        Avg: "max_avg_timezn",
        Unique: "-",
      },
      {
        title: "거주인구 비율(내국인)",
        Sum: "rsdn_sum",
        Avg: "rsdn_avg",
        Unique: "RSDN",
      },
      {
        title: "직장인구 비율(내국인)",
        Sum: "wkplc_sum",
        Avg: "wkplc_avg",
        Unique: "WKPLC",
      },
      {
        title: "방문인구 비율(내국인)",
        Sum: "vist_sum",
        Avg: "vist_avg",
        Unique: "VIST",
      },
    ];
  for (const regionCode of regionArray) {
    const regionName = await convertCDtoFullNM(Number(regionCode));
    resultObj["행정구역명"].data.push({
      regionName,
      value: {
        Avg: regionName,
        Unique: regionName,
      },
    });
    //평균, 누적 데이터
    const regionAvgSumData = data.avgSum.find(
      (item) => item.key.toString() === regionCode
    );
    //유니크 데이터
    const regionUniqueData = data.unique.find(
      (item) => item.key.toString() === regionCode
    );
    const totObj = {
      Avg: regionAvgSumData[dataMap[0].Avg]?.value || "-",
      Sum: regionAvgSumData[dataMap[0].Sum]?.value || "-",
      Unique: hasExtraProperties(regionUniqueData)
        ? regionUniqueData.top_hits_docs.hits.hits[0]._source[dataMap[0].Unique]
        : "-",
    };
    dataMap.forEach((map) => {
      const value: { Avg: any; Sum: any; Unique: any } = {
        Avg: "-",
        Sum: "-",
        Unique: "-",
      };
      if (hasExtraProperties(regionAvgSumData)) {
        if (map.title.includes("비율")) {
          value.Avg =
            ((regionAvgSumData[map.Avg].value / totObj.Avg) * 100).toFixed(1) ||
            "-";
          value.Sum =
            ((regionAvgSumData[map.Sum].value / totObj.Sum) * 100).toFixed(1) ||
            "-";
        } else if (map.title.includes("증감")) {
          value.Avg =
            Number(
              (
                ((totObj.Avg - regionAvgSumData[map.Avg]?.value) /
                  regionAvgSumData[map.Avg]?.value) *
                100
              ).toFixed(2)
            ) || "-";
          value.Sum =
            Number(
              (
                ((totObj.Sum - regionAvgSumData[map.Sum]?.value) /
                  regionAvgSumData[map.Sum]?.value) *
                100
              ).toFixed(2)
            ) || "-";
        } else if (map.title.includes("수")) {
          value.Avg =
            Number(
              regionAvgSumData[map.Avg].value.toFixed(0)
            ).toLocaleString() || "-";
          value.Sum =
            Number(
              regionAvgSumData[map.Sum].value.toFixed(0)
            ).toLocaleString() || "-";
        } else if (map.title.includes("연령대")) {
          value.Avg = regionAvgSumData.age_groups.value[map.Avg] || "-";
          value.Sum = regionAvgSumData.age_groups.value[map.Sum] || "-";
        } else if (map.title.includes("시간")) {
          value.Avg = formatTimeZone(regionAvgSumData[map.Avg].keys[0]) || "-";
          value.Sum = formatTimeZone(regionAvgSumData[map.Sum].keys[0]) || "-";
        } else {
          value.Avg = regionAvgSumData[map.Avg].value || "-";
          value.Sum = regionAvgSumData[map.Sum].value || "-";
        }
      }
      if (hasExtraProperties(regionUniqueData)) {
        if (map.title.includes("성")) {
          value.Unique =
            (
              (regionUniqueData.top_hits_docs.hits.hits[0]._source[map.Unique] /
                totObj.Unique) *
              100
            ).toFixed(1) || "-";
        } else if (map.title.includes("비율")) {
          //kt용 field 수정
          value.Unique =
            (
              ((regionUniqueData.top_hits_docs.hits.hits[0]._source[
                `${map.Unique}_FEML_POPUL_NUM`
              ] +
                regionUniqueData.top_hits_docs.hits.hits[0]._source[
                  `${map.Unique}_MALE_POPUL_NUM`
                ]) /
                totObj.Unique) *
              100
            ).toFixed(1) || "-";
          //개발용
          // value.Unique =
          //   (
          //     (regionUniqueData.top_hits_docs.hits.hits[0]._source[map.Unique] /
          //       totObj.Unique) *
          //     100
          //   ).toFixed(1) || "-";
        } else if (map.title.includes("증감")) {
          value.Unique =
            Number(
              (
                ((totObj.Unique -
                  regionUniqueData.tot_lastYear?.hits.hits[0]._source[
                    map.Unique
                  ]) /
                  regionUniqueData.tot_lastYear?.hits.hits[0]._source[
                    map.Unique
                  ]) *
                100
              ).toFixed(2)
            ) || "-";
        } else if (map.title.includes("수")) {
          value.Unique =
            Number(
              regionUniqueData.top_hits_docs.hits.hits[0]._source[
                map.Unique
              ].toFixed(0)
            ).toLocaleString() || "-";
        } else if (map.title.includes("연령대")) {
          value.Unique = regionUniqueData[map.Unique].value || "-";
        } else {
          value.Unique =
            regionUniqueData.top_hits_docs.hits.hits[0]._source[map.Unique] ||
            "-";
        }
      }
      resultObj[map.title].data.push({
        regionName,
        value: value,
      });
    });
  }
  const result = Object.entries(resultObj).map(
    ([key, value]: [string, any]) => ({ title: key, ...value })
  );
  return result;
}

export async function transformFlow(
  data: FlowDataResponse,
  regionArray: string[]
): Promise<SearchSummary[]> {
  const result = [
    {
      title: "최다 유입지역(내국인)",
      data: [] as SearchSummaryDataObj[],
    },
    {
      title: "최다 유출지역(내국인)",
      data: [] as SearchSummaryDataObj[],
    },
  ];
  //유입, 유출

  await Promise.all(
    (["by_detina", "by_pdepar"] as const).map(async (field, index) => {
      if (data[field].length !== 0) {
        for (const regionCode of regionArray) {
          const regionName = await convertCDtoFullNM(Number(regionCode));
          const regionData = data[field].find((item) =>
            item.hasOwnProperty(regionCode)
          )?.[regionCode];
          if (regionData) {
            const maxAvgBucket = regionData[
              index === 0 ? "group_by_pdepar_avg" : "group_by_detina_avg"
            ]!.buckets.find((bucket: any) => bucket.key !== Number(regionCode));
            const maxSumBucket = regionData[
              index === 0 ? "group_by_pdepar_sum" : "group_by_detina_sum"
            ]!.buckets.find((bucket: any) => bucket.key !== Number(regionCode));
            if (maxSumBucket && maxAvgBucket) {
              const maxAvgRegion = await convertCDtoFullNM(maxAvgBucket.key);
              const maxSumRegion = await convertCDtoFullNM(maxSumBucket.key);
              result[index].data.push({
                regionName,
                value: {
                  Avg: maxAvgRegion,
                  Unique: "-",
                },
              });
            } else {
              // 데이터 없어도 regionName, value 필요
              result[index].data.push({
                regionName,
                value: {
                  Avg: "-",
                  Unique: "-",
                },
              });
            }
          } else {
            // 데이터 없어도 regionName, value 필요
            result[index].data.push({
              regionName,
              value: {
                Avg: "-",
                Unique: "-",
              },
            });
          }
        }
      }
    })
  );
  return result;
}

export async function tranfromForn(
  data: FornData[],
  regionArray: string[]
): Promise<SearchSummary[]> {
  const result = [
    {
      title: "외국인 생활인구 수",
      data: [] as SearchSummaryDataObj[],
      unit: "(명)",
    },
  ];

  for (const regionCode of regionArray) {
    const regionName = await convertCDtoFullNM(Number(regionCode));
    const regionData = data.find((item) => item.key.toString() === regionCode);

    if (regionData) {
      result[0].data.push({
        regionName,
        value: {
          Avg: Number(regionData.tot_avg.value.toFixed(0)).toLocaleString(),
          Unique: "-",
        },
      });
    } else {
      result[0].data.push({
        regionName,
        value: {
          Avg: "-",
          Unique: "-",
        },
      });
    }
  }
  return result;
}
// 지역 데이터의 타입 정의
interface PopulationBucket {
  key: number;
  doc_count: number;
  total_population: {
    value: number;
  };
}

interface GroupBy {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: PopulationBucket[];
}

interface RegionData {
  doc_count: number;
  group_by_pdepar_sum?: GroupBy;
  group_by_pdepar_avg?: GroupBy;
  group_by_detina_sum?: GroupBy;
  group_by_detina_avg?: GroupBy;
}

interface FlowDataResponse {
  by_pdepar: Array<Record<string, RegionData>>;
  by_detina: Array<Record<string, RegionData>>;
}
interface FornData {
  key: number;
  doc_count: number;
  tot_avg: { value: number };
  tot_sum: { value: number };
}
interface CommonData {
  avgSum: any[];
  unique: any[];
}
