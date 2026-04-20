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
import { basePath } from "@/constants/path";

/**
 * 생활인구, 체류인구, 생활이동 지표 데이터
 */
export const getSearchResult = async (
	searchQueryParams: SearchQueryParams,
	pageName: string,
	subPageName: string,
): Promise<SearchResult | undefined> => {
	// 생활이동 출도착지분석
	const flow = searchQueryParams.isFlow ? `&isFlow=${searchQueryParams.isFlow}` : "";

	const { data } = await axios.post(
		`${basePath}/api/data?pageName=${pageName}&subPageName=${subPageName}${flow}`,
		{ ...searchQueryParams, isFlow: undefined },
	);
	if (data.ok) return data.result;
};

/**
 * 지역분석표
 */
export const getSearchSummary = async (
	searchQueryParams: SearchQueryParams,
	pageName: string,
): Promise<SearchSummary[] | undefined> => {
	// 생활이동 출도착지분석
	const flow = searchQueryParams.isFlow ? `&isFlow=${searchQueryParams.isFlow}` : "";

	const { data } = await axios.post(
		`${basePath}/api/search?pageName=${pageName}${flow}`,
		searchQueryParams,
	);
	if (data.ok) return data.result;
};

/**
 * 지역랭킹
 */
export const getRanking = async (
	searchQueryParams: SearchQueryParams,
	pageName: string,
): Promise<DataContainer | undefined> => {
	const { data } = await axios.post(
		`${basePath}/api/ranking?pageName=${pageName}`,
		searchQueryParams,
	);
	if (data.ok) return data.result;
};

/**
 * 대시보드
 */
export const getDashboards = async (start: string): Promise<DashboardResult | undefined> => {
	try {
		const { data: info } = await axios.get(`${basePath}/api/dashboards/info?start=${start}`);
		const { data: chart } = await axios.get(`${basePath}/api/dashboards/chart?start=${start}`);

		if (info.ok && chart.ok) {
			return {
				info: info.result,
				data: chart.result,
			};
		}
	} catch (error) {
		// console.log(error);
	}
};

/**
 * 지역 분석 리포트
 */
export const getReport = async (
	start: string,
	region: string,
): Promise<ReportResult | undefined> => {
	const { data } = await axios.get(
		`${basePath}/api/dashboards/report?start=${start}&region=${region}`,
	);
	if (data.ok) return data.result;
};

/**
 * 지역별 대시보드
 */
export const getRegionalDashboard = async (
	start: string,
	region: string,
): Promise<RegDasChartData | undefined> => {
	const { data } = await axios.get(
		`${basePath}/api/regional-dashboard?start=${start}&region=${region}`,
	);
	if (data.ok) return data.result;
};

/**
 * 북마크 폴더 리스트
 */
export const getBookmarkGroupList = async (): Promise<BookmarkGroupList | undefined> => {
	const { data } = await axios.get(`${basePath}/api/bookmark-group`);
	if (data.ok) return data.result;
};

/**
 * 북마크 폴더 개별
 */
export const getBookmarkGroupById = async (groupId: string): Promise<BookmarkData | undefined> => {
	const { data } = await axios.get(`${basePath}/api/bookmark/${groupId}`);
	if (data.ok) return data.result;
};

/**
 * GIS 시계열
 */
export const getGisTimeSeries = async (id: string): Promise<SearchResult | undefined> => {
	const { data } = await axios.get(`${basePath}/api/gis/data?id=${id}`);
	if (data.ok) return data.result;
};

/**
 * DataInfo(min Date, max Date)
 */
export const getDataInfo = async () => {
	const data = await axios.get(`${basePath}/api/datainfo`);
	if (data) return data;
}