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

import { basePath } from "@/constants/path";

export async function logginFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    try {
        const resolvedUrl = new URL(
            typeof input === "string" ? input : input.toString(),
            window.location.origin
        );

        const url = decodeURIComponent(resolvedUrl.href);
        const pathname = decodeURIComponent(resolvedUrl.pathname);

        const timestamp = Date.now();
	    const current = new Date(timestamp);
	    const BASE_YMD = current.toLocaleDateString("ko-KR", {
		    year: "numeric",
		    month: "2-digit",
		    day: "2-digit",
	    }).replace(/\.\s?/g, "");

        fetch(`${basePath}/api/send-log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BASE_TMST: Date.now(),
                BASE_YMD: BASE_YMD,
                PATH: pathname,
                URL: url,
            }),
        });
    } catch (error) {
        console.warn("Failed to send log data to backend", error);
    }
    return fetch(input, init);
}