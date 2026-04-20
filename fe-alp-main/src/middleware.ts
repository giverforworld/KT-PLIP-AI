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
import type { NextRequest } from "next/server";
import { basePath, loginUrl, PATHS, prometheusUrl } from "./constants/path";
import { getCorsConfig } from "./utils/cors";
import { getUserSessionOnServerSide } from "./services/server/getUserSessionOnServerSide";
import { sendLogData, sendLogDataToBE } from "./services/server/sendLogdata";
import { menuList } from "./constants/menu";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const cleanPath = pathname.replace(basePath, "") || "/";
	const redirectPath = getRedirectPath(cleanPath, basePath);
	const session = await getUserSessionOnServerSide();
	// if (pathname === "/health" || pathname.startsWith("/_next/static")) return NextResponse.next();
	// if (!pathname.startsWith("/_next/static")) console.log("middleware  pathname =>", pathname);
	if (
		pathname === "/health" ||
		pathname === "/metrix" ||
		pathname === `/${PATHS.LOGIN}` ||
		pathname === `${basePath}/${PATHS.LOGIN}` ||
		pathname === "/" ||
		pathname.startsWith("/_next/static")
		// ||
		// pathname.startsWith(`${basePath}/_next/static`)
	)
		return NextResponse.next();

	console.log("middleware  request =>", request.headers.get("origin"), pathname, request.method);

	// CORS
	const corsResponse = handleCORS(request);

	//사용자 확인 api session 체크 안함
	if (pathname.includes("auth") || pathname.includes("user-validate")) {
		if (corsResponse) return corsResponse;
		return NextResponse.next();
	}
	// if (redirectPath) return NextResponse.redirect(new URL(redirectPath, request.url));

	if (!session.user) {
		console.log("middleware no session redirect");
		const redirectResponse = NextResponse.redirect(
			new URL(`${basePath}/${PATHS.LOGIN}`, request.url),
			302,
		);
		redirectResponse.headers.set(
			"Cache-Control",
			"no-store, no-cache, must-revalidate, proxy-revalidate",
		);
		redirectResponse.headers.set("Pragma", "no-cache");
		redirectResponse.headers.set("Expires", "0");

		return redirectResponse;
		// return NextResponse.redirect(loginUrl);
	}
	console.log("middleware user ---> ", session.user.userId);

	if (corsResponse) return corsResponse;

	// 사용자 권한 체크
	const permissionGranted = hasPermission(cleanPath, session.user.alpAuthCd);
	if (!permissionGranted) {
		return NextResponse.redirect(new URL(`${basePath}/${PATHS.AUTH}`, request.url));
	}
	if (redirectPath) return NextResponse.redirect(new URL(redirectPath, request.url));

	const user = session?.user?.userId || "guest";
	// const user = "guest";

	//개발 모드에서 주석
	await sendLogData(request, user);
	// await sendLogDataToBE(request, user)

	return NextResponse.next();
}

function handleCORS(request: NextRequest) {
	const origin = request.headers.get("origin");
	console.log("handleCORS Check");
	if (origin) {
		const corsOptions = getCorsConfig(origin);
		if (corsOptions) {
			const response = NextResponse.next();
			response.headers.set("Access-Control-Allow-Origin", origin);
			response.headers.set("Access-Control-Allow-Methods", corsOptions.methods);
			response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			response.headers.set("Access-Control-Allow-Credentials", corsOptions.credentials);
			return response;
		} else {
			return new NextResponse(null, { status: 403 }); // 허용되지 않은 origin 차단
		}
	}
	return null;
}

function getRedirectPath(cleanPath: string, basePath: string): string | null {
	const redirectMap: Record<string, string> = {
		"/": `/${PATHS.DAS}`,
		[`/${PATHS.ALP}`]: `/${PATHS.ALP}/${PATHS.STATUS}`,
		[`/${PATHS.LLP}`]: `/${PATHS.LLP}/${PATHS.STATUS}`,
		[`/${PATHS.MOP}`]: `/${PATHS.MOP}/${PATHS.STATUS}`,
	};

	const targetPath = redirectMap[cleanPath];
	return targetPath ? `${basePath}${targetPath}` : null;
}

/**
 * 경로를 기반으로 권한을 체크하는 함수
 */
function hasPermission(pathname: string, alpAuthCd: AlpAuthCd): boolean {
	// 메뉴 목록에서 요청된 경로에 해당하는 메뉴 찾기
	for (const menu of menuList) {
		if (menu.path === pathname.split("/")[1]) {
			// 해당 메뉴에 권한 코드가 있으면 권한 코드가 일치하는지 확인
			if (menu.alpAuthCd && !menu.alpAuthCd.includes(alpAuthCd)) {
				return false; // 권한 없음
			}

			const subPath = menu.subMenu?.find((sub) => sub.path === pathname.split("/")[2]);
			if (subPath === undefined) return true;

			// 해당 서브메뉴에 권한 코드가 있으면 권한 코드가 일치하는지 확인
			if (subPath.alpAuthCd && !subPath.alpAuthCd.includes(alpAuthCd)) {
				return false; // 권한 없음
			}
			return true; // 권한 있음
		}
	}
	// 지역별 대시보드는 준회원 불가능
	if (pathname.includes(PATHS.REG_DAS) && alpAuthCd === "4") {
		return false;
	}
	// 메뉴에 해당하지 않으면 기본적으로 권한 확인 안함
	return true;
}
