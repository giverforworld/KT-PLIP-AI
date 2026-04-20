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
import { bookmarkConfig } from "@/config/bookmarkConfig";

// 북마크 조회
export async function getBookmarkDataAggs(userId: string, groupId: string) {
  const query: any = {
    size: bookmarkConfig.maxBookmark + 5,
    query: {
      bool: {
        filter: [
          {
            term: {
              USER_ID: userId,
            },
          },
          {
            term: {
              GROUP_ID: groupId,
            },
          },
        ],
      },
    },
    sort: [
      {
        DATA_ODRG: {
          order: "asc",
        },
      },
    ],
  };

  try {
    const response = await searchWithLogging({
      index: bookmarkConfig.index,
      body: query,
    });

    return response.body.hits.hits;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 북마크 생성
export async function createBookmarkAggs(
  userId: string,
  bookmarkData: BookmarkParams
) {
  const { start, end, ...filterOptions } = bookmarkData.options;
  const now = Date.now();
  const body: any = {
    USER_ID: userId,
    TYPE: 1,
    GROUP_ID: bookmarkData.groupIds[0],
    PAGE_NM: bookmarkData.page,
    STP_PAGE_NM: bookmarkData.subPage,
    MONTH_YN: start.length === 6 ? 0 : 1,
    ST_YMD: start,
    END_YMD: end,
    RGN_CD:
      "region" in filterOptions
        ? filterOptions.region
        : filterOptions.regionArray[0],
    FILTER: filterOptions,
    DATA_ID: bookmarkData.dataId,
    DATA_ODRG: bookmarkData.order,
    DATA: bookmarkData.data,
    CRET_DATE: now,
  };

  try {
    const response = await searchWithLogging({
      method: "index",
      index: bookmarkConfig.index,
      body: body,
      refresh: "wait_for",
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createBookmarkBulk(
  userId: string,
  bookmarkData: BookmarkParams,
  bookmarkGroupList: BookmarkGroupList
) {
  const { start, end, ...filterOptions } = bookmarkData.options;
  const now = Date.now();

  const bulkBody: any[] = [];

  bookmarkData.groupIds.forEach((groupId) => {
    bulkBody.push({
      index: { _index: bookmarkConfig.index },
      refresh: true,
    });
    const order =
      bookmarkGroupList.data.find((group) => group.groupId === groupId)?.data
        .length ?? 0;
    const body: any = {
      USER_ID: userId,
      TYPE: 1,
      GROUP_ID: groupId,
      PAGE_NM: bookmarkData.page,
      STP_PAGE_NM: bookmarkData.subPage,
      MONTH_YN: start.length === 6 ? 0 : 1,
      ST_YMD: start,
      END_YMD: end,
      RGN_CD:
        "region" in filterOptions
          ? filterOptions.region
          : filterOptions.regionArray[0],
      FILTER: filterOptions,
      DATA_ID: bookmarkData.dataId,
      DATA_ODRG: order, // order 수정해야햄
      DATA: bookmarkData.data,
      CRET_DATE: now,
    };
    bulkBody.push(body);
  });

  try {
    const response = await searchWithLogging({
      method: "bulk",
      body: bulkBody,
      refresh: "wait_for",
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 북마크 삭제
export async function deleteBookmarkAggs(
  userId: string,
  bookmarkData: BookmarkParams,
  bookmarkGroupList: BookmarkGroupList
) {
  const query = {
    query: {
      bool: {
        filter: [
          {
            term: {
              USER_ID: userId,
            },
          },
          {
            terms: {
              GROUP_ID: bookmarkData.groupIds,
            },
          },
          {
            term: {
              DATA_ID: bookmarkData.dataId,
            },
          },
        ],
      },
    },
  };

  try {
    const response = await searchWithLogging({
      method: "deleteByQuery",
      index: bookmarkConfig.index,
      body: query,
      refresh: true, // 작업 완료 후 즉시 검색 반영
    });

    //삭제된 북마크 이후의 차트들 order 업데이트
    const updatedBookmarks: any[] = [];
    let updateRequired = false;

    bookmarkGroupList.data.forEach((group) => {
      if (bookmarkData.groupIds.includes(group.groupId)) {
        const deletedOrder = group.data.find(
          (data) => data.dataId === bookmarkData.dataId
        )?.order;
        if (deletedOrder !== undefined) {
          group.data.forEach((chart) => {
            if (chart.dataId !== bookmarkData.dataId) {
              const currentOrder = chart.order;
              if (currentOrder > deletedOrder) {
                updatedBookmarks.push(
                  {
                    update: { _index: bookmarkConfig.index, _id: chart._id },
                  },
                  { doc: { DATA_ODRG: currentOrder - 1 } }
                );
                updateRequired = true;
              }
            }
          });
        }
      }
    });
    if (updateRequired) {
      const response = await searchWithLogging({
        method: "bulk",
        body: updatedBookmarks,
        refresh: "wait_for",
      });
      return response;
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
