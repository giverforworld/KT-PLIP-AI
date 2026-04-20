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

import { Router } from "express";
import * as reportController from "@/controller/dashboards/reportController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /dashboards/report:
 *   get:
 *     tags:
 *       - 1 Dashboard 종합현황분석
 *     summary: 지역 분석 리포트 발급
 *     parameters:
 *       - name: start
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기간 조회 시작일 (예: 월별 : 202301, 기간별 : 20230101)"
 *       - name: region
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "조회 지역 (예: 41111)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 regionName:
 *                   type: string
 *                   example: "지역명"
 *                 summary:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "생활이동"
 *                       data:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "유입/유출 인구"
 *                             data:
 *                               type: string
 *                               example: "{지역명} 으로 유입된 인구는 총 {1,398,235}명, 유출된 인구는 총 {1,398,235}명으로 나타났습니다."
 *                 mop:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "생활 이동 흐름"
 *                       summary:
 *                         type: string
 *                         example: "data summary"
 *                       charts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             regionName:
 *                               type: string
 *                               example: "지역명"
 *                             name:
 *                               type: string
 *                               example: "chart name"
 *                             indicate:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   구분:
 *                                     type: string
 *                                     example: "8/1 0:00"
 *                                   생활인구:
 *                                     type: number
 *                                     example: 56711
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  createValidationMiddleware("reportParams"),
  reportController.report
);

export default router;
