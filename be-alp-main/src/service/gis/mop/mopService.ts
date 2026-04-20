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
  dateRange,
  convertToRangeOrTermsFilter,
  regionRange,
  dayFilter,
  getMaxSize,
} from "@/utils/makeQueryFilter";
import { getHolidays } from "@/utils/holidays";
import { getSelectedSexAgeFilterScript } from "@/utils/generateScript";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getIndexMMList, getIndexYList } from "@/helpers/getIndexList";

// 공간 벡터 분석 , 지역 상세 행정구역
export async function getCompositeMopData(
  options: GisMopGridParams
): Promise<any> {
  const {
    regionArray,
    start,
    end,
    // dayArray,
    timeznArray,
    isPurpose,
    gender,
    ageArray,
    isInflow,
  } = options;

  
  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";

  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역
  const destiRegionCD = `${isInflow ? "P" : "D"}${regionType}`; //도착지역
  const sexArray = gender === 0 ? [1] : gender === 1 ? [0] : [0, 1];

  const maxSize: { [key: string]: number } = {
    SIDO: 100,
    SGG: 200,
    ADM: 500,
  };
  const index = {
    SIDO: `${isPurpose ? "native_prps" : "native_way"}_sido_day_sum`,
    SGG: `${isPurpose ? "native_prps" : "native_way"}_sgg_day`,
    ADM: `${isPurpose ? "native_prps" : "native_way"}_admdong_day`,
  };
  const validIndices =
    regionType === "SIDO"
      ? await getIndexYList(start, end, index[regionType])
      : await getIndexMMList(start, end, index[regionType]);
  let allResults: any[] = [];
  let aftercount = 0;
  let afterKey: any = null;
  const timeznFilter = convertToRangeOrTermsFilter(
    timeznArray,
    isInflow ? "ATIME" : "STIME"
  );

  try {
    while (true) {
      // composite aggregation 쿼리
      let query: any = {
        size: 0,
        query: {
          bool: {
            filter: [
              dateRange(false, start, end),
              {
                terms: {
                  [regionCD]: regionArray,
                },
              },
              {
                terms: {
                  SEXD: sexArray,
                },
              },
              {
                terms: {
                  AGEG: ageArray,
                },
              },
              ...(timeznArray.length !== 24 ? [timeznFilter] : []),
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: maxSize[regionType],
              sources: [
                {
                  [regionCD]: {
                    terms: {
                      field: regionCD,
                    },
                  },
                },
                {
                  [destiRegionCD]: {
                    terms: {
                      field: destiRegionCD,
                    },
                  },
                },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
            },
            aggs: {
              popul_sum0: {
                sum: {
                  field: isPurpose ? "PRPS0" : "WAY0",
                },
              },
              popul_sum1: {
                sum: {
                  field: isPurpose ? "PRPS1" : "WAY1",
                },
              },
              popul_sum2: {
                sum: {
                  field: isPurpose ? "PRPS2" : "WAY2",
                },
              },
              popul_sum3: {
                sum: {
                  field: isPurpose ? "PRPS3" : "WAY3",
                },
              },
              popul_sum4: {
                sum: {
                  field: isPurpose ? "PRPS4" : "WAY4",
                },
              },
              popul_sum5: {
                sum: {
                  field: isPurpose ? "PRPS5" : "WAY5",
                },
              },
              popul_sum6: {
                sum: {
                  field: isPurpose ? "PRPS6" : "WAY6",
                },
              },
              popul_sum7: {
                sum: {
                  field: isPurpose ? "PRPS7" : "WAY7",
                },
              },
            },
          },
        },
      };
      //요일, 평일/휴일
      //요일 평일 휴일
      // const holidays = await getHolidays(start, end);
      // query = dayFilter(holidays, dayArray, query);

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: validIndices,
        body: query,
      });
      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];
      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;
      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
      aftercount++;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
//행정구역 시계열 /timeSeries
export async function getCompositeMopTimeSeriesData(
  options: GisMopTimeParams
): Promise<any> {
  const { regionArray, start, end, isPurpose, gender, ageArray, isInflow } =
    options;

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";

  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역
  const destiRegionCD = `${isInflow ? "P" : "D"}${regionType}`; //도착지역
  const sexArray = gender === 0 ? [1] : gender === 1 ? [0] : [0, 1];

  const maxSize: { [key: string]: number } = {
    SIDO: 2000,
    SGG: 3000,
    ADMNS_DONG: 4000,
  };
  const index = {
    SIDO: `${isPurpose ? "native_prps" : "native_way"}_sido_day_sum`,
    SGG: `${isPurpose ? "native_prps" : "native_way"}_sgg_day`,
    ADM: `${isPurpose ? "native_prps" : "native_way"}_admdong_day`,
  };
  const validIndices =
    regionType === "SIDO"
      ? await getIndexYList(start, end, index[regionType])
      : await getIndexMMList(start, end, index[regionType]);
  let allResults: any[] = [];
  let afterKey: any = null;
  let aftercount = 0;
  // const timeznFilter = convertToRangeOrTermsFilter(
  //   timeznArray,
  //   isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD"
  // );

  try {
    while (true) {
      // composite aggregation 쿼리
      let query: any = {
        size: 0,
        query: {
          bool: {
            filter: [
              dateRange(false, start, end),
              {
                terms: {
                  [regionCD]: regionArray,
                },
              },
              {
                terms: {
                  SEXD: sexArray,
                },
              },
              {
                terms: {
                  AGEG: ageArray,
                },
              },
              // ...(timeznArray.length !== 24 ? [timeznFilter] : []),
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: 10000,
              sources: [
                {
                  [regionCD]: {
                    terms: {
                      field: regionCD,
                    },
                  },
                },
                {
                  [destiRegionCD]: {
                    terms: {
                      field: destiRegionCD,
                    },
                  },
                },
                {
                  [isInflow ? "ATMST" : "STMST"]: {
                    terms: {
                      field: isInflow ? "ATMST" : "STMST",
                    },
                  },
                },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
            },
            aggs: {
              popul_sum0: {
                sum: {
                  field: isPurpose ? "PRPS0" : "WAY0",
                },
              },
              popul_sum1: {
                sum: {
                  field: isPurpose ? "PRPS1" : "WAY1",
                },
              },
              popul_sum2: {
                sum: {
                  field: isPurpose ? "PRPS2" : "WAY2",
                },
              },
              popul_sum3: {
                sum: {
                  field: isPurpose ? "PRPS3" : "WAY3",
                },
              },
              popul_sum4: {
                sum: {
                  field: isPurpose ? "PRPS4" : "WAY4",
                },
              },
              popul_sum5: {
                sum: {
                  field: isPurpose ? "PRPS5" : "WAY5",
                },
              },
              popul_sum6: {
                sum: {
                  field: isPurpose ? "PRPS6" : "WAY6",
                },
              },
              popul_sum7: {
                sum: {
                  field: isPurpose ? "PRPS7" : "WAY7",
                },
              },
            },
          },
        },
      };
      //요일 평일 휴일
      // const holidays = await getHolidays(start, end);
      // query = dayFilter(holidays, dayArray, query);

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: validIndices,
        body: query,
      });

      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];
      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;
      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
      aftercount++;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
//차트 시계열
export async function getCompositeMopChartTimeSeriesData(
  options: GisMopChartParams
): Promise<any> {
  const { regionArray, start, end, isPurpose, gender, ageArray, isInflow } =
    options;

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";

  const regionCD = `${isInflow ? "D" : "P"}${regionType}`; //기준지역
  const destiRegionCD = `${isInflow ? "P" : "D"}${regionType}`; //도착지역
  const sexArray = gender === 0 ? [1] : gender === 1 ? [0] : [0, 1];

  const maxSize: { [key: string]: number } = {
    SIDO: 100,
    SGG: 200,
    ADM: 500,
  };
  const index = {
    SIDO: `${isPurpose ? "native_prps" : "native_way"}_sido_day_sum`,
    SGG: `${isPurpose ? "native_prps" : "native_way"}_sgg_day`,
    ADM: `${isPurpose ? "native_prps" : "native_way"}_admdong_day`,
  };
  const validIndices =
    regionType === "SIDO"
      ? await getIndexYList(start, end, index[regionType])
      : await getIndexMMList(start, end, index[regionType]);
  let allResults: any[] = [];
  let aftercount = 0;
  let afterKey: any = null;
  // const timeznFilter = convertToRangeOrTermsFilter(
  //   timeznArray,
  //   isInflow ? "ATIME" : "STIME"
  // );

  try {
    while (true) {
      // composite aggregation 쿼리
      let query: any = {
        size: 0,
        query: {
          bool: {
            filter: [
              dateRange(false, start, end),
              {
                terms: {
                  [regionCD]: regionArray,
                },
              },
              {
                terms: {
                  SEXD: sexArray,
                },
              },
              {
                terms: {
                  AGEG: ageArray,
                },
              },
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: 10000,
              sources: [
                {
                  [regionCD]: {
                    terms: {
                      field: regionCD,
                    },
                  },
                },
                // {
                //   [destiRegionCD]: {
                //     terms: {
                //       field: destiRegionCD,
                //     },
                //   },
                // },
                {
                  [isInflow ? "ATMST" : "STMST"]: {
                    terms: {
                      field: isInflow ? "ATMST" : "STMST",
                    },
                  },
                },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
            },
            aggs: {
              popul_sum0: {
                sum: {
                  field: isPurpose ? "PRPS0" : "WAY0",
                },
              },
              popul_sum1: {
                sum: {
                  field: isPurpose ? "PRPS1" : "WAY1",
                },
              },
              popul_sum2: {
                sum: {
                  field: isPurpose ? "PRPS2" : "WAY2",
                },
              },
              popul_sum3: {
                sum: {
                  field: isPurpose ? "PRPS3" : "WAY3",
                },
              },
              popul_sum4: {
                sum: {
                  field: isPurpose ? "PRPS4" : "WAY4",
                },
              },
              popul_sum5: {
                sum: {
                  field: isPurpose ? "PRPS5" : "WAY5",
                },
              },
              popul_sum6: {
                sum: {
                  field: isPurpose ? "PRPS6" : "WAY6",
                },
              },
              popul_sum7: {
                sum: {
                  field: isPurpose ? "PRPS7" : "WAY7",
                },
              },
            },
          },
        },
      };
      //요일, 평일/휴일
      //요일 평일 휴일
      // const holidays = await getHolidays(start, end);
      // query = dayFilter(holidays, dayArray, query);

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: validIndices,
        body: query,
      });
      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];
      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;
      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
      aftercount++;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
//격자
export async function getCompositeMopGridData(
  options: GisMopGridParams,
  cellSizes: string[] = ["250", "500", "1000"],
  isTimeSeries: boolean
): Promise<any> {
  const {
    regionArray,
    start,
    end,
    // dayArray,
    timeznArray,
    isPurpose,
    gender,
    ageArray,
    isInflow,
  } = options;

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADMNS_DONG";
  const regionCD = `${isInflow ? "DETINA" : "PDEPAR"}_${regionType}_CD`; //기준지역
  const sexArray = gender === 0 ? [1] : gender === 1 ? [0] : [0, 1];

  let indexName = "";
  if (isInflow) {
    if (isPurpose) {
      indexName = "native_prps_in_time_ncell_day";
    } else {
      indexName = "native_way_in_time_ncell_day";
    }
  } else {
    if (isPurpose) {
      indexName = "native_prps_out_time_ncell_day";
    } else {
      indexName = "native_way_out_time_ncell_day";
    }
  }

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndices = await getIndexMMList(start, end, indexName);

  const index = validIndices.join(",");

  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };

  const maxSize = getMaxSize(start, end, 200);
  const timeznFilter = convertToRangeOrTermsFilter(
    timeznArray,
    isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD"
  );

  //개발용
  // const tmstCD = isInflow ? "ARVL_TIME_BASE_TMST" : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ARVL_BASE_TMST" : "STRNG_BASE_TMST";

  try {
    await Promise.all(
      cellSizes.map(async (cellSize) => {
        let results: any[] = [];
        let afterKey: any = null;
        while (true) {
          // composite aggregation 쿼리
          let query: any = {
            size: 0,
            query: {
              bool: {
                filter: [
                  dateRange(false, start, end),
                  {
                    terms: {
                      [regionCD]: regionArray,
                    },
                  },
                  {
                    terms: {
                      AGE_GROUP_CD: ageArray,
                    },
                  },
                  {
                    terms: {
                      SEX_DIV_CD: sexArray,
                    },
                  },
                  ...(timeznArray.length !== 24 ? [timeznFilter] : []),
                ],
              },
            },
            aggs: {
              by_composite_region: {
                composite: {
                  size: 10000,
                  sources: [
                    {
                      [regionCD]: {
                        terms: {
                          field: regionCD,
                        },
                      },
                    },
                    ...(isTimeSeries
                      ? [
                          {
                            [tmstCD]: {
                              terms: {
                                field: tmstCD,
                              },
                            },
                          },
                        ]
                      : []),
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
                },
                aggs: {
                  popul_sum0: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_0_POPUL_NUM"
                        : "MOV_WAY_0_POPUL_NUM",
                    },
                  },
                  popul_sum1: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_1_POPUL_NUM"
                        : "MOV_WAY_1_POPUL_NUM",
                    },
                  },
                  popul_sum2: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_2_POPUL_NUM"
                        : "MOV_WAY_2_POPUL_NUM",
                    },
                  },
                  popul_sum3: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_3_POPUL_NUM"
                        : "MOV_WAY_3_POPUL_NUM",
                    },
                  },
                  popul_sum4: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_4_POPUL_NUM"
                        : "MOV_WAY_4_POPUL_NUM",
                    },
                  },
                  popul_sum5: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_5_POPUL_NUM"
                        : "MOV_WAY_5_POPUL_NUM",
                    },
                  },
                  popul_sum6: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_6_POPUL_NUM"
                        : "MOV_WAY_6_POPUL_NUM",
                    },
                  },
                  popul_sum7: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_7_POPUL_NUM"
                        : "MOV_WAY_7_POPUL_NUM",
                    },
                  },
                },
              },
            },
          };

          //요일 평일 휴일
          // const holidays = await getHolidays(start, end);
          // query = dayFilter(holidays, dayArray, query);

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });

          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          results = [...results, ...buckets];

          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;
          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          // afterCnt[cellSize] += 1;
        }
        allResults[cellSize] = results;
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}

export async function getCompositeMopGridMonsData(
  options: GisMopGridParams,
  cellSizes: string[] = ["250", "500", "1000"],
  isTimeSeries: boolean
): Promise<any> {
  const {
    regionArray,
    start,
    end,
    // dayArray,
    timeznArray,
    isPurpose,
    gender,
    ageArray,
    isInflow,
  } = options;

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADMNS_DONG";
  const regionCD = `${isInflow ? "DETINA" : "PDEPAR"}_${regionType}_CD`; //기준지역
  const sexArray = gender === 0 ? [0] : gender === 1 ? [1] : [0, 1];

  let indexName = "";
  if (isInflow) {
    if (isPurpose) {
      indexName = "native_prps_in_time_ncell_mons";
    } else {
      indexName = "native_way_in_time_ncell_mons";
    }
  } else {
    if (isPurpose) {
      indexName = "native_prps_out_time_ncell_mons";
    } else {
      indexName = "native_way_out_time_ncell_mons";
    }
  }

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndices = await getIndexMMList(start, end, indexName);

  const index = validIndices.join(",");

  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };

  const maxSize = getMaxSize(start, end, 200);
  const timeznFilter = convertToRangeOrTermsFilter(
    timeznArray,
    isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD"
  );

  //개발용
  // const tmstCD = isInflow ? "ARVL_TIME_BASE_TMST" : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ARVL_BASE_TMST" : "STRNG_BASE_TMST";

  try {
    await Promise.all(
      cellSizes.map(async (cellSize) => {
        let results: any[] = [];
        let afterKey: any = null;
        while (true) {
          // composite aggregation 쿼리
          let query: any = {
            size: 0,
            query: {
              bool: {
                filter: [
                  dateRange(true, start, end),
                  {
                    terms: {
                      [regionCD]: regionArray,
                    },
                  },
                  {
                    terms: {
                      AGE_GROUP_CD: ageArray,
                    },
                  },
                  {
                    terms: {
                      SEX_DIV_CD: sexArray,
                    },
                  },
                  ...(timeznArray.length !== 24 ? [timeznFilter] : []),
                ],
              },
            },
            aggs: {
              by_composite_region: {
                composite: {
                  size: maxSize[cellSize],
                  sources: [
                    {
                      [regionCD]: {
                        terms: {
                          field: regionCD,
                        },
                      },
                    },
                    ...(isTimeSeries
                      ? [
                          {
                            [tmstCD]: {
                              terms: {
                                field: tmstCD,
                              },
                            },
                          },
                        ]
                      : []),
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
                },
                aggs: {
                  popul_sum0: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_0_POPUL_NUM"
                        : "MOV_WAY_0_POPUL_NUM",
                    },
                  },
                  popul_sum1: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_1_POPUL_NUM"
                        : "MOV_WAY_1_POPUL_NUM",
                    },
                  },
                  popul_sum2: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_2_POPUL_NUM"
                        : "MOV_WAY_2_POPUL_NUM",
                    },
                  },
                  popul_sum3: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_3_POPUL_NUM"
                        : "MOV_WAY_3_POPUL_NUM",
                    },
                  },
                  popul_sum4: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_4_POPUL_NUM"
                        : "MOV_WAY_4_POPUL_NUM",
                    },
                  },
                  popul_sum5: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_5_POPUL_NUM"
                        : "MOV_WAY_5_POPUL_NUM",
                    },
                  },
                  popul_sum6: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_6_POPUL_NUM"
                        : "MOV_WAY_6_POPUL_NUM",
                    },
                  },
                  popul_sum7: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_7_POPUL_NUM"
                        : "MOV_WAY_7_POPUL_NUM",
                    },
                  },
                },
              },
            },
          };

          //요일 평일 휴일
          // const holidays = await getHolidays(start, end);
          // query = dayFilter(holidays, dayArray, query);

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });

          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          results = [...results, ...buckets];

          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;
          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          // afterCnt[cellSize] += 1;
        }
        allResults[cellSize] = results;
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
// 격자 시계열
export async function getMopGridTimeData(
  options: GisMopTimeParams,
  cellSizes: string[] = ["250", "500", "1000"],
  isTimeSeries: boolean
): Promise<any> {
  const { regionArray, start, end, isPurpose, gender, ageArray, isInflow } =
    options;

  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADMNS_DONG";
  const regionCD = `${isInflow ? "DETINA" : "PDEPAR"}_${regionType}_CD`; //기준지역
  const sexArray = gender === 0 ? [1] : gender === 1 ? [0] : [0, 1];

  let indexName = "";
  if (isInflow) {
    if (isPurpose) {
      indexName = "native_prps_in_time_ncell_day";
    } else {
      indexName = "native_way_in_time_ncell_day";
    }
  } else {
    if (isPurpose) {
      indexName = "native_prps_out_time_ncell_day";
    } else {
      indexName = "native_way_out_time_ncell_day";
    }
  }

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndices = await getIndexMMList(start, end, indexName);

  const index = validIndices.join(",");

  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };

  const maxSize = getMaxSize(start, end, 200);
  // const timeznFilter = convertToRangeOrTermsFilter(
  //   timeznArray,
  //   isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD"
  // );

  //개발용
  // const tmstCD = isInflow ? "ARVL_TIME_BASE_TMST" : "STRNG_TIME_BASE_TMST";
  //kt용
  const tmstCD = isInflow ? "ARVL_BASE_TMST" : "STRNG_BASE_TMST";

  try {
    await Promise.all(
      cellSizes.map(async (cellSize) => {
        let results: any[] = [];
        let afterKey: any = null;
        while (true) {
          // composite aggregation 쿼리
          let query: any = {
            size: 0,
            query: {
              bool: {
                filter: [
                  dateRange(false, start, end),
                  {
                    terms: {
                      [regionCD]: regionArray,
                    },
                  },
                  {
                    terms: {
                      AGE_GROUP_CD: ageArray,
                    },
                  },
                  {
                    terms: {
                      SEX_DIV_CD: sexArray,
                    },
                  },
                  // ...(timeznArray.length !== 24 ? [timeznFilter] : []),
                ],
              },
            },
            aggs: {
              by_composite_region: {
                composite: {
                  size: 10000,
                  sources: [
                    {
                      [regionCD]: {
                        terms: {
                          field: regionCD,
                        },
                      },
                    },
                    ...(isTimeSeries
                      ? [
                          {
                            [tmstCD]: {
                              terms: {
                                field: tmstCD,
                              },
                            },
                          },
                        ]
                      : []),
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
                },
                aggs: {
                  popul_sum0: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_0_POPUL_NUM"
                        : "MOV_WAY_0_POPUL_NUM",
                    },
                  },
                  popul_sum1: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_1_POPUL_NUM"
                        : "MOV_WAY_1_POPUL_NUM",
                    },
                  },
                  popul_sum2: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_2_POPUL_NUM"
                        : "MOV_WAY_2_POPUL_NUM",
                    },
                  },
                  popul_sum3: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_3_POPUL_NUM"
                        : "MOV_WAY_3_POPUL_NUM",
                    },
                  },
                  popul_sum4: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_4_POPUL_NUM"
                        : "MOV_WAY_4_POPUL_NUM",
                    },
                  },
                  popul_sum5: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_5_POPUL_NUM"
                        : "MOV_WAY_5_POPUL_NUM",
                    },
                  },
                  popul_sum6: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_6_POPUL_NUM"
                        : "MOV_WAY_6_POPUL_NUM",
                    },
                  },
                  popul_sum7: {
                    sum: {
                      field: isPurpose
                        ? "MOV_PRPS_7_POPUL_NUM"
                        : "MOV_WAY_7_POPUL_NUM",
                    },
                  },
                },
              },
            },
          };

          //요일 평일 휴일
          // const holidays = await getHolidays(start, end);
          // query = dayFilter(holidays, dayArray, query);

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });

          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          results = [...results, ...buckets];

          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;
          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          // afterCnt[cellSize] += 1;
        }
        allResults[cellSize] = results;
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
// x
export async function getCompositeFlowData(
  isInflow: boolean,
  isPurpose: boolean,
  start: string,
  end: string,
  regionArray: string[],
  timeznArray: number[]
): Promise<any> {
  const regionType =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADMNS_DONG";
  const regionCD = `${isInflow ? "DETINA" : "PDEPAR"}_${regionType}_CD`; //기준지역
  const destiRegionCD = `${isInflow ? "PDEPAR" : "DETINA"}_${regionType}_CD`; //도착지역
  const maxSize: { [key: string]: number } = {
    SIDO: 100,
    SGG: 200,
    ADMNS_DONG: 500,
  };

  const validIndices = await getIndexYList(
    start,
    end,
    `${isPurpose ? "prps" : "way"}_admdong_day`
  );

  const index = {
    SIDO: `${isPurpose ? "prps" : "way"}_sido_day`,
    SGG: `${isPurpose ? "prps" : "way"}_sgg_day`,
    ADMNS_DONG: validIndices.join(","),
  };
  let allResults: any[] = [];
  let afterKey: any = null;
  let aftercount = 0;

  const timeznFilter = convertToRangeOrTermsFilter(
    timeznArray,
    isInflow ? "ARVL_TIMEZN_CD" : "STRNG_TIMEZN_CD"
  );
  try {
    while (true) {
      // composite aggregation 쿼리
      const query: any = {
        size: 0,
        query: {
          bool: {
            filter: [
              dateRange(false, start, end),
              {
                terms: {
                  [regionCD]: regionArray,
                },
              },
              timeznFilter,
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: maxSize[regionType],
              sources: [
                {
                  [regionCD]: {
                    terms: {
                      field: regionCD,
                    },
                  },
                },
                {
                  [destiRegionCD]: {
                    terms: {
                      field: destiRegionCD,
                    },
                  },
                },
                {
                  BASE_YMD: {
                    terms: {
                      field: "BASE_YMD",
                    },
                    order: {
                      _key: "asc",
                    },
                  },
                },
                {
                  DOW_CD: {
                    terms: {
                      field: "DOW_CD",
                    },
                  },
                },
                {
                  [isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD"]: {
                    terms: {
                      field: isPurpose ? "MOV_PRPS_CD" : "MOV_WAY_CD",
                    },
                  },
                },
                {
                  IN_FORN_DIV_NM: {
                    terms: {
                      field: "IN_FORN_DIV_NM",
                    },
                  },
                },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 확실히 존재할 때만 추가
            },
            aggs: {
              popul_sum: {
                scripted_metric: {
                  init_script:
                    "state.populationSums = new HashMap(); state.doc_count = 0;",
                  map_script: {
                    id: "popul_5_to_10_sum_script",
                  },
                  combine_script: `return state;`,
                  reduce_script: `
                    Map result = new HashMap();
                  
                    for (s in states) {
                      for (entry in s.populationSums.entrySet()) {
                        result[entry.getKey()] = result.getOrDefault(entry.getKey(), 0.0) + entry.getValue();
                      }
                    }
                  
                    return result;
                  `,
                },
              },
            },
          },
        },
      };
      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: index[regionType],
        body: query,
      });
      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];
      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;
      aftercount++;
      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
