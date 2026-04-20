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

// 검색 필터
type DateSelectorType = "월별" | "기간별";
type SearchFilterState = {
	// 공통
	dateSelector: DateSelectorType; // 기간조회 선택
	selectedDate: Date; // 월
	selectedRange: { startDate: Date; endDate: Date }; // 기간
	displayRegions: Region[]; // 지역 (생활이동 - 기준지역)
	// 생활이동
	routeDisplayRegions: Region[]; // 지역 (생활이동 - 출도착지)
	includeSame: boolean; // 동일 지역 내 이동표출
	isFlow: boolean; // true: 출도착지분석, false: 지역비교분석
	isInflowRca: boolean; // 유입 or 유출 (지역비교분석 - 이동목적,이동수단)
	isInflowRaa: boolean; // 유입 or 유출 (출도착지분석)
	purpose: number[];
	trans: number[];
};

type SearchFilterStoreState = {
	dateSelector: DateSelectorType;
	selectedDate: Date;
	selectedRange: { startDate: Date; endDate: Date };
	regions: Region[];

	flowRegions: Region[];

	includeSame: boolean;
	isFlow: boolean | undefined;
	isInflowRca: boolean;

	isInflowRaa: boolean;

	purpose: number[];
	trans: number[];
};
// 생활인구, 체류인구 Filter적용값
type SearchFilter = {
	dateSelector: DateSelectorType;
	selectedDate: Date;
	selectedRange: { startDate: Date; endDate: Date };
	regions: Region[];
};

// 생활이동 - 지역비교분석 Filter적용값
type MopSearchFilter = SearchFilter & {
	isFlow: boolean | undefined;
	includeSame: boolean;
	isInflowRca: boolean;
	purpose: number[];
	trans: number[];
};

// 생활이동 - 출도착지분석 Filter적용값
type MopFlowSearchFilter = SearchFilter & {
	isFlow: boolean | undefined;
	isInflowRaa: boolean;
	flowRegions: Region[];
	purpose: number[];
	trans: number[];
};

type MopAnalysis = {
	mopRca: boolean; // 지역비교분석
	mopRaa: boolean; // 출도착지분석
};

// Request
type SearchQueryParams = Record<string, any>;
type CommonSearchQueryParams = {
	start: string;
	end: string;
	regions: string[];
};
type MopSearchQueryParams = CommonSearchQueryParams & {
	includeSame: boolean; // 동일 지역 내 이동표출
	isInflow?: boolean; // 유입 or 유출
	moveCd?: number[]; // purpose, trans
};
type MopFlowSearchQueryParams = {
	isFlow?: boolean; // BE params에는 포함되지 않음
	start: string;
	end: string;
	region: string; // 기준지역코드
	isInflow: boolean; // 유입 or 유출
	flowRegions?: string[]; // 출도착지역 (전국일 경우 X)
	moveCd?: number[]; // purpose, trans
};
type QueryState = {
	searchQueryParams: SearchQueryParams;
	pathname: string;
};

// Response
type SearchResult = {
	statSummary: StatSummary[];
	dataGroups: DataGroup[];
};

// 지역분석표
type SearchSummary = {
	title: string;
	data: {
		regionName: string;
		value: string | number | { Avg: string | number; Unique: string | number };
	}[];
	type?: string;
	unit?: string;
};

// 통계요약
type StatSummary = {
	regionName: string;
	data: string[] | DataSummaryArray;
};

// 지표 데이터
type DataGroup = {
	title: string;
	data: DataContainer[];
};
type DataContainer = {
	id?: string;
	title: string;
	summary?: string | string[] | DataSummary | DataSummaryArray;
	charts: ChartData[];
	isBookmarked?: boolean;
	dataId?: string;
	bookmarkedGroupIds?: string[];
	page?: string;
	subPage?: string;
	options?: CommonSearchQueryParams | MopSearchQueryParams | MopFlowSearchQueryParams;
	_id?: string;
};
type DataSummaryKeys = "Avg" | "Unique";
type DataSummary = Record<DataSummaryKeys, string>;
type DataSummaryArray = Record<DataSummaryKeys, string[]>;
