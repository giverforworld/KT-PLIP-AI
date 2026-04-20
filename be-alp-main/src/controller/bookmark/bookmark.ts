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
import * as bookmarkService from "@/service/bookmark/bookmark";
import { AuthenticatedRequest } from "@/helpers/token";

export async function createBookmark(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const bookmarkData = req.body;

  if (!bookmarkData) {
    return res.status(400).json({ message: "Missing data" });
  }

  const options = formaterOptions(bookmarkData);
  const formatedBookmarkData = { ...bookmarkData, options };

  try {
    await bookmarkService.createBookmark(user.userId, formatedBookmarkData);
    res.status(200).send("Create bookmark successfully");
  } catch (error) {
    console.error("Failed to add bookmark:", (error as Error).message);
    res.status(500).json({
      message: "Error adding bookmark",
      error: (error as Error).message,
    });
  }
}

export async function deleteBookmark(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const body = req.body;

  if (!body) {
    return res.status(400).json({ message: "Missing data" });
  }

  const options = formaterOptions(body.bookmarkData);
  const formatedBookmarkData = { ...body.bookmarkData, options };

  try {
    await bookmarkService.deleteBookmark(
      user.userId,
      formatedBookmarkData,
      body.bookmarkGroupList
    );
    res.status(200).send("Delete bookmark successfully");
  } catch (error) {
    console.error("Failed to delete bookmark:", (error as Error).message);
    res.status(500).json({
      message: "Error delete bookmark",
      error: (error as Error).message,
    });
  }
}

export async function moveBookmark(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const body = req.body;

  if (!body) {
    return res.status(400).json({ message: "Missing data" });
  }
  // 북마크 페이지일 경우에는 data에 있는 page, subPage, options 값으로 대체
  let formatedBookmarkData: BookmarkParams;
  if (body.bookmarkData.page === "bookmark") {
    const chartData = body.bookmarkData.data;
    formatedBookmarkData = {
      ...body.bookmarkData,
      page: chartData.page,
      subPage: chartData.subPage,
      options: chartData.options,
    };
  } else {
    const options = formaterOptions(body.bookmarkData);
    formatedBookmarkData = { ...body.bookmarkData, options };
  }

  try {
    await bookmarkService.moveBookmark(
      user.userId,
      formatedBookmarkData,
      body.checkedGroupIds,
      body.bookmarkGroupList
    );
    res.status(200).send("Move bookmark successfully");
  } catch (error) {
    console.error("Failed to move bookmark:", (error as Error).message);
    res.status(500).json({
      message: "Error delete bookmark",
      error: (error as Error).message,
    });
  }
}

export async function getBookmarkDataByGroupId(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ message: "groupId is required." });
  }

  try {
    const data = await bookmarkService.getBookmarkDataByGroupId(
      user.userId,
      groupId as string
    );
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

function formaterOptions(bookmarkData: BookmarkParams) {
  const options: Record<string, any> = bookmarkData.options;
  let formated: Record<string, any> = {
    start: options.start,
    end: options.end,
  };
  // regions는 배열로 변환
  if ("regions" in options) {
    const regionArray = Array.isArray(options.regions)
      ? options.regions
      : [options.regions];
    formated = { ...formated, regionArray };
  }

  //출도착 지역일 경우
  if ("flowRegions" in options) {
    const regionArray = Array.isArray(options.flowRegions)
      ? options.flowRegions
      : [options.flowRegions];
    if (regionArray.length === 0) regionArray.push(options.region);
    formated = { ...formated, regionArray };
  }
  if ("region" in options) {
    formated = { ...formated, region: options.region };
  }

  if ("moveCd" in options) {
    const moveCdArray = Array.isArray(options.moveCd)
      ? options.moveCd.map(Number) // 숫자로 변환
      : [Number(options.moveCd)]; // 단일 값도 숫자로 변환

    formated = { ...formated, moveCdArray };
  }
  if ("includeSame" in options) {
    formated = { ...formated, includeSame: options.includeSame };
  }
  if ("isInflow" in options) {
    formated = { ...formated, isInflow: options.isInflow };
  }

  // 생활이동의 이동목적 or 이동수단일 경우 추가
  if (bookmarkData.subPage === "purpose" || bookmarkData.subPage === "trans") {
    formated = { ...formated, isPurpose: bookmarkData.subPage === "purpose" };
  }
  return formated;
}
