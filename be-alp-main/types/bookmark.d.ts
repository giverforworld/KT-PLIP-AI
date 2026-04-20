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

// 북마크 폴더
type BookmarkGroupList = {
  userId?: string;
  data: BookmarkGroup[];
};
type BookmarkGroup = {
  groupId: string;
  groupName: string;
  description: string;
  data: BookmarkGroupData[];
};
type BookmarkGroupData = {
  order: number;
  dataId: string;
  dataTitle: string;
  chartName: string;
  _id?: string;
};

// 폴더별 북마크 데이터
type BookmarkDataList = {
  userId?: string;
  data: BookmarkData[];
};
type BookmarkData = {
  groupId: string;
  groupName: string;
  description: string;
  data: BookmarkGroupChartData[];
};
type BookmarkGroupParams = {
  groupId: string;
  groupName: string;
  description: string;
};
type BookmarkParams = {
  groupIds: string[];
  page: string;
  subPage: string;
  options: ParamsOptions;
  order: number;
  dataId: string;
  data?: any;
};
type BookmarkGroupChartData = {
  id?: string;
  title: string;
  summary?: string | string[] | Summary | Summaries;
  charts: ChartData[];
  isBookmarked?: boolean;
  dataId?: string;
  bookmarkedGroupIds?: string[];
  order: number;
  page: string;
  subPage: string;
  options: ParamsOptions;
  _id?: string;
};
