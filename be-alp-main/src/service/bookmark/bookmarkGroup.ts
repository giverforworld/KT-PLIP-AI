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

import util from "util";
import {
  createBookmarkGroupAggs,
  deleteBookmarkGroupAggs,
  getBookmarkGroupsData,
  updateBookmarkGroupAggs,
  updateBookmarkOrderAggs,
} from "./groupAggs";
import { transBookmarkGroupList } from "@/utils/bookmark/transBookmark";

// 북마크 폴더 조회
export async function getBookmarkGroupList(
  userId: string
): Promise<BookmarkGroupList> {
  let result;
  result = await getBookmarkGroupsData(userId);
  //폴더 없으면 임시보관함 폴더 생성
  if (result.length === 0) {
    const temp: any = {
      groupId: "group-01",
      groupName: "임시보관함",
      description: "",
    };

    try {
      await createBookmarkGroupAggs(userId, temp);
      result = await getBookmarkGroupsData(userId);
    } catch (error) {
      console.error("Failed to add Group:", (error as Error).message);
      throw new Error(`Failed to add Group: ${(error as Error).message}`);
    }
  }

  const list = transBookmarkGroupList(result);

  return {
    data: list,
  };
}

// 북마크 폴더 생성
export async function createBookmarkGroup(
  userId: string,
  group: BookmarkGroupParams
): Promise<BookmarkGroupList> {
  const result = await createBookmarkGroupAggs(userId, group);
  return result;
}

// 북마크 폴더 편집
export async function updateBookmarkGroup(
  userId: string,
  group: BookmarkGroup
) {
  // 북마크 폴더 명 , 설명 수정
  await updateBookmarkGroupAggs(userId, group);
  // 차트 순서 변경된 차트 있으면 변경
  if (group.data.length !== 0) await updateBookmarkOrderAggs(group);
}

// 북마크 폴더 삭제
export async function deleteBookmarkGroup(userId: string, groupId: string) {
  await deleteBookmarkGroupAggs(userId, groupId);
}
