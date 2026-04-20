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
import gisRouter from "./gis/gisRouter";
import gisAlpRouter from "./gis/alpRouter";
import gisMopRouter from "./gis/mopRouter";
import gisLlpRouter from "./gis/llpRouter";
import gisFpopRouter from "./gis/fpopRouter";

const router = Router();

router.use("/", gisRouter);
router.use("/alp", gisAlpRouter);
router.use("/mop", gisMopRouter);
router.use("/llp", gisLlpRouter);
router.use("/fpop", gisFpopRouter);
export default router;
