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
import jwt from "jsonwebtoken";
/**
 * 토큰 검증
 * @param token string
 * @param secret string
 */
export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}
export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(403).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Token format is incorrect" });
  }

  try {
    const decoded = jwt.decode(token) as { userid: string };
    req.user = { userId: decoded.userid };
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }

  //TEST
  // req.user = { userId: "test" };
  // next();
};

