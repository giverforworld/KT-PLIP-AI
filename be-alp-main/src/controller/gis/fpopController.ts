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
import * as gisService from "@/service/gis/gisFpop";
import { transFpopData } from "@/utils/gis/transformFpop";

export async function fpopAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { regions, start, end, gender, age, timezn } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!regions || !start || !end || !gender || !age || !timezn) {
    return res.status(400).json({
      message: "start, end, gender, age, region and timezn are required.",
    });
  }

  if (typeof regions !== "string") {
    throw new Error("string, end must be a string");
  }

  // 유동인구에서 읍면동인지 확인
  if (regions.length !== 8) {
    return res.status(200).json({
      message: "Flp-error1",
    });
  }

  const regionArray = Array.isArray(regions) ? regions : [regions];
  // const dayArray = Array.isArray(day)
  //   ? (day as string[]).map(Number)
  //   : [parseInt(day as string)];
  const timeznArray = Array.isArray(timezn)
    ? timezn.map(Number)
    : [parseInt(timezn as string)];
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const param = Number(end) - Number(start);
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  if (timeznArray.length < 1 || timeznArray.length > 24) {
    return res
      .status(400)
      .json({ message: "timezn must contain 1 to 24 items." });
  }
  try {
    const options: GisFpopParams = {
      regionArray: regionArray as string[],
      start: start as string,
      end: end as string,
      gender: formatGender,
      ageArray: ageArray,
      timeznArray: timeznArray,
    };
    
    if (typeof start !== "string" || typeof end !== "string") {
      throw new Error("string, end must be a string");
    }

    if (param > 8 || (start === end && start.length === 6)) {
      const data = await gisService.getFpopGridMons(options);
      const transedData = await transFpopData(data, options, false);
      res.status(200).json(transedData);
    } else {
      const data = await gisService.getFpopGrid(options);
      const transedData = await transFpopData(data, options, false);
      res.status(200).json(transedData);
    }
  } catch (error) {
    next(error);
  }
}
