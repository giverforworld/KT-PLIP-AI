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

export async function POST(req: NextRequest) {
	const { pathname } = req.nextUrl;
	// console.log(
	// 	"request delete-session api route =>",
	// 	req.headers.get("origin"),
	// 	pathname,
	// 	req.method,
	// );

	try {
		const body = await req.json();
		const { userid, access_token } = body;
		// console.log("delete-session body =>", body);

		if (!userid || !access_token) {
			return NextResponse.json({ ok: false, error: "Missing userid or Token" }, { status: 400 });
		}

		const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
		// console.log("session", session);

		if (!session.user) {
			return NextResponse.json({ ok: false, error: "No session.user" }, { status: 401 });
		}

		if (userid === session.user.userId && access_token === session.accessToken) {
			// console.log("delete if");
			// 세션 삭제
			await session.destroy();
			// console.log("delete-session session =====>>");
			// console.log(session);

			const response = NextResponse.json({ ok: true }, { status: 200 });

			// console.log("delete-session response =====>>");
			// console.log(response);

			// 쿠키 삭제 추가 처리
			response.cookies.set(sessionOptions.cookieName, "", {
				path: "/",
				maxAge: 0,
				expires: new Date(0),
			});
			// console.log("delete-session response.cookies =====>>");
			// console.log(response);

			// console.log(response.cookies.getAll());

			// 브라우저 캐시 방지 설정
			// response.headers.set(
			// 	"Cache-Control",
			// 	"no-store, no-cache, must-revalidate, proxy-revalidate",
			// );
			// response.headers.set("Pragma", "no-cache");
			// response.headers.set("Expires", "0");

			return response;
		}

		return NextResponse.json({ ok: false, error: "Invalid userid or token" }, { status: 401 });
	} catch (error) {
		console.error("Failed to destroy session:", error);
		return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/auth/delete-session:
 *   post:
 *     summary: 로그아웃 (BDIP)
 *     description: BDIP 로그아웃할 시 ALP 사용자 세션 삭제
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 description: User Id
 *                 example: "alp01@kt.com"
 *               access_token:
 *                 type: string
 *                 description: Access Token
 *                 example: "<access-token>"
 *     responses:
 *       200:
 *         description: 세션 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   example: "alp01@kt.com"
 *       400:
 *         description: 아이디 혹은 토큰을 받아오지 못한 경우
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
 *                   example: "Missing userid or token"
 *       401:
 *         description: 유효하지 않은 아이디 혹은 토큰일 경우
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
 *                   example: "Invalid userid or token"
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
