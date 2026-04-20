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

const RANK_ANALYSIS_PATH_MAP = {
	mop: "/mop/rank-analysis/ranking",
	alp: "/alp/rank-analysis/ranking",
	llp: "/llp/rank-analysis/ranking"
}

function validatePageName(value:string | null): AlloedPage{
	if(!value || !ALLOWED_PAGES.includes(value as AlloedPage)){
		throw new Error("Invalid pageName");
	}
	return value as AlloedPage;
}

export async function POST(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const pageName = validatePageName(searchParams.get("pageName"));

	const searchQueryParams = await req.json();
	const queryString = formatQueryString(searchQueryParams);
	const path = RANK_ANALYSIS_PATH_MAP[pageName];
	
	if (pageName ==='llp' && queryString.split('&')[2].split('=')[1] === ''
		|| pageName === 'llp' && queryString.split('&')[2].split('=')[1].toString().length === 2) {
		return NextResponse.json({ ok: true, result: null }, { status: 200 });
	}

	try {
		const response = await apiClient.get(path, { params: searchQueryParams });

		return NextResponse.json({ ok: true, result: response.data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
