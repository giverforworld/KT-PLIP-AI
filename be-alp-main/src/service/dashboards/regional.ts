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
import {
  getCompareMIndexList,
  getCompareYIndexList,
  getIndexCompare3MList,
  getIndexMList,
  getYIndexList,
} from "@/helpers/getIndexList";
import { addUnionRegionMap, mergeUnionByOne, mergeUnionByRank } from "@/helpers/mergeDataByRegion";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { dash_regionAggregation } from "@/utils/chart/regionAggregation";
import util from "util";

export async function getAvgHourLivePop(
  start: string,
  lastYear: string,
  prevMonth: string,
  region: string
) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const regionType = region.length === 5 ? "SGG" : "ADM";
  const index = await getCompareYIndexList(start, "native_time_nation_mons");
  const validIndices = {
    sgg: index.join(","),
    adm: index.join(","),
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
          present_alp: {
            filter: {
              term: {
                BASE_YM: start
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          prev_alp: {
            filter: {
              term: {
                BASE_YM: prevMonth
              },
            },
            aggs: {
              tot_popul_num: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
          last_alp: {
            filter: {
              term: {
                BASE_YM: lastYear
              },
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

  let results = await dash_regionAggregation(
    query,
    region,
    validIndices,
    start,
    typeValue
  );
  // console.log("transReg = sgg : 정상, adm : 정상 , union : 정상")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}

export async function stayPopQuery(
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
          present_llp: {
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
          prev_llp: {
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
          last_llp: {
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
  };
  const results = await dash_regionAggregation(
    query,
    region,
    validIndices,
    start,
    typeValue
  );
  // console.log("transReg1 = sgg : 정상, adm : - , union : 정상")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}

export async function outPopQuery(
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
  const typeValue = "mopout";
  const regionType =
    region.length === 5 ? "PDEPAR_SGG_CD" : "PDEPAR_ADMNS_DONG_CD";
  const index =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexCompare3MList(start, "native_prps_age_sgg_day")
      : await getIndexCompare3MList(start, "native_prps_age_admdong_day");
  const validIndices = {
    sgg: index.join(","),
    adm: index.join(","),
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
          present_mopout: {
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
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          prev_mopout: {
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
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          last_mopout: {
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
                  field: "TOT_POPUL_NUM",
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
  // console.log("transReg2 = sgg : 정상, adm : 정상 , union : 정상")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}

export async function inPopQuery(
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
  const typeValue = "mopin";
  const regionType =
    region.length === 5 ? "DETINA_SGG_CD" : "DETINA_ADMNS_DONG_CD";
  const index =
    regionType === "DETINA_SGG_CD"
      ? await getIndexCompare3MList(start, "native_prps_age_sgg_day")
      : await getIndexCompare3MList(start, "native_prps_age_admdong_day");
  const validIndices = {
    sgg: index.join(","),
    adm: index.join(","),
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
          present_mopin: {
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
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          prev_mopin: {
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
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          last_mopin: {
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
                  field: "TOT_POPUL_NUM",
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
  // console.log("transReg3 = sgg : 정상, adm : 정상 , union : 정상")
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results;
}

export async function timeLivePopQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "ADM";
  const convertStart = calcMonthToDate(start);
  const indexes = await getYIndexList(start, "native_time_nation_day");

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
      by_date: {
        terms: {
          field: "BASE_YMD",
          size: 31,
          order: {
            _key: "asc",
          },
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

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("transReg4 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function timesetQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType = region.length === 5 ? "SGG" : "ADM";
  const convertStart = calcMonthToDate(start);
  const indexes = await getYIndexList(start, "native_time_nation_day");

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
      index: indexes,
      body: query,
    });
    // console.log("transReg5 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function outPurposeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const regionType =
    region.length === 5 ? "PDEPAR_SGG_CD" : "PDEPAR_ADMNS_DONG_CD";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getIndexMList(start, "native_prps_age_admdong_day");
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  if (region.length === 5) {
    regionCodes = regionMap.sgg.codes 
  } else {
    regionCodes = regionMap.adm.codes
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
    const data = await mergeUnionByOne(results.body, region)
    // console.log("transReg6 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data ,{showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function inPurposeQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const regionType =
    region.length === 5 ? "DETINA_SGG_CD" : "DETINA_ADMNS_DONG_CD";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getIndexMList(start, "native_prps_age_admdong_day");
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  regionType === "DETINA_SGG_CD" ? regionCodes = regionMap.sgg.codes : regionCodes = regionMap.adm.codes
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
    const data = await mergeUnionByOne(results.body, region)
    // console.log("transReg6 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data ,{showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function outWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType =
    region.length === 5 ? "PDEPAR_SGG_CD" : "PDEPAR_ADMNS_DONG_CD";
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_way_age_sgg_day")
      : await getIndexMList(start, "native_way_age_admdong_day");
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  regionType === "PDEPAR_SGG_CD" ? regionCodes = regionMap.sgg.codes : regionCodes = regionMap.adm.codes
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
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByOne(results.body, region)
    // console.log("transReg7 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function inWayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType =
    region.length === 5 ? "DETINA_SGG_CD" : "DETINA_ADMNS_DONG_CD";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
    ? await getIndexMList(start, "native_way_age_sgg_day")
    : await getIndexMList(start, "native_way_age_admdong_day");
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  regionType === "DETINA_SGG_CD" ? regionCodes = regionMap.sgg.codes : regionCodes = regionMap.adm.codes
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
  };

  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    const data = await mergeUnionByOne(results.body, region)
    // console.log("transReg7 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data, {showHidden:false, depth:null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function out_rankQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType =
    region.length === 5 ? "PDEPAR_SGG_CD" : "PDEPAR_ADMNS_DONG_CD";
  const detinaType =
    region.length === 5 ? "DETINA_SGG_CD" : "DETINA_ADMNS_DONG_CD";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "PDEPAR_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getIndexMList(start, "native_prps_age_admdong_day");
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  regionType === "PDEPAR_SGG_CD" ? regionCodes = regionMap.sgg.codes : regionCodes = regionMap.adm.codes
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
          order: { _key: "asc" },
        },
        aggs: {
          by_detina: {
            terms: {
              field: detinaType,
              size: 5,
              order: { tot_popul_num: "desc" },
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
    const data = await mergeUnionByRank(results.body, region)
    // console.log("transReg9 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data, {showHidden:false, depth: null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function in_rankQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const regionType =
    region.length === 5 ? "DETINA_SGG_CD" : "DETINA_ADMNS_DONG_CD";
  const pdeparType =
    region.length === 5 ? "PDEPAR_SGG_CD" : "PDEPAR_ADMNS_DONG_CD";
  const convertStart = calcMonthToDate(start);
  const indexes =
    regionType === "DETINA_SGG_CD"
      ? await getIndexMList(start, "native_prps_age_sgg_day")
      : await getIndexMList(start, "native_prps_age_admdong_day");
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const validIndices = {
    sgg: indexes.join(","),
    adm: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: regionType, index: validIndices.sgg },
    adm: { codes: [], field: regionType, index: validIndices.adm },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  regionType === "DETINA_SGG_CD" ? regionCodes = regionMap.sgg.codes : regionCodes = regionMap.adm.codes
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
          by_pdepar: {
            terms: {
              field: pdeparType,
              size: 5,
              order: { pdepar_tot_popul_num: "desc" },
            },
            aggs: {
              pdepar_tot_popul_num: {
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
    const data = await mergeUnionByRank(results.body, region)
    // console.log("transReg8 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(data, {showHidden:false, depth: null, colors:true}))
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function stayDayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              SGG_CD: region,
            },
          },
          {
            term: {
              INOUT_DIV: 2,
            },
          },
          {
            term: {
              STAY_TIME_CD: 3,
            },
          },
          {
            term: {
              BASE_YM: start,
            },
          },
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
          tot_popul_num_one: {
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
          tot_popul_num_two: {
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
          tot_popul_num_eight: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
    },
  };

  const indexes = await getIndexMList(start, "stay_sgg_mons");
  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("transReg10 = sgg : 정상, adm : 정상 , union : 정상")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function ldgmtDayQuery(start: string, region: string) {
  if (typeof region !== "string") {
    throw new Error("start must be a string");
  }
  const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]
  let regionCodes: any = [];
  let regionMap: {
    [key: string]: { codes: string[]; field: string; index: string };
  };
  const indexes = await getYIndexList(start, "native_ldgmt_sgg");
  const validIndices = {
    sgg: indexes.join(","),
  };
  regionMap = {
    sgg: { codes: [], field: "LDGMT", index: validIndices.sgg },
  };
  regionMap = await addUnionRegionMap(region, regionMap)
  unionArray.includes(region) ? regionCodes = regionMap.sgg.codes : regionCodes = [region]
  const query = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            terms: {
              SGG_CD: regionCodes,
            },
          },
          {
            term: {
              BASE_YM: start,
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
    },
  };

  
  try {
    const results = await searchWithLogging({
      index: indexes,
      body: query,
    });
    // console.log("transReg10 = sgg : 정상, adm : -, union : ")
    // console.log(util.inspect(results.body, {showHidden:false, depth:null, colors:true}))
    return results.body;
  } catch (error) {
    console.error(error);
  }
}
