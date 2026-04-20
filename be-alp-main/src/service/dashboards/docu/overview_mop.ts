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
import { getWeekFilters, getWeekSidoFilters } from "@/utils/makeQueryFilter";
import util from "util";
import { generateAgeMapScript } from "@/utils/generateScript";
import {
  getCompareMIndexList,
  getCompareYIndexList,
  getIndexMList,
  getYIndexList,
} from "@/helpers/getIndexList";
import { dash_regionAggregation } from "@/utils/chart/regionAggregation";
import { addUnionRegionMap, addUnionRegionsDash, mergeUnionByDashCompareMOP, mergeUnionByDashRank, mergeUnionByRank } from "@/helpers/mergeDataByRegion";

export async function outflow_rankQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string }
  }
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const detinaType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionsDash(region, regionMap);
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
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
            terms: {
              [regionType]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      by_pdepar: {
        terms: {
          field: regionType,
          size: 4,
          order: { tot_popul_num: "desc" },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: isSido,
            },
          },
          by_detina: {
            terms: {
              field: detinaType,
              size: 5,
              order: { detina_tot_popul_num: "desc" },
            },
            aggs: {
              detina_tot_popul_num: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashRank(results.body, region)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function inflow_rankQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string }
  }
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const pdeparType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionsDash(region, regionMap);
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
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
            terms: {
              [regionType]: regionCodes,
            },
          },
        ],
      },
    },
    aggs: {
      by_detina: {
        terms: {
          field: regionType,
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          tot_popul_num: {
            sum: {
              field: isSido,
            },
          },
          by_pdepar: {
            terms: {
              field: pdeparType,
              size: 5,
              order: { pdepar_tot_popul_num: "desc" },
            },
            aggs: {
              pdepar_tot_popul_num: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashRank(results.body, region)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function comparedMovOutPopQuery(
  start: string,
  prevMonth: string,
  lastYear: string,
  region: string
) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const typeValue = "mopout_report";
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const index =
    regionType === "PDEPAR_SGG_CD"
      ? await getCompareMIndexList(start, "native_prps_age_sgg_day")
      : await getCompareYIndexList(start, "native_prps_sido_day_sum");
  const validIndices = {
    sgg: index.join(",")
  };
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
              range: {
                BASE_YMD: {
                  gte: convertStart.start,
                  lte: convertStart.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          prev: {
            filter: {
              range: {
                BASE_YMD: {
                  gte: convertPrevM.start,
                  lte: convertPrevM.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          last: {
            filter: {
              range: {
                BASE_YMD: {
                  gte: convertLastY.start,
                  lte: convertLastY.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
        },
      },
    },
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
export async function comparedMovInPopQuery(
  start: string,
  prevMonth: string,
  lastYear: string,
  region: string
) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const typeValue = "mopin_report";
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DETINA_SIDO_CD";
  const index =
    regionType === "DETINA_SGG_CD"
      ? await getCompareMIndexList(start, "native_prps_age_sgg_day")
      : await getCompareYIndexList(start, "native_prps_sido_day_sum");
  const validIndices = {
    sgg: index.join(",")
  };
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
              range: {
                BASE_YMD: {
                  gte: convertStart.start,
                  lte: convertStart.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          prev: {
            filter: {
              range: {
                BASE_YMD: {
                  gte: convertPrevM.start,
                  lte: convertPrevM.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          last: {
            filter: {
              range: {
                BASE_YMD: {
                  gte: convertLastY.start,
                  lte: convertLastY.end,
                },
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
        },
      },
    },
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

export async function dayOutQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const isDow = region.length === 2 ? "DOW" : "DOW_CD";
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
  const typeValue = "day_report"
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
            terms: {
              [regionType]: regionCodes,
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
              field: isDow,
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              tot_sum: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          by_holiday: {
            filters: region.length === 5 ? getWeekFilters(holidays) : getWeekSidoFilters(holidays),
            aggs: {
              tot_sum: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function dayInQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "day_report"
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const isDow = region.length === 2 ? "DOW" : "DOW_CD";
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const holidays = await getHolidays(convertStart.start, convertStart.end);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
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
            terms: {
              [regionType]: regionCodes,
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
              field: isDow,
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              tot_sum: {
                sum: {
                  field: isSido,
                },
              },
            },
          },
          by_holiday: { 
            filters: region.length === 5 ? getWeekFilters(holidays) : getWeekSidoFilters(holidays),
            aggs: {
              tot_sum: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function timeOutQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "time_report"
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const isTime = region.length === 2 ? "STIME" : "STRNG_TIMEZN_CD";
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_time_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
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
            terms: {
              [regionType]: regionCodes,
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
              field: isTime,
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function timeInQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "time_report"
  const isSido = region.length === 2 ? "TOT" : "TOT_POPUL_NUM";
  const isTime = region.length === 2 ? "ATIME" : "ARVL_TIMEZN_CD";
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_time_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
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
            terms: {
              [regionType]: regionCodes,
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
              field: isTime,
              size: 24,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: isSido,
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
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
    // console.log("Union : O, SIDO : O")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function ageOutQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "age_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
  const isSido = region.length === 2
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
            terms: {
              [regionType]: regionCodes,
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
        aggs: 
        isSido ? {
          male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_0: {
            filter: {
              term: {
                AGEG: "00"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              },
            },
          },
          age_10: {
            filter: {
              term: {
                AGEG: "10"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_20: {
            filter: {
              term: {
                AGEG: "20"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_30: {
            filter: {
              term: {
                AGEG: "30"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_40: {
            filter: {
              term: {
                AGEG: "40"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_50: {
            filter: {
              term: {
                AGEG: "50"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_60: {
            filter: {
              term: {
                AGEG: "60"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_70: {
            filter: {
              term: {
                AGEG: "70"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_80: {
            filter: {
              term: {
                AGEG: "80"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
        } :
        {
          male: {
            sum: {
              field: "MALE_POPUL_NUM",
            },
          },
          female: {
            sum: {
              field: "FEML_POPUL_NUM",
            },
          },
          age_groups: {
            scripted_metric: {
              init_script: "state.populationSums = new HashMap();",
              map_script: generateAgeMapScript(true),
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

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function ageInQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "age_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);

  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
  const isSido = region.length === 2
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
            terms: {
              [regionType]: regionCodes,
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
        aggs: isSido ? {
          male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_0: {
            filter: {
              term: {
                AGEG: "00"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              },
            },
          },
          age_10: {
            filter: {
              term: {
                AGEG: "10"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_20: {
            filter: {
              term: {
                AGEG: "20"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_30: {
            filter: {
              term: {
                AGEG: "30"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_40: {
            filter: {
              term: {
                AGEG: "40"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_50: {
            filter: {
              term: {
                AGEG: "50"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_60: {
            filter: {
              term: {
                AGEG: "60"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_70: {
            filter: {
              term: {
                AGEG: "70"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
          age_80: {
            filter: {
              term: {
                AGEG: "80"
              }
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT"
                }
              }
            }
          },
        } : {
          male: {
            sum: {
              field: "MALE_POPUL_NUM",
            },
          },
          female: {
            sum: {
              field: "FEML_POPUL_NUM",
            },
          },
          age_groups: {
            scripted_metric: {
              init_script: "state.populationSums = new HashMap();",
              map_script: generateAgeMapScript(true),
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

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outByPurposeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "prps_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
  const isSido = region.length === 2
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
            terms: {
              [regionType]: regionCodes,
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
        aggs: isSido ? {
          p_0_num: {
            sum: {
              field: "PRPS0"
            }
          },
          p_1_num: {
            sum: {
              field: "PRPS1"
            }
          },
          p_2_num: {
            sum: {
              field: "PRPS2"
            }
          },
          p_3_num: {
            sum: {
              field: "PRPS3"
            }
          },
          p_4_num: {
            sum: {
              field: "PRPS4"
            }
          },
          p_5_num: {
            sum: {
              field: "PRPS5"
            }
          },
          p_6_num: {
            sum: {
              field: "PRPS6"
            }
          }
        } : {
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
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
      },
    },
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("Union : O, SIDO : O")
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inByPurposeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "prps_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  } else {
    regionCodes = [region]
  }
  const isSido = region.length === 2;
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
            terms: {
              [regionType]: regionCodes,
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
        aggs: isSido ? {
          p_0_num: {
            sum: {
              field: "PRPS0"
            }
          },
          p_1_num: {
            sum: {
              field: "PRPS1"
            }
          },
          p_2_num: {
            sum: {
              field: "PRPS2"
            }
          },
          p_3_num: {
            sum: {
              field: "PRPS3"
            }
          },
          p_4_num: {
            sum: {
              field: "PRPS4"
            }
          },
          p_5_num: {
            sum: {
              field: "PRPS5"
            }
          },
          p_6_num: {
            sum: {
              field: "PRPS6"
            }
          }
        } : {
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
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
      },
    },
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function prpsOutTimeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "prps_time_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_time_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query =
    regionType === "PDEPAR_SGG_CD"
      ? {
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
                  terms: {
                    [regionType]: regionCodes,
                  }
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
                    field: "STRNG_TIMEZN_CD",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_prps_0_num: {
                      sum: {
                        field: "MOV_PRPS_0_POPUL_NUM",
                      },
                    },
                    mov_prps_1_num: {
                      sum: {
                        field: "MOV_PRPS_1_POPUL_NUM",
                      },
                    },
                    mov_prps_2_num: {
                      sum: {
                        field: "MOV_PRPS_2_POPUL_NUM",
                      },
                    },
                    mov_prps_3_num: {
                      sum: {
                        field: "MOV_PRPS_3_POPUL_NUM",
                      },
                    },
                    mov_prps_4_num: {
                      sum: {
                        field: "MOV_PRPS_4_POPUL_NUM",
                      },
                    },
                    mov_prps_5_num: {
                      sum: {
                        field: "MOV_PRPS_5_POPUL_NUM",
                      },
                    },
                    mov_prps_6_num: {
                      sum: {
                        field: "MOV_PRPS_6_POPUL_NUM",
                      },
                    },
                  },
                },
              },
            },
          },
        }
      : {
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
                    field: "STIME",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_prps_0_num: {
                      sum: {
                        field: "PRPS0",
                      },
                    },
                    mov_prps_1_num: {
                      sum: {
                        field: "PRPS1",
                      },
                    },
                    mov_prps_2_num: {
                      sum: {
                        field: "PRPS2",
                      },
                    },
                    mov_prps_3_num: {
                      sum: {
                        field: "PRPS3",
                      },
                    },
                    mov_prps_4_num: {
                      sum: {
                        field: "PRPS4",
                      },
                    },
                    mov_prps_5_num: {
                      sum: {
                        field: "PRPS5",
                      },
                    },
                    mov_prps_6_num: {
                      sum: {
                        field: "PRPS6",
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
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function prpsInTimeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "prps_time_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_time_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query =
    regionType === "DETINA_SGG_CD"
      ? {
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
                  terms: {
                    [regionType]: regionCodes,
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
                    field: "ARVL_TIMEZN_CD",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_prps_0_num: {
                      sum: {
                        field: "MOV_PRPS_0_POPUL_NUM",
                      },
                    },
                    mov_prps_1_num: {
                      sum: {
                        field: "MOV_PRPS_1_POPUL_NUM",
                      },
                    },
                    mov_prps_2_num: {
                      sum: {
                        field: "MOV_PRPS_2_POPUL_NUM",
                      },
                    },
                    mov_prps_3_num: {
                      sum: {
                        field: "MOV_PRPS_3_POPUL_NUM",
                      },
                    },
                    mov_prps_4_num: {
                      sum: {
                        field: "MOV_PRPS_4_POPUL_NUM",
                      },
                    },
                    mov_prps_5_num: {
                      sum: {
                        field: "MOV_PRPS_5_POPUL_NUM",
                      },
                    },
                    mov_prps_6_num: {
                      sum: {
                        field: "MOV_PRPS_6_POPUL_NUM",
                      },
                    },
                  },
                },
              },
            },
          },
        }
      : {
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
                    field: "ATIME",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_prps_0_num: {
                      sum: {
                        field: "PRPS0",
                      },
                    },
                    mov_prps_1_num: {
                      sum: {
                        field: "PRPS1",
                      },
                    },
                    mov_prps_2_num: {
                      sum: {
                        field: "PRPS2",
                      },
                    },
                    mov_prps_3_num: {
                      sum: {
                        field: "PRPS3",
                      },
                    },
                    mov_prps_4_num: {
                      sum: {
                        field: "PRPS4",
                      },
                    },
                    mov_prps_5_num: {
                      sum: {
                        field: "PRPS5",
                      },
                    },
                    mov_prps_6_num: {
                      sum: {
                        field: "PRPS6",
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
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inSexQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "sex_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = 
  regionType === "DETINA_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_male: {
                sum: {
                  field: "MALE_POPUL_NUM",
                },
              },
              by_female: {
                sum: {
                  field: "FEML_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              p_0_num: {
                sum: {
                  field: "PRPS0"
                }
              },
              p_1_num: {
                sum: {
                  field: "PRPS1"
                }
              },
              p_2_num: {
                sum: {
                  field: "PRPS2"
                }
              },
              p_3_num: {
                sum: {
                  field: "PRPS3"
                }
              },
              p_4_num: {
                sum: {
                  field: "PRPS4"
                }
              },
              p_5_num: {
                sum: {
                  field: "PRPS5"
                }
              },
              p_6_num: {
                sum: {
                  field: "PRPS6"
                }
              },
            }
          },
          by_female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              p_0_num: {
                sum: {
                  field: "PRPS0"
                }
              },
              p_1_num: {
                sum: {
                  field: "PRPS1"
                }
              },
              p_2_num: {
                sum: {
                  field: "PRPS2"
                }
              },
              p_3_num: {
                sum: {
                  field: "PRPS3"
                }
              },
              p_4_num: {
                sum: {
                  field: "PRPS4"
                }
              },
              p_5_num: {
                sum: {
                  field: "PRPS5"
                }
              },
              p_6_num: {
                sum: {
                  field: "PRPS6"
                }
              },
            }
          }
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inSexAgeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "sex_age_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "DETINA_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              age_groups: {
                scripted_metric: {
                  init_script: "state.populationSums = new HashMap();",
                  map_script: generateAgeMapScript(true),
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              }
            }
          },
          {
            term: {
              [regionType]: region
            }
          }
        ]
      }
    },
    aggs: {
      by_age: {
        terms: {
          field: "AGEG",
          size: 9,
          order: {
            _key: "asc"
          }
        },
        aggs: {
          p_0_num : {
            sum: {
              field: "PRPS0"
            }
          },
          p_1_num : {
            sum: {
              field: "PRPS1"
            }
          },
          p_2_num : {
            sum: {
              field: "PRPS2"
            }
          },
          p_3_num : {
            sum: {
              field: "PRPS3"
            }
          },
          p_4_num : {
            sum: {
              field: "PRPS4"
            }
          },
          p_5_num : {
            sum: {
              field: "PRPS5"
            }
          },
          p_6_num : {
            sum: {
              field: "PRPS6"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outSexQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "sex_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "PDEPAR_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_male: {
                sum: {
                  field: "MALE_POPUL_NUM",
                },
              },
              by_female: {
                sum: {
                  field: "FEML_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              p_0_num: {
                sum: {
                  field: "PRPS0"
                }
              },
              p_1_num: {
                sum: {
                  field: "PRPS1"
                }
              },
              p_2_num: {
                sum: {
                  field: "PRPS2"
                }
              },
              p_3_num: {
                sum: {
                  field: "PRPS3"
                }
              },
              p_4_num: {
                sum: {
                  field: "PRPS4"
                }
              },
              p_5_num: {
                sum: {
                  field: "PRPS5"
                }
              },
              p_6_num: {
                sum: {
                  field: "PRPS6"
                }
              },
            }
          },
          by_female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              p_0_num: {
                sum: {
                  field: "PRPS0"
                }
              },
              p_1_num: {
                sum: {
                  field: "PRPS1"
                }
              },
              p_2_num: {
                sum: {
                  field: "PRPS2"
                }
              },
              p_3_num: {
                sum: {
                  field: "PRPS3"
                }
              },
              p_4_num: {
                sum: {
                  field: "PRPS4"
                }
              },
              p_5_num: {
                sum: {
                  field: "PRPS5"
                }
              },
              p_6_num: {
                sum: {
                  field: "PRPS6"
                }
              },
            }
          }
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outSexAgeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "sex_age_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getYIndexList(start, "native_prps_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "PDEPAR_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 7,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              age_groups: {
                scripted_metric: {
                  init_script: "state.populationSums = new HashMap();",
                  map_script: generateAgeMapScript(true),
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              }
            }
          },
          {
            term: {
              [regionType]: region
            }
          }
        ]
      }
    },
    aggs: {
      by_age: {
        terms: {
          field: "AGEG",
          size: 9,
          order: {
            _key: "asc"
          }
        },
        aggs: {
          p_0_num : {
            sum: {
              field: "PRPS0"
            }
          },
          p_1_num : {
            sum: {
              field: "PRPS1"
            }
          },
          p_2_num : {
            sum: {
              field: "PRPS2"
            }
          },
          p_3_num : {
            sum: {
              field: "PRPS3"
            }
          },
          p_4_num : {
            sum: {
              field: "PRPS4"
            }
          },
          p_5_num : {
            sum: {
              field: "PRPS5"
            }
          },
          p_6_num : {
            sum: {
              field: "PRPS6"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outByWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "PDEPAR_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          w_0_num: {
            sum: {
              field: "WAY0"
            }
          },
          w_1_num: {
            sum: {
              field: "WAY1"
            }
          },
          w_2_num: {
            sum: {
              field: "WAY2"
            }
          },
          w_3_num: {
            sum: {
              field: "WAY3"
            }
          },
          w_4_num: {
            sum: {
              field: "WAY4"
            }
          },
          w_5_num: {
            sum: {
              field: "WAY5"
            }
          },
          w_6_num: {
            sum: {
              field: "WAY6"
            }
          },
          w_7_num: {
            sum: {
              field: "WAY7"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inByWAYQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "DETINA_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          w_0_num: {
            sum: {
              field: "WAY0"
            }
          },
          w_1_num: {
            sum: {
              field: "WAY1"
            }
          },
          w_2_num: {
            sum: {
              field: "WAY2"
            }
          },
          w_3_num: {
            sum: {
              field: "WAY3"
            }
          },
          w_4_num: {
            sum: {
              field: "WAY4"
            }
          },
          w_5_num: {
            sum: {
              field: "WAY5"
            }
          },
          w_6_num: {
            sum: {
              field: "WAY6"
            }
          },
          w_7_num: {
            sum: {
              field: "WAY7"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function wayOutTimeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_time_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_way_time_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query =
    regionType === "PDEPAR_SGG_CD"
      ? {
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
                  terms: {
                    [regionType]: regionCodes,
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
                    field: "STRNG_TIMEZN_CD",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_way_0_num: {
                      sum: {
                        field: "MOV_WAY_0_POPUL_NUM",
                      },
                    },
                    mov_way_1_num: {
                      sum: {
                        field: "MOV_WAY_1_POPUL_NUM",
                      },
                    },
                    mov_way_2_num: {
                      sum: {
                        field: "MOV_WAY_2_POPUL_NUM",
                      },
                    },
                    mov_way_3_num: {
                      sum: {
                        field: "MOV_WAY_3_POPUL_NUM",
                      },
                    },
                    mov_way_4_num: {
                      sum: {
                        field: "MOV_WAY_4_POPUL_NUM",
                      },
                    },
                    mov_way_5_num: {
                      sum: {
                        field: "MOV_WAY_5_POPUL_NUM",
                      },
                    },
                    mov_way_6_num: {
                      sum: {
                        field: "MOV_WAY_6_POPUL_NUM",
                      },
                    },
                    mov_way_7_num: {
                      sum: {
                        field: "MOV_WAY_7_POPUL_NUM",
                      },
                    },
                  },
                },
              },
            },
          },
        }
      : {
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
                    field: "STIME",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    way_0_num: {
                      sum: {
                        field: "WAY0"
                      }
                    },
                    way_1_num: {
                      sum: {
                        field: "WAY1"
                      }
                    },
                    way_2_num: {
                      sum: {
                        field: "WAY2"
                      }
                    },
                    way_3_num: {
                      sum: {
                        field: "WAY3"
                      }
                    },
                    way_4_num: {
                      sum: {
                        field: "WAY4"
                      }
                    },
                    way_5_num: {
                      sum: {
                        field: "WAY5"
                      }
                    },
                    way_6_num: {
                      sum: {
                        field: "WAY6"
                      }
                    },
                    way_7_num: {
                      sum: {
                        field: "WAY7"
                      }
                    }
                  },
                },
              },
            },
          },
        };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function wayInTimeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_time_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_way_time_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query =
    regionType === "DETINA_SGG_CD"
      ? {
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
                  terms: {
                    [regionType]: regionCodes,
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
                    field: "ARVL_TIMEZN_CD",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    mov_way_0_num: {
                      sum: {
                        field: "MOV_WAY_0_POPUL_NUM",
                      },
                    },
                    mov_way_1_num: {
                      sum: {
                        field: "MOV_WAY_1_POPUL_NUM",
                      },
                    },
                    mov_way_2_num: {
                      sum: {
                        field: "MOV_WAY_2_POPUL_NUM",
                      },
                    },
                    mov_way_3_num: {
                      sum: {
                        field: "MOV_WAY_3_POPUL_NUM",
                      },
                    },
                    mov_way_4_num: {
                      sum: {
                        field: "MOV_WAY_4_POPUL_NUM",
                      },
                    },
                    mov_way_5_num: {
                      sum: {
                        field: "MOV_WAY_5_POPUL_NUM",
                      },
                    },
                    mov_way_6_num: {
                      sum: {
                        field: "MOV_WAY_6_POPUL_NUM",
                      },
                    },
                    mov_way_7_num: {
                      sum: {
                        field: "MOV_WAY_7_POPUL_NUM",
                      },
                    },
                  },
                },
              },
            },
          },
        }
      : {
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
                    field: "ATIME",
                    size: 24,
                    order: {
                      _key: "asc",
                    },
                  },
                  aggs: {
                    way_0_num: {
                      sum: {
                        field: "WAY0"
                      }
                    },
                    way_1_num: {
                      sum: {
                        field: "WAY1"
                      }
                    },
                    way_2_num: {
                      sum: {
                        field: "WAY2"
                      }
                    },
                    way_3_num: {
                      sum: {
                        field: "WAY3"
                      }
                    },
                    way_4_num: {
                      sum: {
                        field: "WAY4"
                      }
                    },
                    way_5_num: {
                      sum: {
                        field: "WAY5"
                      }
                    },
                    way_6_num: {
                      sum: {
                        field: "WAY6"
                      }
                    },
                    way_7_num: {
                      sum: {
                        field: "WAY7"
                      }
                    }
                  },
                },
              },
            },
          },
        };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outSexAgeWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_sex_age_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "PDEPAR_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              age_groups: {
                scripted_metric: {
                  init_script: "state.populationSums = new HashMap();",
                  map_script: generateAgeMapScript(true),
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter:[
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region
            }
          }
        ]
      }
    },
    aggs: {
      by_age: {
        terms: {
          field: "AGEG",
          size: 9,
          order: {
            _key: "asc"
          }
        },
        aggs: {
          way_0_num : {
            sum: {
              field: "WAY0"
            }
          },
          way_1_num : {
            sum: {
              field: "WAY1"
            }
          },
          way_2_num : {
            sum: {
              field: "WAY2"
            }
          },
          way_3_num : {
            sum: {
              field: "WAY3"
            }
          },
          way_4_num : {
            sum: {
              field: "WAY4"
            }
          },
          way_5_num : {
            sum: {
              field: "WAY5"
            }
          },
          way_6_num : {
            sum: {
              field: "WAY6"
            }
          },
          way_7_num : {
            sum: {
              field: "WAY7"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function outSexWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_sex_report"
  const regionType = region.length === 5 ? "PDEPAR_SGG_CD" : "PSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "PDEPAR_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "PDEPAR_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_male: {
                sum: {
                  field: "MALE_POPUL_NUM",
                },
              },
              by_female: {
                sum: {
                  field: "FEML_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              w_0_num: {
                sum: {
                  field: "WAY0"
                }
              },
              w_1_num: {
                sum: {
                  field: "WAY1"
                }
              },
              w_2_num: {
                sum: {
                  field: "WAY2"
                }
              },
              w_3_num: {
                sum: {
                  field: "WAY3"
                }
              },
              w_4_num: {
                sum: {
                  field: "WAY4"
                }
              },
              w_5_num: {
                sum: {
                  field: "WAY5"
                }
              },
              w_6_num: {
                sum: {
                  field: "WAY6"
                }
              },
              w_7_num: {
                sum: {
                  field: "WAY7"
                }
              },
            }
          },
          by_female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              w_0_num: {
                sum: {
                  field: "WAY0"
                }
              },
              w_1_num: {
                sum: {
                  field: "WAY1"
                }
              },
              w_2_num: {
                sum: {
                  field: "WAY2"
                }
              },
              w_3_num: {
                sum: {
                  field: "WAY3"
                }
              },
              w_4_num: {
                sum: {
                  field: "WAY4"
                }
              },
              w_5_num: {
                sum: {
                  field: "WAY5"
                }
              },
              w_6_num: {
                sum: {
                  field: "WAY6"
                }
              },
              w_7_num: {
                sum: {
                  field: "WAY7"
                }
              },
            }
          }
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "PDEPAR_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inSexAgeWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_sex_age_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "DETINA_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              age_groups: {
                scripted_metric: {
                  init_script: "state.populationSums = new HashMap();",
                  map_script: generateAgeMapScript(true),
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
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter:[
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region
            }
          }
        ]
      }
    },
    aggs: {
      by_age: {
        terms: {
          field: "AGEG",
          size: 9,
          order: {
            _key: "asc"
          }
        },
        aggs: {
          way_0_num : {
            sum: {
              field: "WAY0"
            }
          },
          way_1_num : {
            sum: {
              field: "WAY1"
            }
          },
          way_2_num : {
            sum: {
              field: "WAY2"
            }
          },
          way_3_num : {
            sum: {
              field: "WAY3"
            }
          },
          way_4_num : {
            sum: {
              field: "WAY4"
            }
          },
          way_5_num : {
            sum: {
              field: "WAY5"
            }
          },
          way_6_num : {
            sum: {
              field: "WAY6"
            }
          },
          way_7_num : {
            sum: {
              field: "WAY7"
            }
          },
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function inSexWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("region must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const typeValue = "way_sex_report"
  const regionType = region.length === 5 ? "DETINA_SGG_CD" : "DSIDO";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getYIndexList(start, "native_way_sido_day_sum");
  if (regionType === "DETINA_SGG_CD") {
    const validIndices = {
      sgg: indexes.join(",")
    }
    regionMap = {
      sgg: { codes: [], field: regionType, index: validIndices.sgg }
    }
    regionMap = await addUnionRegionMap(region, regionMap)
    regionCodes = regionMap.sgg.codes
  }
  const query = regionType === "DETINA_SGG_CD"
  ? {
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
            terms: {
              [regionType]: regionCodes,
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
          by_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 8,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              by_male: {
                sum: {
                  field: "MALE_POPUL_NUM",
                },
              },
              by_female: {
                sum: {
                  field: "FEML_POPUL_NUM",
                },
              },
            },
          },
        },
      },
    },
  } : {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end
              }
            }
          },
          {
            term: {
              [regionType]: region,
            }
          }
        ]
      }
    },
    aggs: {
      by_region: {
        terms: {
          field: regionType,
          size: 10,
        },
        aggs: {
          by_male: {
            filter: {
              term: {
                SEXD: 1
              }
            },
            aggs: {
              w_0_num: {
                sum: {
                  field: "WAY0"
                }
              },
              w_1_num: {
                sum: {
                  field: "WAY1"
                }
              },
              w_2_num: {
                sum: {
                  field: "WAY2"
                }
              },
              w_3_num: {
                sum: {
                  field: "WAY3"
                }
              },
              w_4_num: {
                sum: {
                  field: "WAY4"
                }
              },
              w_5_num: {
                sum: {
                  field: "WAY5"
                }
              },
              w_6_num: {
                sum: {
                  field: "WAY6"
                }
              },
              w_7_num: {
                sum: {
                  field: "WAY7"
                }
              },
            }
          },
          by_female: {
            filter: {
              term: {
                SEXD: 0
              }
            },
            aggs: {
              w_0_num: {
                sum: {
                  field: "WAY0"
                }
              },
              w_1_num: {
                sum: {
                  field: "WAY1"
                }
              },
              w_2_num: {
                sum: {
                  field: "WAY2"
                }
              },
              w_3_num: {
                sum: {
                  field: "WAY3"
                }
              },
              w_4_num: {
                sum: {
                  field: "WAY4"
                }
              },
              w_5_num: {
                sum: {
                  field: "WAY5"
                }
              },
              w_6_num: {
                sum: {
                  field: "WAY6"
                }
              },
              w_7_num: {
                sum: {
                  field: "WAY7"
                }
              },
            }
          }
        }
      }
    }
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    if (regionType === "DETINA_SGG_CD") {
      const data = await mergeUnionByDashCompareMOP(results.body, region, typeValue)
      // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
      return data;
    } else {
      // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
      return results.body;
    }
  } catch (error) {
    console.error(error);
  }
}
