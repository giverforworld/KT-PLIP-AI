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
import { dateRange } from "@/utils/makeQueryFilter";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { calculateCompare } from "@/helpers/normalized/normalizedData";
import { regionFlowAggregation, regionMopFlowAggregation } from "@/utils/chart/regionAggregation";
import { getUpperRegion } from "@/helpers/sortByRegionArray";
import {
  addUnionRegionMap,
  getCompareMopRegionMap,
  getCompareRegionMap,
  mergeDataByMopFlowRegion,
  mergeDataByRegion,
} from "@/helpers/mergeDataByRegion";

export async function mopRank(options: MopParams) {
  const [
    purposeInResult,
    purposeOutResult,
    wayResult,
    periodInResult,
    periodOutResult,
  ] = await Promise.all([
    statusInOutSearch(options, true),
    statusInOutSearch(options, false),
    statusWay(options),
    statusInOutComparePeriod(options, true),
    statusInOutComparePeriod(options, false),
  ]);

  //opensearh데이터 정규화
  const result = normalized(
    purposeInResult,
    purposeOutResult,
    wayResult,
    periodInResult,
    periodOutResult,
    options
  );
  return result;
}

const normalized = (
  purposeInResult: any,
  purposeOutResult: any,
  wayResult: any,
  periodInResult: any,
  periodOutResult: any,
  options: MopParams
) => {
  const result: NormalizedObj = {
    inflowPop: [],
    outflowPop: [],
    inflowRegion: [],
    outflowRegion: [],
    flowPur: [],
    flowWay: [],
    compareIn: [],
    compareOut: [],
  };

  //scatter 지역별 유입, 유출 변화 분석
  const { searched: inSearched, others: inOthers } = separateRegions(
    periodInResult,
    options.regionArray
  );
  const { searched: outSearched, others: outOthers } = separateRegions(
    periodOutResult,
    options.regionArray
  );
  inSearched.forEach((data: any) => {
    const compare = calculateCompare(data);
    result.compareIn.push({
      region: data.key,
      data: [{ key: data.key, value: compare }],
    });
  });
  outSearched.forEach((data: any) => {
    const compare = calculateCompare(data);
    result.compareOut.push({
      region: data.key,
      data: [{ key: data.key, value: compare }],
    });
  });
  //해당 기준지역의 같은 상위 행정구역 데이터를
  // const upperRegion = getUpperRegion(options.regionArray[0]);
  // const inOthersData = inOthers.map((item) => ({
  //   key: item.key,
  //   value: calculateCompare(item),
  // }));
  // result.compareIn.push({
  //   region: upperRegion,
  //   data: inOthersData,
  // });
  // const outOthersData = outOthers.map((item) => ({
  //   key: item.key,
  //   value: calculateCompare(item),
  // }));
  // result.compareOut.push({
  //   region: upperRegion,
  //   data: outOthersData,
  // });

  purposeInResult.forEach((data: any) => {
    const region = data.key;
    const inflowPop = data.flow_pop.value || 0;
    result.inflowPop.push({
      region: region,
      data: [{ key: "inflowPop", value: inflowPop }],
    });
    const inflowRegion = options.includeSame
      ? data.max_flow_region.buckets[0].key
      : data.max_flow_region.buckets.find(
          (bucketRegion: any) => bucketRegion.key !== data.key
        ).key;

    result.inflowRegion.push({
      region: region,
      data: [{ key: "inflowRegion", value: inflowRegion }],
    });

    const flowPur = data.max_flow_prps.buckets[0].key;
    result.flowPur.push({
      region: region,
      data: [{ key: "flowPur", value: flowPur }],
    });
    const purposeOutBucket = purposeOutResult.find(
      (item: any) => item.key === region
    );
    const outflowPop = purposeOutBucket.flow_pop.value || 0;
    result.outflowPop.push({
      region: region,
      data: [{ key: "outflowPop", value: outflowPop }],
    });
    const outflowRegion = options.includeSame
      ? purposeOutBucket.max_flow_region.buckets[0].key
      : purposeOutBucket.max_flow_region.buckets.find(
          (bucketRegion: any) => bucketRegion.key !== data.key
        ).key;

    result.outflowRegion.push({
      region: region,
      data: [{ key: "outflowRegion", value: outflowRegion }],
    });

    const wayRegionData = wayResult.find((item: any) => item.key === region);
    const flowWay = wayRegionData?.max_flow_way?.buckets?.[0]?.key || 0;
    result.flowWay.push({
      region: region,
      data: [{ key: "flowWay", value: flowWay }],
    });
  });

  return result;
};

function separateRegions(
  data: any[],
  searchedKeys: string[]
): { searched: any[]; others: any[] } {
  const searchedSet = new Set();
  const othersSet = new Set();
  const searched: any[] = [];
  const others: any[] = [];

  data.forEach((item) => {
    // item.key를 string으로 변환하여 비교
    if (searchedKeys.includes(item.key?.toString())) {
      if (!searchedSet.has(item.key)) {
        searched.push(item);
        searchedSet.add(item.key);
      }
    } else {
      if (!othersSet.has(item.key)) {
        others.push(item);
        othersSet.add(item.key);
      }
    }
  });

  return { searched, others };
}

//통계요약 - 인구수, 지역, 목적
async function statusInOutSearch(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;

  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );

  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_prps_age_sgg_day"
  );

  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_prps_age_admdong_day"
  );

  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.sido },
      sgg: { codes: [], field: "MOPP", index: indexs.sgg },
      adm: { codes: [], field: "MOPP", index: indexs.adm },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
          order: { _key: "asc" },
        },
        aggs: {
          flow_pop: { sum: { field: "TOT_POPUL_NUM" } },
          max_flow_region: {
            terms: {
              field: "",
              size: 2,
              order: { max_region_pop: "desc" },
            },
            aggs: {
              max_region_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          max_flow_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 1,
              order: { max_prps_pop: "desc" },
              exclude: ["6"], // 기타인 값 제외
            },
            aggs: {
              max_prps_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };


  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   includeSame,
  //   isInflow,
  //   indexs,
  //   "statusSearch"
  // );

  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      isInflow,
      indexs,
      "statusSearch",
      start,
      // regionArray.length === 1
    )
  }));
  
  results = results.flat(Infinity);
  return results;
}
//통계요약 - 최다 수단
async function statusWay(options: MopParams) {
  const { start, end, regionArray, includeSame } = options;
  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_way_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_way_age_sgg_day"
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_way_age_admdong_day"
  );

  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.sido },
      sgg: { codes: [], field: "MOPP", index: indexs.sgg },
      adm: { codes: [], field: "MOPP", index: indexs.adm },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: changeRegionArr.length,
          order: { _key: "asc" },
        },
        aggs: {
          max_flow_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 1,
              exclude: ["7"], // 기타인 값 제외
              order: { max_way_pop: "desc" },
            },
            aggs: {
              max_way_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };

  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   includeSame,
  //   true,
  //   indexs,
  //   "way"
  // );
  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      true,
      indexs,
      "way",
      // start,
      // regionArray.length === 1
    )
  }));
  
  results = results.flat(Infinity);
  return results;
}
//전년동기
async function statusInOutComparePeriod(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray } = options;
  const { lastYear } = calculateDates(start);

  
  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 0,
          order: { _key: "asc" },
        },
        aggs: {
          by_start: {
            filter: dateRange(false, start, end),
            aggs: {
              pop_by_start: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_lastYear: {
            filter: {},
            aggs: {
              pop_by_lastYear: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  };

  if (start.length === 6) {
    query.query.bool.filter.push(dateRange(false, lastYear, end));
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(false, lastYear, lastYear),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      lastYear,
      lastYear
    );
  } else {
    query.query.bool.filter.push(
      dateRange(false, lastYear + start.substring(6, 8), end)
    );

    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(
            false,
            lastYear + start.substring(6, 8),
            lastYear + end.substring(6, 8)
          ),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });
    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      lastYear + start.substring(6, 8),
      lastYear + end.substring(6, 8)
    );
  }

  //개발용 kt에는 compareM으로 수정
  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexCompareMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_sgg_day",
    false
  );
  const validIndicesAdm = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_admdong_day",
    false
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: validIndicesSido.join(",") },
    sgg: { codes: [], field: "MOPP", index: validIndicesSgg.join(",") },
    adm: { codes: [], field: "MOPP", index: validIndicesAdm.join(",") },
  };

  const originRegion = await getCompareRegionMap(
    regionArray.slice(0, 1),
    regionMap,
    start
  );

  //기준지역
  // const originRegion = regionArray[0];
  const originType =
    regionArray[0].length === 2
      ? "sido"
      : regionArray[0].length === 5
      ? "sgg"
      : "adm";

  await executeQuery(
    query,
    originRegion[originType].codes,
    originRegion[originType].field,
    originRegion[originType].index,
    options,
    isInflow,
    results
  );

  // 지역 코드를 길이에 따라 분류
  //비교지역
  regionMap = await getCompareRegionMap(regionArray.slice(1), regionMap, start);
  let result = [];
  for (let i = 0; i < regionArray.length; i++) {
    if (regionArray[i].length === 5) {
      regionMap = await addUnionRegionMap(regionArray[i], regionMap);
    }
  // }
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";
  // regionArray.slice(1).forEach((region) => {
  //   if (region.length === 2) regionMap.sido.codes.push(region);
  //   else if (region.length === 5) regionMap.sgg.codes.push(region);
  //   else regionMap.adm.codes.push(region);
  // });

  // 원래 regionArray
  let changeRegionArr = [];
  for (const reg of regionArray) {
    changeRegionArr.push(reg);
  }
  let newMap = new Map();
  await Promise.all(changeRegionArr.map(async (reg:any) => {
    let regionMapCD: {
      [key: string]: { codes: string[]; field: string; index: string };
    } = {
      sido: { codes: [], field: "MOPP", index: indexs.sido },
      sgg: { codes: [], field: "MOPP", index: indexs.sgg },
      adm: { codes: [], field: "MOPP", index: indexs.adm },
    };
    regionMapCD = await getCompareMopRegionMap(reg, regionMapCD, start);
    regionMapCD = await addUnionRegionMap(reg, regionMapCD);
    regionMapCD.sgg.codes = Array.from(new Set(regionMapCD.sgg.codes));

    changeRegionArr.splice(changeRegionArr.findIndex((el) => el === reg), 1, ...regionMapCD.sgg.codes)

    newMap.set(reg, regionMapCD.sgg.codes);
  }))

  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) => {
      // codes.length가 있을 때만 비동기 함수 실행
      if (codes.length) {
        return executeQuery(
          query,
          codes,
          field,
          index,
          options,
          isInflow,
          results
        );
      }
      return null;
    })
  );
  const result1 = await mergeDataByMopFlowRegion(results, regionArray[i]);
  result.push(result1);
  }
  // return mergeDataByRegion(results, regionArray, true);
  // let result = [];
  // for (let i = 0; i < regionArray.length; i++) {
  //   const result1 = await mergeDataByMopFlowRegion(results, regionArray[i]);
  //   result.push(result1);
  // }
  
  return result.flat(Infinity);
}

async function executeQuery(
  query: any,
  regionCodes: string[],
  field: string,
  index: string,
  options: MopParams,
  isInflow: boolean,
  results: any[]
) {
  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";
  const regionQuery: any = structuredClone(query)

  regionQuery.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  regionQuery.aggs.by_region.terms.size = field === "ADMNS_DONG" ? 1000 : 100;

  if (!options.includeSame) {
    regionQuery.query.bool.must_not = [
      { terms: { [`${flowCD}_${field}_CD`]: regionCodes } },
    ];
  }
  if (field !== "SIDO") {
    //기준지역은 상위 지역으로 range
    if (regionCodes.includes(options.regionArray[0])) {
      const regionRange = regionCodes.map((regionCode: string) => {
        const range = {
          range: {
            [`${regionCD}_${field}_CD`]: {
              gte: parseInt(regionCode.slice(0, -3)) * 1000,
              lte: (parseInt(regionCode.slice(0, -3)) + 1) * 1000 - 1,
            },
          },
        };
        return range;
      });

      regionQuery.query.bool.filter.push({
        bool: {
          should: regionRange,
          minimum_should_match: 1,
        },
      });
    } else {
      regionQuery.query.bool.filter.push({
        terms: { [`${regionCD}_${field}_CD`]: regionCodes },
      });
    }
  }

  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });

    // 집계 결과 저장
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
}
