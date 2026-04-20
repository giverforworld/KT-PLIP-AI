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

import axios from "axios";
import { basePath } from "@/constants/path";
import jwt from "jsonwebtoken";
/**
 * 현재 유저의 세션 데이터 가져오기
 */
export const getUser = async (): Promise<User | undefined> => {
	const { data } = await axios.get(`${basePath}/api/auth/user-validate`);
	if (data.ok) return data.user;
};

/**
 * 로그아웃
 */
export const logout = async (url: string) => {
	const response = await axios.get(`${basePath}/api/auth/get-session`);
	if (response.status === 200) {
		const token = response.data.accessToken;

		const bdipUrl = `${url}/bdip/api/v1/login/logoutToken`;

		//access-token 가져와서 사용자 아이디
		const payload = verifyToken(token);

		if (payload && (payload as Record<string, string>).userid) {
			const userid = (payload as Record<string, string>).userid;
			try {
				const response = await axios.post(bdipUrl, { bdipUserId: userid });
				if (response.status === 200) {
					const { data } = await axios.post(`${basePath}/api/auth/logout`);
					return data;
				}
			} catch (error: any) {
				console.log("logout() error =>", error);
			}
		}
	}
	// }
};

function verifyToken(token: string, secret?: string) {
	try {
		// const decoded = jwt.verify(token, secret);
		const decoded = jwt.decode(token);
		return decoded;
	} catch (error) {
		return null;
	}
}
