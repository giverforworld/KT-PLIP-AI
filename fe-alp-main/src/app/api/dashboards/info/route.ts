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
import axios from "axios";
import { serverUrl } from "@/constants/path";
import apiClient from "@/libs/apiClient";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const start = searchParams.get("start");

	if (!start) {
		return NextResponse.json(
			{ ok: false, error: "Missing 'start' query parameter" },
			{ status: 400 },
		);
	}

	try {
		const response = await apiClient.get(`${serverUrl}/dashboards/info?start=${start}`);

		const result = Object.values(
			response.data.reduce(
				(acc: any, item: any) => {
					if (!acc[item.sidoCode]) {
						acc[item.sidoCode] = { sidoCode: item.sidoCode, data: [] };
					}

					acc[item.sidoCode].data.push({
						key: item.key,
						value: item.value,
						prevMonthComparison: item.prevMonthComparison,
						prevYearComparison: item.prevYearComparison,
					});
					return acc;
				},
				{} as Record<string, any>,
			) || {},
		);

		return NextResponse.json({ ok: true, result }, { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ ok: false, error: "Failed to fetch data from the server." },
			{ status: 500 },
		);
	}
}
