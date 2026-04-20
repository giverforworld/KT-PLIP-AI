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

import { getHolidays } from "@/utils/holidays";
import { convertCDtoNM, convertCDtoFullNM } from "@/helpers/convertNM";
import {
  formatDate,
  chartFormatDate,
  convertToTimeFormat,
  calcMonthToDate,
} from "@/helpers/convertDate";
import util from "util";
import {
  calculateLastRatio,
  calculateMaxMinPopulation,
  calculatePrevRatio,
  calculateSexMaxMinPopulation,
  calculateAgeMaxMinPopulation,
  maxValueinIndicate,
  maxWayIndicate,
  getDowAvgData
} from "../calcList";
import {
  getWeekedOccurrences,
  getTotalDays
} from "@/helpers/normalized/normalizedALPData";
const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]

export async function transMopData(data1: any, data2: any, start: string) {
  const results: any[] = [];
  let summaryMopContent1 = "";
  let summaryMopContent2 = "";

  const PdeBucket = data1[0].aggregations?.by_pdepar?.buckets || []; // 유출
  const DetinaBucket = data2[0].aggregations?.by_detina?.buckets || []; // 유입
  const date = formatDate(start);

  for (const Item of PdeBucket) {
    const pdeparKey = Item.key;
    const regionName = await convertCDtoNM(Item.key);
    const regionFName = await convertCDtoFullNM(Item.key);
    const pdepar_tot_population =
      Math.round(Item?.tot_popul_num?.value).toLocaleString() ?? 0;
    const pdeparRankBucket = Item?.by_detina?.buckets || [];

    const detinaItem = DetinaBucket.find(
      (dItem: any) => String(dItem.key) === String(pdeparKey)
    );
    const detina_tot_population =
      Math.round(detinaItem?.tot_popul_num?.value).toLocaleString() ?? 0;

    const indicate = [];

    let maxDetinaPopulation = 0;
    let maxDetinaRegion = "";
    if (detinaItem) {
      const detinaRankBucket = detinaItem?.by_pdepar?.buckets || [];
      for (const dRItem of detinaRankBucket) {
        const detinaRegionName = await convertCDtoNM(dRItem.key);
        const detinaFRegionName = await convertCDtoFullNM(dRItem.key);
        const detinaPopulation = Math.round(
          dRItem?.pdepar_tot_popul_num?.value || 0
        );

        if (
          dRItem.key !== pdeparKey &&
          detinaPopulation > maxDetinaPopulation
        ) {
          maxDetinaPopulation = detinaPopulation;
          maxDetinaRegion = await convertCDtoFullNM(dRItem.key);
        }

        indicate.push({
          구분: `${detinaFRegionName} 유입`,
          지역: `${regionFName}`,
          생활인구: detinaPopulation,
        });
      }
    }

    let maxPdeparPopulation = 0;
    let maxPdeparRegion = "";
    for (const pRItem of pdeparRankBucket) {
      const pdeparRegionName = await convertCDtoNM(pRItem.key);
      const pdeparFRegionName = await convertCDtoFullNM(pRItem.key);
      const pdeparPopulation = Math.round(
        pRItem?.detina_tot_popul_num?.value || 0
      );

      if (pRItem.key !== pdeparKey && pdeparPopulation > maxPdeparPopulation) {
        maxPdeparPopulation = pdeparPopulation;
        maxPdeparRegion = await convertCDtoFullNM(pRItem.key);
      }

      indicate.push({
        구분: regionFName,
        지역: `${pdeparFRegionName} 유출`,
        생활인구: pdeparPopulation,
      });
    }

    summaryMopContent1 = `{${regionFName}}(으)로 유입된 인구는 총 {${detina_tot_population}}명, 유출된 인구는 총 {${pdepar_tot_population}}명으로 나타났습니다.`;
    summaryMopContent2 = `주요 유입 지역은 {${maxDetinaRegion}}이며, 주요 유출 지역은 {${maxPdeparRegion}}입니다.`;
    results.push({
      title: "생활 이동 흐름",
      summary: `{${regionFName}}에서 분석 기간 ${date}동안 집계 된 총 유입인구는 {${detina_tot_population}}명, 총 유출인구는 {${pdepar_tot_population}}명으로 나타남\n동일지역 간 이동을 제외한 최다 유입지역은 {${maxDetinaRegion}}(으)로 {${maxDetinaPopulation.toLocaleString()}}명이 유입되었으며, 최다 유출지역은 {${maxPdeparRegion}}(으)로 {${maxPdeparPopulation.toLocaleString()}}명이 유출되었음`,
      charts: [
        {
          name: "mopFlowData",
          indicate,
        },
      ],
    });
  }
  return { results, summaryMopContent1, summaryMopContent2 };
}

export async function transMopData1(
  data1: any,
  data2: any,
  start: string,
  region: string,
  prevMonth: string,
  lastYear: string
) {
  const results: any[] = [];
  const indicate1: { 구분: string; 유입인구: number; 유출인구: number }[] = [];
  const indicate2: { 구분: string; 유입인구: number; 유출인구: number }[] = [];

  const current = formatDate(start);
  const present = chartFormatDate(start);
  const prevmonth = chartFormatDate(prevMonth);
  const lastyear = chartFormatDate(lastYear);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const pde_start_population =
    data1[0]?.present?.tot_popul_num?.value ?? 0;
  const pde_prev_population =
    data1[0]?.prev?.tot_popul_num?.value ?? 0;
  const pde_last_population =
    data1[0]?.last?.tot_popul_num?.value ?? 0;

  const pde_MonthlyChange = calculatePrevRatio(
    pde_start_population,
    pde_prev_population
  );
  const pde_YearlyChange = calculateLastRatio(
    pde_start_population,
    pde_last_population
  );

  const det_start_population =
    data2[0]?.present?.tot_popul_num?.value ?? 0;
  const det_prev_population =
    data2[0]?.prev?.tot_popul_num?.value ?? 0;
  const det_last_population =
    data2[0]?.last?.tot_popul_num?.value ?? 0;

  const det_MonthlyChange = calculatePrevRatio(
    det_start_population,
    det_prev_population
  );
  const det_YearlyChange = calculateLastRatio(
    det_start_population,
    det_last_population
  );

  indicate1.push(
    {
      구분: lastyear,
      유입인구: Math.round(det_last_population),
      유출인구: Math.round(pde_last_population),
    },
    {
      구분: present,
      유입인구: Math.round(det_start_population),
      유출인구: Math.round(pde_start_population),
    }
  );

  indicate2.push(
    {
      구분: prevmonth,
      유입인구: Math.round(det_prev_population),
      유출인구: Math.round(pde_prev_population),
    },
    {
      구분: present,
      유입인구: Math.round(det_start_population),
      유출인구: Math.round(pde_start_population),
    }
  );

  results.push({
    title: "전년/전월 동기 대비 비교 분석",
    summary: `분석 기간 ${current}을 기준으로 타지역에서 {${regionFullName}}으로 유입한 인구는 {${Math.round(
      det_start_population
    ).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
      det_YearlyChange ?? 0).toFixed(1)
    )}}% ${
      det_YearlyChange >= 0 ? "{증가}" : "{감소}"
    }하였으며, 전월 대비 유입인구는 {${parseFloat(Math.abs(
      det_MonthlyChange ?? 0).toFixed(1)
    )}}% ${
      det_MonthlyChange >= 0 ? "{증가}" : "{감소}"
    }한 것으로 나타남\n분석 기간 ${current}을 기준으로 {${regionFullName}}에서 타지역으로 유출한 인구는 {${Math.round(
      pde_start_population
    ).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
      pde_YearlyChange ?? 0).toFixed(1)
    )}}% ${
      pde_YearlyChange >= 0 ? "{증가}" : "{감소}"
    }하였으며, 전월 대비 유출인구는 {${parseFloat(Math.abs(
      pde_MonthlyChange ?? 0).toFixed(1)
    )}}% ${pde_MonthlyChange >= 0 ? "{증가}" : "{감소}"}`,
    charts: [
      {
        name: "mopLastyearData",
        indicate: indicate1,
      },
      {
        name: "mopPreMonthData",
        indicate: indicate2,
      },
    ],
  }); 
  return results;
}

export async function transMopData2(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const { sunCnt, monCnt, tueCnt, wedCnt, thuCnt, friCnt, satCnt} = getDowAvgData(convertStart.start, convertStart.end)
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
      convertStart.start,
      convertStart.end,
      holidays
    );

  let summaryMopContent3 = "";
  let out_week_ratio = 0;
  let out_week_max = "";
  let out_week_min = "";
  let in_week_ratio = 0;
  let in_week_max = "";
  let in_week_min = "";

  let out_max = 0,
    out_max_day = "",
    in_max = 0,
    in_max_day = "";

  const date = formatDate(start);
  const outBucket = data1[0].aggregations?.by_region?.buckets || [];
  const inBucket = data2[0].aggregations?.by_region?.buckets || [];

  for (const outItem of outBucket) {
    const outkey = outItem.key;

    const sun_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[0]?.tot_sum?.value ?? 0) / sunCnt);
    const mon_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[1]?.tot_sum?.value ?? 0) / monCnt);
    const tue_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[2]?.tot_sum?.value ?? 0) / tueCnt);
    const wed_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[3]?.tot_sum?.value ?? 0) / wedCnt);
    const thu_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[4]?.tot_sum?.value ?? 0) / thuCnt);
    const fri_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[5]?.tot_sum?.value ?? 0) / friCnt);
    const sat_out_popul_num =
      Math.round((outItem?.by_dow?.buckets[6]?.tot_sum?.value ?? 0) / satCnt);
    const week_out_popul_num =
      Math.round((outItem?.by_holiday?.buckets?.weekday?.tot_sum?.value ?? 0) / weekdayCnt);
    const weekend_out_popul_num =
      Math.round((outItem?.by_holiday?.buckets?.weekend?.tot_sum?.value ?? 0) / holidayCnt);

    const { maxValue: calculatedOutMax, maxDay: calculatedOutMaxDay } =
      calculateMaxMinPopulation(
        sun_out_popul_num,
        mon_out_popul_num,
        tue_out_popul_num,
        wed_out_popul_num,
        thu_out_popul_num,
        fri_out_popul_num,
        sat_out_popul_num
      );

    out_max = calculatedOutMax;
    out_max_day = calculatedOutMaxDay;

    if (week_out_popul_num >= weekend_out_popul_num) {
      out_week_ratio =
        ((week_out_popul_num - weekend_out_popul_num) / weekend_out_popul_num) *
        100;
      out_week_max = "평일";
      out_week_min = "휴일";
    } else {
      out_week_ratio =
        ((weekend_out_popul_num - week_out_popul_num) / week_out_popul_num) *
        100;
      out_week_max = "휴일";
      out_week_min = "평일";
    }

    const inItem = inBucket.find(
      (inItem: any) => String(inItem.key) === String(outkey)
    );

    const sun_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[0]?.tot_sum?.value ?? 0) / sunCnt);
    const mon_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[1]?.tot_sum?.value ?? 0) / monCnt);
    const tue_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[2]?.tot_sum?.value ?? 0) / tueCnt);
    const wed_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[3]?.tot_sum?.value ?? 0) / wedCnt);
    const thu_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[4]?.tot_sum?.value ?? 0) / thuCnt);
    const fri_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[5]?.tot_sum?.value ?? 0) / friCnt);
    const sat_in_popul_num =
      Math.round((inItem?.by_dow?.buckets[6]?.tot_sum?.value ?? 0) / satCnt);
    const week_in_popul_num =
      Math.round((inItem?.by_holiday?.buckets?.weekday?.tot_sum?.value ?? 0) / weekdayCnt);
    const weekend_in_popul_num =
      Math.round((inItem?.by_holiday?.buckets?.weekend?.tot_sum?.value ?? 0) / holidayCnt);

    const { maxValue: calculatedInMax, maxDay: calculatedInMaxDay } =
      calculateMaxMinPopulation(
        sun_in_popul_num,
        mon_in_popul_num,
        tue_in_popul_num,
        wed_in_popul_num,
        thu_in_popul_num,
        fri_in_popul_num,
        sat_in_popul_num
      );

    in_max = calculatedInMax;
    in_max_day = calculatedInMaxDay;

    if (week_in_popul_num >= weekend_in_popul_num) {
      in_week_ratio =
        ((week_in_popul_num - weekend_in_popul_num) / weekend_in_popul_num) *
        100;
      in_week_max = "평일";
      in_week_min = "휴일";
    } else {
      in_week_ratio =
        ((weekend_in_popul_num - week_in_popul_num) / week_in_popul_num) * 100;
      in_week_max = "휴일";
      in_week_min = "평일";
    }

    Indicate1.push(
      {
        구분: "월요일",
        유입인구: mon_in_popul_num,
        유출인구: mon_out_popul_num,
      },
      {
        구분: "화요일",
        유입인구: tue_in_popul_num,
        유출인구: tue_out_popul_num,
      },
      {
        구분: "수요일",
        유입인구: wed_in_popul_num,
        유출인구: wed_out_popul_num,
      },
      {
        구분: "목요일",
        유입인구: thu_in_popul_num,
        유출인구: thu_out_popul_num,
      },
      {
        구분: "금요일",
        유입인구: fri_in_popul_num,
        유출인구: fri_out_popul_num,
      },
      {
        구분: "토요일",
        유입인구: sat_in_popul_num,
        유출인구: sat_out_popul_num,
      },
      {
        구분: "일요일",
        유입인구: sun_in_popul_num,
        유출인구: sun_out_popul_num,
      }
    );

    Indicate2.push(
      {
        구분: "유입인구",
        평일: week_in_popul_num,
        휴일: weekend_in_popul_num,
      },
      {
        구분: "유출인구",
        평일: week_out_popul_num,
        휴일: weekend_out_popul_num,
      }
    );
  }

  summaryMopContent3 = `평일과 휴일 중 유입 인구는 {${in_week_max}}에, 유출 인구는 {${out_week_max}}에 집중되었습니다.`;
  results.push({
    title: "요일별 이동 분석",
    summary: `분석 기간 ${date} 동안 유입인구가 가장 많은 요일은 {${in_max_day}}요일({${Math.round(
      in_max
    ).toLocaleString()}}명)이며 유출인구가 가장 많은 요일은 {${out_max_day}}요일({${Math.round(
      out_max
    ).toLocaleString()}}명)으로 나타남\n분석 기간 ${date} 동안 유입인구는 {${in_week_min}} 대비 {${in_week_max}}에 {${parseFloat(
      in_week_ratio.toFixed(1)
    )}}% 더 많고, 유출인구는 {${out_week_min}} 대비 {${out_week_max}}에 {${parseFloat(
      out_week_ratio.toFixed(1)
    )}}% 더 많음`,
    charts: [
      {
        name: "mopWeekPopData",
        indicate: Indicate1,
      },
      {
        name: "mopWeekdayHolidayMoveData",
        indicate: Indicate2,
      },
    ],
  });
  return { results, summaryMopContent3 };
}

export async function transMopData3(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate: any[] = [];
  let summaryMopContent4 = "";
  const RegionShortName = await convertCDtoNM(region);
  const RegionFullName = await convertCDtoFullNM(Number(region));
  const date = await formatDate(start);

  const outBucket = data1[0].aggregations?.by_region?.buckets || [];
  const inBucket = data2[0].aggregations?.by_region?.buckets || [];

  for (const outItem of outBucket) {
    const outTimeBucket = outItem?.by_timezn?.buckets;
    const outKey = outItem.key;

    const inItem = inBucket.find(
      (inItem: any) => String(inItem.key) === String(outKey)
    );

    const inTimeBucket = inItem?.by_timezn?.buckets;
    let out_maxPopulNum = -Infinity;
    let out_maxTime = "";
    let in_maxPopulNum = -Infinity;
    let in_maxTime = "";

    for (let i = 0; i < 24; i++) {
      const out_tot_populNum = outTimeBucket[i]?.tot_popul_num?.value ?? 0;
      const in_tot_populNum = inTimeBucket[i]?.tot_popul_num?.value ?? 0;

      const outpopulArray = [out_tot_populNum];
      const inpopulArray = [in_tot_populNum];

      const outMaxPopulNum = Math.max(...outpopulArray);
      const inMaxPopulNum = Math.max(...inpopulArray);

      if (outMaxPopulNum > out_maxPopulNum) {
        out_maxPopulNum = outMaxPopulNum;
        out_maxTime = `${i}`;
      }

      if (inMaxPopulNum > in_maxPopulNum) {
        in_maxPopulNum = inMaxPopulNum;
        in_maxTime = `${i}`;
      }

      Indicate.push({
        구분: `${i}`,
        도착시간대별유입인구: Math.round(in_tot_populNum),
        출발시간대별유출인구: Math.round(out_tot_populNum),
      });
    }

    const in_max_time = convertToTimeFormat(Number(in_maxTime));
    const out_max_time = convertToTimeFormat(Number(out_maxTime));

    summaryMopContent4 = `유입 시 최다 도착 시간대는 {${in_max_time}}이며, 유출 시 최다 출발 시간대는 {${out_max_time}}로 나타났습니다.`;
    results.push({
      title: "시간대별 이동 분석",
      summary: `분석 기간 ${date} 동안 타지역에서 {${RegionFullName}}로 유입할 때, 가장 많이 도착하는 시간대는 {${in_max_time}}({${Math.round(
        in_maxPopulNum
      ).toLocaleString()}}명)으로 나타남\n분석 기간 ${date} 동안 {${RegionFullName}}에서 타지역으로 유출할 때, 가장 많이 출발하는 시간대는 {${out_max_time}}({${Math.round(
        out_maxPopulNum
      ).toLocaleString()}}명)으로 나타남`,
      charts: [
        {
          name: "mopTimeMoveTrendDataData",
          indicate: Indicate,
        },
      ],
    });
  }
  return { results, summaryMopContent4 };
}

export async function transMopData4(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  let summaryMopContent5 = "";

  const ageGenOrder = [
    "10세 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80세 이상",
  ];

  const regionFullName = await convertCDtoFullNM(region);
  const date = formatDate(start);

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const outBucket = data1[0].aggregations?.by_region?.buckets || [];
    const inBucket = data2[0].aggregations?.by_region?.buckets || [];

    for (const outItem of outBucket) {
      const outKey = outItem.key;
      const out_male = outItem?.male?.value || 0;
      const out_feml = outItem?.female?.value || 0;
      const outTimeBucket = outItem?.age_groups?.value || {};
  
      const inItem = inBucket.find(
        (inItem: any) => String(inItem.key) === String(outKey)
      );
      const in_male = inItem?.male?.value || 0;
      const in_feml = inItem?.female?.value || 0;
      const inTimeBucket = inItem?.age_groups?.value || {};
  
      Indicate1.push(
        {
          구분: "남성",
          유입인구: Math.round(in_male),
          유출인구: Math.round(out_male),
        },
        {
          구분: "여성",
          유입인구: Math.round(in_feml),
          유출인구: Math.round(out_feml),
        }
      );
  
      const outAgeGroups = Object.entries(outTimeBucket).map(([key, value]) => ({
        key,
        value,
      }));
  
      for (const ageOutGroup of outAgeGroups) {
        Indicate2.push({
          구분: ageOutGroup.key,
          유출인구: Math.round(Number(ageOutGroup.value)),
          유입인구: 0,
        });
      }
  
      const inAgeGroups = Object.entries(inTimeBucket).map(([key, value]) => ({
        key,
        value,
      }));
  
      for (const ageInGroup of inAgeGroups) {
        const existing = Indicate2.find((item) => item.구분 === ageInGroup.key);
        if (existing) {
          existing.유입인구 = Math.round(Number(ageInGroup.value));
        } else {
          Indicate2.push({
            구분: ageInGroup.key,
            유출인구: 0,
            유입인구: ageInGroup.value,
          });
        }
      }
  
      Indicate2.sort((a, b) => {
        const indexA = ageGenOrder.indexOf(a.구분);
        const indexB = ageGenOrder.indexOf(b.구분);
        return indexA - indexB;
      });
  
      let out_max_age: string = "";
      let out_max_popul: number = -Infinity;
      let in_max_age: string = "";
      let in_max_popul: number = -Infinity;
  
      for (const [ageGroup, population] of Object.entries(inTimeBucket)) {
        const populationValue = population as number;
        if (populationValue > in_max_popul) {
          in_max_popul = populationValue;
          in_max_age = ageGroup;
        }
      }
  
      for (const [ageGroup, population] of Object.entries(outTimeBucket)) {
        const populationValue = population as number;
        if (populationValue > out_max_popul) {
          out_max_popul = populationValue;
          out_max_age = ageGroup;
        }
      }
  
      summaryMopContent5 = `성별과 연령대 중 유입 인구는 ${
        in_male >= in_feml ? "{남성}" : "{여성}"
      }과 {${in_max_age}}, 유출 인구는 ${
        out_male >= out_feml ? "{남성}" : "{여성}"
      }과 {${out_max_age}} 비중이 크게 차지했습니다.`;
      results.push({
        title: "성연령별 이동 분석",
        summary: `분석 기간 ${date} 동안 유입인구 중 더 많은 성별은 ${
          in_male >= in_feml ? "{남성}" : "{여성}"
        }({${
          in_male >= in_feml
            ? Math.round(in_male).toLocaleString()
            : Math.round(in_feml).toLocaleString()
        }}명)이며, 유출인구 중 더 많은 성별은 ${
          out_male >= out_feml ? "{남성}" : "{여성}"
        }({${
          out_male >= out_feml
            ? Math.round(out_male).toLocaleString()
            : Math.round(out_feml).toLocaleString()
        }}명)으로 나타남\n분석 기간 ${date} 동안 유입인구가 가장 많은 연령대는 {${in_max_age}}({${Math.round(
          in_max_popul
        ).toLocaleString()}}명)이며, 유출인구가 가장 많은 연령대는 {${out_max_age}}({${Math.round(
          out_max_popul
        ).toLocaleString()}}명)(으)로 나타남`,
        charts: [
          {
            name: "mopGenderData",
            indicate: Indicate1,
          },
          {
            name: "mopAgeData",
            indicate: Indicate2,
          },
        ],
      });
    }
  } else {
    const outBucket = data1.aggregations?.by_region?.buckets || [];
    const inBucket = data2?.aggregations?.by_region?.buckets || [];

    const out_male = Math.round(outBucket[0]?.male?.tot_popul_num?.value) ?? 0;
    const out_feml = Math.round(outBucket[0]?.female?.tot_popul_num?.value) ?? 0;
    const in_male = Math.round(inBucket[0]?.male?.tot_popul_num?.value) ?? 0;
    const in_feml = Math.round(inBucket[0]?.female?.tot_popul_num?.value) ?? 0;

    const outAgeGroup = new Map<string, number>();
    outAgeGroup.set("10세 미만", Math.round(outBucket[0]?.age_0?.tot_popul_num?.value))
    outAgeGroup.set("10대", Math.round(outBucket[0]?.age_10?.tot_popul_num?.value))
    outAgeGroup.set("20대", Math.round(outBucket[0]?.age_20?.tot_popul_num?.value))
    outAgeGroup.set("30대", Math.round(outBucket[0]?.age_30?.tot_popul_num?.value))
    outAgeGroup.set("40대", Math.round(outBucket[0]?.age_40?.tot_popul_num?.value))
    outAgeGroup.set("50대", Math.round(outBucket[0]?.age_50?.tot_popul_num?.value))
    outAgeGroup.set("60대", Math.round(outBucket[0]?.age_60?.tot_popul_num?.value))
    outAgeGroup.set("70대", Math.round(outBucket[0]?.age_70?.tot_popul_num?.value))
    outAgeGroup.set("80세 이상", Math.round(outBucket[0]?.age_80?.tot_popul_num?.value))

    const inAgeGroup = new Map<string, number>();
    inAgeGroup.set("10세 미만", Math.round(inBucket[0]?.age_0?.tot_popul_num?.value))
    inAgeGroup.set("10대", Math.round(inBucket[0]?.age_10?.tot_popul_num?.value))
    inAgeGroup.set("20대", Math.round(inBucket[0]?.age_20?.tot_popul_num?.value))
    inAgeGroup.set("30대", Math.round(inBucket[0]?.age_30?.tot_popul_num?.value))
    inAgeGroup.set("40대", Math.round(inBucket[0]?.age_40?.tot_popul_num?.value))
    inAgeGroup.set("50대", Math.round(inBucket[0]?.age_50?.tot_popul_num?.value))
    inAgeGroup.set("60대", Math.round(inBucket[0]?.age_60?.tot_popul_num?.value))
    inAgeGroup.set("70대", Math.round(inBucket[0]?.age_70?.tot_popul_num?.value))
    inAgeGroup.set("80세 이상", Math.round(inBucket[0]?.age_80?.tot_popul_num?.value))

    let out_max_age = "";
    let out_max_popul = -Infinity;
    let in_max_age = "";
    let in_max_popul = -Infinity;

    outAgeGroup.forEach((value, key) => {
      if (value > out_max_popul) {
        out_max_popul = value;
        out_max_age = key;
      }

      const existing = Indicate2.find(item => item.구분 === key);
      if (existing) {
        existing.유출인구 = value;
      } else {
        Indicate2.push({
          구분: key,
          유출인구: value
        });
      }
    });

    inAgeGroup.forEach((value, key)=> {
      if (value > in_max_popul) {
        in_max_popul = value;
        in_max_age = key;
      }
      const existing = Indicate2.find(item => item.구분 === key);
      if (existing) {
        existing.유입인구 = value;
      } else {
        Indicate2.push({
          구분: key,
          유입인구: value,
        })
      }
    })
    
    Indicate1.push(
      {
        구분: "남성",
        유입인구: Math.round(in_male),
        유출인구: Math.round(out_male),
      },
      {
        구분: "여성",
        유입인구: Math.round(in_feml),
        유출인구: Math.round(out_feml),
      }
    );

    summaryMopContent5 = `성별과 연령대 중 유입 인구는 ${
      in_male >= in_feml ? "{남성}" : "{여성}"
    }과 {${in_max_age}}, 유출 인구는 ${
      out_male >= out_feml ? "{남성}" : "{여성}"
    }과 {${out_max_age}} 비중이 크게 차지했습니다.`;
    results.push({
      title: "성연령별 이동 분석",
      summary: `분석 기간 ${date} 동안 유입인구 중 더 많은 성별은 ${
        in_male >= in_feml ? "{남성}" : "{여성}"
      }({${
        in_male >= in_feml
          ? Math.round(in_male).toLocaleString()
          : Math.round(in_feml).toLocaleString()
      }}명)이며, 유출인구 중 더 많은 성별은 ${
        out_male >= out_feml ? "{남성}" : "{여성}"
      }({${
        out_male >= out_feml
          ? Math.round(out_male).toLocaleString()
          : Math.round(out_feml).toLocaleString()
      }}명)으로 나타남\n분석 기간 ${date} 동안 유입인구가 가장 많은 연령대는 {${in_max_age}}({${Math.round(
        in_max_popul
      ).toLocaleString()}}명)이며, 유출인구가 가장 많은 연령대는 {${out_max_age}}({${Math.round(
        out_max_popul
      ).toLocaleString()}}명)(으)로 나타남`,
      charts: [
        {
          name: "mopGenderData",
          indicate: Indicate1,
        },
        {
          name: "mopAgeData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return { results, summaryMopContent5 };
}

export async function transMopData5(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate: any[] = [];
  let summaryMopContent6 = "";
  let summaryMopContent7 = "";
  const date = formatDate(start);
  const regionFullName = convertCDtoFullNM(Number(region));

  const outBucket = data1?.aggregations?.by_region?.buckets || [];
  const inBucket = data2?.aggregations?.by_region?.buckets || [];
  const gubun = ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const outBucket = data1[0].aggregations?.by_region?.buckets || [];
    const inBucket = data2[0].aggregations?.by_region?.buckets || [];
    for (const outItem of outBucket) {
      const outPrpsBucket = outItem?.by_prps?.buckets;
      const outKey = outItem.key;
  
      const inItem = inBucket.find(
        (inItem: any) => String(inItem.key) === String(outKey)
      );
  
      const inPrpsBucket = inItem?.by_prps?.buckets;
      let out_maxPopulNum = -Infinity;
      let out_maxPrps = "";
      let in_maxPopulNum = -Infinity;
      let in_maxPrps = "";
  
      for (let i = 0; i < 7; i++) {
        const outBucketItem = outPrpsBucket.find((bucket: any) => bucket.key === i);
        const inBucketItem = inPrpsBucket.find((bucket: any) => bucket.key === i);
  
        const out_tot_populNum = outBucketItem?.tot_popul_num?.value ?? 0
        const in_tot_populNum = inBucketItem?.tot_popul_num?.value ?? 0
  
        Indicate.push({
          구분: `${gubun[i]}`,
          유입인구: Math.round(in_tot_populNum),
          유출인구: Math.round(out_tot_populNum),
        });
  
        if (i !== 6) {
          if (out_tot_populNum > out_maxPopulNum) {
            out_maxPopulNum = out_tot_populNum;
            out_maxPrps = `${i}`;
          }
  
          if (in_tot_populNum > in_maxPopulNum) {
            in_maxPopulNum = in_tot_populNum;
            in_maxPrps = `${i}`;
          }
        }
      }
  
      summaryMopContent6 = `유입 인구의 주요 이동목적은 {${
        gubun[Number(in_maxPrps)]
      }}({${Math.round(in_maxPopulNum).toLocaleString()}})명이며, `;
      summaryMopContent7 = `유출 인구의 주요 이동목적은 {${
        gubun[Number(out_maxPrps)]
      }}({${Math.round(out_maxPopulNum).toLocaleString()}})명이며, `;
  
      results.push({
        title: "이동목적별 분석",
        summary:
          `분석 기간 ${date} 동안 유입인구의 주요 이동목적은 {${
            gubun[Number(in_maxPrps)]
          }}({${Math.round(
            in_maxPopulNum
          ).toLocaleString()}})명(으)로 나타남 (기타 제외)\n` +
          `분석 기간 ${date} 동안 유출인구의 주요 이동목적은 {${
            gubun[Number(out_maxPrps)]
          }}({${Math.round(
            out_maxPopulNum
          ).toLocaleString()}})명(으)로 나타남 (기타 제외)`,
        charts: [
          {
            name: "mopPurposeData",
            indicate: Indicate,
          },
        ],
      });
    }
  } else {
    const outBucket = data1?.aggregations?.by_region?.buckets || [];
    const inBucket = data2?.aggregations?.by_region?.buckets || [];
    let out_maxPopulNum = -Infinity;
    let out_maxPrps = "";
    let in_maxPopulNum = -Infinity;
    let in_maxPrps = "";
    
    const out_nums: number[] = [];
    const in_nums: number[] = [];
    for (let i = 0; i < 7; i++) {
      out_nums.push(Math.round(outBucket[0]?.[`p_${i}_num`]?.value) ?? 0);
      in_nums.push(Math.round(inBucket[0]?.[`p_${i}_num`]?.value) ?? 0);
    }

    for (let i = 0; i < 7; i++) {

      Indicate.push({
        구분: `${gubun[i]}`,
        유입인구: in_nums[i],
        유출인구: out_nums[i],
      });

      if (i !== 6) {
        if (out_nums[i] > out_maxPopulNum) {
          out_maxPopulNum = out_nums[i];
          out_maxPrps = `${i}`;
        }

        if (in_nums[i] > in_maxPopulNum) {
          in_maxPopulNum = in_nums[i];
          in_maxPrps = `${i}`;
        }
      }
    }

    summaryMopContent6 = `유입 인구의 주요 이동목적은 {${
      gubun[Number(in_maxPrps)]
    }}({${Math.round(in_maxPopulNum).toLocaleString()}})명이며, `;
    summaryMopContent7 = `유출 인구의 주요 이동목적은 {${
      gubun[Number(out_maxPrps)]
    }}({${Math.round(out_maxPopulNum).toLocaleString()}})명이며, `;

    results.push({
      title: "이동목적별 분석",
      summary:
        `분석 기간 ${date} 동안 유입인구의 주요 이동목적은 {${
          gubun[Number(in_maxPrps)]
        }}({${Math.round(
          in_maxPopulNum
        ).toLocaleString()}})명(으)로 나타남 (기타 제외)\n` +
        `분석 기간 ${date} 동안 유출인구의 주요 이동목적은 {${
          gubun[Number(out_maxPrps)]
        }}({${Math.round(
          out_maxPopulNum
        ).toLocaleString()}})명(으)로 나타남 (기타 제외)`,
      charts: [
        {
          name: "mopPurposeData",
          indicate: Indicate,
        },
      ],
    });
  }
  return { results, summaryMopContent6, summaryMopContent7 };
}

export async function transMopData6(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));

  let out_max_time = 0;
  let out_max_purpose = "";
  let out_max_value = 0;
  let in_max_time = 0;
  let in_max_purpose = "";
  let in_max_value = 0;
  const purposeKeys = ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"];
  let outBucket: any[] = [];
  let inBucket: any[] = [];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    outBucket = data1[0].aggregations?.by_region?.buckets || [];
    inBucket = data2[0].aggregations?.by_region?.buckets || [];
  } else {
    outBucket = data1.aggregations?.by_region?.buckets || [];
    inBucket = data2.aggregations?.by_region?.buckets || [];
  }
  for (const item of outBucket) {
    const outTimeBucket = item.by_timezn.buckets || [];
    for (const time of outTimeBucket) {
      Indicate1.push({
        구분: time.key,
        귀가: Math.round(time.mov_prps_0_num?.value) ?? 0,
        출근: Math.round(time.mov_prps_1_num?.value) ?? 0,
        등교: Math.round(time.mov_prps_2_num?.value) ?? 0,
        쇼핑: Math.round(time.mov_prps_3_num?.value) ?? 0,
        관광: Math.round(time.mov_prps_4_num?.value) ?? 0,
        병원: Math.round(time.mov_prps_5_num?.value) ?? 0,
        기타: Math.round(time.mov_prps_6_num?.value) ?? 0,
      });
    }
  }
  Indicate1.forEach((time) => {
    const maxPurposeValue = Math.max(
      time.귀가,
      time.출근,
      time.등교,
      time.쇼핑,
      time.관광,
      time.병원
    );
    const maxPurposeName =
      purposeKeys.find((purpose) => time[purpose] === maxPurposeValue) ?? "";
    if (maxPurposeValue > out_max_value) {
      out_max_time = time.구분;
      out_max_purpose = maxPurposeName;
      out_max_value = maxPurposeValue;
    }
  });
  const outtime = convertToTimeFormat(out_max_time);
  for (const item of inBucket) {
    const inTimeBucket = item.by_timezn.buckets || [];
    for (const time of inTimeBucket) {
      Indicate2.push({
        구분: time.key,
        귀가: Math.round(time.mov_prps_0_num?.value) ?? 0,
        출근: Math.round(time.mov_prps_1_num?.value) ?? 0,
        등교: Math.round(time.mov_prps_2_num?.value) ?? 0,
        쇼핑: Math.round(time.mov_prps_3_num?.value) ?? 0,
        관광: Math.round(time.mov_prps_4_num?.value) ?? 0,
        병원: Math.round(time.mov_prps_5_num?.value) ?? 0,
        기타: Math.round(time.mov_prps_6_num?.value) ?? 0,
      });
    }
  }
  Indicate2.forEach((time) => {
    const maxPurposeValue = Math.max(
      time.귀가,
      time.출근,
      time.등교,
      time.쇼핑,
      time.관광,
      time.병원
    );
    const maxPurposeName =
      purposeKeys.find((purpose) => time[purpose] === maxPurposeValue) ?? "";
    if (maxPurposeValue > in_max_value) {
      in_max_time = time.구분;
      in_max_purpose = maxPurposeName;
      in_max_value = maxPurposeValue;
    }
  });
  const intime = convertToTimeFormat(in_max_time);
  results.push({
    title: "시간대별 이동목적별 분석",
    summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많이 도착한 시간대의 주요 이동목적은 {${intime}} {${in_max_purpose}}({${in_max_value.toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}에서 유출한 인구 중 가장 많이 출발한 시간대의 주요 이동목적은 {${outtime}} {${out_max_purpose}}({${out_max_value.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
    charts: [
      {
        name: "purposeArriveTimeMoveInflowData",
        indicate: Indicate2,
      },
      {
        name: "purposeDepartTimeMoveOutflowData",
        indicate: Indicate1,
      },
    ],
  });
  return results;
}

export async function transMopData7(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const maleValues: number[] = [];
  const femaleValues: number[] = [];
  const prpsList = ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"];
  const prpsAgeList = [
    "10세 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80세 이상",
  ];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }
  
  if (region.length === 5) {
    const inSexBucket = data1[0].aggregations?.by_region?.buckets || [];
    const inAgeBucket = data2[0].aggregations?.by_region?.buckets || [];
    for (const inSexItem of inSexBucket) {
      const inKey = inSexItem.key;
      const inSexPrpsBucket = inSexItem?.by_prps?.buckets || [];
  
      const inAgeItem = inAgeBucket.find(
        (inItem: any) => String(inItem.key) === String(inKey)
      );
  
      const inAgePrpsBucket = inAgeItem?.by_prps?.buckets || [];
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          inSexPrpsBucket.find(
            (item: {
              key: number;
              by_male?: { value: number };
              by_female?: { value: number };
            }) => item.key === i
          ) || {};
  
        const maleValue = Math.round(bucket.by_male?.value ?? 0);
        const femaleValue = Math.round(bucket.by_female?.value ?? 0);
  
        maleValues.push(maleValue);
        femaleValues.push(femaleValue);
  
        Indicate1.push({
          구분: prpsList[i],
          남성: Math.round(bucket.by_male?.value ?? 0),
          여성: Math.round(bucket.by_female?.value ?? 0),
        });
      }
  
      const { maleMaxValue, maleMaxIndex, femaleMaxValue, femaleMaxIndex } =
        calculateSexMaxMinPopulation(maleValues, femaleValues);
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          inAgePrpsBucket.find(
            (item: {
              key: number;
              age_groups?: { value: Record<string, number> };
            }) => item.key === i
          ) || {};
        const key = prpsList[i];
        const ageGroups = bucket.age_groups?.value || {};
        prpsAgeList.forEach((age) => {
          const existingData = Indicate2.find((item) => item.구분 === age);
          if (existingData) {
            existingData[key] = Math.round(ageGroups[age]) || 0;
          } else {
            Indicate2.push({
              구분: age,
              [key]: Math.round(ageGroups[age]) || 0,
            });
          }
        });
      }
      const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);
  
      results.push({
        title: "성연령별 이동목적별 유입인구",
        summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 남성의 주요 이동목적은 {${
          prpsList[maleMaxIndex]
        }}({${Math.round(
          maleMaxValue
        ).toLocaleString()}}명)이며, 여성의 주요 이동목적은 {${
          prpsList[femaleMaxIndex]
        }}({${Math.round(
          femaleMaxValue
        ).toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동목적은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
        charts: [
          {
            name: "purposeGenMoveInflowData",
            indicate: Indicate1,
          },
          {
            name: "purposeAgeMoveInflowData",
            indicate: Indicate2,
          },
        ],
      });
    }
  } else {
    const inSexBucket = data1?.aggregations?.by_region?.buckets || [];
    const inAgeBucket = data2?.aggregations?.by_age?.buckets || [];
    let maxMaleNum = 0;
    let maxFemaleNum = 0;
    let maxMaleIdx = 0;
    let maxFemaleIdx = 0;
    const male_popul: number[] = [];
    const female_popul: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      male_popul.push(Math.round(inSexBucket[0]?.by_male?.[`p_${i}_num`]?.value) ?? 0);
      female_popul.push(Math.round(inSexBucket[0]?.by_female?.[`p_${i}_num`]?.value) ?? 0);
    }

    for (let i = 0; i < 7; i++) {

      Indicate1.push({
        구분: prpsList[i],
        남성: male_popul[i],
        여성: female_popul[i],
      });

      if (i !== 6) {
        if (male_popul[i] > maxMaleNum) {
          maxMaleNum = male_popul[i];
          maxMaleIdx = i;
        }

        if (female_popul[i] > maxFemaleNum) {
          maxFemaleNum = female_popul[i];
          maxFemaleIdx = i;
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const bucket = inAgeBucket.find((item: {key: number;}) => item.key === i * 10)
      Indicate2.push({
        구분: prpsAgeList[i],
        귀가: Math.round(bucket.p_0_num.value),
        출근: Math.round(bucket.p_1_num.value),
        등교: Math.round(bucket.p_2_num.value),
        쇼핑: Math.round(bucket.p_3_num.value),
        관광: Math.round(bucket.p_4_num.value),
        병원: Math.round(bucket.p_5_num.value),
        기타: Math.round(bucket.p_6_num.value),
      });
    }
    const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);

    results.push({
      title: "성연령별 이동목적별 유입인구",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 남성의 주요 이동목적은 {${
        prpsList[maxMaleIdx]
      }}({${Math.round(
        maxMaleNum
      ).toLocaleString()}}명)이며, 여성의 주요 이동목적은 {${
        prpsList[maxFemaleIdx]
      }}({${Math.round(
        maxFemaleNum
      ).toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동목적은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
      charts: [
        {
          name: "purposeGenMoveInflowData",
          indicate: Indicate1,
        },
        {
          name: "purposeAgeMoveInflowData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return results;
}

export async function transMopData8(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const maleValues: number[] = [];
  const femaleValues: number[] = [];
  const prpsList = ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"];
  const prpsAgeList = [
    "10세 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80세 이상",
  ];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const outSexBucket = data1[0].aggregations?.by_region?.buckets || [];
    const outAgeBucket = data2[0].aggregations?.by_region?.buckets || [];
  
    for (const outSexItem of outSexBucket) {
      const outKey = outSexItem.key;
      const outSexPrpsBucket = outSexItem?.by_prps?.buckets || [];
  
      const outAgeItem = outAgeBucket.find(
        (outItem: any) => String(outItem.key) === String(outKey)
      );
  
      const outAgePrpsBucket = outAgeItem?.by_prps?.buckets || [];
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          outSexPrpsBucket.find(
            (item: {
              key: number;
              by_male?: { value: number };
              by_female?: { value: number };
            }) => item.key === i
          ) || {};
  
        const maleValue = Math.round(bucket.by_male?.value ?? 0);
        const femaleValue = Math.round(bucket.by_female?.value ?? 0);
  
        maleValues.push(maleValue);
        femaleValues.push(femaleValue);
  
        Indicate1.push({
          구분: prpsList[i],
          남성: Math.round(bucket.by_male?.value ?? 0),
          여성: Math.round(bucket.by_female?.value ?? 0),
        });
      }
  
      const { maleMaxValue, maleMaxIndex, femaleMaxValue, femaleMaxIndex } =
        calculateSexMaxMinPopulation(maleValues, femaleValues);
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          outAgePrpsBucket.find(
            (item: {
              key: number;
              age_groups?: { value: Record<string, number> };
            }) => item.key === i
          ) || {};
        const key = prpsList[i];
        const ageGroups = bucket.age_groups?.value || {};
        prpsAgeList.forEach((age) => {
          const existingData = Indicate2.find((item) => item.구분 === age);
          if (existingData) {
            existingData[key] = Math.round(ageGroups[age]) || 0;
          } else {
            Indicate2.push({
              구분: age,
              [key]: Math.round(ageGroups[age]) || 0,
            });
          }
        });
      }
  
      const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);
  
      results.push({
        title: "성연령별 이동목적별 유출인구",
        summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 남성의 주요 이동목적은 {${
          prpsList[maleMaxIndex]
        }}({${Math.round(
          maleMaxValue
        ).toLocaleString()}}명)이며, 여성의 주요 이동목적은 {${
          prpsList[femaleMaxIndex]
        }}({${Math.round(
          femaleMaxValue
        ).toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동목적은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
        charts: [
          {
            name: "purposeGenMoveOutflowData",
            indicate: Indicate1,
          },
          {
            name: "purposeAgeMoveOutflowData",
            indicate: Indicate2,
          },
        ],
      });
    }
  } else {
    const outSexBucket = data1?.aggregations?.by_region?.buckets || [];
    const outAgeBucket = data2?.aggregations?.by_age?.buckets || [];
    let maxMaleNum = 0;
    let maxFemaleNum = 0;
    let maxMaleIdx = 0;
    let maxFemaleIdx = 0;
    const male_popul: number[] = [];
    const female_popul: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      male_popul.push(Math.round(outSexBucket[0]?.by_male?.[`p_${i}_num`]?.value) ?? 0);
      female_popul.push(Math.round(outSexBucket[0]?.by_female?.[`p_${i}_num`]?.value) ?? 0);
    }

    for (let i = 0; i < 7; i++) {

      Indicate1.push({
        구분: prpsList[i],
        남성: male_popul[i],
        여성: female_popul[i],
      });

      if (i !== 6) {
        if (male_popul[i] > maxMaleNum) {
          maxMaleNum = male_popul[i];
          maxMaleIdx = i;
        }

        if (female_popul[i] > maxFemaleNum) {
          maxFemaleNum = female_popul[i];
          maxFemaleIdx = i;
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const bucket = outAgeBucket.find((item: {key: number;}) => item.key === i * 10)
      Indicate2.push({
        구분: prpsAgeList[i],
        귀가: Math.round(bucket.p_0_num.value),
        출근: Math.round(bucket.p_1_num.value),
        등교: Math.round(bucket.p_2_num.value),
        쇼핑: Math.round(bucket.p_3_num.value),
        관광: Math.round(bucket.p_4_num.value),
        병원: Math.round(bucket.p_5_num.value),
        기타: Math.round(bucket.p_6_num.value),
      });
    }
    const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);

    results.push({
      title: "성연령별 이동목적별 유출인구",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 남성의 주요 이동목적은 {${
        prpsList[maxMaleIdx]
      }}({${Math.round(
        maxMaleNum
      ).toLocaleString()}}명)이며, 여성의 주요 이동목적은 {${
        prpsList[maxFemaleIdx]
      }}({${Math.round(
        maxFemaleNum
      ).toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동목적은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
      charts: [
        {
          name: "purposeGenMoveOutflowData",
          indicate: Indicate1,
        },
        {
          name: "purposeAgeMoveOutflowData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return results;
}

export async function transMopData9(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));
  let summaryMopContent8 = "";
  let summaryMopContent9 = "";

  const outBucket = data1?.aggregations?.by_region?.buckets || [];
  const inBucket = data2?.aggregations?.by_region?.buckets || [];
  const gubun = [
    "차량",
    "노선버스",
    "지하철",
    "도보",
    "고속버스",
    "기차",
    "항공",
    "기타",
  ];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const outBucket = data1[0].aggregations?.by_region?.buckets || [];
    const inBucket = data2[0].aggregations?.by_region?.buckets || [];
    for (const outItem of outBucket) {
      const outWayBucket = outItem?.by_way?.buckets;
      const outKey = outItem.key;
  
      const inItem = inBucket.find(
        (inItem: any) => String(inItem.key) === String(outKey)
      );
  
      const inWayBucket = inItem?.by_way?.buckets;
      let out_maxPopulNum = -Infinity;
      let out_maxPrps = "";
      let in_maxPopulNum = -Infinity;
      let in_maxPrps = "";
  
      for (let i = 0; i < 8; i++) {
        const out_tot_populNum = outWayBucket[i]?.tot_popul_num?.value ?? 0;
        const in_tot_populNum = inWayBucket[i]?.tot_popul_num?.value ?? 0;
  
        Indicate.push({
          구분: `${gubun[i]}`,
          유입인구: Math.round(in_tot_populNum),
          유출인구: Math.round(out_tot_populNum),
        });
  
        if (i !== 7) {
          if (out_tot_populNum > out_maxPopulNum) {
            out_maxPopulNum = out_tot_populNum;
            out_maxPrps = `${i}`;
          }
  
          if (in_tot_populNum > in_maxPopulNum) {
            in_maxPopulNum = in_tot_populNum;
            in_maxPrps = `${i}`;
          }
        }
      }
      const {
        maxInboundGuBun,
        maxInboundValue,
        maxOutboundGuBun,
        maxOutboundValue,
      } = maxWayIndicate(Indicate);
  
      summaryMopContent8 = `주요 이동 수단은 {${maxInboundGuBun}}으로 나타났습니다.`;
      summaryMopContent9 = `주요 이동 수단은 {${maxOutboundGuBun}}으로 나타났습니다.`;
  
      results.push({
        title: "이동수단별 분석",
        summary: `분석 기간 ${date} 동안 기타를 제외한 유입인구의 주요 이동수단은 {${maxInboundGuBun}}({${maxInboundValue.toLocaleString()}}명)(으)로 나타남\n분석 기간 ${date} 동안 기타를 제외한 유출인구의 주요 이동수단은 {${maxOutboundGuBun}}({${maxOutboundValue.toLocaleString()}}명)(으)로 나타남`,
        charts: [
          {
            name: "mopTransData",
            indicate: Indicate,
          },
        ],
      });
    }
  } else {
    const outBucket = data1?.aggregations?.by_region?.buckets || [];
    const inBucket = data2?.aggregations?.by_region?.buckets || [];
    let out_maxPopulNum = -Infinity;
    let out_maxPrps = "";
    let in_maxPopulNum = -Infinity;
    let in_maxPrps = "";

    const out_popul: number[] = [];
    const in_popul: number[] = [];
    
    for (let i = 0; i < 8; i++) {
      out_popul.push(Math.round(outBucket[0]?.[`w_${i}_num`]?.value) ?? 0);
      in_popul.push(Math.round(inBucket[0]?.[`w_${i}_num`]?.value) ?? 0);

      Indicate.push({
        구분: `${gubun[i]}`,
        유입인구: Math.round(out_popul[i]),
        유출인구: Math.round(in_popul[i]),
      });

      if (i !== 7) {
        if (out_popul[i] > out_maxPopulNum) {
          out_maxPopulNum = out_popul[i];
          out_maxPrps = `${i}`;
        }

        if (in_popul[i] > in_maxPopulNum) {
          in_maxPopulNum = in_popul[i];
          in_maxPrps = `${i}`;
        }
      }
    }
    const {
      maxInboundGuBun,
      maxInboundValue,
      maxOutboundGuBun,
      maxOutboundValue,
    } = maxWayIndicate(Indicate);

    summaryMopContent8 = `주요 이동 수단은 {${maxInboundGuBun}}으로 나타났습니다.`;
    summaryMopContent9 = `주요 이동 수단은 {${maxOutboundGuBun}}으로 나타났습니다.`;

    results.push({
      title: "이동수단별 분석",
      summary: `분석 기간 ${date} 동안 기타를 제외한 유입인구의 주요 이동수단은 {${maxInboundGuBun}}({${maxInboundValue.toLocaleString()}}명)(으)로 나타남\n분석 기간 ${date} 동안 기타를 제외한 유출인구의 주요 이동수단은 {${maxOutboundGuBun}}({${maxOutboundValue.toLocaleString()}}명)(으)로 나타남`,
      charts: [
        {
          name: "mopTransData",
          indicate: Indicate,
        },
      ],
    });

  }
  return { results, summaryMopContent8, summaryMopContent9 };
}

export async function transMopData10(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));
  let out_max_time = 0;
  let out_max_way = "";
  let out_max_value = 0;
  let in_max_time = 0;
  let in_max_way = "";
  let in_max_value = 0;
  const wayKeys = [
    "차량",
    "노선버스",
    "지하철",
    "도보",
    "고속버스",
    "기차",
    "항공",
    "기타",
  ];

  if (typeof region === "string" && region.length === 5) {
    const outBucket = data1[0].aggregations?.by_region?.buckets || [];
    const inBucket = data2[0].aggregations?.by_region?.buckets || [];

    for (const item of outBucket) {
      const outTimeBucket = item.by_timezn.buckets || [];
      for (const time of outTimeBucket) {
        Indicate1.push({
          구분: time.key,
          차량: Math.round(time.mov_way_0_num?.value) ?? 0,
          노선버스: Math.round(time.mov_way_1_num?.value) ?? 0,
          지하철: Math.round(time.mov_way_2_num?.value) ?? 0,
          도보: Math.round(time.mov_way_3_num?.value) ?? 0,
          고속버스: Math.round(time.mov_way_4_num?.value) ?? 0,
          기차: Math.round(time.mov_way_5_num?.value) ?? 0,
          항공: Math.round(time.mov_way_6_num?.value) ?? 0,
          기타: Math.round(time.mov_way_7_num?.value) ?? 0,
        });
      }
    }

    Indicate1.forEach((time) => {
      const maxWayValue = Math.max(
        time.차량,
        time.노선버스,
        time.지하철,
        time.도보,
        time.고속버스,
        time.기차,
        time.항공
      );

      const maxWayName = wayKeys.find((way) => time[way] === maxWayValue) ?? "";

      if (maxWayValue > out_max_value) {
        out_max_time = time.구분;
        out_max_way = maxWayName;
        out_max_value = maxWayValue;
      }
    });
    const outtime = convertToTimeFormat(out_max_time);

    for (const item of inBucket) {
      const inTimeBucket = item.by_timezn.buckets || [];
      for (const time of inTimeBucket) {
        Indicate2.push({
          구분: time.key,
          차량: Math.round(time.mov_way_0_num?.value) ?? 0,
          노선버스: Math.round(time.mov_way_1_num?.value) ?? 0,
          지하철: Math.round(time.mov_way_2_num?.value) ?? 0,
          도보: Math.round(time.mov_way_3_num?.value) ?? 0,
          고속버스: Math.round(time.mov_way_4_num?.value) ?? 0,
          기차: Math.round(time.mov_way_5_num?.value) ?? 0,
          항공: Math.round(time.mov_way_6_num?.value) ?? 0,
          기타: Math.round(time.mov_way_7_num?.value) ?? 0,
        });
      }
    }

    Indicate2.forEach((time) => {
      const maxWayValue = Math.max(
        time.차량,
        time.노선버스,
        time.지하철,
        time.도보,
        time.고속버스,
        time.기차,
        time.항공
      );

      const maxWayName = wayKeys.find((way) => time[way] === maxWayValue) ?? "";

      if (maxWayValue > in_max_value) {
        in_max_time = time.구분;
        in_max_way = maxWayName;
        in_max_value = maxWayValue;
      }
    });
    const intime = convertToTimeFormat(in_max_time);
    results.push({
      title: "시간대별 이동수단별 분석",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많이 도착한 시간대의 주요 이동수단은 {${intime}} {${in_max_way}}({${in_max_value.toLocaleString()}}명)(으)로 나타남\n분석 기간 ${date} 동안 {${regionFullName}}에서 유출한 인구 중 가장 많이 출발한 시간대의 주요 이동수단은 {${outtime}} {${out_max_way}}({${out_max_value.toLocaleString()}}명)(으)로 나타남`,
      charts: [
        {
          name: "transArriveTimeMoveInflowData",
          indicate: Indicate2,
        },
        {
          name: "transDepartTimeMoveOutflowData",
          indicate: Indicate1,
        },
      ],
    });
  } else {
    const outBucket = data1?.aggregations?.by_region?.buckets || [];
    const inBucket = data2?.aggregations?.by_region?.buckets || [];

    for (const item of outBucket) {
      const outTimeBucket = item?.by_timezn?.buckets || [];
      for (const time of outTimeBucket) {
        Indicate1.push({
          구분: time.key,
          차량: Math.round(time.way_0_num?.value) ?? 0,
          노선버스: Math.round(time.way_1_num?.value) ?? 0,
          지하철: Math.round(time.way_2_num?.value) ?? 0,
          도보: Math.round(time.way_3_num?.value) ?? 0,
          고속버스: Math.round(time.way_4_num?.value) ?? 0,
          기차: Math.round(time.way_5_num?.value) ?? 0,
          항공: Math.round(time.way_6_num?.value) ?? 0,
          기타: Math.round(time.way_7_num?.value) ?? 0,
        });
      }
    }

    Indicate1.forEach((time) => {
      const maxWayValue = Math.max(
        time.차량,
        time.노선버스,
        time.지하철,
        time.도보,
        time.고속버스,
        time.기차,
        time.항공
      );

      const maxWayName = wayKeys.find((way) => time[way] === maxWayValue) ?? "";

      if (maxWayValue > out_max_value) {
        out_max_time = time.구분;
        out_max_way = maxWayName;
        out_max_value = maxWayValue;
      }
    });
    const outtime = convertToTimeFormat(out_max_time);

    for (const item of inBucket) {
      const inTimeBucket = item.by_timezn.buckets || [];
      for (const time of inTimeBucket) {
        Indicate2.push({
          구분: time.key,
          차량: Math.round(time.way_0_num?.value) ?? 0,
          노선버스: Math.round(time.way_1_num?.value) ?? 0,
          지하철: Math.round(time.way_2_num?.value) ?? 0,
          도보: Math.round(time.way_3_num?.value) ?? 0,
          고속버스: Math.round(time.way_4_num?.value) ?? 0,
          기차: Math.round(time.way_5_num?.value) ?? 0,
          항공: Math.round(time.way_6_num?.value) ?? 0,
          기타: Math.round(time.way_7_num?.value) ?? 0,
        });
      }
    }

    Indicate2.forEach((time) => {
      const maxWayValue = Math.max(
        time.차량,
        time.노선버스,
        time.지하철,
        time.도보,
        time.고속버스,
        time.기차,
        time.항공
      );

      const maxWayName = wayKeys.find((way) => time[way] === maxWayValue) ?? "";

      if (maxWayValue > in_max_value) {
        in_max_time = time.구분;
        in_max_way = maxWayName;
        in_max_value = maxWayValue;
      }
    });
    const intime = convertToTimeFormat(in_max_time);

    results.push({
      title: "시간대별 이동수단별 분석",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많이 도착한 시간대의 주요 이동수단은 {${intime}} {${in_max_way}}({${in_max_value.toLocaleString()}}명)(으)로 나타남\n분석 기간 ${date} 동안 {${regionFullName}}에서 유출한 인구 중 가장 많이 출발한 시간대의 주요 이동수단은 {${outtime}} {${out_max_way}}({${out_max_value.toLocaleString()}}명)(으)로 나타남`,
      charts: [
        {
          name: "transArriveTimeMoveInflowData",
          indicate: Indicate2,
        },
        {
          name: "transDepartTimeMoveOutflowData",
          indicate: Indicate1,
        },
      ],
    });
  }
  return results;
}

export async function transMopData11(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const maleValues: number[] = [];
  const femaleValues: number[] = [];
  const wayList = [
    "차량",
    "노선버스",
    "지하철",
    "도보",
    "고속버스",
    "기차",
    "항공",
    "기타",
  ];
  const wayAgeList = [
    "10세 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80세 이상",
  ];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const inSexBucket = data2[0].aggregations?.by_region?.buckets || [];
    const inAgeBucket = data1[0].aggregations?.by_region?.buckets || [];
  
    for (const inSexItem of inSexBucket) {
      const inKey = inSexItem.key;
      const inSexWayBucket = inSexItem?.by_way?.buckets || [];
  
      const inAgeItem = inAgeBucket.find(
        (inAgeItem: any) => String(inAgeItem.key) === String(inKey)
      );
  
      const inAgeWayBucket = inAgeItem?.by_way?.buckets || [];
  
      for (let i = 0; i < 8; i++) {
        const bucket =
          inSexWayBucket.find(
            (item: {
              key: number;
              by_male?: { value: number };
              by_female?: { value: number };
            }) => item.key === i
          ) || {};
  
        const maleValue = Math.round(bucket.by_male?.value ?? 0);
        const femaleValue = Math.round(bucket.by_female?.value ?? 0);
  
        maleValues.push(maleValue);
        femaleValues.push(femaleValue);
  
        Indicate1.push({
          구분: wayList[i],
          남성: Math.round(bucket.by_male?.value ?? 0),
          여성: Math.round(bucket.by_female?.value ?? 0),
        });
      }
  
      const { maleMaxValue, maleMaxIndex, femaleMaxValue, femaleMaxIndex } =
        calculateSexMaxMinPopulation(maleValues, femaleValues);
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          inAgeWayBucket.find(
            (item: {
              key: number;
              age_groups?: { value: Record<string, number> };
            }) => item.key === i
          ) || {};
        const key = wayList[i];
        const ageGroups = bucket.age_groups?.value || {};
        wayAgeList.forEach((age) => {
          const existingData = Indicate2.find((item) => item.구분 === age);
          if (existingData) {
            existingData[key] = Math.round(ageGroups[age]) || 0;
          } else {
            Indicate2.push({
              구분: age,
              [key]: Math.round(ageGroups[age]) || 0,
            });
          }
        });
      }
  
      const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);
  
      results.push({
        title: "성연령별 이동수단별 유입인구",
        summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 남성의 주요 이동수단은 {${
          wayList[maleMaxIndex]
        }}({${maleMaxValue.toLocaleString()}}명)이며, 여성의 주요 이동수단은 {${
          wayList[femaleMaxIndex]
        }}({${femaleMaxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동수단은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
        charts: [
          {
            name: "transGenMoveInflowData",
            indicate: Indicate1,
          },
          {
            name: "transAgeMoveInflowData",
            indicate: Indicate2,
          },
        ],
      });
    }
  } else {
    const inSexBucket = data2?.aggregations?.by_region?.buckets || [];
    const inAgeBucket = data1?.aggregations?.by_age?.buckets || [];
    let maxMaleNum = 0;
    let maxFemaleNum = 0;
    let maxMaleIdx = 0;
    let maxFemaleIdx = 0;
    const male_popul: number[] = [];
    const female_popul: number[] = [];
    
    for (let i = 0; i < 8; i++) {
      male_popul.push(Math.round(inSexBucket[0]?.by_male?.[`w_${i}_num`]?.value) ?? 0);
      female_popul.push(Math.round(inSexBucket[0]?.by_female?.[`w_${i}_num`]?.value) ?? 0);
    }

    for (let i = 0; i < 8; i++) {

      Indicate1.push({
        구분: wayList[i],
        남성: male_popul[i],
        여성: female_popul[i],
      });

      if (i !== 7) {
        if (male_popul[i] > maxMaleNum) {
          maxMaleNum = male_popul[i];
          maxMaleIdx = i;
        }

        if (female_popul[i] > maxFemaleNum) {
          maxFemaleNum = female_popul[i];
          maxFemaleIdx = i;
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const bucket = inAgeBucket.find((item: {key: number;}) => item.key === i * 10)
      Indicate2.push({
        구분: wayAgeList[i],
        차량: Math.round(bucket.way_0_num.value),
        노선버스: Math.round(bucket.way_1_num.value),
        지하철: Math.round(bucket.way_2_num.value),
        도보: Math.round(bucket.way_3_num.value),
        고속버스: Math.round(bucket.way_4_num.value),
        기차: Math.round(bucket.way_5_num.value),
        항공: Math.round(bucket.way_6_num.value),
        기타: Math.round(bucket.way_7_num.value),
      });
    }
    const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);

    results.push({
      title: "성연령별 이동수단별 유입인구",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 남성의 주요 이동수단은 {${
        wayList[maxMaleIdx]
      }}({${maxMaleNum.toLocaleString()}}명)이며, 여성의 주요 이동수단은 {${
        wayList[maxFemaleIdx]
      }}({${maxFemaleNum.toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동수단은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
      charts: [
        {
          name: "transGenMoveInflowData",
          indicate: Indicate1,
        },
        {
          name: "transAgeMoveInflowData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return results;
}

export async function transMopData12(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const maleValues: number[] = [];
  const femaleValues: number[] = [];
  const wayList = [
    "차량",
    "노선버스",
    "지하철",
    "도보",
    "고속버스",
    "기차",
    "항공",
    "기타",
  ];
  const wayAgeList = [
    "10세 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80세 이상",
  ];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 5) {
    const outSexBucket = data2[0].aggregations?.by_region?.buckets || [];
    const outAgeBucket = data1[0].aggregations?.by_region?.buckets || [];
  
    for (const outSexItem of outSexBucket) {
      const outKey = outSexItem.key;
      const outSexWayBucket = outSexItem?.by_way?.buckets || [];
  
      const outAgeItem = outAgeBucket.find(
        (inAgeItem: any) => String(inAgeItem.key) === String(outKey)
      );
  
      const outAgeWayBucket = outAgeItem?.by_way?.buckets || [];
  
      for (let i = 0; i < 8; i++) {
        const bucket =
          outSexWayBucket.find(
            (item: {
              key: number;
              by_male?: { value: number };
              by_female?: { value: number };
            }) => item.key === i
          ) || {};
  
        const maleValue = Math.round(bucket.by_male?.value ?? 0);
        const femaleValue = Math.round(bucket.by_female?.value ?? 0);
  
        maleValues.push(maleValue);
        femaleValues.push(femaleValue);
  
        Indicate1.push({
          구분: wayList[i],
          남성: Math.round(bucket.by_male?.value ?? 0),
          여성: Math.round(bucket.by_female?.value ?? 0),
        });
      }
  
      const { maleMaxValue, maleMaxIndex, femaleMaxValue, femaleMaxIndex } =
        calculateSexMaxMinPopulation(maleValues, femaleValues);
  
      for (let i = 0; i < 7; i++) {
        const bucket =
          outAgeWayBucket.find(
            (item: {
              key: number;
              age_groups?: { value: Record<string, number> };
            }) => item.key === i
          ) || {};
        const key = wayList[i];
        const ageGroups = bucket.age_groups?.value || {};
        wayAgeList.forEach((age) => {
          const existingData = Indicate2.find((item) => item.구분 === age);
          if (existingData) {
            existingData[key] = Math.round(ageGroups[age]) || 0;
          } else {
            Indicate2.push({
              구분: age,
              [key]: Math.round(ageGroups[age]) || 0,
            });
          }
        });
      }
      const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);
  
      results.push({
        title: "성연령별 이동수단별 유출인구",
        summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 남성의 주요 이동수단은 {${
          wayList[maleMaxIndex]
        }}({${maleMaxValue.toLocaleString()}}명)이며, 여성의 주요 이동수단은 {${
          wayList[femaleMaxIndex]
        }}({${femaleMaxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유출한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동수단은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
        charts: [
          {
            name: "transGenMoveOutflowData",
            indicate: Indicate1,
          },
          {
            name: "transAgeMoveOutflowData",
            indicate: Indicate2,
          },
        ],
      });
    }
  } else {
    const outSexBucket = data2?.aggregations?.by_region?.buckets || [];
    const outAgeBucket = data1?.aggregations?.by_age?.buckets || [];
    let maxMaleNum = 0;
    let maxFemaleNum = 0;
    let maxMaleIdx = 0;
    let maxFemaleIdx = 0;
    const male_popul: number[] = [];
    const female_popul: number[] = [];
    
    for (let i = 0; i < 8; i++) {
      male_popul.push(Math.round(outSexBucket[0]?.by_male?.[`w_${i}_num`]?.value) ?? 0);
      female_popul.push(Math.round(outSexBucket[0]?.by_female?.[`w_${i}_num`]?.value) ?? 0);
    }

    for (let i = 0; i < 8; i++) {

      Indicate1.push({
        구분: wayList[i],
        남성: male_popul[i],
        여성: female_popul[i],
      });

      if (i !== 7) {
        if (male_popul[i] > maxMaleNum) {
          maxMaleNum = male_popul[i];
          maxMaleIdx = i;
        }

        if (female_popul[i] > maxFemaleNum) {
          maxFemaleNum = female_popul[i];
          maxFemaleIdx = i;
        }
      }
    }

    for (let i = 0; i < 9; i++) {
      const bucket = outAgeBucket.find((item: {key: number;}) => item.key === i * 10)
      Indicate2.push({
        구분: wayAgeList[i],
        차량: Math.round(bucket.way_0_num.value),
        노선버스: Math.round(bucket.way_1_num.value),
        지하철: Math.round(bucket.way_2_num.value),
        도보: Math.round(bucket.way_3_num.value),
        고속버스: Math.round(bucket.way_4_num.value),
        기차: Math.round(bucket.way_5_num.value),
        항공: Math.round(bucket.way_6_num.value),
        기타: Math.round(bucket.way_7_num.value),
      });
    }
    const { maxValue, maxGuBun, maxCategory } = maxValueinIndicate(Indicate2);

    results.push({
      title: "성연령별 이동수단별 유입인구",
      summary: `분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 남성의 주요 이동수단은 {${
        wayList[maxMaleIdx]
      }}({${maxMaleNum.toLocaleString()}}명)이며, 여성의 주요 이동수단은 {${
        wayList[maxFemaleIdx]
      }}({${maxFemaleNum.toLocaleString()}}명)(으)로 나타남 (기타 제외)\n분석 기간 ${date} 동안 {${regionFullName}}으로 유입한 인구 중 가장 많은 연령대인 {${maxGuBun}}의 주요 이동수단은 {${maxCategory}}({${maxValue.toLocaleString()}}명)(으)로 나타남 (기타 제외)`,
      charts: [
        {
          name: "transGenMoveInflowData",
          indicate: Indicate1,
        },
        {
          name: "transAgeMoveInflowData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return results;
}
