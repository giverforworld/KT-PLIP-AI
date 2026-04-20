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
import { IronSession, getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/services/server/session";
import { getTokenExpiry } from "@/services/server/token";
import { basePath, bdipUrl } from "@/constants/path";
import axios from "axios";
import { USERTYPE } from "@/constants/user";

export async function GET(req: Request) {
	// console.log("path. bdipUrl ==>", bdipUrl);
	const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
	if (session && session.user) {
		// console.log(session.user);
		// const { ok, redirectToLogin } = await refreshAccessTokenIfExpired(
		// 	session,
		// 	session.refreshToken,
		// );

		// if (!ok || redirectToLogin) return NextResponse.redirect(loginUrl);
		// TO_BE_CHEKCED: 응답 후 Client에서 alert & redirect 처리하기
		// 사용자 이름 마스킹 or 권한 표기
		const user = {
			...session.user,
			userId: USERTYPE[session.user.alpAuthCd],
		};
		return NextResponse.json({ ok: true, user: user }, { status: 200 });
	}

	return NextResponse.json({ ok: false }, { status: 401 });
}

/**
 * 토큰 만료 여부 확인 및 리프레시 토큰 요청 (TO_BE_CHEKCED)
 * @param session
 * @param refreshToken
 */
async function refreshAccessTokenIfExpired(
	session: IronSession<SessionData>,
	refreshToken: string | undefined,
) {
	const currentTime = Date.now();

	// Access Token이 유효한 경우
	if (session.accessToken && session.accessTokenExpiry && currentTime < session.accessTokenExpiry) {
		return { ok: true, redirectToLogin: false };
	}

	// Refresh Token이 없거나 만료된 경우
	if (!refreshToken || (session.refreshTokenExpiry && currentTime > session.refreshTokenExpiry)) {
		await session.destroy();
		return { ok: false, redirectToLogin: true };
	}

	// Access Token 갱신
	try {
		const response = await axios.post(`${basePath}/api/auth/refresh-token`, {
			refresh_token: refreshToken,
		});

		if (response.status === 200 && response.data.ok) {
			const { accessToken: newAccessToken } = response.data;

			const newAccessTokenExpiry = getTokenExpiry(newAccessToken, process.env.JWT_SECRET!);

			session.accessToken = newAccessToken;
			session.accessTokenExpiry = newAccessTokenExpiry;
			await session.save();

			return { ok: true, redirectToLogin: false };
		} else {
			// 토큰 갱신 실패한 경우 세션 삭제
			await session.destroy();
			return { ok: false, redirectToLogin: true };
		}
	} catch (error) {
		console.error("Token refresh failed:", error);
		return { ok: false, redirectToLogin: true };
	}
}

/**
 * @swagger
 * /api/auth/user-validate:
 *   get:
 *     summary: 현재 유저 아이디 조회 - Client
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   description: The details of the authenticated user.
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "alp01@kt.com"
 *       401:
 *         description: 조회 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 */
