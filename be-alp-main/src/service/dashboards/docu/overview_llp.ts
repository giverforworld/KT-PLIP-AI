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

import { calcMonthToDate } from "@/helpers/convertDate";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getHolidays } from "@/utils/holidays";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  get12MIndexList,
  getCompareMIndexList,
  getCompareYIndexList,
  getIndexMList,
  getIndexYList,
  getYIndexList,
} from "@/helpers/getIndexList";
import util from "util";
import { dash_regionAggregation } from "@/utils/chart/regionAggregation";
import { addUnionRegionMap } from "@/helpers/mergeDataByRegion";

export async function comparedMonsQuery(
  start: string,
  prevMonth: string,
  lastYear: string,
  region: string
) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const typeValue = "llp";
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
        ],
      },
    },
    aggs: {
      by_cd: {
        terms: {
          field: "",
          size: 1000,
          order: {
            _key: "asc",
          },
        },
        aggs: {
          present: {
            filter: {
              term: {
                BASE_YM: start,
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          prev: {
            filter: {
              term: {
                BASE_YM: prevMonth,
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          last: {
            filter: {
              term: {
                BASE_YM: lastYear,
              },
            },
            aggs: {
              tot_popul_num: {
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

  const index = await getCompareMIndexList(start, "stay_sgg_mons");
  const validIndices = {
    sgg: index.join(","),
    sido: index.join(","),
  };
  const results = await dash_regionAggregation(
    query,
    region,
    validIndices,
    start,
    typeValue
  );
  // console.log("Union : O, SIDO : O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}

export async function comparedDayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const isBroadRegion = region.length === 2;
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          ...(isBroadRegion
            ? [
                {
                  script: {
                    script: {
                      source: `String.valueOf(doc['SGG_CD'].value).substring(0,2) == params.region`,
                      params: {
                        region: region,
                      },
                    },
                  },
                },
                {
                  term: {
                    STAY_TIME_CD: 3,
                  },
                },
              ]
            : [
                {
                  term: {
                    SGG_CD: region,
                  },
                },
              ]),
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              },
            },
          },
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
        ],
      },
    },
    aggs: {
      by_holiday: {
        filters: getWeekFilters(holidays),
        aggs: {
          tot_sum: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
    },
  };

  const indexes = "stay_sgg_day";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function staySexQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const isBroadRegion = region.length === 2;

  const query = {
    size: 0,
    query: {
      bool: {
        filter: isBroadRegion
          ? [
              {
                script: {
                  script: {
                    source: `String.valueOf(doc['SGG_CD'].value).substring(0,2) == params.region`,
                    params: {
                      region: region,
                    },
                  },
                },
              },
              {
                term: {
                  BASE_YM: start,
                },
              },
              {
                term: {
                  STAY_TIME_CD: 3,
                },
              },
            ]
          : [
              {
                term: {
                  SGG_CD: region,
                },
              },
              {
                term: {
                  BASE_YM: start,
                },
              },
              {
                term: {
                  STAY_TIME_CD: 3,
                },
              },
            ],
      },
    },
    aggs: {
      total_feml_population: {
        sum: {
          field: "FEML_POPUL_NUM",
        },
      },
      total_male_population: {
        sum: {
          field: "MALE_POPUL_NUM",
        },
      },
      total_feml_00_popul_num: {
        sum: {
          script: {
            source: `
                doc['FEML_00_POPUL_NUM'].value
              `,
          },
        },
      },
      total_feml_10_popul_num: {
        sum: {
          field: "FEML_10_POPUL_NUM",
        },
      },
      total_feml_15_popul_num: {
        sum: {
          field: "FEML_15_POPUL_NUM",
        },
      },
      total_feml_20_popul_num: {
        sum: {
          field: "FEML_20_POPUL_NUM",
        },
      },
      total_feml_25_popul_num: {
        sum: {
          field: "FEML_25_POPUL_NUM",
        },
      },
      total_feml_30_popul_num: {
        sum: {
          field: "FEML_30_POPUL_NUM",
        },
      },
      total_feml_35_popul_num: {
        sum: {
          field: "FEML_35_POPUL_NUM",
        },
      },
      total_feml_40_popul_num: {
        sum: {
          field: "FEML_40_POPUL_NUM",
        },
      },
      total_feml_45_popul_num: {
        sum: {
          field: "FEML_45_POPUL_NUM",
        },
      },
      total_feml_50_popul_num: {
        sum: {
          field: "FEML_50_POPUL_NUM",
        },
      },
      total_feml_55_popul_num: {
        sum: {
          field: "FEML_55_POPUL_NUM",
        },
      },
      total_feml_60_popul_num: {
        sum: {
          field: "FEML_60_POPUL_NUM",
        },
      },
      total_feml_65_popul_num: {
        sum: {
          field: "FEML_65_POPUL_NUM",
        },
      },
      total_feml_70_popul_num: {
        sum: {
          field: "FEML_70_POPUL_NUM",
        },
      },
      total_feml_75_popul_num: {
        sum: {
          field: "FEML_75_POPUL_NUM",
        },
      },
      total_feml_80_popul_num: {
        sum: {
          field: "FEML_80_POPUL_NUM",
        },
      },
      total_male_00_popul_num: {
        sum: {
          script: {
            source: `
                doc['MALE_00_POPUL_NUM'].value 
              `,
          },
        },
      },
      total_male_10_popul_num: {
        sum: {
          field: "MALE_10_POPUL_NUM",
        },
      },
      total_male_15_popul_num: {
        sum: {
          field: "MALE_15_POPUL_NUM",
        },
      },
      total_male_20_popul_num: {
        sum: {
          field: "MALE_20_POPUL_NUM",
        },
      },
      total_male_25_popul_num: {
        sum: {
          field: "MALE_25_POPUL_NUM",
        },
      },
      total_male_30_popul_num: {
        sum: {
          field: "MALE_30_POPUL_NUM",
        },
      },
      total_male_35_popul_num: {
        sum: {
          field: "MALE_35_POPUL_NUM",
        },
      },
      total_male_40_popul_num: {
        sum: {
          field: "MALE_40_POPUL_NUM",
        },
      },
      total_male_45_popul_num: {
        sum: {
          field: "MALE_45_POPUL_NUM",
        },
      },
      total_male_50_popul_num: {
        sum: {
          field: "MALE_50_POPUL_NUM",
        },
      },
      total_male_55_popul_num: {
        sum: {
          field: "MALE_55_POPUL_NUM",
        },
      },
      total_male_60_popul_num: {
        sum: {
          field: "MALE_60_POPUL_NUM",
        },
      },
      total_male_65_popul_num: {
        sum: {
          field: "MALE_65_POPUL_NUM",
        },
      },
      total_male_70_popul_num: {
        sum: {
          field: "MALE_70_POPUL_NUM",
        },
      },
      total_male_75_popul_num: {
        sum: {
          field: "MALE_75_POPUL_NUM",
        },
      },
      total_male_80_popul_num: {
        sum: {
          field: "MALE_80_POPUL_NUM",
        },
      },
    },
  };

  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function comparedUniqueToStayPopQuery1(
  start: string,
  region: string,
  prevYear1: string,
  prevYear2: string,
  prevYear3: string,
  prevYear4: string,
  prevYear5: string,
  prevYear6: string,
  prevYear7: string,
  prevYear8: string,
  prevYear9: string,
  prevYear10: string,
  prevYear11: string,
  prevYear12: string
) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const isBroadRegion = region.length === 2;
  const query = {
    size: 0,
    query: {
      bool: {
        filter: isBroadRegion
          ? [
              {
                script: {
                  script: {
                    source: `String.valueOf(doc['SGG_CD'].value).substring(0,2) == params.region`,
                    params: {
                      region: region,
                    },
                  },
                },
              },
              {
                term: {
                  STAY_TIME_CD: 3,
                },
              },
            ]
          : [
              {
                term: {
                  SGG_CD: region,
                },
              },
              {
                term: {
                  STAY_TIME_CD: 3,
                },
              },
            ],
      },
    },
    aggs: {
      start: {
        filter: {
          term: {
            BASE_YM: start,
          },
        },
        aggs: {
          tot_popul_num_start: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear1: {
        filter: {
          term: {
            BASE_YM: prevYear1,
          },
        },
        aggs: {
          tot_popul_num_prevyear1: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear2: {
        filter: {
          term: {
            BASE_YM: prevYear2,
          },
        },
        aggs: {
          tot_popul_num_prevyear2: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear3: {
        filter: {
          term: {
            BASE_YM: prevYear3,
          },
        },
        aggs: {
          tot_popul_num_prevyear3: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear4: {
        filter: {
          term: {
            BASE_YM: prevYear4,
          },
        },
        aggs: {
          tot_popul_num_prevyear4: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear5: {
        filter: {
          term: {
            BASE_YM: prevYear5,
          },
        },
        aggs: {
          tot_popul_num_prevyear5: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear6: {
        filter: {
          term: {
            BASE_YM: prevYear6,
          },
        },
        aggs: {
          tot_popul_num_prevyear6: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear7: {
        filter: {
          term: {
            BASE_YM: prevYear7,
          },
        },
        aggs: {
          tot_popul_num_prevyear7: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear8: {
        filter: {
          term: {
            BASE_YM: prevYear8,
          },
        },
        aggs: {
          tot_popul_num_prevyear8: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear9: {
        filter: {
          term: {
            BASE_YM: prevYear9,
          },
        },
        aggs: {
          tot_popul_num_prevyear9: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear10: {
        filter: {
          term: {
            BASE_YM: prevYear10,
          },
        },
        aggs: {
          tot_popul_num_prevyear10: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear11: {
        filter: {
          term: {
            BASE_YM: prevYear11,
          },
        },
        aggs: {
          tot_popul_num_prevyear11: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      prevyear12: {
        filter: {
          term: {
            BASE_YM: prevYear12,
          },
        },
        aggs: {
          tot_popul_num_prevyear12: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
    },
  };

  const indexes = "stay_sgg_mons";
  const validIndices = await get12MIndexList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function comparedUniqueToStayPopQuery2(
  start: string,
  region: string,
  prevYear1: string,
  prevYear2: string,
  prevYear3: string,
  prevYear4: string,
  prevYear5: string,
  prevYear6: string,
  prevYear7: string,
  prevYear8: string,
  prevYear9: string,
  prevYear10: string,
  prevYear11: string,
  prevYear12: string
) {
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              RGN_CD: region,
            },
          },
          {
            terms: {
              BASE_YM: [
                start,
                prevYear1,
                prevYear2,
                prevYear3,
                prevYear4,
                prevYear5,
                prevYear6,
                prevYear7,
                prevYear8,
                prevYear9,
                prevYear10,
                prevYear11,
                prevYear12,
              ],
            },
          },
        ],
      },
    },
    aggs: {
      year_aggregation: {
        terms: {
          field: "BASE_YM",
          size: 13,
          order: {
            _key: "asc",
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
    },
  };

  const indexes = "resid_popul_num_mons";
  const validIndices = await getCompareYIndexList(start, indexes);
  const index = validIndices.join(",");
  try {
    const results = await searchWithLogging({
      index: index,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function stayDateQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG_CD" : "SIDO_CD";
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              [regionType]: region,
            },
          },
          { term: { INOUT_DIV: 2 } },
          { term: { STAY_TIME_CD: 3 } },
        ],
      },
    },
    aggs: {
      one: {
        filter: {
          term: {
            STAY_DAY: 1,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      two: {
        filter: {
          range: {
            STAY_DAY: {
              gte: 2,
              lte: 7,
            },
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      eight: {
        filter: {
          range: {
            STAY_DAY: {
              gte: 8,
              lte: 1000,
            },
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      avgday: {
        filter: {
          range: {
            STAY_DAY: {
              gte: 0,
              lte: 1000,
            },
          },
        },
        aggs: {
          tot_pop: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
          tot_pop_index: {
            sum: {
              field: "TOT_STAY_INDEXN_VAL",
            },
          },
        },
      },
    },
  };
  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function dcrIndexQuery(start: string) {
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
          {
            term: {
              STAY_TIME_CD: 3
            }
          },
          {
            term: {
              INOUT_DIV: 2
            }
          }
        ],
      },
    },
    aggs: {
      depar_tot_pop: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
      depar_tot_idx: {
        sum: {
          field: "TOT_STAY_INDEXN_VAL",
        },
      },
    },
  };

  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function staytimebypopQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG_CD" : "SIDO_CD";
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              [regionType]: region,
            },
          },
        ],
      },
    },
    aggs: {
      one: {
        filter: {
          term: {
            STAY_TIME_CD: 1,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      two: {
        filter: {
          term: {
            STAY_TIME_CD: 2,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      three: {
        filter: {
          term: {
            STAY_TIME_CD: 3,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
      tot_num: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
      tot_time: {
        sum: {
          field: "TOT_STAY_INDEXN_VAL",
        },
      },
    },
  };

  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function dcrTimeIndexQuery(start: string) {
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
        ],
      },
    },
    aggs: {
      tot_num: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
      tot_time: {
        sum: {
          field: "TOT_STAY_INDEXN_VAL",
        },
      },
    },
  };

  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function ldgmtDayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]
  const regionType = region.length === 5 ? "SGG_CD" : "SIDO_CD";
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string }
  };
  const indexes =
    regionType === "SGG_CD" ? "native_ldgmt_sgg" : "native_ldgmt_sido";
  const validIndices = await getYIndexList(start, indexes);
  const index = {
    sgg: validIndices.join(",")
  };
  regionMap = {
    sgg: { codes: [], field: "LDGMT", index: index.sgg}
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  unionArray.includes(region) ? regionCodes = regionMap.sgg.codes : regionCodes = [region]
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            terms: {
              [regionType]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      one: {
        filter: {
          term: {
            LDGMT_CD: 1,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      two: {
        filter: {
          term: {
            LDGMT_CD: 2,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      three: {
        filter: {
          term: {
            LDGMT_CD: 3,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      four: {
        filter: {
          term: {
            LDGMT_CD: 4,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      avg_day: {
        avg: {
          field: "LDGMT_DAY_NUM",
        },
      },
    },
  };

  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function dcrLdgmtIndexQuery(start: string) {
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
        ],
      },
    },
    aggs: {
      one: {
        filter: {
          term: {
            LDGMT_CD: 1,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      two: {
        filter: {
          term: {
            LDGMT_CD: 2,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      three: {
        filter: {
          term: {
            LDGMT_CD: 3,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      four: {
        filter: {
          term: {
            LDGMT_CD: 4,
          },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: "LDGMT_POPUL_NUM",
            },
          },
        },
      },
      avg_day: {
        avg: {
          field: "LDGMT_DAY_NUM",
        },
      },
    },
  };
  const index = "native_ldgmt_sgg";
  const validIndices = await getYIndexList(start, index);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function inRsdnQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG_CD" : "SIDO_CD";
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start,
            },
          },
          {
            term: {
              [regionType]: region,
            },
          },
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          by_sido: {
            terms: {
              field: "RSDN_SIDO_CD",
              size: 20,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_sido: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_sgg: {
            terms: {
              field: "RSDN_SGG_CD",
              size: 10,
              order: { pop_by_sgg: "desc" },
            },
            aggs: {
              pop_by_sgg: {
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

  const indexes = "stay_sgg_mons";
  const validIndices = await getIndexMList(start, indexes);
  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}
