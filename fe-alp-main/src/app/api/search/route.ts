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

import { NextResponse, NextRequest } from "next/server";
import { serverUrl } from "@/constants/path";
import { formatQueryString } from "@/utils/query";
import apiClient from "@/libs/apiClient";

const ALLOWED_PAGES = ["mop", "alp", "llp"] as const;
type AlloedPage = (typeof ALLOWED_PAGES)[number];

const SEARCH_PATH_MAP = {
	mop: {
		normal: "/mop/search",
		flow: "/mop/search/flow"
	},
	alp: {
		normal: "/alp/search"
	},
	llp: {
		normal: "/llp/search"
	}
} as const;

function validatePageName(value:string | null): AlloedPage{
	if(!value || !ALLOWED_PAGES.includes(value as AlloedPage)){
		throw new Error("Invalid pageName");
	}
	return value as AlloedPage;
}

export async function POST(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const pageName = validatePageName(searchParams.get("pageName"));
	const isFlow = searchParams.get("isFlow") === "true"; // 생활이동 - 출도착지분석

	const searchQueryParams = await req.json();

	const pagePaths = SEARCH_PATH_MAP[pageName];
	const path = isFlow && "flow" in pagePaths ? pagePaths.flow : pagePaths.normal;


	try {
		const response = await apiClient.get(path, { params : searchQueryParams });

		return NextResponse.json({ ok: true, result: response.data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
