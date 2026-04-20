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
import * as regionalController from "@/controller/dashboards/regionalController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /regional-dashboard:
 *   get:
 *     tags:
 *       - 1.1 Regional-dashboard 지역별 대시보드
 *     summary: 지역 상황판
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
 *               $ref: '#/components/schemas/ReportData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  createValidationMiddleware("reportParams"),
  regionalController.regional
);

export default router;
