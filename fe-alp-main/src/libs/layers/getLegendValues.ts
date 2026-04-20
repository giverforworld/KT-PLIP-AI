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

type RGB = [number, number, number];

/**
 * 주어진 숫자 배열을 7분위로 나누고, 각 분위에 해당하는 레이블과 색상을 반환하는 함수
 * 배열의 길이가 7보다 작을 경우, 부족한 분위는 "0"과 "rgb(0, 0, 0)"으로 채움 (뒤에)
 * @param arr - 분위를 나눌 숫자들의 배열 (길이는 최소 1 이상)
 * @returns { labels: string[], colors: string[] } - 7개의 레이블과 색상 배열
 */
export function getLegendValuesForAdm(
	arr: number[],
	isDepopul: boolean = false,
): { labels: string[]; colors: string[] } {
	if (arr.length === 0) {
		throw new Error("배열의 길이는 최소 1 이상이어야 합니다.");
	}

	// 7분위에 대응하는 색상 배열 (1분위부터 7분위까지)
	const baseColorMap: RGB[] = [
		[205, 17, 3], // 1분위
		[212, 45, 15], // 2분위
		[219, 74, 29], // 3분위
		[226, 102, 42], // 4분위
		[234, 130, 55], // 5분위
		[241, 158, 68], // 6분위
		[248, 187, 81], // 7분위
	];
	const colorMap = isDepopul ? [...baseColorMap].reverse() : baseColorMap;
	const totalQuantiles = 7;
	// 내림차순 정렬
	const sortedArr = [...arr].sort((a, b) => b - a);
	const N = sortedArr.length;

	// 분위의 크기 계산 (Math.ceil 사용)
	const quantileSizes: number[] = [];
	let remaining = N;
	for (let i = 0; i < totalQuantiles; i++) {
		const size = Math.ceil(remaining / (totalQuantiles - i));
		quantileSizes.push(size);
		remaining -= size;
	}

	// 분위별 데이터 슬라이싱
	const quantiles: number[][] = [];
	let startIndex = 0;
	for (let i = 0; i < totalQuantiles; i++) {
		const size = quantileSizes[i];
		if (size > 0 && startIndex < sortedArr.length) {
			quantiles.push(sortedArr.slice(startIndex, startIndex + size));
			startIndex += size;
		} else {
			quantiles.push([]);
		}
	}

	const labels: string[] = [];
	const colors: string[] = [];

	// 분위별 레이블과 색상 할당
	const quantilesWithData = quantiles.filter((q) => q.length > 0);
	const dataQuantilesCount = quantilesWithData.length;

	for (let i = 0; i < dataQuantilesCount; i++) {
		const q = quantilesWithData[i];
		let label: string;

		if (i === 0) {
			// 첫 번째 분위는 "x 이상"
			const min = Math.ceil(q[q.length - 1]) - 1;
			label = `${min.toLocaleString()} 초과`;
		} else if (i < dataQuantilesCount - 1) {
			// 중간 분위는 "y 이상 ~ z 미만"
			const prevQ = quantilesWithData[i - 1];
			const prevMin = Math.ceil(prevQ[prevQ.length - 1]) - 1;
			const currentMin = Math.ceil(q[q.length - 1]);

			if (currentMin === 0) label = "0";
			else label = `${currentMin.toLocaleString()} ~ ${prevMin.toLocaleString()} `;
		} else {
			// 마지막 데이터 분위는 "x 이하"
			// const min = Math.ceil(q[q.length - 1]);
			const min = Math.ceil(quantilesWithData[i - 1][0]) - 1;
			if (min <= 0) label = "0";
			else label = `${min.toLocaleString()} 이하`;
		}

		labels.push(label);
		colors.push(`rgb(${colorMap[i][0]}, ${colorMap[i][1]}, ${colorMap[i][2]})`);
	}

	// 부족한 분위수에 대해 "0"과 "rgb(0, 0, 0)" 추가 (뒤에)
	const emptyQuantiles = totalQuantiles - dataQuantilesCount;
	for (let i = 0; i < emptyQuantiles; i++) {
		labels.push("0");
		colors.push("rgb(0, 0, 0)");
	}

	return {
		labels,
		colors,
	};
}
