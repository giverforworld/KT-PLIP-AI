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

"use client";
import * as React from "react";

export default function ChartTooltip({ tooltipInfo }: any) {
	if (!tooltipInfo.data) return;
	const {
		data: { chartData },
	} = tooltipInfo;
	if (!chartData || Object.keys(chartData).length < 1) return;
	const tableData = preprocessData(chartData);
	return (
		<div className="flex w-full min-w-48 flex-col justify-between gap-1 rounded-md bg-gray-100 p-2">
			{/* <p className="font-bold">{Math.ceil(count).toLocaleString()} 명</p> */}
			{tableData.map((el: any) => (
				<div key={el.key} className="flex w-full justify-between gap-4">
					<div>{el.key}</div>
					<div>
						<div className="flex min-w-[120px] justify-between gap-2">
							<p>남성</p>
							<p className="font-semibold">{Math.ceil(el.male).toLocaleString()} 명</p>
						</div>
						<div className="flex justify-between gap-2">
							<p>여성</p>
							<p className="font-semibold">{Math.ceil(el.female).toLocaleString()} 명</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function preprocessData(data: any) {
	// 연령대별 데이터를 저장할 객체
	const ageGroups: any = {};

	// 데이터 순회
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			const [gender, ageStr] = key.split("_");
			let age = parseInt(ageStr, 10);
			let ageKey: string;

			// 연령대 키 설정
			if (isNaN(age)) {
				// 숫자가 아닌 경우 (예: 'ALL' 등)
				continue; // 현재 데이터에는 없지만, 필요 시 처리 가능
			} else {
				if (age === 0) {
					ageKey = "10대 미만";
				} else if (age >= 80) {
					ageKey = "80세 이상";
				} else {
					ageKey = `${age}대`;
				}
			}

			// ageKey가 아직 객체에 없으면 초기화
			if (!ageGroups[ageKey]) {
				ageGroups[ageKey] = { key: ageKey, male: 0, female: 0 };
			}

			// 성별에 따라 값 할당
			if (gender.toUpperCase() === "MALE") {
				ageGroups[ageKey].male = data[key];
			} else if (gender.toUpperCase() === "FEML") {
				ageGroups[ageKey].female = data[key];
			}
		}
	}

	// 객체를 배열로 변환
	const result = Object.values(ageGroups);

	// 연령대 오름차순 정렬
	result.sort((a: any, b: any) => {
		return getAgeOrder(a.key) - getAgeOrder(b.key);
	});

	return result;
}
function getAgeOrder(ageKey: string): number {
	if (ageKey === "10대 미만") return 0;
	if (ageKey === "80세 이상") return 80;

	const match = ageKey.match(/^(\d+)대$/);
	if (match) {
		return parseInt(match[1], 10);
	}

	return 999; // 예기치 않은 연령대 키는 가장 뒤로
}
