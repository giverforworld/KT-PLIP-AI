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

import { searchWithLogging } from "@/lib/searchWithLogiging";
import { getRegionInfo } from "@/utils/regionInfoCache";
import { getLastUpdated, loadExistingIndices } from "@/helpers/getIndexList"
import { Request, Response, NextFunction } from "express";

export async function updateIndexList(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    await loadExistingIndices();
    res.status(200).json({
      message: "Index cache successfully updated",
      updatedAt: new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul", hour12: false, }),
    });
  } catch (error) {
    console.error("Failed to update index cache:", error);
    res.status(500).json({
      message: "Failed to update index cache",
      error: error instanceof Error ? error.message : error,
    });
  }
}

export async function checkIndexList(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { lastUpdated, indices } = getLastUpdated();
    // const timestamp = getLastUpdated();
    // const indices = Array.from(indexCache)
    res.status(200).json({
      lastUpdated: new Date(lastUpdated).toLocaleString("ko-KR", {timeZone: "Asia/Seoul", hour12: false, }),
      indices
    });
  } catch (error) {
    console.error("Failed to get last updated time:", error);
    res.status(500).json({
      message: "Failed to get last updated time",
      error: error instanceof Error ? error.message : error
    })
  }
}