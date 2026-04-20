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

import { isValidMonth } from "@/middlewares/validators";
import util from "util";
import { convertCDtoCoord } from "@/helpers/convertCoordinate";
import {
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM } from "@/helpers/convertNM";

// 유입분석
export async function transLlpData(
  data: any[],
  options: GisLlpParams
): Promise<MapMopData[]> {
  const { start, end, isIn, region } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapMopData } = {};

  //데이터 없음
  if (!data || data.length === 0) {
    return [];
  }
  const safeStart = String(start ?? "");
  if (!/^\d{6}(\d{2})?$/.test(safeStart)) {
    throw new Error("Invalid start format")
  }

  const baseYM = safeStart.slice(0, 6);

  const regionCode = Number(region);
  const regionName = await convertCDtoFullNM(regionCode);
  const regionCoord = await convertCDtoCoord(regionCode, safeStart.slice(0, 6));

  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const destinationCode = item.key;
    const destinationName = await convertCDtoFullNM(destinationCode);
    const destinationCoord = await convertCDtoCoord(destinationCode, baseYM);

    const timestamp = startTs;

    if (!result[regionCode]) {
      result[regionCode] = {
        time: startTs,
        regionCode: regionCode,
        regionName: regionName,
        center: regionCoord,
        options: {
          start: startTs,
          end: endTs,
          region,
          isIn,
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
        center: regionCoord, // 공간 벡터일 경우 추가
        destinations: [],
      };
    }

    let count: any;
    count = Math.round(item.popul_sum.value);
    // 새로운 destination을 destinations 배열에 추가합니다.
    result[regionCode].layerData[timestamp].destinations.push({
      regionCode: destinationCode,
      regionName: destinationName,
      count,
      center: destinationCoord,
      timeOri: timestamp,
      timeDes: timestamp + 86400000, // 하루 +1
    });
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

// 인구감소지역비교
export async function transLLPTripData(
  data: any[],
  options: GisLlpParams
): Promise<MapPolygonData[]> {
  const { start, end, gender, ageArray, isIn } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapPolygonData } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const safeStart = String(start ?? "");
  if (!/^\d{6}(\d{2})?$/.test(safeStart)) {
    throw new Error("Invalid start format")
  }

  const baseYM = safeStart.slice(0, 6);
  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key;
    const regionName = await convertCDtoFullNM(regionCode);
    const regionCoord = await convertCDtoCoord(regionCode, baseYM);

    const subRegionCode = item.key;
    const subRegionName = await convertCDtoFullNM(subRegionCode);
    const subRegionCoord = await convertCDtoCoord(subRegionCode, baseYM);
    const timestamp = startTs;

    if (!result[timestamp]) {
      result[timestamp] = {
        time: startTs,
        regionCode: regionCode,
        regionName: regionName,
        center: regionCoord,
        options: {
          start: startTs,
          end: endTs,
          // dayArray,
          isIn,
        },
        layerData: {},
      };
    }

    // `layerData` 내의 `regionCode` 객체 초기화
    if (!result[timestamp].layerData) {
      result[timestamp].layerData = {}; // 추가된 부분
    }

    if (!result[timestamp].layerData[timestamp]) {
      result[timestamp].layerData[timestamp] = [];
    }
    let count: any;
    count = Math.round(item.popul_sum.value)

    result[timestamp].layerData[timestamp].push({
      regionCode: subRegionCode,
      regionName: subRegionName,
      count,
      center: subRegionCoord,
    });
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}
