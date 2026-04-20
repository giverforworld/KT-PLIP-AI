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

import dotenv from "dotenv";

// console.log("NODE_ENV : ", process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") dotenv.config({ path: "./.env" });
else dotenv.config({ path: "./.env.dev" });

// console.log("SERVER URL : ", process.env.SERVER_URL);
function required(key: string, defaultValue?: string | number): string {
  const value = process.env[key] || defaultValue;
  if (value == null) {
    throw new Error(`Key ${key} is undefined`);
  }
  return value.toString();
}

export const config = {
  //   jwt: {
  //     secretKey: required("JWT_SECRET"),
  //     expiresInSec: parseInt(required("JWT_EXPIRES_SEC", "86400")), // 기본값을 string으로 처리
  //   },
  //   bcrypt: {
  //     saltRounds: parseInt(required("BCRYPT_SALT_ROUNDS", "12")),
  //   },
  nodeEnv: required("NODE_ENV"),
  server: {
    host: required("SERVER_URL"),
    port: parseInt(required("SERVER_PORT", "8080")),
  },
  opensearch: {
    nodes: required("OPENSEARCH_NODES"),
    user: required("OPENSEARCH_USER"),
    password: required("OPENSEARCH_PASSWORD"),
  },
  cors: {
    allowedOrigin: required("CORS_ALLOW_ORIGIN"),
  },
  codi: {
    apiUrl: required("CODI_API_URL", "https://api.codi.kt.co.kr/v1"),
    apiKey: required("CODI_API_KEY", ""),
  },
};
