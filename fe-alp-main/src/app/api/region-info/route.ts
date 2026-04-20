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

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { serverUrl } from "@/constants/path";
import apiClient from "@/libs/apiClient";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/services/server/session";
import { cookies } from "next/headers";

// const serverUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL;

export async function GET(req: Request) {
	const url = new URL(req.url);
	const start = url.searchParams.get("start"); // "start" 쿼리 파라미터 추출

	if (!start) return NextResponse.json({ ok: false, result: "no params" });
	// const result = getMapProperties(start);

	//back api 로 수정
	const reqUrl = `${serverUrl}/gis/regionInfo`;
	const queryProps = {
		date: start,
		type: 0,
	};
	const result = await apiClient
		.get(reqUrl, { params: queryProps })
		.then((response) => response.data);
	const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
	const filteredInfo = filterRegionInfo(result, session.user.baseInfo, session.user.apdInfo);

	return NextResponse.json({ ok: true, regionInfo: result, filteredInfo });
}

function getMapProperties(start: string) {
	let fileName = "regionInfoSH.json";
	const dateMapping = [
		{ maxDate: "202306", jsonFileNm: "regionInfoSH_202306.json" },
		{ maxDate: "202312", jsonFileNm: "regionInfoSH_202312.json" },
		{ maxDate: "202401", jsonFileNm: "regionInfoSH_202401.json" },
	];

	for (const { maxDate, jsonFileNm } of dateMapping) {
		if (start <= maxDate) {
			fileName = jsonFileNm;
			break;
		}
	}
	const filePath = path.join(process.cwd(), "public", "maps", "properties", fileName);
	const file = fs.readFileSync(filePath, "utf8");
	return JSON.parse(file);
}
