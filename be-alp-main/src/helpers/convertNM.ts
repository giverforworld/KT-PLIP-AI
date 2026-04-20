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

import { getRegionInfo } from "@/utils/regionInfoCache";

let regionNameCache: Record<string, string> = {};
let regionFullNameCache: Record<string, any> = {};
let cacheTimestamp = 0;
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

async function getUpdatedRegionInfo() {
  // 캐시 유효 기간이 지났다면 갱신
  if (Date.now() - cacheTimestamp > CACHE_EXPIRATION_MS) {
    const regionInfo = await getRegionInfo();
    // 새로 가져온 데이터를 캐시에 저장

    regionNameCache = {}; // 이전 캐시 비움
    regionFullNameCache = {};
    for (const [code, data] of Object.entries(regionInfo)) {
      for (const [key, value] of Object.entries(data)) {
        regionNameCache[`${code}_${key}`] = value as string;
      }
    }
    regionFullNameCache = regionInfo;
    cacheTimestamp = Date.now();
  }
}

export function findCDValue(source: any) {
  // 객체의 모든 키를 순회하면서 '_CD'로 끝나는 키의 값을 찾습니다.
  for (const key in source) {
    if (key.endsWith("_CD")) {
      return source[key].toString();
    }
  }
  return "";
}

export async function convertCDtoNM(source: any) {
  let regionCD = 0;
  let type = "";

  // 객체일 경우 모든 키를 순회하면서 '_CD'로 끝나는 키의 값을 찾습니다.
  if (typeof source === "object") {
    for (const key in source) {
      if (key.endsWith("_CD")) {
        type = key.substring(0, key.length - 2) + "NM";
        regionCD = source[key];
        break;
      }
    }
  } else {
    const regionCDStr = typeof source === "number" ? source.toString() : source;
    type =
      regionCDStr.length === 2
        ? "SIDO_NM"
        : regionCDStr.length === 5
        ? "SGG_NM"
        : "ADMNS_DONG_NM";
    regionCD = source;
  }

  // 캐시된 지역 이름 확인
  const cacheKey = `${regionCD}_${type}`;
  if (!regionNameCache[cacheKey]) {
    await getUpdatedRegionInfo(); // 캐시 갱신
  }

  return regionNameCache[cacheKey] || "-";
}
export async function convertCDtoFullNM(source: any): Promise<string> {
  let regionCDStr = "";

  if (typeof source !== "number") {
    regionCDStr = findCDValue(source);
    if (!regionCDStr) return "-";
  } else {
    regionCDStr = source.toString();
  }

  // 캐시에서 해당 지역을 찾기
  const cacheKey = regionCDStr; // 캐시 키 설정

  if (!regionFullNameCache[cacheKey]) {
    await getUpdatedRegionInfo(); // 캐시 갱신
    // console.log("Updated regionNameCache:", regionNameCache); // 캐시 업데이트 확인
  }
  const regionObj = regionFullNameCache[regionCDStr];
  if (!regionObj) return "-";

  const regionName = Object.entries(regionObj)
    .filter(([key]) => key.endsWith("_NM"))
    .map(([, value]) => value)
    .join(" ");

  return regionName;
}

// 국가 코드와 이름 매핑 객체
export const countryCodeToName: { [key: string]: string } = {
  CHN_POPUL_NUM: "중국",
  VNM_POPUL_NUM: "베트남",
  USA_POPUL_NUM: "미국",
  THA_POPUL_NUM: "태국",
  UZB_POPUL_NUM: "우즈베키스탄",
  NPL_POPUL_NUM: "네팔",
  IDN_POPUL_NUM: "인도네시아",
  RUS_POPUL_NUM: "러시아",
  MMR_POPUL_NUM: "미얀마",
  PHL_POPUL_NUM: "필리핀",
  KHM_POPUL_NUM: "캄보디아",
  KAZ_POPUL_NUM: "카자흐스탄",
  LKA_POPUL_NUM: "스리랑카",
  MNG_POPUL_NUM: "몽골",
  BGD_POPUL_NUM: "방글라데시",
  JPN_POPUL_NUM: "일본",
  CAN_POPUL_NUM: "캐나다",
  IND_POPUL_NUM: "인도",
  PAK_POPUL_NUM: "파키스탄",
  FRA_POPUL_NUM: "프랑스",
};
// 국가 코드를 이름으로 변환하는 함수
export function convertFornNM(countryData: { [key: string]: number }): {
  [key: string]: number;
} {
  const convertedData: { [key: string]: number } = {};

  Object.entries(countryData).forEach(([code, value]) => {
    const countryName = countryCodeToName[code];
    if (countryName) {
      convertedData[countryName] = Math.round(value);
    } else {
      convertedData["-"] = Math.round(value);
      console.warn(`Warning: Country code '${code}' not found in mapping.`);
    }
  });

  return convertedData;
}
