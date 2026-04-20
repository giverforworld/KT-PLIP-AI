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
  getIndexMList,
  getYIndexList,
} from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { describe } from "node:test";

export async function getLivePop(start: string) {
  const convertStart = calcMonthToDate(start);
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
        ],
      },
    },
    aggs: {
      by_sido_cd: {
        terms: {
          field: "SIDO",
          size: 30,
          order: {
            sum_tot_popul_num: "desc",
          },
        },
        aggs: {
          sum_tot_popul_num: {
            sum: {
              field: "TOT",
            },
          },
        },
      },
    },
  };
  const index = "native_time_nation_mons";
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

export async function getStayPop(start: string) {
  const convertStart = calcMonthToDate(start);
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
            term: { STAY_TIME_CD: 3 },
          },
          { term: { INOUT_DIV: 2 } },
        ],
      },
    },
    _source: false,
    aggs: {
      sido_cd_aggregation: {
        terms: {
          field: "SGG_CD",
          size: 17,
          order: {
            "total_population.value": "desc",
          },
        },
        aggs: {
          total_population: {
            sum: {
              field: "TOT_POPUL_NUM",
            },
          },
        },
      },
    },
  };
  const index = "stay_sgg_mons"; // kt 수정 시 stay_sgg_mons
  const validIndices = await getIndexMList(start, index);
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

export async function getMovPop(start: string) {
  const convertStart = calcMonthToDate(start);
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
        ],
      },
    },
    aggs: {
      by_detina_sido_cd: {
        terms: {
          field: "DSIDO",
          size: 17,
          order: {
            "total_detina_sido_cd_popul.value": "desc",
          },
        },
        aggs: {
          total_detina_sido_cd_popul: {
            sum: {
              field: "TOT",
            },
          },
        },
      },
      by_pdepar_sido_cd: {
        terms: {
          field: "PSIDO",
          size: 17,
          order: {
            "total_pdepar_sido_cd_popul.value": "desc",
          },
        },
        aggs: {
          total_pdepar_sido_cd_popul: {
            sum: {
              field: "TOT",
            },
          },
        },
      },
    },
  };
  const index = "native_prps_sido_day_sum";
  const validIndices = await getCompareYIndexList(start, index);
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

export async function comparePeriodLastYear(start: string, lastYear: string) {
  const convertLastY = calcMonthToDate(lastYear);
  const convertStart = calcMonthToDate(start);
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
        ],
      },
    },
    aggs: {
      group_by_detina_broad_sido_cd_last: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertLastY.start,
              lte: convertLastY.end,
            },
          },
        },
        aggs: {
          group_by_detina_broad_sido_cd: {
            terms: {
              field: "DSIDO",
              size: 10000,
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
      group_by_pdepar_broad_sido_cd_last: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertLastY.start,
              lte: convertLastY.end,
            },
          },
        },
        aggs: {
          group_by_pdepar_broad_sido_cd: {
            terms: {
              field: "PSIDO",
              size: 10000,
              order: {
                _key: "asc",
              },
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
      group_by_detina_broad_sido_cd_start: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertStart.start,
              lte: convertStart.end,
            },
          },
        },
        aggs: {
          group_by_detina_broad_sido_cd: {
            terms: {
              field: "DSIDO",
              size: 10000,
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
      group_by_pdepar_broad_sido_cd_start: {
        filter: {
          range: {
            BASE_YMD: {
              gte: convertStart.start,
              lte: convertStart.end,
            },
          },
        },
        aggs: {
          group_by_pdepar_broad_sido_cd: {
            terms: {
              field: "PSIDO",
              size: 10000,
              order: {
                _key: "asc",
              },
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
    },
  };

  const index = "native_prps_sido_day_sum";
  const validIndices = await getCompareYIndexList(start, index);

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
