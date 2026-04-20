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
 * 주어진 숫자가 배열의 몇 분위에 속하는지에 따라 RGB 색상을 반환하는 함수
 * @param value - 분위를 결정할 기준 숫자
 * @param arr - 분위를 나눌 숫자들의 배열 (길이는 최소 1 이상)
 * @returns RGB 색상 배열
 */
const colors: RGB[] = [
	[205, 17, 3],
	[212, 45, 15],
	[219, 74, 29],
	[226, 102, 42],
	[233, 130, 55],
	[241, 159, 68],
	[248, 187, 81],
];
export function getRankedColor(value: number, arr: number[], isDepopul: boolean = false): RGB {
	if (arr.length === 0) {
		throw new Error("배열의 길이는 최소 1 이상이어야 합니다.");
	}

	// 배열을 오름차순으로 정렬
	const sortedArr = [...arr].sort((a, b) => a - b);

	const N = sortedArr.length;
	const totalQuantiles = 7;

	// 분위의 크기 계산
	const baseSize = Math.floor(N / totalQuantiles);
	const remainder = N % totalQuantiles;

	// 각 분위에 할당할 요소 수 계산
	const quantileSizes: number[] = Array.from({ length: totalQuantiles }, (_, i) =>
		i < remainder ? baseSize + 1 : baseSize,
	);

	// 분위별 경계값 설정
	sortedArr.reverse();
	const quantiles: number[][] = [];
	let startIndex = 0;
	for (let i = 0; i < totalQuantiles; i++) {
		const size = quantileSizes[i];
		if (size > 0) {
			const endIndex = startIndex + size;
			quantiles.push(sortedArr.slice(startIndex, endIndex));
			startIndex = endIndex;
		} else {
			quantiles.push([]);
		}
	}

	// 분위 찾기
	let quantileIndex = -1;
	for (let i = 0; i < quantiles.length; i++) {
		const q = quantiles[i];
		if (q.length === 0) continue;

		const max = q[0];
		const min = q[q.length - 1];

		if (min === max) {
			if (value >= min) {
				quantileIndex = i;
				break;
			}
		} else {
			if (value >= min && value <= max) {
				quantileIndex = i;
				break;
			}
		}
		quantileIndex = i;
	}

	// 만약 value가 모든 분위의 범위를 벗어나면 가장 가까운 분위에 속하게 함
	if (quantileIndex === -1) {
		if (value < sortedArr[0]) {
			quantileIndex = 0;
		} else {
			quantileIndex = quantiles.length - 1;
		}
	}

	// 분위에 해당하는 색상 반환
	return isDepopul ? [...colors].reverse()[quantileIndex] : colors[quantileIndex];
}
