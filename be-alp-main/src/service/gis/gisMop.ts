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

import { skip } from "node:test";
import {
  getCompositeFlowData,
  getCompositeMopChartTimeSeriesData,
  getCompositeMopData,
  getCompositeMopGridData,
  getCompositeMopGridMonsData,
  getCompositeMopTimeSeriesData,
  getMopGridTimeData,
} from "./mop/mopService";
import util from "util"

// 행정구역 성별, 연령별
export async function getMopAggregationData(
  options: GisMopGridParams
): Promise<any> {
  if (options.isInflow) {
    const inflow = await getCompositeMopData({ ...options, isInflow: true });
    const result = { inflow: inflow}
    return result;
  } else {
    const outflow = await getCompositeMopData({ ...options, isInflow: false });
    const result = { outflow: outflow };
    return result;
  }
}
//행정구역 시계열
export async function getMopTimeSeriesAggs(
  options: GisMopTimeParams
): Promise<any> {
  if (options.isInflow) {
    const inflow = await getCompositeMopTimeSeriesData({
      ...options, isInflow: true
    });
    const result = { inflow: inflow }
    return result;
  } else {
    const outflow  = await getCompositeMopTimeSeriesData({ ...options, isInflow: false});
    const result = { outflow: outflow }
    return result;
  }
}
//차트 시계열 /chartTimeSeries
export async function getMopChartTimeSeriesAggs(
  options: GisMopChartParams
): Promise<any> {
  if (options.isInflow) {
    const inflow = await getCompositeMopChartTimeSeriesData({
      ...options,
      isInflow: true,
    });
    const result = { inflow: inflow }
    return result
  } else {
    const outflow = await getCompositeMopChartTimeSeriesData({
      ...options,
      isInflow: false,
    });
    const result = { outflow: outflow };
    return result;
  }
}

//격자
export async function getMopGridData(options: GisMopGridParams): Promise<any> {
  if (options.isInflow) {
    const inflow = await getCompositeMopGridData(
      { ...options, isInflow: true },
      undefined, //cellSize
      false //isTimeSeries
    );
    const result = { inflow: inflow };
    return result;
  } else {
    const outflow = await getCompositeMopGridData(
      {
        ...options,
        isInflow: false,
      },
      undefined,
      false
    );
    const result = { outflow: outflow };
    return result;
  }
}
export async function getMopGridMonsData(options: GisMopGridParams): Promise<any> {
  if (options.isInflow) {
    const inflow = await getCompositeMopGridMonsData(
      { ...options, isInflow: true },
      undefined, //cellSize
      false //isTimeSeries
    );
    const result = { inflow: inflow };
    return result;
  } else {
    const outflow = await getCompositeMopGridMonsData(
      {
        ...options,
        isInflow: false,
      },
      undefined,
      false
    );
    const result = { outflow: outflow };
    return result;
  }
}

//격자 시계열 /timeSeries
export async function getMopGridTimeSeriesData(
  options: GisMopTimeParams
): Promise<any> {
  if (options.isInflow) {
    const inflow = await getMopGridTimeData({ ...options, isInflow: true}, undefined, true)
    const result = { inflow: inflow };
    return result;
  } else {
    const outflow = await getMopGridTimeData({ ...options, isInflow: false }, undefined, true);
    const result = { outflow: outflow };
    return result;
  }
}
export async function getFlowAggregationData(
  options: GisMopParamsOptions
): Promise<any> {
  const { isInflow, isPurpose, start, end, regionArray, timeznArray } = options;
  const result = await getCompositeFlowData(
    isInflow,
    isPurpose,
    start,
    end,
    regionArray,
    timeznArray
  );
  return result;
}
