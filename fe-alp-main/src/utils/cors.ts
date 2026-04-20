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

const allowedfullAccessDomains = (process.env.NEXT_PUBLIC_ALLOW_FULL_URL || "").split(",");

const allowedDefaultAccessDomains = (process.env.NEXT_PUBLIC_ALLOW_DEFAULT_URL || "").split(",");

export const getCorsConfig = (origin: string): Record<string, string> | null => {
	const defaultConfig = { methods: "GET, POST, OPTIONS", credentials: String(true) };
	const fullAccessConfig = {
		methods: "GET, POST, PUT, DELETE, OPTIONS",
		credentials: String(true),
	};
	if (allowedDefaultAccessDomains.includes(origin)) {
		return defaultConfig;
	}

	if (allowedfullAccessDomains.includes(origin)) {
		return fullAccessConfig;
	}

	// 환경 변수에서 설정된 도메인과 요청된 도메인(origin) 비교
	// if (origin === domain) {
	// 	return fullAccessConfig;
	// }

	return null;
};
