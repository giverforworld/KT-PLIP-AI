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

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
	const { refresh_token } = await req.json();

	if (!refresh_token) {
		return NextResponse.json({ ok: false, error: "Missing refresh token" }, { status: 400 });
	}

	try {
		// TO_BE_CHECKED: 액세스 토큰 갱신
		const { data } = await axios.post("bdip", { refresh_token });

		if (!data.ok) {
			return NextResponse.json(
				{ ok: false, error: "Failed to refresh access token" },
				{ status: 401 },
			);
		}
		const newAccessToken = data.accessToken;

		return NextResponse.json({ ok: true, accessToken: newAccessToken }, { status: 200 });
	} catch (error) {
		console.error("Error refreshing token:", error);
		return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
	}
}
