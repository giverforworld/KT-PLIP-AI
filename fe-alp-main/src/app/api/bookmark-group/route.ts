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
import util from "util";
// let bookmarkGroupList: BookmarkDataList = bookmarkDummy;

export async function GET(req: NextRequest) {
	try {
		const response = await apiClient.get(`${serverUrl}/bookmark-group`);

		return NextResponse.json({ ok: true, result: response.data }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const formData = await req.formData();

	if (!formData || !Array.from(formData.entries()).length) {
		return NextResponse.json({ ok: false, error: "Form data is required" }, { status: 400 });
	}

	try {
		const newGroup = {
			groupId: `group-${Date.now()}`,
			groupName: (formData.get("groupName") as string) || "새 그룹",
			description: (formData.get("description") as string) || "",
		};

		await apiClient.post(`${serverUrl}/bookmark-group`, newGroup);

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const groupId = searchParams.get("groupId");
	const formData = await req.formData();
	if (!groupId) {
		return NextResponse.json({ ok: false, error: "groupId is required" }, { status: 400 });
	}

	const data = JSON.parse(formData.get("data") as string) as BookmarkGroupData[];

	const updateGroup = {
		groupId: groupId,
		groupName: (formData.get("groupName") as string) || "",
		description: (formData.get("description") as string) || "",
		data: data,
	};
	try {
		await apiClient.put(`${serverUrl}/bookmark-group`, updateGroup);

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}

function validateGroupId(value: string | null): string {
	if (!value) {
		throw new Error("groupId is required");
	}
	
	// group- + 숫자(timestamp)
	const groupIdRegex = /^group-\d{10,}$/;

	if(!groupIdRegex.test(value)){
		throw new Error("Invalid groupId format");
	}

	return value;
}

export async function DELETE(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const groupId = validateGroupId(searchParams.get("groupId"));
	
	if (!groupId) {
		return NextResponse.json({ ok: false, error: "groupId is required" }, { status: 400 });
	}

	try {
		await apiClient.delete(`${serverUrl}/bookmark-group/${groupId}`);

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
