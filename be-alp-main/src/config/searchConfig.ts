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

import { statusInOutN } from "@/service/mop/statusInOutN";
import { traitsAggs } from "@/service/llp/traitsAggs";
import { statusSearch } from "@/service/mop/statusSearch";
import { llpStatusSearch } from "@/service/llp/llpStatusSearch";
import { statusSearchFlow } from "@/service/mop/statusSearchFlow";
import { alpSearch } from "@/service/alp/alpSearch";

export const searchMapping: SearchMapping = {
  MOP10010: [
    {
      title: "행정구역명",
      category: "region",
    },
    {
      title: "유입인구 수",
      category: "inflowPop",
      unit: "(명)",
    },
    {
      title: "전년동기대비 유입 증감",
      category: "inflowCompare",
      type: "variance",
      unit: "%",
    },
    {
      title: "최다 유입 지역",
      category: "inflowRegion",
    },
    {
      title: "최다 유입 목적",
      category: "inflowPur",
    },
    {
      title: "최다 유입 수단",
      category: "inflowWay",
    },
    {
      title: "유출인구 수",
      category: "outflowPop",
      unit: "(명)",
    },
    {
      title: "전년동기대비 유출 증감",
      category: "outflowCompare",
      type: "variance",
      unit: "%",
    },
    {
      title: "최다 유출 지역",
      category: "outflowRegion",
    },
    {
      title: "최다 유출 목적",
      category: "outflowPur",
    },
    {
      title: "최다 유출 수단",
      category: "outflowWay",
    },
  ],
  MOP10020: [
    {
      title: "행정구역명",
      category: "region",
    },
    {
      title: "유입인구 수",
      category: "flowPop",
      unit: "(명)",
    },
    {
      title: "전년동기대비 유입 증감",
      category: "compare",
      type: "variance",
      unit: "%",
    },
    {
      title: "최다 유입 목적",
      category: "flowPur",
    },
    {
      title: "최다 유입 수단",
      category: "flowWay",
    },
    {
      title: "남성 비율",
      category: "male",
      type: "variance",
      unit: "%",
    },
    {
      title: "여성 비율",
      category: "female",
      type: "variance",
      unit: "%",
    },
    {
      title: "최다 유입 연령대",
      category: "ageGroup",
    },
    {
      title: "최다 유입 시간대",
      category: "time",
      unit: "시",
    },
  ],
  LLP10010: [
    {
      title: "행정구역명",
      category: "region",
    },
    {
      title: "체류인구 수",
      category: "stayPop",
      unit: "(명)",
    },
    {
      title: "전년동기대비증감",
      category: "ratio",
      unit: "%",
    },
    {
      title: "남성 비율",
      category: "male",
      type: "variance",
      unit: "%",
    },
    {
      title: "여성 비율",
      category: "female",
      type: "variance",
      unit: "%",
    },
    {
      title: "최다 연령대",
      category: "ageGroup",
    },
    {
      title: "최다 유입지역",
      category: "rsdnRegion",
    },
    {
      title: "평균 체류일수",
      category: "avgStayDay",
      unit: "일",
    },
    {
      title: "평균 숙박일수",
      category: "avgAccDay",
      unit: "일",
    },
    {
      title: "평균 체류시간",
      category: "avgStayTime",
      unit: "시간",
    },
  ],
  ALP10010: [
    {
      title: "행정구역명",
      category: "region",
    },
    {
      title: "내국인 생활인구 수",
      category: "totPop",
      unit: "(명)",
    },
    {
      title: "전년동기대비증감(내국인)",
      category: "compare",
      type: "variance",
      unit: "%",
    },
    {
      title: "남성 비율(내국인)",
      category: "male",
      unit: "%",
    },
    {
      title: "여성 비율(내국인)",
      category: "female",
      unit: "%",
    },
    { title: "최다 연령대(내국인)", category: "ageGroup" },
    { title: "최다 시간대(내국인)", category: "timezn" },
    { title: "거주인구 비율(내국인)", category: "rsdn", unit: "%" },
    { title: "직장인구 비율(내국인)", category: "wkplc", unit: "%" },
    { title: "방문인구 비율(내국인)", category: "vist", unit: "%" },
    {
      title: "최다 유입지역(내국인)",
      category: "inflowRegion",
    },
    {
      title: "최다 유출지역(내국인)",
      category: "outflowRegion",
    },
    {
      title: "외국인 생활인구 수",
      category: "fornTotPop",
      unit: "(명)",
    },
  ],
};
export const searchOPMapping: SearchOPMapping = {
  //생활이동현황 - 지역비교
  MOP10010: {
    search: statusSearch,
  },
  //생활이동현황 - 출도착지역분석
  MOP10020: {
    search: statusSearchFlow,
  },
  // 체류인구 - 체류인구특성
  // LLP30010: {
  //   search: traitsAggs,
  // },
  // 체류인구 - 지역비교
  LLP10010: {
    search: llpStatusSearch,
  },
  ALP10010: {
    search: alpSearch,
  },
};
