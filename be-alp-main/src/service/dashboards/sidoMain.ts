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
  getCompareYIndexList,
  getIndexCompare3MList,
  getYIndexList,
} from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import util from "util";

export async function getHourLivePop(
  start: string,
  lastYear: string,
  prevMonth: string
) {
  const query = {
    size: 0,
    aggs: {
      by_sido_cd: {
        terms: {
          field: "SIDO",
          size: 30,
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
  const validIndices = await getCompareYIndexList(start, "native_time_nation_mons");
  const index = validIndices.join(",");

  try {
    const results = await searchWithLogging({
      index: index,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function getStay3Pop(
  start: string,
  lastYear: string,
  prevMonth: string
) {
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const query = {
    size: 0,
    query: {
      bool: {
        must: [
          { term: { STAY_TIME_CD: 3 } },
          {
            terms: {
              BASE_YM: [start, lastYear, prevMonth],
            },
          },
          { term: { INOUT_DIV: 2 } },
        ],
      },
    },
    aggs: {
      sgg_cd: {
        terms: {
          field: "SIDO_CD",
          size: 1000,
          order: {
            _key: "asc",
          },
        },
        aggs: {
          base_ym_filter: {
            filters: {
              filters: {
                base_ym_start: {
                  term: {
                    BASE_YM: start,
                  },
                },
                base_ym_last: {
                  term: {
                    BASE_YM: lastYear,
                  },
                },
                base_ym_prev: {
                  term: {
                    BASE_YM: prevMonth,
                  },
                },
              },
            },
            aggs: {
              total_population: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
              unique_values: {
                cardinality: {
                  field: "SGG_CD",
                },
              },
            },
          },
        },
      },
    },
  };

  const index = "stay_sgg_mons";
  const validIndices = await getIndexCompare3MList(start, index);
  const updatedIndex = validIndices.join(",");

  try {
    const results = await searchWithLogging({
      index: updatedIndex,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getInFlow(
  start: string,
  lastYear: string,
  prevMonth: string
) {
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const query = {
    size: 0,
    query: {
      bool: {
        should: [
          {
            range: {
              BASE_YMD: {
                gte: convertLastY.start,
                lte: convertLastY.end,
              },
            },
          },
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              },
            },
          },
          {
            range: {
              BASE_YMD: {
                gte: convertPrevM.start,
                lte: convertPrevM.end,
              },
            },
          },
        ],
      },
    },
    aggs: {
      group_by_detina_sido_cd_last: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertLastY.start,
              lte: convertLastY.end,
            },
          },
        },
        aggs: {
          group_by_detina_sido_cd: {
            terms: {
              field: "DSIDO",
              size: 100000,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              sum_tot_popul_num_detina_last: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
      group_by_detina_sido_cd_start: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertStart.start,
              lte: convertStart.end,
            },
          },
        },
        aggs: {
          group_by_detina_sido_cd: {
            terms: {
              field: "DSIDO",
              size: 100000,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              sum_tot_popul_num_detina_start: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
      group_by_detina_sido_cd_prev: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertPrevM.start,
              lte: convertPrevM.end,
            },
          },
        },
        aggs: {
          group_by_detina_sido_cd: {
            terms: {
              field: "DSIDO",
              size: 100000,
              order: {
                _key: "asc",
              },
            },
            aggs: {
              sum_tot_popul_num_detina_prev: {
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

  const index = "native_prps_sido_day_sum";
  const validIndices = await getCompareYIndexList(start, index);
  const updatedIndex = validIndices.join(",");

  try {
    const results = await searchWithLogging({
      index: updatedIndex,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function getOutFlow(
  start: string,
  lastYear: string,
  prevMonth: string
) {
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);
  const query = {
    size: 0,
    query: {
      bool: {
        should: [
          {
            range: {
              BASE_YMD: {
                gte: convertLastY.start,
                lte: convertLastY.end,
              },
            },
          },
          {
            range: {
              BASE_YMD: {
                gte: convertStart.start,
                lte: convertStart.end,
              },
            },
          },
          {
            range: {
              BASE_YMD: {
                gte: convertPrevM.start,
                lte: convertPrevM.end,
              },
            },
          },
        ],
      },
    },
    aggs: {
      group_by_pdepar_sido_cd_last: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertLastY.start,
              lte: convertLastY.end,
            },
          },
        },
        aggs: {
          group_by_pdepar_sido_cd: {
            terms: {
              field: "PSIDO",
              size: 100000,
            },
            aggs: {
              sum_tot_popul_num_pdepar_last: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
      group_by_pdepar_sido_cd_start: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertStart.start,
              lte: convertStart.end,
            },
          },
        },
        aggs: {
          group_by_pdepar_sido_cd: {
            terms: {
              field: "PSIDO",
              size: 100000,
            },
            aggs: {
              sum_tot_popul_num_pdepar_start: {
                sum: {
                  field: "TOT",
                },
              },
            },
          },
        },
      },
      group_by_pdepar_sido_cd_prev: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertPrevM.start,
              lte: convertPrevM.end,
            },
          },
        },
        aggs: {
          group_by_pdepar_sido_cd: {
            terms: {
              field: "PSIDO",
              size: 100000,
            },
            aggs: {
              sum_tot_popul_num_pdepar_prev: {
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

  const index = "native_prps_sido_day_sum";
  const validIndices = await getCompareYIndexList(start, index);
  const updatedIndex = validIndices.join(",");

  try {
    const results = await searchWithLogging({
      index: updatedIndex,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function getSidoInfo(
  start: string,
  lastYear: string,
  prevMonth: string
) {
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
  const convertPrevM = calcMonthToDate(prevMonth);

  const query = {
    size: 0,
    aggs: {
      present: {
        filter: {
          term: {
            BASE_YM: start,
          },
        },
        aggs: {
          sido: {
            terms: {
              field: "SIDO",
              size: 30,
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
          sido: {
            terms: {
              field: "SIDO",
              size: 30,
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
          sido: {
            terms: {
              field: "SIDO",
              size: 30,
            },
          },
        },
      },
    },
  };

  const validIndices = await getCompareYIndexList(start, "native_time_nation_mons");
  const index = validIndices.join(",");

  try {
    const results = await searchWithLogging({
      index: index,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}

export async function getRgnChangeInfo() {
  const query = {
    size: 0,
    aggs: {
      unique: {
        composite: {
          sources: [
            { SIDO: { terms: { field: "SIDO" } } },
            { OSIDO: { terms: { field: "OSIDO" } } },
            { BASE_YM: { terms: { field: "BASE_YM" } } },
          ],
        },
      },
    },
  };

  const index = "rgn_change";

  try {
    const results = await searchWithLogging({
      index: index,
      body: query,
    });
    return results.body;
  } catch (error) {
    console.error(error);
  }
}
