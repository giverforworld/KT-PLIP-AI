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

interface InputData {
	regionCode: number;
	regionName: string;
	count: number;
	center: [number, number];
	timeOri: number;
	timeDes: number;
}

interface TripData {
	regionCode: number;
	regionName: string;
	count: number;
	countRate: number;
	center: [number, number];
	timeOri: number;
	timeDes: number;
	coordinates: [number, number, number][];
	timestamps: number[];
}

interface OutputData {
	regionsObj: Record<string, any>;
	trips: TripData[];
}

export function makeTripLayerData(
	input: InputData[],
	centerStart: [number, number, number],
	centerRegionCd: number,
	centerRegionName: string,
	numberOfRegions: number, // 추가된 인자
	inOutFlow: boolean,
): OutputData {
	// 1. centerRegionCd에 해당하는 지역을 분리
	const centerRegion = input.find((el) => el.regionCode === centerRegionCd);
	const otherRegions = input.filter((el) => el.regionCode !== centerRegionCd);

	const maxCount = Math.max(...otherRegions.map((el) => el.count || 0));

	const regionsObj: Record<string, any> = {};
	if (!centerRegion) {
		regionsObj[centerRegionCd] = {
			index: 0,
			// countRate: 0.1,
			regionName: centerRegionName,
			center: centerStart,
			count: 0,
		};
		// throw new Error(`Region with code ${centerRegionCd} not found in input data`);
	} else
		regionsObj[centerRegionCd] = {
			index: 0,
			countRate: centerRegion.count / maxCount,
			...centerRegion,
		};

	// 2. maxCount 계산 (centerRegion 제외)

	// 3. regionsObj 생성 (centerRegion 먼저 추가)

	// 4. otherRegions 처리: countRate 계산 및 정렬
	const otherRegionsWithCount = otherRegions
		.filter((el) => el.count)
		.map((el) => ({
			...el,
			countRate: el.count / maxCount,
		}))
		.sort((a, b) => b.countRate - a.countRate);

	const otherRegionsWithoutCount = otherRegions.filter((el) => !el.count);

	// 5. otherRegionsWithCount에 대해 index 할당 및 numberOfRegions 제한 적용
	otherRegionsWithCount.forEach((el, idx) => {
		if (idx + 1 < numberOfRegions) {
			// `numberOfRegions` 제한
			regionsObj[el.regionCode] = {
				index: idx + 1,
				...el,
			};
		}
	});

	// 6. otherRegionsWithoutCount에 대해 랜덤 인덱스 할당
	otherRegionsWithoutCount.forEach((el) => {
		const randomIndex = Math.floor(Math.random() * (input.length - 1)) + 1;
		if (randomIndex < numberOfRegions) {
			// `numberOfRegions` 제한
			regionsObj[el.regionCode] = {
				index: randomIndex,
				countRate: 0,
				...el,
			};
		}
	});

	// 7. tripsData 생성 및 numberOfRegions 제한 적용

	const trips = input
		.map((el) => {
			const { count, center, regionCode } = el;

			// 도착점을 center로 설정
			const centerEnd: [number, number, number] = [center[0], center[1], 0];

			// 시작점(centerStart)와 도착점(centerEnd) 사이의 좌표를 생성 (10등분)
			const coordinates: [number, number, number][] = [];
			const timestamps: number[] = [];

			const maxHeight = 2000;
			const length = Math.sqrt(
				Math.pow(centerStart[0] - centerEnd[0], 2) + Math.pow(centerStart[1] - centerEnd[1], 2),
			);
			const beginTime = Math.random();
			const endTime = beginTime + Math.min(10, Math.max(1, length * 100));
			for (let i = 0; i <= 30; i++) {
				const ratio = i / 30;
				const height = 0; //maxHeight * Math.sin(Math.PI * ratio);
				const interpolatedCoord: [number, number, number] = [
					centerStart[0] + (centerEnd[0] - centerStart[0]) * ratio,
					centerStart[1] + (centerEnd[1] - centerStart[1]) * ratio,
					height,
				];
				coordinates.push(interpolatedCoord);
				timestamps.push(beginTime + (endTime - beginTime) * ratio);
			}

			// countRate 계산 (centerRegion 제외한 maxCount 사용)
			const countRate =
				regionCode === centerRegionCd
					? (centerRegion?.count || 0) / maxCount
					: (count || 0) / maxCount;

			return {
				...el,
				coordinates,
				timestamps,
				countRate,
			};
		})
		.filter((trip) => regionsObj[trip.regionCode]?.index < numberOfRegions); // `numberOfRegions` 제한 적용

	// 8. 최종 결과 반환
	return {
		regionsObj,
		trips,
	};
}

interface InputData {
	regionCode: number;
	regionName: string;
	count: number;
	center: [number, number];
	analyzeOption: string | null;
}

interface Destination {
	descd: number;
	desnm: string;
	desxy: [number, number];
	popu: number;
}

interface OutputD3 {
	oricd: number;
	orinm: string;
	orixy: [number, number];
	desArr: Destination[];
}

export function makeD3Data(
	data: InputData[],
	centerOri: [number, number],
	oriCd: number,
	oriName?: string,
): OutputD3 {
	// 출발지 정보 설정
	const orinm =
		oriName || data.find((el) => el.regionCode === oriCd)?.regionName || "Unknown Region";

	// 목적지 배열 생성
	const desArr = data
		.filter((el) => el.regionCode !== oriCd) // 출발지와 목적지를 구분
		.map((el) => ({
			descd: el.regionCode,
			desnm: el.regionName,
			desxy: el.center,
			popu: el.count,
		}));

	// 최종 결과 반환
	return {
		oricd: oriCd,
		orinm,
		orixy: centerOri,
		desArr,
	};
}
