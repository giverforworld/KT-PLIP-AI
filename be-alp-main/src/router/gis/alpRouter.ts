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
import * as gisController from "@/controller/gis/alpController";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /gis/alp:
 *   get:
 *     tags:
 *       - 2.1 GIS 생활인구(alp)
 *     summary: 생활인구
 *     parameters:
 *       - name: spaceType
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "공간 타입 0:행정구역, 1: 격자"
 *       - name: regions
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
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
 *           oneOf:
 *              - type: array
 *                items:
 *                  type: string
 *              - type: object
 *                additionalProperties:
 *                  type: string
 *         description: "선택한 시간대 (예: 00, 01, 05,...)"
 *       - name: patterns
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "생활패턴 0:거주, 1:직장, 2:방문"
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
 *                time:
 *                 type: number
 *                 example: 1722438000000
 *                regionCode:
 *                 type: number
 *                 example: 41111
 *                regionName:
 *                 type: string
 *                 example: "경기도 수원시 장안구"
 *                options:
 *                 type: object
 *                 properties:
 *                  start:
 *                   type: number
 *                   example: 1722438000000
 *                  end:
 *                   type: number
 *                   example: 1725112800000
 *                  regionArray:
 *                   type: array
 *                   items:
 *                    type: string
 *                    example: "41111"
 *                  timeznArray:
 *                   type: array
 *                   items:
 *                    type: number
 *                    example: 12
 *                layerData:
 *                 type: object
 *                 properties:
 *                  "timestamp":
 *                   type: array
 *                   items:
 *                    type: object
 *                    properties:
 *                     regionCode:
 *                      type: number
 *                      example: 41111
 *                     regionName:
 *                      type: string
 *                      example: "경기도 수원시 장안구 파장동"
 *                     options:
 *                      type: object
 *                      properties:
 *                       "MALE_00":
 *                        type: number
 *                        example: 0.8040000279744466,
 *                       "FEML_60":
 *                        type: number
 *                        example: 5.0920001347859705,
 *                     center:
 *                      type: array
 *                      items:
 *                       type: number
 *                       example: 126.98934296875926
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  createValidationMiddleware("GisAlpParams"),
  gisController.alpAggregation
);

/**
 * @swagger
 * /gis/alp/gridTimeSeries:
 *   get:
 *     tags:
 *       - 2.1 GIS 생활인구(alp)
 *     summary: 생활인구 - 격자별 단계구분도 시계열 (laysers2 - grid)
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
 *       - name: patterns
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "생활패턴 0:거주, 1:직장, 2:방문"
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
 *                time:
 *                 type: number
 *                 example: 1722438000000
 *                regionCode:
 *                 type: number
 *                 example: 41111
 *                regionName:
 *                 type: string
 *                 example: "경기도 수원시 장안구"
 *                options:
 *                 type: object
 *                 properties:
 *                  start:
 *                   type: number
 *                   example: 1722438000000
 *                  end:
 *                   type: number
 *                   example: 1725112800000
 *                  regionArray:
 *                   type: array
 *                   items:
 *                    type: string
 *                    example: "41111"
 *                  timeznArray:
 *                   type: array
 *                   items:
 *                    type: number
 *                    example: 12
 *                layerData:
 *                 type: object
 *                 properties:
 *                  "timestamp":
 *                   type: object
 *                   properties:
 *                    "1":
 *                     type: array
 *                     items:
 *                      type: object
 *                      properties:
 *                       time:
 *                        type: number
 *                        example: 1722438000000
 *                       count:
 *                        type: object
 *                        properties:
 *                         "MALE_00":
 *                          type: number
 *                          example: 0.8040000279744466,
 *                         "FEML_60":
 *                          type: number
 *                          example: 5.0920001347859705,
 *                       coord:
 *                        type: array
 *                        items:
 *                         type: number
 *                         example: [126.98934296875926, 37.277869685980946]
 *       500:
 *         description: Internal server error
 */
router.get("/gridTimeSeries", gisController.gridTimeSeriesAggregation);

/**
 * @swagger
 * /gis/alp/chartTimeSeries:
 *   get:
 *     tags:
 *       - 2.1 GIS 생활인구(alp)
 *     summary: 생활인구 - 시계열 차트데이터
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
 *       - name: patterns
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: number
 *         description: "생활패턴 0:거주, 1:직장, 2:방문"
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *               time:
 *                type: number
 *                example: 1723345200000
 *               regionCode:
 *                type: number
 *                example: 41111
 *               regionName:
 *                type: string
 *                example: "수원시 장안구"
 *               options:
 *                type: object
 *                properties:
 *                 start:
 *                  type: number
 *                  format: int64
 *                  example: 1722438000000
 *                 end:
 *                  type: number
 *                  format: int64
 *                  example: 1725112800000
 *                 regionArray:
 *                  type: array
 *                  items:
 *                   type: string
 *                  example: ["41111"]
 *               chartData:
 *                type: object
 *                properties:
 *                 "timestamp":
 *                  type: object
 *                  properties:
 *                   count:
 *                    type: number
 *                    example: 208.16201117318437
 *       500:
 *         description: Internal server error
 */
router.get("/chartTimeSeries", gisController.chartTimeSeriesAggregation);

/**
 * @swagger
 * /gis/alp/grid:
 *   get:
 *     tags:
 *       - 2.1 GIS 생활인구(alp)
 *     summary: 생활인구 - 50Cell 격자
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
 *       - name: timezn
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *              type: string
 *         description: "선택한 시간대 (예: 00, 01, 05,...)"
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
 *     responses:
 *       200:
 *         description: Successful response with search data
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *               time:
 *                type: number
 *                example: 1723345200000
 *               regionCode:
 *                type: number
 *                example: 41111
 *               regionName:
 *                type: string
 *                example: "수원시 장안구"
 *               options:
 *                type: object
 *                properties:
 *                 start:
 *                  type: number
 *                  format: int64
 *                  example: 1722438000000
 *                 end:
 *                  type: number
 *                  format: int64
 *                  example: 1725112800000
 *                 regionArray:
 *                  type: array
 *                  items:
 *                   type: string
 *                  example: ["41111"]
 *               chartData:
 *                type: object
 *                properties:
 *                 "timestamp":
 *                  type: object
 *                  properties:
 *                   count:
 *                    type: number
 *                    example: 208.16201117318437
 *       500:
 *         description: Internal server error
 */
router.get("/grid", gisController.alpGridCell);
export default router;