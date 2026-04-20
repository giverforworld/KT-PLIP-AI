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
import * as gisController from "@/controller/gis/fpopController";

const router = Router();

/**
 * @swagger
 * /gis/fpop:
 *   get:
 *     tags:
 *       - 2.4 GIS 유동인구(fpop)
 *     summary: 유동인구 - 격자
 *     parameters:
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기준지역 (예: 41111, 11680)"
 *       - name: start
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기간 조회 시작일 (예: 월별 : 202301, 기간별 : 20230101)"
 *       - name: end
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기간 조회 종료일 (예: 월별 : 202301, 기간별 : 20230101)"
 *       - name: gender
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "0: 남자, 1: 여자, 2: 전체"
 *       - name: age
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "선택한 연령대 0 : 10세 미만, 10: 10대, ... , 80 : 80대 이상"
 *       - name: timezn
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "선택한 시간대 (예: 00, 01, 05,...)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GridData'
 *       500:
 *         description: Internal server error
 */
router.get("/", gisController.fpopAggregation);

export default router;
