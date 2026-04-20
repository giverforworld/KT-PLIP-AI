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

import axios from "axios";
import { logger } from "./logger";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/services/server/session";
import { serverUrl } from "@/constants/path";

const BASE_URL = serverUrl;
const apiClient = axios.create({
	baseURL: BASE_URL, // 기본 URL 설정
	withCredentials: true,
});
const safeJSONStringify = (value: any) => {
	return JSON.stringify(value, (key, val) => {
		if (typeof val === "string") {
			return val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS 방지
		}
		return val;
	});
};
// 요청 인터셉터
apiClient.interceptors.request.use(
	async (config) => {
		const { method, url } = config;
		// 쿼리 파라미터 타입 정의
		type QueryParams = Record<string, string | string[]>;

		const getQueryParams = (url: string): QueryParams => {
			// URL 객체 생성
			const parsedUrl = new URL(url, BASE_URL);

			// URLSearchParams를 이용해 쿼리 파라미터 추출
			const params = new URLSearchParams(parsedUrl.search);

			// 파라미터를 객체로 변환
			const queryParams: QueryParams = {};
			params.forEach((value, key) => {
				if (queryParams[key]) {
					// 동일 키가 여러 번 등장하면 배열로 처리
					queryParams[key] = Array.isArray(queryParams[key])
						? [...queryParams[key], value]
						: [queryParams[key], value];
				} else {
					queryParams[key] = value;
				}
			});

			return queryParams;
		};

		logger.info({
			message: "[REQUEST]",
			method: method?.toUpperCase(),
			url: url,
			params: getQueryParams(url ?? ""),
		});

		//access-token Authorization 헤더에 추가
		const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
		const accessToken = session?.accessToken;
		if (accessToken) {
			config.headers["Authorization"] = `Bearer ${accessToken}`;
		}

		return config;
	},
	(error) => {
		logger.error({
			message: "[REQUEST ERROR]",
			error: error.message,
			config: error.config || {},
		});
		return Promise.reject(error);
	},
);

// 응답 인터셉터
apiClient.interceptors.response.use(
	(response) => {
		let dataToLog = response.data;
		if (safeJSONStringify(response.data).length > 500) {
			dataToLog = safeJSONStringify(response.data).slice(0, 500);
		}

		logger.info({
			message: "[RESPONSE]",
			status: response.status,
			method: response.config.method?.toUpperCase(),
			url: response.config.url,
			data: dataToLog,
		});

		return response;
	},
	(error) => {
		logger.error({
			message: "[RESPONSE ERROR]",
			status: error.response?.status,
			url: error.config?.url,
			error: error.message,
			data: error.response?.data || null,
		});
		return Promise.reject(error);
	},
);

export default apiClient;
