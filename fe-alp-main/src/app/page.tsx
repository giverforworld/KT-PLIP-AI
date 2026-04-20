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

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { basePath } from "@/constants/path";
import useUser from "@/hooks/queries/useUser";
import axios from "axios";
import useUrlMap from "@/hooks/queries/useUrlMap";

export default function Page() {
	const router = useRouter();

	//url configMap 에서 가져오기
	const { useUrlMapQuery } = useUrlMap();
	const { data: urlmap } = useUrlMapQuery();

	const { useUserQuery } = useUser();
	const { data: user } = useUserQuery();

	const [event, setEvent] = useState<MessageEvent | null>();
	const handleMessage = async (event: MessageEvent, loginUrl: string) => {
		// const { userid, access_token, refresh_token, apdInfo, baseInfo, contId } = event.data;
		const body = event.data;
		// console.log("body: event.data ==", body);

		try {
			const { data } = await axios.post(`${basePath}/api/auth/token`, body, {
				withCredentials: true,
			});
			// console.log("api data =>", data);

			// 다운로드 권한 테스트
			// if (data.plipTestAccount) {
			// 	sessionStorage.setItem("TA", JSON.stringify(data.plipTestAccount));
			// }

			if (data.ok) {
				router.push(`/dashboard`);
			} else {
				// console.log("api: token validation failed");
			}
		} catch (error: any) {
			// console.log("page /api/auth/token error =>", error);
			if (error.status === 400) {
				alert(error.response.data.error);
				// window.location.href = loginUrl;
			} // Missing userId or Token
			if (error.status === 403 || error.status === 401) {
				alert(error.response.data.error);
				router.push(`/dashboard`);
			} // User already logged in or Invalid token
		}
	};
	// 1. 컴포넌트 마운트시 부모 창으로 메세지 신호
	useEffect(() => {
		if (urlmap && urlmap.bdipUrl !== "") {
			if (window.opener) {
				window.opener.postMessage({ message: "Ready" }, urlmap.bdipUrl);
				// console.log("Ready", urlmap.bdipUrl);
			} else {
				console.error("no opener");
				//개발 모드에서 주석
				window.location.href = urlmap.loginUrl;
			}
		}
	}, [urlmap]);

	// 2. 부모 창에서 데이터 수신
	useEffect(() => {
		window.addEventListener("message", (event: MessageEvent) => setEvent(event));

		return () => {
			window.removeEventListener("message", (event: MessageEvent) => setEvent(event));
		};
	}, []);

	// 3. 데이터 수신 후 처리 // TO_BE_CHECKED: user-validate
	useEffect(() => {
		// console.log("handleMessageFunc_Event =>", event);
		if (urlmap && urlmap.bdipUrl !== "")
			if (user?.userId) {
				router.push(`/dashboard`);
			} else if (event && event.origin === urlmap.bdipUrl) {
				handleMessage(event, urlmap.bdipUrl);
			}
	}, [event, urlmap]);

	// Mock Event
	// 개발 모드에서 주석
	return null;
}
