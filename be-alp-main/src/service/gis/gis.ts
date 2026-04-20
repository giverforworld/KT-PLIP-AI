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

import { getIndexYList } from "@/helpers/getIndexList";
import { searchWithLogging } from "@/lib/searchWithLogiging";

export async function getTopojsonData(date: string): Promise<any> {
  const query = {
    size: 1,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: date,
            },
          },
        ],
      },
    },
  };

  const index = (await getIndexYList(date, date, `topojson`)).join(",");

  try {
    const response = await searchWithLogging({
      index: index,
      body: query,
    });
    const data = response.body.hits.hits[0]._source.INFO;
    const filtered = date === "202602" ? {
      ...data,
      objects: {
        ...data.objects,
        data: {
          ...data.objects.data,
          geometries: data.objects.data.geometries.filter(
            (item: any) => !(item.properties.REGION_NM === "화성(서)")
          ),
        },
      },
    }: data;
    return filtered;
    // return response.body.hits.hits[0]._source.INFO;
  } catch (error) {
    console.error(error);
    throw new Error("failed get topojson from opensearch");
  }
}

export async function getRegionInfoData(date: string): Promise<any> {
  const query = {
    size: 1,
    query: {
      bool: {
        filter: [
          {
            term: {
              BASE_YM: date,
            },
          },
          {
            term: {
              TYPE: 0,
            },
          },
        ],
      },
    },
  };

  const index = (await getIndexYList(date, date, `rgn_info`)).join(",");

  try {
    const response = await searchWithLogging({
      index: index,
      body: query,
    });
    return response.body.hits.hits[0]._source.INFO;
  } catch (error) {
    console.error(error);
    throw new Error("failed get topojson from opensearch");
  }
}
