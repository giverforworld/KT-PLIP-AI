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

import client from "@/config/opensearchClient";
import logger from "./logger";
import { Client } from "@opensearch-project/opensearch/.";

// client 메서드 래핑
export async function searchWithLogging(params: any) {
  try {
    const method: keyof Client = params.method || "search";

    if (typeof client[method] !== "function") {
      throw new Error(`지원되지 않는 method : ${method}`);
    }
    // 로그 기록
    logger.info(`[REQUEST] ${method.toUpperCase()}`, {
      index: params.index,
    });

    //method 제외
    const { method: _, ...clientParams } = params;

    const startTime = Date.now();
    const response = await (client[method] as Function)(clientParams);
    const endTime = Date.now();

    // 성공 로그 기록
    logger.info(`[RESPONSE] ${method}`, {
      took: response.body.took,
      hits: response.body.hits?.total,
      timeTaken: `${endTime - startTime}ms`,
    });
    // console.log("response Node  ===  ", response.meta.connection);

    return response;
  } catch (error: any) {
    // 에러 로그 기록
    logger.error(`[ERROR] ${params.method?.toUpperCase() || "search"}`, {
      error: error.message,
      stack: error.stack,
    });

    // console.error(
    //   "Error querying OpenSearch Node:",
    //   error.meta.meta.connection
    // );

    throw error;
  }
}
