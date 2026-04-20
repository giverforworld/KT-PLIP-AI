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

type DataResult = {
  statSummary: StatSummariesObj[] | StatSummary[];
  dataGroups: DataGroup[];
};
type SearchDataResult = SearchSummary[];
// type SearchSummary = {
//   title: string;
//   data: string | number;
//   type?: string;
//   unit?: string;
// };
type SearchSummary = {
  title: string;
  data: SearchSummaryDataObj[] | SearchSummaryData[];
  type?: string;
  unit?: string;
};
type SearchSummaryDataObj = {
  regionName: string;
  value: {
    Avg: string | number;
    Unique: string | number;
  };
};
type SearchSummaryData = {
  regionName: string;
  data: Record<string, string | number>;
};
type TransResult = {
  stat?: StatSummariesObj[] | StatSummaryObj[];
  data: ChartDataContainer;
};
type StatSummary = {
  regionName: string;
  data: string[];
};
type StatSummariesObj = {
  regionName: string;
  data: { [key: string]: Record<string, string> };
};

type StatSummaryObj = {
  regionName: string;
  data: { [key: string]: string };
};

type DataGroup = {
  title: string;
  data: ChartDataContainer[];
};
type ChartDataContainer = {
  id?: string;
  title: string;
  summary?: string | string[] | Summary | Summaries;
  charts: ChartData[];
  isBookmarked?: boolean;
  dataId?: string;
  bookmarkedGroupIds?: string[];
};
type ChartHandlerData = {
  stat?:
    | StatSummariesObj[]
    | StatSummaryObj[]
    | { [key: string]: StatSummaryObj[] };
  summary: string | string[] | Summary | Summaries;
  charts: ChartData[];
};
type MergedChartData = {
  name: string;
  data: { regionName: string; indicate: Indicate[] }[];
};

type BaseChartData = {
  regionName?: string;
  name: string;
  indicate: Indicate[];
};

type RankResult = {
  regionName: string;
  rank: ChartDataContainer[];
};

type ChartData = BaseChartData | MergedChartData;

type Indicate = Record<string, string | number>;

//차트 요약
type Summary = Record<string, string>;
type Summaries = Record<string, string[]>;
