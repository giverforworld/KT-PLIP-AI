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
import * as holidaysService from "@/service/holidays";

export async function addHolidays(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const holidays = req.body;
  if (!holidays) {
    return res.status(400).json({ message: "Missing data" });
  }
  try {
    await holidaysService.updateHolidays(holidays);
    res.status(200).send("Holiday added successfully");
  } catch (error) {
    console.error("Failed to add holiday:", (error as Error).message);
    res.status(500).json({
      message: "Error adding holiday",
      error: (error as Error).message,
    });
  }
}

export async function getHolidaysAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end } = req.query;

  try {
    const data = await holidaysService.getHolidaysFromOpenSearch(
      start as string,
      end as string
    );
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
