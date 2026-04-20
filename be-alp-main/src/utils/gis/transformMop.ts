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
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM } from "@/helpers/convertNM";
// 행정구역
export async function transMopData(
  data: any[],
  options: GisMopParams,
  isTimeSeries: boolean
): Promise<MapMopData[]> {
  const {
    spaceType,
    regionArray,
    start,
    end,
    timeznArray,
    isInflow,
    isPurpose,
  } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapMopData } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }
  //개발용
  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역
  const destiRegionCD = `${isInflow ? "P" : "D"}${regionType}`; //도착지역
  const tmstCD = isInflow ? "ATMST" : "STMST";
  // const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  const baseYM = start.slice(0, 6);
  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key[regionCD];
    const regionName = await convertCDtoFullNM(regionCode);
    const regionCoord = await convertCDtoCoord(regionCode, baseYM);
    const destinationCode = item.key[destiRegionCD];
    const destinationName = await convertCDtoFullNM(destinationCode);
    const destinationCoord = await convertCDtoCoord(destinationCode, baseYM);

    const timestamp = isTimeSeries
      ? typeof item.key[tmstCD] === "string"
        ? Number(item.key[tmstCD]) * 1000
        : item.key[tmstCD] * 1000
      : startTs;

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
          isPurpose,
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
        ...(spaceType === 2 && { center: regionCoord }), // 공간 벡터일 경우 추가
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
      for (let i = 0; i < 8; i++) {
        if (isPurpose && i === 7) continue;

        const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
        (existingDestination.count[countKey] || 0) +
          item[`popul_sum${i}`]?.value || 0;
      }
    } else {
      // destinationCode가 존재하지 않는 경우, 새로운 destination을 추가합니다.
      const count: { [key: string]: number } = {};
      for (let i = 0; i < 8; i++) {
        if (isPurpose && i === 7) continue;
        const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
        count[countKey] = item[`popul_sum${i}`].value || 0;
      }
      // const count = {
      //   [`${isPurpose ? "PRPS" : "WAY"}`]:
      //     item.popul_sum.value,
      // };

      // 새로운 destination을 destinations 배열에 추가합니다.
      result[regionCode].layerData[timestamp].destinations.push({
        regionCode: destinationCode,
        regionName: destinationName,
        count: count,
        center: destinationCoord,
        ...(spaceType === 0 && {
          timeOri: timestamp,
          timeDes: timestamp + 86400000, // 하루 +1
        }),
      });
    }
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

// 차트 시계열
export async function transMopChartTimeSeriesData(
  data: any[],
  options: GisMopChartParams
): Promise<GisMopChart[]> {
  const { regionArray, start, end, isInflow, isPurpose } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: GisMopChart } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역

  //개발용
  // const tmstCD =
  //   spaceType === 0
  //     ? isInflow
  //       ? "ARVL_BASE_TMST"
  //       : "STRNG_BASE_TMST"
  //     : isInflow
  //     ? "ARVL_TIME_BASE_TMST"
  //     : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ATMST" : "STMST";

  // const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key[regionCD];
    const regionName = await convertCDtoFullNM(regionCode);

    const timestamp =
      typeof item.key[tmstCD] === "string"
        ? Number(item.key[tmstCD]) * 1000
        : item.key[tmstCD] * 1000;

    if (!result[regionCode]) {
      result[regionCode] = {
        time: startTs,
        regionCode: regionCode,
        regionName: regionName,
        options: {
          start: startTs,
          end: endTs,
          regionArray,
          isPurpose,
        },
        chartData: {},
      };
    }

    if (!result[regionCode].chartData[timestamp]) {
      result[regionCode].chartData[timestamp] = { count: {} };
    }
    for (let i = 0; i < 8; i++) {
      if (isPurpose && i === 7) continue;
      const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
      const newCount = {
        [countKey]: Math.round(item[`popul_sum${i}`]?.value) || 0,
      };
      // Accumulate the count values instead of overwriting
      result[regionCode].chartData[timestamp].count = {
        ...result[regionCode].chartData[timestamp].count,
        ...newCount,
      };
    }
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}

// 격자
export async function transMopGridData(
  data: any[],
  options: GisMopGridParams,
  isTimeSeries: boolean
): Promise<MapDataGrid[]> {
  const { regionArray, start, end, timeznArray, isInflow, isPurpose } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapDataGrid } = {};

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
  const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  //개발용
  // const tmstCD = isInflow ? "ARVL_TIME_BASE_TMST" : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ARVL_BASE_TMST" : "STRNG_BASE_TMST";

  // 모든 비동기 작업을 수집하기 위한 배열
  for (const [key, value] of Object.entries(data)) {
    for (const item of value) {
      const regionCode = item.key[regionCD];
      const regionName = await convertCDtoFullNM(regionCode);

      const timestamp = isTimeSeries
        ? typeof item.key[tmstCD] === "string"
          ? Number(item.key[tmstCD]) * 1000
          : item.key[tmstCD] * 1000
        : startTs;

      if (!result[regionCode]) {
        result[regionCode] = {
          time: startTs,
          regionCode: regionCode,
          regionName: regionName,
          options: {
            start: startTs,
            end: endTs,
            regionArray,
            timeznArray,
            isPurpose,
          },
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

      const cellSizeKey = parseInt(key) / 1000;
      const layerData = result[regionCode].layerData[timestamp];

      // cellSizeKey 초기화
      if (!layerData[cellSizeKey]) {
        layerData[cellSizeKey] = [];
      }

      const existingDestination = layerData[cellSizeKey].find(
        (cell) => JSON.stringify(cell.coord) === JSON.stringify(coord)
      );

      if (existingDestination) {
        // 기존 destination의 count 데이터를 갱신
        for (let i = 0; i < 8; i++) {
          if (isPurpose && i === 7) continue;

          const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
          existingDestination.count[countKey] =
            (existingDestination.count[countKey] || 0) +
              item[`popul_sum${i}`]?.value || 0;
        }
      } else {
        // 새로운 destination 추가
        const count: { [key: string]: number } = {};
        for (let i = 0; i < 8; i++) {
          if (isPurpose && i === 7) continue;

          const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
          count[countKey] = Math.round(item[`popul_sum${i}`].value) || 0;
        }
        layerData[cellSizeKey].push({
          time: timestamp,
          count: count,
          coord,
        });
      }
    }
  }

  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}
// 행정구역 시계열
export async function transMopTimeData(
  data: any[],
  options: GisMopTimeParams,
  isTimeSeries: boolean
): Promise<MapMopData[]> {
  const { spaceType, regionArray, start, end, isInflow, isPurpose } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapMopData } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }
  //개발용
  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역
  const destiRegionCD = `${isInflow ? "P" : "D"}${regionType}`; //도착지역
  const tmstCD = isInflow ? "ATMST" : "STMST";
  // const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  const baseYM = start.slice(0, 6);
  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key[regionCD];
    const regionName = await convertCDtoFullNM(regionCode);
    const regionCoord = await convertCDtoCoord(regionCode, baseYM);
    const destinationCode = item.key[destiRegionCD];
    const destinationName = await convertCDtoFullNM(destinationCode);
    const destinationCoord = await convertCDtoCoord(destinationCode, baseYM);

    const timestamp = isTimeSeries
      ? typeof item.key[tmstCD] === "string"
        ? Number(item.key[tmstCD]) * 1000
        : item.key[tmstCD] * 1000
      : startTs;

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
          isPurpose,
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
        ...(spaceType === 2 && { center: regionCoord }), // 공간 벡터일 경우 추가
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
      for (let i = 0; i < 8; i++) {
        if (isPurpose && i === 7) continue;

        const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
        (existingDestination.count[countKey] || 0) +
          item[`popul_sum${i}`]?.value || 0;
      }
    } else {
      // destinationCode가 존재하지 않는 경우, 새로운 destination을 추가합니다.
      const count: { [key: string]: number } = {};
      for (let i = 0; i < 8; i++) {
        if (isPurpose && i === 7) continue;
        const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
        count[countKey] = item[`popul_sum${i}`].value || 0;
      }
      // const count = {
      //   [`${isPurpose ? "PRPS" : "WAY"}`]:
      //     item.popul_sum.value,
      // };

      // 새로운 destination을 destinations 배열에 추가합니다.
      result[regionCode].layerData[timestamp].destinations.push({
        regionCode: destinationCode,
        regionName: destinationName,
        count: count,
        center: destinationCoord,
        ...(spaceType === 0 && {
          timeOri: timestamp,
          timeDes: timestamp + 86400000, // 하루 +1
        }),
      });
    }
  });

  // 모든 비동기 작업이 완료될 때까지 기다립니다.
  await Promise.all(promises);
  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}
// 격자 시계열
export async function transMopGridTimeData(
  data: any[],
  options: GisMopTimeParams,
  isTimeSeries: boolean
): Promise<MapDataGrid[]> {
  const { regionArray, start, end, isInflow, isPurpose } = options;

  //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
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
  const result: { [key: string]: MapDataGrid } = {};

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
  const category = isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD";

  //개발용
  // const tmstCD = isInflow ? "ARVL_TIME_BASE_TMST" : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ARVL_BASE_TMST" : "STRNG_BASE_TMST";

  // 모든 비동기 작업을 수집하기 위한 배열
  for (const [key, value] of Object.entries(data)) {
    for (const item of value) {
      const regionCode = item.key[regionCD];
      const regionName = await convertCDtoFullNM(regionCode);

      const timestamp = isTimeSeries
        ? typeof item.key[tmstCD] === "string"
          ? Number(item.key[tmstCD]) * 1000
          : item.key[tmstCD] * 1000
        : startTs;

      if (!result[regionCode]) {
        result[regionCode] = {
          time: startTs,
          regionCode: regionCode,
          regionName: regionName,
          options: {
            start: startTs,
            end: endTs,
            regionArray,
            // timeznArray,
            isPurpose,
          },
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

      const cellSizeKey = parseInt(key) / 1000;
      const layerData = result[regionCode].layerData[timestamp];

      // cellSizeKey 초기화
      if (!layerData[cellSizeKey]) {
        layerData[cellSizeKey] = [];
      }

      const existingDestination = layerData[cellSizeKey].find(
        (cell) => JSON.stringify(cell.coord) === JSON.stringify(coord)
      );

      if (existingDestination) {
        // 기존 destination의 count 데이터를 갱신
        for (let i = 0; i < 8; i++) {
          if (isPurpose && i === 7) continue;

          const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
          existingDestination.count[countKey] =
            (existingDestination.count[countKey] || 0) +
              item[`popul_sum${i}`]?.value || 0;
        }
      } else {
        // 새로운 destination 추가
        const count: { [key: string]: number } = {};
        for (let i = 0; i < 8; i++) {
          if (isPurpose && i === 7) continue;

          const countKey = `${isPurpose ? "PRPS" : "WAY"}${i}`;
          count[countKey] = Math.round(item[`popul_sum${i}`].value) || 0;
        }
        layerData[cellSizeKey].push({
          time: timestamp,
          count: count,
          coord,
        });
      }
    }
  }

  // `result` 객체를 배열 형태로 변환하여 반환
  return Object.values(result);
}
