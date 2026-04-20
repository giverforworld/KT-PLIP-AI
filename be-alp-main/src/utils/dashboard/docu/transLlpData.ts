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

import { convertCDtoNM, convertCDtoFullNM } from "@/helpers/convertNM";
import {
  formatDate,
  chartFormatDate,
  convertToTimeFormat,
  chartFormatSlashDate,
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
  countWeekendAndHolidays,
  rankandratioValue,
  rankandratiovalue1,
} from "../calcList";
import { getHolidays } from "@/utils/holidays";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";

export async function transLlpData(
  data: any,
  start: string,
  region: string,
  prevMonth: string,
  lastYear: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const date = formatDate(start);
  const present = chartFormatDate(start);
  const prev_month = chartFormatDate(prevMonth);
  const last_year = chartFormatDate(lastYear);
  const regionFullName = await convertCDtoFullNM(Number(region));
  let summaryLlpContent = "";

  const presentValue =
    data[0].present.tot_popul_num.value ?? 0;
  const prevValue =
    data[0].prev.tot_popul_num.value ?? 0;
  const lastValue = data[0].last.tot_popul_num.value ?? 0;

  const prevRatio = calculatePrevRatio(presentValue, prevValue);
  const lastRatio = calculateLastRatio(presentValue, lastValue);

  Indicate1.push({
    구분: last_year,
    체류인구: Math.round(lastValue),
  });

  Indicate1.push({
    구분: present,
    체류인구: Math.round(presentValue),
  });

  Indicate2.push({
    구분: prev_month,
    체류인구: Math.round(prevValue),
  });

  Indicate2.push({
    구분: present,
    체류인구: Math.round(presentValue),
  });

  summaryLlpContent = `{${regionFullName}}의 체류인구는 총 {${Math.round(presentValue).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
    lastRatio).toFixed(1).toLocaleString()
  )}}% {${lastRatio >= 0 ? "증가" : "감소"}}했으며, 전월 대비 {${parseFloat(Math.abs(
    prevRatio).toFixed(1).toLocaleString()
  )}}% {${prevRatio >= 0 ? "증가" : "감소"}}했습니다.`;
  results.push({
    title: "전년/전월 동기 대비 비교 분석",
    summary: `분석 기간 ${date}을 기준으로 {${regionFullName}}의 체류인구는 {${Math.round(presentValue).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
      lastRatio).toFixed(1).toLocaleString()
    )}}% {${
      lastRatio >= 0 ? "증가" : "감소"
    }}하였으며, 전월 대비 유입인구는 {${parseFloat(Math.abs(
      prevRatio).toFixed(1).toLocaleString()
    )}}% {${prevRatio >= 0 ? "증가" : "감소"}}한 것으로 나타남`,
    charts: [
      {
        name: "llpPreYMonthData",
        indicate: Indicate1,
      },
      {
        name: "llpPremonthData",
        indicate: Indicate2,
      },
    ],
  });
  return { results, summaryLlpContent };
}

export async function transLlpData1(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const RegionShortName = await convertCDtoNM(region);
  let summaryLlpContent1 = "";
  const date = formatDate(start);
  let ratio = 0;

  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const { weekendandholidayCount, weekdayCount } = countWeekendAndHolidays(
    convertStart.start,
    convertStart.end,
    holidays
  );

  const week = Math.round(
    data?.aggregations?.by_holiday?.buckets?.weekday?.tot_sum?.value ?? 0
  );
  const weekend = Math.round(
    data?.aggregations?.by_holiday?.buckets?.weekend?.tot_sum?.value ?? 0
  );

  const weekAvg = Math.round(week / weekdayCount);
  const weekendAvg = Math.round(weekend / weekendandholidayCount);
  if (weekAvg >= weekendAvg) {
    ratio = ((weekAvg - weekendAvg) / weekendAvg) * 100;
  } else {
    ratio = ((weekendAvg - weekAvg) / weekAvg) * 100;
  }

  let week_ratio = (week / (week + weekend)) * 100;
  let weekend_ratio = (weekend / (week + weekend)) * 100;
  week_ratio = parseFloat(week_ratio.toFixed(1));
  weekend_ratio = parseFloat(weekend_ratio.toFixed(1));
  let sum_ratio = parseFloat(Math.abs((((weekendAvg - weekAvg) / weekAvg) * 100)).toFixed(1))

  Indicate1.push({
    구분: "평일",
    체류인구: weekAvg,
  });

  Indicate1.push({
    구분: "휴일",
    체류인구: weekendAvg,
  });

  Indicate2.push({
    구분: RegionShortName,
    평일: week_ratio,
    휴일: weekend_ratio,
  });

  summaryLlpContent1 = `체류인구는 평일 평균 {${weekAvg.toLocaleString()}}명, 휴일 평균 {${weekendAvg.toLocaleString()}}명으로, {${
    weekAvg >= weekendAvg ? "평일" : "휴일"
  }}에 더 많은 체류를 보였습니다.`;
  results.push({
    title: "평일/휴일별 체류인구",
    summary: `분석 기간 ${date} 동안 체류인구는 평일에 평균 {${weekAvg.toLocaleString()}}명이며, 휴일에 평균 {${weekendAvg.toLocaleString()}}명으로
      전체 대비 평일 평균 체류인구 비중은 휴일에 비해 약{${sum_ratio}%} 차이 납니다.
    `,
    charts: [
      {
        name: "llpHourWeekData",
        indicate: Indicate1,
      },
      {
        name: "llpHourWeekPerData",
        indicate: Indicate2,
      },
    ],
  });
  return { results, summaryLlpContent1 };
}

export async function transLlpData2(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];
  let summaryLlpContent2 = "";
  const date = formatDate(start);
  const RegionFullName = await convertCDtoFullNM(Number(region));
  const Item = data?.aggregations;
  const male = Math.round(Item.total_male_population.value);
  const female = Math.round(Item.total_feml_population.value);
  const maleratio = (male / (male + female)) * 100;
  const femaleratio = (female / (male + female)) * 100;
  let maxPopulation = 0;
  let maxAgeGroup = "";

  const ageGroups = [
    {
      구분: "10세 미만",
      남성: Math.round(Item.total_male_00_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_00_popul_num?.value ?? 0),
    },
    {
      구분: "10~14세",
      남성: Math.round(Item.total_male_10_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_10_popul_num?.value ?? 0),
    },
    {
      구분: "15~19세",
      남성: Math.round(Item.total_male_15_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_15_popul_num?.value ?? 0),
    },
    {
      구분: "20~24세",
      남성: Math.round(Item.total_male_20_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_20_popul_num?.value ?? 0),
    },
    {
      구분: "25~29세",
      남성: Math.round(Item.total_male_25_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_25_popul_num?.value ?? 0),
    },
    {
      구분: "30~34세",
      남성: Math.round(Item.total_male_30_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_30_popul_num?.value ?? 0),
    },
    {
      구분: "35~39세",
      남성: Math.round(Item.total_male_35_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_35_popul_num?.value ?? 0),
    },
    {
      구분: "40~44세",
      남성: Math.round(Item.total_male_40_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_40_popul_num?.value ?? 0),
    },
    {
      구분: "45~49세",
      남성: Math.round(Item.total_male_45_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_45_popul_num?.value ?? 0),
    },
    {
      구분: "50~54세",
      남성: Math.round(Item.total_male_50_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_50_popul_num?.value ?? 0),
    },
    {
      구분: "55~59세",
      남성: Math.round(Item.total_male_55_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_55_popul_num?.value ?? 0),
    },
    {
      구분: "60~64세",
      남성: Math.round(Item.total_male_60_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_60_popul_num?.value ?? 0),
    },
    {
      구분: "65~69세",
      남성: Math.round(Item.total_male_65_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_65_popul_num?.value ?? 0),
    },
    {
      구분: "70~74세",
      남성: Math.round(Item.total_male_70_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_70_popul_num?.value ?? 0),
    },
    {
      구분: "75~79세",
      남성: Math.round(Item.total_male_75_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_75_popul_num?.value ?? 0),
    },
    {
      구분: "80세 이상",
      남성: Math.round(Item.total_male_80_popul_num?.value ?? 0),
      여성: Math.round(Item.total_feml_80_popul_num?.value ?? 0),
    },
  ];

  ageGroups.forEach((group) => {
    const malePopulation = group.남성;
    const femalePopulation = group.여성;

    const totalPopulation = malePopulation + femalePopulation;

    if (totalPopulation > maxPopulation) {
      maxPopulation = totalPopulation;
      maxAgeGroup = group.구분;
    }
  });

  summaryLlpContent2 = `성별로는 남성이 {${parseFloat(
    maleratio.toFixed(1)
  )}}% 연령대별로는 {${maxAgeGroup}}가(이) 가장 높은 비중을 차지했습니다.`;
  results.push({
    title: "성별, 연령대별 체류인구",
    summary: `분석 기간 ${date} 동안 {${RegionFullName}}의 체류인구 중 남성은 {${parseFloat(
      maleratio.toFixed(1)
    )}}%({${male.toLocaleString()}}명)이며, 여성은 {${parseFloat(
      femaleratio.toFixed(1)
    )}}%({${female.toLocaleString()}}명)(으)로 나타남\n분석 기간 ${date} 동안 {${RegionFullName}}의 체류인구 중 가장 많은 연령대는 {${maxAgeGroup}}(${maxPopulation.toLocaleString()}명)(으)로 나타남`,
    charts: [
      {
        name: "llpGenderAgeData",
        indicate: ageGroups,
      },
    ],
  });
  return { results, summaryLlpContent2 };
}

export async function transLlpData3(
  data1: any,
  data2: any,
  start: string,
  region: string,
  prevYear1: string,
  prevYear2: string,
  prevYear3: string,
  prevYear4: string,
  prevYear5: string,
  prevYear6: string,
  prevYear7: string,
  prevYear8: string,
  prevYear9: string,
  prevYear10: string,
  prevYear11: string,
  prevYear12: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  let summaryLlpContent3 = "";
  const prevPopulations: number[] = [];
  type UniqueItem = {
    tot_popul_num: {
      value: number;
    };
  };
  const date = formatDate(start);
  const RegionFullName = await convertCDtoFullNM(Number(region));

  const stayItem = data1?.aggregations;
  const uniqueBucket: UniqueItem[] =
    data2?.aggregations?.year_aggregation?.buckets;

  const prevUniquePopulations = Array(13).fill(0);

  uniqueBucket
    .slice(-13)
    .reverse()
    .forEach((item, index) => {
      prevUniquePopulations[12 - index] = item.tot_popul_num?.value ?? 0;
    });

  const prevYears = [
    formatDate(prevYear12),
    formatDate(prevYear11),
    formatDate(prevYear10),
    formatDate(prevYear9),
    formatDate(prevYear8),
    formatDate(prevYear7),
    formatDate(prevYear6),
    formatDate(prevYear5),
    formatDate(prevYear4),
    formatDate(prevYear3),
    formatDate(prevYear2),
    formatDate(prevYear1),
    formatDate(start),
  ];

  const formattedPrevYears = [
    chartFormatSlashDate(prevYear12),
    chartFormatSlashDate(prevYear11),
    chartFormatSlashDate(prevYear10),
    chartFormatSlashDate(prevYear9),
    chartFormatSlashDate(prevYear8),
    chartFormatSlashDate(prevYear7),
    chartFormatSlashDate(prevYear6),
    chartFormatSlashDate(prevYear5),
    chartFormatSlashDate(prevYear4),
    chartFormatSlashDate(prevYear3),
    chartFormatSlashDate(prevYear2),
    chartFormatSlashDate(prevYear1),
    chartFormatSlashDate(start),
  ];

  const [
    prevUniquePopulation12,
    prevUniquePopulation11,
    prevUniquePopulation10,
    prevUniquePopulation9,
    prevUniquePopulation8,
    prevUniquePopulation7,
    prevUniquePopulation6,
    prevUniquePopulation5,
    prevUniquePopulation4,
    prevUniquePopulation3,
    prevUniquePopulation2,
    prevUniquePopulation1,
    prevUniquePopulation,
  ] = prevUniquePopulations;

  for (let i = 12; i >= 1; i--) {
    const key = `prevyear${i}`;
    const value = stayItem?.[key]?.[`tot_popul_num_${key}`]?.value ?? 0;
    prevPopulations.push(value);
  }
  const presentPopulation = Math.round(
    stayItem?.start?.tot_popul_num_start?.value ?? 0
  );
  prevPopulations.push(presentPopulation);

  const [
    prevPopulation12,
    prevPopulation11,
    prevPopulation10,
    prevPopulation9,
    prevPopulation8,
    prevPopulation7,
    prevPopulation6,
    prevPopulation5,
    prevPopulation4,
    prevPopulation3,
    prevPopulation2,
    prevPopulation1,
  ] = prevPopulations;

  const maxPopulation = Math.max(...prevPopulations);
  const maxPopulationIndex = prevPopulations.indexOf(maxPopulation);
  const maxUniquePopulation = prevUniquePopulations[maxPopulationIndex];

  for (let i = 0; i < formattedPrevYears.length; i++) {
    Indicate2.push({
      구분: formattedPrevYears[i],
      주민등록인구: Math.round(prevUniquePopulations[i]),
      체류인구: Math.round(prevPopulations[i]),
    });
  }

  Indicate1.push({
    구분: "주민등록인구",
    인구: prevUniquePopulation,
  });
  Indicate1.push({
    구분: "체류인구",
    인구: presentPopulation,
  });

  summaryLlpContent3 = `주민등록인구는 {${prevUniquePopulation.toLocaleString()}}명이며, 주민등록인구 대비 체류인구는 약 {${parseFloat(
    (presentPopulation / prevUniquePopulation).toFixed(1)
  )}}배 많습니다.`;
  results.push({
    title: "주민등록인구 대비 체류인구 비교",
    summary: `분석 기간 ${date}을 기준으로 주민등록인구는 총 {${prevUniquePopulation.toLocaleString()}}명이며, 체류인구는 총 {${presentPopulation.toLocaleString()}}명으로 주민등록인구 대비 체류인구는 {${parseFloat(
      (presentPopulation / prevUniquePopulation).toFixed(1)
    )}}배 많은 것으로 나타남\n분석 기간 ${date}을 기준으로 최근 1년간 주민등록인구와 체류인구 월별 비교 시, ${
      prevYears[maxPopulationIndex]
    }에 체류인구가 {${Math.round(maxPopulation).toLocaleString()}}명으로 가장 많았으며, 주민등록인구는 {${maxUniquePopulation.toLocaleString()}}명으로 {${parseFloat(
      (maxPopulation / maxUniquePopulation).toFixed(1)
    )}}배 많은 것을 확인할 수 있음`,
    charts: [
      {
        name: "llpCurrentData",
        indicate: Indicate1,
      },
      {
        name: "llpMotchComparativeData",
        indicate: Indicate2,
      },
    ],
  });

  return { results, summaryLlpContent3 };
}

export async function transLlpData4(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  const regionShortName = await convertCDtoNM(region);
  const regionFullName = await convertCDtoFullNM(Number(region));
  const date = formatDate(start);
  let summaryLlpContent4 = "";

  const one_popul = Math.round(data1.aggregations.one.tot_popul_num.value) ?? 0;
  const two_popul = Math.round(data1.aggregations.two.tot_popul_num.value) ?? 0;
  const eight_popul =
    Math.round(data1.aggregations.eight.tot_popul_num.value) ?? 0;
  const sgg_tot = Math.round(data1.aggregations.avgday.tot_pop.value) ?? 0;
  const sgg_idx = Math.round(data1.aggregations.avgday.tot_pop_index.value) ?? 0;
  const sggIndex = parseFloat((sgg_idx / sgg_tot).toString()).toFixed(2);
  const dpar_tot = Math.round(data2.aggregations.depar_tot_pop.value) ?? 0;
  const dpar_idx = Math.round(data2.aggregations.depar_tot_idx.value) ?? 0;
  const dcrIndex = parseFloat((dpar_idx / dpar_tot).toString()).toFixed(2);

  const { max_label, mid_label, min_label, max_ratio, mid_ratio, min_ratio } =
    await rankandratioValue(one_popul, two_popul, eight_popul);

  Indicate1.push(
    {
      구분: "1일",
      체류인구: one_popul,
    },
    {
      구분: "2~7일",
      체류인구: two_popul,
    },
    {
      구분: "8일 이상",
      체류인구: eight_popul,
    }
  );

  Indicate2.push(
    {
      구분: "인구감소지역 평균",
      체류일수: Number(dcrIndex),
    },
    {
      구분: regionShortName,
      체류일수: Number(sggIndex),
    }
  );

  summaryLlpContent4 = `체류인구의 평균 체류일수는 {${sggIndex}}일 로 인구감소지역 대비 {${
    sggIndex > dcrIndex ? "높" : "낮"
  }}으며,`;
  results.push({
    title: "체류일수별 특성",
    summary: `분석 기간 ${date} 동안 {${regionFullName}} 체류인구가 가장 많이 체류한 일수는 {${max_label}}({${parseFloat(
      max_ratio.toFixed(1)
    )}}%), {${mid_label}}({${parseFloat(
      mid_ratio.toFixed(1)
    )}}%), {${min_label}}({${parseFloat(
      min_ratio.toFixed(1)
    )}}%) 순서로 집계됨\n분석 기간 ${date} 동안 {${regionFullName}} 체류인구의 평균 체류일수는 {${sggIndex}}일로, 인구감소지역 평균 체류일수인 {${dcrIndex}}일에 비해 {${
      sggIndex > dcrIndex ? "높" : "낮"
    }}게 나타남`,
    charts: [
      {
        name: "llpStayDaysRatioData",
        indicate: Indicate1,
      },
      {
        name: "llpAvgDaysOfStayData",
        indicate: Indicate2,
      },
    ],
  });
  return { results, summaryLlpContent4 };
}

export async function transLlpData7(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  let summaryLlpContent5 = "";
  const date = formatDate(start);
  const regionShortName = await convertCDtoNM(region);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const dcrTime = data2.aggregations.tot_time.value ?? 0;
  const dcrNum = data2.aggregations.tot_num.value ?? 0;
  const dcrTimeIndex = parseFloat((dcrTime / dcrNum).toFixed(1));

  const one_popul = Math.round(data1.aggregations.one.tot_popul_num.value) ?? 0;
  const two_popul = Math.round(data1.aggregations.two.tot_popul_num.value) ?? 0;
  const three_popul =
    Math.round(data1.aggregations.three.tot_popul_num.value) ?? 0;
  const time = data1.aggregations.tot_time.value ?? 0;
  const popul = data1.aggregations.tot_num.value ?? 0;
  const localTimeIndex = parseFloat((time / popul).toFixed(1));

  Indicate1.push(
    {
      구분: "3시간 이상 체류인구",
      체류인구: three_popul,
    },
    {
      구분: "2시간 이상 체류인구",
      체류인구: two_popul,
    },
    {
      구분: "1시간 이상 체류인구",
      체류인구: one_popul,
    }
  );

  Indicate2.push(
    {
      구분: "인구감소지역 평균",
      체류시간: dcrTimeIndex,
    },
    {
      구분: regionShortName,
      체류시간: localTimeIndex,
    }
  );

  summaryLlpContent5 = ` 평균 체류시간은 {${localTimeIndex}}시간으로 인구감소지역 대비 {${
    localTimeIndex >= dcrTimeIndex ? "높" : "낮"
  }}습니다.`;
  results.push({
    title: "체류시간별 특성",
    summary: `분석 기간 ${date} 동안 체류인구 중 체류시간별로 3시간 이상 체류인구는 {${three_popul.toLocaleString()}}명, 2시간 이상 체류인구는{${two_popul.toLocaleString()}}명, 1시간 이상 체류인구는 {${one_popul.toLocaleString()}}명으로 나타남\n분석 기간 ${date} 동안 {${regionFullName}} 체류인구의 평균 체류시간은 {${localTimeIndex}}시간으로, 인구감소지역 평균 체류시간인 ${dcrTimeIndex}시간에 비해 {${
      localTimeIndex >= dcrTimeIndex ? "높" : "낮"
    }}게 나타남`,
    charts: [
      {
        name: "llpStayTimeCompareData",
        indicate: Indicate1,
      },
      {
        name: "llpAvgStayTimeData",
        indicate: Indicate2,
      },
    ],
  });

  return { summaryLlpContent5, results };
}

export async function transLlpData5(data1: any, data2: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  let summaryLlpContent6 = "";
  const date = formatDate(start);
  const regionShortName = await convertCDtoNM(region);
  const regionFullName = await convertCDtoFullNM(Number(region));

  const one_population = Math.round(data1?.aggregations?.one?.tot_popul_num?.value) ?? 0;
  const two_population = Math.round(data1?.aggregations?.two?.tot_popul_num?.value) ?? 0;
  const three_population = Math.round(data1?.aggregations?.three?.tot_popul_num?.value) ?? 0;
  const four_populatiton = Math.round(data1?.aggregations?.four?.tot_popul_num?.value) ?? 0;
  const avg_day_tp = data1.aggregations?.avg_day?.value ?? 0;
  const avg_day = parseFloat(avg_day_tp.toFixed(1));

  const one_popul = Math.round(data2.aggregations?.one?.tot_popul_num?.value) ?? 0;
  const two_popul = Math.round(data2.aggregations?.two?.tot_popul_num?.value) ?? 0;
  const three_popul = Math.round(data2.aggregations?.three?.tot_popul_num?.value) ?? 0;
  const four_popul = Math.round(data2.aggregations?.four?.tot_popul_num?.value) ?? 0;
  const dcrLdgmt = data2?.aggregations?.avg_day?.value ?? 0;
  const dcrLdgmtIndex = parseFloat(dcrLdgmt.toFixed(1));

  Indicate1.push({
    구분: `${regionShortName}`,
    무박: one_population,
    "1박": two_population,
    "2박": three_population,
    "3박 이상": four_populatiton, 
  })

  Indicate2.push(
    {
      구분: "인구감소지역",
      숙박일수: dcrLdgmtIndex,
    },
    {
      구분: `${regionShortName}`,
      숙박일수: avg_day,
    }
  )
  const { first_label, second_label, third_label, fourth_label,
    first_ratio, second_ratio, third_ratio, fourth_ratio } = await rankandratiovalue1(one_population, two_population, three_population, four_populatiton);
  const { first_label: d_first_label, second_label: d_second_label,
    third_label: d_third_label, fourth_label: d_fourth_label,
    first_ratio: d_first_ratio, second_ratio: d_second_ratio,
    third_ratio: d_third_ratio, fourth_ratio: d_fourth_ratio } = await rankandratiovalue1(one_popul, two_popul, three_popul, four_popul)
  
  const ldgmt_ratio_tp = second_ratio + third_ratio + fourth_ratio;
  const ldgmt_ratio = parseFloat(ldgmt_ratio_tp.toFixed(1));
  const dcr_ldgmt_ratio_tp = d_second_ratio + d_third_ratio + d_fourth_ratio;
  const dcr_ldgmt_ratio = parseFloat(dcr_ldgmt_ratio_tp.toFixed(1));

  summaryLlpContent6 = `체류인구의 평균 숙박 비율은 {${ldgmt_ratio}}%로 인구감소지역 대비 {${ldgmt_ratio >= dcr_ldgmt_ratio ? "높" : "낮"}}습니다.`
  results.push({
    title: "숙박일수별 특성",
    summary: `분석 기간 ${date} 동안 {${regionFullName}} 체류인구가 가장 많이 숙박한 일수는 {${first_label}}({${parseFloat(first_ratio.toFixed(1))}}%), {${second_label}}({${parseFloat(second_ratio.toFixed(1))}}%), {${third_label}}({${parseFloat(third_ratio.toFixed(1))}}%), {${fourth_label}}({${parseFloat(fourth_ratio.toFixed(1))}}%) 순서로 집계됨\n분석 기간 ${date} 동안 {${regionFullName}} 체류인구의 평균 숙박일수는 {${avg_day}}일로, 인구감소지역 평균 숙박일수인 {${dcrLdgmtIndex}}일에 비해 {${avg_day >= dcrLdgmtIndex ? "높" : "낮"}}게 나타남`,
    charts: [
      {
        name: "llpStayOverRatioData",
        indicate: Indicate1,
      },
      {
        name: "llpAverageStayOverDaysData",
        indicate: Indicate2,
      },
    ],
  })

  return { summaryLlpContent6, results }
}

export async function transLlpData6(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate1: any[] = [];
  const Indicate2: any[] = [];
  let summaryLlpContent7 = "";
  const date = formatDate(start);
  const regionShortName = await convertCDtoNM(region);
  const regionFullName = await convertCDtoFullNM(Number(region));
  let sameRegionValue = 0;
  let otherRegionValue = 0;
  const topValue = new Map<string, number>();
  let total = 0;

  const Bucket = data?.aggregations?.by_region?.buckets || [];
  for (const item of Bucket) {
    const Key = item.key;
    const sidoBucket = item.by_sido.buckets || [];
    const sggBucket = item.by_sgg.buckets || [];

    for (const sidoItem of sidoBucket) {
      const sidoKey = Number(sidoItem.key);
      const sidoNM = await convertCDtoFullNM(sidoKey)
      const populNum = sidoItem.pop_by_sido.value ?? 0;
      if (typeof region !== "string") {
        throw new Error("string, end must be a string");
      }
      if (region.length === 2) {
        topValue.set(sidoNM, populNum)
      }
      if (region.toString().slice(0, 2) === sidoItem.key.toString()) {
        sameRegionValue += sidoItem.pop_by_sido.value || 0;
      } else {
        otherRegionValue += sidoItem.pop_by_sido.value || 0;
      }
    }

    for (const sggItem of sggBucket) {
      const sggKey = Number(sggItem.key);
      const sggNM = await convertCDtoFullNM(sggKey)
      const populNum = sggItem.pop_by_sgg.value || 0;
      if (typeof region !== "string") {
        throw new Error("string, end must be a string");
      }
      if (region.length === 5) {
        topValue.set(sggNM, populNum)
      }
    }
  }
  const sortedArray = [...topValue].sort((a, b) => b[1] - a[1]);
  const top10 = sortedArray.slice(0, 10)
  
  top10.forEach(([key, value]) => {
    
    Indicate2.push({
      구분: key,
      유입인구: Math.round(value),
    })
    total += value;
  })
  const top_rgn = top10[0][0];
  const top_value = top10[0][1];
  const top_ratio = parseFloat(((top_value / total) * 100).toFixed(1))
  
  const other_ratio = parseFloat(((otherRegionValue / (sameRegionValue + otherRegionValue)) * 100).toFixed(1))
  

  Indicate1.push({
    구분: `${regionShortName}`,
    타시도: Math.round(otherRegionValue),
    동일시도: Math.round(sameRegionValue),
  })

  summaryLlpContent7 = `주요 유입 지역은 {${top_rgn}}로, 타시도 거주자 비율이 {${other_ratio}}%로 나타났습니다.`
  results.push({
    title: "유입지역별 특성",
    summary: `분석 기간 ${date} 동안 {${regionFullName}}의 체류인구 중 타시도 거주자 비중은 {${other_ratio}}%이며, 외부 유입 비율이 가장 높은 지역은 {${top_rgn}}({${top_ratio}}%)가 가장 높은 것으로 나타남`,
    charts: [
      {
        name: "llpExternalResidentStayRatioData",
        indicate: Indicate1,
      },
      {
        name: "llpTop10InboundAreasData",
        indicate: Indicate2,
      }
    ]
  })
  return { summaryLlpContent7, results }
}