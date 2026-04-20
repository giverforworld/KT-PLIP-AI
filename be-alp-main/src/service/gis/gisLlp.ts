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

import {
  getCompositeDepopulData,
  getCompositeFlowData,
} from "./llp/llpService";

//유입분석
export async function getLlpFlowAggregationData(
  options: GisLlpParams
): Promise<any> {
  const result = await getCompositeFlowData(options);
  return result;
}

//인구감소비교지역
export async function getLlpDepopulAggregationData(
  options: GisLlpParams
): Promise<any> {
  const result = await getCompositeDepopulData(options);
  return result;
}
