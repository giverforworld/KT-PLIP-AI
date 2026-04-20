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

export const inoutFilter: Filter = {
	key: "inout",
	category: "유입/유출인구",
	labels: ["유입인구", "유출인구"],
};

export const purposeFilter: Filter = {
	key: "purpose",
	category: "이동목적",
	labels: ["귀가", "출근", "등교", "쇼핑", "관광", "병원", "기타"],
};

export const transFilter: Filter = {
	key: "trans",
	category: "이동수단",
	labels: ["항공", "철도", "고속버스", "지하철", "노선버스", "차량", "도보", "기타"],
};

export const patternFilter: Filter = {
	key: "pattern",
	category: "거주/직장/방문",
	labels: ["거주", "직장", "방문"],
};
export const pattern2Filter: Filter = {
	key: "pattern2",
	category: "상주/비상주",
	labels: ["상주", "비상주"],
};

export const stayFilter: Filter = {
	key: "stay",
	category: "체류일수별",
	labels: ["1일", "2~7일", "8일 이상"],
};

export const nightFilter: Filter = {
	key: "night",
	category: "숙박일수별",
	labels: ["1일", "2~3일", "4~20일", "21일 이상"],
};

export const weekdayFilter: Filter = {
	key: "weekday",
	category: "요일",
	labels: ["월", "화", "수", "목", "금", "토", "일"],
};

export const weekendFilter: Filter = {
	key: "weekend",
	category: "요일",
	labels: ["평일", "휴일"],
};

export const genderFilter: Filter = {
	key: "gender",
	category: "성별",
	labels: ["남성", "여성"],
};

export const agePerTenFilter: Filter = {
	key: "agePerTen",
	category: "연령",
	labels: ["10세 미만", "10대", "20대", "30대", "40대", "50대", "60대", "70대", "80세 이상"],
};

export const agePerFiveFilter: Filter = {
	key: "agePerFive",
	category: "연령",
	labels: [
		"10세 미만",
		"10-14세",
		"15-19세",
		"20-24세",
		"25-29세",
		"30-34세",
		"35-39세",
		"40-44세",
		"45-49세",
		"50-54세",
		"55-59세",
		"60-64세",
		"65-69세",
		"70-74세",
		"75-79세",
		"80세 이상",
	],
};
