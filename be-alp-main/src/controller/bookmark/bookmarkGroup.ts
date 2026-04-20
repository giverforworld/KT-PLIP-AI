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
import * as bookmarkGroupService from "@/service/bookmark/bookmarkGroup";
import { AuthenticatedRequest, verifyToken } from "@/helpers/token";

export async function getAllBookmarks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  // const holidays = req.body;
  // if (!holidays) {
  //   return res.status(400).json({ message: "Missing data" });
  // }
  // try {
  //   await bookmarkGroupService.updateHolidays(holidays);
  //   res.status(200).send("Holiday added successfully");
  // } catch (error) {
  //   console.error("Failed to add holiday:", (error as Error).message);
  //   res.status(500).json({
  //     message: "Error adding holiday",
  //     error: (error as Error).message,
  //   });
  // }
}

export async function getBookmarkGroupList(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }

  try {
    const data = await bookmarkGroupService.getBookmarkGroupList(user.userId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function createBookmarkGroup(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const group = req.body;
  if (!group) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    await bookmarkGroupService.createBookmarkGroup(user.userId, group);
    res.status(200).send("Create Group successfully");
  } catch (error) {
    console.error("Failed to add Group:", (error as Error).message);
    res.status(500).json({
      message: "Error adding Group",
      error: (error as Error).message,
    });
  }
}

export async function updateBookmarkGroup(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }
  const group = req.body;
  if (!group) {
    return res.status(400).json({ message: "Missing data" });
  }
  try {
    await bookmarkGroupService.updateBookmarkGroup(user.userId, group);
    res.status(200).send("Update Group successfully");
  } catch (error) {
    console.error("Failed to update Group:", (error as Error).message);
    res.status(500).json({
      message: "Error update Group",
      error: (error as Error).message,
    });
  }
}

export async function deleteBookmarkGroup(
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
    await bookmarkGroupService.deleteBookmarkGroup(
      user.userId,
      groupId as string
    );
    res.status(200).send("Delete Group successfully");
  } catch (error) {
    console.error("Failed to delete Group:", (error as Error).message);
    res.status(500).json({
      message: "Error delete Group",
      error: (error as Error).message,
    });
  }
}
