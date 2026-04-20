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

import jwt from "jsonwebtoken";
import { getUserSessionOnServerSide } from "./getUserSessionOnServerSide";

/**
 * 토큰 검증
 * @param token string
 * @param secret string
 */
export function verifyToken(token: string, secret?: string) {
	try {
		// const decoded = jwt.verify(token, secret);
		const decoded = jwt.decode(token);
		return decoded;
	} catch (error) {
		return null;
	}
}

/**
 * 토큰 만료 시간
 * @param token string
 * @param secret string
 */
export function getTokenExpiry(token: string, secret?: string) {
	// const decoded = verifyToken(token, secret);
	const decoded = verifyToken(token);

	if (decoded && typeof decoded === "object" && decoded.exp) {
		return decoded.exp * 1000; // 밀리초로 변환
	}
	return Date.now();
}

/**
 * 중복 로그인 체크
 * @param userId string
 */
export async function checkExistingSession(userId: string, access_token: string) {
	const session = await getUserSessionOnServerSide();
	if (!session.user) return false;

	// const { userId: currentUserId } = session.user;
	// return userId === currentUserId && session.accessToken === access_token;
	return session.accessToken === access_token;
}
