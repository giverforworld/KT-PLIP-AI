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

import { purposeFilter, transFilter } from "@/constants/filter";
import { serverUrl } from "@/constants/path";
import axios from "axios";

// const dataInfo = async (): Promise<any> => {
// 	const response = await axios(`${serverUrl}/datainfo`);
// 	console.log('response', response);
// 	return response.data;
// }

// const defaultMonth = getDefaultMonth();
// const { startDate, endDate } = getDefaultDate();
const defaultRegion = getDefaultRegion();

export const initialPurposeFilter = purposeFilter.labels.map((label) => label.value);
export const initialTransFilter = transFilter.labels.map((label) => label.value);

// export const searchFilterStateDefaultValue = async ():Promise<SearchFilterState> => {
// 	const data = await dataInfo();
// 	return {
// 		dateSelector: "월별" as DateSelectorType,
// 		selectedDate: data,
// 		selectedRange: { startDate: new Date(), endDate: new Date() },
// 		displayRegions: [defaultRegion],
// 		routeDisplayRegions: [
// 			{
// 				sido: { name: "", code: "" },
// 				sgg: { name: "", code: "" },
// 				adm: { name: "", code: "" },
// 			},
// 		],
// 		includeSame: true,
// 		isFlow: false,
// 		isInflowRca: false, // 지역비교분석 유입유출
// 		isInflowRaa: true, // 출도착지분석 유입유출
// 		purpose: initialPurposeFilter,
// 		trans: initialTransFilter,
// 	}
// }
export const searchFilterStateDefaultValue: SearchFilterState = {
	dateSelector: "월별" as DateSelectorType,
	selectedDate: new Date(),
	selectedRange: { startDate: new Date(), endDate: new Date() },
	displayRegions: [defaultRegion],
	routeDisplayRegions: [
		{
			sido: { name: "", code: "" },
			sgg: { name: "", code: "" },
			adm: { name: "", code: "" },
		},
	],
	includeSame: true,
	isFlow: false,
	isInflowRca: false, // 지역비교분석 유입유출
	isInflowRaa: true, // 출도착지분석 유입유출
	purpose: initialPurposeFilter,
	trans: initialTransFilter,
};

export const searchFilterDefaultValue: SearchFilterStoreState = {
	dateSelector: "월별" as DateSelectorType,
	selectedDate: new Date(),
	selectedRange: { startDate: new Date(), endDate: new Date() },
	regions: [defaultRegion],
	flowRegions: [
		{
			sido: { name: "", code: "" },
			sgg: { name: "", code: "" },
			adm: { name: "", code: "" },
		},
	],
	includeSame: true,
	isFlow: false,
	isInflowRca: false,
	isInflowRaa: true,
	purpose: initialPurposeFilter,
	trans: initialTransFilter,
};

/**
 * 월 Default값
 * @returns
 */
// export function getDefaultMonth(): Date {
// 	const today = new Date();
// 	// const defaultMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 이전 달의 첫날 00:00:00
// 	const defaultMonth = new Date(2024, 6, 1); // TO_BE_CHECKED

// 	return defaultMonth;
// }

/**
 * 시작일, 종료일 Default값
 * @returns { startDate: Date; endDate: Date }
 */
// export function getDefaultDate(): { startDate: Date; endDate: Date } {
// 	let startDate = new Date(2024, 6, 1);
// 	let endDate = new Date(2024, 6, 7); // TO_BE_CHECKED

// 	endDate.setDate(endDate.getDate());
// 	startDate.setDate(endDate.getDate() - 6);

// 	return { startDate, endDate };
// }

/**
 * 지역 Default값
 * @returns { year: number; month: number }
 */
export function getDefaultRegion(): Region {
	// TO_BE_CHECKED
	const defaultRegion = {
		sido: { name: "", code: "" },
		sgg: { name: "", code: "" },
		adm: { name: "", code: "" },
	};

	return defaultRegion;
}
