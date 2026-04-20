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
import { PATHS } from "@/constants/path";

/**
 * 객체의 모든 속성의 값이 빈 문자열인지 확인
 * @param obj
 * @returns 모든 속성의 값이 빈 문자열이면 `true`, 그렇지 않으면 `false`.
 */
export const isEmptyObject = <T extends Record<string, { [key: string]: string }>>(
	obj: T | null | undefined,
): boolean => {
	if (!obj) return false;
	return Object.values(obj).every((subObj) => Object.values(subObj).every((value) => value === ""));
};

/**
 * 주어진 배열에 빈 객체(모든 속성의 값이 빈 문자열인 경우)가 있는지 확인
 * @param arr
 * @returns 빈 객체가 하나라도 있으면 `true`, 없으면 `false`
 */
export const hasEmptyObject = <T extends Record<string, { [key: string]: string }>>(
	arr: (T | null | undefined)[],
): boolean => {
	return arr.some((obj) => isEmptyObject(obj));
};

/**
 * 배열 내에서 중복된 객체가 있는지 확인
 * @param arr
 * @returns 중복된 객체가 있으면 `true`, 없으면 `false`
 */
export function hasDuplicateObjects(arr: { [key: string]: any }[]): boolean {
	const uniqueArr = _.uniqWith(arr, _.isEqual);
	return uniqueArr.length !== arr.length;
}

/**
 * 필터 지역 선택되어있는지 확인
 * @param regions
 * @returns boolean
 */
export const isRegionEmpty = (regions: Region[]): boolean => hasEmptyObject(regions);

/**
 * 체류인구에서 읍면동 코드가 포함되어 있는지 확인
 * @param regions
 * @param pageName
 * @returns boolean
 */
export const isInvalidRegionCodesInLlp = (regionCodes: string[], pageName: string): boolean => {
	return (pageName === PATHS.LLP) && regionCodes.some((num) => num.toString().length < 5);
};

/**
 * 주민/생활비교분석 기간조회 타입 확인
 * @param dateSelector DateSelecorType
 * @param subPageName
 * @returns boolean
 */
export const isInvalidDateInCompAnalysis = (
	dateSelector: DateSelectorType,
	subPageName: string,
): boolean => {
	return subPageName === PATHS.COMP_ANALYSIS && dateSelector !== "월별";
};

/**
 * useSearchResultQuery, useSearchSummaryQuery의 enable 여부 반환
 * @param
 * @returns
 */
export function isSearchQueryEnabled(
	searchQueryParams: SearchQueryParams,
	pageName: string,
	subPageName: string | undefined,
): boolean {
	if (!_.isEmpty(searchQueryParams)) {
		const { start, end, regions } = searchQueryParams;

		const hasAdmCodeInLlp = isInvalidRegionCodesInLlp(regions, pageName);
		const hasDateRangeInComAnalysis =
			subPageName === PATHS.COMP_ANALYSIS && start.length === 8 && end.length === 8;
		const regionsValidate = regions ? !regions.includes("") : true;

		return regionsValidate && !hasAdmCodeInLlp && !hasDateRangeInComAnalysis;
	} else {
		return false;
	}
}

export function extractPageInfo(pathname: string) {
	const [pageName, subPageName] = pathname.split("/").filter(Boolean);
	return { pageName, subPageName };
}


/**
 * 신설된 지역 전년, 전월 비교 불가
 * @param regions
 * @param searchDate
 * @returns boolean
 */
const NEWLY_REGIONS: { codes: string[]; startDate: number }[] = [
	{ codes: ["41591", "41593", "41595", "41597"], startDate:202602 }, // 화성시 분구 
];
export const isNewlyCreateRegion = (regionCodes: string[], searchDate:string): boolean => {
	const compareYYYYMM = Number(searchDate)-100;
	return NEWLY_REGIONS.some(({codes, startDate}) =>{
		const isNewlyRegion = codes.some((region) =>
			regionCodes.some((code) => code.startsWith(region)),
		);

		// 해당 지역이고 비교 날짜에 데이터가 없으면 true;
		return isNewlyRegion && compareYYYYMM < startDate;
	}
	);
};