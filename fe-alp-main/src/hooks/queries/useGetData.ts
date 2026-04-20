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

import { useQuery } from "@tanstack/react-query";
import {
	getSearchResult,
	getSearchSummary,
	getRanking,
	getDashboards,
	getReport,
	getRegionalDashboard,
	getBookmarkGroupList,
	getBookmarkGroupById,
	getGisTimeSeries,
	getDataInfo,
} from "@/services/getData";
import { extractPageInfo, isSearchQueryEnabled } from "@/utils/validate";
import { basePath } from "@/constants/path";
import _ from "lodash";

/**
 * @returns {useQuery}
 */

export default function useGetData() {
	/**
	 * 생활인구, 체류인구, 생활이동 지표 데이터
	 */
	const useSearchResultQuery = (queryState: QueryState) => {
		const { searchQueryParams, pathname } = queryState;
		const { pageName, subPageName } = extractPageInfo(pathname);

		const enabled =
			!!pageName && !!subPageName && isSearchQueryEnabled(searchQueryParams, pageName, subPageName);

		return useQuery({
			queryKey: ["searchResult", searchQueryParams, pathname],
			queryFn: () => getSearchResult(searchQueryParams, pageName, subPageName || ""),
			enabled,
		});
	};

	/**
	 * 지역분석표
	 */
	const useSearchSummaryQuery = (queryState: QueryState) => {
		const { searchQueryParams, pathname } = queryState;
		const { pageName, subPageName } = extractPageInfo(pathname);

		const enabled = !!pageName && isSearchQueryEnabled(searchQueryParams, pageName, subPageName);
		return useQuery({
			queryKey: ["searchSummary", searchQueryParams, pageName],
			queryFn: () => getSearchSummary(searchQueryParams, pageName),
			enabled,
		});
	};

	/**
	 * 지역랭킹
	 */
	const useRankingQuery = (searchQueryParams: SearchQueryParams, pageName: string) => {
		return useQuery({
			queryKey: ["rankAnalysis", searchQueryParams, pageName],
			queryFn: () => getRanking(searchQueryParams, pageName),
			enabled: !_.isEmpty(searchQueryParams) && searchQueryParams.regions[0].length > 1,
		});
	};

	/**
	 * 대시보드
	 */
	const useDashboardsQuery = (start: string) => {
		return useQuery({
			queryKey: ["dashboards", start],
			queryFn: () => getDashboards(start),
		});
	};

	/**
	 * 지역 분석 리포트
	 */
	const useReportQuery = (start: string, region: string) => {
		return useQuery({
			queryKey: ["report", start, region],
			queryFn: () => getReport(start, region),
		});
	};

	/**
	 * 지역별 대시보드
	 */
	const useRegionalDashboardQuery = (start: string, region: string) => {
		return useQuery({
			queryKey: ["regionalDashboard", start, region],
			queryFn: () => getRegionalDashboard(start, region),
			enabled: !!region,
		});
	};
	// TO_BE_CHECKED
	const useGeometry = (name: string) =>
		useQuery({
			queryKey: ["geometry", name],
			queryFn: () =>
				fetch(`${basePath}/api/gis/map?name=${name}`)
					.then((res) => res.json())
					.then((json) => {
						return json.result;
					}),
		});

	/**
	 * 북마크 폴더 리스트
	 */
	const useBookmarkGroupListQuery = () => {
		return useQuery({
			queryKey: ["bookmarkGroupList"],
			queryFn: () => getBookmarkGroupList(),
		});
	};

	/**
	 * 북마크 폴더 개별
	 */
	const useBookmarkGroupQueryById = (userId: string, groupId: string) => {
		return useQuery({
			queryKey: ["bookmarkGroupData", groupId],
			queryFn: () => getBookmarkGroupById(groupId),
			enabled: !!userId && !!groupId,
		});
	};

	/**
	 * GIS 시계열
	 */
	const useGisTimeSeriesQuery = (id: string) => {
		return useQuery({
			queryKey: ["gisTimeSeries", id],
			queryFn: () => getGisTimeSeries(id),
		});
	};

	/**
	 * DataInfo
	 */
	const useDataInfoQuery = () => {
		return useQuery({
			queryKey: ["dateRangeAtom"],
			queryFn: () => getDataInfo(),
		});
	};

	return {
		useSearchResultQuery,
		useSearchSummaryQuery,
		useRankingQuery,
		useDashboardsQuery,
		useReportQuery,
		useRegionalDashboardQuery,
		useGeometry, // TO_BE_CHECKED
		useBookmarkGroupListQuery,
		useBookmarkGroupQueryById,
		useGisTimeSeriesQuery,
		useDataInfoQuery,
	};
}
