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

// 북마크 폴더 조회
export async function getBookmarkGroupsData(userId: string) {
  const query: any = {
    query: {
      bool: {
        filter: [
          {
            term: {
              USER_ID: userId,
            },
          },
        ],
      },
    },
    sort: [
      {
        GROUP_ID: {
          order: "asc",
        },
      },
    ],
    aggs: {
      chart_by_group: {
        terms: {
          field: "GROUP_ID",
          size: bookmarkConfig.maxGroup + 1,
          order: {
            _key: "asc",
          },
        },
        aggs: {
          group_info: {
            filter: {
              term: {
                TYPE: 0,
              },
            },
            aggs: {
              info: {
                top_hits: {
                  _source: ["GROUP_NM", "DESC"],
                  size: 1,
                },
              },
            },
          },
          charts: {
            terms: {
              field: "DATA_ID",
              size: bookmarkConfig.maxBookmark + 1,
              order: {
                max_order: "asc",
              },
            },
            aggs: {
              max_order: {
                max: {
                  field: "DATA_ODRG",
                },
              },
              chart_info: {
                top_hits: {
                  _source: [
                    "DATA_ODRG",
                    "DATA_ID",
                    "DATA.title",
                    "DATA.charts.name",
                  ],
                  size: 1,
                },
              },
            },
          },
        },
      },
    },
  };

  try {
    const response = await searchWithLogging({
      index: bookmarkConfig.index,
      body: query,
    });

    return response.body.aggregations.chart_by_group.buckets;
  } catch (error) {
    console.error(error);
  }
}

// 북마크 폴더 생성
export async function createBookmarkGroupAggs(
  userId: string,
  group: BookmarkGroupParams
) {
  const body: any = {
    USER_ID: userId,
    TYPE: 0,
    GROUP_ID: group.groupId,
    GROUP_NM: group.groupName,
    DESC: group.description,
  };

  try {
    const response = await searchWithLogging({
      method: "index",
      index: bookmarkConfig.index,
      body: body,
      refresh: "wait_for", // 작업 완료 후 즉시 검색 반영
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
// 북마크 폴더 편집
export async function updateBookmarkGroupAggs(
  userId: string,
  group: BookmarkGroup
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
            term: {
              GROUP_ID: group.groupId,
            },
          },
          {
            term: {
              TYPE: 0, //북마크 폴더
            },
          },
        ],
      },
    },
    script: {
      source: `ctx._source.GROUP_NM = '${group.groupName}'; ctx._source.DESC = '${group.description}';`,
      lang: "painless",
    },
  };

  try {
    const response = await searchWithLogging({
      method: "updateByQuery",
      index: bookmarkConfig.index,
      body: query,
      refresh: true, // 작업 완료 후 즉시 검색 반영
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
// 북마크 순서 변경
export async function updateBookmarkOrderAggs(group: BookmarkGroup) {
  try {
    const updatedBookmarks: any[] = [];

    group.data.forEach((groupData) => {
      updatedBookmarks.push(
        {
          update: { _index: bookmarkConfig.index, _id: groupData._id },
        },
        { doc: { DATA_ODRG: groupData.order } }
      );
    });
    const response = await searchWithLogging({
      method: "bulk",
      body: updatedBookmarks,
      refresh: "wait_for",
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 북마크 폴더 삭제
export async function deleteBookmarkGroupAggs(userId: string, groupId: string) {
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
            term: {
              GROUP_ID: groupId,
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
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
