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
  dash_regionAggregation,
  llpAggregation,
  regionAggregation,
  // regionCompareAggregation,
} from "@/utils/chart/regionAggregation";
import { dateRange, getWeekFilters } from "@/utils/makeQueryFilter";
import {
  normalizedAgeData,
  normalizedDayData,
  normalizedMixRropStatus,
  normalizedMonsAgeData,
  normalizedMonsData,
  normalizedRatioPop,
  normalizedSexAgeData,
  normalizedSexData,
  normalizedWeekdaysData,
  normalizedWeekdaysData2,
} from "@/helpers/normalized/normalizedData";
import { getHolidays } from "@/utils/holidays";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import { generateSexAge } from "@/utils/generateSexAge";
import {
  get12MIndexList,
  getCompareYIndexList,
  getIndexCompareMMList,
  getIndexCompareYList,
  getIndexCompareYYList,
  getIndexMMList,
  getIndexYList,
} from "@/helpers/getIndexList";
import { isValidMonth } from "@/middlewares/validators";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getWeekedOccurrences } from "@/helpers/normalized/normalizedALPData";

export async function statusAggs(options: LlpParams) {
  const holidays = await getHolidays(options.start, options.end);
  const [
    ratioResult,
    multipleResult,
    periodResult,
    statusDaysResult,
    statusMonsResult,
    statusRropsResult,
  ] = await Promise.all([
    statusRatio(options),
    statusMutipleData(options),
    statusComparePeriod(options),
    statusDaysData(options),
    statusMonsData(options),
    statusRropData(options),
  ]);

  //opensearh데이터 정규화
  const statusData = normalized(
    ratioResult,
    multipleResult,
    periodResult,
    statusDaysResult,
    statusMonsResult,
    statusRropsResult,
    options,
    holidays
  );

  return [statusData];
}

const normalized = (
  ratioData: any,
  multipleData: any,
  periodData: any,
  statusDaysData: any,
  statusMonsData: any,
  statusRropData: any,
  options: any,
  holidays: string[]
) => {
  const result: NormalizedObj = {
    ratioGroup: [],
    lastYear: [],
    prevMonth: [],
    day: [],
    weekdays: [],
    monsAge: [],
    sexAge: [],
    mons: [],
    rropPop: [],
    rropMons: [],
    rropSex: [],
    rropAge: [],
  };
  const { weekdayCnt, holidayCnt } = getWeekedOccurrences(
    options.start,
    options.end,
    holidays
  );
  const tempRropPop: { region?: number; data: any[] }[] = [];
  const tempRropMons: { region?: number; data: any[] }[] = [];
  const tempRropSex: { region?: number; data: any[] }[] = [];
  const tempRropAge: { region?: number; data: any[] }[] = [];

  // 체류인구 현재
  const stayPopCurrent = normalizedRatioPop(
    ratioData[0].current_year.by_sido.buckets
  );
  // 주민등록인구 현재
  const residPopCurrent = normalizedRatioPop(
    multipleData[0].current_year.by_sido.buckets
  );

  // 체류인구 전년
  const stayPopLast = normalizedRatioPop(ratioData[0].by_lastYear.by_sido.buckets);

  // 주민등록인구 전년
  const residPopLast = normalizedRatioPop(
    multipleData[0].by_lastYear.by_sido.buckets
  );

  let mapData: any = [];
  let tableData: any = [];
  for (const item of residPopCurrent) {
    const region = item.key;

    const stayPopValCurrent = stayPopCurrent.find(
      (res: any) => res.key === region
    );
    const stayValLast = stayPopLast.find((res: any) => res.key === region);
    const residValLast = residPopLast.find((res: any) => res.key === region);

    if (stayPopValCurrent && stayValLast && residValLast) {
      const lastMulti = stayValLast.value / residValLast.value;
      const CurrentMulti = stayPopValCurrent.value / item.value;
      const rate = ((CurrentMulti - lastMulti) / lastMulti) * 100;

      mapData.push({
        key: region,
        sggCode: region,
        value: CurrentMulti,
      });

      tableData.push({
        key: region,
        sggCode: region,
        rate: rate,
        value: CurrentMulti,
      });
    } else continue;
  }
  const sortedMap = mapData.sort((a: any, b: any) => b.value - a.value);
  const indexedMapData = sortedMap.map((item: any, index: number) => ({
    ...item,
    idx: index + 1,
  }));

  const sortedTable = tableData.sort((a: any, b: any) => b.value - a.value);
  const indexedTableData = sortedTable.map((item: any, index: number) => ({
    ...item,
    idx: index + 1,
  }));
  result.ratioGroup.push(
    {
      name: "ratioMap",
      data: indexedMapData,
    },
    {
      name: "ratioTable",
      data: indexedTableData,
    }
  );

  periodData.forEach((data: any) => {
    const region = data.key;
    const periodRegionData = periodData.find(
      (item: any) => item.key === region
    );
    if (periodRegionData.by_prevMonth) {
      result.prevMonth.push({
        region,
        data: [
          {
            key: "prevMonth",
            value: periodRegionData.by_prevMonth.pop_by_prevMonth.value,
          },
          {
            key: "start",
            value: periodRegionData.by_start.pop_by_start.value,
          },
        ],
      });

      //summary때문에 prevMonth 추가
      result.lastYear.push({
        region,
        data: [
          {
            key: "lastYear",
            value: periodRegionData.by_lastYear.pop_by_lastYear.value,
          },
          {
            key: "start",
            value: periodRegionData.by_start.pop_by_start.value,
          },
          {
            key: "prevMonth",
            value: periodRegionData.by_prevMonth.pop_by_prevMonth.value,
          },
        ],
      });
    } else {
      result.prevMonth.push({
        region,
        data: [
          {
            key: "start",
            value: periodRegionData.by_start.pop_by_start.value,
          },
        ],
      });
      result.lastYear.push({
        region,
        data: [
          {
            key: "lastYear",
            value: periodRegionData.by_lastYear.pop_by_lastYear.value,
          },
          {
            key: "start",
            value: periodRegionData.by_start.pop_by_start.value,
          },
        ],
      });
    }
  });

  statusDaysData.forEach((data: any) => {
    const region = data.key;

    const day = normalizedDayData(data.by_day.buckets);
    result.day.push({
      region,
      data: day,
    });

    const weekdays = normalizedWeekdaysData2(
      data.weekday_weekend_buckets.buckets,
      weekdayCnt,
      holidayCnt
    );
    result.weekdays.push({
      region,
      data: weekdays,
    });
  });

  statusMonsData.forEach((data: any) => {
    const region = data.key;
    const sex = normalizedSexData(data.by_sexage_rrop, "체류인구");

    tempRropSex.push({ region, data: sex });
    const age = normalizedAgeData(data.by_sexage_rrop, "체류인구");
    tempRropAge.push({ region, data: age });
    const sexAge = normalizedSexAgeData(data.by_sexage_rrop);
    const mergeSexAge: any = { sex, sexAge };
    result.sexAge.push({
      region,
      data: mergeSexAge,
    });

    if (data.by_month_age) {
      const monsAge = normalizedMonsAgeData(data.by_month_age.buckets);
      result.monsAge.push({
        region,
        data: normalizedMixRropStatus(monsAge, "month"),
      });
    }

    if (data.by_month) {
      const mons = normalizedMonsData(data.by_month.buckets, "체류인구");
      tempRropMons.push({ region, data: mons });
    }
    const tempPop = [
      { key: "체류인구", value: data.by_current.pop_by_month.value },
    ];
    tempRropPop.push({ region, data: tempPop });
  });

  if (statusRropData)
    statusRropData.forEach((data: any, idx: number) => {
      const rropSex = normalizedSexData(data.by_sexage_rrop, "주민등록인구");
      tempRropSex[idx].data.unshift(...rropSex);

      const rropAge = normalizedAgeData(data.by_sexage_rrop, "주민등록인구");

      tempRropAge[idx].data.unshift(...rropAge);

      const tempPop = {
        key: "주민등록인구",
        value: data.pop_by_rrop.tot_pop_num.value,
      };
      tempRropPop[idx].data.unshift(tempPop);

      if (data.by_month) {
        const rropMons = normalizedMonsData(
          data.by_month.buckets,
          "주민등록인구"
        );
        tempRropMons[idx].data.unshift(...rropMons);
      }
    });

  result.rropPop = tempRropPop;
  result.rropMons = tempRropMons;
  result.rropSex = tempRropSex;
  result.rropAge = tempRropAge;
  return result;
};

async function statusRatio(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isMonth = isValidMonth(start as string);
  const { lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const isSido = regionArray[0].length === 2;

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          {
            term: {
              POPUL_DCRS_RGN_DIV_CD: 1,
            },
          },
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
        should: [dateRange(true, start, end)],
      },
    },
    aggs: {
      current_year: {
        filter: {},
        aggs: {
          by_sido: {
            terms: {
              field: "SGG_CD",
              size: 250,
            },
            aggs: {
              pop_by_sido: { sum: { field: "TOT_POPUL_NUM" } },
            },
          },
        },
      },
      by_lastYear: {
        filter: {},
        aggs: {
          by_sido: {
            terms: {
              field: "SGG_CD",
              size: 250,
            },
            aggs: {
              pop_by_sido: { sum: { field: "TOT_POPUL_NUM" } },
            },
          },
        },
      },
    },
  };

  query.query.bool.should.push(
    dateRange(true, convertLastY.start, convertLastY.end)
  );
  query.aggs.current_year.filter = dateRange(true, start, end);

  query.aggs.by_lastYear.filter = dateRange(
    true,
    convertLastY.start,
    convertLastY.end
  );

  const indexArray = await getIndexCompareMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  const response = await searchWithLogging({
    index: isSido ? indexs.sido : indexs.sgg,
    body: query,
  });

  // return results;
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat(Infinity);
}

async function statusComparePeriod(options: LlpParams) {
  const { start, end, regionArray } = options;
  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const convertPrevMonth = calcMonthToDate(prevMonth);
  const endYear = String(Number(end.slice(0, 4))) + end.slice(4, 6);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, lastYear, endYear),
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
        should: [dateRange(true, start, end)],
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
          by_start: {
            filter: dateRange(true, start, end),
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
  // 기간 일 선택한 경우 전월 데이터 없음
  query.query.bool.should.push(
    dateRange(true, convertLastY.start, convertLastY.end),
    dateRange(true, convertPrevMonth.start, convertPrevMonth.end)
  );
  query.aggs.by_region.aggs.by_prevMonth = {
    filter: dateRange(true, prevMonth, prevMonth),
    aggs: {
      pop_by_prevMonth: {
        sum: {
          field: "TOT_POPUL_NUM",
        },
      },
    },
  };
  query.aggs.by_region.aggs.by_lastYear.filter = dateRange(
    true,
    convertLastY.start,
    convertLastY.end
  );

  const indexArray = await getIndexCompareMMList(start, end, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat(Infinity);
}
// 일별 체류인구 추이, 평일/휴일별 체류인구
async function statusDaysData(options: LlpParams) {
  const { start, end, regionArray } = options;
  const holidays = await getHolidays(start, end);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(false, start, end),
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
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
          by_day: {
            terms: {
              field: "BASE_YMD",
              size: 31,
              order: { _key: "asc" },
            },
            aggs: {
              pop_by_day: {
                sum: {
                  field: "TOT_POPUL_NUM",
                },
              },
              dow_info: {
                top_hits: {
                  size: 1,
                  _source: {
                    includes: ["DOW_CD"],
                  },
                },
              },
            },
          },
          weekday_weekend_buckets: {
            filters: getWeekFilters(holidays),
            aggs: {
              pop_by_weekdays: {
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
  const indexArray = await getIndexMMList(start, end, "stay_sgg_day");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };
  // let results = await regionAggregation(query, regionArray, indexs, "status");
  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  // console.log(util.inspect(results, {showHidden:false, depth:null, colors:true}))
  return results.flat(Infinity);
}

// 월별 연령대별 체류인구 추이
async function statusMonsData(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isStartValid = start.length === 6;
  const { lastYear } = calculateDates(start);
  const startYear = String(Number(start.slice(0, 4)) - 1) + start.slice(4, 6);
  const endYear = String(Number(end.slice(0, 4))) + end.slice(4, 6);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [
          dateRange(true, startYear, endYear),
          { range: { STAY_TIME_CD: { gte: 3 } } },
        ],
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
          ...(isStartValid && {
            by_month_age: {
              terms: {
                field: "BASE_YM",
                size: 13,
              },
              aggs: generateSexAge(true),
            },
            by_month: {
              terms: {
                field: "BASE_YM",
                size: 13,
                order: { _key: "asc" },
              },
              aggs: {
                pop_by_month: {
                  sum: {
                    field: "TOT_POPUL_NUM",
                  },
                },
              },
            },
          }),
          by_sexage_rrop: {
            filter: dateRange(true, start, end),
            aggs: generateSexAge(true),
          },
          by_current: {
            filter: {
              range: {
                BASE_YM: {
                  gte: isStartValid ? end : end.slice(0, 6),
                  lte: isStartValid ? end : end.slice(0, 6),
                },
              },
            },
            aggs: {
              pop_by_month: {
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

  const indexArray = await get12MIndexList(start, "stay_sgg_mons");

  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat(Infinity);
}

async function statusRropData(options: LlpParams) {
  const { start, end, regionArray } = options;
  const isStartValid = start.length === 6;
  const startYear = String(Number(start.slice(0, 4)) - 1) + start.slice(4, 6);
  const endYear = String(Number(end.slice(0, 4))) + end.slice(4, 6);

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        filter: [dateRange(true, startYear, endYear)],
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
          ...(isStartValid && {
            by_month: {
              terms: {
                field: "BASE_YM",
                size: 13,
              },
              aggs: {
                pop_by_month: {
                  sum: {
                    field: "TOT_POPUL_NUM",
                  },
                },
              },
            },
          }),
          pop_by_rrop: {
            filter: dateRange(true, start, end), // 날짜 범위
            aggs: {
              tot_pop_num: {
                sum: {
                  field: "TOT_POPUL_NUM", // 주민등록 인구 합계
                },
              },
            },
          },
          by_sexage_rrop: {
            filter: dateRange(true, start, end),
            aggs: generateSexAge(true),
          },
        },
      },
    },
  };

  const indexArray = await getIndexCompareYList(
    start,
    end,
    "resid_sgg_sex_age"
  );
  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat(Infinity);
}

async function statusMutipleData(options: LlpParams) {
  const { start, end, regionArray } = options;

  const { prevMonth, lastYear } = calculateDates(start);
  const convertLastY = calcMonthToDate(lastYear);
  const isSido = regionArray[0].length === 2;

  const query: any = {
    track_total_hits: true,
    size: 0,
    query: {
      bool: {
        should: [dateRange(true, start, end)],
      },
    },
    aggs: {
      current_year: {
        filter: {},
        aggs: {
          by_sido: {
            terms: {
              field: "SGG_CD",
              size: 250,
            },
            aggs: {
              pop_by_sido: { sum: { field: "TOT_POPUL_NUM" } },
            },
          },
        },
      },
      by_lastYear: {
        filter: {},
        aggs: {
          by_sido: {
            terms: {
              field: "SGG_CD",
              size: 250,
            },
            aggs: {
              pop_by_sido: { sum: { field: "TOT_POPUL_NUM" } },
            },
          },
        },
      },
    },
  };

  if (start.length === 6) {
    query.query.bool.should.push(
      dateRange(true, convertLastY.start, convertLastY.end)
    );
    query.aggs.current_year.filter = dateRange(true, start, end);

    query.aggs.by_lastYear.filter = dateRange(
      true,
      convertLastY.start,
      convertLastY.end
    );
  } else {
    query.query.bool.should.push(
      dateRange(
        true,
        lastYear + start.substring(6, 8),
        lastYear + end.substring(6, 8)
      )
    );
    query.aggs.current_year.filter = dateRange(true, start, end);
    query.aggs.by_lastYear.filter = dateRange(
      true,
      lastYear + start.substring(6, 8),
      lastYear + end.substring(6, 8)
    );
  }

  const indexArray = await getCompareYIndexList(start, "resid_sgg_sex_age");
  const indexs = {
    sido: indexArray.join(","),
    sgg: indexArray.join(","),
  };

  const response = await searchWithLogging({
    index: isSido ? indexs.sido : indexs.sgg,
    body: query,
  });

  let results: any[] = [];
  results = await Promise.all(regionArray.map(async (region:any) => {
    return await llpAggregation(
      query,
      region,
      indexs,
      start,
      "llp",
    )
  }));
  
  return results.flat(Infinity);
}
