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

import axios from "axios";
import { basePath } from "@/constants/path";
import { getAges, getTimezone } from "@/utils/query";

export const revalidate = 1;

export async function getGisTimeLineChartData(
	analysisType: 0 | 1 | 2 | 3,
	isGrid: boolean,
	regions: number,
	start: number,
	end: number,
	isSelectTime: 0 | 1,
	timezn: number[],
	patterns: number[],
	isPurpose: boolean,
	gender: number[],
	age: number[],
	isNative: boolean,
	inOutFlow: boolean,
): Promise<TlChartData[] | undefined> {
	const body = {
		analysisType,
		isGrid,
		regions,
		start,
		end,
		isSelectTime,
		timezn: getTimezone(isSelectTime, timezn),
		patterns,
		isPurpose,
		gender,
		age: covertAges(age),
		isNative,
		inOutFlow,
	};

	const { data } = await axios.post(`${basePath}/api/gis/chart/time`, body);
	if (data.ok) {
		return data.result;
	}
}
function covertAges(age: number[]) {
	// 전체 선택 (0이 포함된 경우)
	if (age.includes(0)) {
		return ["0", "10", "20", "30", "40", "50", "60", "70", "80"];
	}

	// age 값들을 10의 배수 문자열로 변환
	return age.map((a) => ((a - 1) * 10).toString()).sort();
}
