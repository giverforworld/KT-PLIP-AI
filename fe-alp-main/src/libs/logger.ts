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

const logDir = "logs"; // logs 디렉토리 하위에 로그 파일 저장
const { combine, timestamp, printf } = winston.format;

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
if (!fs.existsSync(`${logDir}/error`)) fs.mkdirSync(`${logDir}/error`);

const logFormat = printf((info) => {
	const { timestamp, level, message, ...rest } = info;
	return `{\n\ttimestamp: ${timestamp}\n\tlevel: ${level}\n\tstatus: ${message}\n\tresult: ${Object.keys(rest).length ? JSON.stringify(rest) : ""}\n}`;
});

const getLogFileName = (level: string) => {
	const date = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
	return path.join(logDir, level === "error" ? "error" : "", `${date}.${level}.log`);
};

const logger = winston.createLogger({
	format: combine(
		timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		logFormat,
	),
	transports: [
		new winston.transports.File({
			level: "info",
			filename: getLogFileName("info"),
		}),
		new winston.transports.File({
			level: "error",
			filename: getLogFileName("error"),
		}),
	],
});

// Production 환경이 아닌 경우(dev 등)
// if (process.env.NODE_ENV !== "production") {
// 	logger.add(
// 		new winston.transports.Console({
// 			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
// 		}),
// 	);
// }

// Export logger
export { logger };
