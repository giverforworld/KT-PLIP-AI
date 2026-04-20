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
import { flowConcatChart } from "@/utils/chart/flowConcatChart";
import { groupLineOrBarConcatChart } from "@/utils/chart/groupLineOrBarConcatChart";
import { groupLineOrBarChart } from "@/utils/chart/groupLineOrBarChart";
import { stackBarConcatChart } from "@/utils/chart/stackBarConcatChart";
import { stackBarConcatMergedChart } from "@/utils/chart/stackBarConcatMergedChart";
import { lineOrBarChart } from "@/utils/chart/lineOrBarChart";
import { stackBarChart } from "@/utils/chart/stackBarChart";
import { groupLineOrBarConcatMergedChart } from "@/utils/chart/groupLineOrBarConcatMergedChart";
import { flowChart } from "@/utils/chart/flowChart";
import { statusODS } from "@/service/mop/statusODS";
import { statusODN } from "@/service/mop/statusODN";
import { flowODChart } from "@/utils/chart/flowODChart";
import { moveCdN } from "@/service/mop/moveCdN";
import { stackBarGroupMergedChart } from "@/utils/chart/stackBarGroupMergedChart";
import { stackBarMergedChart } from "@/utils/chart/stackBarMergedChart";
import { groupLineOrBarMergedChart } from "@/utils/chart/groupLineOrBarMergedChart";
import { lineOrBarMergedChart } from "@/utils/chart/lineOrBarMergedChart";
import { groupLineOrBarNChart } from "@/utils/chart/groupLineOrBarNChart";
import { moveCdODN } from "@/service/mop/moveCdODN";
import { traitsAggs } from "@/service/llp/traitsAggs";
import { lineOrBarMixChart } from "@/utils/chart/lineOrBarMixChart";
import { stackBarNChart } from "@/utils/chart/stackBarNChart";
import { mopRank } from "@/service/mop/rank";
import { rankScatterChart } from "@/utils/chart/rankScatterChart";
import { statusAggs } from "@/service/llp/statusAggs";
import { mopRanking } from "@/service/mop/ranking";
import { rankRacingChart } from "@/utils/chart/rankRacingChart";
import { populRatioChart } from "@/utils/chart/populRatioChart";
import { llpRanking } from "@/service/llp/ranking";
import { llpRank } from "@/service/llp/rank";
import { flowNChart } from "@/utils/chart/flowNChart";
import { rankRatioChart } from "@/utils/chart/rankRatioChart";
import { statusN } from "@/service/alp/statusN";
import { patternN } from "@/service/alp/patternN";
import { alpRankRatioChart } from "@/utils/chart/alpRankRatioChart";
import { flowODNChart } from "@/utils/chart/flowODNChart";
import { comparativeN } from "@/service/alp/comparativeN";
import { alpRank } from "@/service/alp/rank";
import { alpRanking } from "@/service/alp/ranking";

export const screenMapping: ScreenMapping = {
  //생활이동현황 - 단일지역분석
  MOP10010: {
    stat: ["tot", "flow", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP10010_03",
            name: "생활 이동 흐름",
            category: ["flow"],
            type: "concat",
            existStat: [true],
            existSummary: [true],
            handler: [flowConcatChart],
          },
          {
            id: "MOP10010_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "concat",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [groupLineOrBarConcatChart, groupLineOrBarConcatChart],
          },
          {
            id: "MOP10010_05",
            name: "일별 이동 추이",
            category: ["day"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10010_06",
            name: "요일별 이동 분석",
            category: ["dow", "weekdays"],
            type: "concat",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [groupLineOrBarConcatChart, stackBarConcatChart],
          },
          {
            name: "도착시간대별 이동 분석",
            id: "MOP10010_07",
            category: ["timezn"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP10010_08",
            name: "출발시간대별 이동 분석",
            category: ["timezn"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP10010_09",
            name: "시간대별 이동 분석",
            category: ["timezn"],
            type: "concat",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10010_10",
            name: "성연령별 이동분석",
            category: ["sex", "age"],
            type: "concat",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarConcatChart, groupLineOrBarConcatChart],
          },
          {
            id: "MOP10010_11",
            name: "성연령별 유입인구",
            category: ["sexAge"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP10010_12",
            name: "성연령별 유출인구",
            category: ["sexAge"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP10010_13",
            name: "이동목적별 분석",
            category: ["purpose"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10010_14",
            name: "이동수단별 분석",
            category: ["way"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
        ],
      },
    ],
  },
  //생활이동현황 - 지역비교
  MOP10020: {
    stat: ["tot", "flow", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP10020_03",
            name: "생활 이동 흐름",
            category: ["flow"],
            type: "concat",
            existStat: [true],
            existSummary: [true],
            handler: [flowConcatChart],
          },
          {
            id: "MOP10020_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "concat",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [
              groupLineOrBarConcatMergedChart,
              groupLineOrBarConcatMergedChart,
            ],
          },
          {
            id: "MOP10020_05",
            name: "일별 이동 추이",
            category: ["day"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10020_06",
            name: "요일별 이동 분석",
            category: ["dow", "weekdays"],
            type: "concat",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [groupLineOrBarConcatChart, stackBarConcatMergedChart],
          },
          {
            id: "MOP10020_07",
            name: "도착시간대별 이동 분석",
            category: ["timezn"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP10020_08",
            name: "출발시간대별 이동 분석",
            category: ["timezn"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP10020_09",
            name: "시간대별 이동 분석",
            category: ["timezn"],
            type: "concat",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10020_10",
            name: "성연령별 이동분석",
            category: ["sex", "age"],
            type: "concat",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [
              groupLineOrBarConcatMergedChart,
              groupLineOrBarConcatChart,
            ],
          },
          {
            id: "MOP10020_11",
            name: "성연령별 유입인구",
            category: ["sexAge"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP10020_12",
            name: "성연령별 유출인구",
            category: ["sexAge"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP10020_13",
            name: "이동목적별 분석",
            category: ["purpose"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
          {
            id: "MOP10020_14",
            name: "이동수단별 분석",
            category: ["way"],
            type: "concat",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarConcatChart],
          },
        ],
      },
    ],
  },
  //생활이동현황 - 출도착지분석 전국
  MOP20010: {
    stat: ["tot", "flow", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP20010_03",
            name: "생활 이동 흐름",
            category: ["flow"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [flowChart],
          },
          {
            id: "MOP20010_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP20010_05",
            name: "일별 이동 추이",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20010_06",
            name: "요일별 이동 분석",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, stackBarChart],
          },
          {
            name: "도착시간대별 이동 분석",
            id: "MOP20010_07",
            category: ["timezn"],
            type: "inflow",
            existStat: [true],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20010_08",
            name: "출발시간대별 이동 분석",
            category: ["timezn"],
            type: "outflow",
            existStat: [true],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20010_09",
            name: "성연령별 이동분석",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP20010_10",
            name: "성연령별 유입인구",
            category: ["sexAge"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20010_11",
            name: "성연령별 유출인구",
            category: ["sexAge"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20010_12",
            name: "이동목적별 분석",
            category: ["purpose"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20010_13",
            name: "이동수단별 분석",
            category: ["way"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
        ],
      },
    ],
  },
  //생활이동현황 - 출도착지비교 1개
  MOP20020: {
    stat: ["tot", "flow", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP20020_03",
            name: "생활 이동 흐름",
            category: ["flow"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [flowODChart],
          },
          {
            id: "MOP20020_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP20020_05",
            name: "일별 이동 추이",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20020_06",
            name: "요일별 이동 분석",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, stackBarChart],
          },
          {
            name: "도착시간대별 이동 분석",
            id: "MOP20020_07",
            category: ["timezn"],
            type: "inflow",
            existStat: [true],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20020_08",
            name: "출발시간대별 이동 분석",
            category: ["timezn"],
            type: "outflow",
            existStat: [true],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20020_09",
            name: "성연령별 이동분석",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP20020_10",
            name: "성연령별 유입인구",
            category: ["sexAge"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20020_11",
            name: "성연령별 유출인구",
            category: ["sexAge"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20020_12",
            name: "이동목적별 분석",
            category: ["purpose"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20020_13",
            name: "이동수단별 분석",
            category: ["way"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
        ],
      },
    ],
  },
  //생활이동현황 - 출도착지비교 N개
  MOP20030: {
    stat: ["tot", "flow", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP20030_03",
            name: "생활 이동 흐름",
            category: ["flow"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [flowODChart],
          },
          {
            id: "MOP20030_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [groupLineOrBarChart, groupLineOrBarChart],
          },
          {
            id: "MOP20030_05",
            name: "일별 이동 추이",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP20030_06",
            name: "요일별 이동 분석",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, stackBarChart],
          },
          {
            name: "도착시간대별 이동 분석",
            id: "MOP20030_07",
            category: ["timezn"],
            type: "inflow",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP20030_08",
            name: "출발시간대별 이동 분석",
            category: ["timezn"],
            type: "outflow",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP20030_09",
            name: "성연령별 이동분석",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP20030_10",
            name: "성연령별 유입인구",
            category: ["sexAge"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20030_11",
            name: "성연령별 유출인구",
            category: ["sexAge"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "MOP20030_12",
            name: "이동목적별 분석",
            category: ["purpose"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "MOP20030_13",
            name: "이동수단별 분석",
            category: ["way"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
        ],
      },
    ],
  },
  //이동목적(수단)분석 - 단일지역 , 출도착지분석 - 전국
  MOP30010: {
    stat: ["move", "flowRegion", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP30010_03",
            name: "이동목적별 분석",
            category: ["move", "move"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP30010_04",
            name: "출발지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "inflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP30010_04",
            name: "도착지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "outflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP30010_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP30010_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP30010_06",
            name: "요일별 이동목적별 유입인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP30010_07",
            name: "시간대별 이동목적별 유입인구",
            category: ["timezn"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP30010_08",
            name: "성연령별 이동목적별 유입인구",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
        ],
      },
    ],
  },
  //이동목적(수단)분석 - 지역비교
  MOP30020: {
    stat: ["move", "flowRegion", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP30020_03",
            name: "이동목적별 분석",
            category: ["move", "move"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarMergedChart, lineOrBarChart],
          },
          {
            id: "MOP30020_04",
            name: "출발지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "inflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP30020_04",
            name: "도착지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "outflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP30020_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP30020_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP30020_06",
            name: "요일별 이동목적별 유입인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [stackBarChart, stackBarGroupMergedChart],
          },
          {
            id: "MOP30020_07",
            name: "시간대별 이동목적별 유입인구",
            category: ["timezn"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP30020_08",
            name: "성연령별 이동목적별 유입인구",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
        ],
      },
    ],
  },
  //이동목적(수단)분석 - 출도착지분석 전국
  MOP40010: {
    stat: ["move", "flowRegion", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP40010_03",
            name: "이동목적별 분석",
            category: ["move", "move"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP40010_04",
            name: "출발지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "inflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP40010_04",
            name: "도착지역별 이동목적별 분석",
            category: ["flowRegion", "flowRegion"],
            type: "outflow",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP40010_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "inflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP40010_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "outflow",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP40010_06",
            name: "요일별 이동목적별 유입인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP40010_07",
            name: "시간대별 이동목적별 유입인구",
            category: ["timezn"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP40010_08",
            name: "성연령별 이동목적별 유입인구",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
        ],
      },
    ],
  },
  //이동목적(수단)분석 - 출도착지분석 1개
  MOP40020: {
    stat: ["move", "flowRegion", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP40020_03",
            name: "이동목적별 분석",
            category: ["move", "move"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "MOP40020_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "MOP40020_06",
            name: "요일별 이동목적별 유입인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [stackBarChart, stackBarChart],
          },
          {
            id: "MOP40020_07",
            name: "시간대별 이동목적별 유입인구",
            category: ["timezn"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP40020_08",
            name: "성연령별 이동목적별 유입인구",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
        ],
      },
    ],
  },
  //이동목적(수단)분석 - 출도착지분석 N개
  MOP40030: {
    stat: ["move", "flowRegion", "timezn", "sex", "age", "weekdays"],
    dataGroup: [
      {
        title: "생활이동규모",
        charts: [
          {
            id: "MOP40030_03",
            name: "이동목적별 분석",
            category: ["move", "move"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarMergedChart, lineOrBarChart],
          },
          {
            id: "MOP40030_05",
            name: "일별 이동목적별 유입인구",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP40030_06",
            name: "요일별 이동목적별 유입인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [stackBarChart, stackBarGroupMergedChart],
          },
          {
            id: "MOP40030_07",
            name: "시간대별 이동목적별 유입인구",
            category: ["timezn"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "MOP40030_08",
            name: "성연령별 이동목적별 유입인구",
            category: ["sex", "age"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
        ],
      },
    ],
  },
  //생활이동 랭킹분석
  MOP50010: {
    stat: [
      "inflowPop",
      "inflowRegion",
      "flowPur",
      "outflowPop",
      "outflowRegion",
      "flowWay",
    ],
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "MOP50010_01",
            name: "지역 현황 모아보기",
            category: ["move"],
            type: "default",
            existStat: [true],
            existSummary: [false],
            handler: [rankScatterChart],
          },
        ],
      },
    ],
  },
  //생활이동 랭킹분석 - 지역랭킹
  MOP50020: {
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "MOP50020_01",
            name: "지역 랭킹",
            category: ["mop"],
            type: "default",
            existStat: [false],
            existSummary: [false],
            handler: [rankRacingChart],
          },
        ],
      },
    ],
  },
  //체류인구현황 - 단일지역
  LLP20010: {
    stat: ["prevMonth", "rropPop", "lastYear", "sexAge", "monsAge", "weekdays"],
    dataGroup: [
      // 체류인구 규모 - 단일지역
      {
        title: "체류인구 규모",
        charts: [
          {
            id: "LLP20010_03",
            name: "체류인구 배수",
            category: ["ratioGroup"],
            type: "default",
            existStat: [false],
            existSummary: [false],
            handler: [populRatioChart],
          },
          {
            id: "LLP20010_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, false],
            handler: [lineOrBarMixChart, lineOrBarMixChart],
          },
          {
            id: "LLP20010_05",
            name: "일별 체류인구 추이",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "LLP20010_06",
            name: "평일/휴일별 체류인구",
            category: ["weekdays", "weekdays"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, stackBarChart],
          },
        ],
      },
      // 성/연령별 분석 - 단일지역
      {
        title: "성/연령별 분석",
        charts: [
          {
            id: "LLP20010_07",
            name: "성연령별 체류인구",
            category: ["sexAge"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "LLP20010_08",
            name: "월별 연령대별 체류인구 추이",
            category: ["monsAge"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
      // 주민등록인구 비교분석 - 단일지역
      {
        title: "주민등록인구 비교분석",
        charts: [
          {
            id: "LLP20010_09",
            name: "주민등록인구 대비 체류인구 비교",
            category: ["rropPop", "rropMons"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, stackBarMergedChart],
          },
          {
            id: "LLP20010_10",
            name: "성별, 연령대별 주민등록인구 대비 체류인구 비교",
            category: ["rropSex", "rropAge"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  //체류인구현황 - 지역비교
  LLP20020: {
    stat: ["prevMonth", "rropPop", "lastYear", "sexAge", "monsAge", "weekdays"],
    dataGroup: [
      // 체류인구 규모 - 지역비교
      {
        title: "체류인구 규모",
        charts: [
          {
            id: "LLP20020_03",
            name: "체류인구 배수",
            category: ["ratioGroup"],
            type: "default",
            existStat: [false],
            existSummary: [false],
            handler: [populRatioChart],
          },
          {
            id: "LLP20020_04",
            name: "전년/전월 동기 대비 비교 분석",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, false],
            handler: [stackBarMergedChart, stackBarMergedChart],
          },
          {
            id: "LLP20020_05",
            name: "일별 체류인구 추이",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarMergedChart],
          },
          {
            id: "LLP20020_06",
            name: "평일/휴일별 체류인구",
            category: ["weekdays", "weekdays"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [stackBarMergedChart, stackBarMergedChart],
          },
        ],
      },
      // 성/연령별 분석 - 지역비교
      {
        title: "성/연령별 분석",
        charts: [
          {
            id: "LLP20020_07",
            name: "성연령별 체류인구",
            category: ["sexAge"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "LLP20020_08",
            name: "월별 연령대별 체류인구",
            category: ["monsAge"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
      // 주민등록인구 비교분석 - 지역비교
      {
        title: "주민등록인구 비교분석",
        charts: [
          {
            id: "LLP20020_09",
            name: "주민등록인구 대비 체류인구 비교",
            category: ["rropPop", "rropMons"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, stackBarNChart],
          },
          {
            id: "LLP20020_10",
            name: "성별, 연령대별 주민등록인구 대비 체류인구 비교",
            category: ["rropSex", "rropAge"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [groupLineOrBarMergedChart, groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  // 체류인구 특성- 단일지역분석
  LLP30010: {
    stat: [
      "stayDays",
      "ldgmtDays",
      "inflowSgg",
      "stayDaysAvg",
      "ldgmtDaysAvg",
      "stayTimesAvg",
    ],
    dataGroup: [
      // 체류일수별 분석
      {
        title: "체류일수별 분석",
        charts: [
          {
            id: "LLP30010_03",
            name: "체류일수별 특성",
            category: ["stayDays", "stayDaysAvg"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarMixChart],
          },
          {
            id: "LLP30010_04",
            name: "체류일수별 성연령별 분포",
            category: ["stayDayssex", "stayDaysage"],
            type: "default",
            existStat: [false, false],
            existSummary: [false, true],
            handler: [groupLineOrBarNChart, groupLineOrBarNChart],
          },
        ],
      },
      // 숙박일수별 분석
      {
        title: "숙박일수별 분석",
        charts: [
          {
            id: "LLP30010_05",
            name: "숙박일수별 특성",
            category: ["ldgmtDays", "ldgmtDaysAvg"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarMixChart],
          },
          {
            id: "LLP30010_06",
            name: "숙박일수별 성연령별 분포",
            category: ["ldgmtDayssex", "ldgmtDaysage"],
            type: "default",
            existStat: [false, false],
            existSummary: [false, true],
            handler: [groupLineOrBarNChart, groupLineOrBarNChart],
          },
        ],
      },
      // 유입지역별 분석
      {
        title: "유입지역별 분석",
        charts: [
          {
            id: "LLP30010_07",
            name: "유입지역별 특성",
            category: ["inflowSido", "inflowSgg"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, false],
            handler: [stackBarChart, lineOrBarChart],
          },
          {
            id: "LLP30010_08",
            name: "유입지역별 체류일수별 특성",
            category: ["inflowDays", "inflowDaysAvg"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [stackBarNChart, lineOrBarChart],
          },
        ],
      },
      // 체류시간별 분석
      {
        title: "체류시간별 분석",
        charts: [
          {
            id: "LLP30010_09",
            name: "체류시간별 특성",
            category: ["stayTimes", "stayTimesAvg"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarMixChart],
          },
          {
            id: "LLP30010_10",
            name: "체류시간별 일별 추이",
            category: ["stayDayTimes"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "LLP30010_11",
            name: "체류시간별 성별 분포",
            category: ["stayTimessex"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "LLP30010_12",
            name: "체류시간별 연령대별 분포",
            category: ["stayTimesage"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  // 체류인구 특성 - 지역비교
  LLP30020: {
    stat: [
      "stayDays",
      "ldgmtDays",
      "inflowSgg",
      "stayDaysAvg",
      "ldgmtDaysAvg",
      "stayTimesAvg",
    ],
    dataGroup: [
      // 체류일수별 분석
      {
        title: "체류일수별 분석",
        charts: [
          {
            id: "LLP30020_03",
            name: "체류일수별 특성",
            category: ["stayDays", "stayDaysAvg"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [stackBarMergedChart, lineOrBarMixChart],
          },
          {
            id: "LLP30020_04",
            name: "체류일수별 성연령별 분포",
            category: ["stayDayssex", "stayDaysage"],
            type: "default",
            existStat: [false, false],
            existSummary: [false, true],
            handler: [groupLineOrBarMergedChart, groupLineOrBarNChart],
          },
        ],
      },
      // 숙박일수별 분석
      {
        title: "숙박일수별 분석",
        charts: [
          {
            id: "LLP30020_05",
            name: "숙박일수별 특성",
            category: ["ldgmtDays", "ldgmtDaysAvg"],
            type: "default",
            existStat: [true, true],
            existSummary: [true, true],
            handler: [stackBarMergedChart, lineOrBarMixChart],
          },
          {
            id: "LLP30020_06",
            name: "숙박일수별 성연령별 분포",
            category: ["ldgmtDayssex", "ldgmtDaysage"],
            type: "default",
            existStat: [false, false],
            existSummary: [false, true],
            handler: [groupLineOrBarMergedChart, groupLineOrBarNChart],
          },
        ],
      },
      // 유입지역별 분석
      {
        title: "유입지역별 분석",
        charts: [
          {
            id: "LLP30020_07",
            name: "유입지역별 특성",
            category: ["inflowSido", "inflowSgg"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, false],
            handler: [stackBarMergedChart, groupLineOrBarNChart],
          },
          {
            id: "LLP30020_08",
            name: "유입지역별 체류일수별 특성",
            category: ["inflowDays", "inflowDaysAvg"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [stackBarNChart, stackBarMergedChart],
          },
        ],
      },
      // 체류시간별 분석
      {
        title: "체류시간별 분석",
        charts: [
          {
            id: "LLP30020_09",
            name: "체류시간별 특성",
            category: ["stayTimes", "stayTimesAvg"],
            type: "default",
            existStat: [false, true],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, lineOrBarMixChart],
          },
          {
            id: "LLP30020_10",
            name: "체류시간별 일별 추이",
            category: ["stayDayTimes"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "LLP30020_11",
            name: "체류시간별 성별 분포",
            category: ["stayTimessex"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarMergedChart],
          },
          {
            id: "LLP30020_12",
            name: "체류시간별 연령대별 분포",
            category: ["stayTimesage"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  LLP40010: {
    stat: ["stayPop", "resid", "stayTimesAvg", "stayDays", "day", "flowRegion"],
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "LLP40010_01",
            name: "지역 현황 모아보기",
            category: ["llp", "llp"],
            type: "default",
            existStat: [false, true],
            existSummary: [false, false],
            handler: [rankRatioChart, flowNChart],
          },
        ],
      },
    ],
  },
  //체류인구 랭킹분석 - 지역랭킹
  LLP40020: {
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "LLP40020_01",
            name: "지역 랭킹",
            category: ["llp"],
            type: "default",
            existStat: [false],
            existSummary: [false],
            handler: [rankRacingChart],
          },
        ],
      },
    ],
  },
  //생활인구현황 - 단일지역분석
  ALP10010: {
    stat: ["tot", "sex", "age", "inflowWeek", "fornTot", "fornNat"],
    dataGroup: [
      {
        title: "내국인 생활인구 현황",
        charts: [
          {
            id: "ALP10010_03",
            name: "시계열 생활인구",
            category: ["timezn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP10010_04",
            name: "전년/전월 동기 대비 생활인구",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [true, false], // "tot"
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "ALP10010_05",
            name: "일별 내국인 생활인구",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP10010_06",
            name: "성연령별 내국인 생활인구",
            category: ["sexAge"],
            type: "default",
            existStat: [true], // sex, age
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP10010_07",
            name: "요일별 내국인 생활인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
        ],
      },
      {
        title: "내국인 생활인구 시간대별 분석",
        charts: [
          {
            id: "ALP10010_08",
            name: "시간대별 성별 내국인 생활인구",
            category: ["timeznSex"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10010_09",
            name: "시간대별 연령대별 내국인 생활인구",
            category: ["timeznAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10010_10",
            name: "시간대별 요일별 내국인 생활인구",
            category: ["timeznDow"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10010_11",
            name: "시간대별 평일/휴일별 내국인 생활인구",
            category: ["timeznWeekdays"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10010_12",
            name: "하위 행정구역별 시간대별 내국인 생활인구",
            category: ["subzone"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart], // 차트 타입 확인하기
          },
        ],
      },
      {
        title: "내국인 생활인구 유입/유출 현황",
        charts: [
          {
            id: "ALP10010_13",
            name: "평일, 휴일별 유입지역",
            category: ["inflowWeek", "inflowWeeked"],
            type: "default",
            existStat: [false, true], // inflowWeek
            existSummary: [false, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "ALP10010_14",
            name: "평일, 휴일별 유출지역",
            category: ["outflowWeek", "outflowWeeked"],
            type: "default",
            // existStat: [false, false],
            existStat: [false, false],
            existSummary: [false, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
        ],
      },
      {
        title: "외국인 생활인구 현황",
        charts: [
          {
            id: "ALP10010_15",
            name: "전년/전월 동기 대비 외국인 생활인구",
            category: ["fornLastYear", "fornPrevMonth"],
            type: "default",
            existStat: [true, false], // "fornTot"
            existSummary: [true, false],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "ALP10010_16",
            name: "일별 외국인 생활인구",
            category: ["fornDay"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP10010_17",
            name: "요일별 외국인 생활인구",
            category: ["fornDow", "fornTimezn"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "ALP10010_18",
            name: "시간대별 국가별 외국인 생활인구",
            category: ["fornNatTime"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10010_19",
            name: "국가별 외국인 생활인구",
            category: ["fornNat"],
            type: "default",
            existStat: [true], // fornNat
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  ALP10020: {
    stat: ["tot", "sex", "age", "inflowWeek", "fornTot", "fornNat"],
    dataGroup: [
      {
        title: "내국인 생활인구 현황",
        charts: [
          {
            id: "ALP10020_03",
            name: "시계열 생활인구",
            category: ["timezn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "ALP10020_04",
            name: "전년/전월 동기 대비 생활인구",
            category: ["lastYear", "prevMonth"],
            type: "default",
            existStat: [true, false], // "tot"
            existSummary: [true, false],
            handler: [groupLineOrBarChart, groupLineOrBarChart],
          },
          {
            id: "ALP10020_05",
            name: "일별 내국인 생활인구",
            category: ["day"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "ALP10020_06",
            name: "성연령별 내국인 생활인구",
            category: ["sexAge"],
            type: "default",
            existStat: [true], // sex, age
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP10020_07",
            name: "요일별 내국인 생활인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [groupLineOrBarChart, groupLineOrBarChart],
          },
        ],
      },
      {
        title: "내국인 생활인구 시간대별 분석",
        charts: [
          {
            id: "ALP10020_08",
            name: "시간대별 성별 내국인 생활인구",
            category: ["timeznSex"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10020_09",
            name: "시간대별 연령대별 내국인 생활인구",
            category: ["timeznAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10020_10",
            name: "시간대별 요일별 내국인 생활인구",
            category: ["timeznDow"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10020_11",
            name: "시간대별 평일/휴일별 내국인 생활인구",
            category: ["timeznWeekdays"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10020_12",
            name: "하위 행정구역별 시간대별 내국인 생활인구",
            category: ["subzone"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart], // 차트 타입 확인하기
          },
        ],
      },
      {
        title: "내국인 생활인구 유입/유출 현황",
        charts: [
          {
            id: "ALP10020_13",
            name: "평일, 휴일별 유입지역",
            category: ["inflowWeek", "inflowWeeked"],
            type: "default",
            existStat: [false, true], // inflowWeek
            existSummary: [false, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
          {
            id: "ALP10020_14",
            name: "평일, 휴일별 유출지역",
            category: ["outflowWeek", "outflowWeeked"],
            type: "default",
            existStat: [false, false],
            existSummary: [false, true],
            handler: [lineOrBarChart, lineOrBarChart],
          },
        ],
      },
      {
        title: "외국인 생활인구 현황",
        charts: [
          {
            id: "ALP10020_15",
            name: "전년/전월 동기 대비 외국인 생활인구",
            category: ["fornLastYear", "fornPrevMonth"],
            type: "default",
            existStat: [true, false], // "fornTot"
            existSummary: [true, false],
            handler: [groupLineOrBarChart, groupLineOrBarChart],
          },
          {
            id: "ALP10020_16",
            name: "일별 외국인 생활인구",
            category: ["fornDay"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarChart],
          },
          {
            id: "ALP10020_17",
            name: "요일별 외국인 생활인구",
            category: ["fornDow", "fornTimezn"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, true],
            handler: [groupLineOrBarChart, groupLineOrBarChart],
          },
          {
            id: "ALP10020_18",
            name: "시간대별 국가별 외국인 생활인구",
            category: ["fornNatTime"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP10020_19",
            name: "국가별 외국인 생활인구",
            category: ["fornNat"],
            type: "default",
            existStat: [true], // fornTot, fornNat
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  //생활패턴분석 - 단일지역
  ALP20010: {
    stat: ["ratio", "pday", "age", "dow"],
    dataGroup: [
      {
        title: "생활패턴분석",
        charts: [
          {
            id: "ALP20010_03",
            name: "월별 거주/직장/방문 인구",
            category: ["current", "month"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, groupLineOrBarNChart],
          },
          {
            id: "ALP20010_04",
            name: "일별 거주/직장/방문 인구",
            category: ["pday"],
            type: "default",
            existStat: [true], // pday
            existSummary: [true],
            // existSummary: [false],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP20010_05",
            name: "성연령별 거주/직장/방문 인구",
            category: ["psex", "age"],
            type: "default",
            existStat: [false, true], //ratio,age
            existSummary: [false, true],
            handler: [groupLineOrBarChart, stackBarChart],
          },
          {
            id: "ALP20010_06",
            name: "성연령별 거주인구",
            category: ["sexAgeRsdn"],
            type: "default",
            // existStat: [true],
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20010_07",
            name: "성연령별 직장인구",
            category: ["sexAgeWkplc"],
            type: "default",
            // existStat: [true],
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20010_08",
            name: "성연령별 방문인구",
            category: ["sexAgeVist"],
            type: "default",
            // existStat: [true],
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20010_09",
            name: "요일별 거주/직장/방문 인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [true, false], // dow
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarChart],
          },
          {
            id: "ALP20010_10",
            name: "시간대별 거주/직장/방문 인구",
            category: ["pTimezn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  //생활패턴분석 - 지역비교
  ALP20020: {
    stat: ["ratio", "pday", "age", "dow"],
    dataGroup: [
      {
        title: "생활패턴분석",
        charts: [
          {
            id: "ALP20020_03",
            name: "월별 거주/직장/방문 인구",
            category: ["current", "month"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [groupLineOrBarChart, groupLineOrBarNChart],
          },
          {
            id: "ALP20020_04",
            name: "일별 거주/직장/방문 인구",
            category: ["pday"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            // existSummary: [false],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP20020_05",
            name: "성연령별 거주/직장/방문 인구",
            category: ["psex", "age"],
            type: "default",
            existStat: [false, true],
            existSummary: [false, true],
            handler: [groupLineOrBarMergedChart, stackBarChart],
          },
          {
            id: "ALP20020_06",
            name: "성연령별 거주인구",
            category: ["sexAgeRsdn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20020_07",
            name: "성연령별 직장인구",
            category: ["sexAgeWkplc"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20020_08",
            name: "성연령별 방문인구",
            category: ["sexAgeVist"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP20020_09",
            name: "요일별 거주/직장/방문 인구",
            category: ["dow", "weekdays"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, true],
            handler: [groupLineOrBarNChart, stackBarGroupMergedChart],
          },
          {
            id: "ALP20020_10",
            name: "시간대별 거주/직장/방문 인구",
            category: ["pTimezn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
        ],
      },
    ],
  },
  //주민/생활 비교분석 - 단일지역
  ALP30010: {
    stat: ["tot", "pday", "sex", "age"],
    dataGroup: [
      {
        title: "주민등록인구와 생활인구 비교",
        charts: [
          {
            id: "ALP30010_03",
            name: "월별 주민등록인구 대비 거주인구 비교",
            category: ["current", "month"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [lineOrBarChart, groupLineOrBarNChart],
          },
          {
            id: "ALP30010_04",
            name: "일별 주민등록인구 대비 거주인구 비교",
            category: ["pday"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP30010_05",
            name: "성연령별 거주인구와 주민등록인구 비교",
            category: ["psex", "age"],
            type: "default",
            existStat: [false, true],
            existSummary: [false, true],
            handler: [groupLineOrBarChart, stackBarChart],
          },
          {
            id: "ALP30010_06",
            name: "성연령별 거주인구",
            category: ["sexAgeRsdn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP30010_07",
            name: "성연령별 주민등록인구",
            category: ["sexAgeResid"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP30010_08",
            name: "하위 행정구역별 거주인구와 주민등록인구 비교",
            category: ["subzone", "subzone"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [groupLineOrBarNChart, groupLineOrBarNChart],
          },
          // 상세분석
          {
            id: "ALP30010_09",
            name: "주민등록인구 현황",
            category: ["residPop"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_10",
            name: "연도별 주민등록인구 추이",
            category: ["residPopYear"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_11",
            name: "지방소멸위험지수",
            category: ["extincRegion"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_12",
            name: "성별/연령대별 현황",
            category: ["genderAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_12_1",
            name: "성별/연령대별 현황",
            category: ["mostAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
        ],
      },
    ],
  }, //주민/생활 비교분석 - 비교지역
  ALP30020: {
    stat: ["tot", "pday", "sex", "age"],
    dataGroup: [
      {
        title: "주민등록인구와 생활인구 비교",
        charts: [
          {
            id: "ALP30020_03",
            name: "월별 주민등록인구 대비 거주인구 비교",
            category: ["current", "month"],
            type: "default",
            existStat: [true, false],
            existSummary: [true, false],
            handler: [groupLineOrBarChart, groupLineOrBarNChart],
          },
          {
            id: "ALP30020_04",
            name: "일별 주민등록인구 대비 거주인구 비교",
            category: ["pday"],
            type: "default",
            existStat: [true],
            existSummary: [true],
            handler: [groupLineOrBarNChart],
          },
          {
            id: "ALP30020_05",
            name: "성연령별 거주인구와 주민등록인구 비교",
            category: ["psex", "age"],
            type: "default",
            existStat: [false, true],
            existSummary: [false, true],
            handler: [groupLineOrBarMergedChart, stackBarChart],
          },
          {
            id: "ALP30020_06",
            name: "성연령별 거주인구",
            category: ["sexAgeRsdn"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP30020_07",
            name: "성연령별 주민등록인구",
            category: ["sexAgeResid"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [stackBarChart],
          },
          {
            id: "ALP30020_08",
            name: "하위 행정구역별 거주인구와 주민등록인구 비교",
            category: ["subzone", "subzone"],
            type: "default",
            existStat: [false, false],
            existSummary: [true, false],
            handler: [groupLineOrBarNChart, groupLineOrBarNChart],
          },
          // 상세분석
          {
            id: "ALP30010_09",
            name: "주민등록인구 현황",
            category: ["residPop"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_10",
            name: "연도별 주민등록인구 추이",
            category: ["residPopYear"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_11",
            name: "지방소멸위험지수",
            category: ["extincRegion"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_12",
            name: "성별/연령대별 현황",
            category: ["genderAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
          {
            id: "ALP30010_12_1",
            name: "성별/연령대별 현황",
            category: ["mostAge"],
            type: "default",
            existStat: [false],
            existSummary: [true],
            handler: [lineOrBarChart],
          },
        ],
      },
    ],
  },
  //생활인구 랭킹분석
  ALP40010: {
    stat: ["tot", "inflowWeek", "ratio", "age"],
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "ALP40010_01",
            name: "지역 현황 모아보기",
            category: ["alp", "flow"],
            type: "default",
            // existStat: [false, true],
            existStat: [true, false],
            existSummary: [true, false],
            handler: [alpRankRatioChart, flowODNChart],
          },
        ],
      },
    ],
  },
  //생활인구 랭킹분석 - 지역랭킹
  ALP40020: {
    dataGroup: [
      {
        title: "랭킹분석",
        charts: [
          {
            id: "ALP40020_01",
            name: "지역 랭킹",
            category: ["alp"],
            type: "default",
            existStat: [false],
            existSummary: [false],
            handler: [rankRacingChart],
          },
        ],
      },
    ],
  },
};

export const screenOPMapping: ScreenOPMapping = {
  //생활이동현황 - 단일지역분석
  MOP10010: {
    charts: statusInOutN,
  },
  //생활이동현황 - 지역비교
  MOP10020: {
    charts: statusInOutN,
  },
  //생활이동현황 - 출도착지역분석 - 전국
  MOP20010: {
    charts: statusODS,
  },
  //생활이동현황 - 출도착 비교 - 1개
  MOP20020: {
    charts: statusODN,
  },
  //생활이동현황 - 출도착 비교 - N개
  MOP20030: {
    charts: statusODN,
  },
  //이동목적/수단 - 단일지역분석
  MOP30010: {
    charts: moveCdN,
  },
  //이동목적/수단 - 지역비교
  MOP30020: {
    charts: moveCdN,
  },
  //  //이동목적/수단 - 출도착지분석 전국
  MOP40010: {
    charts: moveCdN,
  },
  //이동목적/수단 - 출도착지분석 1개
  MOP40020: {
    charts: moveCdODN,
  },
  //이동목적/수단 - 출도착지분석 N개
  MOP40030: {
    charts: moveCdODN,
  },
  //지역 분석
  MOP50010: {
    charts: mopRank,
  },
  //지역랭킹
  MOP50020: {
    charts: mopRanking,
  },
  // 체류인구 현황 - 단일지역분석
  LLP20010: {
    charts: statusAggs,
  },
  // 체류인구 현황 - 지역비교
  LLP20020: {
    charts: statusAggs,
  },
  // 체류인구 특성- 단일지역분석
  LLP30010: {
    charts: traitsAggs,
  },
  // 체류인구 특성 - 지역비교
  LLP30020: {
    charts: traitsAggs,
  },
  //체류인구 - 지역 분석
  LLP40010: {
    charts: llpRank,
  },
  //체류인구 - 지역 랭킹
  LLP40020: {
    charts: llpRanking,
  },
  //생활인구 - 생활인구특성
  ALP10010: {
    charts: statusN,
  },
  ALP10020: {
    charts: statusN,
  },
  ALP20010: {
    charts: patternN,
  },
  ALP20020: {
    charts: patternN,
  },
  ALP30010: {
    charts: comparativeN,
  },
  ALP30020: {
    charts: comparativeN,
  },
  ALP40010: {
    charts: alpRank,
  },
  //지역 랭킹
  ALP40020: {
    charts: alpRanking,
  },
};

export const screenPageMap: {
  [key: string]: { PAGE_NM: string; STP_PAGE_NM: string };
} = {
  MOP10010: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "status",
  },
  //생활이동현황 - 지역비교
  MOP10020: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "status",
  },
  //생활이동현황 - 출도착지역분석 - 전국
  MOP20010: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "status",
  },
  //생활이동현황 - 출도착 비교 - 1개
  MOP20020: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "status",
  },
  //생활이동현황 - 출도착 비교 - N개
  MOP20030: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "status",
  },
  //이동목적/수단 - 단일지역분석
  MOP30010: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "move",
  },
  //이동목적/수단 - 지역비교
  MOP30020: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "move",
  },
  //  //이동목적/수단 - 출도착지분석 전국
  MOP40010: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "move",
  },
  //이동목적/수단 - 출도착지분석 1개
  MOP40020: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "move",
  },
  //이동목적/수단 - 출도착지분석 N개
  MOP40030: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "move",
  },
  //지역 분석
  MOP50010: {
    PAGE_NM: "mop",
    STP_PAGE_NM: "rank-analysis",
  },
  // 체류인구 현황 - 단일지역분석
  LLP20010: {
    PAGE_NM: "llp",
    STP_PAGE_NM: "status",
  },
  // 체류인구 현황 - 지역비교
  LLP20020: {
    PAGE_NM: "llp",
    STP_PAGE_NM: "status",
  },
  // 체류인구 특성- 단일지역분석
  LLP30010: {
    PAGE_NM: "llp",
    STP_PAGE_NM: "traits",
  },
  // 체류인구 특성 - 지역비교
  LLP30020: {
    PAGE_NM: "llp",
    STP_PAGE_NM: "traits",
  },
  //체류인구 - 지역 분석
  LLP40010: {
    PAGE_NM: "llp",
    STP_PAGE_NM: "rank-analysis",
  },
  //생활인구 - 생활인구특성
  ALP10010: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "status",
  },
  ALP10020: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "status",
  },
  ALP20010: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "pattern",
  },
  ALP20020: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "pattern",
  },
  ALP30010: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "comparative-analysis",
  },
  ALP30020: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "comparative-analysis",
  },
  ALP40010: {
    PAGE_NM: "alp",
    STP_PAGE_NM: "rank-analysis",
  },
};
