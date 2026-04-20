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

import "module-alias/register";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { config } from "@/config/config";
import systemRouter from "@/router/system";
import alpRouter from "@/router/alp";
import mopRouter from "@/router/mop";
import llpRouter from "@/router/llp";
import gisRoutes from "@/router/gis";
import holidayRouter from "@/router/holiday";
import swaggerOptions from "@/config/swagger";
import dashRoutes from "@/router/dashboards";
import regionalRouter from "@/router/regional";
import datainfoRouter from "@/router/datainfo";
import rgninfoRouter from "@/router/rgninfo";
import usrinfoRouter from "@/router/usrinfo";
import bookmarkRouter from "@/router/bookmark";
import aiRouter from "@/router/ai";
import { verifyToken } from "./helpers/token";

const app = express();
const corsOption = {
  origin: config.cors.allowedOrigin,
  optionsSuccessStatus: 200,
};

// Health 체크를 가장 먼저 처리하도록 설정
app.use("/", systemRouter);

app.use(express.json());
app.use(cors(corsOption));
app.use(morgan("tiny"));

app.use((req: Request, res:Response, next:NextFunction) => {
  if (req.query.timezn && !Array.isArray(req.query.timezn) && typeof req.query.timezn === "object") {
    req.query.timezn = Object.values(req.query.timezn) as any;
  }
  next();
})

// Swagger 설정
const swaggerDocument = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/holidays", holidayRouter);
app.use("/alp", verifyToken, alpRouter);
app.use("/mop", verifyToken, mopRouter);
app.use("/llp", verifyToken, llpRouter);
app.use("/gis", gisRoutes); // /gis 하위 경로를 한 번만 등록
app.use("/dashboards", dashRoutes);
app.use("/regional-dashboard", regionalRouter);
app.use("/datainfo", datainfoRouter);
app.use("/rgninfo", rgninfoRouter)
app.use("/usrinfo", usrinfoRouter)
app.use("/ai", verifyToken, aiRouter);
app.use("/", verifyToken, bookmarkRouter);

//Swagger http오류때문에 아래로
app.use(helmet());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.sendStatus(404);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message,
  });
});

const server = app.listen(config.server.port);
//타임아웃 설정 늘리기
server.setTimeout(1000000);

// 메모리 사용량 모니터링
// setInterval(() => {
//   const used = process.memoryUsage();
//   console.log(
//     `Memory Usage : Heap Used : ${(used.heapUsed / 1024 / 1024).toFixed(
//       2
//     )} MB , RSS : ${(used.rss / 1024 / 1024).toFixed(2)} MB`
//   );
// }, 1000);
