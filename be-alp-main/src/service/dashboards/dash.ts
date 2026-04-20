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
  comparePeriodLastYear,
  getLivePop,
  getMovPop,
  getStayPop,
} from "./sidoService";
import {
  getHourLivePop,
  getInFlow,
  getOutFlow,
  getRgnChangeInfo,
  getSidoInfo,
  getStay3Pop,
} from "./sidoMain";
import util from "util";
import { calculateYear, calculateDates } from "@/helpers/convertDate";

export async function getSidoAlpData(start: string) {
  const results: { [key: string]: any } = {};
  const sido = await getLivePop(start);
  return sido;
}

export async function getSidoLlpData(start: string) {
  const results: { [key: string]: any } = {};
  const sido = await getStayPop(start);
  return sido;
}

export async function getSidoMopData(start: string) {
  const results: { [key: string]: any } = {};
  const sido = await getMovPop(start);
  return sido;
}

export async function getSidoPeriodData(start: string): Promise<any> {
  const results: { [key: string]: any } = {};
  const lastYear = calculateYear(start);
  const monthResult = await comparePeriodLastYear(start, lastYear);

  results.month = monthResult;
  return results;
}

export async function getSidoHourData(start: string): Promise<any> {
  const { prevMonth, lastYear } = calculateDates(start);
  const results = await getHourLivePop(start, lastYear, prevMonth);
  return results;
}

export async function getStay3Data(start: string): Promise<any> {
  const { prevMonth, lastYear } = calculateDates(start);
  const results = await getStay3Pop(start, lastYear, prevMonth);
  return results;
}

export async function getInFlowData(start: string): Promise<any> {
  const { prevMonth, lastYear } = calculateDates(start);
  const results = await getInFlow(start, lastYear, prevMonth);
  return results;
}

export async function getOutFlowData(start: string): Promise<any> {
  const { prevMonth, lastYear } = calculateDates(start);
  const results = await getOutFlow(start, lastYear, prevMonth);
  return results;
}

export async function getSidoInfoData(start: string): Promise<any> {
  const { prevMonth, lastYear } = calculateDates(start);
  const results = await getSidoInfo(start, lastYear, prevMonth);
  return results;
}

export async function getRgnChangedInfoData(): Promise<any> {
  const results = await getRgnChangeInfo();
  return results;
}
