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
import * as gisService from "@/service/gis/gisLlp";
import { transLlpData, transLLPTripData } from "@/utils/gis/transformLlp";

export async function llpFlowAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { region, start, end, gender, age, isIn } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!region || !start || !end || !gender || !age || !isIn) {
    return res.status(400).json({
      message: "start, end, gender, age, region and isIn are required.",
    });
  }
  // const dayArray = Array.isArray(day)
  //   ? (day as string[]).map(Number)
  //   : [parseInt(day as string)];
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);

  try {
    const options: GisLlpParams = {
      region: region as string,
      start: start as string,
      end: end as string,
      gender: formatGender,
      ageArray: ageArray,
      // dayArray: dayArray,
      isIn: parseInt(isIn as string),
    };

    const data = await gisService.getLlpFlowAggregationData(options);

    const transedData = await transLlpData(data, options);

    res.status(200).json(transedData);
  } catch (error) {
    next(error);
  }
}
export async function depopulAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, gender, age, isIn } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!start || !end || !gender || !age || !isIn) {
    return res.status(400).json({
      message: "start, end, gender, age and isIn are required.",
    });
  }
  // const dayArray = Array.isArray(day)
  //   ? (day as string[]).map(Number)
  //   : [parseInt(day as string)];
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);

  try {
    const options: GisLlpParams = {
      start: start as string,
      end: end as string,
      gender: formatGender,
      ageArray: ageArray,
      isIn: parseInt(isIn as string),
    };

    const data = await gisService.getLlpDepopulAggregationData(options);

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "Llp-error1",
      });
    }

    const transedData = await transLLPTripData(data, options);

    res.status(200).json(transedData);
  } catch (error) {
    next(error);
  }
}
