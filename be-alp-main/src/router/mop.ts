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
import * as mopController from "@/controller/mop/mopController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /mop/search:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary: 생활이동 지역비교 분석표
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
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/search",
  createValidationMiddleware("MopParams"),
  mopController.getMopSearch
);

/**
 * @swagger
 * /mop/search/flow:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary: 생활이동 출도착 지역분석표
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
 *       - name: region
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "지역 코드 -> 기준지역 (예: 41111, 11680)"
 *       - name: flowRegions
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 출/도착지역 (예: 41111, 11680)"
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchData'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/search/flow",
  createValidationMiddleware("MopFlowParams"),
  mopController.getMopSearchFlow
);

/**
 * @swagger
 * /mop/status:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary: 생활이동현황 전체 데이터 - 지역비교
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
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
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
  createValidationMiddleware("MopParams"),
  mopController.getMopStatus
);

/**
 * @swagger
 * /mop/status/flow:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary:  생활이동현황 전체 데이터 - 출도착
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
 *       - name: region
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "지역 코드 -> 기준지역 (예: 41111, 11680)"
 *       - name: flowRegions
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 출/도착지역 (예: 41111, 11680)"
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
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
  "/status/flow",
  createValidationMiddleware("MopFlowParams"),
  mopController.getMopStatusFlow
);

/**
 * @swagger
 * /mop/purpose:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary: 이동목적분석 전체 데이터 - 지역비교
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
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
 *       - name: moveCd
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: |
 *           이동목적 코드 0~6
 *           ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"]
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
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
  "/purpose",
  createValidationMiddleware("MopMoveParams"),
  mopController.getMopPurpose
);

/**
 * @swagger
 * /mop/purpose/flow:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary:  이동목적분석 전체 데이터 - 출도착
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
 *       - name: region
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "지역 코드 -> 기준지역 (예: 41111, 11680)"
 *       - name: flowRegions
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 출/도착지역 (예: 41111, 11680)"
 *       - name: moveCd
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: |
 *           이동목적 코드 0~6
 *           ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"]
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
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
  "/purpose/flow",
  createValidationMiddleware("MopMoveFlowParams"),
  mopController.getMopPurposeFlow
);
/**
 * @swagger
 * /mop/trans:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary: 이동목적분석 전체 데이터 - 지역비교
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
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
 *       - name: moveCd
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: |
 *           이동수단 코드 0~7
 *           ["차량","노선버스","지하철","도보","고속버스","기차","항공","기타"]
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
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
  "/trans",
  createValidationMiddleware("MopMoveParams"),
  mopController.getMopTrans
);

/**
 * @swagger
 * /mop/trans/flow:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
 *     summary:  이동목적분석 전체 데이터 - 출도착
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
 *       - name: region
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "지역 코드 -> 기준지역 (예: 41111, 11680)"
 *       - name: flowRegions
 *         in: query
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "지역 코드 -> 출/도착지역 (예: 41111, 11680)"
 *       - name: moveCd
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: |
 *           이동수단 코드 0~7
 *           ["차량","노선버스","지하철","도보","고속버스","기차","항공","기타"]
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
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
  "/trans/flow",
  createValidationMiddleware("MopMoveFlowParams"),
  mopController.getMopTransFlow
);

/**
 * @swagger
 * /mop/rank-analysis:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
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
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
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
  createValidationMiddleware("MopParams"),
  mopController.getMopRank
);

/**
 * @swagger
 * /mop/rank-analysis/ranking:
 *   get:
 *     tags:
 *       - 3. MOP 생활이동
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
 *       - name: includeSame
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "동일 지역 이동 표출(true) 표출 안함(false)"
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
 *       - name: isPurpose
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "이동목적(true) 이동수단(false)"
 *       - name: moveCd
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: |
 *           이동목적 코드 0~6 :
 *           ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"]
 *           이동수단 코드 0~7 :
 *           ["차량","노선버스","지하철","도보","고속버스","기차","항공","기타"]
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
  createValidationMiddleware("MopRankParams"),
  mopController.getMopRanking
);

export default router;
