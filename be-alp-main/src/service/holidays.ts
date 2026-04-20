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
import { formatDateToYYYYMMDD, getStartEndDate } from "@/helpers/convertDate";
import { searchWithLogging } from "@/lib/searchWithLogiging";
import { isValidMonth } from "@/middlewares/validators";

export async function updateHolidays(holidays: Holidays): Promise<any> {
  const bulkBody: any[] = [];

  holidays.forEach((holiday) => {
    bulkBody.push({
      index: { _index: "holidays", _id: holiday.DATE, routing: holiday.DATE },
      refresh: true,
    });
    bulkBody.push(holiday);
  });

  const response = await searchWithLogging({
    method: "bulk",
    body: bulkBody,
    refresh: "wait_for",
  });

  // errors가 true일 경우 예외를 발생시킴
  if (response.body.errors) {
    const errorItems = response.body.items.filter(
      (item: any) => item.index && item.index.error
    );
    throw new Error(
      `Bulk request failed for ${errorItems.length} items: ${util.inspect(
        errorItems,
        { depth: null }
      )}`
    );
  }

  return response;
}
// OpenSearch에서 공휴일 데이터를 불러오는 함수
export async function getHolidaysFromOpenSearch(
  start: string,
  end: string
): Promise<string[]> {
  if (isValidMonth(start)) {
    const convertDate = getStartEndDate(start, end);
    start = formatDateToYYYYMMDD(convertDate.startDate);
    end = formatDateToYYYYMMDD(convertDate.endDate);
  }

  // OpenSearch에서 공휴일 데이터 조회
  const response = await searchWithLogging({
    index: "holidays",
    body: {
      track_total_hits: true,
      size: 100,
      query: {
        range: {
          DATE: {
            gte: start,
            lte: end,
          },
        },
      },
    },
  });

  return response.body.hits.hits.map((hit: any) => hit._source.DATE);
}
