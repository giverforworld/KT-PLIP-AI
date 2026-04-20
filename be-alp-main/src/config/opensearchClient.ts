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

import { Client } from "@opensearch-project/opensearch";
import { config } from "@/config/config";
import { Agent } from "node:https";

const nodes = config.opensearch.nodes?.split(",") || [];

// 데이터 노드 URL을 사용해야 함
const client = new Client({
  nodes,
  auth: {
    username: config.opensearch.user,
    password: config.opensearch.password,
  },
  ssl: {
    rejectUnauthorized: false, // 필요에 따라 SSL 인증 설정
  },
  maxRetries: 3, // 최대 재시도 횟수
  requestTimeout: 100000, // 요청 타임아웃 설정 (ms)
  agent: new Agent({ keepAlive: true, maxSockets: 50, maxFreeSockets: 10 }), // 연결 재사용
  // sniffOnStart: true,
});

export default client;
