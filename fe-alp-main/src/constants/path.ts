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

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL!;
export const bdipUrl = process.env.NEXT_PUBLIC_MAIN_URL;

export const serverUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL;
export const prometheusUrl = process.env.NEXT_PUBLIC_PROMETHEUS_URL;

export const PATHS = {
	DAS: "dashboard", // 종합현황분석 대시보드
	REG_DAS: "regional-dashboard", // 지역별 대시보드
	BOOKMARK: "bookmark", // 북마크
	GIS: "gis", // GIS
	MOP: "mop", // 생활이동
	ALP: "alp", // 생활인구
	LLP: "llp", // 체류인구

	// subPaths
	STATUS: "status", // 현황
	RANK_ANALYSIS: "rank-analysis", // 랭킹분석
	PURPOSE: "purpose", // 이동목적분석
	TRANS: "trans", // 이동수단분석
	PATTERN: "pattern", // 패턴분석
	COMP_ANALYSIS: "comparative-analysis", // 주민생활비교분석
	TRAITS: "traits", // 특성

	// redirect client
	LOGIN: "redirect-login", // bdip login
	// error page
	AUTH: "unauthorized",
};

export const getFullPath = (page: string, subpage: string) => {
	return `/${page}/${subpage}`;
};
