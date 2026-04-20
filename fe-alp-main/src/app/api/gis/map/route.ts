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

// const serverUrl = process.env.NEXT_PUBLIC_EXPRESS_API_URL;

export async function GET(req: Request) {
	const url = new URL(req.url);
	const name = url.searchParams.get("name"); // "name" 쿼리 파라미터 추출

	if (!name) return NextResponse.json({ ok: false, result: "no params" });
	// console.log("api/gis/map/ => ", name);
	//TO-BE-CHECKED 월별 조회로 수정
	if (!name.includes("Topo")) {
		const queryProps = {
			// date: "202408",
			date: name,
		};
		const reqUrl = `${serverUrl}/gis/topojson`;
		const result = await apiClient
			.get(reqUrl, { params: queryProps })
			.then((response) => response.data);
		return NextResponse.json({ ok: true, result });
	} else {
		const result = getMap(name + ".json");

		return NextResponse.json({ ok: true, result });
	}
}

// dev-local data
function getMap(name: string) {
	const filePath = path.join(process.cwd(), "public", "maps", name);
	const file = fs.readFileSync(filePath, "utf8");
	return JSON.parse(file);
}
