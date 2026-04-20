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

export const MOVE_FILTER_TYPES = ["이동목적", "이동수단"];
export const DATE_FILTER_TYPES = ["요일선택", "평일/휴일"];
export const AGE_FILTER_TYPES = ["10세 단위", "5세 단위"];

export type MoveFilterType = (typeof MOVE_FILTER_TYPES)[number];
export type DateFilterType = (typeof DATE_FILTER_TYPES)[number];
export type AgeFilterType = (typeof AGE_FILTER_TYPES)[number];
export type FilterToggleType = "move" | "date" | "age";

export type FilterType = {
	key?: string;
	category: string;
	labels: { labelKey: string; value: number }[];
};

export const patternFilter: FilterType = {
	key: "patterns",
	category: "거주/직장/방문",
	labels: [
		{ labelKey: "거주", value: 0 },
		{ labelKey: "직장", value: 1 },
		{ labelKey: "방문", value: 2 },
	],
};

export const weekdayFilter: FilterType = {
	key: "weekday",
	category: "요일",
	labels: [
		{ labelKey: "일", value: 1 },
		{ labelKey: "월", value: 2 },
		{ labelKey: "화", value: 3 },
		{ labelKey: "수", value: 4 },
		{ labelKey: "목", value: 5 },
		{ labelKey: "금", value: 6 },
		{ labelKey: "토", value: 7 },
	],
};

export const weekendFilter: FilterType = {
	key: "weekend",
	category: "요일",
	labels: [
		{ labelKey: "평일", value: 8 },
		{ labelKey: "휴일", value: 9 },
	],
};

export const genderFilter: FilterType = {
	key: "gender",
	category: "성별",
	labels: [
		{ labelKey: "남성", value: 0 },
		{ labelKey: "여성", value: 1 },
	],
};

export const agePerTenFilter: FilterType = {
	key: "agePerTen",
	category: "연령",
	labels: [
		{ labelKey: "10세 미만", value: 0 },
		{ labelKey: "10대", value: 10 },
		{ labelKey: "20대", value: 20 },
		{ labelKey: "30대", value: 30 },
		{ labelKey: "40대", value: 40 },
		{ labelKey: "50대", value: 50 },
		{ labelKey: "60대", value: 60 },
		{ labelKey: "70대", value: 70 },
		{ labelKey: "80세 이상", value: 80 },
	],
};

export const agePerFiveFilter: FilterType = {
	key: "agePerFive",
	category: "연령",
	labels: [
		{ labelKey: "10세 미만", value: 0 },
		{ labelKey: "10-14세", value: 10 },
		{ labelKey: "15-19세", value: 15 },
		{ labelKey: "20-24세", value: 20 },
		{ labelKey: "25-29세", value: 25 },
		{ labelKey: "30-34세", value: 30 },
		{ labelKey: "35-39세", value: 35 },
		{ labelKey: "40-44세", value: 40 },
		{ labelKey: "45-49세", value: 45 },
		{ labelKey: "50-54세", value: 50 },
		{ labelKey: "55-59세", value: 55 },
		{ labelKey: "60-64세", value: 60 },
		{ labelKey: "65-69세", value: 65 },
		{ labelKey: "70-74세", value: 70 },
		{ labelKey: "75-79세", value: 75 },
		{ labelKey: "80세 이상", value: 80 },
	],
};

export const inoutFilter: FilterType = {
	key: "inout",
	category: "유입/유출인구",
	labels: [
		{ labelKey: "유입인구", value: 0 },
		{ labelKey: "유출인구", value: 1 },
	],
};

export const purposeFilter: FilterType = {
	key: "purpose",
	category: "이동목적",
	labels: [
		{ labelKey: "귀가", value: 0 },
		{ labelKey: "출근", value: 1 },
		{ labelKey: "등교", value: 2 },
		{ labelKey: "쇼핑", value: 3 },
		{ labelKey: "관광", value: 4 },
		{ labelKey: "병원", value: 5 },
		{ labelKey: "기타", value: 6 },
	],
};

export const transFilter: FilterType = {
	key: "trans",
	category: "이동수단",
	labels: [
		{ labelKey: "차량", value: 0 },
		{ labelKey: "노선버스", value: 1 },
		{ labelKey: "지하철", value: 2 },
		{ labelKey: "도보", value: 3 },
		{ labelKey: "고속버스", value: 4 },
		{ labelKey: "기차", value: 5 },
		{ labelKey: "항공", value: 6 },
		{ labelKey: "기타", value: 7 },
	],
};

export const pattern2Filter: FilterType = {
	key: "pattern2",
	category: "상주/비상주",
	labels: [
		{ labelKey: "상주", value: 0 },
		{ labelKey: "비상주", value: 1 },
	],
};

export const stayFilter: FilterType = {
	key: "stay",
	category: "체류일수별",
	labels: [
		{ labelKey: "1일", value: 0 },
		{ labelKey: "2~7일", value: 1 },
		{ labelKey: "8일 이상", value: 2 },
	],
};

export const nightFilter: FilterType = {
	key: "night",
	category: "숙박일수별",
	labels: [
		{ labelKey: "1일", value: 0 },
		{ labelKey: "2~3일", value: 1 },
		{ labelKey: "4~20일", value: 2 },
		{ labelKey: "21일 이상", value: 3 },
	],
};
