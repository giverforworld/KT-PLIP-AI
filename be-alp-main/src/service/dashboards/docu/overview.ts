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
import { generateSexAge } from "@/utils/generateSexAge";
import { getWeekFilters, getWeekAbbFilters } from "@/utils/makeQueryFilter";
import {
  generateAgeMapScript,
  generateAgeAbbMapScript,
} from "@/utils/generatePatternScript";
import {
  getCompareYIndexList,
  getIndexCompareMList,
  getYIndexList,
} from "@/helpers/getIndexList";
import { dateRange } from "@/utils/makeQueryFilter";
import util from "util";
import { dash_regionAggregation } from "@/utils/chart/regionAggregation";
export async function periodQuery(
  start: string,
  prevMonth: string,
  lastYear: string,
  region: string
) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const index = await getCompareYIndexList(start, "native_time_nation_mons");
  const validIndices = {
    sido: index.join(","),
    sgg: index.join(","),
  };
  const typeValue = "new";
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [],
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
                BASE_YM: start
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          prev: {
            filter: {
              term: {
                BASE_YM: prevMonth
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          last: {
            filter: {
              term: {
                BASE_YM: lastYear
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
    },
  };
  let results = await dash_regionAggregation(query, region, validIndices, start, typeValue)
  // console.log("Union : O, SIDO : O")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results
}

export async function sexQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const convertStart = calcMonthToDate(start);
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const indexes = await getYIndexList(start, "native_time_nation_mons");
  const validIndices = indexes.join(",");
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: start
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
      by_region: {
        terms: {
          field: regionType,
          size: 10000,
        },
        aggs: {
          total_feml_population: {
            sum: {
              field: "FTOT",
            },
          },
          total_feml_00_popul_num: {
            sum: {
              field: "F00",
            },
          },
          total_feml_10_popul_num: {
            sum: {
              field: "F10",
            },
          },
          total_feml_15_popul_num: {
            sum: {
              field: "F15",
            },
          },
          total_feml_20_popul_num: {
            sum: {
              field: "F20",
            },
          },
          total_feml_25_popul_num: {
            sum: {
              field: "F25",
            },
          },
          total_feml_30_popul_num: {
            sum: {
              field: "F30",
            },
          },
          total_feml_35_popul_num: {
            sum: {
              field: "F35",
            },
          },
          total_feml_40_popul_num: {
            sum: {
              field: "F40",
            },
          },
          total_feml_45_popul_num: {
            sum: {
              field: "F45",
            },
          },
          total_feml_50_popul_num: {
            sum: {
              field: "F50",
            },
          },
          total_feml_55_popul_num: {
            sum: {
              field: "F55",
            },
          },
          total_feml_60_popul_num: {
            sum: {
              field: "F60",
            },
          },
          total_feml_65_popul_num: {
            sum: {
              field: "F65",
            },
          },
          total_feml_70_popul_num: {
            sum: {
              field: "F70",
            },
          },
          total_feml_75_popul_num: {
            sum: {
              field: "F75",
            },
          },
          total_feml_80_popul_num: {
            sum: {
              field: "F80",
            },
          },
          total_male_population: {
            sum: {
              field: "MTOT",
            },
          },
          total_male_00_popul_num: {
            sum: {
              field: "M00",
            },
          },
          total_male_10_popul_num: {
            sum: {
              field: "M10",
            },
          },
          total_male_15_popul_num: {
            sum: {
              field: "M15",
            },
          },
          total_male_20_popul_num: {
            sum: {
              field: "M20",
            },
          },
          total_male_25_popul_num: {
            sum: {
              field: "M25",
            },
          },
          total_male_30_popul_num: {
            sum: {
              field: "M30",
            },
          },
          total_male_35_popul_num: {
            sum: {
              field: "M35",
            },
          },
          total_male_40_popul_num: {
            sum: {
              field: "M40",
            },
          },
          total_male_45_popul_num: {
            sum: {
              field: "M45",
            },
          },
          total_male_50_popul_num: {
            sum: {
              field: "M50",
            },
          },
          total_male_55_popul_num: {
            sum: {
              field: "M55",
            },
          },
          total_male_60_popul_num: {
            sum: {
              field: "M60",
            },
          },
          total_male_65_popul_num: {
            sum: {
              field: "M65",
            },
          },
          total_male_70_popul_num: {
            sum: {
              field: "M70",
            },
          },
          total_male_75_popul_num: {
            sum: {
              field: "M75",
            },
          },
          total_male_80_popul_num: {
            sum: {
              field: "M80",
            },
          },
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

export async function dayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const indexes = await getYIndexList(start, "native_time_nation_day");
  const validIndices = indexes.join(",");
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
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
              [regionType]: region,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10000,
        },
        aggs: {
          by_dow: {
            terms: {
              field: "DOW",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              tot_sum: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          by_holiday: {
            filters: getWeekAbbFilters(holidays),
            aggs: {
              tot_sum: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
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

export async function timeznQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const convertStart = calcMonthToDate(start);
  const indexes = await getYIndexList(start, "native_time_nation_day");
  const validIndices = indexes.join(",");
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
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
              [regionType]: region,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_timezn: {
            terms: {
              field: "TIME",
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              male: {
                sum: {
                  field: "MTOT",
                },
              },
              female: {
                sum: {
                  field: "FTOT",
                },
              },
              age_groups: {
                scripted_metric: {
                  init_script: "state.age_groups = new HashMap();",
                  map_script: generateAgeAbbMapScript(true),
                  combine_script: `return state.age_groups;`,
                  reduce_script: `
                        def totalAgeGroups = [:];
                        def maxAgeGroup = null;
                        def maxValue = -1;
                        
                        for (s in states) {
                          for (entry in s.entrySet()) {
                            if (!totalAgeGroups.containsKey(entry.key)) {
                              totalAgeGroups[entry.key] = 0.0;
                            }
                            totalAgeGroups[entry.key] += entry.value;
                            if (totalAgeGroups[entry.key] > maxValue) {
                              maxValue = totalAgeGroups[entry.key];
                              maxAgeGroup = entry.key;
                            }
                          }
                        }
                        
                        return ['maxAgeGroup': maxAgeGroup, 'age_groups': totalAgeGroups];
                      `,
                },
              },
            ...generateSexAge(false)
            },
          },
          max_male: {
            max_bucket: {
              buckets_path: "by_timezn>male",
            },
          },
          max_female: {
            max_bucket: {
              buckets_path: "by_timezn>female",
            },
          },
        },
      },
    },
  };

  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO: O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function timedateQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const indexes = await getYIndexList(start, "native_time_nation_day");
  const validIndices = indexes.join(",");
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
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
              [regionType]: region,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_dow: {
            terms: {
              field: "DOW",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_timezn: {
                terms: {
                  field: "TIME",
                  size: 24,
                  order: {
                    _key: "asc",
                  },
                },
                aggs: {
                  popul_num: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
            },
          },
          by_holiday: {
            filters: getWeekAbbFilters(holidays),
            aggs: {
              by_timezn: {
                terms: {
                  field: "TIME",
                  size: 24,
                  order: {
                    _key: "asc",
                  },
                },
                aggs: {
                  tot_sum: {
                    sum: {
                      field: "TOT",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  try {
    const results = await searchWithLogging({
      index: validIndices,
      body: query,
    });
    // console.log("Union : O, SIDO: O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function timesetQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const convertStart = calcMonthToDate(start);
  const indexes = await getYIndexList(start, "native_time_nation_day");
  const validIndices = indexes.join(",");

  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
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
              [regionType]: region,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_time: {
            terms: {
              field: "TIME",
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              home: {
                filter: {
                  term: {
                    PTRN: 0,
                  },
                },
                aggs: {
                  tot: {
                    avg: {
                      field: "TOT",
                    },
                  },
                },
              },
              work: {
                filter: {
                  term: {
                    PTRN: 1,
                  },
                },
                aggs: {
                  tot: {
                    avg: {
                      field: "TOT",
                    },
                  },
                },
              },
              vist: {
                filter: {
                  term: {
                    PTRN: 2,
                  },
                },
                aggs: {
                  tot: {
                    avg: {
                      field: "TOT",
                    },
                  },
                },
              },
            },
          },
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

export async function uniqueQuery(start: string, region: string) {
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
              RGN_CD: region,
            },
          },
        ],
      },
    },
    aggs: {
      region_aggregation: {
        terms: {
          script: {
            source: `
      if (params.region.length() == 2) {
        return doc['RGN_CD'].value.toString().substring(0, 2);
      } else {
        return doc['RGN_CD'].value.toString();
      }
    `,
            params: {
              region: region,
            },
            lang: "painless",
          },
          size: 1000,
        },
        aggs: {
          male_population: {
            sum: {
              field: "MALE_TOT_POPUL_NUM",
            },
          },
          female_population: {
            sum: {
              field: "FEML_TOT_POPUL_NUM",
            },
          },
          tot_00_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_00_POPUL_NUM'].value + doc['FEML_00_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_10_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_10_POPUL_NUM'].value + doc['FEML_10_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_15_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_15_POPUL_NUM'].value + doc['FEML_15_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_20_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_20_POPUL_NUM'].value + doc['FEML_20_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_25_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_25_POPUL_NUM'].value + doc['FEML_25_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_30_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_30_POPUL_NUM'].value + doc['FEML_30_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_35_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_35_POPUL_NUM'].value + doc['FEML_35_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_40_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_40_POPUL_NUM'].value + doc['FEML_40_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_45_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_45_POPUL_NUM'].value + doc['FEML_45_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_50_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_50_POPUL_NUM'].value + doc['FEML_50_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_55_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_55_POPUL_NUM'].value + doc['FEML_55_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_60_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_60_POPUL_NUM'].value + doc['FEML_60_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_65_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_65_POPUL_NUM'].value + doc['FEML_65_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_70_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_70_POPUL_NUM'].value + doc['FEML_70_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_75_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_75_POPUL_NUM'].value + doc['FEML_75_POPUL_NUM'].value
              `,
              },
            },
          },
          tot_80_popul_num: {
            sum: {
              script: {
                source: `
                doc['MALE_80_POPUL_NUM'].value + doc['FEML_80_POPUL_NUM'].value
              `,
              },
            },
          },
        },
      },
    },
  };

  const index = "resid_popul_num_mons";
  const validIndices = await getYIndexList(start, index);
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

export async function uniqueLiveQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "SIDO";
  const convertStart = calcMonthToDate(start);
  const indexes = await getYIndexList(start, "native_unique_nation_mons");
  const validIndices = indexes.join(",");
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
          {
            term: {
              PTRN: 0,
            },
          },
        ],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10000,
        },
        aggs: {
          male_population: {
            sum: {
              field: "MTOT",
            },
          },
          female_population: {
            sum: {
              field: "FTOT",
            },
          },
          tot_00_popul_num: {
            sum: {
              script: {
                source: `
                doc['M00'].value + doc['F00'].value
              `,
              },
            },
          },
          tot_10_popul_num: {
            sum: {
              script: {
                source: `
                doc['M10'].value + doc['F10'].value
              `,
              },
            },
          },
          tot_15_popul_num: {
            sum: {
              script: {
                source: `
                doc['M15'].value + doc['F15'].value
              `,
              },
            },
          },
          tot_20_popul_num: {
            sum: {
              script: {
                source: `
                doc['M20'].value + doc['F20'].value
              `,
              },
            },
          },
          tot_25_popul_num: {
            sum: {
              script: {
                source: `
                doc['M25'].value + doc['F25'].value
              `,
              },
            },
          },
          tot_30_popul_num: {
            sum: {
              script: {
                source: `
                doc['M30'].value + doc['F30'].value
              `,
              },
            },
          },
          tot_35_popul_num: {
            sum: {
              script: {
                source: `
                doc['M35'].value + doc['F35'].value
              `,
              },
            },
          },
          tot_40_popul_num: {
            sum: {
              script: {
                source: `
                doc['M40'].value + doc['F40'].value
              `,
              },
            },
          },
          tot_45_popul_num: {
            sum: {
              script: {
                source: `
                doc['M45'].value + doc['F45'].value
              `,
              },
            },
          },
          tot_50_popul_num: {
            sum: {
              script: {
                source: `
                doc['M50'].value + doc['F50'].value
              `,
              },
            },
          },
          tot_55_popul_num: {
            sum: {
              script: {
                source: `
                doc['M55'].value + doc['F55'].value
              `,
              },
            },
          },
          tot_60_popul_num: {
            sum: {
              script: {
                source: `
                doc['M60'].value + doc['F60'].value
              `,
              },
            },
          },
          tot_65_popul_num: {
            sum: {
              script: {
                source: `
                doc['M65'].value + doc['F65'].value
              `,
              },
            },
          },
          tot_70_popul_num: {
            sum: {
              script: {
                source: `
                doc['M70'].value + doc['F70'].value
              `,
              },
            },
          },
          tot_75_popul_num: {
            sum: {
              script: {
                source: `
                doc['M75'].value + doc['F75'].value
              `,
              },
            },
          },
          tot_80_popul_num: {
            sum: {
              script: {
                source: `
                doc['M80'].value + doc['F80'].value
              `,
              },
            },
          },
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
