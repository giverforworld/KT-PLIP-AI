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

import { NextResponse, NextRequest } from "next/server";
import {
	formatQueryString,
	getAges,
	getDayofWeek,
	getGender,
	getTimezone,
	gisAlpChartdataHandling,
	gisMopChartdataHandling,
} from "@/utils/query";
import { serverUrl } from "@/constants/path";
import { EAnalysisType } from "@/constants/gis";
import apiClient from "@/libs/apiClient";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
	const queriesValue = await req.json();

	const {
		analysisType,
		isGrid,
		regions,
		start,
		end,
		isSelectTime,
		timezn,
		patterns,
		isPurpose,
		gender,
		age,
		inOutFlow,
	} = queriesValue;
	const queries =
		analysisType === 0
			? {
					regions,
					start,
					end,
					// timezn,
					gender: getGender(gender),
					age: age,
					patterns,
				}
			: analysisType === 1
				? {
						spaceType: isGrid ? 1 : 0,
						regions,
						start,
						end,
						// timezn,
						isPurpose,
						gender: getGender(gender),
						age: age,
						isInflow: inOutFlow,
					}
				: {
						regions,
						start,
						end,
						timezn: getTimezone(isSelectTime, timezn),
						patterns,
					};

	const queryString = formatQueryString(queries);
	try {
		const response = await apiClient.get(
			`${serverUrl}/gis/${EAnalysisType[analysisType]}/chartTimeSeries?${queryString}`,
		);
		return NextResponse.json(
			{
				ok: true,
				result:
					analysisType === 0
						? gisAlpChartdataHandling(response.data[0].chartData)
						: gisMopChartdataHandling(response.data),
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("chartTimeSeries API fetch failed", error);
		return NextResponse.json({ ok: false, error: "Failed to fetch data" }, { status: 500 });
	}
}
