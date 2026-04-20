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
import { serverUrl } from "@/constants/path";
import apiClient from "@/libs/apiClient";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const start = searchParams.get("start");
	const region = searchParams.get("region");

	try {
		const response = await apiClient.get(
			`${serverUrl}/regional-dashboard?start=${start}&region=${region}`,
		);
		const result = response.data;

		return NextResponse.json({ ok: true, result }, { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{ ok: false, error: "Failed to fetch data from the server." },
			{ status: 500 },
		);
	}
}
