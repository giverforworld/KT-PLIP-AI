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
  convertToRangeOrTermsFilter,
  dateRange,
  dayFilter,
  getMaxSize,
} from "@/utils/makeQueryFilter";
import { getHolidays } from "@/utils/holidays";
import {
  getPatternsPopulAvgScript,
  getSelectedSex_AgeFilterScriptAvg,
  getSelectedSexAgeFilterScript,
  getSelectedSexAgeFilterScriptAvg,
} from "@/utils/generateScript";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import {
  getGisDayIndex,
  getGisIndex,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { generateFieldSexAge } from "@/utils/generateSexAge";

//행정구역 하위로 조회
export async function getCompositeAlpData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  timeznArray: number[],
  patterns: string[]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SGG_GR"
      : regionArray[0].length === 5
      ? "ADM_GR"
      : "ADM";
  const subRegionCD = regionArray[0].length === 2 ? "SGG" : "ADM";

  const maxSize: { [key: string]: number } = {
    SIDO: 100,
    SGG: 200,
    ADM: 500,
  };
  const sexArray = gender === 0 ? ["M"] : gender === 1 ? ["F"] : ["M", "F"];
  const patternMap: { [key: string]: number } = {
    RSDN: 0,
    WKPLC: 1,
    VIST: 2,
  };
  const patterncode: number[] = patterns.map((key) => patternMap[key]);

  const index = {
    SGG: await getIndexYList(start, end, "native_time_nation_day"),
    ADM: await getIndexYList(start, end, "native_time_nation_day"),
  };

  let allResults: any[] = [];
  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIME");
  let scriptSource = "";

  scriptSource = ageArray
    .map((ageArray) => {
      const nextAge = ageArray + 5;
      const ageStr = ageArray === 0 ? "00" : ageArray.toString();
      const maleField = `M${ageStr}`;
      const male5Field = `M${nextAge}`;
      const femaleField = `F${ageStr}`;
      const female5Field = `F${nextAge}`;

      if (ageArray === 0 || ageArray === 80) {
        return gender === 2
          ? `doc['${maleField}'].value + doc['${femaleField}'].value`
          : gender === 0
          ? `doc['${maleField}'].value`
          : `doc['${femaleField}'].value`;
      } else {
        return gender === 2
          ? `doc['${maleField}'].value + doc['${male5Field}'].value + doc['${femaleField}'].value + doc['${female5Field}'].value`
          : gender === 0
          ? `doc['${maleField}'].value + doc['${male5Field}'].value`
          : `doc['${femaleField}'].value + doc['${female5Field}'].value`;
      }
    })
    .join(" + ");

  try {
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
                  PTRN: patterncode,
                },
              },
              ...(timeznArray.length !== 24 ? [timeznFilter] : []),
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: maxSize[regionCD],
              sources: [
                { [regionCD]: { terms: { field: regionCD } } },
                // regionCD가 ADM일 때 subRegionCD는 없도록
                ...(regionCD !== 'ADM' ? [
                  {
                    [subRegionCD]: {
                      terms: {
                        field: subRegionCD
                      }
                    }
                  }
                ] : []),
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
            },
            aggs: {
              popul_avg: {
                sum: {
                  script: {
                    source: `${scriptSource}`,
                  },
                },
              },
              male_0: {
                sum: {
                  field: "M00"
                }
              },
              male_10: {
                sum: {
                  script: {
                    source: `
                    doc['M10'].value + doc['M15'].value
                  `,
                  },
                }
              },
              male_20: {
                sum: {
                  script: {
                    source: `
                    doc['M20'].value + doc['M25'].value
                  `,
                  },
                }
              },
              male_30: {
                sum: {
                  script: {
                    source: `
                    doc['M30'].value + doc['M35'].value
                  `,
                  },
                }
              },
              male_40: {
                sum: {
                  script: {
                    source: `
                    doc['M40'].value + doc['M45'].value
                  `,
                  },
                }
              },
              male_50: {
                sum: {
                  script: {
                    source: `
                    doc['M50'].value + doc['M55'].value
                  `,
                  },
                }
              },
              male_60: {
                sum: {
                  script: {
                    source: `
                    doc['M60'].value + doc['M65'].value
                  `,
                  },
                }
              },
              male_70: {
                sum: {
                  script: {
                    source: `
                    doc['M70'].value + doc['M75'].value
                  `,
                  },
                }
              },
              male_80: {
                sum: {
                  script: {
                    source: `
                    doc['M80'].value
                  `,
                  },
                }
              },
              feml_0: {
                sum: {
                  field: "F00"
                }
              },
              feml_10: {
                sum: {
                  script: {
                    source: `
                    doc['F10'].value + doc['F15'].value
                  `,
                  },
                }
              },
              feml_20: {
                sum: {
                  script: {
                    source: `
                    doc['F20'].value + doc['F25'].value
                  `,
                  },
                }
              },
              feml_30: {
                sum: {
                  script: {
                    source: `
                    doc['F30'].value + doc['F35'].value
                  `,
                  },
                }
              },
              feml_40: {
                sum: {
                  script: {
                    source: `
                    doc['F40'].value + doc['F45'].value
                  `,
                  },
                }
              },
              feml_50: {
                sum: {
                  script: {
                    source: `
                    doc['F50'].value + doc['F55'].value
                  `,
                  },
                }
              },
              feml_60: {
                sum: {
                  script: {
                    source: `
                    doc['F60'].value + doc['F65'].value
                  `,
                  },
                }
              },
              feml_70: {
                sum: {
                  script: {
                    source: `
                    doc['F70'].value + doc['F75'].value
                  `,
                  },
                }
              },
              feml_80: {
                sum: {
                  script: {
                    source: `
                    doc['F80'].value
                  `,
                  },
                }
              },
            },
          },
        },
      };

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: index[subRegionCD],
        body: query,
      });

      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];

      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;

      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
//외국인 데이터
export async function getCompositeFornData(
  regionArray: string[],
  start: string,
  end: string,
  dayArray: number[],
  timeznArray: number[]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO_CD"
      : regionArray[0].length === 5
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  const subRegionCD = regionArray[0].length === 2 ? "SGG_CD" : "ADMNS_DONG_CD";

  const maxSize: { [key: string]: number } = {
    SIDO_CD: 100,
    SGG_CD: 200,
    ADMNS_DONG: 500,
  };
  const index = {
    SGG_CD: await getIndexYList(start, end, "forn_time_sgg_day"),
    ADMNS_DONG_CD: await getIndexYList(start, end, "forn_time_admdong_day"),
  };

  let allResults: any[] = [];
  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIMEZN_CD");

  try {
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
              timeznFilter,
            ],
          },
        },
        aggs: {
          by_composite_region: {
            composite: {
              size: maxSize[regionCD],
              sources: [
                { [regionCD]: { terms: { field: regionCD } } },
                { [subRegionCD]: { terms: { field: subRegionCD } } },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
            },
            aggs: {
              popul_avg: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
        },
      };

      //요일 평일 휴일
      const holidays = await getHolidays(start, end);
      query = dayFilter(holidays, dayArray, query);

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: index[subRegionCD],
        body: query,
      });
      const buckets = response.body.aggregations.by_composite_region.buckets;
      allResults = [...allResults, ...buckets];

      // 다음 페이지를 위한 afterKey 설정
      afterKey = response.body.aggregations.by_composite_region.after_key;

      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
    }

    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function getCompositeGridData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  timeznArray: number[],
  pattern: string[],
  cellSizes: string[] = ["250", "500", "1000"]
  // cellSizes: string[] = ["250"]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO_CD"
      : regionArray[0].length === 5
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  const patternMap: { [key: string]: number } = {
    RSDN: 0,
    WKPLC: 1,
    VIST: 2,
  };
  const patterns: number[] = pattern.map((key) => patternMap[key]);

  const validIndices = await getIndexMMList(
    start,
    end,
    "native_time_ncell_day"
  );
  const index = validIndices.join(",");
  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };

  const maxSize = getMaxSize(start, end, 100);

  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIMEZN_CD");
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };

  try {
    // 각 cellSize를 병렬로 처리
    await Promise.all(
      cellSizes.map(async (cellSize) => {
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
                  timeznFilter,
                  {
                    terms: {
                      LIFE_PTRN_CD: patterns,
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
                    { [regionCD]: { terms: { field: regionCD } } },
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
                },
                aggs: getSelectedSex_AgeFilterScriptAvg(gender, ageArray),
              },
            },
          };

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });
          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          allResults[cellSize] = [...allResults[cellSize], ...buckets];
          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;

          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
// 격자 시계열
export async function getCompositeGridTimeSeriesData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  patterns: string[],
  cellSizes: string[] = ["250", "500", "1000"]
  // cellSizes: string[] = ["250"]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO_CD"
      : regionArray[0].length === 5
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  const patternMap: { [key: string]: number } = {
    RSDN: 0,
    WKPLC: 1,
    VIST: 2,
  };
  const pattern = patterns.map((key) => patternMap[key]);
  const validIndices = await getIndexMMList(
    start,
    end,
    "native_time_ncell_day"
  );
  const index = validIndices.join(",");
  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };
  const maxSize = getMaxSize(start, end, 1000);

  // }; // 한 번에 가져올 데이터의 최대 크기 증가
  // const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIMEZN_CD");
  try {
    // 각 cellSize를 병렬로 처리
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
                  // timeznFilter,
                  {
                    terms: {
                      LIFE_PTRN_CD: pattern,
                    },
                  },
                ],
              },
            },
            aggs: {
              by_composite_region_timestamp: {
                composite: {
                  size: 10000,
                  sources: [
                    {
                      TIME_BASE_TMST: { terms: { field: "TIME_BASE_TMST" } },
                    },
                    { [regionCD]: { terms: { field: regionCD } } },
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
                },
                aggs: getSelectedSex_AgeFilterScriptAvg(gender, ageArray),
              },
            },
          };

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });

          const buckets =
            response.body.aggregations.by_composite_region_timestamp.buckets;

          results = [...results, ...buckets];

          // 다음 페이지를 위한 afterKey 설정
          afterKey =
            response.body.aggregations.by_composite_region_timestamp.after_key;
          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
        allResults[cellSize] = results;
      })
    );

    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function getCompositeChartTimeSeriesData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  patterns: string[]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO_CD"
      : regionArray[0].length === 5
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  const patternMap: { [key: string]: number } = {
    RSDN: 0,
    WKPLC: 1,
    VIST: 2,
  };
  const pattern = patterns.map((key) => patternMap[key]);
  const validIndices = await getIndexMMList(
    start,
    end,
    "native_time_ncell_day"
  );
  const index = validIndices.join(",");

  let allResults: any[] = [];
  let afterKey: any = null;
  // const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIMEZN_CD");
  // let afterCnt = 0;

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
              // timeznFilter,
              {
                terms: {
                  LIFE_PTRN_CD: pattern,
                },
              },
            ],
          },
        },
        aggs: {
          by_composite_region_timestamp: {
            composite: {
              size: 1000,
              sources: [
                { [regionCD]: { terms: { field: regionCD } } },
                {
                  TIME_BASE_TMST: { terms: { field: "TIME_BASE_TMST" } },
                },
              ],
              ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
            },
            aggs: getSelectedSex_AgeFilterScriptAvg(gender, ageArray),
          },
        },
      };

      //요일, 평일/휴일
      //요일 평일 휴일
      // const holidays = await getHolidays(start, end);
      // query = dayFilter(holidays, dayArray, query);

      // 검색 쿼리 실행
      const response = await searchWithLogging({
        index: index,
        body: query,
      });
      const buckets =
        response.body.aggregations.by_composite_region_timestamp.buckets;
      allResults = [...allResults, ...buckets];

      // 다음 페이지를 위한 afterKey 설정
      afterKey =
        response.body.aggregations.by_composite_region_timestamp.after_key;

      // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
      if (buckets.length === 0 || !afterKey) break;
      // afterCnt += 1;
    }
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function getCompositeGridMonsData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  timeznArray: number[],
  patterns: string[],
  cellSizes: string[] = ["250", "500", "1000"]
  // cellSizes: string[] = ["250"]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO_CD"
      : regionArray[0].length === 5
      ? "SGG_CD"
      : "ADMNS_DONG_CD";
  const patternMap: { [key: string]: number } = {
    RSDN: 0,
    WKPLC: 1,
    VIST: 2,
  };
  const pattern = patterns.map((key) => patternMap[key]);
  const validIndices = await getIndexMMList(
    start,
    end,
    "native_time_ncell_mons"
  );
  const index = validIndices.join(",");
  let allResults: Record<string, any[]> = { 250: [], 500: [], 1000: [] };

  const maxSize = getMaxSize(start, end, 100);

  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIMEZN_CD");
  let afterCnt: Record<string, number> = { 250: 0, 500: 0, 1000: 0 };

  try {
    // 각 cellSize를 병렬로 처리
    await Promise.all(
      cellSizes.map(async (cellSize) => {
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
                  timeznFilter,
                  {
                    terms: {
                      LIFE_PTRN_CD: pattern,
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
                    { [regionCD]: { terms: { field: regionCD } } },
                    {
                      [`CELL_ID_${cellSize}`]: {
                        terms: {
                          field: `CELL_ID_${cellSize}`,
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
                },
                aggs: getSelectedSex_AgeFilterScriptAvg(gender, ageArray),
              },
            },
          };

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });
          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          allResults[cellSize] = [...allResults[cellSize], ...buckets];
          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;

          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function get50GridData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  timeznArray: number[],
  cellSizes: string[] = ["50"]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  // const patternMap: { [key: string]: number } = {
  //   RSDN: 0,
  //   WKPLC: 1,
  //   VIST: 2,
  // };
  const validIndices = await getGisDayIndex(
    start,
    end,
    regionArray,
    "native_time_50cell_day"
  );
  const index = validIndices.join(",");
  let allResults: Record<string, any[]> = { 50: [] };

  const maxSize = getMaxSize(start, end, 100);

  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIME");
  let afterCnt: Record<string, number> = { 50: 0 };
  let scriptSource = "";
  scriptSource = ageArray
    .map((ageArray) => {
      const ageStr = ageArray === 0 ? "00" : ageArray.toString();
      const maleField = `M${ageStr}`;
      const femaleField = `F${ageStr}`;

      return gender === 2
        ? `doc['${maleField}'].value + doc['${femaleField}'].value`
        : gender === 0
        ? `doc['${maleField}'].value`
        : `doc['${femaleField}'].value`;
    })
    .join(" + ");
  try {
    // 각 cellSize를 병렬로 처리
    await Promise.all(
      cellSizes.map(async (cellSize) => {
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
                  timeznFilter,
                ],
              },
            },
            aggs: {
              by_composite_region: {
                composite: {
                  size: 10000,
                  sources: [
                    { [regionCD]: { terms: { field: regionCD } } },
                    {
                      LONG_NUM: {
                        terms: {
                          field: "LON",
                        },
                      },
                    },
                    {
                      LAT_NUM: {
                        terms: {
                          field: "LAT",
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
                },
                // aggs: getSelectedSexAgeFilterScriptAvg(gender, ageArray)
                aggs: {
                  popul_avg: {
                    sum: {
                      script: {
                        source: `${scriptSource}`,
                      },
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
          allResults[cellSize] = [...allResults[cellSize], ...buckets];
          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;

          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function get50GridMonsData(
  regionArray: string[],
  start: string,
  end: string,
  gender: number,
  ageArray: number[],
  timeznArray: number[],
  cellSizes: string[] = ["50"]
): Promise<any> {
  const regionCD =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const validIndices = await getGisIndex(start, "native_time_50cell_mons");
  const index = validIndices.join(",");
  let allResults: Record<string, any[]> = { 50: [] };

  const maxSize = getMaxSize(start, end, 100);

  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIME");
  let afterCnt: Record<string, number> = { 50: 0 };
  let scriptSource = "";

  scriptSource = ageArray
    .map((ageArray) => {
      const ageStr = ageArray === 0 ? "00" : ageArray.toString();
      const maleField = `M${ageStr}`;
      const femaleField = `F${ageStr}`;

      return gender === 2
        ? `doc['${maleField}'].value + doc['${femaleField}'].value`
        : gender === 0
        ? `doc['${maleField}'].value`
        : `doc['${femaleField}'].value`;
    })
    .join(" + ");
  try {
    // 각 cellSize를 병렬로 처리
    await Promise.all(
      cellSizes.map(async (cellSize) => {
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
                  timeznFilter,
                ],
              },
            },
            aggs: {
              by_composite_region: {
                composite: {
                  size: 10000,
                  sources: [
                    { [regionCD]: { terms: { field: regionCD } } },
                    {
                      LONG_NUM: {
                        terms: {
                          field: "LON",
                        },
                      },
                    },
                    {
                      LAT_NUM: {
                        terms: {
                          field: "LAT",
                        },
                      },
                    },
                  ],
                  ...(afterKey && { after: afterKey }), // afterKey가 있을 때만 추가
                },
                // aggs: getSelectedSexAgeFilterScriptAvg(gender, ageArray)
                aggs: {
                  popul_avg: {
                    sum: {
                      script: {
                        source: `${scriptSource}`,
                      },
                    },
                  },
                },
              },
            },
          };

          // 검색 쿼리 실행
          const response = await searchWithLogging({
            index: index,
            body: query,
          });
          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          allResults[cellSize] = [...allResults[cellSize], ...buckets];
          // 다음 페이지를 위한 afterKey 설정
          afterKey = response.body.aggregations.by_composite_region.after_key;

          // 종료 조건: buckets이 비어있거나 afterKey가 없는 경우 루프 종료
          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
      })
    );
    return allResults;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
