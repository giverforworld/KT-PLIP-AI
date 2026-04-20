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

export async function updateDatainfo(datainfo: Datainfo): Promise<any> {
  const bulkBody: any[] = [];

  datainfo.forEach((datainfo) => {
    bulkBody.push({
      update: { _index: "datainfo", _id: 1, routing: 1 },
    });
    bulkBody.push({
      doc: datainfo,
      doc_as_upsert: true,
    });
  });

  const response = await searchWithLogging({
    method: "bulk",
    body: bulkBody,
    refresh: "wait_for",
  });

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
export async function getDatainfoFromOpenSearch(): Promise<string[]> {
  const response = await searchWithLogging({
    index: "datainfo",
    body: {
      _source: ["START", "END"],
    },
  });
  return response.body.hits.hits.map((hit: any) => hit._source);
}
