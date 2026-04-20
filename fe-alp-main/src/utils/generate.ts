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

import _ from "lodash";
import {
	patternFilter,
	genderFilter,
	weekdayFilter,
	agePerTenFilter,
	purposeFilter,
} from "@/constants/filter";
import { PATHS } from "@/constants/path";
import { dateFormat } from "@/utils/date";
import { getRegionCodes } from "@/utils/query";
import { extractPageInfo } from "@/utils/validate";

/**
 * 고유 식별자 생성
 * @returns 고유 식별자 문자열
 */
export const generateUniqueId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

/**
 * SearchResultQuery, SearchSummaryQuery params 생성
 * 검색 필터 공통
 * @param searchFilter SearchFilter
 * @returns CommonSearchQueryParams
 */
export function generateSearchQueryParams(searchFilter: SearchFilter): CommonSearchQueryParams {
	const { dateSelector, selectedDate, selectedRange, regions: searchFilterRegions } = searchFilter;
	const regionCodes = getRegionCodes(searchFilterRegions);

	const start =
		dateSelector === "월별"
			? dateFormat(selectedDate, "yyyyMM")
			: dateFormat(selectedRange.startDate, "yyyyMMdd");
	const end =
		dateSelector === "월별"
			? dateFormat(selectedDate, "yyyyMM")
			: dateFormat(selectedRange.endDate, "yyyyMMdd");
	const regions = regionCodes;

	return { start, end, regions };
}

/**
 * SearchResultQuery, SearchSummaryQuery params 생성
 * 생활이동 - 지역비교분석
 * @param searchFilter MopSearchFilter
 * @returns MopSearchQueryParams
 */
export function generateMopSearchQueryParams(
	searchFilter: MopSearchFilter,
	pathname: string,
): MopSearchQueryParams {
	const searchQueryParams = generateSearchQueryParams(searchFilter);
	const { start, end, regions } = searchQueryParams;
	const { includeSame, purpose, trans, isInflowRca } = searchFilter;

	const { subPageName } = extractPageInfo(pathname);

	const baseParams: MopSearchQueryParams = {
		start,
		end,
		regions,
		includeSame,
		isInflow:
			subPageName === PATHS.PURPOSE || subPageName === PATHS.TRANS ? isInflowRca : undefined,
	};
	const moveCodeParams = getMoveCodeParams(pathname, purpose, trans);

	return { ...baseParams, ...moveCodeParams };
}

/**
 * SearchResultQuery, SearchSummaryQuery params 생성
 * 생활이동 - 출도착지분석
 * @param searchFilter MopFlowSearchFilter
 * @returns MopFlowSearchQueryParams
 */
export function generateMopFlowSearchQueryParams(
	searchFilter: MopFlowSearchFilter,
	pathname: string,
): MopFlowSearchQueryParams {
	const searchQueryParams = generateSearchQueryParams(searchFilter);
	const { start, end, regions } = searchQueryParams;
	const { isFlow, isInflowRaa, flowRegions, purpose, trans } = searchFilter;
	const flowRegionsCodes = getRegionCodes(flowRegions);

	const baseParams: MopFlowSearchQueryParams = {
		isFlow,
		start,
		end,
		region: regions[0],
		isInflow: isInflowRaa,
		flowRegions: flowRegionsCodes.includes("") ? undefined : flowRegionsCodes,
	};
	const moveCodeParams = getMoveCodeParams(pathname, purpose, trans);

	return { ...baseParams, ...moveCodeParams };
}

/**
 * 생활이동 목적 / 수단 params
 * @param pathname
 * @returns
 */
function getMoveCodeParams(
	pathname: string | undefined,
	purpose?: number[],
	trans?: number[],
): Partial<MopSearchQueryParams> {
	if (!pathname) return {};

	const { pageName, subPageName } = extractPageInfo(pathname);

	if (pageName === PATHS.MOP) {
		if (subPageName === PATHS.PURPOSE) return { moveCd: purpose };
		if (subPageName === PATHS.TRANS) return { moveCd: trans };
	}

	return {};
}

/**
 * RankAnalysisQuery params 생성 - 생활인구, 체류인구
 * @param
 * @returns SearchQueryParams
 */
export function generateRankingQueryParams(
	searchFilter: SearchFilter,
	selectedFilters: { [key: string]: number[] },
	activeToggle: RankFilterToggle,
	pageName: string,
): SearchQueryParams {
	const initailAlpRankFilter = {
		patterns: patternFilter.labels.map((label) => label.value),
		gender: genderFilter.labels.map((label) => label.value),
		day: weekdayFilter.labels.map((label) => label.value),
		age: agePerTenFilter.labels.map((label) => label.value),
		isGen: true,
	};

	const initailLlpRankFilter = {
		gender: genderFilter.labels.map((label) => label.value),
		age: agePerTenFilter.labels.map((label) => label.value),
		isGen: true,
	};

	const searchQueryParams = generateSearchQueryParams(searchFilter);
	const { start, end, regions } = searchQueryParams;

	const patterns = selectedFilters.patterns;
	const gender = selectedFilters.gender;
	const day = activeToggle.date === "요일선택" ? selectedFilters.weekday : selectedFilters.weekend;
	const isGen = activeToggle.age === "10세 단위";
	const age =
		activeToggle.age === "10세 단위" ? selectedFilters.agePerTen : selectedFilters.agePerFive;

	if (!_.isEmpty(selectedFilters)) {
		return pageName === "alp"
			? { start, end, regions, patterns, gender, day, isGen, age }
			: { start, end, regions, gender, isGen, age };
	} else {
		return pageName === "alp"
			? { start, end, regions, ...initailAlpRankFilter }
			: { start, end, regions, ...initailLlpRankFilter };
	}
}

/**
 * RankAnalysisQuery params 생성 - 생활이동
 * @param
 * @returns SearchQueryParams
 */
export function generateMopRankingQueryParams(
	searchFilter: MopSearchFilter,
	selectedFilters: { [key: string]: number[] },
	activeToggle: RankFilterToggle,
): SearchQueryParams {
	const initailRankFilter = {
		moveCd: purposeFilter.labels.map((label) => label.value),
		gender: genderFilter.labels.map((label) => label.value),
		day: weekdayFilter.labels.map((label) => label.value),
		age: agePerTenFilter.labels.map((label) => label.value),
		isGen: true,
	};

	const searchQueryParams = generateSearchQueryParams(searchFilter);
	const { start, end, regions } = searchQueryParams;
	const { includeSame, isInflowRca: isInflow } = searchFilter;

	const isPurpose = activeToggle.move === "이동목적";
	const moveCd = activeToggle.move === "이동목적" ? selectedFilters.purpose : selectedFilters.trans;
	const gender = selectedFilters.gender;
	const day = activeToggle.date === "요일선택" ? selectedFilters.weekday : selectedFilters.weekend;
	const isGen = activeToggle.age === "10세 단위";
	const age =
		activeToggle.age === "10세 단위" ? selectedFilters.agePerTen : selectedFilters.agePerFive;

	if (!_.isEmpty(selectedFilters)) {
		return {
			start,
			end,
			regions,
			includeSame,
			isInflow,
			isPurpose,
			moveCd,
			gender,
			day,
			isGen,
			age,
		};
	} else {
		return { start, end, regions, includeSame, isInflow, isPurpose, ...initailRankFilter };
	}
}
