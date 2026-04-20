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
import * as gisController from "@/controller/gis/gisController";

const router = Router();

/**
 * @swagger
 * /gis/topojson:
 *   get:
 *     tags:
 *       - GIS
 *     summary: 행정구역 polygon
 *     parameters:
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기준 yyyyMM (예 : 202408)"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopologyData'
 *       500:
 *         description: Internal server error
 */
router.get("/topojson", gisController.topojsonAggregation);

/**
 * @swagger
 * /gis/change-region:
 *   get:
 *     tags:
 *       - GIS
 *     summary: 행정동 변경 이력
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "sido, sgg, adm"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get("/change-region", gisController.getChangedRegionAggregation);

/**
 * @swagger
 * /gis/regionInfo:
 *   get:
 *     tags:
 *       - GIS
 *     summary: Get regionInfo
 *     parameters:
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: "기준 yyyyMM (예 : 202408)"
 *       - name: type
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *         description: "0:LMP, 1:ASP"
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get("/regionInfo", gisController.regionInfoAggs);

export default router;
