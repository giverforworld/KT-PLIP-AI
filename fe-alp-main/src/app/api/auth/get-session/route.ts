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

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/services/server/session";

export async function GET(req: Request) {
	const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
	if (session && session.accessToken) {
		return NextResponse.json({ ok: true, accessToken: session.accessToken }, { status: 200 });
	}

	return NextResponse.json({ ok: false }, { status: 500 });
}
