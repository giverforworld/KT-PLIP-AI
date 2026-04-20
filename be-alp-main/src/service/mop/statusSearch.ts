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
import { regionFlowAggregation, regionMopFlowAggregation } from "@/utils/chart/regionAggregation";
import { dateRange } from "@/utils/makeQueryFilter";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import {
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import {
  getCompareRegionMap,
  mergeDataByRegion,
} from "@/helpers/mergeDataByRegion";

export async function statusSearch(options: MopParams) {
  const [
    purposeInResult,
    purposeInPeriodResult,
    wayInResult,
    purposeOutResult,
    purposeOutPeriodResult,
    wayOutResult,
  ] = await Promise.all([
    statusInOutSearch(options, true),
    statusInOutComparePeriod(options, true),
    statusInOutWay(options, true),
    statusInOutSearch(options, false),
    statusInOutComparePeriod(options, false),
    statusInOutWay(options, false),
  ]);

  //opensearh데이터 정규화
  const purposeInData = normalized(
    purposeInResult,
    purposeInPeriodResult,
    wayInResult,
    true
  );
  const purposeOutData = normalized(
    purposeOutResult,
    purposeOutPeriodResult,
    wayOutResult,
    false
  );

  const result: NormalizedData[] = [];
  for (const inItem of purposeInData) {
    const out = purposeOutData.find((item) => item.region === inItem.region);
    const regionData: NormalizedChartData[] = [];
    regionData.push({ key: "region", value: inItem.region as number });
    regionData.push(...inItem.data);
    regionData.push(...out!.data);
    result.push({
      region: inItem.region,
      data: regionData,
    });
  }

  return result;
}

const normalized = (
  purposeData: any,
  periodData: any,
  wayData: any,
  isInflow: boolean
) => {
  const result: NormalizedData[] = [];

  purposeData.forEach((data: any) => {
    const regionData: NormalizedChartData[] = [];
    const region = data.key;
    const pop = data.flow_pop.value;
    regionData.push({ key: `${isInflow ? "in" : "out"}flowPop`, value: pop });
    const flowRegion = data.max_flow_region.buckets[0].key;
    regionData.push({
      key: `${isInflow ? "in" : "out"}flowRegion`,
      value: flowRegion,
    });

    const pur = data.max_flow_prps.buckets[0].key;
    regionData.push({ key: `${isInflow ? "in" : "out"}flowPur`, value: pur });

    const periodRegionData = periodData.find(
      (item: any) => item.key === region
    );
    const compare = periodRegionData.by_lastYear.pop_by_lastYear.value
      ? Number(
          (
            ((periodRegionData.by_start.pop_by_start.value -
              periodRegionData.by_lastYear.pop_by_lastYear.value) /
              periodRegionData.by_lastYear.pop_by_lastYear.value) *
            100
          ).toFixed(2)
        )
      : 0;
    regionData.push({
      key: `${isInflow ? "in" : "out"}flowCompare`,
      value: compare,
    });

    const wayRegionData = wayData.find((item: any) => item.key === region);
    const way = wayRegionData?.max_flow_way.buckets[0].key || 0;
    regionData.push({ key: `${isInflow ? "in" : "out"}flowWay`, value: way });

    result.push({
      region,
      data: regionData,
    });
  });
  return result;
};

//인구수, 지역, 목적
async function statusInOutSearch(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;

  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          flow_pop: { sum: { field: "TOT_POPUL_NUM" } },
          max_flow_region: {
            terms: {
              field: "",
              size: 2,
              order: { max_region_pop: "desc" },
            },
            aggs: {
              max_region_pop: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          max_flow_prps: {
            terms: {
              field: "MOV_PRPS_CD",
              size: 2,
              order: { max_prps_pop: "desc" },
            },
            aggs: {
              max_prps_pop: {
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

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_prps_age_sgg_day"
  );

  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_prps_age_admdong_day"
  );

  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      isInflow,
      indexs,
      "statusSearch",
      start,
    )
  }));
  results = results.flat(Infinity);

  // '기타'일 경우 차순위로
  for (let i = 0; i < results.length; i++) {
    results[i].max_flow_prps.buckets.forEach((item:any) => {
      if (item.key === 6) {
        results[i].max_flow_prps.buckets = results[i].max_flow_prps.buckets.filter((item:any) => item.key !== 6)
      } 
    });
  }

  return results;
}

//전년동기
async function statusInOutComparePeriod(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;
  const { lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: { filter: [] },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          by_start: {
            filter: dateRange(false, start, end),
            aggs: {
              pop_by_start: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
            },
          },
          by_lastYear: {
            filter: {},
            aggs: {
              pop_by_lastYear: {
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
  if (start.length === 6) {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(false, convertLastY.start, convertLastY.end),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });

    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      convertLastY.start,
      convertLastY.end
    );
  } else {
    query.query.bool.filter.push({
      bool: {
        should: [
          dateRange(
            false,
            lastYear + start.substring(6, 8),
            lastYear + end.substring(6, 8)
          ),
          dateRange(false, start, end),
        ],
        minimum_should_match: 1,
      },
    });

    query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
      false,
      lastYear + start.substring(6, 8),
      lastYear + end.substring(6, 8)
    );
  }

  //개발용 kt에는 M으로 수정
  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexCompareMMList(
    start,
    end,
    `native_prps_age_sgg_day`
  );
  const validIndicesSgg = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_sgg_day",
    false
  );
  const validIndicesAdm = await getIndexCompareMMList(
    start,
    end,
    "native_prps_age_admdong_day",
    false
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };
  

  // 수정
  // let regionMap: {
  //   [key: string]: { codes: string[]; field: string };
  // } = {
  //   sido: {
  //     codes: [],
  //     field: "SIDO_CD",
  //   },
  //   ssg: { codes: [], field: "SSG_CD" },
  // };

  // regionMap = await getCompareRegionMap(regionArray, regionMap, start);

  // let results = await regionFlowAggregation(
  //   query,
  //   regionArray,
  //   includeSame,
  //   isInflow,
  //   indexs,
  //   "period",
  //   start,
  //   regionArray.length === 1
  // );

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await regionMopFlowAggregation(
      query,
      region,
      includeSame,
      isInflow,
      indexs,
      "period",
      start,
      regionArray.length === 1
    )
  }));
  results = results.flat(Infinity);
  
  // 수정
  // results = await mergeDataByRegion(results, regionArray);

  return results;
}

// 최다유입/유출수단
async function statusInOutWay(options: MopParams, isInflow: boolean) {
  const { start, end, regionArray, includeSame } = options;
  
  const query = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(false, start, end)],
      },
    },
    aggs: {
      by_region: {
        terms: {
          field: "",
          size: 4,
          order: { _key: "asc" },
        },
        aggs: {
          max_flow_way: {
            terms: {
              field: "MOV_WAY_CD",
              size: 2,
              order: { max_way_pop: "desc" },
            },
            aggs: {
              max_way_pop: {
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

  // 존재하는 인덱스만 필터링
  const validIndicesSido = await getIndexMMList(
    start,
    end,
    `native_way_age_sgg_day`
  );
  const validIndicesSgg = await getIndexMMList(
    start,
    end,
    "native_way_age_sgg_day"
  );
  const validIndicesAdm = await getIndexMMList(
    start,
    end,
    "native_way_age_admdong_day"
  );
  const indexs = {
    sido: validIndicesSido.join(","),
    sgg: validIndicesSgg.join(","),
    adm: validIndicesAdm.join(","),
  };
  let results = await regionFlowAggregation(
    query,
    regionArray,
    includeSame,
    isInflow,
    indexs,
    "way"
  );

  // '기타'일 경우 차순위로
  for (let i = 0; i < results.length; i++) {
    results[i].max_flow_way.buckets.forEach((item:any) => {
      if (item.key === 7) {
        results[i].max_flow_way.buckets = results[i].max_flow_way.buckets.filter((item:any) => item.key !== 7)
      } 
    });
  }
  
  return results;
}
