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
import * as rgninfoController from "@/controller/rgninfo";

const router = Router();

/**
 * @swagger
 * /rgninfo/updateindex:
 *   get:
 *     tags:
 *       - rgninfo
 *     summary: 인덱스 캐시 갱신
 *     responses:
 *       200:
 *         description: Successful Cache refreshed
 *       500:
 *         description: Internal server error
 */
router.get(
  "/updateindex",
  rgninfoController.updateIndexList
);

/**
 * @swagger
 * /rgninfo/checkindex:
 *   get:
 *     tags:
 *       - rgninfo
 *     summary: 인덱스 캐시 조회
 *     responses:
 *       200:
 *         description: Successful Cache refreshed
 *       500:
 *         description: Internal server error
 */
router.get(
  "/checkindex",
  rgninfoController.checkIndexList
);
  
export default router;