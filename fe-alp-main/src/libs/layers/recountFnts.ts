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

import { EGender, ELifestylePattern } from "@/constants/gis";

export function filterCountObj(obj: { [key: string]: any }, filters: string[]) {
	const result = Object.entries(obj).reduce((acc: any, [key, val]) => {
		if (filters.every((filter) => key.includes(filter))) {
			let newKey = key;
			filters.forEach((filter) => {
				newKey = newKey.replace(`${filter}_`, "");
			});
			acc[newKey] = val;
		}
		return acc;
	}, {});
	delete result.POPUL_NUM;
	return result;
}

export function filterCountObjAny(obj: { [key: string]: any }, filters: string[]) {
	const result = Object.entries(obj).reduce((acc: any, [key, val]) => {
		// filters 중 하나라도 포함된 경우 추출
		if (filters.some((filter) => key.includes(filter))) {
			let newKey = key;
			filters.forEach((filter) => {
				newKey = newKey; //.replace(`${filter}_`, "");
			});
			acc[newKey] = val;
		}
		return acc;
	}, {});

	delete result.POPUL_NUM;
	return result;
}

export function sumCountObj(obj: {}, filters: any[]) {
	return filters.reduce(
		(acc, filter) => {
			acc[filter] = Object.entries(obj).reduce((sum, [key, val]) => {
				if (key.includes(filter) && typeof val === "number") {
					return sum + val;
				}
				return sum;
			}, 0);
			return acc;
		},
		{} as Record<string, number>,
	);
}

export function aggregateAge(obj: Record<string, number>) {
	return Object.entries(obj).reduce((acc: Record<string, number>, [key, value]) => {
		// 값이 숫자가 아닌 경우 건너뜀
		if (typeof value !== "number") return acc;

		// 정규식을 사용하여 키를 분석
		const match = key.match(/^([A-Z]+)_(FEML|MALE)_(\d{2})$/);

		if (match) {
			const prefix = `${match[1]}_${match[2]}`; // "RSDN_FEML" 또는 "WKPLC_MALE"
			let age = parseInt(match[3], 10); // 00, 10, 20, ...

			// 00은 10으로, 80은 70으로 합침
			if (age === 0) {
				age = 10;
			} else if (age === 80) {
				age = 70;
			} else {
				// 10세 단위로 그룹화 (15 -> 10, 25 -> 20 등)
				age = Math.floor(age / 10) * 10;
			}

			const newKey = `${prefix}_${age}`;

			// 10세 단위로 묶은 값을 합산
			acc[newKey] = (acc[newKey] || 0) + value;
		} else {
			// 매칭되지 않는 데이터는 그대로 추가
			acc[key] = (acc[key] || 0) + value;
		}

		return acc;
	}, {});
}
export function filterCountObjSum(obj: { [key: string]: any }, filters: string[]) {
	const result = filters.reduce(
		(acc: any, filter) => {
			// 해당 필터 키워드를 포함하는 속성들의 값 합산
			const sum = Object.entries(obj).reduce((sum, [key, val]) => {
				if (key.includes(filter) && typeof val === "number") {
					return sum + val;
				}
				return sum;
			}, 0);
			acc[filter] = sum;
			return acc;
		},
		{} as { [key: string]: number },
	);

	return result;
}

export function filterByDOW<T>(data: Record<number, T>, days: number[]): Record<number, T> {
	const targetDays = new Set(days.map((day) => day % 7)); // 일주일은 0~6으로 순환

	// 객체 필터링
	const filteredEntries = Object.entries(data).filter(([timestamp]) => {
		const date = new Date(Number(timestamp));
		const dayOfWeek = date.getDay(); // 0 = 일요일, 1 = 월요일, ..., 6 = 토요일
		return targetDays.has(dayOfWeek);
	});

	// 필터링된 항목을 다시 객체로 변환하여 반환
	return Object.fromEntries(filteredEntries);
}

type DataType = {
	[timestamp: number]: {
		[key: number]: Array<{
			time: number;
			coord: [number, number];
			count: Record<string, any>;
		}>;
	};
};

// 좌표를 문자열로 변환하는 함수 (coord를 키로 사용하기 위해)
function coordToString(coord: [number, number]): string {
	return `${coord[0]},${coord[1]}`;
}

// count 객체 합산 함수
function mergeCounts(target: Record<string, number>, source: Record<string, any>) {
	for (const key in source) {
		const value = source[key];
		if (typeof value === "number") {
			if (target[key] !== undefined) {
				target[key] += value;
			} else {
				target[key] = value;
			}
		}
	}
}

// 전체 데이터 평균 계산 함수 (단순히 일별 평균)
export function mergeCountsByDOW(data: DataType): DataType {
	const dataArray = Object.values(data);

	// 타임스탬프의 개수 (일수)
	const numDays = dataArray.length;

	// 배열이 비어있으면 빈 객체 반환
	if (numDays === 0) return {};

	// 첫 번째 요소를 기준 객체로 설정
	const result = dataArray[0];

	// 나머지 요소들을 첫 번째 요소에 합산
	for (let i = 1; i < numDays; i++) {
		const currentData = dataArray[i];

		for (const key in currentData) {
			if (!result[key]) {
				result[key] = [];
			}

			const entries = currentData[key];

			for (const entry of entries) {
				const { time, coord, count } = entry;
				const coordKey = coordToString(coord);

				// 해당 좌표를 가진 항목을 찾거나 생성
				const existingEntry = result[key].find((item) => coordToString(item.coord) === coordKey);

				if (existingEntry) {
					// count 속성 합산
					mergeCounts(existingEntry.count, count);
				} else {
					// 새로운 항목 추가
					result[key].push({ time, coord, count: { ...count } });
				}
			}
		}
	}

	// 최종적으로 평균 계산
	for (const key in result) {
		for (const entry of result[key]) {
			const countObj = entry.count;
			for (const prop in countObj) {
				// 단순히 일수로 나누어 평균 계산
				countObj[prop] /= numDays;
			}
		}
	}

	return { 0: result };
}

interface Destination {
	regionCode: number;
	regionName: string;
	count: Record<string, number>;
	center: [number, number];
	timeOri: number;
	timeDes: number;
}

interface InputData {
	[key: string]: {
		dowCd: number;
		isHoliday: boolean;
		regionCode: number;
		regionName: string;
		destinations: Destination[];
	};
}

interface OutputData {
	regionCode: number;
	regionName: string;
	count: Record<string, number>;
	center: [number, number];
}

export function mergeTripCounts(data: InputData): OutputData[] {
	const mergedData: Record<number, OutputData> = {};

	// 입력 데이터를 순회하며 병합 작업 수행
	Object.values(data).forEach((entry) => {
		entry.destinations.forEach((destination) => {
			const { regionCode, regionName, count, center } = destination;

			// 이미 해당 regionCode가 존재하면 count를 합산
			if (mergedData[regionCode]) {
				const existingData = mergedData[regionCode];

				// count 합산
				for (const key in count) {
					if (count.hasOwnProperty(key)) {
						existingData.count[key] = (existingData.count[key] || 0) + count[key];
					}
				}
			} else {
				// 새로운 regionCode이면 추가
				mergedData[regionCode] = {
					regionCode,
					regionName,
					count: { ...count },
					center,
				};
			}
		});
	});

	// 병합된 데이터를 배열로 변환하여 평균 계산
	const result: OutputData[] = Object.values(mergedData);

	// 각 count 값을 평균으로 나누기 (일수만큼)
	result.forEach((item) => {
		const totalDays = Object.keys(data).length;
		for (const key in item.count) {
			if (item.count.hasOwnProperty(key)) {
				item.count[key] /= totalDays;
			}
		}
	});

	return result;
}
