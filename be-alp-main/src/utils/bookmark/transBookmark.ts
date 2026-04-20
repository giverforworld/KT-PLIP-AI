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

export function transBookmarkGroupList(buckets: any[]): BookmarkGroup[] {
  const data = buckets.map((group) => ({
    groupId: group.key,
    groupName: group.group_info.info.hits.hits[0]._source.GROUP_NM,
    description: group.group_info.info.hits.hits[0]._source.DESC,
    data: group.charts.buckets.map((chart: any) => {
      const chartInfo = chart.chart_info.hits.hits[0];
      return {
        order: chartInfo._source.DATA_ODRG,
        dataId: chartInfo._source.DATA_ID,
        dataTitle: chartInfo._source.DATA.title,
        chartName: chartInfo._source.DATA.charts[0].name,
        _id: chartInfo._id,
      };
    }),
  }));
  return data ?? [];
}

// 북마크 폴더별 북마크 데이터 변환
export function transBookmarkDataList(buckets: any[]): BookmarkData {
  const group = buckets.find((bucket) => bucket._source.TYPE == 0);
  const result: BookmarkData = {
    groupId: group._source.GROUP_ID,
    groupName: group._source.GROUP_NM,
    description: group._source.DESC,
    data: [],
  };
  result.data = buckets
    .filter((bucket) => bucket._source.TYPE == 1)
    .map((bucket) => {
      return {
        dataId: bucket._source.DATA_ID,
        order: bucket._source.DATA_ODRG,
        isBookmarked: true,
        ...{
          ...bucket._source.DATA,
          bookmarkedGroupIds: [group._source.GROUP_ID],
        },
        page: bucket._source.PAGE_NM,
        subPage: bucket._source.STP_PAGE_NM,
        options: {
          ...bucket._source.FILTER,
          start: bucket._source.ST_YMD,
          end: bucket._source.END_YMD,
        },
        _id: bucket._id,
      };
    });
  return result;
}
