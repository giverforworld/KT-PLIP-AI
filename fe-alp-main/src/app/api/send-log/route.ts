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
import { SessionData, sessionOptions } from "@/services/server/session";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

const safeJSONStringify = (value: any) => {
	return JSON.stringify(value, (key, val) => {
		if (typeof val === "string") {
			return val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS 방지
		}
		return val;
	});
};

export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        return NextResponse.json({ ok: false, result: "no logData"})
    }
    const logData = await req.json();

    if (!logData) {
        return NextResponse.json({ ok: false, result: "no logData" }); 
    }
    const ip =
			req.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
			req.headers.get("X-Real-IP")?.trim() ||
			req.headers.get("x-real-ip")?.trim(); ;

    const IP = ip?.replace(/^.*:/, "");
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const USER = session?.user?.userId;

    try {
        const response = await fetch(`${serverUrl}/usrinfo/get`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: safeJSONStringify({ ...logData, IP, USER }),
				});

        const text = await response.text();
        if (!response.ok) {
            console.error(`BackEnd responded with error: ${response.status} ${response.statusText}`)
            console.error("Response body:", text)
            return NextResponse.json({ ok: false, result: "error"})
        } else {
            return NextResponse.json({ ok: true, result: "logData sent to BackEnd successfully"})
        }
    } catch (error) {
        console.error("Failed to send logData to BackEnd:", error);
        return NextResponse.json({ ok: false, result: "error occrured"})
    }
}