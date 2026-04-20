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
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import {
  formatDate,
  chartFormatDate,
  convertToTimeFormat,
  calcMonthToDate,
  calculateDates,
  getStartEndDate
} from "@/helpers/convertDate";
import util from "util";
import {
  calculateLastRatio,
  calculatePrevRatio,
  countDays,
  defineMonth,
  findLargestAgeGroup,
  getDowAvgData
} from "../calcList";
import {
  getWeekedOccurrences,
  getTotalDays
} from "@/helpers/normalized/normalizedALPData";

export async function transData(data: any, region: string, start: string) {
  const results: any[] = [];
  const regionName = await convertCDtoNM(region);
  const convertStart = calcMonthToDate(start);

  const [present_Month, prev_Month, last_Month] = defineMonth(start);
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);
  const prevTotalDays = getTotalDays(convertPrevMonth.start, convertPrevMonth.end);
  const lastYearTotalDays = getTotalDays(convertLastY.start, convertLastY.end);
  const startTotalDays = getTotalDays(convertStart.start, convertStart.end);
  const currentPop = Number(data[0].present.tot_popul_num.value) / (startTotalDays *24);
  const prevPop = Number(data[0].prev.tot_popul_num.value) / (prevTotalDays *24);
  const lastPop = Number(data[0].last.tot_popul_num.value) / (lastYearTotalDays *24);

  const presentMonth = chartFormatDate(present_Month);
  const prevMons = chartFormatDate(prev_Month);
  const lastMons = chartFormatDate(last_Month);

  const monthOnMonthChange = calculatePrevRatio(currentPop, prevPop);
  const yearOnYearChange = calculateLastRatio(currentPop, lastPop);

  const summaryContent = `{${regionName}}의 생활인구는 {${Math.round(
    currentPop
  ).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
    yearOnYearChange ?? 0).toFixed(1)
  )}}% ${yearOnYearChange >= 0 ? "증가" : "감소"}, 전월 대비 {${parseFloat(Math.abs(
    monthOnMonthChange ?? 0).toFixed(1)
  )}}% ${monthOnMonthChange >= 0 ? "증가" : "감소"}했습니다.`;

  results.push({
    title: "전년/전월 동기 대비 생활인구",
    summary: `분석 기간 ${start}을 기준으로 {${regionName}}의 생활인구는 {${Math.round(
      currentPop
    ).toLocaleString()}}명으로, 전년 동월 대비 {${parseFloat(Math.abs(
      yearOnYearChange ?? 0).toFixed(1)
    )}}% ${
      yearOnYearChange >= 0 ? "증가" : "감소"
    }하였으며, 전월 대비 {${parseFloat(Math.abs(monthOnMonthChange ?? 0).toFixed(1))}}% ${
      monthOnMonthChange >= 0 ? "증가" : "감소"
    }한 것으로 나타남`,
    charts: [
      {
        name: "lastyearDataAvg",
        indicate: [
          { 구분: lastMons, 생활인구: Math.round(lastPop) },
          { 구분: presentMonth, 생활인구: Math.round(currentPop) },
        ],
      },
      {
        name: "preMonthDataAvg",
        indicate: [
          { 구분: prevMons, 생활인구: Math.round(prevPop) },
          { 구분: presentMonth, 생활인구: Math.round(currentPop) },
        ],
      },
    ],
  });
  return { results, summaryContent };
}

export async function transData1(data: any, region: string, start: string) {
  const results: any[] = [];
  let summaryContent1 = "";

  const convertStart = calcMonthToDate(start);
  const startTotalDays = getTotalDays(convertStart.start, convertStart.end);
  const Bucket = data?.aggregations?.by_region?.buckets;
  const date = formatDate(start);

  for (const Item of Bucket) {
    const parseToInt = (value: any) => parseInt(value || "0", 10);
    const male = Item.total_male_population.value / (startTotalDays * 24);
    const female = Item.total_feml_population.value / (startTotalDays * 24);
    const maleratio = (male / (male + female)) * 100;
    const femaleratio = (female / (male + female)) * 100;
    const regionName = await convertCDtoNM(Item.key);

    const maleratioFormatted =
      maleratio % 1 === 0
        ? Math.round(maleratio).toString()
        : parseFloat(maleratio.toFixed(1));

    const femaleratioFormatted =
      femaleratio % 1 === 0
        ? Math.round(femaleratio).toString()
        : parseFloat(femaleratio.toFixed(1));

    const maleFormatted = Math.round(male).toLocaleString();
    const femaleFormatted = Math.round(female).toLocaleString();

    const ageGroups = [
      {
        구분: "10세 미만",
        남성: parseToInt(Math.round(Item.total_male_00_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_00_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "10~14세",
        남성: parseToInt(Math.round(Item.total_male_10_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_10_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "15~19세",
        남성: parseToInt(Math.round(Item.total_male_15_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_15_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "20~24세",
        남성: parseToInt(Math.round(Item.total_male_20_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_20_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "25~29세",
        남성: parseToInt(Math.round(Item.total_male_25_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_25_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "30~34세",
        남성: parseToInt(Math.round(Item.total_male_30_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_30_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "35~39세",
        남성: parseToInt(Math.round(Item.total_male_35_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_35_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "40~44세",
        남성: parseToInt(Math.round(Item.total_male_40_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_40_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "45~49세",
        남성: parseToInt(Math.round(Item.total_male_45_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_45_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "50~54세",
        남성: parseToInt(Math.round(Item.total_male_50_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_50_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "55~59세",
        남성: parseToInt(Math.round(Item.total_male_55_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_55_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "60~64세",
        남성: parseToInt(Math.round(Item.total_male_60_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_60_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "65~69세",
        남성: parseToInt(Math.round(Item.total_male_65_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_65_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "70~74세",
        남성: parseToInt(Math.round(Item.total_male_70_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_70_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "75~79세",
        남성: parseToInt(Math.round(Item.total_male_75_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_75_popul_num?.value) / (startTotalDays *24)),
      },
      {
        구분: "80세 이상",
        남성: parseToInt(Math.round(Item.total_male_80_popul_num?.value) / (startTotalDays *24)),
        여성: parseToInt(Math.round(Item.total_feml_80_popul_num?.value) / (startTotalDays *24)),
      },
    ];

    let maxPopulation = 0;
    let maxAgeGroup = "";

    ageGroups.forEach((group) => {
      const malePopulation = group.남성;
      const femalePopulation = group.여성;

      const totalPopulation = malePopulation + femalePopulation;

      if (totalPopulation > maxPopulation) {
        maxPopulation = totalPopulation;
        maxAgeGroup = group.구분;
      }
    });

    const formattedMaxPopulation = maxPopulation.toLocaleString();
    const formattedMaxAgeGroup = maxAgeGroup.replace(/(.+)/, "{$1}");
    summaryContent1 =
      male >= female
        ? `생활인구 중 {남성}이 {${maleratioFormatted}}%로 {여성}보다 많았고, 연령대별로는 ${formattedMaxAgeGroup}가(이) 가장 많은 비율을 차지했습니다.`
        : `생활인구 중 {여성}이 {${femaleratioFormatted}}%로 {남성}보다 많았고, 연령대별로는 ${formattedMaxAgeGroup}가(이) 가장 많은 비율을 차지했습니다.`;

    const data = {
      title: "성별, 연령대별 생활인구",
      summary: `분석 기간 ${date}동안 {${regionName}}의 생활인구 중 남성은 {${maleratioFormatted}}%({${maleFormatted}}명)이며, 여성은 {${femaleratioFormatted}}%({${femaleFormatted}}명)(으)로 나타남\n분석 기간 ${date}동안 {${regionName}}의 생활인구 중 가장 많은 연령대는 ${formattedMaxAgeGroup}({${formattedMaxPopulation}}명)(으)로 나타남`,
      charts: [
        {
          name: "genderageDataAvg",
          indicate: ageGroups,
        },
      ],
    };
    results.push(data);
  }
  return { results, summaryContent1 };
}

export async function transData2(data: any, start: string) {
  const results: any[] = [];
  const Buckets = data?.aggregations?.by_region?.buckets || [];
  let summaryContent2 = "";
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const startTotalDays = getTotalDays(convertStart.start, convertStart.end);
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
      convertStart.start,
      convertStart.end,
      holidays
    );

  const { sunCnt, monCnt, tueCnt, wedCnt, thuCnt, friCnt, satCnt} = getDowAvgData(convertStart.start, convertStart.end)

  for (const Item of Buckets) {
    const SidoKey = Number(Item.key);
    const sun = Math.round(Item?.by_dow?.buckets[0]?.tot_sum?.value ?? 0) / (sunCnt * 24);
    const mon = Math.round(Item?.by_dow?.buckets[1]?.tot_sum?.value ?? 0) / (monCnt * 24);
    const tue = Math.round(Item?.by_dow?.buckets[2]?.tot_sum?.value ?? 0) / (tueCnt * 24);
    const wed = Math.round(Item?.by_dow?.buckets[3]?.tot_sum?.value ?? 0) / (wedCnt * 24);
    const thu = Math.round(Item?.by_dow?.buckets[4]?.tot_sum?.value ?? 0) / (thuCnt * 24);
    const fri = Math.round(Item?.by_dow?.buckets[5]?.tot_sum?.value ?? 0) / (friCnt * 24);
    const sat = Math.round(Item?.by_dow?.buckets[6]?.tot_sum?.value ?? 0) / (satCnt * 24);
    const date = formatDate(start);

    const week = Math.round(
      Item?.by_holiday?.buckets?.weekday?.tot_sum?.value ?? 0
    )  / (weekdayCnt * 24);
    const weekend = Math.round(
      Item?.by_holiday?.buckets?.weekend?.tot_sum?.value ?? 0
    )  / (holidayCnt * 24);

    const dailyPopulation = [sun, mon, tue, wed, thu, fri, sat];

    const maxPopulation = Math.max(...dailyPopulation);
    const minPopulation = Math.min(...dailyPopulation);

    const maxDay = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ][dailyPopulation.indexOf(maxPopulation)];
    const minDay = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ][dailyPopulation.indexOf(minPopulation)];

    summaryContent2 = `요일별로는 {${maxDay}}에 가장 많고 {${minDay}}에 가장 적었으며,`;

    const data = {
      title: "요일별 내국인 생활인구",
      summary: `분석 기간 ${date} 동안 생활인구가 가장 많은 요일은 {${maxDay}}({${Math.round(
        maxPopulation
      ).toLocaleString()}}명)이며, 가장 적은 요일은 {${minDay}}({${Math.round(
        minPopulation
      ).toLocaleString()}})명으로 나타남\n분석 기간 ${date}동안 생활인구는 평일에 평균 {${Math.round(
        week
      ).toLocaleString()}}명이며, 휴일에 평균 {${Math.round(
        weekend
      ).toLocaleString()}}명으로 나타남`,
      charts: [
        {
          name: "weekData",
          indicate: [
            { 구분: "월", 생활인구: mon },
            { 구분: "화", 생활인구: tue },
            { 구분: "수", 생활인구: wed },
            { 구분: "목", 생활인구: thu },
            { 구분: "금", 생활인구: fri },
            { 구분: "토", 생활인구: sat },
            { 구분: "일", 생활인구: sun },
          ],
        },
        {
          name: "weekedData",
          indicate: [
            { 구분: "평일", 생활인구: week },
            { 구분: "휴일", 생활인구: weekend },
          ],
        },
      ],
    };

    results.push(data);
  }
  return { results, summaryContent2 };
}

export async function transData3(data: any, start: string) {
  interface PopulationData {
    time: string,
    [key: string]: string | number
  }
  
  const results: any[] = [];
  const Bucket = data?.aggregations?.by_region?.buckets || [];
  let summaryContent3 = "";
  const date = formatDate(start);
  const convertStart = calcMonthToDate(start);
  const startTotalDays = getTotalDays(convertStart.start, convertStart.end);

  let regionName = "";
  let maxMaleTime = "";
  let maxMalePop = 0;
  let maxFemaleTime = "";
  let maxFemalePop = 0;
  let maxPopulNum = -Infinity;
  let maxIndex = -1;

  for (const Item of Bucket) {
    const timeBuckets = Item?.by_timezn?.buckets || [];
    regionName = await convertCDtoNM(Item.key);

    const timeGenderPopData: any[] = [];
    const timeAgePopData: any[] = [];
    const totalPopByTime: { time: string; total: number }[] = [];
    const totalPopByTime2: { time: string; age0: number, age10: number, age20: number, age30: number, age40: number, age50: number, age60: number, age70: number, age80: number }[] = [];

    for (const timeBucket of timeBuckets) {
      const age0 = (timeBucket.f00.value + timeBucket.f05.value + timeBucket.m00.value + timeBucket.m05.value) / (startTotalDays)
      const age10 = (timeBucket.f10.value + timeBucket.f15.value + timeBucket.m10.value + timeBucket.m15.value) / (startTotalDays)
      const age20 = (timeBucket.f20.value + timeBucket.f25.value + timeBucket.m20.value + timeBucket.m25.value) / (startTotalDays)
      const age30 = (timeBucket.f30.value + timeBucket.f35.value + timeBucket.m30.value + timeBucket.m35.value) / (startTotalDays)
      const age40 = (timeBucket.f40.value + timeBucket.f45.value + timeBucket.m40.value + timeBucket.m45.value) / (startTotalDays)
      const age50 = (timeBucket.f50.value + timeBucket.f55.value + timeBucket.m50.value + timeBucket.m55.value) / (startTotalDays)
      const age60 = (timeBucket.f60.value + timeBucket.f65.value + timeBucket.m60.value + timeBucket.m65.value) / (startTotalDays)
      const age70 = (timeBucket.f70.value + timeBucket.f75.value + timeBucket.m70.value + timeBucket.m75.value) / (startTotalDays)
      const age80 = (timeBucket.f80.value + timeBucket.m80.value) / (startTotalDays)
      const ageGroups = timeBucket?.age_groups?.value?.age_groups;
      const male = timeBucket?.male?.value ?? 0;
      const female = timeBucket?.female?.value ?? 0;
      const top = timeBucket?.age_groups?.value?.maxAgeGroup;

      const maleAvg = male / (startTotalDays)
      const femaleAvg = female / (startTotalDays)
      const total = maleAvg + femaleAvg;
      totalPopByTime.push({ time: `${timeBucket.key}`, total})
      totalPopByTime2.push({ time: `${timeBucket.key}`, age0, age10, age20, age30, age40, age50, age60, age70, age80 });

      const age0Num = Number(age0)
      const age10Num = Number(age10)
      const age20Num = Number(age20)
      const age30Num = Number(age30)
      const age40Num = Number(age40)
      const age50Num = Number(age50)
      const age60Num = Number(age60)
      const age70Num = Number(age70)
      const age80Num = Number(age80)

      const populNumArray = [
        age0Num,
        age10Num,
        age20Num,
        age30Num,
        age40Num,
        age50Num,
        age60Num,
        age70Num,
        age80Num
      ];

      const currentMaxPopulNum = Math.max(...populNumArray);
      maxPopulNum = Math.round(maxPopulNum);

      if (currentMaxPopulNum > maxPopulNum) {
        maxPopulNum = currentMaxPopulNum;
        maxIndex = populNumArray.indexOf(maxPopulNum);
      }

      if (maleAvg > maxMalePop) {
        maxMalePop = maleAvg;
        maxMaleTime = `${timeBucket.key}`;
      }

      if (femaleAvg > maxFemalePop) {
        maxFemalePop = femaleAvg;
        maxFemaleTime = `${timeBucket.key}`;
      }

      timeGenderPopData.push({
        구분: `${timeBucket.key}`,
        남성: Math.round(maleAvg),
        여성: Math.round(femaleAvg),
      });

      if (ageGroups) {
        const age = ageGroups["10세 미만"] ?? 0;
        const age1 = ageGroups["10대"] ?? 0;
        const age2 = ageGroups["20대"] ?? 0;
        const age3 = ageGroups["30대"] ?? 0;
        const age4 = ageGroups["40대"] ?? 0;
        const age5 = ageGroups["50대"] ?? 0;
        const age6 = ageGroups["60대"] ?? 0;
        const age7 = ageGroups["70대"] ?? 0;
        const age8 = ageGroups["80세 이상"] ?? 0;

        timeAgePopData.push({
          구분: `${timeBucket.key}`,
          "10세 미만": Math.round(age0),
          "10대": Math.round(age10),
          "20대": Math.round(age20),
          "30대": Math.round(age30),
          "40대": Math.round(age40),
          "50대": Math.round(age50),
          "60대": Math.round(age60),
          "70대": Math.round(age70),
          "80세 이상": Math.round(age80),
        });
      }
    }

    const maxPeople = Math.max()

    const maxPop = totalPopByTime.reduce((max, curr) =>
      curr.total > max.total ? curr : max
    );
    const maxAgeGroup = findLargestAgeGroup(timeAgePopData);
    const maxTime = convertToTimeFormat(Number(maxPop.time));
    const maxMenTime = convertToTimeFormat(Number(maxMaleTime));
    const maxWomenTime = convertToTimeFormat(Number(maxFemaleTime));
    summaryContent3 = ` 시간대별로는 {${maxTime}}에 인구가 집중되었습니다.`;
    results.push({
      title: "시간대별 내국인 생활인구",
      summary: `분석 기간 ${date}동안 ${regionName}의 생활인구 중 남성이 가장 많았던 시간대 {${maxMenTime}}({${Math.round(
        maxMalePop
      ).toLocaleString()}}명)이며, 여성이 가장 많았던 시간대는 {${maxWomenTime}}({${Math.round(
        maxFemalePop
      ).toLocaleString()}}명)으로 나타남\n분석 기간 ${date}동안 ${regionName}의 생활인구 중 가장 많은 연령대인 {${maxAgeGroup}}가(이) 가장 많았던 시간대는 {${maxTime}}(${Math.round(
        maxPopulNum
      ).toLocaleString()}명)으로 나타남`,
      charts: [
        {
          name: "timeGenderPopData",
          indicate: timeGenderPopData,
        },
        {
          name: "timeAgePopData",
          indicate: timeAgePopData,
        },
      ],
    });
  }
  return { results, summaryContent3 };
}

export async function transData4(data: any, start: string) {
  const results: any[] = [];
  const dayArray: any[] = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
      convertStart.start,
      convertStart.end,
      holidays
    );
  const { sunCnt, monCnt, tueCnt, wedCnt, thuCnt, friCnt, satCnt} = getDowAvgData(convertStart.start, convertStart.end)

  const Bucket = data?.aggregations?.by_region?.buckets || [];
  const date = formatDate(start);

  for (const Item of Bucket) {
    const regionName = await convertCDtoNM(Item.key);

    const Indicate1 = [];
    const Indicate2 = [];

    const sunbucket = Item?.by_dow?.buckets[0]?.by_timezn?.buckets || [];
    const monbucket = Item?.by_dow?.buckets[1]?.by_timezn?.buckets || [];
    const tuebucket = Item?.by_dow?.buckets[2]?.by_timezn?.buckets || [];
    const wedbucket = Item?.by_dow?.buckets[3]?.by_timezn?.buckets || [];
    const thubucket = Item?.by_dow?.buckets[4]?.by_timezn?.buckets || [];
    const fribucket = Item?.by_dow?.buckets[5]?.by_timezn?.buckets || [];
    const satbucket = Item?.by_dow?.buckets[6]?.by_timezn?.buckets || [];
    const weekbucket =
      Item?.by_holiday?.buckets?.weekday?.by_timezn?.buckets || [];
    const holidaybucket =
      Item?.by_holiday?.buckets?.weekend?.by_timezn?.buckets || [];

    let maxPopulNum = -Infinity;
    let minPopulNum = Infinity;
    let maxTime = "";
    let minTime = "";
    let maxIndex = -1;

    let maxWeekPopulNum = -Infinity;
    let maxWeekTime = "";
    let maxHolidayPopulNum = -Infinity;
    let maxHolidayTime = "";

    for (let i = 0; i < 24; i++) {
      const sunpopulNum = Number(sunbucket[i]?.popul_num?.value ?? 0) / sunCnt;
      const monpopulNum = Number(monbucket[i]?.popul_num?.value ?? 0) / monCnt;
      const tuepopulNum = Number(tuebucket[i]?.popul_num?.value ?? 0) / tueCnt;
      const wedpopulNum = Number(wedbucket[i]?.popul_num?.value ?? 0) / wedCnt;
      const thupopulNum = Number(thubucket[i]?.popul_num?.value ?? 0) / thuCnt;
      const fripopulNum = Number(fribucket[i]?.popul_num?.value ?? 0) / friCnt;
      const satpopulNum = Number(satbucket[i]?.popul_num?.value ?? 0) / satCnt;
      const weekpopulNum = Number(weekbucket[i]?.tot_sum.value ?? 0) / weekdayCnt;
      const holidaypopulNum = Number(holidaybucket[i]?.tot_sum.value ?? 0) / holidayCnt;

      const populNumArray = [
        sunpopulNum,
        monpopulNum,
        tuepopulNum,
        wedpopulNum,
        thupopulNum,
        fripopulNum,
        satpopulNum,
      ];

      const currentMaxPopulNum = Math.max(...populNumArray);
      const currentMinPopulNum = Math.min(...populNumArray);

      maxPopulNum = Math.round(maxPopulNum);
      minPopulNum = Math.round(minPopulNum);

      if (currentMaxPopulNum > maxPopulNum) {
        maxPopulNum = currentMaxPopulNum;
        maxTime = `${i}`;
        maxIndex = populNumArray.indexOf(maxPopulNum);
      }

      if (currentMinPopulNum < minPopulNum) {
        minPopulNum = currentMinPopulNum;
        minTime = `${i}`;
      }

      if (weekpopulNum > maxWeekPopulNum) {
        maxWeekPopulNum = weekpopulNum;
        maxWeekTime = `${i}`;
      }

      if (holidaypopulNum > maxHolidayPopulNum) {
        maxHolidayPopulNum = holidaypopulNum;
        maxHolidayTime = `${i}`;
      }

      Indicate1.push({
        구분: `${i}`,
        월: Math.round(monpopulNum),
        화: Math.round(tuepopulNum),
        수: Math.round(wedpopulNum),
        목: Math.round(thupopulNum),
        금: Math.round(fripopulNum),
        토: Math.round(satpopulNum),
        일: Math.round(sunpopulNum),
      });

      Indicate2.push({
        구분: `${i}`,
        평일: Math.round(weekpopulNum),
        휴일: Math.round(holidaypopulNum),
      });
    }

    const maxformTime = convertToTimeFormat(Number(maxTime));
    const maxWeekFormTime = convertToTimeFormat(Number(maxWeekTime));
    const maxHolidayFormTime = convertToTimeFormat(Number(maxHolidayTime));
    const maxDay = dayArray[maxIndex];
    results.push({
      title: "시간대별 내국인 생활인구",
      summary: `분석 기간 ${date} 동안 생활인구가 가장 많았던 요일은 {${maxDay}}로, {${maxformTime}}에 {${maxPopulNum.toLocaleString()}}명으로 가장 높게 집계됨,\n분석 기간 ${date} 동안 생활인구가 평일에는 {${maxWeekFormTime}}에 {${Math.round(
        maxWeekPopulNum
      ).toLocaleString()}}명으로 가장 많고, 휴일에는 {${maxHolidayFormTime}}에 {${Math.round(
        maxHolidayPopulNum
      ).toLocaleString()}}명으로 가장 많은 것으로 나타남`,
      charts: [
        {
          name: "timeDayPopData",
          indicate: Indicate1,
        },
        {
          name: "timeWeekPopData",
          indicate: Indicate2,
        },
      ],
    });
  }
  return results;
}

export async function transData5(data: any, start: string) {
  const results: any[] = [];
  let summaryContent4 = "";

  const Bucket = data?.aggregations?.by_region?.buckets || [];
  start = formatDate(start);

  const Indicate = [];
  for (const Item of Bucket) {
    const regionName = await convertCDtoNM(Item.key);
    const setBucket = Item?.by_time?.buckets;

    const daytimeHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const nighttimeHours = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8];

    let maxHomeDay = { hour: -1, value: 0 };
    let maxHomeNight = { hour: -1, value: 0 };

    let maxWorkDay = { hour: -1, value: 0 };
    let maxWorkNight = { hour: -1, value: 0 };

    let maxVisitDay = { hour: -1, value: 0 };
    let maxVisitNight = { hour: -1, value: 0 };

    let maxHomeTime = { hour: -1, value: 0 };
    let maxWorkTime = { hour: -1, value: 0 };
    let maxVisitTime = { hour: -1, value: 0 };

    let homeTime = "";
    let workTime = "";
    let visitTime = "";

    for (let i = 0; i < 24; i++) {
      const homepopulNum = Number(setBucket[i]?.home?.tot?.value ?? 0);
      const workpopulNum = Number(setBucket[i]?.work?.tot?.value ?? 0);
      const vistpopulNum = Number(setBucket[i]?.vist?.tot?.value ?? 0);

      if (daytimeHours.includes(i)) {
        if (homepopulNum > maxHomeDay.value)
          maxHomeDay = { hour: i, value: homepopulNum };
        if (workpopulNum > maxWorkDay.value)
          maxWorkDay = { hour: i, value: workpopulNum };
        if (vistpopulNum > maxVisitDay.value)
          maxVisitDay = { hour: i, value: vistpopulNum };
      } else if (nighttimeHours.includes(i)) {
        if (homepopulNum > maxHomeNight.value)
          maxHomeNight = { hour: i, value: homepopulNum };
        if (workpopulNum > maxWorkNight.value)
          maxWorkNight = { hour: i, value: workpopulNum };
        if (vistpopulNum > maxVisitNight.value)
          maxVisitNight = { hour: i, value: vistpopulNum };
      }

      maxHomeTime =
        maxHomeDay.value >= maxHomeNight.value
          ? { hour: maxHomeDay.hour, value: maxHomeDay.value }
          : { hour: maxHomeNight.hour, value: maxHomeNight.value };

      maxWorkTime =
        maxWorkDay.value >= maxWorkNight.value
          ? { hour: maxWorkDay.hour, value: maxWorkDay.value }
          : { hour: maxWorkNight.hour, value: maxWorkNight.value };

      maxVisitTime =
        maxVisitDay.value >= maxVisitNight.value
          ? { hour: maxVisitDay.hour, value: maxVisitDay.value }
          : { hour: maxVisitNight.hour, value: maxVisitNight.value };

      homeTime = convertToTimeFormat(maxHomeTime.hour);
      workTime = convertToTimeFormat(maxWorkTime.hour);
      visitTime = convertToTimeFormat(maxVisitTime.hour);

      Indicate.push({
        구분: `${i}`,
        거주인구: Math.round(homepopulNum),
        직장인구: Math.round(workpopulNum),
        방문인구: Math.round(vistpopulNum),
      });
      summaryContent4 = `생활패턴에 따르면, 거주인구는 {${homeTime}}에, 직장인구는 {${workTime}}에, 방문인구는 {${visitTime}}에 가장 많았습니다.`;
    }
    results.push({
      title: "시간대별 거주/직장/방문 인구",
      summary: `분석 기간 ${start} 동안 생활인구 중 생활패턴별로 거주인구는 {${homeTime}}에 {${Math.round(
        maxHomeNight.value > maxHomeDay.value
          ? maxHomeNight.value
          : maxHomeDay.value
      ).toLocaleString()}}명, 직장인구는 {${workTime}}에 {${Math.round(
        maxWorkNight.value > maxWorkDay.value
          ? maxWorkNight.value
          : maxWorkDay.value
      ).toLocaleString()}}명, 방문인구는 {${visitTime}}에 {${Math.round(
        maxVisitNight.value > maxVisitDay.value
          ? maxVisitNight.value
          : maxVisitDay.value
      ).toLocaleString()}}명으로 가장 높게 집계됨`,
      charts: [
        {
          name: "pTimeData",
          indicate: Indicate,
        },
      ],
    });
  }

  return { results, summaryContent4 };
}

export async function transData6(data1: any, data2: any, start: string) {
  const results: any[] = [];
  let summaryContent5 = "";

  const uniqueBucket = data1?.aggregations?.region_aggregation?.buckets || [];
  const liveBucket = data2?.aggregations?.by_region.buckets || [];
  const date = formatDate(start);

  for (const Item of liveBucket) {
    const male_tot_num = Item.male_population.value ?? 0;
    const feml_tot_num = Item.female_population.value ?? 0;
    const lawKey = Item.key;
    const regionName = await convertCDtoNM(Item.key);

    const uniqueItem = uniqueBucket.find(
      (uItem: any) => uItem.key === String(lawKey)
    );
    const unique_male_tot_num = uniqueItem?.male_population?.value ?? 0;
    const unique_feml_tot_num = uniqueItem?.female_population?.value ?? 0;

    const cGenderData = {
      name: "cGenderData",
      indicate: [
        {
          구분: "거주인구",
          남성: Math.round(male_tot_num),
          여성: Math.round(feml_tot_num),
        },
        {
          구분: "주민등록인구",
          남성: Math.round(unique_male_tot_num),
          여성: Math.round(unique_feml_tot_num),
        },
      ],
    };

    const ageGroups = [
      "10세 미만",
      "10~14세",
      "15~19세",
      "20~24세",
      "25~29세",
      "30~34세",
      "35~39세",
      "40~44세",
      "45~49세",
      "50~54세",
      "55~59세",
      "60~64세",
      "65~69세",
      "70~74세",
      "75~79세",
      "80세 이상",
    ];

    const ageData = [
      "tot_00_popul_num",
      "tot_10_popul_num",
      "tot_15_popul_num",
      "tot_20_popul_num",
      "tot_25_popul_num",
      "tot_30_popul_num",
      "tot_35_popul_num",
      "tot_40_popul_num",
      "tot_45_popul_num",
      "tot_50_popul_num",
      "tot_55_popul_num",
      "tot_60_popul_num",
      "tot_65_popul_num",
      "tot_70_popul_num",
      "tot_75_popul_num",
      "tot_80_popul_num",
    ];

    const cAgeData = {
      name: "cAgeData",
      indicate: ageGroups.map((group, index) => ({
        구분: group,
        거주인구: Math.round(Item[ageData[index]]?.value ?? 0),
        주민등록인구: Math.round(uniqueItem?.[ageData[index]]?.value ?? 0),
      })),
    };

    const liveGenderDiff = Math.abs(male_tot_num - feml_tot_num);
    const uniqueGenderDiff = Math.abs(
      unique_male_tot_num - unique_feml_tot_num
    );

    const maxLiveGender = male_tot_num > feml_tot_num ? "남성" : "여성";
    const maxUniqueGender =
      unique_male_tot_num > unique_feml_tot_num ? "남성" : "여성";

    const maxLiveAgeGroupIndex = ageGroups.reduce(
      (maxIndex, group, index) =>
        Item[ageData[index]]?.value > Item[ageData[maxIndex]]?.value
          ? index
          : maxIndex,
      0
    );
    const maxLiveAgeGroup = ageGroups[maxLiveAgeGroupIndex];

    const maxUniqueAgeGroupIndex = ageGroups.reduce(
      (maxIndex, group, index) =>
        uniqueItem?.[ageData[index]]?.value >
        uniqueItem?.[ageData[maxIndex]]?.value
          ? index
          : maxIndex,
      0
    );
    const maxUniqueAgeGroup = ageGroups[maxUniqueAgeGroupIndex];

    summaryContent5 = `주민등록인구와 비교해 거주인구는 {${maxLiveGender}}과 {${maxLiveAgeGroup}}, 주민등록인구는 {${maxUniqueGender}}과 {${maxUniqueAgeGroup}} 비중이 다소 높습니다.`;
    results.push({
      title: "성별, 연령대별 거주인구와 주민등록인구 비교",
      summary: `분석 기간 ${date}을 기준으로 거주인구는 {${maxLiveGender}}이(가) {${Math.round(
        liveGenderDiff
      ).toLocaleString()}}명으로 더 많고, 연령대 중 {${maxLiveAgeGroup}}이(가) 가장 많은 것으로 나타났습니다. 주민등록인구는 {${maxUniqueGender}}이(가) {${Math.round(
        uniqueGenderDiff
      ).toLocaleString()}}명으로 더 많고, 연령대 중 {${maxUniqueAgeGroup}}이(가) 가장 많은 것으로 나타났습니다.`,
      charts: [cGenderData, cAgeData],
    });
  }
  return { results, summaryContent5 };
}