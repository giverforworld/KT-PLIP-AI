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
import { searchWithLogging } from "@/lib/searchWithLogiging";

const memoryCache: { changedRegionCache?: ChangedRegionCache } = {};
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 하루

// 행정동정보 데이터를 메모리 캐시에 저장하는 함수
function setChangedRegionCache(
  changedRegionData: Record<string, ChangedRegion>
): void {
  memoryCache.changedRegionCache = {
    data: changedRegionData,
    timestamp: Date.now(), // 저장 시간 기록
  };
}

// 행정동정보 데이터를 캐시에서 가져오는 함수
function getChangedRegionCache(type: string): ChangedRegion[] | null {
  const cache = memoryCache.changedRegionCache;

  if (cache) {
    const now = Date.now();

    // 캐시 유효성 검사 (하루 이내에 캐시된 데이터 사용)
    if (now - cache.timestamp < CACHE_EXPIRATION_MS) {
      // type 에 맞는 행정동
      const filtered = filteredByType(type, cache.data);
      if (filtered && filtered.length !== 0) return filtered;
    } else {
      // 캐시 만료 시 null 반환
      return null;
    }
  }

  return null; // 캐시에 데이터가 없을 때
}

// 행정동정보 데이터를 가져오는 함수 (캐시 확인 후 OpenSearch 호출)
export async function getChangedRegion(type: string): Promise<ChangedRegion[]> {
  // 메모리 캐시에서 데이터 가져오기
  const cachedChangedRegion = getChangedRegionCache(type);

  // 캐시가 존재하고 요청 범위와 일치하는 경우 캐시된 데이터 반환
  if (cachedChangedRegion) {
    // console.log("캐시에서 행정동정보 데이터를 반환합니다.");
    return cachedChangedRegion;
  }

  // 캐시된 데이터가 없거나 범위가 일치하지 않는 경우 OpenSearch에서 데이터 가져오기
  // console.log("OpenSearch에서 행정동정보 데이터를 가져옵니다.");
  try {
    const changedRegionData = await getChangedRegionAggs(type);

    // 새롭게 가져온 데이터를 메모리 캐시에 저장
    setChangedRegionCache(changedRegionData);
    const filtered = filteredByType(type, changedRegionData);
    return filtered;
  } catch (error) {
    console.error(error);
    throw new Error("failed get holidays from opensearch");
  }
}

// OpenSearch에서 행정동정보 데이터를 불러와서 형태 변경
async function getChangedRegionAggs(
  type: string
): Promise<Record<string, ChangedRegion>> {
  // OpenSearch에서 행정동정보 데이터 조회
  const maxSize: { [key: string]: number } = {
    sido: 100,
    sgg: 1000,
    adm: 10000,
  };

  let allResults: any[] = [];
  try {
    let afterKey: any = null;
    while (true) {
      // composite aggregation 쿼리
      let query: any = {
        size: 0,
        aggs: {
          by_composite_region: {
            composite: {
              size: maxSize[type],
              sources: [
                {
                  BASE_YM: {
                    terms: {
                      script: {
                        source: `
                          def date = doc['BASE_YM'].value.toInstant();
                          return date.atZone(ZoneId.of('UTC')).format(DateTimeFormatter.ofPattern('yyyyMM'));
                          `,
                      },
                    },
                  },
                },
                // { BASE_YM: { terms: { field: "BASE_YM" } } },
                { SIDO: { terms: { field: "SIDO" } } },
                { OSIDO: { terms: { field: "OSIDO" } } },
                ...(type === "sgg" || type === "adm"
                  ? [
                      { SGG: { terms: { field: "SGG" } } },
                      { OSGG: { terms: { field: "OSGG" } } },
                    ]
                  : []),
                ...(type === "adm"
                  ? [
                      { ADM: { terms: { field: "ADM" } } },
                      { OADM: { terms: { field: "OADM" } } },
                    ]
                  : []),
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
            },
          },
        },
      };
      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: "rgn_change",
        body: query,
      });

      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];

      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;
      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
    }
  } catch (error) {
    console.error("Error fetching composite rgn_change data:", error);
    throw error;
  }
  const regionData: Record<string, ChangedRegion> = {};
  // 데이터를 변환하여 regionData 객체에 추가
  allResults.forEach((bucket: any) => {
    const { BASE_YM, SIDO, SGG, ADM, OSIDO, OSGG, OADM } = bucket.key;

    // SIDO로 키 생성
    if (!regionData[SIDO]) {
      regionData[SIDO] = {
        BASE_YM,
        SIDO,
        OSIDO,
      };
    }

    // SGG_CD로 키 생성
    if (SGG && !regionData[SGG]) {
      regionData[SGG] = {
        BASE_YM,
        SIDO,
        SGG,
        OSIDO,
        OSGG,
      };
    }

    // ADM로 키 생성
    if (ADM && !regionData[ADM]) {
      regionData[ADM] = {
        BASE_YM,
        SIDO,
        SGG,
        ADM,
        OSIDO,
        OSGG,
        OADM,
      };
    }
  });

  return regionData;
}

function filteredByType(
  type: string,
  data: Record<string, ChangedRegion>
): ChangedRegion[] {
  const lengthMap: Record<string, number> = {
    sido: 2,
    sgg: 5,
    adm: 8,
  };
  return Object.entries(data)
    .filter(([key]) => key.length === lengthMap[type])
    .map(([_, value]) => value);
}
