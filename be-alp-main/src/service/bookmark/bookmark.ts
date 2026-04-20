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
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { deleteBookmarkGroupAggs } from "./groupAggs";
import { transBookmarkDataList } from "@/utils/bookmark/transBookmark";
import {
  createBookmarkAggs,
  createBookmarkBulk,
  deleteBookmarkAggs,
  getBookmarkDataAggs,
} from "./bookmarkAggs";
import { getBookmarkChartsAggs } from "./bookmarkByScreenAggs";

// 북마크 데이터 조회 by GroupId
export async function getBookmarkDataByGroupId(
  userId: string,
  groupId: string
): Promise<BookmarkData> {
  const result = await getBookmarkDataAggs(userId, groupId);
  const data = transBookmarkDataList(result);

  return data;
}

// 북마크 생성
export async function createBookmark(
  userId: string,
  bookmarkData: BookmarkParams
) {
  const result = await createBookmarkAggs(userId, bookmarkData);
  return result;
}

// 북마크 삭제
export async function deleteBookmark(
  userId: string,
  bookmarkData: BookmarkParams,
  bookmarkGroupList: BookmarkGroupList
) {
  await deleteBookmarkAggs(userId, bookmarkData, bookmarkGroupList);
}

// 북마크 이동
export async function moveBookmark(
  userId: string,
  bookmarkMoveData: BookmarkParams,
  checkedGroupIds: string[],
  bookmarkGroupList: BookmarkGroupList
) {
  const changes = getGroupChanges(
    bookmarkMoveData.data.bookmarkedGroupIds,
    checkedGroupIds
  );
  if (changes.toAdd.length !== 0)
    await createBookmarkBulk(
      userId,
      {
        ...bookmarkMoveData,
        groupIds: changes.toAdd,
      },
      bookmarkGroupList
    );
  if (changes.toRemove.length !== 0)
    await deleteBookmarkAggs(
      userId,
      {
        ...bookmarkMoveData,
        groupIds: changes.toRemove,
      },
      bookmarkGroupList
    );
}
/*
  screenDataService에서 사용하는 북마크 데이터 호출
  화면, 필터 조건별에 맞는 북마크 유무 판단
*/
export async function getGroupIdsForCharts(
  userId: string,
  screenId: string,
  options: ParamsOptions
) {
  const result = await getBookmarkChartsAggs(userId, screenId, options);
  return result;
}

function getGroupChanges(groupIds: string[], checkedGroupIds: string[]) {
  //삭제할 그룹
  const toRemove = groupIds.filter((id) => !checkedGroupIds.includes(id));

  const toAdd = checkedGroupIds.filter((id) => !groupIds.includes(id));

  return { toAdd, toRemove };
}
