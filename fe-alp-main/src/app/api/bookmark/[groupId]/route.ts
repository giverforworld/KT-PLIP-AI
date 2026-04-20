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
// import { bookmarkDummy } from "@/constants/dummy/bookmarkDummy";
import apiClient from "@/libs/apiClient";
import { serverUrl } from "@/constants/path";

// let bookmarkGroupList: BookmarkGroupList = bookmarkDummy;
type Props = {
	params:Promise<{groupId:string}>
}

export async function GET(req: NextRequest, {params}:Props) {
	const { groupId } = await params;
	try {
		const response = await apiClient.get(`${serverUrl}/bookmark/${groupId}`);
		return NextResponse.json({ ok: true, result: response.data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
