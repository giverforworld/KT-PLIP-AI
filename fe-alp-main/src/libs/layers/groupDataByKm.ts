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

export type DataPoint = {
	x: number;
	y: number;
	popu: string;
};

export type AggregatedPoint = {
	x: number;
	y: number;
	popu: number;
};

/**
 * 그룹화된 데이터를 반환하는 함수
 * @param data - 원본 배열
 * @param gridKm - 그리드 크기 (km 단위)
 * @param centerLatitude - 중심 위도 (경도 계산에 필요)
 * @returns AggregatedPoint 배열
 */
export function groupDataByKm(
	data: DataPoint[],
	gridKm: number,
	centerLatitude: number = 37.5,
): AggregatedPoint[] {
	// 1km에 해당하는 위도 차이 (적도 기준으로 대략적인 값)
	const baseLatitudeGridSize = 1 / 111; // 위도 1km에 해당하는 값

	// 경도의 그리드 크기 조정 (위도의 영향 받음)
	const baseLongitudeGridSize = baseLatitudeGridSize / Math.cos(centerLatitude * (Math.PI / 180));

	// 주어진 km 단위로 그리드 크기 계산
	const latitudeGridSize = baseLatitudeGridSize * gridKm;
	const longitudeGridSize = baseLongitudeGridSize * gridKm;

	// 그리드로 취합된 결과 저장
	const aggregatedData: { [key: string]: AggregatedPoint } = {};

	// 그리드 셀 좌표로 변환 및 데이터 취합
	data.forEach(({ x, y, popu }) => {
		// 그리드 셀 좌표를 계산 (gridKm 단위로 반올림)
		const gridX = Math.floor(x / longitudeGridSize);
		const gridY = Math.floor(y / latitudeGridSize);

		// 그리드 셀의 키를 문자열로 생성
		const gridKey = `${gridX},${gridY}`;

		// 그리드 셀에 데이터 추가 (popu 값 합산)
		if (!aggregatedData[gridKey]) {
			aggregatedData[gridKey] = {
				x: gridX * longitudeGridSize + longitudeGridSize / 2, // 셀의 중심 좌표로 이동
				y: gridY * latitudeGridSize + latitudeGridSize / 2, // 셀의 중심 좌표로 이동
				popu: 0,
			};
		}
		aggregatedData[gridKey].popu += parseFloat(popu);
	});

	// 그리드 셀의 값을 배열로 변환하여 반환
	return Object.values(aggregatedData);
}

export type DataPointAggr = {
	x: number;
	y: number;
	weight: number;
	value: number;
};

export type AggregatedPointAggr = {
	x: number;
	y: number;
	weight: number;
	value: number; // 가중평균된 value
};

/**
 * 주어진 km 단위로 데이터를 그룹화하는 함수
 * @param data - 원본 배열
 * @param gridKm - 그리드 크기 (km 단위)
 * @param centerLatitude - 중심 위도 (경도 계산에 필요)
 * @returns AggregatedPoint 배열
 */
export function groupDataByKmAggr(
	data: DataPointAggr[],
	gridKm: number,
	centerLatitude: number = 37.5,
): AggregatedPointAggr[] {
	// 1km에 해당하는 위도 차이 (적도 기준으로 대략적인 값)
	const baseLatitudeGridSize = 1 / 111; // 위도 1km에 해당하는 값

	// 경도의 그리드 크기 조정 (위도의 영향 받음)
	const baseLongitudeGridSize = baseLatitudeGridSize / Math.cos(centerLatitude * (Math.PI / 180));

	// 주어진 km 단위로 그리드 크기 계산
	const latitudeGridSize = baseLatitudeGridSize * gridKm;
	const longitudeGridSize = baseLongitudeGridSize * gridKm;

	// 그리드로 취합된 결과 저장
	const aggregatedData: { [key: string]: AggregatedPointAggr } = {};

	// 그리드 셀 좌표로 변환 및 데이터 취합
	data.forEach(({ x, y, weight, value }) => {
		// 그리드 셀 좌표를 계산 (gridKm 단위로 반올림)
		const gridX = Math.floor(x / longitudeGridSize);
		const gridY = Math.floor(y / latitudeGridSize);

		// 그리드 셀의 키를 문자열로 생성
		const gridKey = `${gridX},${gridY}`;

		// 그리드 셀에 데이터 추가
		if (!aggregatedData[gridKey]) {
			aggregatedData[gridKey] = {
				x: gridX * longitudeGridSize + longitudeGridSize / 2, // 셀의 중심 좌표로 이동
				y: gridY * latitudeGridSize + latitudeGridSize / 2, // 셀의 중심 좌표로 이동
				weight: 0,
				value: 0,
			};
		}

		// 가중합 및 가중평균 계산
		const currentPoint = aggregatedData[gridKey];
		currentPoint.weight += weight;
		currentPoint.value += value * weight; // 가중합 계산
	});

	// 가중평균을 구하고 그리드 셀의 값을 배열로 변환하여 반환
	return Object.values(aggregatedData).map((point) => ({
		...point,
		value: point.value / point.weight, // 가중평균 계산
	}));
}
