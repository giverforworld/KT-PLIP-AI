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
  get50GridData,
  get50GridMonsData,
  getCompositeAlpData,
  getCompositeChartTimeSeriesData,
  getCompositeFornData,
  getCompositeGridData,
  getCompositeGridMonsData,
  getCompositeGridTimeSeriesData,
} from "./alp/alpService";

//행정구역
export async function getAlpData(options: GisAlpParams): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, timeznArray, patterns } = options;
  const result = await getCompositeAlpData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    // dayArray,
    timeznArray,
    patterns!,
  );
  return result;
}
//외국인
// export async function getAlpFornData(options: GisAlpParams): Promise<any> {
//   // 최종 쿼리 결과 저장
//   const { regionArray, start, end, dayArray, timeznArray } = options;
//   const result = await getCompositeFornData(
//     regionArray,
//     start,
//     end,
//     dayArray,
//     timeznArray
//   );
//   return result;
// }

//격자
export async function getAlpGridData(options: GisAlpParams): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, timeznArray, patterns } = options;
  const result = await getCompositeGridData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    timeznArray,
    patterns!
  );
  return result;
}
export async function getAlpGridMonsData(options: GisAlpParams): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, timeznArray, patterns } = options;
  const result = await getCompositeGridMonsData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    timeznArray,
    patterns!
  );
  return result;
}

export async function getGridTimeSeriesAggregationData(
  options: GisAlpChartParams
): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, patterns } = options;
  const result = await getCompositeGridTimeSeriesData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    patterns!
  );
  return result;
}
export async function getChartTimeSeriesAggs(
  options: GisAlpChartParams
): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, patterns } = options;
  const result = await getCompositeChartTimeSeriesData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    patterns!
  );

  return result;
}
export async function getAlp50GridData(options: GisAlpGridParams): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, timeznArray} = options;
  const result = await get50GridData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    timeznArray,
  );
  return result;
}
export async function getAlp50GridMonsData(options: GisAlpGridParams): Promise<any> {
  // 최종 쿼리 결과 저장
  const { regionArray, start, end, gender, ageArray, timeznArray} = options;
  const result = await get50GridMonsData(
    regionArray,
    start,
    end,
    gender,
    ageArray,
    timeznArray,
  );
  return result;
}
