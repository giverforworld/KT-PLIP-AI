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

import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
	password: process.env.NEXT_PUBLIC_SESSION_PW!,
	cookieName: "ALPSession",
	cookieOptions: {
		// path: "/",
		// domain: ".kt.com",
		// sameSite: "None",
		// httpOnly: true, // 클라이언트에서 쿠키를 읽을 수 없도록 함
		// secure: process.env.NODE_ENV === "production", // https에서만 쿠키 전송
		secure: false,
		maxAge: 60 * 60 * 4, // dev
	},
};

export interface SessionData {
	user: User;
	isLoggedIn: boolean;
	accessToken?: string | null;
	refreshToken?: string;
	accessTokenExpiry?: number;
	refreshTokenExpiry?: number;
}
