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
import * as datainfoController from "@/controller/datainfo";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /datainfo:
 *   get:
 *     tags:
 *       - datainfo
 *     summary: 데이터 적재 현황
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  datainfoController.getDatainfoAggregation
);

/**
 * @swagger
 * tags:
 *   name: datainfo
 *   description: 데이터 적재 체크 API

 * /datainfo:
 *   post:
 *     tags:
 *       - datainfo
 *     summary: add data to OpenSearch
 *     requestBody:
 *       description: Array of datainfo to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: array
 *              items:
 *                  $ref: "#/components/schemas/Datainfo"
 *     responses:
 *       200:
 *         description: Successfully added datainfo
 *       500:
 *         description: Internal server error
 */
router.post("/", datainfoController.addDatainfo);

export default router;
