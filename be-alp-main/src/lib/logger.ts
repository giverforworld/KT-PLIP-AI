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

import fs from "fs";
import path from "path";
import winston from "winston";

const logDir = "logs";
const { combine, timestamp, printf } = winston.format;

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
if (!fs.existsSync(`${logDir}/error`)) fs.mkdirSync(`${logDir}/error`);

const logFormat = printf((info) => {
  const { timestamp, level, message, ...rest } = info;
  return `${timestamp} ${level}: ${message} ${
    Object.keys(rest).length ? JSON.stringify(rest) : ""
  }`;
});

const getLogFileName = (level: string) => {
  const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  return path.join(
    logDir,
    level === "error" ? "error" : "",
    `${date}.${level}.log`
  );
};

// Logger 설정
const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat
  ),
  level: "info",
  transports: [
    new winston.transports.File({
      level: "info",
      filename: getLogFileName("info"),
    }),
    // Error level log
    new winston.transports.File({
      level: "error",
      filename: getLogFileName("error"),
    }),
  ],
});

export default logger;
