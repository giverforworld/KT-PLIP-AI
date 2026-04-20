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
import * as dashController from "@/controller/dashboards/dashController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /dashboards/info:
 *   get:
 *     tags:
 *       - 1 Dashboard 종합현황분석
 *     summary: 대시보드 지표
 *     parameters:
 *       - name: start
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기간 조회 시작일 (예: 월별 : 202301, 기간별 : 20230101)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sidoCode:
 *                     type: number
 *                     example: 11
 *                   key:
 *                     type: string
 *                     example: "alp"
 *                   value:
 *                     type: number
 *                     example: 2291115
 *                   prevMonthComparison:
 *                     type: number
 *                     example: 2.17
 *                   prevYearComparison:
 *                     type: number
 *                     example: 3.56
 *       500:
 *         description: Internal server error
 */
router.get(
  "/info",
  createValidationMiddleware("dashboardsParams"),
  dashController.getSidoInfoData
);

/**
 * @swagger
 * /dashboards/chart:
 *   get:
 *     tags:
 *       - 1 Dashboard 종합현황분석
 *     summary: 전국 시도별 생활인구, 체류인구, 생활이동량, 유입 및 유출 변화 분석
 *     parameters:
 *       - name: start
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기간 조회 시작일 (예: 월별 : 202301, 기간별 : 20230101)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/chart",
  createValidationMiddleware("dashboardsParams"),
  dashController.getSidoChartData
);

export default router;
