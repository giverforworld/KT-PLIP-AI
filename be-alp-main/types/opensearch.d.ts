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

type Holidays = {
  DATE: string;
  TYPE: string;
  DESC: string;
}[];

type Datainfo = {
  START: string;
  END: string;
  DATE: string;
  DESC: string;
}[];

type GisOptions = {
  start: string;
  end: string;
  region: string;
};

type HolidayCache = {
  data: string[]; // 공휴일 날짜 배열
  timestamp: number; // 데이터가 저장된 시간
  start: string;
  end: string;
};

type RegionInfoCache = {
  data: Record<string, number | string>; // 행정동 정보들
  timestamp: number; // 데이터가 저장된 시간
};
type RegionInfo = {
  SIDO_CD: number;
  SIDO_NM: string;
  SGG_CD: number;
  SGG_NM: string;
  ADMNS_DONG_CD: number;
  ADMNS_DONG_NM: string;
};
type RegionCoordCache = {
  data: Record<string, number | string>; // 행정동 정보들
  timestamp: number; // 데이터가 저장된 시간
};
type OpenSearchHitsRes = {
  hits: {
    hits: any[];
  };
};

type Indexs = {
  sido: string;
  sgg: string;
  adm?: string;
};
type validIndices = {
  sido?: string;
  sgg: string;
  adm?: string;
}

type ChangedRegion = {
  BASE_YM;
  SIDO: number;
  SGG?: number;
  ADM?: number;
  OSIDO: number;
  OSGG?: number;
  OADM?: number;
};
type ChangedRegionCache = {
  timestamp: number;
  data: Record<string, ChangedRegion>;
};
