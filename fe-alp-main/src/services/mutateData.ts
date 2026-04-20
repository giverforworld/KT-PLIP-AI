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

import axios from "axios";
import { basePath } from "@/constants/path";

/**
 * 북마크 폴더 생성
 */
export const createBookmarkGroup = async (formData: FormData) => {
	const { data } = await axios.post(`${basePath}/api/bookmark-group`, formData);
	return data;
};

/**
 * 북마크 폴더 수정
 */
export const updateBookmarkGroup = async (groupId: string, formData: FormData) => {
	const { data } = await axios.put(`${basePath}/api/bookmark-group?groupId=${groupId}`, formData);
	return data;
};

/**
 * 북마크 폴더 삭제
 */
export const deleteBookmarkGroup = async (groupId: string) => {
	const { data } = await axios.delete(`${basePath}/api/bookmark-group?groupId=${groupId}`);
	return data;
};

/**
 * 북마크 생성
 */
export const createBookmark = async (bookmarkData: BookmarkParams) => {
	const { data } = await axios.post(`${basePath}/api/bookmark`, bookmarkData, {
		headers: { "Content-Type": "application/json" },
	});
	return data;
};
/**
 * 북마크 삭제
 */
export const deleteBookmark = async (deleteBookmarkData: DeleteBookmarkData) => {
	const { data } = await axios.delete(`${basePath}/api/bookmark`, {
		data: { ...deleteBookmarkData },
		headers: { "Content-Type": "application/json" },
	});
	return data;
};

/**
 * 북마크 폴더 이동
 */
export const moveBookmark = async (moveBookmarkData: MoveBookmarkParams) => {
	const { data } = await axios.put(`${basePath}/api/bookmark`, moveBookmarkData, {
		headers: { "Content-Type": "application/json" },
	});
	return data;
};
