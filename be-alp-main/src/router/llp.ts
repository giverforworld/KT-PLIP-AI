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
import * as llpNewController from "@/controller/llp/llpController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /llp/search:
 *   get:
 *     tags:
 *       - 5. LLP 체류인구
 *     summary: 체류인구 지역분석표
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
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 기준지역, 비교지역(0~3개) (예: 41111, 11680)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/search",
  createValidationMiddleware("defaultParams"),
  llpNewController.getLlpSearch
);

/**
 * @swagger
 * /llp/status:
 *   get:
 *     tags:
 *       - 5. LLP 체류인구
 *     summary: 체류인구현황 전체 데이터 - 지역비교
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
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 기준지역, 비교지역(0~3개) (예: 41111, 11680)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/status",
  createValidationMiddleware("defaultParams"),
  llpNewController.getLlpStatus
);

/**
 * @swagger
 * /llp/traits:
 *   get:
 *     tags:
 *       - 5. LLP 체류인구
 *     summary: 체류인구 특성 - 지역비교
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
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 기준지역, 비교지역(0~3개) (예: 41111, 11680)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/traits",
  createValidationMiddleware("defaultParams"),
  llpNewController.getLlpTraits
);

/**
 * @swagger
 * /llp/rank-analysis:
 *   get:
 *     tags:
 *       - 5. LLP 체류인구
 *     summary: 랭킹분석 데이터
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
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 기준지역, 비교지역(0~3개) (예: 41111, 11680)"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/rank-analysis",
  createValidationMiddleware("defaultParams"),
  llpNewController.getLlpRank
);

/**
 * @swagger
 * /llp/rank-analysis/ranking:
 *   get:
 *     tags:
 *       - 5. LLP 체류인구
 *     summary: 랭킹분석 - 지역 랭킹
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
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "기준지역 (예: 41111, 11680)"
 *       - name: gender
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "0: 남자, 1: 여자"
 *       - name: isGen
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "10세단위(true) 5세단위(false)"
 *       - name: age
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "10세단위 0 : 10세 미만, 10: 10대, ... , 80 : 80대 이상 / 5세단위 0: 10세 미만, 10: 10세, 15: 15세 ... , 80: 80세 이상"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/rank-analysis/ranking",
  createValidationMiddleware("LlpRankParams"),
  llpNewController.getLlpRanking
);
//  *       - name: stayDay
//  *         in: query
//  *         schema:
//  *           type: array
//  *           items:
//  *              type: number
//  *         description: "체류일수별 1일(0), 2~7일(1), 8일이상(2)"
//  *       - name: day
//  *         in: query
//  *         schema:
//  *           type: array
//  *           items:
//  *              type: number
//  *         description: "선택한 요일 일(1)~ 토(7), 평일 8, 휴일 9"
export default router;
