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
import * as gisController from "@/controller/gis/mopController";

const router = Router();

/**
 * @swagger
 * /gis/mop:
 *   get:
 *     tags:
 *       - 2.2 GIS 생활이동(mop)
 *     summary: 생활이동
 *     parameters:
 *       - name: spaceType
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "공간 타입 \n- 0: 행정구역, 1: 격자"
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
 *       - name: isPurpose
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "이동목적(true) 이동수단(false)"
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
 *       - name: isInflow
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "유입(true) 유출(false)"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *               inflow:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                  time:
 *                   type: integer
 *                   format: int64
 *                   example: 1722438000000
 *                  regionCode:
 *                   type: integer
 *                   example: 41111
 *                  regionName:
 *                   type: string
 *                   example: "경기도 수원시 장안구"
 *                  center:
 *                   type: array
 *                   items:
 *                    type: number
 *                   example: [127.0034134311512, 37.313974747359275]
 *                  options:
 *                   type: object
 *                   properties:
 *                    start:
 *                     type: integer
 *                     format: int64
 *                     example: 1722438000000
 *                    end:
 *                     type: integer
 *                     format: int64
 *                     example: 1725112800000
 *                    regionArray:
 *                     type: array
 *                     items:
 *                      type: string
 *                     example: ["41111"]
 *                    timeznArray:
 *                     type: array
 *                     items:
 *                      type: integer
 *                     example: [12]
 *                    isPurpose:
 *                     type: boolean
 *                     example: true
 *                  layerData:
 *                   type: object
 *                   properties:
 *                    "timestamp":
 *                     type: object
 *                     properties:
 *                      regionCode:
 *                       type: integer
 *                       example: 41111
 *                      regionName:
 *                       type: string
 *                       example: "경기도 수원시 장안구"
 *                      destinations:
 *                       type: array
 *                       items:
 *                        type: object
 *                        properties:
 *                         regionCode:
 *                          type: integer
 *                          example: 11200
 *                         regionName:
 *                          type: string
 *                          example: "서울특별시 성동구"
 *                         count:
 *                          type: object
 *                          properties:
 *                           PRPS0:
 *                            type: integer
 *                            example: 0
 *                           PRPS6:
 *                            type: integer
 *                            example: 0
 *                         center:
 *                          type: array
 *                          items:
 *                           type: number
 *                          example: [127.04100331479654, 37.551001861877126]
 *                         timeOri:
 *                          type: integer
 *                          format: int64
 *                          example: 1722438000000
 *                         timeDes:
 *                          type: integer
 *                          format: int64
 *                          example: 1722524400000
 *               outflow:
 *                type: array
 *                items:
 *                 type: object
 *                 properties:
 *                  time:
 *                   type: integer
 *                   format: int64
 *                   example: 1722438000000
 *                  regionCode:
 *                   type: integer
 *                   example: 41111
 *                  regionName:
 *                   type: string
 *                   example: "경기도 수원시 장안구"
 *                  center:
 *                   type: array
 *                   items:
 *                    type: number
 *                   example: [127.0034134311512, 37.313974747359275]
 *                  options:
 *                   type: object
 *                   properties:
 *                    start:
 *                     type: integer
 *                     format: int64
 *                     example: 1722438000000
 *                    end:
 *                     type: integer
 *                     format: int64
 *                     example: 1725112800000
 *                    regionArray:
 *                     type: array
 *                     items:
 *                      type: string
 *                     example: ["41111"]
 *                    timeznArray:
 *                     type: array
 *                     items:
 *                      type: integer
 *                     example: [12]
 *                    isPurpose:
 *                     type: boolean
 *                     example: true
 *                  layerData:
 *                   type: object
 *                   properties:
 *                    "timestamp":
 *                     type: object
 *                     properties:
 *                      regionCode:
 *                       type: integer
 *                       example: 41111
 *                      regionName:
 *                       type: string
 *                       example: "경기도 수원시 장안구"
 *                      destinations:
 *                       type: array
 *                       items:
 *                        type: object
 *                        properties:
 *                         regionCode:
 *                          type: integer
 *                          example: 11200
 *                         regionName:
 *                          type: string
 *                          example: "서울특별시 성동구"
 *                         count:
 *                          type: object
 *                          properties:
 *                           PRPS0:
 *                            type: integer
 *                            example: 0
 *                           PRPS6:
 *                            type: integer
 *                            example: 0
 *                         center:
 *                          type: array
 *                          items:
 *                           type: number
 *                          example: [127.04100331479654, 37.551001861877126]
 *                         timeOri:
 *                          type: integer
 *                          format: int64
 *                          example: 1722438000000
 *                         timeDes:
 *                          type: integer
 *                          format: int64
 *                          example: 1722524400000
 *       500:
 *         description: Internal server error
 */
router.get("/", gisController.mopAggregation);

/**
 * @swagger
 * /gis/mop/timeSeries:
 *   get:
 *     tags:
 *       - 2.2 GIS 생활이동(mop)
 *     summary: 생활이동 시계열
 *     parameters:
 *       - name: spaceType
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "공간 타입 \n- 0: 행정구역, 1: 격자"
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
 *       - name: isPurpose
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "이동목적(true) 이동수단(false)"
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
 *               $ref: '#/components/schemas/FlowPolygonData'
 *       500:
 *         description: Internal server error
 */
router.get("/timeSeries", gisController.mopTimeSeriesAggregation);

/**
 * @swagger
 * /gis/mop/chartTimeSeries:
 *   get:
 *     tags:
 *       - 2.2 GIS 생활이동(mop)
 *     summary: 생활이동 시계열
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
 *       - name: isPurpose
 *         in: query
 *         required: true
 *         schema:
 *           type: boolean
 *         description: "이동목적(true) 이동수단(false)"
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
router.get("/chartTimeSeries", gisController.mopChartTimeSeriesAggregation);

export default router;
