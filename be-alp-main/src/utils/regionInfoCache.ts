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

const memoryCache: { regionInfoData?: RegionInfoCache } = {};
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

// 행정동정보 데이터를 메모리 캐시에 저장하는 함수
function setRegionInfoCache(regionInfoData: Record<string, any>): void {
  memoryCache.regionInfoData = {
    data: regionInfoData,
    timestamp: Date.now(), // 저장 시간 기록
  };
}

// 행정동정보 데이터를 캐시에서 가져오는 함수
function getRegionInfoCache(): {
  data: Record<string, any>;
} | null {
  const cache = memoryCache.regionInfoData;

  if (cache) {
    const now = Date.now();

    // 캐시 유효성 검사 (하루 이내에 캐시된 데이터 사용)
    if (now - cache.timestamp < CACHE_EXPIRATION_MS) {
      return {
        data: cache.data,
      };
    } else {
      // 캐시 만료 시 null 반환
      return null;
    }
  }

  return null; // 캐시에 데이터가 없을 때
}

// 행정동정보 데이터를 가져오는 함수 (캐시 확인 후 OpenSearch 호출)
export async function getRegionInfo(): Promise<Record<string, any>> {
  // 메모리 캐시에서 데이터 가져오기
  const cachedRegionInfo = getRegionInfoCache();

  // 캐시가 존재하고 요청 범위와 일치하는 경우 캐시된 데이터 반환
  if (cachedRegionInfo) {
    // console.log("캐시에서 행정동정보 데이터를 반환합니다.");
    return cachedRegionInfo.data; // 캐시된 데이터를 반환
  }

  // 캐시된 데이터가 없거나 범위가 일치하지 않는 경우 OpenSearch에서 데이터 가져오기
  // console.log("OpenSearch에서 행정동정보 데이터를 가져옵니다.");
  try {
    const regionInfoData = await getRegionInfoFromOpenSearch();

    // 새롭게 가져온 데이터를 메모리 캐시에 저장
    setRegionInfoCache(regionInfoData);
    return regionInfoData;
  } catch (error) {
    console.error(error);
    throw new Error("failed get holidays from opensearch");
  }
}

// OpenSearch에서 행정동정보 데이터를 불러와서 형태 변경
async function getRegionInfoFromOpenSearch(): Promise<any> {
  // OpenSearch에서 행정동정보 데이터 조회
  const response = await searchWithLogging({
    index: "rgn_nm",
    body: {
      track_total_hits: true,
      size: 5000,
    },
  });
  const regionData: Record<string, any> = {};

  // 데이터를 변환하여 regionData 객체에 추가
  response.body.hits.hits.forEach((hit: any) => {
    const { SIDO_CD, SIDO_NM, SGG_CD, SGG_NM, ADMNS_DONG_CD, ADMNS_DONG_NM } =
      hit._source;

    // SIDO_CD로 키 생성
    if (!regionData[SIDO_CD]) {
      regionData[SIDO_CD] = {
        SIDO_CD,
        SIDO_NM,
      };
    }

    // SGG_CD로 키 생성
    if (!regionData[SGG_CD]) {
      regionData[SGG_CD] = {
        SIDO_CD,
        SIDO_NM,
        SGG_CD,
        SGG_NM,
      };
    }

    // ADMNS_DONG_CD로 키 생성
    regionData[ADMNS_DONG_CD] = {
      SIDO_CD,
      SGG_CD,
      ADMNS_DONG_CD,
      SIDO_NM,
      SGG_NM,
      ADMNS_DONG_NM,
    };
  });
  return regionData;
}
