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

import util from "util";
import { Request, Response, NextFunction } from "express";
import * as gisService from "@/service/gis/gis";
import { getChangedRegion } from "@/utils/changedRegionCache";

export async function topojsonAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { date } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!date) {
    return res.status(400).json({ message: "date are required." });
  }

  if (typeof date !== "string" && date.length !== 6) {
    return res.status(400).json({ message: "wrong date" });
  }
  try {
    const data = await gisService.getTopojsonData(date as string);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getChangedRegionAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { type } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!type) {
    return res.status(400).json({ message: "type is required." });
  }
  try {
    const data = await getChangedRegion(type as string);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function regionInfoAggs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { date } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!date) {
    return res.status(400).json({ message: "date are required." });
  }

  if (typeof date !== "string" && date.length !== 6) {
    return res.status(400).json({ message: "wrong date" });
  }
  try {
    const data = await gisService.getRegionInfoData(date as string);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
