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

import { Request, Response, NextFunction } from "express";
import * as datainfoService from "@/service/datainfo";

export async function addDatainfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const datainfo = req.body;
  if (!datainfo) {
    return res.status(400).json({ message: "Missing data" });
  }
  try {
    await datainfoService.updateDatainfo(datainfo);
    res.status(200).send("data ");
  } catch (error) {
    console.error("Failed to add datainfo:", (error as Error).message);
    res.status(500).json({
      message: "Error adding datainfo",
      error: (error as Error).message,
    });
  }
}

export async function getDatainfoAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end } = req.query;

  try {
    const data = await datainfoService.getDatainfoFromOpenSearch();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
