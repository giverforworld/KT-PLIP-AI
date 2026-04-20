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
import { getTotalDays } from "@/helpers/normalized/normalizedALPData";
import {
  convertToUnixTimestamp,
  formatDateToYYYYMMDD,
  getStartEndDate,
} from "@/helpers/convertDate";
import { convertCDtoFullNM } from "@/helpers/convertNM";
import { isValidMonth } from "@/middlewares/validators";

export async function transALPData(
  data: any[],
  options: GisAlpParams
): Promise<MapPolygonData[]> {
  const { start, end, regionArray, timeznArray } = options;
  // //spaceType에 따라 center 추가 위치 다르게해서 vector trip 같이 쓰기
  let startStr = start;
  let endStr = end;
  if (isValidMonth(start)) {
    const convertDate = getStartEndDate(startStr, endStr);
    startStr = formatDateToYYYYMMDD(convertDate.startDate);
    endStr = formatDateToYYYYMMDD(convertDate.endDate);
  }
  const startTs = convertToUnixTimestamp(startStr);
  const endTs = convertToUnixTimestamp(endStr, true);
  const startTotalDays = getTotalDays(startStr, endStr);

  // result를 객체로 선언하여 regionCode를 키로 사용합니다.
  const result: { [key: string]: MapPolygonData } = {};

  if (!data || data.length === 0) {
    throw new Error("No data provided");
  }


  const regionCD =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const subRegionCD = regionArray[0].length === 2 ? "SGG" : "ADM";
  const regionNM = regionArray[0].length === 2 ? "SGG_GR" : regionArray[0].length === 5 ? "ADM_GR" : "ADM"

  const safeStart = String(start ?? "");
  if (!/^\d{6}(\d{2})?$/.test(safeStart)) {
    throw new Error("Invalid start format")
  }

  const baseYM = safeStart.slice(0, 6);
  // 모든 비동기 작업을 수집하기 위한 배열
  const promises = data.map(async (item) => {
    const regionCode = item.key[regionNM];
    const regionName = await convertCDtoFullNM(regionCode);
    const regionCoord = await convertCDtoCoord(regionCode, baseYM);

    const subRegionCode = item.key[subRegionCD];
    const subRegionName = await convertCDtoFullNM(subRegionCode);
    const subRegionCoord = await convertCDtoCoord(
      subRegionCode,
      baseYM
    );
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

    if (!result[regionCode].layerData[timestamp]) {
      result[regionCode].layerData[timestamp] = [];
    }
    
    let count: { [key: string]: number } = {};
    
    count["MALE_00"] = Math.round(item.male_0.value) / (startTotalDays * 24)
    count["MALE_10"] = Math.round(item.male_10.value) / (startTotalDays * 24)
    count["MALE_20"] = Math.round(item.male_20.value) / (startTotalDays * 24)
    count["MALE_30"] = Math.round(item.male_30.value) / (startTotalDays * 24)
    count["MALE_40"] = Math.round(item.male_40.value) / (startTotalDays * 24)
    count["MALE_50"] = Math.round(item.male_50.value) / (startTotalDays * 24)
    count["MALE_60"] = Math.round(item.male_60.value) / (startTotalDays * 24)
    count["MALE_70"] = Math.round(item.male_70.value) / (startTotalDays * 24)
    count["MALE_80"] = Math.round(item.male_80.value) / (startTotalDays * 24)
    count["FEML_00"] = Math.round(item.feml_0.value) / (startTotalDays * 24)
    count["FEML_10"] = Math.round(item.feml_10.value) / (startTotalDays * 24)
    count["FEML_20"] = Math.round(item.feml_20.value) / (startTotalDays * 24)
    count["FEML_30"] = Math.round(item.feml_30.value) / (startTotalDays * 24)
    count["FEML_40"] = Math.round(item.feml_40.value) / (startTotalDays * 24)
    count["FEML_50"] = Math.round(item.feml_50.value) / (startTotalDays * 24)
    count["FEML_60"] = Math.round(item.feml_60.value) / (startTotalDays * 24)
    count["FEML_70"] = Math.round(item.feml_70.value) / (startTotalDays * 24)
    count["FEML_80"] = Math.round(item.feml_80.value) / (startTotalDays * 24)
    
    result[regionCode].layerData[timestamp].push({
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
