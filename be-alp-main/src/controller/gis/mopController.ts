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
import * as gisService from "@/service/gis/gisMop";
import {
  transMopChartTimeSeriesData,
  transMopData,
  transMopGridData,
  transMopGridTimeData,
  transMopTimeData,
} from "@/utils/gis/transformMop";
import { normalizeNumberArray } from "@/utils/gis/transformChart";

export async function mopAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const {
    spaceType,
    regions,
    start,
    end,
    timezn,
    isPurpose,
    gender,
    age,
    isInflow,
  } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (
    !spaceType ||
    !regions ||
    !start ||
    !end ||
    !timezn ||
    !isPurpose ||
    !gender ||
    !age ||
    !isInflow
  ) {
    return res.status(400).json({
      message:
        "spaceType, region, start, end, timezn, isPurpose, gender, age and isInflow are required.",
    });
  }

  const regionArray = Array.isArray(regions) ? regions : [regions];
  // const dayArray = Array.isArray(day)
  //   ? (day as string[]).map(Number)
  //   : [parseInt(day as string)];
  const timeznArray = normalizeNumberArray(timezn)
      .filter(n => Number.isInteger(n) && n >= 0 && n <=23);
  // const timeznArray = Array.isArray(timezn)
  //   ? timezn.map(Number)
  //   : [parseInt(timezn as string)];
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
  if (parseInt(spaceType as string) < 0 || parseInt(spaceType as string) > 2) {
    return res.status(400).json({ message: "spaceType must 0 to 2" });
  }

  try {
    if (spaceType === "1") {
      //격자

      const options: GisMopGridParams = {
        spaceType: parseInt(spaceType as string),
        regionArray: regionArray as string[],
        start: start as string,
        end: end as string,
        timeznArray: timeznArray,
        isPurpose: isPurpose === "true",
        gender: formatGender,
        ageArray: ageArray,
        isInflow: isInflow === "true",
      };

      const data = await gisService.getMopGridData(options);
      let result;

      if (typeof start !== "string" || typeof end !== "string") {
        throw new Error("string, end must be a string");
      }
      if (param > 8 || (start === end && start.length === 6)) {
        const data = await gisService.getMopGridMonsData(options);
        let result;

        if (data.inflow) {
          const inflowData = await transMopGridData(
            data.inflow,
            {
              ...options,
              isInflow: true,
            },
            false
          );
          result = { inflow: inflowData };
        } else {
          const outflowData = await transMopGridData(
            data.outflow,
            {
              ...options,
              isInflow: false,
            },
            false
          );
          result = { outflow: outflowData };
        }
        res.status(200).json(result);
      } else {
        if (data.inflow) {
          const inflowData = await transMopGridData(
            data.inflow,
            {
              ...options,
              isInflow: true,
            },
            false
          );
          result = { inflow: inflowData };
        } else {
          const outflowData = await transMopGridData(
            data.outflow,
            {
              ...options,
              isInflow: false,
            },
            false
          );
          result = { outflow: outflowData };
        }
        res.status(200).json(result);
      }
    } else {
      const options: GisMopParams = {
        spaceType: parseInt(spaceType as string),
        regionArray: regionArray as string[],
        start: start as string,
        end: end as string,
        timeznArray: timeznArray,
        isPurpose: isPurpose === "true",
        gender: formatGender,
        ageArray: ageArray,
        isInflow: isInflow === "true",
      };
      const data = await gisService.getMopAggregationData(options);
      let result;

      if (data.inflow) {
        const inflowData = await transMopData(
          data.inflow,
          {
            ...options,
            isInflow: true,
          },
          false
        );
        result = { inflow: inflowData };
      } else {
        const outflowData = await transMopData(
          data.outflow,
          {
            ...options,
            isInflow: false,
          },
          false
        );
        result = { outflow: outflowData };
      }

      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
}
// /timeSeries
export async function mopTimeSeriesAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { spaceType, regions, start, end, isPurpose, gender, age, isInflow } =
    req.query;
  // 쿼리 파라미터를 검증합니다.
  if (
    !spaceType ||
    !regions ||
    !start ||
    !end ||
    !isPurpose ||
    !gender ||
    !age ||
    !isInflow
  ) {
    return res.status(400).json({
      message:
        "spaceType, region, start, end, isPurpose, gender, age, and isInflow are required.",
    });
  }

  const regionArray = Array.isArray(regions) ? regions : [regions];
  // const dayArray = Array.isArray(day)
  //   ? (day as string[]).map(Number)
  //   : [parseInt(day as string)];
  // const timeznArray = Array.isArray(timezn)
  //   ? timezn.map(Number)
  //   : [parseInt(timezn as string)];
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  // if (timeznArray.length < 1 || timeznArray.length > 24) {
  //   return res
  //     .status(400)
  //     .json({ message: "timezn must contain 1 to 24 items." });
  // }

  try {
    if (spaceType === "1") {
      //격자
      const options: GisMopTimeParams = {
        spaceType: parseInt(spaceType as string),
        regionArray: regionArray as string[],
        start: start as string,
        end: end as string,
        isPurpose: isPurpose === "true",
        gender: formatGender,
        ageArray: ageArray,
        isInflow: isInflow === "true",
      };
      const data = await gisService.getMopGridTimeSeriesData(options);

      let result;

      if (data.inflow) {
        const inflowData = await transMopGridTimeData(
          data.inflow,
          {
            ...options,
            isInflow: true,
          },
          true
        );
        result = { inflow: inflowData };
      } else {
        const outflowData = await transMopGridTimeData(
          data.outflow,
          {
            ...options,
            isInflow: false,
          },
          true
        );
        result = { outflow: outflowData };
      }
      res.status(200).json(result);

      // const transedData = await transMopGridData(
      //   data,
      //   {
      //     ...options,
      //   },
      //   true
      // );

      // res.status(200).json(transedData);
    } else {
      const options: GisMopTimeParams = {
        spaceType: parseInt(spaceType as string),
        regionArray: regionArray as string[],
        start: start as string,
        end: end as string,
        isPurpose: isPurpose === "true",
        gender: formatGender,
        ageArray: ageArray,
        isInflow: isInflow === "true",
      };
      const data = await gisService.getMopTimeSeriesAggs(options);

      let result;

      if (data.inflow) {
        const inflowData = await transMopTimeData(
          data.inflow,
          { ...options, isInflow: true },
          true
        );
        result = { inflow: inflowData };
      } else {
        const outflowData = await transMopTimeData(
          data.outflow,
          {
            ...options,
            isInflow: false,
          },
          true
        );
        result = { outflow: outflowData };
      }
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
}

//시계열 차트 /chartTimeSeries
export async function mopChartTimeSeriesAggregation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { regions, start, end, isPurpose, gender, age, isInflow } = req.query;
  // 쿼리 파라미터를 검증합니다.
  if (
    !regions ||
    !start ||
    !end ||
    !isPurpose ||
    !gender ||
    !age ||
    !isInflow
  ) {
    return res.status(400).json({
      message:
        "spaceType, region, start, end, isPurpose, gender, age and isInflow are required.",
    });
  }

  const regionArray = Array.isArray(regions) ? regions : [regions];
  const ageArray = Array.isArray(age)
    ? age.map(Number)
    : [parseInt(age as string)];
  const formatGender = Array.isArray(gender) ? 2 : Number(gender);
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  const options: GisMopChartParams = {
    regionArray: regionArray as string[],
    start: start as string,
    end: end as string,
    isPurpose: isPurpose === "true",
    gender: formatGender,
    ageArray: ageArray,
    isInflow: isInflow === "true",
  };

  try {
    const data = await gisService.getMopChartTimeSeriesAggs(options);
    let result;

    if (data.inflow) {
      const inflowData = await transMopChartTimeSeriesData(data.inflow, {
        ...options,
        isInflow: true,
      });
      result = { inflow: inflowData };
    } else {
      const outflowData = await transMopChartTimeSeriesData(data.outflow, {
        ...options,
        isInflow: false,
      });
      result = { outflow: outflowData };
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
