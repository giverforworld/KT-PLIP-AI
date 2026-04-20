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
import * as holidayController from "@/controller/holiday";
import { createValidationMiddleware } from "@/middlewares/validatorMiddleware";

const router = Router();

/**
 * @swagger
 * /holidays:
 *   get:
 *     tags:
 *       - holiday
 *     summary: 공휴일
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
 *     responses:
 *       200:
 *         description: Successful response with aggregated data
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  createValidationMiddleware("dateParams"),
  holidayController.getHolidaysAggregation
);

/**
 * @swagger
 * tags:
 *   name: holiday
 *   description: 공휴일 API

 * /holidays:
 *   post:
 *     tags:
 *       - holiday
 *     summary: add data to OpenSearch
 *     requestBody:
 *       description: Array of holidays data to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: array
 *              items:
 *                  $ref: "#/components/schemas/Holiday"
 *     responses:
 *       200:
 *         description: Successfully added holidays data
 *       500:
 *         description: Internal server error
 */
router.post("/", holidayController.addHolidays);

export default router;
