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

type ChartConfig = {
  id: string;
  name: string;
  category: string[];
  type: string;
  existStat: boolean[];
  existSummary: boolean[];
  handler: ((...args: any[]) => Promise<ChartHandlerData>)[];
};

type ChartMapping = {
  [key: string]: {
    [key: string]: {
      chartName: string;
      legend: string[];
      x?: string[];
    };
  };
};

type ChartHandler = (data: NormalizedData, options?: any) => DataGroup[];

type ScreenMapping = {
  [key: string]: {
    search?: ChartConfig[]; // 검색 관련 데이터 (선택적)
    stat?: strgin[]; //통계요약
    dataGroup: {
      title: string;
      charts: ChartConfig[]; // 차트 데이터
    }[];
  };
};
type SearchMapping = {
  [key: string]: {
    title: string;
    category: string;
    type?: string;
    unit?: string;
  }[];
};

type OPConfig<TParams, TResult> = (options: TParams) => Promise<TResult>;

type ScreenOPMapping = {
  [key: string]: {
    search?: OPConfig; // 검색 관련 데이터 (선택적)
    charts: OPConfig; // 차트 데이터
  };
};
type SearchOPMapping = {
  [key: string]: {
    search: OPConfig; // 검색 관련 데이터 (선택적)
  };
};
//opensearch데이터 정규화
type NormalizedObj = Record<string, NormalizedData[]>;
type NestedNormalizedObj = Record<string, Record<string, NormalizedData[]>>;
type NormalizedData = {
  name?: string;
  region?: number | string; //기준 or 비교지역
  data: NormalizedChartData[];
};
type NormalizedChartData = {
  move?: any;
  stay?: any;
  ldgmt?: any;
  time?: any;
  pop?: any;
  month?: any;
  region?: any;
  ptrn?: any;
  flow?: any;
  key: string | number;
  value: number;
};
type SummeryTemplateConfig = {
  summaryTemplate: (
    regionName: string,
    data: any,
    legend?: string[],
    x?: string[]
  ) => string;
};
type StatTemplateConfig = {
  statTemplate: (
    regionName: string,
    data: any,
    legend?: string[],
    x?: string[],
    key?: string
  ) => StatSummariesObj | StatSummaryObj;
};
