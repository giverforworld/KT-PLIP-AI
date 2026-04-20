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
import { bdipUrl, loginUrl } from "@/constants/path";

export async function GET(req: NextRequest) {
	if (bdipUrl && bdipUrl.startsWith("http")) {
		// console.log(bdipUrl, loginUrl);
		return NextResponse.json({ ok: true, url: { bdipUrl, loginUrl } }, { status: 200 });
	}

	return NextResponse.json(
		{ ok: false, error: "Failed to fetch url from the configMap." },
		{ status: 500 },
	);
}
