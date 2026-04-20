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
import * as alpNewController from "@/controller/alp/alpController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";
// import * as alpNewController from "@/controller/alp/alpController";

const router = Router();

/**
 * @swagger
 * /alp/search:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
 *     summary: 생활인구 지역분석표
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
 *              type: array
 *              items:
 *               type: object
 *               properties:
 *                title:
 *                 type: string
 *                 example: "내국인 생활인구 수"
 *                data:
 *                 type: array
 *                 items:
 *                  type: object
 *                  properties:
 *                   regionName:
 *                    type: string
 *                    example: "경기도 수원시 장안구"
 *                   value:
 *                    type: object
 *                    properties:
 *                     Avg:
 *                      type: string
 *                      example: "60,797"
 *                     Sum:
 *                      type: string
 *                      example: "1,459,131"
 *                     Unique:
 *                      type: string
 *                      example: "600,894"
 *                unit:
 *                 type: string
 *                 example: "(명)"
 *       500:
 *         description: Internal server error
 */
router.get(
  "/search",
  createValidationMiddleware("defaultParams"),
  alpNewController.getAlpSearch
);

/**
 * @swagger
 * /alp/status:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
 *     summary: 생활인구현황 데이터
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
 *              type: object
 *              properties:
 *               statSummary:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                  regionName:
 *                   type: string
 *                   example: "경기도 수원시 장안구"
 *                  data:
 *                   type: object
 *                   properties:
 *                    Avg:
 *                     type: array
 *                     items:
 *                      type: string
 *                      example: "내국인 생활인구는\n{60,797} 명 입니다."
 *                    Sum:
 *                     type: array
 *                     items:
 *                      type: string
 *                      example: "내국인 생활인구는\n{60,797} 명 입니다."
 *                    Unique:
 *                     type: array
 *                     items:
 *                      type: string
 *                      example: "내국인 생활인구는\n{60,797} 명 입니다."
 *               dataGroups:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                  title:
 *                   type: string
 *                   example: "내국인 생활인구 현황"
 *                  data:
 *                   type: object
 *                   properties:
 *                    title:
 *                     type: string
 *                     example: "시계열 생활인구"
 *                    summary:
 *                     type: string
 *                     example: "{수원시 장안구} {8}월 {11}일 {오후 5시} {67,999}명으로 가장 많고, {8}월 {11}일 {오전 6시} {55,437}명으로 가장 적습니다."
 *                    charts:
 *                     type: array
 *                     items:
 *                      type: object
 *                      properties:
 *                       regionName:
 *                        type: string
 *                        example: "수원시 장안구"
 *                       name:
 *                        type: string
 *                        example: "timeSeriesData"
 *                       indicate:
 *                        type: array
 *                        items:
 *                         type: object
 *                         properties:
 *                          구분:
 *                           type: string
 *                           example: "8/1 0:00"
 *                          생활인구:
 *                           type: number
 *                           example: 56711
 *       500:
 *         description: Internal server error
 */
router.get(
  "/status",
  createValidationMiddleware("defaultParams"),
  alpNewController.getAlpStatus
);

/**
 * @swagger
 * /alp/pattern:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
 *     summary: 생활패턴분석 데이터
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
  "/pattern",
  createValidationMiddleware("defaultParams"),
  alpNewController.getAlpPattern
);

/**
 * @swagger
 * /alp/comparative-analysis:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
 *     summary: 주민/생활 비교분석 데이터
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
  "/comparative-analysis",
  createValidationMiddleware("defaultParams"),
  alpNewController.getAlpComparative
);

/**
 * @swagger
 * /alp/rank-analysis:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
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
  alpNewController.getAlpRank
);

/**
 * @swagger
 * /alp/rank-analysis/ranking:
 *   get:
 *     tags:
 *       - 4. ALP 생활인구
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
 *       - name: patterns
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "생활패턴 0:거주, 1:직장, 2:방문"
 *       - name: gender
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "0: 남자, 1: 여자"
 *       - name: day
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "선택한 요일 일(1)~ 토(7), 평일 8, 휴일 9"
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
  createValidationMiddleware("RankParams"),
  alpNewController.getAlpRanking
);

export default router;
