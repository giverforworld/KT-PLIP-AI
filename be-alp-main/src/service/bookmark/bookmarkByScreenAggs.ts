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
import { generateFilter } from "@/utils/bookmark/generateFilter";
import { screenPageMap } from "@/config/screenConfig";

export async function getBookmarkChartsAggs(
  userId: string,
  screenId: string,
  options: ParamsOptions
) {
  const { PAGE_NM, STP_PAGE_NM } = screenPageMap[screenId];

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
              TYPE: 1,
            },
          },
          {
            term: {
              PAGE_NM,
            },
          },
          {
            term: {
              STP_PAGE_NM:
                "isPurpose" in options
                  ? options.isPurpose
                    ? "purpose"
                    : "trans"
                  : STP_PAGE_NM,
            },
          },
          ...generateFilter(options),
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
    _source: ["GROUP_ID", "DATA_ID"],
  };
  try {
    const response = await searchWithLogging({
      index: bookmarkConfig.index,
      body: query,
    });

    const groupIdsMap: Record<string, string[]> = {};

    response.body.hits.hits.forEach((hit: any) => {
      const dataId = hit._source.DATA_ID;
      const groupId = hit._source.GROUP_ID;
      if (!groupIdsMap[dataId]) {
        groupIdsMap[dataId] = [];
      }
      groupIdsMap[dataId].push(groupId);
    });

    return groupIdsMap;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
