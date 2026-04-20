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
import { verifyToken, getTokenExpiry, checkExistingSession } from "@/services/server/token";
import { basePath, serverUrl } from "@/constants/path";
import { addSggRegionInfo } from "@/services/filterRegionInfo";
import { groupedSgg } from "@/containers/regional-dashboard/proto/constants/groupedRegions";

export async function POST(req: NextRequest) {
	const { pathname } = req.nextUrl;
	// console.log("request api auth/token route =>", req.headers.get("origin"), pathname, req.method);

	try {
		const body = await req.json();
		// baseInfo = 기본계약지역, apdInfo = 부가계약지역, alpAuthCd = 권한코드,
		// 준회원인 경우 baseInfo = "", apdInfo = ""
		// {plipTestAccount} = 다운로드 권한 테스트
		const { userid, access_token, refresh_token, baseInfo, apdInfo, alpAuthCd, auth } = body;

		if (!userid || !access_token) {
			return NextResponse.json({ ok: false, error: "Missing userId or Token" }, { status: 400 });
		}

		// 중복 로그인 처리
		const existingSession = await checkExistingSession(userid, access_token);
		if (existingSession) {
			return NextResponse.json({ ok: false, error: "User already logged in" }, { status: 403 });
		}

		// TO_BE_CHECKED: 토큰 검증
		const payload = verifyToken(access_token);
		// console.log("payload =>", payload);
		if (!payload) {
			return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
		}
		// const accessTokenExpiry = getTokenExpiry(refresh_token, process.env.JWT_SECRET!);
		// const refreshTokenExpiry = getTokenExpiry(refresh_token, process.env.JWT_SECRET!);
		// const sessionExpiry = refreshTokenExpiry - Date.now(); // refresh token 만료까지 남은 시간

		// 쿠키에서 세션 정보 추출
		const cookieStore = await cookies();

		// getIronSession에 쿠키 정보를 넘겨서 세션 생성
		const session = await getIronSession<SessionData>( cookieStore, {
			...sessionOptions,
			// cookieOptions: { ...sessionOptions.cookieOptions, maxAge: sessionExpiry }, // refresh token 만료 시간과 동기화 해줌
		});

		// 세션에 유저 정보 저장
		// session.user = payload.name;

		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const regionInfo: any = await fetch(`${serverUrl}/gis/regionInfo?date=${year}${month}`).then(
			(res) => res.json(),
		);
		//쿠키 용량 문제로  apdInfo, baseInfo => number로 변환해서 저장
		// let parseApdInfo = alpAuthCd === "4" ? [] : apdInfo.map((item: string) => Number(item));

		// 준회원인 경우 예외
		let parseApdInfo = apdInfo !== "" ? apdInfo.map((item: string) => Number(item)) : [11680];

		// 대표 지역 정보 추가
		// 대표 지역이 시도이면 해당 시군구 첫번째 지역으로 지역 정보 추가
		// 통합 시군구 제외
		let baseRegionCode = baseInfo;
		if (baseInfo.length === 2) {
			baseRegionCode = Object.keys(regionInfo).find(
				(item) =>
					item.length === 5 &&
					item.startsWith(baseInfo.toString()) &&
					!Object.keys(groupedSgg).includes(String(item)),
			);
		}
		const info: RegionInfo = baseInfo === "" ? undefined : regionInfo[baseRegionCode as string];

		const baseRegion = info
			? {
					sido: {
						name: info.sidoName ?? "",
						code: info.sidoCode,
					},
					sgg: { name: info.sggName ?? "", code: info.sggCode ?? "" },
					adm: { name: "", code: "" },
				}
			: {
					sido: {
						name: "서울특별시",
						code: "11",
					},
					sgg: { name: "강남구", code: "11680" },
					adm: { name: "", code: "" },
				};

		session.user = {
			userId: userid,
			apdInfo: parseApdInfo,
			baseInfo: baseInfo === "" ? 11680 : Number(baseInfo),
			alpAuthCd,
			baseRegion,
		}; // Test User
		session.isLoggedIn = true;
		session.accessToken = access_token;
		// session.refreshToken = refresh_token;
		// session.accessTokenExpiry = accessTokenExpiry;
		// session.refreshTokenExpiry = refreshTokenExpiry;

		await session.save();

		return NextResponse.json({ ok: true, redirectUrl: `${basePath}/dashboard` }, { status: 200 });
		// return NextResponse.json({ ok: true, plipTestAccount: plipTestAccount ?? "N", redirectUrl: `${basePath}/dashboard` }, { status: 200 });
		// return NextResponse.redirect(domain + basePath, 302);
	} catch (error) {
		// console.log("error!:", error);
		return NextResponse.json({ ok: false, message: "api route error", error }, { status: 500 });
	}
}

/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: 토큰 검증 및 세션 생성
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
 *               refresh_token:
 *                 type: string
 *                 description: Refresh Token
 *                 example: "<refresh-token>"
 *     responses:
 *       200:
 *         description: 테스트
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: ture
 *                 userId:
 *                   type: string
 *                   example: "alp01@kt.com"
 *       302:
 *         description: 토큰 검증 및 세션 생성 성공시 대시보드 리다이렉트
 *         headers:
 *           Location:
 *             description: redirect URL
 *             schema:
 *               type: string
 *               example: "/dashboard"
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
 *         description: 유효하지 않은 토큰일 경우
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
 *                   example: "Invalid token"
 *       403:
 *         description: 중복 로그인일 경우
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
 *                   example: "User already logged in"
 */
