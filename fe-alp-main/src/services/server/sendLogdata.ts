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

import { NextRequest } from "next/server";
import { prometheusUrl } from "@/constants/path";
import { serverUrl } from "@/constants/path";

const safeJSONStringify = (value: any) => {
	return JSON.stringify(value, (key, val) => {
		if (typeof val === "string") {
			return val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS 방지
		}
		return val;
	});
};

export async function sendLogData(request: NextRequest, user: any) {
	const url = new URL(request.url);
	const ip =
		request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
		request.headers.get("X-Real-IP")?.trim() ||
		request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
		request.headers.get("x-real-ip")?.trim(); ;

	let content = {};
	if (request.method === "POST") {
		content = await request.json();
		console.log("API POST request content:", content);
	}

	const cleanIP = ip?.replace(/^.*:/, ""); // IPv6 매핑 접두사 제거
	const logData = {
		url: request.url,
		ip: cleanIP,
		path: url.pathname,
		user: user || "guest",
		content,
	};

	// Prometheus Pushgateway로 메트릭 전송
	const metricsPayload = `
page_loads_alp{path="${logData.path}",user="${logData.user}", timestamp="${Date.now()}"} 1
`;

	try {
		// await fetch(`${prometheusUrl}`, {
		await fetch(`http://pushgateway.monitoring.svc.cluster.local:9091/metrics/job/pushgateway`, {
			method: "POST",
			headers: {
				"Content-Type": "text/plain",
			},
			body: metricsPayload,
		});
		console.log("Metrics sent successfully to Prometheus Pushgateway");
	} catch (error) {
		console.error("Failed to send metrics to Prometheus Pushgateway:", error);
	}
}

export async function sendLogDataToBE(request: NextRequest, user: any) {
	const url = new URL(request.url);
	const ip =
		request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
		request.headers.get("X-Real-IP")?.trim() ||
		request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
		request.headers.get("x-real-ip")?.trim();

	const timestamp = Date.now();
	const current = new Date(timestamp);
	const BASE_YMD = current
		.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
		.replace(/\.\s?/g, "");
	const cleanIP = ip?.replace(/^.*:/, "");

	const logData = {
		URL: request.url,
		PATH: url.pathname,
		USER: user || "guest",
		IP: cleanIP,
		BASE_TMST: Date.now(),
		BASE_YMD: BASE_YMD,
	};

	try {
		// await fetch(`${prometheusUrl}`, {
		// await fetch(`http://plip-stg.bigsight.kt.com/be-alp/usrinfo/get`, {
		// await fetch(`http://localhost:3000/usrinfo/get`, {
		await fetch(`${serverUrl}/usrinfo/get`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: safeJSONStringify(logData),
		});
		console.log("Metrics sent successfully to BackEnd");
	} catch (error) {
		console.error("Failed to send metrics to BackEnd:", error);
	}
}
