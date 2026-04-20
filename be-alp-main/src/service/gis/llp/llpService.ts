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
import { dateRange, dayFilter } from "@/utils/makeQueryFilter";
import { getHolidays } from "@/utils/holidays";
import { getDcrsRegion } from "@/utils/dcrsRegionCache";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getIndexMMList } from "@/helpers/getIndexList";
import { getSelectedSexAgeFilterScript } from "@/utils/generateScript";

// 유입분석
export async function getCompositeFlowData(
  options: GisLlpParams
): Promise<any> {
  const { region, start, end, gender, ageArray, isIn } = options;

  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 2 ? "SIDO" : "SGG";
  const isInValue =
    isIn === 0
      ? { term: { INOUT_DIV: 1 } }
      : isIn === 1
      ? { term: { INOUT_DIV: 2 } }
      : { terms: { INOUT_DIV: [1, 2] } };

  const regionFilter =
    regionType === "SGG"
      ? {
          term: {
            SGG_CD: region,
          },
        }
      : {
          range: {
            SGG_CD: {
              gte: parseInt(region) * 1000,
              lte: (parseInt(region) + 1) * 1000 - 1,
            },
          },
        };
  let scriptSource = "";
  let query: any = {};

  scriptSource = ageArray
    .map((ageArray) => {
      const nextAge = ageArray + 5;
      const ageStr = ageArray === 0 ? "00" : ageArray.toString();
      const maleField = `MALE_${ageStr}_POPUL_NUM`;
      const male5Field = `MALE_${nextAge}_POPUL_NUM`;
      const femaleField = `FEML_${ageStr}_POPUL_NUM`;
      const female5Field = `FEML_${nextAge}_POPUL_NUM`;

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
  isIn === 0 ?
  query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          regionFilter,
          isInValue,
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
          { range: { RSDN_ADMNS_DONG_CD: { gte: parseInt(region) * 1000, lte: (parseInt(region) + 1) * 1000 - 1 } } }
        ],
      },
    },
    aggs: {
      by_composite_region: {
        terms: {
          field: "RSDN_ADMNS_DONG_CD",
          size: 50,
          order: {
            popul_sum: "desc",
          },
        },
        aggs: {
          popul_sum: {
            sum: {
              script: {
                source: `${scriptSource}`,
              },
            },
          },
        },
      },
    },
  } : query = {
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          regionFilter,
          isInValue,
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
        ],
      },
    },
    aggs: {
      by_composite_region: {
        terms: {
          field: "RSDN_ADMNS_DONG_CD",
          size: 10,
          order: {
            popul_sum: "desc",
          },
        },
        aggs: {
          popul_sum: {
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
  try {
    // composite aggregation 쿼리

    //요일, 평일/휴일
    //요일 평일 휴일
    // const holidays = await getHolidays(start, end);
    // query = dayFilter(holidays, dayArray, query);
    const validIndices = await getIndexMMList(start, end, "stay_sgg_day");

    // 검색 쿼리 실행
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    
    const buckets = response.body.aggregations.by_composite_region.buckets;

    return buckets;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}

//인구감소지역
export async function getCompositeDepopulData(
  options: GisLlpParams
): Promise<any> {
  const { start, end, gender, ageArray, isIn } = options;

  //인구감소지역
  const dcrsRegion = await getDcrsRegion();
  const dcrsRegionArr = Object.keys(dcrsRegion.sgg);
  const isInValue =
    isIn === 0
      ? { term: { INOUT_DIV: 1 } }
      : isIn === 1
      ? { term: { INOUT_DIV: 2 } }
      : { terms: { INOUT_DIV: [1, 2] } };

  let scriptSource = "";
  scriptSource = ageArray
    .map((ageArray) => {
      const nextAge = ageArray + 5;
      const ageStr = ageArray === 0 ? "00" : ageArray.toString();
      const maleField = `MALE_${ageStr}_POPUL_NUM`;
      const male5Field = `MALE_${nextAge}_POPUL_NUM`;
      const femaleField = `FEML_${ageStr}_POPUL_NUM`;
      const female5Field = `FEML_${nextAge}_POPUL_NUM`;

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
    // composite aggregation 쿼리
    let query: any = {
      size: 0,
      query: {
        bool: {
          filter: [
            dateRange(false, start, end),
            isInValue,
            {
              terms: {
                SGG_CD: dcrsRegionArr,
              },
            },
          ],
        },
      },
      aggs: {
        by_region: {
          terms: {
            field: "SGG_CD",
            size: dcrsRegionArr.length,
          },
          aggs: {
            popul_sum: {
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
    //요일, 평일/휴일
    //요일 평일 휴일
    // const holidays = await getHolidays(start, end);
    // query = dayFilter(holidays, dayArray, query);

    const validIndices = await getIndexMMList(start, end, "stay_sgg_day");

    // 검색 쿼리 실행
    const response = await searchWithLogging({
      index: validIndices.join(","),
      body: query,
    });
    const buckets = response.body.aggregations.by_region.buckets;

    return buckets;
  } catch (error) {
    console.error("Error fetching composite vector data:", error);
    throw error;
  }
}
