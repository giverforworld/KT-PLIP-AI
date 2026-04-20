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

import { getRegionCoord } from "@/utils/regionCoordCache";
import proj4 from "proj4";

// 한글을 숫자로 변환하는 매핑
const HAN_E: { [key: string]: number } = {
  가: 7,
  나: 8,
  다: 9,
  라: 10,
  마: 11,
  바: 12,
  사: 13,
  아: 14,
};

const HAN_N: { [key: string]: number } = {
  가: 13,
  나: 14,
  다: 15,
  라: 16,
  마: 17,
  바: 18,
  사: 19,
  아: 20,
};

// 좌표 변환에 사용할 EPSG 정의
proj4.defs([
  [
    "EPSG:5179",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs",
  ],
]);

// 국가지점번호를 UTM-K 좌표로 변환
function parseNationalPointCode(
  nationalPointCode: string
): { x: number; y: number } | null {
  if (nationalPointCode.length < 6) return null;

  const eHangul = nationalPointCode[0];
  const nHangul = nationalPointCode[1];

  const ePrefix = HAN_E[eHangul] ?? null;
  const nPrefix = HAN_N[nHangul] ?? null;

  if (ePrefix === null || nPrefix === null) return null;

  const xRemain = nationalPointCode.slice(2, 6);
  const yRemain = nationalPointCode.slice(6, 10);

  const x = parseInt(`${ePrefix}${xRemain}0`, 10);
  const y = parseInt(`${nPrefix}${yRemain}0`, 10);

  return { x, y };
}
// 숫자 형태로 된 CELL_ID를 UTM-K로 변환
function parseNumericCellId(cellId: number): { x: number; y: number } {
  const x = Math.floor(cellId / 1000000) * 10; // 첫 5자리
  const y = (cellId % 1000000) * 10; // 나머지 5자리

  return { x, y };
}

// UTM-K 좌표를 WGS84 좌표로 변환
function convertUTMKToWGS84(utmk: { x: number; y: number }): [number, number] {
  return proj4("EPSG:5179", "EPSG:4326", [utmk.x, utmk.y]);
}

// 좌측 하단 좌표로 변환
function getSouthWestCoordinate(
  x: number,
  y: number,
  cellSize: number
): { x: number; y: number } {
  const halfCellSize = cellSize / 2; // 셀의 절반 크기 (125m)

  const newX = x - halfCellSize; // 좌측 하단 x
  const newY = y - halfCellSize; // 좌측 하단 y

  return { x: newX, y: newY };
}

// CELL_ID에 따라 WGS84 좌표로 변환
export function convertCoordinate(cellId: number | string): [number, number] {
  let x = 0;
  let y = 0;

  if (typeof cellId === "string") {
    // 한글 형태인 경우, 국가지점번호로 변환
    const coordinates = parseNationalPointCode(cellId);
    if (coordinates) {
      x = coordinates.x;
      y = coordinates.y;
    } else {
      console.error("Invalid national point code");
    }
  } else if (typeof cellId === "number") {
    // 숫자 형태인 경우, 숫자 그대로 좌표 변환
    const coordinates = parseNumericCellId(cellId);
    x = coordinates.x;
    y = coordinates.y;
  }

  // UTM-K 좌표에서 WGS84 좌표로 변환
  const [longitude, latitude] = convertUTMKToWGS84({ x, y });
  return [longitude, latitude];
}

//polygon 중심좌표
let regionCoordCache: Record<string, [number, number]> = {};
let cacheTimestamp = 0;
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

async function getUpdatedRegionCoord(baseYM: string) {
  // 캐시 유효 기간이 지났다면 갱신
  if (Date.now() - cacheTimestamp > CACHE_EXPIRATION_MS) {
    const regionCoord = await getRegionCoord(baseYM);
    // 새로 가져온 데이터를 캐시에 저장
    regionCoordCache = {}; // 이전 캐시 비움
    regionCoordCache = regionCoord;
    cacheTimestamp = Date.now();
  } else {
    const regionCoord = await getRegionCoord(baseYM);
    // 새로 가져온 데이터를 캐시에 저장
    regionCoordCache = { ...regionCoordCache, ...regionCoord };
    cacheTimestamp = Date.now();
  }
}

export async function convertCDtoCoord(
  regionCD: string | number,
  baseYM: string | number
): Promise<[number, number]> {
  if (typeof regionCD === "number") {
    regionCD = regionCD.toString();
  }
  // const baseYM = "202412";
  
  // 캐시에서 해당 지역을 찾기
  const cacheKey = `${regionCD}_${baseYM}`; // 캐시 키 설정
  // const cacheKey = `${regionCD}`; // 캐시 키 설정

  if (!regionCoordCache[cacheKey]) {
    await getUpdatedRegionCoord(String(baseYM)); // 캐시 갱신
  }
  const regionObj = regionCoordCache[cacheKey];
  if (!regionObj) return [0, 0];

  return regionObj;
}