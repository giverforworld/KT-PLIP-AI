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

import { NextFunction, Request, Response } from "express";
import { getScreenData } from "@/service/screenDataService";
import { getSearchData } from "@/service/searchDataService";
import { getRankingData } from "@/service/rankingDataService";
import { AuthenticatedRequest } from "@/helpers/token";

//체류인구현황 - 지역비교 분석
export async function getLlpStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  try {
    //화면 ID 기준으로 호출
    //MOP10010
    const options: LlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "LLP20020", options)
      : await getScreenData(user.userId, "LLP20010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}

// 체류인구특성 - 통계요약
export async function getLlpTraits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  try {
    // 화면 ID 기준으로 호출
    // LLP30010
    const options: LlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "LLP30020", options)
      : await getScreenData(user.userId, "LLP30010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}

// 지역 분석
export async function getLlpSearch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, regions } = req.query;

  const regionArray = Array.isArray(regions) ? regions : [regions];

  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }

  try {
    const options: LlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const result = await getSearchData("LLP10010", options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
export async function getLlpRanking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, regions, stayDay, gender, day, isGen, age } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];
  let stayDayArray: number[] = [];
  if (stayDay) {
    stayDayArray = Array.isArray(stayDay)
      ? stayDay.map(Number) // 숫자로 변환
      : [Number(stayDay)]; // 단일 값도 숫자로 변환
  }

  let dayArray: number[] = [];
  if (day) {
    dayArray = Array.isArray(day)
      ? (day as string[]).map(Number)
      : [parseInt(day as string)];
  }
  let ageArray = Array.isArray(age) ? age : [age];
  ageArray = ageArray.map((item) => (item === "0" ? "00" : String(item)));
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }

  const sexMap: { [key: string]: string } = {
    "0": "MALE",
    "1": "FEML",
  };
  const sexArray = Array.isArray(gender)
    ? (gender as string[]).map((sex) => sexMap[sex])
    : [sexMap[gender as string]];

  const options: LlpRankParams = {
    start: start as string,
    end: end as string,
    regionArray: regionArray as string[],
    stayDayArray: stayDayArray,
    sexArray: sexArray,
    dayArray,
    isGen: isGen === "true",
    ageArray: ageArray as string[],
  };
  try {
    const result = await getRankingData("LLP40020", options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
export async function getLlpRank(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];

  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  try {
    //화면 ID 기준으로 호출
    //MOP10010
    const options: LlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const result = await getScreenData(user.userId, "LLP40010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
