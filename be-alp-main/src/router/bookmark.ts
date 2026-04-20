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
import bookmarkRouter from "./bookmark/bookmark";
import bookmarkGroupRouter from "./bookmark/bookmark-group";

const router = Router();

router.use("/bookmark", bookmarkRouter);
router.use("/bookmark-group", bookmarkGroupRouter);

export default router;
