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

import { getScreenData } from "@/service/screenDataService";
import { Request, Response, NextFunction } from "express";
import { getSearchData } from "@/service/searchDataService";
import { getRankingData } from "@/service/rankingDataService";
import { AuthenticatedRequest } from "@/helpers/token";

//생활이동현황 - 지역비교 분석
export async function getAlpStatus(
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
    //ALP10010
    const options: AlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "ALP10020", options)
      : await getScreenData(user.userId, "ALP10010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//생활패턴분석
export async function getAlpPattern(
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
    //ALP10010
    const options: AlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "ALP20020", options)
      : await getScreenData(user.userId, "ALP20010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
export async function getAlpComparative(
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
    //ALP10010
    const options: AlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "ALP30020", options)
      : await getScreenData(user.userId, "ALP30010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
export async function getAlpSearch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
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
    const options: AlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const result = await getSearchData("ALP10010", options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
// 랭킹분석
export async function getAlpRank(
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
    //ALP10010
    const options: AlpParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
    };
    const result = await getScreenData(user.userId, "ALP40010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
export async function getAlpRanking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, regions, patterns, gender, day, isGen, age } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];
  const dayArray = Array.isArray(day)
    ? (day as string[]).map(Number)
    : [parseInt(day as string)];
  let ageArray = Array.isArray(age) ? age : [age];
  ageArray = ageArray.map((item) => (item === "0" ? "00" : String(item)));
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  const patternArray = Array.isArray(patterns)
    ? (patterns as string[]).map(Number)
    : [parseInt(patterns as string)];

  const sexMap: { [key: string]: string } = {
    "0": "M",
    "1": "F",
  };
  const sexArray = Array.isArray(gender)
    ? (gender as string[]).map((sex) => sexMap[sex])
    : [sexMap[gender as string]];

  const options: AlpRankParams = {
    start: start as string,
    end: end as string,
    regionArray: regionArray as string[],
    patternArray: patternArray,
    sexArray: sexArray,
    dayArray,
    isGen: isGen === "true",
    ageArray: ageArray as string[],
  };
  try {
    const result = await getRankingData("ALP40020", options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
