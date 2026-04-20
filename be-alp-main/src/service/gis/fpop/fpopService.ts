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

import { getGisDayIndex, getGisIndex, getIndexCompareMMList, getIndexMMList } from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import {
  convertToRangeOrTermsFilter,
  dateRange,
  getMaxSize,
  dayFilter,
} from "@/utils/makeQueryFilter";
import { getHolidays } from "@/utils/holidays";
import { getSelectedSexAgeFilterScript, getSelectedSexAgeFilterScriptSum } from "@/utils/generateScript";
import util from "util"

export async function getCompositeGridData(
  options: GisFpopParams,
  cellSizes: string[] = ["50"]
): Promise<any> {
  const { regionArray, start, end, gender, ageArray, timeznArray } =
    options;
    const regionCD =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const validIndices = await getGisDayIndex(start, end, regionArray, "fpopl_50cell_day");
  const index = validIndices.join(",");

  let Results: Record<string, any[]> = { 50: [] };
  const maxSize = getMaxSize(start, end, 100);
  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIME");
  let afterCnt: Record<string, number> = { 50: 0 };

  try {
    await Promise.all(
      cellSizes.map(async (cellSize) => {
        let afterKey: any = null;
        while (true) {
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
                  ...(afterKey ? { after: afterKey } : {}),
                },
                aggs: getSelectedSexAgeFilterScriptSum(gender, ageArray),
              },
            },
          };

          //요일 평일 휴일
          // const holidays = await getHolidays(start, end);
          // query = dayFilter(holidays, dayArray, query);

          const response = await searchWithLogging({
            index: index,
            body: query,
          });
          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          if (buckets.length === 0) break;
          Results[cellSize] = [...Results[cellSize], ...buckets];
          afterKey = response.body.aggregations.by_composite_region.after_key || null;

          if (!afterKey) break;

          
          afterCnt[cellSize] += 1;
        }
      })
    );
    return Results;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}
export async function getCompositeGridMonsData(
  options: GisFpopParams,
  cellSizes: string[] = ["50"]
): Promise<any> {
  const { regionArray, start, end, gender, ageArray, timeznArray } =
    options;
    const regionCD =
    regionArray[0].length === 2
      ? "SIDO"
      : regionArray[0].length === 5
      ? "SGG"
      : "ADM";
  const validIndices = await getGisIndex(start, "fpopl_50cell_mons");
  const index = validIndices.join(",");

  let Results: Record<string, any[]> = { 50: [] };
  const maxSize = getMaxSize(start, end, 100);
  const timeznFilter = convertToRangeOrTermsFilter(timeznArray, "TIME");
  let afterCnt: Record<string, number> = { 50: 0 };

  try {
    await Promise.all(
      cellSizes.map(async (cellSize) => {
        let afterKey: any = null;
        while (true) {
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
                  size: maxSize[cellSize],
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
                  ...(afterKey && { after: afterKey }),
                },
                aggs: getSelectedSexAgeFilterScriptSum(gender, ageArray),
              },
            },
          };

          //요일 평일 휴일
          // const holidays = await getHolidays(start, end);
          // query = dayFilter(holidays, dayArray, query);

          const response = await searchWithLogging({
            index: index,
            body: query,
          });
          const buckets =
            response.body.aggregations.by_composite_region.buckets;
          Results[cellSize] = [...Results[cellSize], ...buckets];
          afterKey = response.body.aggregations.by_composite_region.after_key;

          if (buckets.length === 0 || !afterKey) break;
          afterCnt[cellSize] += 1;
        }
      })
    );
    return Results;
  } catch (error) {
    console.error("Error fetching composite grid time series data:", error);
    throw error;
  }
}