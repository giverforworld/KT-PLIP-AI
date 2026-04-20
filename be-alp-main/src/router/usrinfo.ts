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
import * as usrinfoController from "@/controller/usrinfo";

const router = Router();

/**
 * @swagger
 * /usrinfo/get:
 *   post:
 *     tags:
 *       - usrinfo
 *     summary: 프론트에서 유저 정보 받기
 *     responses:
 *       200:
 *         description: Successful get userinfo
 *       500:
 *         description: Internal server error
 */
router.post(
  "/get",
  usrinfoController.getInfo
);

export default router;