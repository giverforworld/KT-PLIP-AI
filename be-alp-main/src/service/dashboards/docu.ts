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
  dayQuery,
  periodQuery,
  sexQuery,
  timedateQuery,
  timesetQuery,
  timeznQuery,
  uniqueLiveQuery,
  uniqueQuery,
} from "./docu/overview";
import {
  calcMonthToDate,
  calculateDates,
  calculateFromLastYearMonthToPresentYearMonth,
} from "@/helpers/convertDate";
import {
  ageInQuery,
  ageOutQuery,
  comparedMovInPopQuery,
  comparedMovOutPopQuery,
  dayInQuery,
  dayOutQuery,
  inByPurposeQuery,
  inByWAYQuery,
  inflow_rankQuery,
  inSexAgeQuery,
  inSexAgeWayQuery,
  inSexQuery,
  inSexWayQuery,
  outByPurposeQuery,
  outByWayQuery,
  outflow_rankQuery,
  outSexAgeQuery,
  outSexAgeWayQuery,
  outSexQuery,
  outSexWayQuery,
  prpsInTimeQuery,
  prpsOutTimeQuery,
  timeInQuery,
  timeOutQuery,
  wayInTimeQuery,
  wayOutTimeQuery,
} from "./docu/overview_mop";
import {
  comparedDayQuery,
  comparedMonsQuery,
  comparedUniqueToStayPopQuery1,
  comparedUniqueToStayPopQuery2,
  dcrIndexQuery,
  dcrLdgmtIndexQuery,
  dcrTimeIndexQuery,
  inRsdnQuery,
  ldgmtDayQuery,
  stayDateQuery,
  staySexQuery,
  staytimebypopQuery,
} from "./docu/overview_llp";
import e from "express";

export async function getPeriodLiveData(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const periodData = await periodQuery(start, prevMonth, lastYear, region);
  return periodData;
}

export async function getSexLiveData(start: string, region: string) {
  const sexData = await sexQuery(start, region);
  return sexData;
}

export async function getDayData(start: string, region: string) {
  const dayData = await dayQuery(start, region);
  return dayData;
}

export async function getTimeData(start: string, region: string) {
  const timeData = await timeznQuery(start, region);
  return timeData;
}

export async function getTimeDateData(start: string, region: string) {
  const timedateData = await timedateQuery(start, region);
  return timedateData;
}

export async function getTimeSetData(start: string, region: string) {
  const setData = await timesetQuery(start, region);
  return setData;
}

export async function getUniqueData(start: string, region: string) {
  const uniquePopulData = await uniqueQuery(start, region);
  return uniquePopulData;
}

export async function getUniqueLiveData(start: string, region: string) {
  const uniqueLiveData = await uniqueLiveQuery(start, region);
  return uniqueLiveData;
}

export async function getOutPurposeData(start: string, region: string) {
  const outPurposeData = await outflow_rankQuery(start, region);
  return outPurposeData;
}

export async function getInPurposeData(start: string, region: string) {
  const inPurposeData = await inflow_rankQuery(start, region);
  return inPurposeData;
}

export async function getPeriodOutPurposeData(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const outPeriodPurposeData = comparedMovOutPopQuery(
    start,
    prevMonth,
    lastYear,
    region
  );
  return outPeriodPurposeData;
}

export async function getPeriodInPurposeData(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const inPeriodPurposeData = await comparedMovInPopQuery(
    start,
    prevMonth,
    lastYear,
    region
  );
  return { inPeriodPurposeData, prevMonth, lastYear };
}

export async function getDayOutPurposeData(start: string, region: string) {
  const dayOutData = await dayOutQuery(start, region);
  return dayOutData;
}

export async function getDayInPurposeData(start: string, region: string) {
  const dayInData = await dayInQuery(start, region);
  return dayInData;
}

export async function getTimeOutPurposeData(start: string, region: string) {
  const timeOutData = await timeOutQuery(start, region);
  return timeOutData;
}

export async function getTimeInPurposeData(start: string, region: string) {
  const timeInData = await timeInQuery(start, region);
  return timeInData;
}

export async function getAgeOutPurposeData(start: string, region: string) {
  const ageOutData = await ageOutQuery(start, region);
  return ageOutData;
}

export async function getAgeInPurposeData(start: string, region: string) {
  const ageInData = await ageInQuery(start, region);
  return ageInData;
}

export async function getOutByPurposeData(start: string, region: string) {
  const prpsOutData = await outByPurposeQuery(start, region);
  return prpsOutData;
}

export async function getInByPurposeData(start: string, region: string) {
  const prpsInData = await inByPurposeQuery(start, region);
  return prpsInData;
}

export async function getPrpsOutTimeData(start: string, region: string) {
  const prpsOutTimeData = await prpsOutTimeQuery(start, region);
  return prpsOutTimeData;
}

export async function getPrpsInTimeData(start: string, region: string) {
  const prpsInTimeData = await prpsInTimeQuery(start, region);
  return prpsInTimeData;
}

export async function getInSexData(start: string, region: string) {
  const prpsInSexData = await inSexQuery(start, region);
  return prpsInSexData;
}

export async function getInSexAgeData(start: string, region: string) {
  const prpsInSexAgeData = await inSexAgeQuery(start, region);
  return prpsInSexAgeData;
}

export async function getOutSexData(start: string, region: string) {
  const prpsOutSexData = await outSexQuery(start, region);
  return prpsOutSexData;
}

export async function getOutSexAgeData(start: string, region: string) {
  const prpsOutSexAgeData = await outSexAgeQuery(start, region);
  return prpsOutSexAgeData;
}

export async function getOutByWayData(start: string, region: string) {
  const wayOutData = await outByWayQuery(start, region);
  return wayOutData;
}

export async function getInByWayData(start: string, region: string) {
  const wayInData = await inByWAYQuery(start, region);
  return wayInData;
}

export async function getWayOutTimeData(start: string, region: string) {
  const wayOutTimeData = await wayOutTimeQuery(start, region);
  return wayOutTimeData;
}

export async function getWayInTimeData(start: string, region: string) {
  const wayInTimeData = await wayInTimeQuery(start, region);
  return wayInTimeData;
}

export async function getWaySexAgeIn(start: string, region: string) {
  const WayInSexAgeData = await inSexAgeWayQuery(start, region);
  return WayInSexAgeData;
}

export async function getWaySexIn(start: string, region: string) {
  const WayInSexData = await inSexWayQuery(start, region);
  return WayInSexData;
}

export async function getWaySexAgeOut(start: string, region: string) {
  const WayOutSexAgeData = await outSexAgeWayQuery(start, region);
  return WayOutSexAgeData;
}

export async function getWaySexOut(start: string, region: string) {
  const WayOutSexData = await outSexWayQuery(start, region);
  return WayOutSexData;
}

export async function getComparedStayPop(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const comparedStayPopData = await comparedMonsQuery(
    start,
    prevMonth,
    lastYear,
    region
  );
  return { comparedStayPopData, prevMonth, lastYear };
}

export async function getComparedStayDayPop(start: string, region: string) {
  const comparedStayDayPopData = await comparedDayQuery(start, region);
  return comparedStayDayPopData;
}

export async function getStaySexPop(start: string, region: string) {
  const staySexPopData = await staySexQuery(start, region);
  return staySexPopData;
}

export async function getUniqueStayPop(start: string, region: string) {
  const {
    prevYear1,
    prevYear2,
    prevYear3,
    prevYear4,
    prevYear5,
    prevYear6,
    prevYear7,
    prevYear8,
    prevYear9,
    prevYear10,
    prevYear11,
    prevYear12,
  } = calculateFromLastYearMonthToPresentYearMonth(start);
  const stayUniquePopData = await comparedUniqueToStayPopQuery1(
    start,
    region,
    prevYear1,
    prevYear2,
    prevYear3,
    prevYear4,
    prevYear5,
    prevYear6,
    prevYear7,
    prevYear8,
    prevYear9,
    prevYear10,
    prevYear11,
    prevYear12
  );
  return {
    stayUniquePopData,
    prevYear1,
    prevYear2,
    prevYear3,
    prevYear4,
    prevYear5,
    prevYear6,
    prevYear7,
    prevYear8,
    prevYear9,
    prevYear10,
    prevYear11,
    prevYear12,
  };
}

export async function getUniquePop(start: string, region: string) {
  const {
    prevYear1,
    prevYear2,
    prevYear3,
    prevYear4,
    prevYear5,
    prevYear6,
    prevYear7,
    prevYear8,
    prevYear9,
    prevYear10,
    prevYear11,
    prevYear12,
  } = calculateFromLastYearMonthToPresentYearMonth(start);
  const stayUniqueData = await comparedUniqueToStayPopQuery2(
    start,
    region,
    prevYear1,
    prevYear2,
    prevYear3,
    prevYear4,
    prevYear5,
    prevYear6,
    prevYear7,
    prevYear8,
    prevYear9,
    prevYear10,
    prevYear11,
    prevYear12
  );
  return stayUniqueData;
}

export async function getStayAvgDate(start: string, region: string) {
  const stayAvgData = await stayDateQuery(start, region);
  return stayAvgData;
}

export async function getDcrIndex(start: string) {
  const dcrIndexData = await dcrIndexQuery(start);
  return dcrIndexData;
}

export async function getStayTimeByPop(start: string, region: string) {
  const timeByPopData = await staytimebypopQuery(start, region);
  return timeByPopData;
}

export async function getDcrTimeIndex(start: string) {
  const dcrTimeIndexData = await dcrTimeIndexQuery(start);
  return dcrTimeIndexData;
}

export async function getLdgmtAvgDate(start: string, region: string) {
  const ldgmtAvgData = await ldgmtDayQuery(start, region);
  return ldgmtAvgData;
}

export async function getDcrLdgmtIndex(start: string) {
  const dcrLdgmtIndexData = await dcrLdgmtIndexQuery(start);
  return dcrLdgmtIndexData;
}

export async function getInRsdnData(start: string, region: string) {
  const inRsdnData = await inRsdnQuery(start, region);
  return inRsdnData;
}
