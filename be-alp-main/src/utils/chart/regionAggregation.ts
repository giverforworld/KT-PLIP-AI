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
import { dateRange } from "../makeQueryFilter";
import {
  addUnionRegionMap,
  addUnionRegionsMap,
  getCompareDashRegionMap,
  getCompareMopRegionMap,
  getCompareRegionMap,
  mergeDataByDashRegion,
  mergeDataByFlowRegion,
  mergeDataByLlpRegion,
  mergeDataByMopFlowRegion,
  mergeDataByRegion,
  mergeUnionByAlpCompareForn,
  mergeUnionByDashCompareMOP,
} from "@/helpers/mergeDataByRegion";

// 지역별 쿼리 처리 함수
export async function regionAggregation(
  query: any,
  regionArray: string[],
  indexs: Indexs,
  category?: string,
  start?: string,
  isAll?: boolean
) {
  const isAlp = category?.includes("native");
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: {
      codes: [],
      field: "SIDO" + (isAlp ? "" : "_CD"),
      index: indexs.sido,
    },
    sgg: { codes: [], field: "SGG" + (isAlp ? "" : "_CD"), index: indexs.sgg },
    adm: {
      codes: [],
      field: isAlp
        ? "ADM"
        : category?.startsWith("resid")
        ? "ADMDONG_CD"
        : "ADMNS_DONG_CD",
      index: indexs.adm!,
    },
  };
  // 변경 지역 코드 추가
  regionMap = await getCompareRegionMap(regionArray, regionMap, start);
  // 통합시군구
  regionMap = await addUnionRegionsMap(regionArray, regionMap, category)
  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) =>
      codes.length
        ? handleRegionAggregation(query, codes, field, index, results, category)
        : null
    )
  );

  // 변경 지역 데이터 병합
  return !start
    ? results
    : mergeDataByRegion(results, regionArray, isAll ?? false);
}

//지역별 쿼리 집계 결과를 처리하는 함수
export async function handleRegionAggregation(
  query: any,
  regionCodes: string[],
  field: string,
  index: string,
  results: any[],
  category?: string
) {
  const regionQuery = structuredClone(query)
  regionQuery.query.bool.filter.push({ terms: { [field]: regionCodes } });
  // if (!regionQuery.aggs.by_region) {
  //   regionQuery.aggs = { ...regionQuery.aggs, by_region: {terms: {field: '', size:0 }}  }
  // }
  regionQuery.aggs.by_region.terms.field = field;
  regionQuery.aggs.by_region.terms.size = regionCodes.length;
  if (category === "traits" || category === "status")
    regionQuery.query.bool.filter.push({ term: { STAY_TIME_CD: 3 } });

  if (category === "comparePeriod" || category === "sexAge") {
    regionQuery.aggs.by_region.aggs.top_hits_docs.top_hits._source.push(field);
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

export async function regionFlowAggregation(
  query: any,
  regionArray: string[],
  includeSame: boolean,
  isInflow: boolean,
  indexs: Indexs,
  category?: string,
  start?: string,
  isAll?: boolean
) {
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "SIDO", index: indexs.sido },
    sgg: { codes: [], field: "SGG", index: indexs.sgg },
    adm: { codes: [], field: "ADMNS_DONG", index: indexs.adm! },
  };

  // 변경 지역 코드 추가
  regionMap = await getCompareRegionMap(regionArray, regionMap, start);

  // 각 지역에 대해 집계 처리
  // TO BE CHECKED must_not으로 하면 선택된 지역끼리간 이동 다 표출 제외됨
  //동일지역간 이동 표출 안하면 선택된 지역별로 쿼리 호출
  if (includeSame && category !== 'period') {
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) => {
      // codes.length가 있을 때만 비동기 함수 실행
      if (codes.length) {
        return handleRegionFlowAggregation(
          query,
          codes,
          includeSame,
          isInflow,
          field,
          index,
          results,
          category
        );
      }
      return null;
    })
  );
  } else {
    await Promise.all(
      Object.values(regionMap).map(({ codes, field, index }) => {
        // codes.length가 있을 때만 코드별로 handleRegionFlowAggregation 호출
        if (codes.length) {
          return Promise.all(
            codes.map((code) =>
              handleRegionFlowAggregation(
                query,
                [code], // 단일 코드로 배열을 만듦
                includeSame,
                isInflow,
                field,
                index,
                results,
                category
              )
            )
          );
        }
        return null;
      })
    );
  }
  
  // 변경 지역 데이터 병합
  return !start
    ? results
    : mergeDataByFlowRegion(results, regionArray, isAll ?? false);
}

async function handleRegionFlowAggregation(
  query: any,
  regionCodes: string[],
  includeSame: boolean,
  isInflow: boolean,
  field: string,
  index: string,
  results: any,
  category?: string
) {
  const regionQuery = structuredClone(query)
  // const isSido = region.length === 5;

  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  regionQuery.query.bool.filter.push({
    terms: { [`${regionCD}_${field}_CD`]: regionCodes },
  });
  if (!includeSame) {
    regionQuery.query.bool.must_not = [
      { terms: { [`${flowCD}_${field}_CD`]: regionCodes } },
    ];
  }
  regionQuery.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  if (category === "status" || category === "moveCd") {
    regionQuery.aggs.by_region.aggs.by_flow.terms.field = `${flowCD}_${field}_CD`;
  } else if (category === "statusSearch") {
    regionQuery.aggs.by_region.aggs.max_flow_region.terms.field = `${flowCD}_${field}_CD`;
  }

  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });

    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
}
// 생활이동 통합시군구
export async function regionMopFlowAggregation(
  query: any,
  region: string,
  includeSame: boolean,
  isInflow: boolean,
  indexs: Indexs,
  category?: string,
  start?: string,
  isAll?: boolean,
  options?: any,
  moveCdArray?: number[],
  isPurpose?: boolean
) {
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.sido },
    sgg: { codes: [], field: "MOPP", index: indexs.sgg },
    adm: { codes: [], field: "MOPP", index: indexs.adm! },
  };

  // 변경 지역 코드 추가
  regionMap = await getCompareMopRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  regionMap = await addUnionRegionMap(region, regionMap);
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";
  // console.log('regionMAp', regionMap);
  
  // 각 지역에 대해 집계 처리
  // TO BE CHECKED must_not으로 하면 선택된 지역끼리간 이동 다 표출 제외됨
  //동일지역간 이동 표출 안하면 선택된 지역별로 쿼리 호출
  if (includeSame && category !== 'period') {
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) => {
      // codes.length가 있을 때만 비동기 함수 실행
      if (codes.length && !options) {
        return handleMOPFlowAggregation(
          query,
          codes,
          includeSame,
          isInflow,
          field,
          index,
          results,
          category,
          moveCdArray ?? undefined,
          isPurpose ?? undefined
        );
      } else if (codes.length && options) {
        return handleRegionMOPAggregation(
          query,
          options,
          codes,
          includeSame,
          isInflow,
          field,
          index,
          results,
          category
        );
      }
      return null;
    })
  );
  } else {
    if (category === "moveCd1" || category === "statusTime") {
      await Promise.all(
        Object.values(regionMap).map(({ codes, field, index }) => {
          return handleRegionMOPAggregation(
          query,
          options,
          codes,
          includeSame,
          isInflow,
          field,
          index,
          results,
          category
        );
        })
      )
    // } else if (category === "statusTime") {

    } else {
      await Promise.all(
        Object.values(regionMap).map(({ codes, field, index }) => {
          // codes.length가 있을 때만 코드별로 handleMOPFlowAggregation 호출
          if (codes.length) {
            return Promise.all(
              codes.map((code) =>
                handleMOPFlowAggregation(
                  query,
                  [code], // 단일 코드로 배열을 만듦
                  includeSame,
                  isInflow,
                  field,
                  index,
                  results,
                  category,
                  options
                )
              )
            );
          }
          return null;
        })
      );
    }
  }

  // 변경 지역 데이터 병합
  return !start
    ? results
    : mergeDataByMopFlowRegion(results, region, isAll ?? false);
}

async function handleMOPFlowAggregation(
  query: any,
  regionCodes: string[],
  includeSame: boolean,
  isInflow: boolean,
  field: string,
  index: string,
  results: any,
  category?: string,
  moveCdArray?: number[],
  isPurpose?: boolean,
  options?: any,
) {
  const regionQuery = structuredClone(query)
  // const isSido = region.length === 5;

  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  regionQuery.query.bool.filter.push({
    terms: { [`${regionCD}_${field}_CD`]: regionCodes },
  });
  if (!includeSame) {
    regionQuery.query.bool.must_not = [
      { terms: { [`${flowCD}_${field}_CD`]: regionCodes } },
    ];
  }
  regionQuery.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  if (category === "status" || category === "moveCd") {
    regionQuery.aggs.by_region.aggs.by_flow.terms.field = `${flowCD}_${field}_CD`;
  } else if (category === "statusSearch") {
    regionQuery.aggs.by_region.aggs.max_flow_region.terms.field = `${flowCD}_${field}_CD`;
  }  else if (category === "timezn" && moveCdArray) {
    regionQuery.aggs.by_region.aggs.by_time.terms.field = `${
      isInflow ? "ARVL" : "STRNG"
    }_TIMEZN_CD`;
    regionQuery.aggs.by_region.aggs.by_time.terms.size = 24;
    regionQuery.aggs.by_region.aggs.by_time.terms.order = { _key: "asc" };
    moveCdArray.forEach((code: number) => {
      regionQuery.aggs.by_region.aggs.by_time.aggs[`MOV${code}`] = {
        sum: {
          field: `MOV_${
            isPurpose ? "PRPS" : "WAY"
          }_${code}_POPUL_NUM`,
        },
      };
    });
    // if (field !== "SIDO") {
    //   moveCdArray.forEach((code: number) => {
    //     regionQuery.aggs.by_region.aggs.by_time.aggs[`MOV${code}`] = {
    //       sum: {
    //         field: `MOV_${
    //           isPurpose ? "PRPS" : "WAY"
    //         }_${code}_POPUL_NUM`,
    //       },
    //     };
    //   });
    // } else {
    //   regionQuery.aggs.by_region.aggs.by_time.aggs = {
    //     by_move: {
    //       terms: {
    //         field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
    //         size: 7,
    //         order: { _key: "asc" },
    //       },
    //       aggs: {
    //         pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
    //       },
    //     },
    //   };
    // }
  }

  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
}

export async function regionMOPODAggregation(
  query: any,
  options: MopMoveFlowParams,
  indexs: Indexs,
  category: string
) {
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "MOPP", index: indexs.sido },
    sgg: { codes: [], field: "MOPP", index: indexs.sgg },
    adm: { codes: [], field: "MOPP", index: indexs.adm! },
  };

  // 변경 지역 코드 추가
  regionMap = await getCompareRegionMap(
    options.regionArray,
    regionMap,
    options.start
  );
  regionMap = await addUnionRegionMap(options.region, regionMap);
  regionMap.sido.field = "SIDO";
  regionMap.sgg.field = "SGG";
  regionMap.adm.field = "ADMNS_DONG";

  // 지역 코드를 길이에 따라 분류
  // options.regionArray.forEach((region) => {
  //   if (region.length === 2) regionMap.sido.codes.push(region);
  //   else if (region.length === 5) regionMap.sgg.codes.push(region);
  //   else regionMap.adm.codes.push(region);
  // });

  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) =>
      codes.length
        ? handleRegionMOPODAggregation(
            query,
            options,
            codes,
            field,
            index,
            results,
            category
          )
        : null
    )
  );
  // 변경 지역 데이터 병합
  return results;
  // return mergeDataByRegion(results, options.regionArray);
}
async function handleRegionMOPODAggregation(
  query: any,
  options: MopMoveFlowParams,
  flows: string[],
  field: string,
  index: string,
  results: any,
  category: string
) {
  const regionQuery = structuredClone(query)

  const regionCD = options.isInflow ? "DETINA" : "PDEPAR";
  const flowCD = options.isInflow ? "PDEPAR" : "DETINA";

  regionQuery.query.bool.filter.push({
    term: { [`${regionCD}_${field}_CD`]: options.region },
  });
  regionQuery.query.bool.filter.push({
    terms: { [`${flowCD}_${field}_CD`]: flows },
  });
  regionQuery.aggs.by_region.terms.field = `${flowCD}_${field}_CD`;
  if (category === "timezn") {
    regionQuery.aggs.by_region.aggs.by_time.terms.field = `${
      options.isInflow ? "ARVL" : "STRNG"
    }_TIMEZN_CD`;
    regionQuery.aggs.by_region.aggs.by_time.terms.size = 24;
    regionQuery.aggs.by_region.aggs.by_time.terms.order = { _key: "asc" };
    if (field !== "SIDO") {
      options.moveCdArray.forEach((code: number) => {
        regionQuery.aggs.by_region.aggs.by_time.aggs[`MOV${code}`] = {
          sum: {
            field: `MOV_${
              options.isPurpose ? "PRPS" : "WAY"
            }_${code}_POPUL_NUM`,
          },
        };
      });
    } else {
      regionQuery.aggs.by_region.aggs.by_time.aggs = {
        by_move: {
          terms: {
            field: options.isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
            size: 7,
            order: { _key: "asc" },
          },
          aggs: {
            pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
          },
        },
      };
    }
  } else {
    regionQuery.aggs.by_region.aggs.by_flow.terms.field = `${flowCD}_${field}_CD`;
  }

  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
}
export async function regionMOPAggregation(
  query: any,
  options: any,
  includeSame: boolean,
  isInflow: boolean,
  indexs: Indexs,
  category?: string
) {
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  } = {
    sido: { codes: [], field: "SIDO", index: indexs.sido },
    sgg: { codes: [], field: "SGG", index: indexs.sgg },
    adm: { codes: [], field: "ADMNS_DONG", index: indexs.adm! },
  };

  // 변경 지역 코드 추가
  regionMap = await getCompareRegionMap(
    options.regionArray,
    regionMap,
    options.start
  );

  // // 지역 코드를 길이에 따라 분류
  // options.regionArray.forEach((region: string) => {
  //   if (region.length === 2) regionMap.sido.codes.push(region);
  //   else if (region.length === 5) regionMap.sgg.codes.push(region);
  //   else regionMap.adm.codes.push(region);
  // });

  // 각 지역에 대해 집계 처리
  // TO BE CHECKED must_not으로 하면 선택된 지역끼리간 이동 다 표출 제외됨
  //동일지역간 이동 표출 안하면 선택된 지역별로 쿼리 호출
  if (includeSame) {
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) => {
      // codes.length가 있을 때만 비동기 함수 실행
      if (codes.length) {
        return handleRegionMOPAggregation(
          query,
          options,
          codes,
          includeSame,
          isInflow,
          field,
          index,
          results,
          category
        );
      }
      return null;
    })
  );
  } else {
    await Promise.all(
      Object.values(regionMap).map(({ codes, field, index }) => {
        // codes.length가 있을 때만 코드별로 handleRegionFlowAggregation 호출
        if (codes.length) {
          return Promise.all(
            codes.map((code) =>
              handleRegionFlowAggregation(
                query,
                [code], // 단일 코드로 배열을 만듦
                includeSame,
                isInflow,
                field,
                index,
                results,
                category
              )
            )
          );
        }
        return null;
      })
    );
  }

  // 변경 지역 데이터 병합
  return mergeDataByRegion(results, options.regionArray);
  // return results;
}
async function handleRegionMOPAggregation(
  query: any,
  options: any,
  regionCodes: string[],
  includeSame: boolean,
  isInflow: boolean,
  field: string,
  index: string,
  results: any,
  category?: string
) {
  const regionQuery = structuredClone(query)

  const regionCD = isInflow ? "DETINA" : "PDEPAR";
  const flowCD = isInflow ? "PDEPAR" : "DETINA";

  regionQuery.query.bool.filter.push({
    terms: { [`${regionCD}_${field}_CD`]: regionCodes },
  });
  if (!includeSame) {
    regionQuery.query.bool.must_not = [
      { terms: { [`${flowCD}_${field}_CD`]: regionCodes } },
    ];
  }
  regionQuery.aggs.by_region.terms.field = `${regionCD}_${field}_CD`;
  
  //읍면동 월별일때 mons
  // if (field === "ADMNS_DONG") {
  //   const isMonth = isValidMonth(options.start);
  //   regionQuery.query.bool.filter.push(
  //     dateRange(isMonth, options.start, options.end)
  //   );
  // } else {
  regionQuery.query.bool.filter.push(
    dateRange(false, options.start, options.end)
  );
  // }
  if (category === "statusTime" || category === "moveCd" || category === "moveCd1") {
    regionQuery.aggs.by_region.aggs.by_time.terms.field = `${
      isInflow ? "ARVL" : "STRNG"
    }_TIMEZN_CD`;
    regionQuery.aggs.by_region.aggs.by_time.terms.size = 24;
    regionQuery.aggs.by_region.aggs.by_time.terms.order = { _key: "asc" };
  }
  if (category === "moveCd" || category === "moveCd1") {
    if (field !== "SIDO") {
      options.moveCdArray.forEach((code: number) => {
        regionQuery.aggs.by_region.aggs.by_time.aggs[`MOV${code}`] = {
          sum: {
            field: `MOV_${
              options.isPurpose ? "PRPS" : "WAY"
            }_${code}_POPUL_NUM`,
          },
        };
      });
    } else {
      options.moveCdArray.forEach((code: number) => {
        regionQuery.aggs.by_region.aggs.by_time.aggs[`MOV${code}`] = {
          sum: {
            field: `MOV_${
              options.isPurpose ? "PRPS" : "WAY"
            }_${code}_POPUL_NUM`,
          },
        };
      });
      // regionQuery.aggs.by_region.aggs.by_time.aggs = {
      //   by_move: {
      //     terms: {
      //       field: options.isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
      //       size: 7,
      //       order: { _key: "asc" },
      //     },
      //     aggs: {
      //       pop_by_move: { sum: { field: "TOT_POPUL_NUM" } },
      //     },
      //   },
      // };
    }
  }
  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });
    results.push(...(response.body.aggregations.by_region.buckets || []));
  } catch (error) {
    console.error(error);
  }
}

export async function dash_regionAggregation(
  query: any,
  region: string,
  validIndices: validIndices,
  start?: string,
  typeValue?: string,
  isAll?: boolean
) {
  let results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  if (typeValue === "new") {
    regionMap = {
      sido: { codes: [], field: "SIDO", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG", index: validIndices.sgg },
      adm: { codes: [], field: "ADM", index: validIndices.adm! },
    };
  } else if (typeValue === "mopin" || typeValue === "mopin_report") {
    regionMap = {
      sido: { codes: [], field: "DSIDO", index: validIndices.sido! },
      sgg: { codes: [], field: "DETINA_SGG_CD", index: validIndices.sgg },
      adm: {
        codes: [],
        field: "DETINA_ADMNS_DONG_CD",
        index: validIndices.adm!,
      },
    };
  } else if (typeValue === "mopout" || typeValue === "mopout_report") {
    regionMap = {
      sido: { codes: [], field: "PSIDO", index: validIndices.sido! },
      sgg: { codes: [], field: "PDEPAR_SGG_CD", index: validIndices.sgg },
      adm: {
        codes: [],
        field: "PDEPAR_ADMNS_DONG_CD",
        index: validIndices.adm!,
      },
    };
    
  } else if (typeValue === "llp") {
    regionMap = {
      sido: { codes: [], field: "SIDO_CD", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG_CD", index: validIndices.sgg },
      adm: { codes: [], field: "ADMNS_DONG_CD", index: validIndices.adm! },
    };
  } else {
    regionMap = {
      sido: { codes: [], field: "SIDO_CD", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG_CD", index: validIndices.sgg },
      adm: { codes: [], field: "ADM", index: validIndices.adm! },
    };
  }

  // 변경 지역 코드 추가
  regionMap = await getCompareDashRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  if (region.length === 5) {
    regionMap = await addUnionRegionMap(region, regionMap)
  }
  
  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) =>
      codes.length
        ? handleRegionDashAggregation(query, codes, field, index, results)
        : null
    )
  );
  if (typeValue === "mopout_report" || typeValue === "mopin_report") {
    results = await mergeUnionByDashCompareMOP(results, region, typeValue);
  }
  const data = await mergeDataByDashRegion(results, region, isAll ?? false);
  // 변경 지역 데이터 병합
  return !start ? results : data;
}

async function handleRegionDashAggregation(
  query: any,
  regionCodes: string[],
  field: string,
  index: string,
  results: any[]
) {
  const regionQuery = structuredClone(query)
  regionQuery.query.bool.filter.push({ terms: { [field]: regionCodes } });
  regionQuery.aggs.by_cd.terms.field = field;
  regionQuery.aggs.by_cd.terms.size = regionCodes.length;
  try {
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });
    // 집계 결과 저장
    results.push(...(response.body.aggregations.by_cd.buckets || []));
  } catch (error) {
    console.error(error);
  }
}
export async function alp_regionAggregation(
  query: any,
  regionArray: string[],
  validIndices: validIndices,
  start?: string,
  typeValue?: string,
  isAll?: boolean
) {
  let results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };

  if (typeValue === "native") {
    regionMap = {
      sido: { codes: [], field: "SIDO", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG", index: validIndices.sgg },
      adm: { codes: [], field: "ADM", index: validIndices.adm! },
    };
  } else {
    regionMap = {
      sido: { codes: [], field: "SIDO_CD", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG_CD", index: validIndices.sgg },
      adm: {
        codes: [],
        field: "ADMNS_DONG_CD",
        index: validIndices.adm!,
      },
    };
  }
  

  // 변경 지역 코드 추가
  regionMap = await getCompareRegionMap(regionArray, regionMap, start);
  if (typeValue === "forn") {
    regionMap = await addUnionRegionsMap(regionArray, regionMap, typeValue)
  }
  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) =>
      codes.length
        ? handleRegionALPAggregation(query, codes, field, index, results)
        : null
    )
  );
  if (typeValue === "forn") {
    results = await mergeUnionByAlpCompareForn(regionArray, results)
  }
  const data = await mergeDataByRegion(results, regionArray, isAll ?? false);
  // 변경 지역 데이터 병합
  return !start ? results : data;
}

async function handleRegionALPAggregation(
  query: any,
  regionCodes: string[],
  field: string,
  index: string,
  results: any[]
) {
  const regionQuery = structuredClone(query)
  regionQuery.query.bool.filter.push({ terms: { [field]: regionCodes } });
  regionQuery.aggs.by_region.terms.field = field;
  regionQuery.aggs.by_region.terms.size = regionCodes.length;

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

export async function llpAggregation(
  query: any,
  region: string,
  validIndices: validIndices,
  start?: string,
  typeValue?: string,
  isAll?: boolean,
  category?: string,
) {
  const results: any[] = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  if (typeValue === "new") {
    regionMap = {
      sido: { codes: [], field: "SIDO", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG", index: validIndices.sgg },
      adm: { codes: [], field: "ADM", index: validIndices.adm! },
    };
  }
  else if (typeValue === "llp") {
    regionMap = {
      sido: { codes: [], field: "LLPP", index: validIndices.sgg },
      sgg: { codes: [], field: "LLPP", index: validIndices.sgg },
      adm: { codes: [], field: "LLPP", index: validIndices.sgg },
    };
  } else {
    regionMap = {
      sido: { codes: [], field: "SIDO_CD", index: validIndices.sido! },
      sgg: { codes: [], field: "SGG_CD", index: validIndices.sgg },
      adm: { codes: [], field: "ADM", index: validIndices.adm! },
    };
  }

  // 변경 지역 코드 추가
  regionMap = await getCompareDashRegionMap(region, regionMap, start);
  // 통합 시군구 확인 (생활이동 데이터만 통합 시군구 집계 해야 함)
  regionMap = await addUnionRegionMap(region, regionMap);
  regionMap.sido.field = "SIDO_CD";
  regionMap.sgg.field = "SGG_CD";
  regionMap.adm.field = "ADMNS_DONG_CD";
  
  // 각 지역에 대해 집계 처리
  await Promise.all(
    Object.values(regionMap).map(({ codes, field, index }) =>
      codes.length
        ? handleLlpAggregation(query, codes, field, index, results)
        : null
    )
  );

  if (typeValue === "llp") {
    const data = await mergeDataByLlpRegion(results, region, isAll ?? false);
    return !start ? results : data;
  } else {
    const data = await mergeDataByDashRegion(results, region, isAll ?? false);
    return !start ? results : data;
  }
}

async function handleLlpAggregation(
  query: any,
  regionCodes: string[],
  field: string,
  index: string,
  results: any[],
) {
  const regionQuery = structuredClone(query)
  if (!regionQuery.aggs.current_year) {
    regionQuery.query.bool.filter.push({ terms: { [field]: regionCodes } });
  }
  if (regionQuery.aggs.current_year && regionQuery.aggs.by_lastYear) {
    regionQuery.aggs.current_year.aggs.by_sido.terms.field = field;
    regionQuery.aggs.current_year.aggs.by_sido.terms.size = regionCodes.length;
    regionQuery.aggs.by_lastYear.aggs.by_sido.terms.field = field;
    regionQuery.aggs.by_lastYear.aggs.by_sido.terms.size = regionCodes.length;
  }
  else if (regionQuery.aggs.by_region) {
    regionQuery.aggs.by_region.terms.field = field;
    regionQuery.aggs.by_region.terms.size = regionCodes.length;
  }
  else if (regionQuery.aggs.by_cd.terms) {
    regionQuery.aggs.by_cd.terms.field = field;
    regionQuery.aggs.by_cd.terms.size = regionCodes.length;
  }
  try {    
    const response = await searchWithLogging({
      index: index,
      body: regionQuery,
    });
    
    // 집계 결과 저장
    if (response.body.aggregations.by_region) {
        results.push(...(response.body.aggregations.by_region.buckets || []));
    }
    else if (response.body.aggregations.by_cd) {
        results.push(...(response.body.aggregations.by_cd.buckets || []))
    }
    else if (response.body.aggregations.current_year && response.body.aggregations.by_lastYear) {
      let newOb = {
        current_year: response.body.aggregations.current_year.by_sido.buckets,
        by_lastYear: response.body.aggregations.by_lastYear.by_sido.buckets,
      }
      results.push(newOb);
    }    
    
  } catch (error) {
    console.error(error);
  }
}