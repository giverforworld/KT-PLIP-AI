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
import * as gisController from "@/controller/gis/llpController";

const router = Router();

/**
 * @swagger
 * /gis/llp/flow:
 *   get:
 *     tags:
 *       - 2.3 GIS 체류인구(llp)
 *     summary: 유입분석
 *     parameters:
 *       - name: region
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
 *       - name: isIn
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "0: 내지인, 1: 외지인, 2: 전체"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolygonData'
 *       500:
 *         description: Internal server error
 */
router.get("/flow", gisController.llpFlowAggregation);

/**
 * @swagger
 * /gis/llp/depopul:
 *   get:
 *     tags:
 *       - 2.3 GIS 체류인구(llp)
 *     summary: 인구감소지역비교
 *     parameters:
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
 *       - name: isIn
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "0: 내지인, 1: 외지인, 2: 전체"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PolygonData'
 *       500:
 *         description: Internal server error
 */
router.get("/depopul", gisController.depopulAggregation);

export default router;
