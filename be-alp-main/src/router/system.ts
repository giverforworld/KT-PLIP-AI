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

import { Router, Request, Response } from "express";

const router = Router();

// Health 체크 엔드포인트
router.get("/health", (req: Request, res: Response) => {
  res.status(200).send("OK");
});
export default router;
