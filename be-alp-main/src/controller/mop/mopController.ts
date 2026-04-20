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
export async function getMopStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }

  const { start, end, regions, includeSame } = req.query;

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
    const options: MopParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
      includeSame: includeSame === "true",
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "MOP10020", options)
      : await getScreenData(user.userId, "MOP10010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//생활이동현황 - 출도착지역 분석
export async function getMopStatusFlow(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, region, flowRegions, isInflow } = req.query;

  // flowRegions가 존재할 경우 유효성 검사 수행
  let regionArray: string[] = [];
  if (flowRegions) {
    // flowRegions를 배열로 변환
    regionArray = Array.isArray(flowRegions)
      ? (flowRegions as string[])
      : ([flowRegions] as string[]);

    // 출도착 지역이 있다면 1개에서 4개 사이인지 확인
    if (regionArray.length < 1 || regionArray.length > 4) {
      return res
        .status(400)
        .json({ message: "flowRegions must contain 1 to 4 items." });
    }
  }
  const isGroup = regionArray.length > 1;
  //출도착지역이 없는 경우 전국 기준지역 표출
  if (regionArray.length === 0) regionArray.push(region as string);
  try {
    //화면 ID 기준으로 호출
    //MOP10010
    const options: MopFlowParams = {
      start: start as string,
      end: end as string,
      region: region as string,
      regionArray: regionArray,
      isInflow: isInflow === "true",
    };
    const result = isGroup
      ? await getScreenData(user.userId, "MOP20030", options)
      : regionArray[0] !== region
      ? await getScreenData(user.userId, "MOP20020", options)
      : await getScreenData(user.userId, "MOP20010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//이동목적분석 - 지역비교 분석
export async function getMopPurpose(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions, isInflow, moveCd, includeSame } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];
  const moveCdArray = Array.isArray(moveCd)
    ? moveCd.map(Number) // 숫자로 변환
    : [Number(moveCd)]; // 단일 값도 숫자로 변환
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  if (moveCdArray.length < 1 || moveCdArray.length > 7) {
    return res
      .status(400)
      .json({ message: "moveCd must contain 1 to 7 items." });
  }
  try {
    //화면 ID 기준으로 호출
    const options: MopMoveParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
      isInflow: isInflow === "true",
      moveCdArray: moveCdArray,
      includeSame: includeSame === "true",
      isPurpose: true,
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "MOP30020", options)
      : await getScreenData(user.userId, "MOP30010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//이동목적분석 - 출도착지역
export async function getMopPurposeFlow(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, region, flowRegions, isInflow, moveCd } = req.query;

  // flowRegions가 존재할 경우 유효성 검사 수행
  let regionArray: string[] = [];
  if (flowRegions !== undefined) {
    // flowRegions를 배열로 변환
    regionArray = Array.isArray(flowRegions)
      ? (flowRegions as string[])
      : ([flowRegions] as string[]);

    // 출도착 지역이 있다면 1개에서 4개 사이인지 확인
    if (regionArray.length < 1 || regionArray.length > 4) {
      return res
        .status(400)
        .json({ message: "flowRegions must contain 1 to 4 items." });
    }
  }
  const moveCdArray = Array.isArray(moveCd)
    ? moveCd.map(Number) // 숫자로 변환
    : [Number(moveCd)]; // 단일 값도 숫자로 변환

  if (moveCdArray.length < 1 || moveCdArray.length > 7) {
    return res
      .status(400)
      .json({ message: "moveCd must contain 1 to 7 items." });
  }

  //출도착지역이 전국일 경우 flowRegions 없음
  //전국일 경우 지역비교 분석 단일지역일 경우와 동일 includeSame param 추가
  //화면 ID 기준으로 호출

  //출도착지역이 없는 경우 기준지역 표출
  if (regionArray.length === 0) regionArray.push(region as string);

  const options: MopMoveFlowParams = {
    start: start as string,
    end: end as string,
    region: region as string,
    regionArray: regionArray,
    isInflow: isInflow === "true",
    moveCdArray: moveCdArray,
    isPurpose: true,
    includeSame: true,
  };
  // }
  try {
    //화면 ID 기준으로 호출
    const isGroup = regionArray.length > 1;
    //출도착지 지역 전
    const result =
      flowRegions === undefined
        ? await getScreenData(user.userId, "MOP40010", options)
        : isGroup
        ? await getScreenData(user.userId, "MOP40030", options)
        : await getScreenData(user.userId, "MOP40020", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//이동수단분석 - 지역비교 분석
export async function getMopTrans(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions, isInflow, moveCd, includeSame } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];
  const moveCdArray = Array.isArray(moveCd)
    ? moveCd.map(Number) // 숫자로 변환
    : [Number(moveCd)]; // 단일 값도 숫자로 변환
  // 지역이 1개에서 4개 사이인지 확인
  if (regionArray.length < 1 || regionArray.length > 4) {
    return res
      .status(400)
      .json({ message: "regions must contain 1 to 4 items." });
  }
  if (moveCdArray.length < 1 || moveCdArray.length > 8) {
    return res
      .status(400)
      .json({ message: "moveCd must contain 1 to 8 items." });
  }
  try {
    //화면 ID 기준으로 호출
    const options: MopMoveParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
      isInflow: isInflow === "true",
      moveCdArray: moveCdArray,
      includeSame: includeSame === "true",
      isPurpose: false,
    };
    const isGroup = regionArray.length > 1;
    const result = isGroup
      ? await getScreenData(user.userId, "MOP30020", options)
      : await getScreenData(user.userId, "MOP30010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
//이동수단분석 - 출도착지역
export async function getMopTransFlow(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, region, flowRegions, isInflow, moveCd } = req.query;

  // flowRegions가 존재할 경우 유효성 검사 수행
  let regionArray: string[] = [];
  if (flowRegions) {
    // flowRegions를 배열로 변환
    regionArray = Array.isArray(flowRegions)
      ? (flowRegions as string[])
      : ([flowRegions] as string[]);

    // 출도착 지역이 있다면 1개에서 4개 사이인지 확인
    if (regionArray.length < 1 || regionArray.length > 4) {
      return res
        .status(400)
        .json({ message: "flowRegions must contain 1 to 4 items." });
    }
  }
  const moveCdArray = Array.isArray(moveCd)
    ? moveCd.map(Number) // 숫자로 변환
    : [Number(moveCd)]; // 단일 값도 숫자로 변환

  if (moveCdArray.length < 1 || moveCdArray.length > 8) {
    return res
      .status(400)
      .json({ message: "moveCd must contain 1 to 8 items." });
  }
  //출도착지역이 전국일 경우 flowRegions 없음
  //전국일 경우 지역비교 분석 단일지역일 경우와 동일 includeSame param 추가
  //화면 ID 기준으로 호출

  //출도착지역이 없는 경우 기준지역 표출
  if (regionArray.length === 0) regionArray.push(region as string);

  const options: MopMoveFlowParams = {
    start: start as string,
    end: end as string,
    region: region as string,
    regionArray: regionArray,
    isInflow: isInflow === "true",
    moveCdArray: moveCdArray,
    isPurpose: false,
    includeSame: true,
  };
  try {
    //화면 ID 기준으로 호출
    const isGroup = regionArray.length > 1;
    const result =
      flowRegions === undefined
        ? await getScreenData(user.userId, "MOP40010", options)
        : isGroup
        ? await getScreenData(user.userId, "MOP40030", options)
        : await getScreenData(user.userId, "MOP40020", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}

//지역분석표 - 지역비교
export async function getMopSearch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, regions, includeSame } = req.query;

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
    const options: MopParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
      includeSame: includeSame === "true",
    };
    const result = await getSearchData("MOP10010", options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
//지역분석표 - 출도착
export async function getMopSearchFlow(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, end, region, flowRegions, isInflow } = req.query;

  // flowRegions가 존재할 경우 유효성 검사 수행
  let regionArray: string[] = [];
  if (flowRegions) {
    // flowRegions를 배열로 변환
    regionArray = Array.isArray(flowRegions)
      ? (flowRegions as string[])
      : ([flowRegions] as string[]);

    // 출도착 지역이 있다면 1개에서 4개 사이인지 확인
    if (regionArray.length < 1 || regionArray.length > 4) {
      return res
        .status(400)
        .json({ message: "flowRegions must contain 1 to 4 items." });
    }
  }
  //출도착지역이 없는 경우 전국 기준지역 표출
  if (regionArray.length === 0) regionArray.push(region as string);
  try {
    //화면 ID 기준으로 호출
    const options: MopFlowParams = {
      start: start as string,
      end: end as string,
      region: region as string,
      regionArray: regionArray,
      isInflow: isInflow === "true",
    };
    const result = await getSearchData("MOP10020", options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

//생활이동 랭킹분석
export async function getMopRank(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { start, end, regions, includeSame } = req.query;

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
    const options: MopParams = {
      start: start as string,
      end: end as string,
      regionArray: regionArray as string[],
      includeSame: includeSame === "true",
    };
    const result = await getScreenData(user.userId, "MOP50010", options);

    res
      .status(200)
      .json({ statSummary: result.statSummary, dataGroups: result.dataGroups });
  } catch (error) {
    next(error);
  }
}
export async function getMopRanking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const {
    start,
    end,
    regions,
    isInflow,
    includeSame,
    isPurpose,
    moveCd,
    gender,
    day,
    isGen,
    age,
  } = req.query;

  // regions는 배열로 변환
  const regionArray = Array.isArray(regions) ? regions : [regions];
  const moveCdArray = Array.isArray(moveCd)
    ? moveCd.map(Number) // 숫자로 변환
    : [Number(moveCd)]; // 단일 값도 숫자로 변환

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

  const sexMap: { [key: string]: string } = {
    "0": "MALE",
    "1": "FEML",
  };
  const sexArray = Array.isArray(gender)
    ? (gender as string[]).map((sex) => sexMap[sex])
    : [sexMap[gender as string]];

  const options: MopRankParams = {
    start: start as string,
    end: end as string,
    regionArray: regionArray as string[],
    isInflow: isInflow === "true",
    includeSame: includeSame === "true",
    isPurpose: isPurpose === "true",
    moveCdArray: moveCdArray,
    sexArray: sexArray,
    dayArray,
    isGen: isGen === "true",
    ageArray: ageArray as string[],
  };
  try {
    const result = await getRankingData("MOP50020", options);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
