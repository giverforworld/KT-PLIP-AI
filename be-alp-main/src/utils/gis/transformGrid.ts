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
import { convertCoordinate } from "@/helpers/convertCoordinate";
import {
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM } from "@/helpers/convertNM";
import { isValidMonth } from "@/middlewares/validators";

export async function transCompositeGridData(
  data: any[],
  options: GisAlpChartParams,
  isTimeSeries: boolean
): Promise<MapDataGrid[]> {
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
  const result: { [key: string]: MapDataGrid } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "sido"
      : regionArray[0].length === 5
      ? "sgg"
      : "adm";
  const regionCD =
    regionType === "sido"
      ? "SIDO_CD"
      : regionType === "sgg"
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  // 모든 비동기 작업을 수집하기 위한 배열
  for (const [key, value] of Object.entries(data)) {
    for (const item of value) {
      const regionCode = item.key[regionCD];

      const timestamp = isTimeSeries
        ? typeof item.key.TIME_BASE_TMST === "string"
          ? Number(item.key.TIME_BASE_TMST) * 1000
          : item.key.TIME_BASE_TMST * 1000
        : startTs;

      if (!result[regionCode]) {
        result[regionCode] = {
          time: 0,
          regionCode: 0,
          regionName: "",
          options: { start: startTs, end: endTs, regionArray },
          layerData: {},
        };
      }

      if (!result[regionCode].layerData[timestamp]) {
        result[regionCode].layerData[timestamp] = {
          0.25: [],
          0.5: [],
          1: [],
        };
      }

      const coord = convertCoordinate(item.key[`CELL_ID_${key}`]);
      const cellId = parseInt(key) / 1000;

      // count 객체 생성
      let count: any;
      // if (!isTimeSeries) {
      //   count = {};
      //   // MALE_, FEML_로 시작하는 속성만 필터링하여 count에 추가
      //   Object.entries(item).forEach(([keyName, valueObj]: [string, any]) => {
      //     if (
      //       (keyName.startsWith("MALE_") || keyName.startsWith("FEML_")) &&
      //       valueObj.value !== undefined
      //     ) {
      //       count[keyName] = valueObj.value;
      //     }
      //   });
      // } else {
      //   count = item.popul_avg.value;
      // }
      count = Math.round(item.popul_avg.value);
      // 결과 추가
      result[regionCode].layerData[timestamp][cellId].push({
        time: timestamp,
        count,
        coord,
      });
      // 최초 데이터 시에만 기본 필드 정보 저장
      if (!result[regionCode].regionCode) {
        result[regionCode].regionCode = regionCode;
        result[regionCode].regionName = await convertCDtoFullNM(regionCode);
        result[regionCode].time = timestamp;
      }
    }
  }

  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

export async function trans50GridData(
  data: any[],
  options: GisAlpGridParams,
  isTimeSeries: boolean
): Promise<MapDataGrid[]> {
  const { start, end, regionArray, timeznArray } = options;
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
  const result: { [key: string]: MapDataGrid } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "sido"
      : regionArray[0].length === 5
      ? "sgg"
      : "adm";
  const regionCD =
    regionType === "sido"
      ? "SIDO"
      : regionType === "sgg"
      ? "SGG"
      : "ADM";
  // 모든 비동기 작업을 수집하기 위한 배열
  for (const [key, value] of Object.entries(data)) {
    for (const item of value) {
      const regionCode = item.key[regionCD];

      const timestamp = isTimeSeries
        ? typeof item.key.TIME_BASE_TMST === "string"
          ? Number(item.key.TIME_BASE_TMST) * 1000
          : item.key.TIME_BASE_TMST * 1000
        : startTs;

      if (!result[regionCode]) {
        result[regionCode] = {
          time: 0,
          regionCode: 0,
          regionName: "",
          options: { start: startTs, end: endTs, regionArray, timeznArray },
          layerData: {},
        };
      }

      if (!result[regionCode].layerData[timestamp]) {
        result[regionCode].layerData[timestamp] = {
          0.05: [],
        };
      }

      const coord: [number, number] = [
        item.key[`LONG_NUM`],
        item.key[`LAT_NUM`],
      ]
      const cellId = parseInt(key) / 1000;

      // count 객체 생성
      let count: any;
      count = Math.round(item.popul_avg.value);
      // 결과 추가
      result[regionCode].layerData[timestamp][cellId].push({
        time: timestamp,
        count,
        coord,
      });
      // 최초 데이터 시에만 기본 필드 정보 저장
      if (!result[regionCode].regionCode) {
        result[regionCode].regionCode = regionCode;
        result[regionCode].regionName = await convertCDtoFullNM(regionCode);
        result[regionCode].time = timestamp;
      }
    }
  }
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

export async function transGridData(
  data: any[],
  options: GisAlpGridParams,
  isTimeSeries: boolean
): Promise<MapDataGrid[]> {
  const { start, end, regionArray, timeznArray } = options;
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
  const result: { [key: string]: MapDataGrid } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "sido"
      : regionArray[0].length === 5
      ? "sgg"
      : "adm";
  const regionCD =
    regionType === "sido"
      ? "SIDO_CD"
      : regionType === "sgg"
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  // 모든 비동기 작업을 수집하기 위한 배열
  for (const [key, value] of Object.entries(data)) {
    for (const item of value) {
      const regionCode = item.key[regionCD];

      const timestamp = isTimeSeries
        ? typeof item.key.TIME_BASE_TMST === "string"
          ? Number(item.key.TIME_BASE_TMST) * 1000
          : item.key.TIME_BASE_TMST * 1000
        : startTs;

      if (!result[regionCode]) {
        result[regionCode] = {
          time: 0,
          regionCode: 0,
          regionName: "",
          options: { start: startTs, end: endTs, regionArray, timeznArray },
          layerData: {},
        };
      }

      if (!result[regionCode].layerData[timestamp]) {
        result[regionCode].layerData[timestamp] = {
          0.25: [],
          0.5: [],
          1: [],
        };
      }

      const coord = convertCoordinate(item.key[`CELL_ID_${key}`]);
      const cellId = parseInt(key) / 1000;

      // count 객체 생성
      let count: any;
      count = Math.round(item.popul_avg.value);
      // 결과 추가
      result[regionCode].layerData[timestamp][cellId].push({
        time: timestamp,
        count,
        coord,
      });
      // 최초 데이터 시에만 기본 필드 정보 저장
      if (!result[regionCode].regionCode) {
        result[regionCode].regionCode = regionCode;
        result[regionCode].regionName = await convertCDtoFullNM(regionCode);
        result[regionCode].time = timestamp;
      }
    }
  }

  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}