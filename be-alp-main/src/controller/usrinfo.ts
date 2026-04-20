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
import * as usrinfoService from "@/service/usrinfo";

function maskIP(ip: string | undefined | null): string {
  if (!ip) {
    return ip || "";
  }

  if (ip.startsWith("::")) {
    return "6.***.***.6";
  }

  // 테스트 계정 표시 IP 전환
  if (ip === "1" || ip === "::1" || ip === "127.0.0.1") {
    ip = "10.123.123.10";
  }

  const segments = ip.split(".");
  if (segments.length === 4) {
    segments[1] = "***";
    segments[2] = "***";
    return segments.join(".")
  }
  return ip;
}

export async function getInfo(
    req: Request,
    res: Response,
  ): Promise<void> {
    
    try {
      const logData = req.body;

      if (!logData || !logData.PATH || !logData.USER) {
        res.status(400).json({
          message: "Invalid log data"
        });
        return;
      }
      logData.IP = maskIP(logData.IP);
      try {
        await usrinfoService.usrinfoLoadToOpenSearch(logData);
        res.status(200).json({
          message: "userInfo Data received successfully"
        });
        return
      } catch (error) {
        console.error("Failed to add userinfo:", (error as Error).message)
        res.status(500).json({
          message: "Error loading userinfo",
          error: (error as Error).message
        });
        return
      }
      
    } catch (error) {
      res.status(500).json({
        message: "Internal server error"
      });
      return;
    }
  }