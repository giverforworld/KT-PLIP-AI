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

/**
 * 쿼리 문자열 생성
 * @param params - 쿼리 문자열로 변환할 매개변수 객체
 *                 값이 배열인 경우, 해당 키로 여러 개의 쿼리 파라미터 생성
 * @returns 쿼리 문자열을 '?' 기호 없이 반환 *
 * @example
 * const queryString = formatQueryString({ start: '202301', end: '202312', regions: ['41111', '41113'] });
 * 반환값 : 'start=202301&end=202312&regions=41111&regions=41113'
 */
export function formatQueryString(params: Record<string, any>): string {
	const queryString = Object.entries(params)
		.map(([key, value]) => {
			if (Array.isArray(value)) {
				return value.map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join("&");
			}
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		})
		.join("&");

	return queryString;
}

export function getRegionCodes(regions: Region[]): string[] {
	const regionCodes = regions.map(
		(region) => region.adm.code || region.sgg.code || region.sido.code,
	);
	return regionCodes;
}

export function getTimezone(isSelectTime: 0 | 1, timezn: number[]) {
	const times: Set<string> = new Set();

	if (isSelectTime === 0) {
		//isSelectTime이 0일때 1-8 => 00-02, 03-05, ... 21-23
		timezn.forEach((slot) => {
			if (slot === 0) return; //0은 무시
			const startHour = (slot - 1) * 3;
			for (let i = 0; i < 3; i++) {
				const hour = startHour + i;
				if (hour >= 0 && hour < 24) {
					times.add(hour.toString().padStart(2, "0"));
				}
			}
		});
	} else if (isSelectTime === 1) {
		//isSelectTime이 1일 때 : 1-24 => 00-23
		timezn.forEach((slot) => {
			if (slot === 0) return; //0은 무시
			const hour = slot - 1;
			if (hour >= 0 && hour < 24) {
				times.add(hour.toString().padStart(2, "0"));
			}
		});
	}
	//결과를 정렬된 배열로 반환
	return Array.from(times).sort();
}

export function getDayofWeek(isSelectDay: 0 | 1, dayOfWeek: number[]) {
	let formattedDow;

	if (isSelectDay === 0) {
		if (dayOfWeek.includes(0)) formattedDow = dayOfWeek.filter((d) => d !== 0).map((day) => day);
		else formattedDow = dayOfWeek.map((day) => (day === 7 ? 1 : day + 1));
	} else if (isSelectDay === 1) {
		if (dayOfWeek.includes(0)) formattedDow = [8, 9];
		else formattedDow = dayOfWeek.map((day) => day + 7);
	}
	return formattedDow;
}

export function getGender(gender: [0 | 1]) {
	if (gender.length > 1) return 2;
	return gender;
}

export function getAgeGroup(ageGroup: number[]) {
	if (ageGroup.includes(0)) {
		return [0, 10, 20, 30, 40, 50, 60, 70, 80];
	}
	return ageGroup.map((value) => ((value - 1) * 10).toString().padStart(2, "0"));
}

export function gisAlpChartdataHandling(chartData: {
	[key: number]: { [key: string]: string | number }[];
}) {
	const chartDataArray = Object.entries(chartData).map(([timestamp, data]) => ({
		timestamp,
		...data,
	}));
	// console.log(chartDataArray);
	return chartDataArray;
}

export function gisMopChartdataHandling(chartData: {
	inflow?: { chartData: { [key: number]: { count: { [key: string]: number } } } }[];
	outflow?: { chartData: { [key: number]: { count: { [key: string]: number } } } }[];
}) {
	const timestamps = new Set<number>();
	const { inflow = [], outflow = [] } = chartData;

	// inflow와 outflow 중 존재하는 데이터에서 timestamp 수집
	[inflow, outflow].forEach((data) => {
		data.forEach((item) => {
			Object.keys(item.chartData).forEach((key) => timestamps.add(Number(key)));
		});
	});

	// Set을 배열로 변환 후 정렬
	const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

	// 정렬된 timestamp를 기준으로 데이터를 변환
	return sortedTimestamps.map((timestamp) => {
		const inflowData = inflow.length
			? inflow.reduce((acc: Record<string, number>, item) => {
					const chartData = item.chartData[timestamp];
					if (chartData?.count) {
						Object.entries(chartData.count).forEach(([key, value]) => {
							acc[key] = (acc[key] || 0) + value;
						});
					}
					return acc;
				}, {})
			: undefined;

		const outflowData = outflow.length
			? outflow.reduce((acc: Record<string, number>, item) => {
					const chartData = item.chartData[timestamp];
					if (chartData?.count) {
						Object.entries(chartData.count).forEach(([key, value]) => {
							acc[key] = (acc[key] || 0) + value;
						});
					}
					return acc;
				}, {})
			: undefined;

		return {
			timestamp,
			...(inflowData && { inflow: inflowData }),
			...(outflowData && { outflow: outflowData }),
		};
	});
}

export function getAges(age: number[]): number[] {
	//전체 선택 (0이 포함된 경우)
	if (age.includes(0)) {
		return [0, 1, 2, 3, 4, 5, 6, 7, 8];
	}
	//age 값들을 10의 배수 문자열로 변환
	return age.map((a) => (a - 1) * 10).sort();
}
