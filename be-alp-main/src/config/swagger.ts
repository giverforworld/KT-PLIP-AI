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

import { Options } from "swagger-jsdoc";
import { config } from "@/config/config";
import fs from "fs";
import path from "path";
import YAML from "js-yaml";

// 개발 환경과 배포 환경에 맞는 경로 설정
function getSwaggerFilePath(): string {
  // 개발 환경에서는 src 폴더, 배포 환경에서는 dist 폴더 사용
  const basePath =
    config.nodeEnv === "production"
      ? "../../dist/swagger"
      : "../../src/swagger";
  return path.resolve(__dirname, basePath); // 적절한 절대 경로 반환
}

// YAML 파일을 로드하는 함수
function loadSchemas(): Record<string, any> {
  const schemas: Record<string, any> = {};
  const swaggerFilePath = getSwaggerFilePath(); // 경로 설정

  try {
    // 디렉토리에서 파일들을 읽어옴
    const files = fs.readdirSync(swaggerFilePath);

    // YAML 파일을 하나씩 읽어들여 schemas에 병합
    files.forEach((file) => {
      if (file.endsWith(".swagger.yaml")) {
        const filePath = path.join(swaggerFilePath, file);
        // 파일 내용을 읽고 YAML 파싱
        const fileContent = fs.readFileSync(filePath, "utf8");
        const yamlData = YAML.load(fileContent) as any; // 파일 내용을 파싱

        // components.schemas가 있을 경우 schemas에 병합
        if (yamlData?.components?.schemas) {
          Object.assign(schemas, yamlData.components.schemas);
        }
      }
    });
  } catch (err) {
    console.error("Error loading Swagger schemas:", err);
  }

  return schemas;
}

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ALP API",
      version: "1.0.0",
      description: "This is ALP API service.",
    },
    servers: [
      {
        url:
          config.nodeEnv === "production"
            ? config.server.host
            : config.server.host + ":" + config.server.port, // 서버 URL 설정
      },
      {
        url: config.server.host + ":" + config.server.port, // 서버 URL 설정
      },
    ],
    tags: [
      { name: "1 Dashboard 종합현황분석" },
      { name: "1.1 Regional-dashboard 지역별 대시보드" },
      { name: "2.1 GIS 생활인구(alp)" },
      { name: "2.2 GIS 생활이동(mop)" },
      { name: "2.3 GIS 체류인구(llp)" },
      { name: "2.4 GIS 유동인구(fpop)" },
      { name: "3. MOP 생활이동" },
      { name: "4. ALP 생활인구" },
      { name: "5. LLP 체류인구" },
    ],
    components: {
      schemas: loadSchemas(), // YAML 파일에서 schemas를 동적으로 불러옴
    },
  },
  apis: [
    config.nodeEnv === "test"
      ? "./src/router/**/*.ts" // 개발 환경의 경우 src 폴더에서 TS 파일을 참조
      : "./dist/router/**/*.js", // 배포 환경의 경우 dist 폴더에서 JS 파일을 참조
    "./src/swagger/*.swagger.yaml",
  ],
};

export default swaggerOptions;
