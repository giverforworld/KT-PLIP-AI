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
import {
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoNM } from "@/helpers/convertNM";
import { isValidMonth } from "@/middlewares/validators";

export async function transChartTimeSeriesData(
  data: any[],
  options: GisAlpChartParams
): Promise<GisChart[]> {
  const { start, end, regionArray } = options;
  let startStr = start;
  let endStr = end;
  if (isValidMonth(start)) {
    const convertDate = getStartEndDate(startStr, endStr);
    startStr = formatDateToYYYYMMDD(convertDate.startDate);
    endStr = formatDateToYYYYMMDD(convertDate.endDate);
  }

  const startTs = convertToUnixTimestamp(startStr);
  const endTs = convertToUnixTimestamp(endStr, true);

  // result를 객체로 선언하여 regionCode를 키로 사용합니다.
  const result: { [key: string]: GisChart } = {};
  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "sido"
      : regionArray[0].length === 5
      ? "sgg"
      : "adm";

  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode =
      item.key[
        regionType === "sido"
          ? "SIDO_CD"
          : regionType === "sgg"
          ? "SGG_CD"
          : "ADMNS_DONG_CD"
      ];

    const timestamp =
      typeof item.key.TIME_BASE_TMST === "string"
        ? Number(item.key.TIME_BASE_TMST) * 1000
        : item.key.TIME_BASE_TMST * 1000;

    if (!result[regionCode]) {
      result[regionCode] = {
        time: 0,
        regionCode: 0,
        regionName: "",
        options: { start: startTs, end: endTs, regionArray: regionArray },
        chartData: {},
      };
    }

    if (!result[regionCode].chartData[timestamp]) {
      result[regionCode].chartData[timestamp] = {};
    }

    result[regionCode].chartData[timestamp] = {
      count: Math.round(item.popul_avg.value),
    };

    // 최초 데이터 시에만 기본 필드 정보 저장
    if (!result[regionCode].regionCode) {
      result[regionCode].regionCode = regionCode;
      result[regionCode].regionName = await convertCDtoNM(regionCode);
      result[regionCode].time = timestamp;
    }
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);

  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

export function normalizeNumberArray(v: any): number[] {
  if (Array.isArray(v)) {
    return v.map(Number);
  }

  if (typeof v === "object" && v !== null) {
    return Object.values(v).map(Number);
  }

  return [Number(v)]
}