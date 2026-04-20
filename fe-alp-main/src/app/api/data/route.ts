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

const ALLOWED_SUBPAGES = [
	"status",
	"purpose",
	"trans",
	"pattern",
	"comparative-analysis",
	"traits",
	"rank-analysis",
] as const;

const SEARCH_PATH_MAP = {
	mop: {
		status: "/mop/status",
		purpose: "/mop/purpose",
		trans: "/mop/trans",
		traits: "/mop/traits",
		"rank-analysis": "/mop/rank-analysis",
	},
	alp: {
		status: "/alp/status",
		pattern: "/alp/pattern",
		"comparative-analysis": "/alp/comparative-analysis",
		"rank-analysis": "/alp/rank-analysis",
	},
	llp: {
		status: "/llp/status",
		traits: "/llp/traits",
		"rank-analysis": "/llp/rank-analysis",
	},
} as const;

type AlloedSubPage = (typeof ALLOWED_SUBPAGES)[number];

function validatePageName(value: string | null): AlloedPage {
	if (!value || !ALLOWED_PAGES.includes(value as AlloedPage)) {
		throw new Error("Invalid pageName");
	}
	return value as AlloedPage;
}

function validateSubPageName(value: string | null): AlloedSubPage {
	if (!value || !ALLOWED_SUBPAGES.includes(value as AlloedSubPage)) {
		throw new Error("Invalid pageName");
	}
	return value as AlloedSubPage;
}

export async function POST(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const pageName = validatePageName(searchParams.get("pageName"));
	const subPageName = validateSubPageName(searchParams.get("subPageName"));
	const isFlow = searchParams.get("isFlow") === "true"; // 생활이동 - 출도착지분석
	const path = SEARCH_PATH_MAP[pageName][subPageName as keyof typeof SEARCH_PATH_MAP[typeof pageName]];
	const realPath = isFlow ? `${path}/flow`: path;

	const searchQueryParams = await req.json();

	try {
		const response = await apiClient.get(realPath, { params: searchQueryParams });

		return NextResponse.json({ ok: true, result: response.data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
