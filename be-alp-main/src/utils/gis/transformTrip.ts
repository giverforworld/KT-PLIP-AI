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
  convertCDtoCoord,
  convertCoordinate,
} from "@/helpers/convertCoordinate";
import {
  checkHoliday,
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM } from "@/helpers/convertNM";
import { getHolidays } from "../holidays";

export async function transTripData(
  data: any[],
  options: GisMopParamsOptions
): Promise<MapDataTrip[]> {
  const { isInflow, isPurpose, start, end, regionArray, timeznArray } = options;
  let startStr = start;
  let endStr = end;
  if (start.length === 6) {
    const convertDate = getStartEndDate(startStr, endStr);
    startStr = formatDateToYYYYMMDD(convertDate.startDate);
    endStr = formatDateToYYYYMMDD(convertDate.endDate);
  }
  const startTs = convertToUnixTimestamp(startStr);
  const endTs = convertToUnixTimestamp(endStr, true);

  // result를 객체로 선언하여 regionCode를 키로 사용합니다.
  const result: { [key: string]: MapDataTrip } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADMNS_DONG";
  const regionCD = `${isInflow ? "DETINA" : "PDEPAR"}_${regionType}_CD`; //기준지역
  const destiRegionCD = `${isInflow ? "PDEPAR" : "DETINA"}_${regionType}_CD`; //도착지역
  const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  const baseYM = start.slice(0, 6);
  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key[regionCD];
    const regionName = await convertCDtoFullNM(regionCode);
    const regionCoord = await convertCDtoCoord(regionCode, baseYM);
    const timestamp = item.key.BASE_YMD - 32400000; //한국 시간대로 변경 - 9시간

    const destinationCode = item.key[destiRegionCD];
    const destinationName = await convertCDtoFullNM(destinationCode);
    const destinationCoord = await convertCDtoCoord(destinationCode, baseYM);

    if (!result[regionCode]) {
      result[regionCode] = {
        time: startTs,
        regionCode: regionCode,
        regionName: regionName,
        center: regionCoord,
        options: {
          start: startTs,
          end: endTs,
          regionArray,
          timeznArray,
        },
        layerData: {},
      };
    }

    // `layerData` 내의 `regionCode` 객체 초기화
    if (!result[regionCode].layerData) {
      result[regionCode].layerData = {}; // 추가된 부분
    }

    // `layerData` 내의 `regionCode` 객체 초기화
    if (!result[regionCode].layerData[timestamp]) {
      result[regionCode].layerData[timestamp] = {
        regionCode,
        regionName: regionName,
        destinations: [],
      };
    }

    // destinations에 데이터를 추가할 때, 동일한 destinationCode가 있는지 확인
    const existingDestination = result[regionCode].layerData[
      timestamp
    ].destinations.find(
      (destination) => destination.regionCode === destinationCode
    );

    if (existingDestination) {
      // destinationCode가 이미 존재하는 경우, count 데이터를 합칩니다.
      for (const [key, value] of Object.entries(item.popul_sum.value)) {
        // 예: MALE_50_6 또는 FEMALE_60_5와 같은 키로 설정
        const countKey = `${isPurpose ? "PRPS" : "WAY"}${item.key[category]}_${
          item.key["IN_FORN_DIV_NM"] === 1 ? "DMST" : "FORE"
        }_${key}`;
        existingDestination.count[countKey] = value as number;
      }
    } else {
      // destinationCode가 존재하지 않는 경우, 새로운 destination을 추가합니다.
      const count = Object.fromEntries(
        Object.entries(item.popul_sum.value).map(([key, value]) => [
          `${isPurpose ? "PRPS" : "WAY"}${item.key[category]}_${
            item.key["IN_FORN_DIV_NM"] === 1 ? "DMST" : "FORE"
          }_${key}`,
          value as number,
        ])
      );

      // 새로운 destination을 destinations 배열에 추가합니다.
      result[regionCode].layerData[timestamp].destinations.push({
        regionCode: destinationCode,
        regionName: destinationName,
        count: count,
        center: destinationCoord,
        timeOri: timestamp,
        timeDes: timestamp + 86400000, // 하루 +1
      });
    }
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}
