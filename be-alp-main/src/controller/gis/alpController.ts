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
import * as gisService from "@/service/gis/gisAlp";
import {
  trans50GridData,
  transCompositeGridData,
  transGridData,
} from "@/utils/gis/transformGrid";
import { normalizeNumberArray, transChartTimeSeriesData } from "@/utils/gis/transformChart";
import { transALPData } from "@/utils/gis/transformALP";
import { screenMapping, screenOPMapping } from "@/config/screenConfig";
import { mergeAndSortStatSummary } from "@/helpers/sortStatSummary";

export async function alpAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { spaceType, regions, start, end, gender, age, timezn, patterns } =
    req.query;
  // 쿼리 파라미터를 검증합니다.
  if (
    !spaceType ||
    !regions ||
    !start ||
    !end ||
    !gender ||
    !age ||
    !timezn ||
    !patterns
  ) {
    return res.status(400).json({
      message:
        "spaceType, region, start, end, timezn, patterns, gender and age are required.",
    });
  }

  // 격자일 때 읍면동인지 확인
  // if (spaceType === `1` && regions?.length !== 8) {
  //   return res.status(200).json({
  //     message: "Grid-error1",
  //   });
  // }

  const regionArray = Array.isArray(regions) ? regions : [regions];
  const timeznArray = normalizeNumberArray(timezn)
    .filter(n => Number.isInteger(n) && n >= 0 && n <=23);

  // const timeznArray = Array.isArray(timezn)
  //   ? timezn.map(Number)
  //   : [parseInt(timezn as string)];
    
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);
  // 지역이 1개에서 4개 사이인지 확인
  const param = Number(end) - Number(start);
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

  // spacetype 0:행정구역, 1: 격자
  // patterns  0:거주, 1:직장, 2:방문
  try {
    const patternMap: { [key: string]: string } = {
      "0": "RSDN",
      "1": "WKPLC",
      "2": "VIST",
    };
    const patternArray = Array.isArray(patterns)
      ? (patterns as string[]).map((pattern) => patternMap[pattern])
      : [patternMap[patterns as string]];

    const options: GisAlpParams = {
      regionArray: regionArray as string[],
      start: start as string,
      end: end as string,
      gender: formatGender,
      ageArray: ageArray,
      // dayArray: dayArray,
      timeznArray: timeznArray,
      patterns: patternArray,
      // isNative: isNative === "true",
    };


    if (typeof start !== "string" || typeof end !== "string") {
      throw new Error("string, end must be a string");
    }

    if (spaceType === "1") {
      if (param > 8 || (start === end && start.length === 6)) {
        const { ...gridOptions } = options;
        const data = await gisService.getAlpGridMonsData(gridOptions);
        const transedData = await transCompositeGridData(data, options, false);
        res.status(200).json(transedData);
      } else {
        const { ...gridOptions } = options;
        const data = await gisService.getAlpGridData(gridOptions);
        const transedData = await transGridData(data, options, false);
        res.status(200).json(transedData);
      }
    } else {
      //내국인 행정구역
      const data = await gisService.getAlpData(options);
      const transedData = await transALPData(data, options);
      res.status(200).json(transedData);
    }
  } catch (error) {
    next(error);
  }
}

export async function gridTimeSeriesAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { regions, start, end, gender, age, patterns } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!regions || !start || !end || !gender || !age || !patterns) {
    return res.status(400).json({
      message: "region, start, end, gender, age and patterns are required.",
    });
  }
  const regionArray = Array.isArray(regions) ? regions : [regions];

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }

  const patternMap: { [key: string]: string } = {
    "0": "RSDN",
    "1": "WKPLC",
    "2": "VIST",
  };
  const patternArray = Array.isArray(patterns)
    ? (patterns as string[]).map((pattern) => patternMap[pattern])
    : [patternMap[patterns as string]];

  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);
  const options: GisAlpChartParams = {
    regionArray: regionArray as string[],
    start: start as string,
    end: end as string,
    gender: formatGender,
    ageArray: ageArray,
    patterns: patternArray,
  };

  try {
    const data = await gisService.getGridTimeSeriesAggregationData(options);

    const transedData = await transCompositeGridData(data, options, true);
    res.status(200).json(transedData);
  } catch (error) {
    next(error);
  }
}
export async function chartTimeSeriesAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { regions, start, end, gender, age, patterns } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (!regions || !start || !end || !gender || !age || !patterns) {
    return res.status(400).json({
      message: "region, start, end, gender, age and patterns are required.",
    });
  }
  const regionArray = Array.isArray(regions) ? regions : [regions];

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }

  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];

  const patternMap: { [key: string]: string } = {
    "0": "RSDN",
    "1": "WKPLC",
    "2": "VIST",
  };
  const patternArray = Array.isArray(patterns)
    ? (patterns as string[]).map((pattern) => patternMap[pattern])
    : [patternMap[patterns as string]];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);
  const options: GisAlpChartParams = {
    regionArray: regionArray as string[],
    start: start as string,
    end: end as string,
    gender: formatGender,
    ageArray: ageArray,
    patterns: patternArray,
  };

  try {
    const data = await gisService.getChartTimeSeriesAggs(options);
    const transedData = await transChartTimeSeriesData(data, options);
    res.status(200).json(transedData);
  } catch (error) {
    next(error);
  }
}

export async function alpGridCell(
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

  // 격자50이 읍면동인지 확인
  if (regions?.length !== 8) {
    return res.status(200).json({
      message: "Grid-error1",
    });
  }

  const regionArray = Array.isArray(regions) ? regions : [regions];
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
    const options: GisAlpGridParams = {
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
      const { ...gridOptions } = options;
      const data = await gisService.getAlp50GridMonsData(gridOptions);
      const transedData = await trans50GridData(data, options, false);
      res.status(200).json(transedData);
    } else {
      const { ...gridOptions } = options;
      const data = await gisService.getAlp50GridData(gridOptions);
      const transedData = await trans50GridData(data, options, false);
      res.status(200).json(transedData);
    }
  } catch (error) {
    next(error);
  }
}
