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

import { useEffect } from "react";
import { useShowToast } from "@/hooks/useToastShow";

export default function NotAuthorized() {
	const showToast = useShowToast();

	useEffect(() => {
		// 팝업 메시지
		showToast("프리미엄 회원만 이용 가능합니다", "warning", "middle");

		// 2초 후 뒤로 가기
		setTimeout(() => {
			window.history.back();
		}, 1000);
	}, [showToast]);

	return null;
}
