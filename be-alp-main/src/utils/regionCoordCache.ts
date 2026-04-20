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

import { searchWithLogging } from "@/lib/searchWithLogiging";
import { ApiResponse } from "@opensearch-project/opensearch/.";

const memoryCache: { regionCoordData?: RegionCoordCache } = {};
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

// 행정동정보 데이터를 메모리 캐시에 저장하는 함수
function setRegionCoordCache(regionCoordData: Record<string, any>): void {
  memoryCache.regionCoordData = {
    data: regionCoordData,
    timestamp: Date.now(), // 저장 시간 기록
  };
}

// 행정동정보 데이터를 캐시에서 가져오는 함수
function getRegionCoordCache(baseYM: string): {
  data: Record<string, any>;
} | null {
  const cache = memoryCache.regionCoordData;

  if (cache) {
    const now = Date.now();

    // 캐시 유효성 검사 (하루 이내에 캐시된 데이터 사용)
    if (now - cache.timestamp < CACHE_EXPIRATION_MS) {
      const filtered = filteredByDate(baseYM, cache);
      if (filtered && filtered.length !== 0)
        return {
          data: filtered,
        };
    } else {
      // 캐시 만료 시 null 반환
      return null;
    }
  }

  return null; // 캐시에 데이터가 없을 때
}

// 행정동정보 데이터를 가져오는 함수 (캐시 확인 후 OpenSearch 호출)
export async function getRegionCoord(
  baseYM: string
): Promise<Record<string, any>> {
  // 메모리 캐시에서 데이터 가져오기
  const cachedRegionCoord = getRegionCoordCache(baseYM);

  // 캐시가 존재하고 요청 범위와 일치하는 경우 캐시된 데이터 반환
  if (cachedRegionCoord) {
    // console.log("캐시에서 행정동정보 데이터를 반환합니다.");
    return cachedRegionCoord.data; // 캐시된 데이터를 반환
  }

  // 캐시된 데이터가 없거나 범위가 일치하지 않는 경우 OpenSearch에서 데이터 가져오기
  // console.log("OpenSearch에서 행정동정보 데이터를 가져옵니다.");
  try {
    const regionCoordData = await getRegionCoordFromOpenSearch(baseYM);

    // 새롭게 가져온 데이터를 메모리 캐시에 저장
    setRegionCoordCache(regionCoordData);
    return regionCoordData;
  } catch (error) {
    console.error(error);
    throw new Error("failed get holidays from opensearch");
  }
}

// OpenSearch에서 행정동정보 데이터를 불러와서 형태 변경
async function getRegionCoordFromOpenSearch(baseYM: string): Promise<any> {
  // OpenSearch에서 행정동정보 데이터 조회
  const response = await searchWithLogging({
    index: `rgn_crd_${baseYM.substring(0, 4)}`,
    body: {
      track_total_hits: true,
      size: 1,
      query: {
        bool: {
          filter: [{ term: { BASE_YM: baseYM } }],
        },
      },
    },
  });
  const regionData: Record<string, any> = {};

  // 데이터를 변환하여 regionData 객체에 추가
  response.body.hits.hits[0]._source.INFO.forEach((item: any) => {
    const { RGN_CD, CTR_XCRD, CTR_YCRD } = item;

    if (!regionData[`${RGN_CD}_${baseYM}`]) {
      regionData[`${RGN_CD}_${baseYM}`] = [CTR_XCRD, CTR_YCRD];
    }
  });
  return regionData;
}
function filteredByDate(baseYM: string, data: Record<string, any>) {
  return Object.entries(data)
    .filter(([key]) => key.endsWith(baseYM))
    .map(([_, value]) => value);
}
