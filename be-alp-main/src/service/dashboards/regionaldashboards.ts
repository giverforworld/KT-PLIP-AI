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
  getAvgHourLivePop,
  in_rankQuery,
  inPopQuery,
  inPurposeQuery,
  inWayQuery,
  ldgmtDayQuery,
  out_rankQuery,
  outPopQuery,
  outPurposeQuery,
  outWayQuery,
  stayDayQuery,
  stayPopQuery,
  timeLivePopQuery,
  timesetQuery,
} from "./regional";
import { calculateYear, calculateDates } from "@/helpers/convertDate";

export async function getSggAvgLivePopData(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const avgData = await getAvgHourLivePop(start, lastYear, prevMonth, region);
  return avgData;
}

export async function getStayLivePop(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const stay3LivePopData = await stayPopQuery(
    start,
    prevMonth,
    lastYear,
    region
  );
  return stay3LivePopData;
}

export async function getMovOut(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const movOutData = await outPopQuery(start, prevMonth, lastYear, region);
  return movOutData;
}

export async function getMovIn(start: string, region: string) {
  const { prevMonth, lastYear } = calculateDates(start);
  const movInData = await inPopQuery(start, prevMonth, lastYear, region);
  return movInData;
}

export async function getTimePop(start: string, region: string) {
  const timePopData = await timeLivePopQuery(start, region);
  return timePopData;
}

export async function getTimeSet(start: string, region: string) {
  const timeSetData = await timesetQuery(start, region);
  return timeSetData;
}

export async function getOutPurpose(start: string, region: string) {
  const outPurposeData = await outPurposeQuery(start, region);
  return outPurposeData;
}

export async function getInPurpose(start: string, region: string) {
  const inPurposeData = await inPurposeQuery(start, region);
  return inPurposeData;
}

export async function getOutWay(start: string, region: string) {
  const outWayData = await outWayQuery(start, region);
  return outWayData;
}

export async function getInWay(start: string, region: string) {
  const inWayData = await inWayQuery(start, region);
  return inWayData;
}

export async function getOutRank(start: string, region: string) {
  const outRankData = await out_rankQuery(start, region);
  return outRankData;
}

export async function getInRank(start: string, region: string) {
  const inRankData = await in_rankQuery(start, region);
  return inRankData;
}

export async function getStayDay(start: string, region: string) {
  const stayDayData = await stayDayQuery(start, region);
  return stayDayData;
}

export async function getLdgmtDay(start: string, region: string) {
  const ldgmtDayData = await ldgmtDayQuery(start, region);
  return ldgmtDayData;
}
