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
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/services/server/session";
import apiClient from "@/libs/apiClient";
import { loginUrl } from "@/constants/path";
import axios from "axios";

export async function POST(req: NextRequest) {
	try {
		const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

		await session.destroy(); // 세션 삭제

		const response = NextResponse.json({ ok: true, url: loginUrl }, { status: 200 });
		// 쿠키 삭제 추가 처리
		// response.cookies.set(sessionOptions.cookieName, '', {
		// 	path: '/',
		// 	maxAge: 0,
		// 	expires: new Date(0),
		// });

		// 브라우저 캐시 방지 설정
		// response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
		// response.headers.set("Pragma", "no-cache");
		// response.headers.set("Expires", "0");

		return response;
		// }
	} catch (error) {
		console.error("Failed to destroy session:", error);
		return NextResponse.json({ ok: false, error }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃 (ALP)
 *     description: 로그아웃 및 사용자 세션 삭제
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: 서버에서 세션 삭제 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to logout"
 */
