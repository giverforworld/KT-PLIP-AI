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
import { formatQueryString, getTimezone } from "@/utils/query";
import axios from "axios";
import { serverUrl } from "@/constants/path";

export async function POST(req: NextRequest) {
	const queriesValue = await req.json();
	const { isNative, start, end, regions, isSelectTime, timezn } = queriesValue;

	const queryString = formatQueryString({
		isNative,
		start,
		end,
		regions,
		isSelectTime,
		timezn: getTimezone(isSelectTime, timezn),
	});

	try {
		const response = await axios.get(`${serverUrl}/gis/alp/chart?${queryString}`);
		return NextResponse.json({ ok: true }, { status: 200 });
		// return NextResponse.json(
		// 	{ ok: true, result: gisChartdataHandling(response.data[0].chartData) },
		// 	{ status: 200 },
		// );
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
