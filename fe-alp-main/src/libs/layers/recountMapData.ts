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
import { filterCountObjAny, filterCountObjSum } from "./recountFnts";

function getMaxValueKey(obj: Record<string, number>): string | number {
	if (Object.keys(obj).length === 0) return 0;
	const maxKey = Object.entries(obj).reduce((maxKey, [key, value]) => {
		return obj[maxKey] < value ? key : maxKey;
	}, Object.keys(obj)[0]);

	return obj[maxKey] === 0 ? 0 : maxKey;
}
function getMaxValue(obj: Record<string, number>): { maxValueKey: string | number; count: number } {
	// 객체가 비어 있을 경우 0 반환
	if (Object.keys(obj).length === 0) return { maxValueKey: 0, count: 0 };

	// 가장 큰 값을 가진 키와 해당 값 찾기
	const [maxKey, maxCount] = Object.entries(obj).reduce(
		(acc, [key, value]) => (value > acc[1] ? [key, value] : acc),
		[Object.keys(obj)[0], obj[Object.keys(obj)[0]]],
	);

	// 최대 count가 0이면 {0, 0} 반환
	return maxCount === 0 ? { maxValueKey: 0, count: 0 } : { maxValueKey: maxKey, count: maxCount };
}

export function recountGridData(
	gridData: { [key: string]: any }[],
	mapSettings: MapSettings,
): { count: number; coord: number[] }[] {
	const { lifestylePattern, gender, ageGroup, analyzeOption } = mapSettings;
	const LSFilter = lifestylePattern.map((p: number) => ELifestylePattern[p]);
	const GFilter = gender.map((p: number) => EGender[p]);

	// 임시 필터 만들기
	const ageFilter = ageGroup.map((el) => el - 1 + "0");
	// const timeFilter = timeSlot.flatMap((num) => {
	// 	if (num === 0) return []; // 0일 때는 빈 배열 반환
	// 	const start = (num - 1) * 3; // 시작 값 계산
	// 	return [start, start + 1, start + 2].map((n) => n.toString().padStart(2, "0"));
	// });

	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = gridData.map((el) => el.count);

	//filter, 해당 조건의 속성들만 남기기
	// filteredObj = gridData.filter((el: any) => dayOfWeek.includes(el.count.DOW_CD));
	// filteredObj = filteredObj.filter((el: any) => timeFilter.includes(el.count.TIMEZN_CD));

	//filter에 있는 요소중 하나라도 포함된 속성들 남기기
	// filteredObj = filteredObj.map((el: any) => aggregateAge(el));
	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, LSFilter));
	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, ageFilter));

	// 만약 성별 분석 옵션이 켜져있으면 필터링을 중지하고 남녀 수 비교
	// if (analyzeOption === "analyzeGender") {
	// 	filteredObj = filteredObj.map((el: any) => filterCountObjSum(el, ["MALE", "FEML"]));
	// 	const result = filteredObj.map((obj, idx) => {
	// 		return { count: obj.MALE - obj.FEML, coord: gridData[idx].coord, analyzeOption, ...obj };
	// 	});
	// 	return result;
	// }
	// if (analyzeOption === "analyzeLifestylePattern") {
	// 	filteredObj = filteredObj.map((el: any) => filterCountObjSum(el, ["RSDN", "VIST", "WKPLC"]));
	// 	const result = filteredObj.map((obj, idx) => {
	// 		return {
	// 			count: 100,
	// 			coord: gridData[idx].coord,
	// 			analyzeOption,
	// 			...obj,
	// 			maxValueKey: getMaxValueKey(obj),
	// 		};
	// 	});
	// 	return result;
	// }
	// if (analyzeOption === "analyzeAgeGroup") {
	// 	filteredObj = filteredObj.map((el: any) =>
	// 		filterCountObjSum(el, ["10", "20", "30", "40", "50", "60", "70"]),
	// 	);
	// 	const result = filteredObj.map((obj, idx) => {
	// 		return {
	// 			count: 100,
	// 			coord: gridData[idx].coord,
	// 			analyzeOption,
	// 			...obj,
	// 			maxValueKey: getMaxValueKey(obj),
	// 		};
	// 	});
	// 	return result;
	// }

	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, GFilter));

	//모든 필터링이 완료 된 후 합산 구하기
	const result = filteredObj.map((el: any, idx: number) => {
		const count =
			typeof el === "number"
				? el
				: (Object.values(el).reduce((acc: any, val) => acc + val, 0) as number);
		return {
			count,
			coord: gridData[idx].coord as number[],
			analyzeOption,
			chartData: el,
		} as any;
	});

	return result;
}

export function recountLMGridData(
	gridData: { [key: string]: any }[],
	gisSettings: GisSettings,
	mapSettings: MapSettings,
	isMovingPurpose: boolean,
): { count: number; coord: number[] }[] {
	if (!gridData) return [];
	const { lifestylePattern, gender, ageGroup, analyzeOption } = mapSettings;
	const { movingPurposeGroup, movingVehicleGroup } = gisSettings;
	//  필터 만들기
	// const prpsFilter = movingPurposeGroup.map((p: number) => "PRPS" + p);
	// const wayFilter = movingVehicleGroup.map((p: number) => "WAY" + p);
	// 전체 => 0
	const wayFilter = movingVehicleGroup.includes(0)
		? Array.from({ length: 8 }, (_, i) => "WAY" + i) // 전체 선택 시 WAY0~WAY7
		: movingVehicleGroup
				.filter((w: number) => w !== 0) // 0(전체) 제외
				.map((w: number) => "WAY" + (w - 1));

	const prpsFilter = movingPurposeGroup.includes(0)
		? Array.from({ length: 7 }, (_, i) => "PRPS" + i) // 전체 선택 시 PRPS0~PRPS6
		: movingPurposeGroup
				.filter((p: number) => p !== 0) // 0(전체) 제외
				.map((p: number) => "PRPS" + (p - 1));
	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = gridData.map((el) => el.count);

	//filter, 해당 조건의 속성들만 남기기
	// filteredObj = gridData.filter((el: any) => dayOfWeek.includes(el.count.DOW_CD));
	// filteredObj = filteredObj.filter((el: any) => timeFilter.includes(el.count.TIMEZN_CD));

	//filter에 있는 요소중 하나라도 포함된 속성들 남기기
	// filteredObj = filteredObj.map((el: any) => aggregateAge(el));
	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, LSFilter));
	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, ageFilter));

	if (isMovingPurpose)
		filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, prpsFilter));
	else filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, wayFilter));

	// 만약 성별 분석 옵션이 켜져있으면 필터링을 중지하고 남녀 수 비교

	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, GFilter));

	//모든 필터링이 완료 된 후 합산 구하기
	const result = filteredObj.map((el: any, idx: number) => {
		const count = Object.values(el).reduce((acc: any, val) => acc + val, 0) as number;
		return { count, coord: gridData[idx].coord as number[], analyzeOption } as any;
	});

	return result;
}

export function recountAdmData(
	admData: { [key: string]: any }[],
	mapSettings: MapSettings,
	// isMovingPurpose: boolean,
) {
	const { gender, ageGroup } = mapSettings;

	//  필터 만들기
	const GFilter = gender.map((p: number) => EGender[p]);
	const ageFilter = ageGroup.map((el) => el - 1 + "0");

	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = admData.map((el) => el.count);

	//filter, 해당 조건의 속성들만 남기기
	// filteredObj = gridData.filter((el: any) => dayOfWeek.includes(el.count.DOW_CD));
	// filteredObj = filteredObj.filter((el: any) => timeFilter.includes(el.count.TIMEZN_CD));

	//filter에 있는 요소중 하나라도 포함된 속성들 남기기
	// filteredObj = filteredObj.map((el: any) => aggregateAge(el));
	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, LSFilter));
	if (typeof filteredObj[0] === "object") {
		filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, ageFilter));
		filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, GFilter));
	}
	// else console.log("not obj", filteredObj[0]);

	// if (isMovingPurpose)
	// 	filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, prpsFilter));
	// else filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, wayFilter));

	// 만약 성별 분석 옵션이 켜져있으면 필터링을 중지하고 남녀 수 비교

	// filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, GFilter));

	//모든 필터링이 완료 된 후 합산 구하기
	const result = filteredObj
		.map((el: any, idx: number) => {
			let count = el;
			if (typeof el === "object")
				count = Object.values(el).reduce((acc: any, val) => acc + val, 0) as number;
			// return { ...admData[idx], count, chartData: el } as any; // 변경사항 반영 원할시
			return { ...admData[idx], count, chartData: admData[idx]?.count } as any;
		})
		.sort((a, b) => b.count - a.count);
	const maxCount = Math.max(...result.map((item) => item.count));
	const resultWithMax = result.map((item, index) => ({
		...item,
		maxCount,
		countRate: item.count / maxCount,
		index,
	}));
	return resultWithMax;
}
export function recountLlpData(tripData: any, mapSettings: MapSettings): any {
	const { gender, ageGroup, analyzeOption, domesticGroup, movingVehicleGroup, movingPurposeGroup } =
		mapSettings;

	// filter 만들기
	// const DFFilter = domesticGroup.map((p: number) => EDomesticGroup[p]);
	// const wayFilter = movingVehicleGroup.map((w: number) => "WAY" + w);
	// const prpsFilter = movingPurposeGroup.map((p: number) => "PRPS" + p);
	const GFilter = gender.map((p: number) => EGender[p]);
	const ageFilter = ageGroup.map((el) => el - 1 + "0");

	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = tripData;

	// 사용자 설정에 따른 데이터 필터링
	//filter, 해당 조건의 속성들만 남기기
	// const filters = [prpsFilter];
	let filters = [GFilter, ageFilter];
	// if (isMovingPurpose) filters = [prpsFilter];
	// else filters = [wayFilter];

	filteredObj = filteredObj.map((el: any) => {
		let newCount = el.count;
		// 필터 배열을 순회하며 `newCount`를 필터링
		filters.forEach((filter) => {
			if (typeof newCount === "object") {
				newCount = filterCountObjAny(newCount, filter);
			}
		});
		return {
			...el,
			count: newCount,
			chartData: el.count,
		};
	});

	//모든 필터링이 완료 된 후 합산 구하기
	const result = filteredObj.map((el: any, idx: number) => {
		const count = Object.values(el.count).reduce((acc: any, val) => acc + val, 0) as number;
		return { ...el, count, analyzeOption } as any;
	});

	return result;
}

export function recountTripData(
	tripData: any,
	gisSettings: GisSettings,
	mapSettings: MapSettings,
	isMovingPurpose: boolean,
): any {
	const { gender, ageGroup, analyzeOption, domesticGroup } = mapSettings;
	const { movingPurposeGroup, movingVehicleGroup } = gisSettings;

	// filter 만들기
	// const DFFilter = domesticGroup.map((p: number) => EDomesticGroup[p]);
	// const wayFilter = movingVehicleGroup.map((w: number) => "WAY" + w);
	// const prpsFilter = movingPurposeGroup.map((p: number) => "PRPS" + p);
	// 전체 => 0
	const wayFilter = movingVehicleGroup.includes(0)
		? Array.from({ length: 8 }, (_, i) => "WAY" + i) // 전체 선택 시 WAY0~WAY7
		: movingVehicleGroup
				.filter((w: number) => w !== 0) // 0(전체) 제외
				.map((w: number) => "WAY" + (w - 1));

	const prpsFilter = movingPurposeGroup.includes(0)
		? Array.from({ length: 7 }, (_, i) => "PRPS" + i) // 전체 선택 시 PRPS0~PRPS6
		: movingPurposeGroup
				.filter((p: number) => p !== 0) // 0(전체) 제외
				.map((p: number) => "PRPS" + (p - 1));
	// const GFilter = gender.map((p: number) => EGender[p]);
	// const ageFilter = ageGroup.map((el) => el - 1 + "0");
	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = tripData;

	// 사용자 설정에 따른 데이터 필터링
	//filter, 해당 조건의 속성들만 남기기
	// const filters = [prpsFilter];
	let filters = [];
	if (isMovingPurpose) filters = [prpsFilter];
	else filters = [wayFilter];

	filteredObj = filteredObj.map((el: any) => {
		let newCount = el.count;
		// 필터 배열을 순회하며 `newCount`를 필터링
		filters.forEach((filter) => {
			newCount = filterCountObjAny(newCount, filter);
		});
		return {
			...el,
			count: newCount,
			chartData: el.count,
		};
	});
	filteredObj = filteredObj.map((el: any) => ({
		...el,
		count: filterCountObjAny(el.count, isMovingPurpose ? prpsFilter : wayFilter),
	}));

	// 인구분석 집계
	// const applyFilters = (obj: any, filter: any) => ({
	// 	...obj,
	// 	filteredData: filterCountObjSum(obj.count, filter),
	// 	analyzeOption,
	// });

	// const processMaxValueKey = (obj: any) => ({
	// 	...obj,
	// 	...getMaxValue(obj.filteredData),
	// });

	// switch (analyzeOption) {
	// 	case "analyzeGender":
	// 		const filtered = filteredObj.map((el) => applyFilters(el, ["MALE", "FEML"]));
	// 		const res = filtered.map((el) => ({
	// 			...el,
	// 			count: el.filteredData.MALE - el.filteredData.FEML,
	// 		}));

	// 		return res;

	// 	case "analyzeAgeGroup": {
	// 		const filtered = filteredObj.map((el) => applyFilters(el, ageFilter));
	// 		return filtered.map(processMaxValueKey);
	// 	}

	// case "movingPurposeGroup": {
	// 	const filter = isMovingPurpose ? prpsFilter : wayFilter;
	// 	const filtered = filteredObj.map((el) => applyFilters(el, filter));
	// 	return filtered.map(processMaxValueKey);
	// }
	// }

	// return filteredObj;

	//모든 필터링이 완료 된 후 합산 구하기
	const result = filteredObj.map((el: any, idx: number) => {
		const count = Object.values(el.count).reduce((acc: any, val) => acc + val, 0) as number;
		return { ...el, count, analyzeOption } as any;
	});

	return result;
}

type PreprocessingTripData = {
	layerData: any;
	gisSettings: GisSettings;
	mapIdx: number;
	currentTime: number;
	isLlp?: boolean;
};
export function preprocessingTripData({
	layerData,
	gisSettings,
	mapIdx,
	currentTime,
	isLlp = false,
}: PreprocessingTripData) {
	const {
		isMovingPurpose,
		isTimeLine,
		maps: { [mapIdx]: mapSettings },
	} = gisSettings;

	// const trip = mapData.trip[inOutFlow ? "inflow" : "outflow"][0];
	// const layerData = trip.layerData;

	let filteredData;
	if (isLlp) {
		const currentLayerData = Object.values(layerData)[0] as any;
		if (typeof currentLayerData.destinations[0].count === "number") {
			filteredData = currentLayerData.destinations;
		} else {
			filteredData = recountLlpData(currentLayerData.destinations, mapSettings);
		}
	} else if (!isTimeLine) {
		const currentLayerData = Object.values(layerData)[0] as any;
		if (typeof currentLayerData.destinations[0].count === "number") {
			filteredData = currentLayerData.destinations;
		} else {
			filteredData = recountTripData(
				currentLayerData.destinations,
				gisSettings,
				mapSettings,
				isMovingPurpose,
			);
		}
	} else {
		const selectedTime = layerData[currentTime]
			? currentTime
			: Object.keys(layerData)[Math.floor(Math.random() * Object.keys(layerData).length)];
		const data = layerData[selectedTime].destinations;
		if (typeof data[0].count === "number") {
			filteredData = data;
		} else {
			filteredData = recountTripData(data, gisSettings, mapSettings, isMovingPurpose);
		}
	}

	// 두번째로 큰 수를 찾기 위해 정렬 후 두번째 값 선택
	const sortedCounts = [...filteredData.map((item: any) => item.count)].sort((a, b) => b - a);
	const maxCount = sortedCounts[1] || 0;
	return { filteredData, maxCount };
}
