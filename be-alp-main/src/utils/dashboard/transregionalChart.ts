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

import { convertCDtoFullNM } from "@/helpers/convertNM";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import { calculateLastRatio, calculatePrevRatio } from "./calcList";
import { getTotalDays } from "@/helpers/normalized/normalizedALPData";

import util from "util";

export async function transRegData(data: any, start: string, region: string) {
  const results: any[] = [];
  const convertStart = calcMonthToDate(start);
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);
  const prevTotalDays = getTotalDays(convertPrevMonth.start, convertPrevMonth.end);
  const lastYearTotalDays = getTotalDays(convertLastY.start, convertLastY.end);
  const startTotalDays = getTotalDays(convertStart.start, convertStart.end);

  const presentNum = Math.round(
    Number(data[0].present_alp.tot_popul_num.value ?? 0) / (startTotalDays *24)
  );
  const prevNum = Math.round(
    Number(data[0].prev_alp.tot_popul_num.value ?? 0) / (prevTotalDays * 24)
  );
  const lastNum = Math.round(
    Number(data[0].last_alp.tot_popul_num.value ?? 0) / (lastYearTotalDays * 24)  );
  const prevRatio = calculatePrevRatio(presentNum, prevNum);
  const lastRatio = calculateLastRatio(presentNum, lastNum);

  results.push({
    key: "alp",
    title: "1시간 평균 생활인구",
    value: presentNum,
    prevMonthComparison: prevRatio,
    prevYearComparison: lastRatio,
  });
  return results;
}

export async function transRegData1(data: any, start: string, region: string) {
  const results: any[] = [];

  if (typeof region !== "string") {
    throw new Error("string, end must be a string");
  }

  if (region.length === 8) {
    data = [];
  }

  const Population = Math.round(
    Number(data[0]?.present_llp.tot_popul_num.value ?? 0)
  );
  const prevPopulation = Math.round(
    Number(data[0]?.prev_llp.tot_popul_num.value ?? 0)
  );
  const lastPopulation = Math.round(
    Number(data[0]?.last_llp.tot_popul_num.value ?? 0)
  );

  const prevRatio = calculatePrevRatio(Population, prevPopulation);
  const lastRatio = calculateLastRatio(Population, lastPopulation);

  results.push({
    key: "llp",
    title: "월 3시간 이상 체류인구",
    value: Population,
    prevMonthComparison: prevRatio,
    prevYearComparison: lastRatio,
  });
  return results;
}

export async function transRegData2(data: any, start: string, region: string) {
  const results: any[] = [];

  const Population =
    Math.round(data[0].present_mopout.tot_popul_num.value) ?? 0;
  const prevPopulation =
    Math.round(data[0].prev_mopout.tot_popul_num.value) ?? 0;
  const lastPopulation =
    Math.round(data[0].last_mopout.tot_popul_num.value) ?? 0;

  const prevRatio = calculatePrevRatio(Population, prevPopulation);
  const lastRatio = calculateLastRatio(Population, lastPopulation);

  results.push({
    key: "mop",
    title: "총 유출인구",
    value: Population,
    prevMonthComparison: prevRatio,
    prevYearComparison: lastRatio,
  });
  return results;
}

export async function transRegData3(data: any, start: string, region: string) {
  const results: any[] = [];

  const Population = Math.round(data[0].present_mopin.tot_popul_num.value) ?? 0;
  const prevPopulation =
    Math.round(data[0].prev_mopin.tot_popul_num.value) ?? 0;
  const lastPopulation =
    Math.round(data[0].last_mopin.tot_popul_num.value) ?? 0;

  const prevRatio = calculatePrevRatio(Population, prevPopulation);
  const lastRatio = calculateLastRatio(Population, lastPopulation);

  results.push({
    key: "mop",
    title: "총 유입인구",
    value: Population,
    prevMonthComparison: prevRatio,
    prevYearComparison: lastRatio,
  });
  return results;
}

export async function transRegData4(data: any, start: string, region: string) {
  if (typeof start !== "string") {
    throw new Error("start must be a string");
  }

  const results: any[] = [];
  const Indicate: any[] = [];

  const Bucket = data?.aggregations?.by_date?.buckets || [];
  const year = parseInt(start.slice(0, 4), 10);
  const month = parseInt(start.slice(4, 6), 10) - 1;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const allDates: string[] = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDates.push(currentDate.toLocaleDateString("ko-KR").replace(/\./g, "/"));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const existingDates: { [key: string]: { [hour: string]: number } } = {};
  for (const Item of Bucket) {
    const date = new Date(Item.key);

    date.setHours(date.getHours() + 9);

    const formattedDate = date.toLocaleDateString("ko-KR").replace(/\./g, "/");

    const timeMap: { [key: string]: number } = {};

    for (let i = 0; i < 24; i++) {
      const hourStr = `${i.toString().padStart(2, "0")}:00`;
      timeMap[hourStr] = 0;
    }

    const byTimeBuckets = Item?.by_time?.buckets || [];
    for (const timeBucket of byTimeBuckets) {
      const hour = timeBucket.key;
      const hourStr = `${hour.toString().padStart(2, "0")}:00`;
      timeMap[hourStr] = timeBucket?.tot_popul_num?.value || 0;
    }

    existingDates[formattedDate] = timeMap;
  }

  for (const date of allDates) {
    const timeMap = existingDates[date] || {};

    for (let i = 0; i < 24; i++) {
      const hourStr = `${i.toString().padStart(2, "0")}:00`;
      const value = timeMap[hourStr] || 0;

      const dateObject = new Date(date);
      const formattedDate = dateObject
        .toLocaleDateString("ko-KR", {
          month: "numeric",
          day: "numeric",
        })
        .replace(/\./g, "/")
        .replace(/\/$/, "")
        .replace(/\s+/g, "");

      Indicate.push({
        구분: `${formattedDate} ${hourStr}`,
        생활인구: Math.round(value),
      });
    }
  }

  results.push({
    name: "regTimeSeriesData",
    indicate: Indicate,
  });
  return results;
}

export async function transRegData5(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const Bucket = data?.aggregations?.by_region?.buckets || [];

  for (const Item of Bucket) {
    const setBucket = Item?.by_time?.buckets;

    for (const item of setBucket) {
      Indicate.push({
        구분: item.key,
        거주인구: Math.round(item.home.tot.value),
        직장인구: Math.round(item.work.tot.value),
        방문인구: Math.round(item.vist.tot.value),
      });
    }

    results.push({
      name: "regTimePatternData",
      indicate: Indicate,
    });
  }
  return results;
}

export async function transRegData6(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const gubun = ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"];
  const outBucket = data1[0].aggregations?.by_region?.buckets || [];
  const inBucket = data2[0].aggregations?.by_region?.buckets || [];

  for (const outItem of outBucket) {
    const outPrpsBucket = outItem.by_prps?.buckets;
    const outKey = outItem.key;

    const inItem = inBucket.find(
      (inItem: any) => String(inItem.key) === String(outKey)
    );

    const inPrpsBucket = inItem?.by_prps?.buckets;

    for (let i = 0; i < 7; i++) {
      const outPopulation = outPrpsBucket[i]?.tot_popul_num?.value ?? 0;
      const inPopulation = inPrpsBucket[i]?.tot_popul_num?.value ?? 0;

      Indicate.push({
        구분: `${gubun[i]}`,
        유입: Math.round(inPopulation),
        유출: Math.round(outPopulation),
      });
    }
  }

  results.push({
    name: "regPurposeFlowData",
    indicate: Indicate,
  });
  return results;
}

export async function transRegData7(
  data1: any,
  data2: any,
  start: string,
  region: string
) {
  const results: any[] = [];
  const Indicate: any[] = [];
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
  const outBucket = data1[0].aggregations?.by_region?.buckets || [];
  const inBucket = data2[0].aggregations?.by_region?.buckets || [];

  for (const outItem of outBucket) {
    const outWaybucket = outItem?.by_way?.buckets || [];
    const outKey = outItem.key;

    const inItem = inBucket.find(
      (inItem: any) => String(inItem.key) === String(outKey)
    );
    const inWaybucket = inItem?.by_way?.buckets;

    for (let i = 0; i < 8; i++) {
      const outPopulation = outWaybucket[i]?.tot_popul_num?.value ?? 0;
      const inPopulation = inWaybucket[i]?.tot_popul_num?.value ?? 0;

      Indicate.push({
        구분: `${gubun[i]}`,
        유입: Math.round(inPopulation),
        유출: Math.round(outPopulation),
      });
    }
  }

  results.push({
    name: "regTransFlowData",
    indicate: Indicate,
  });
  return results;
}

export async function transRegData8(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const inBucket = data[0]?.aggregations?.by_detina?.buckets || [];
  for (const inItem of inBucket) {
    const inRankbucket = inItem?.by_pdepar?.buckets;

    for (const item of inRankbucket) {
      const population = item.pdepar_tot_popul_num?.value;
      const regionfullName = await convertCDtoFullNM(Number(item.key));

      Indicate.push({
        구분: regionfullName,
        생활인구: Math.round(population),
      });
    }

    results.push({
      name: "regTop5InboundAreasData",
      indicate: Indicate,
    });
  }
  return results;
}

export async function transRegData9(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const outBucket = data[0]?.aggregations?.by_pdepar?.buckets || [];
  for (const outItem of outBucket) {
    const outRankbucket = outItem?.by_detina?.buckets;

    for (const item of outRankbucket) {
      const population = item.tot_popul_num?.value;
      const regionfullName = await convertCDtoFullNM(Number(item.key));

      Indicate.push({
        구분: regionfullName,
        생활인구: Math.round(population),
      });
    }
  }

  results.push({
    name: "regTop5OutboundAreasData",
    indicate: Indicate,
  });
  return results;
}

export async function transRegData10(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const oneDay_Population =
    Math.round(data?.aggregations?.one?.tot_popul_num_one?.value) ?? 0;
  const twoDay_Population =
    Math.round(data?.aggregations?.two?.tot_popul_num_two?.value) ?? 0;
  const eightDay_Population =
    Math.round(data?.aggregations?.eight?.tot_popul_num_eight?.value) ?? 0;

  Indicate.push(
    {
      구분: "1일",
      체류인구: oneDay_Population,
    },
    {
      구분: "2~7일",
      체류인구: twoDay_Population,
    },
    {
      구분: "8일 이상",
      체류인구: eightDay_Population,
    }
  );

  results.push({
    name: "regStayDaysRatioData",
    indicate: Indicate,
  });
  return results;
}

export async function transRegData11(data: any, start: string, region: string) {
  const results: any[] = [];
  const Indicate: any[] = [];

  const one_population =
    Math.round(data?.aggregations?.one?.tot_popul_num?.value) ?? 0;
  const two_population =
    Math.round(data?.aggregations?.two?.tot_popul_num?.value) ?? 0;
  const three_population =
    Math.round(data?.aggregations?.three?.tot_popul_num?.value) ?? 0;
  const four_population =
    Math.round(data?.aggregations?.four?.tot_popul_num?.value) ?? 0;

  Indicate.push(
    {
      구분: "무박",
      숙박인구: one_population,
    },
    {
      구분: "1박",
      숙박인구: two_population,
    },
    {
      구분: "2박",
      숙박인구: three_population,
    },
    {
      구분: "3박 이상",
      숙박인구: four_population,
    }
  );
  results.push({
    name: "regShortStayRatioData",
    indicate: Indicate,
  });
  return results;
}
