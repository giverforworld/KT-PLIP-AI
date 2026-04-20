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
import useUrlMap from "@/hooks/queries/useUrlMap";
import { useEffect } from "react";

export default function RedirectLoginPage() {
	//url urlmapMap 에서 가져오기
	const { useUrlMapQuery } = useUrlMap();
	const { data: urlmap } = useUrlMapQuery();

	useEffect(() => {
		// console.log("redirect Login Page useEffect");
		if (urlmap && urlmap.loginUrl !== "") {
			if (typeof window !== "undefined") {
				// console.log("redirect Login UseEffect");
				window.location.href = urlmap.loginUrl;
			}
		}
	}, [urlmap]);

	return <></>;
}
