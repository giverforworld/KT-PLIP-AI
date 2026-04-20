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

export const chartMapping: ChartMapping = {
  MOP10010: {
    MOP10010_03: {
      chartName: "mopFlowData",
      legend: ["지역", "생활인구"],
    },
    MOP10010_04: {
      chartName: "mopLastyearData",
      legend: ["유입인구", "유출인구"],
      x: ["기간"],
    },
    MOP10010_04_1: {
      chartName: "mopPreMonthData",
      legend: ["유입인구", "유출인구"],
      x: ["기간"],
    },
    MOP10010_05: {
      chartName: "mopDailyMoveTrendData",
      legend: ["유입인구", "유출인구"],
      x: ["일자"],
    },
    MOP10010_06: {
      chartName: "mopWeekPopData",
      legend: ["유입인구", "유출인구"],
      x: ["요일"],
    },
    MOP10010_06_1: {
      chartName: "mopWeekdayHolidayMoveData",
      legend: ["평일", "휴일"],
      x: ["유입인구", "유출인구"],
    },
    MOP10010_07: {
      chartName: "mopArrivalTimePopData",
      legend: ["유입인구"],
    },
    MOP10010_08: {
      chartName: "mopDepartOutData",
      legend: ["유출인구"],
    },
    MOP10010_09: {
      chartName: "mopTimeMoveTrendDataData",
      legend: ["도착시간대별 유입인구", "출발시간대별 유출인구"],
    },
    MOP10010_10: {
      chartName: "mopGenderData",
      legend: ["유입인구", "유출인구"],
      x: ["남성", "여성"],
    },
    MOP10010_10_1: {
      chartName: "mopAgeData",
      legend: ["유입인구", "유출인구"],
      x: ["나이"],
    },
    MOP10010_11: {
      chartName: "mopGenderAgeInflowData",
      legend: ["남성", "여성"],
      x: ["유입인구"],
    },
    MOP10010_12: {
      chartName: "mopGenderAgeOutflowData",
      legend: ["남성", "여성"],
      x: ["유출인구"],
    },
    MOP10010_13: {
      chartName: "mopPurposeData",
      legend: ["유입인구", "유출인구"],
    },
    MOP10010_14: {
      chartName: "mopTransData",
      legend: ["유입인구", "유출인구"],
    },
  },
  MOP10020: {
    MOP10020_03: {
      chartName: "mopFlowData",
      legend: ["지역", "생활인구"],
    },
    MOP10020_04: {
      chartName: "mopLastyearDataGroup",
      legend: ["유입인구", "유출인구"],
    },
    MOP10020_04_1: {
      chartName: "mopPreMonthDataGroup",
      legend: ["유입인구", "유출인구"],
    },
    MOP10020_05: {
      chartName: "mopDailyMoveTrendDataGroup",
      legend: ["유입인구", "유출인구"],
    },
    MOP10020_06: {
      chartName: "mopWeekPopDataGroup",
      legend: ["유입인구", "유출인구"],
    },
    MOP10020_06_1: {
      chartName: "mopWeekdayHolidayMoveDataGroup",
      legend: ["평일", "휴일"],
      x: ["유입인구", "유출인구"],
    },
    MOP10020_07: {
      chartName: "mopArrivalTimePopDataGroup",
      legend: ["유입인구"],
    },
    MOP10020_08: {
      chartName: "mopDepartOutDataGroup",
      legend: ["유출인구"],
    },
    MOP10020_09: {
      chartName: "mopTimeMoveTrendDataDataGroup",
      legend: ["도착시간대별 유입인구", "출발시간대별 유출인구"],
    },
    MOP10020_10: {
      chartName: "mopGenderDataGroup",
      legend: ["유입인구", "유출인구"],
      x: ["남성", "여성"],
    },
    MOP10020_10_1: {
      chartName: "mopAgeDataGroup",
      legend: ["유입인구", "유출인구"],
      x: ["나이"],
    },
    MOP10020_11: {
      chartName: "mopGenderAgeInflowDataGroup",
      legend: ["남성", "여성"],
      x: ["유입인구"],
    },
    MOP10020_12: {
      chartName: "mopGenderAgeOutflowDataGroup",
      legend: ["남성", "여성"],
      x: ["유출인구"],
    },
    MOP10020_13: {
      chartName: "mopPurposeDataGroup",
      legend: ["유입인구", "유출인구"],
    },
    MOP10020_14: {
      chartName: "mopTransDataGroup",
      legend: ["유입인구", "유출인구"],
    },
  },
  MOP20010: {
    MOP20010_03: {
      chartName: "oddFlowData",
      legend: ["지역", "생활인구"],
    },
    MOP20010_04: {
      chartName: "oddLastyearData",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20010_04_1: {
      chartName: "oddPreMonthData",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20010_05: {
      chartName: "oddDailyMoveTrendData",
      legend: ["인구"],
      x: ["일자"],
    },
    MOP20010_06: {
      chartName: "oddWeekPopData",
      legend: ["인구"],
      x: ["요일"],
    },
    MOP20010_06_1: {
      chartName: "oddWeekdayHolidayMoveData",
      legend: ["평일", "휴일"],
      x: ["인구"],
    },
    MOP20010_07: {
      chartName: "oddArrivalTimePopData",
      legend: ["유입인구"],
    },
    MOP20010_08: {
      chartName: "oddDepartOutData",
      legend: ["유출인구"],
    },
    MOP20010_09: {
      chartName: "oddGenderData",
      legend: ["인구"],
      x: ["남성", "여성"],
    },
    MOP20010_09_1: {
      chartName: "oddAgeData",
      legend: ["인구"],
      x: ["나이"],
    },
    MOP20010_10: {
      chartName: "oddGenderAgeInflowData",
      legend: ["남성", "여성"],
      x: ["유입인구"],
    },
    MOP20010_11: {
      chartName: "oddGenderAgeOutflowData",
      legend: ["남성", "여성"],
      x: ["유출인구"],
    },
    MOP20010_12: {
      chartName: "oddPurposeData",
      legend: ["인구"],
    },
    MOP20010_13: {
      chartName: "oddTransData",
      legend: ["인구"],
    },
  },
  MOP20020: {
    MOP20020_03: {
      chartName: "oddFlowData",
      legend: ["지역", "생활인구"],
    },
    MOP20020_04: {
      chartName: "oddLastyearData",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20020_04_1: {
      chartName: "oddPreMonthData",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20020_05: {
      chartName: "oddDailyMoveTrendData",
      legend: ["인구"],
      x: ["일자"],
    },
    MOP20020_06: {
      chartName: "oddWeekPopData",
      legend: ["인구"],
      x: ["요일"],
    },
    MOP20020_06_1: {
      chartName: "oddWeekdayHolidayMoveData",
      legend: ["평일", "휴일"],
      x: ["인구"],
    },
    MOP20020_07: {
      chartName: "oddArrivalTimePopData",
      legend: ["유입인구"],
    },
    MOP20020_08: {
      chartName: "oddDepartOutData",
      legend: ["유출인구"],
    },
    MOP20020_09: {
      chartName: "oddGenderData",
      legend: ["인구"],
      x: ["남성", "여성"],
    },
    MOP20020_09_1: {
      chartName: "oddAgeData",
      legend: ["인구"],
      x: ["나이"],
    },
    MOP20020_10: {
      chartName: "oddGenderAgeInflowData",
      legend: ["남성", "여성"],
      x: ["유입인구"],
    },
    MOP20020_11: {
      chartName: "oddGenderAgeOutflowData",
      legend: ["남성", "여성"],
      x: ["유출인구"],
    },
    MOP20020_12: {
      chartName: "oddPurposeData",
      legend: ["인구"],
    },
    MOP20020_13: {
      chartName: "oddTransData",
      legend: ["인구"],
    },
  },
  MOP20030: {
    MOP20030_03: {
      chartName: "oddFlowDataGroup",
      legend: ["지역", "생활인구"],
    },
    MOP20030_04: {
      chartName: "oddLastyearDataGroup",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20030_04_1: {
      chartName: "oddPreMonthDataGroup",
      legend: ["인구"],
      x: ["기간"],
    },
    MOP20030_05: {
      chartName: "oddDailyMoveTrendDataGroup",
      legend: ["인구"],
      x: ["일자"],
    },
    MOP20030_06: {
      chartName: "oddWeekPopDataGroup",
      legend: ["인구"],
      x: ["요일"],
    },
    MOP20030_06_1: {
      chartName: "oddWeekdayHolidayMoveDataGroup",
      legend: ["평일", "휴일"],
      x: ["인구"],
    },
    MOP20030_07: {
      chartName: "oddArrivalTimePopDataGroup",
      legend: ["유입인구"],
    },
    MOP20030_08: {
      chartName: "oddDepartOutDataGroup",
      legend: ["유출인구"],
    },
    MOP20030_09: {
      chartName: "oddGenderDataGroup",
      legend: ["인구"],
      x: ["남성", "여성"],
    },
    MOP20030_09_1: {
      chartName: "oddAgeDataGroup",
      legend: ["인구"],
      x: ["나이"],
    },
    MOP20030_10: {
      chartName: "oddGenderAgeInflowDataGroup",
      legend: ["남성", "여성"],
      x: ["유입인구"],
    },
    MOP20030_11: {
      chartName: "oddGenderAgeOutflowDataGroup",
      legend: ["남성", "여성"],
      x: ["유출인구"],
    },
    MOP20030_12: {
      chartName: "oddPurposeDataGroup",
      legend: ["인구"],
    },
    MOP20030_13: {
      chartName: "oddTransDataGroup",
      legend: ["인구"],
    },
  },
  MOP30010: {
    MOP30010_03: {
      chartName: "purposeMoveInflowData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP30010_03_1: {
      chartName: "purposeMoveInflowRatioData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP30010_04: {
      chartName: "purposeRegionMoveInflowData",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP30010_04_1: {
      chartName: "purposeRegionMoveInflowRatioData",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP30010_05: {
      chartName: "purposeDayMoveInflowTrendData",
      legend: ["이동"],
      x: ["일자"],
    },
    MOP30010_06: {
      chartName: "purposeWeekMoveInflowData",
      legend: ["이동"],
      x: ["요일"],
    },
    MOP30010_06_1: {
      chartName: "purposeWeekdayHolidayMoveInflowData",
      legend: ["이동"],
      x: ["평일", "휴일"],
    },
    MOP30010_07: {
      chartName: "purposeArriveTimeMoveInflowData",
      legend: ["이동"],
      x: ["시간"],
    },
    MOP30010_08: {
      chartName: "purposeGenMoveInflowData",
      legend: ["남성", "여성"],
      x: ["이동"],
    },
    MOP30010_08_1: {
      chartName: "purposeAgeMoveInflowData",
      legend: ["이동"],
      x: ["나이"],
    },
  },
  MOP30020: {
    MOP30020_03: {
      chartName: "purposeMoveInflowDataGroup",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP30020_03_1: {
      chartName: "purposeMoveInflowRatioDataGroup",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP30020_04: {
      chartName: "purposeRegionMoveInflowDataGroup",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP30020_04_1: {
      chartName: "purposeRegionMoveInflowRatioDataGroup",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP30020_05: {
      chartName: "purposeDayMoveInflowTrendDataGroup",
      legend: ["이동"],
      x: ["일자"],
    },
    MOP30020_06: {
      chartName: "purposeWeekMoveInflowDataGroup",
      legend: ["이동"],
      x: ["요일"],
    },
    MOP30020_06_1: {
      chartName: "purposeWeekdayHolidayMoveInflowDataGroup",
      legend: ["이동"],
      x: ["평일", "휴일"],
    },
    MOP30020_07: {
      chartName: "purposeArriveTimeMoveInflowDataGroup",
      legend: ["이동"],
      x: ["시간"],
    },
    MOP30020_08: {
      chartName: "purposeGenMoveInflowDataGroup",
      legend: ["남성", "여성"],
      x: ["이동"],
    },
    MOP30020_08_1: {
      chartName: "purposeAgeMoveInflowDataGroup",
      legend: ["이동"],
      x: ["나이"],
    },
  },
  MOP40010: {
    MOP40010_03: {
      chartName: "oddPurMoveInflowData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40010_03_1: {
      chartName: "oddPurMoveInflowRatioData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40010_04: {
      chartName: "oddPurRegionMoveInflowData",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP40010_04_1: {
      chartName: "oddPurRegionMoveInflowRatioData",
      legend: ["이동"],
      x: ["지역"],
    },
    MOP40010_05: {
      chartName: "oddPurDayMoveInflowTrendData",
      legend: ["이동"],
      x: ["일자"],
    },
    MOP40010_06: {
      chartName: "oddPurWeekMoveInflowData",
      legend: ["이동"],
      x: ["요일"],
    },
    MOP40010_06_1: {
      chartName: "oddPurWeekdayHolidayMoveInflowData",
      legend: ["이동"],
      x: ["평일", "휴일"],
    },
    MOP40010_07: {
      chartName: "oddPurArriveTimeMoveInflowData",
      legend: ["이동"],
      x: ["시간"],
    },
    MOP40010_08: {
      chartName: "oddPurGenMoveInflowData",
      legend: ["남성", "여성"],
      x: ["이동"],
    },
    MOP40010_08_1: {
      chartName: "oddPurAgeMoveInflowData",
      legend: ["이동"],
      x: ["나이"],
    },
  },
  MOP40020: {
    MOP40020_03: {
      chartName: "oddPurMoveInflowData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40020_03_1: {
      chartName: "oddPurMoveInflowRatioData",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40020_05: {
      chartName: "oddPurDayMoveInflowTrendData",
      legend: ["이동"],
      x: ["일자"],
    },
    MOP40020_06: {
      chartName: "oddPurWeekMoveInflowData",
      legend: ["이동"],
      x: ["요일"],
    },
    MOP40020_06_1: {
      chartName: "oddPurWeekdayHolidayMoveInflowData",
      legend: ["이동"],
      x: ["평일", "휴일"],
    },
    MOP40020_07: {
      chartName: "oddPurArriveTimeMoveInflowData",
      legend: ["이동"],
      x: ["시간"],
    },
    MOP40020_08: {
      chartName: "oddPurGenMoveInflowData",
      legend: ["남성", "여성"],
      x: ["이동"],
    },
    MOP40020_08_1: {
      chartName: "oddPurAgeMoveInflowData",
      legend: ["이동"],
      x: ["나이"],
    },
  },
  MOP40030: {
    MOP40030_03: {
      chartName: "oddPurMoveInflowDataGroup",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40030_03_1: {
      chartName: "oddPurMoveInflowRatioDataGroup",
      legend: ["인구"],
      x: ["이동"],
    },
    MOP40030_05: {
      chartName: "oddPurDayMoveInflowTrendDataGroup",
      legend: ["이동"],
      x: ["일자"],
    },
    MOP40030_06: {
      chartName: "oddPurWeekMoveInflowDataGroup",
      legend: ["이동"],
      x: ["요일"],
    },
    MOP40030_06_1: {
      chartName: "oddPurWeekdayHolidayMoveInflowDataGroup",
      legend: ["이동"],
      x: ["평일", "휴일"],
    },
    MOP40030_07: {
      chartName: "oddPurArriveTimeMoveInflowDataGroup",
      legend: ["이동"],
      x: ["시간"],
    },
    MOP40030_08: {
      chartName: "oddPurGenMoveInflowDataGroup",
      legend: ["남성", "여성"],
      x: ["이동"],
    },
    MOP40030_08_1: {
      chartName: "oddPurAgeMoveInflowDataGroup",
      legend: ["이동"],
      x: ["나이"],
    },
  },
  MOP50010: {
    MOP50010_01: {
      chartName: "scatterData",
      legend: ["전년동기대비유출인구증감률", "전년동기대비유입인구증감률"],
      x: ["지역"],
    },
  },
  MOP50020: {
    MOP50020_01: {
      chartName: "mopRace",
      legend: [],
      x: [],
    },
  },
  // 체류인구 현황 - 단일지역
  LLP20010: {
    LLP20010_03: {
      chartName: "llpMapData",
      legend: ["배수"],
      x: ["지역"],
    },
    LLP20010_04: {
      chartName: "llpPreYMonthData",
      legend: ["체류인구"],
      x: ["기간"],
    },
    LLP20010_04_1: {
      chartName: "llpPremonthData",
      legend: ["체류인구"],
      x: ["기간"],
    },
    LLP20010_05: {
      chartName: "llpHourDayData",
      legend: ["체류인구"],
      x: ["일자"],
    },
    LLP20010_06: {
      chartName: "llpHourWeekData",
      legend: ["체류인구"],
      x: ["평일", "휴일"],
    },
    LLP20010_06_1: {
      chartName: "llpHourWeekPerData",
      legend: ["평일", "휴일"],
      x: ["지역"],
    },
    LLP20010_07: {
      chartName: "llpGenderAgeData",
      legend: ["남성", "여성"],
      x: ["연령대"],
    },
    LLP20010_08: {
      chartName: "llpMonthGenderData",
      legend: ["연령대"],
      x: ["일자"],
    },
    LLP20010_09: {
      chartName: "llpCurrentData",
      legend: ["체류인구"],
      x: ["주민등록인구", "체류인구"],
    },
    LLP20010_09_1: {
      chartName: "llpMotchComparativeData",
      legend: ["주민등록인구", "체류인구"],
      x: ["월"],
    },
    LLP20010_10: {
      chartName: "llpHourMonthSexData",
      legend: ["남자", "여자"],
      x: ["주민등록인구", "체류인구"],
    },
    LLP20010_10_1: {
      chartName: "llpHourMonthAgeData",
      legend: ["주민등록인구", "체류인구"],
      x: ["연령대"],
    },
  },
  // 체류인구 현황 - 지역비교
  LLP20020: {
    LLP20020_03: {
      chartName: "llpMapData",
      legend: ["배수"],
      x: ["지역"],
    },
    LLP20020_04: {
      chartName: "llpPreYMonthDataGroup",
      legend: ["일자"],
      x: ["지역"],
    },
    LLP20020_04_1: {
      chartName: "llpPremonthDataGroup",
      legend: ["일자"],
      x: ["지역"],
    },
    LLP20020_05: {
      chartName: "llpHourDayDataGroup",
      legend: ["지역"],
      x: ["일자"],
    },
    LLP20020_06: {
      chartName: "llpHourWeekDataGroup",
      legend: ["평일", "휴일"],
      x: ["지역"],
    },
    LLP20020_06_1: {
      chartName: "llpHourWeekPerDataGroup",
      legend: ["평일", "휴일"],
      x: ["지역"],
    },
    LLP20020_07: {
      chartName: "llpGenderAgeDataGroup",
      legend: ["남성", "여성"],
      x: ["연령대"],
    },
    LLP20020_08: {
      chartName: "llpMonthGenderDataGroup",
      legend: ["연령대"],
      x: ["월"],
    },
    LLP20020_09: {
      chartName: "llpCurrentDataGroup",
      legend: ["체류인구"],
      x: ["주민등록인구", "체류인구"],
    },
    LLP20020_09_1: {
      chartName: "llpMotchComparativeDataGroup",
      legend: ["주민등록인구", "체류인구"],
      x: ["월"],
    },
    LLP20020_10: {
      chartName: "llpHourMonthSexDataGroup",
      legend: ["남자", "여자"],
      x: ["주민등록인구", "체류인구"],
    },
    LLP20020_10_1: {
      chartName: "llpHourMonthAgeDataGroup",
      legend: ["주민등록인구", "체류인구"],
      x: ["연령대"],
    },
  },
  // 체류인구 특성- 단일지역
  LLP30010: {
    LLP30010_03: {
      chartName: "llpStayDaysRatioData",
      legend: ["체류일수 비율"],
      x: ["1일", "2-7일", "8일 이상"],
    },
    LLP30010_03_1: {
      chartName: "llpAvgDaysOfStayData",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30010_04: {
      chartName: "llpGenderStayData",
      legend: ["남성", "여성"],
      x: ["1일", "2-7일", "8일 이상"],
    },
    LLP30010_04_1: {
      chartName: "llpAgeGroupStayData",
      legend: ["1일", "2-7일", "8일 이상"],
      x: ["연령대"],
    },
    LLP30010_05: {
      chartName: "llpStayOverRatioData",
      legend: ["숙박일수 비율"],
      x: ["무박", "1박", "2박", "3박 이상"],
    },
    LLP30010_05_1: {
      chartName: "llpAverageStayOverDaysData",
      legend: ["평균 숙박일수"],
      x: ["지역"],
    },
    LLP30010_06: {
      chartName: "llpGenderStayOverData",
      legend: ["남성", "여성"],
      x: ["무박", "1박", "2박", "3박 이상"],
    },
    LLP30010_06_1: {
      chartName: "llpAgeGroupStayOverData",
      legend: ["무박", "1박", "2박", "3박 이상"],
      x: ["연령대"],
    },
    LLP30010_07: {
      chartName: "llpExternalResidentStayRatioData",
      legend: ["동일시도", "타시도"],
      x: ["지역"],
    },
    LLP30010_07_1: {
      chartName: "llpTop10InboundAreasData",
      legend: ["유입인구 수"],
      x: ["지역"],
    },
    LLP30010_08: {
      chartName: "llpStayDaysInboundRegionRatioData",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30010_08_1: {
      chartName: "llpAverageStayDaysPerRegionData",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30010_09: {
      chartName: "llpStayTimeCompareData",
      legend: ["체류시간별 인구수"],
      x: ["1시간 이상 체류인구", "2시간 이상 체류인구", "3시간 이상 체류인구"],
    },
    LLP30010_09_1: {
      chartName: "llpAvgStayTimeData",
      legend: ["평균 체류시간"],
      x: ["지역"],
    },
    LLP30010_10: {
      chartName: "llpDailyStayTimeTrendData",
      legend: [
        "1시간 이상 체류인구",
        "2시간 이상 체류인구",
        "3시간 이상 체류인구",
      ],
      x: ["일자"],
    },
    LLP30010_11: {
      chartName: "llpStayTimeGenderRatioData",
      legend: ["남성", "여성"],
      x: ["1시간 이상 체류인구", "2시간 이상 체류인구", "3시간 이상 체류인구"],
    },
    LLP30010_12: {
      chartName: "llpStayTimeAgeGroupRatioData",
      legend: [
        "1시간 이상 체류인구",
        "2시간 이상 체류인구",
        "3시간 이상 체류인구",
      ],
      x: ["연령대"],
    },
  },
  // 체류인구 특성 - 지역비교
  LLP30020: {
    LLP30020_03: {
      chartName: "llpStayDaysRatioDataGroup",
      legend: ["체류일수 비율"],
      x: ["1일", "2-7일", "8일 이상"],
    },
    LLP30020_03_1: {
      chartName: "llpAvgDaysOfStayDataGroup",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30020_04: {
      chartName: "llpGenderStayDataGroup",
      legend: ["남성", "여성"],
      x: ["1일", "2-7일", "8일 이상"],
    },
    LLP30020_04_1: {
      chartName: "llpAgeGroupStayData",
      legend: ["1일", "2-7일", "8일 이상"],
      x: ["연령대"],
    },
    LLP30020_05: {
      chartName: "llpStayOverRatioDataGroup",
      legend: ["숙박일수 비율"],
      x: ["무박", "1박", "2박", "3박 이상"],
    },
    LLP30020_05_1: {
      chartName: "llpAverageStayOverDaysDataGroup",
      legend: ["평균 숙박일수"],
      x: ["지역"],
    },
    LLP30020_06: {
      chartName: "llpGenderStayOverDataGroup",
      legend: ["남성", "여성"],
      x: ["무박", "1박", "2박", "3박 이상"],
    },
    LLP30020_06_1: {
      chartName: "llpAgeGroupStayOverData",
      legend: ["무박", "1박", "2박", "3박 이상"],
      x: ["연령대"],
    },
    LLP30020_07: {
      chartName: "llpExternalResidentStayRatioDataGroup",
      legend: ["동일시도", "타시도"],
      x: ["지역"],
    },
    LLP30020_07_1: {
      chartName: "llpTop10InboundAreasDataGroup",
      legend: ["유입인구 수"],
      x: ["지역"],
    },
    LLP30020_08: {
      chartName: "llpStayDaysInboundRegionRatioDataGroup",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30020_08_1: {
      chartName: "llpAverageStayDaysPerRegionDataGroup",
      legend: ["평균 체류일수"],
      x: ["지역"],
    },
    LLP30020_09: {
      chartName: "llpStayTimeCompareDataGroup",
      legend: ["체류시간별 인구수"],
      x: ["1시간 이상 체류인구", "2시간 이상 체류인구", "3시간 이상 체류인구"],
    },
    LLP30020_09_1: {
      chartName: "llpAvgStayTimeDataGroup",
      legend: ["평균 체류시간"],
      x: ["지역"],
    },
    LLP30020_10: {
      chartName: "llpDailyStayTimeTrendDataGroup",
      legend: [
        "1시간 이상 체류인구",
        "2시간 이상 체류인구",
        "3시간 이상 체류인구",
      ],
      x: ["일자"],
    },
    LLP30020_11: {
      chartName: "llpStayTimeGenderRatioDataGroup",
      legend: ["남성", "여성"],
      x: ["1시간 이상 체류인구", "2시간 이상 체류인구", "3시간 이상 체류인구"],
    },
    LLP30020_12: {
      chartName: "llpStayTimeAgeGroupRatioDataGroup",
      legend: [
        "1시간 이상 체류인구",
        "2시간 이상 체류인구",
        "3시간 이상 체류인구",
      ],
      x: ["연령대"],
    },
  },
  LLP40010: {
    LLP40010_01: {
      chartName: "llpPreYearData",
      legend: [
        "체류인구 배수",
        "평균 체류일수",
        "평균 체류시간",
        // "타시도 거주자 비중",
      ],
      x: ["인구감소지역 평균", "지역"],
    },
    LLP40010_01_1: {
      chartName: "llpFlowData",
      legend: ["지역", "체류인구"],
    },
  },
  LLP40020: {
    LLP40020_01: {
      chartName: "llpRace",
      legend: [],
      x: [],
    },
  },
  ALP10010: {
    ALP10010_03: {
      chartName: "timeSeriesData",
      legend: ["생활인구"],
    },
    ALP10010_04: {
      chartName: "lastyearData",
      legend: ["생활인구"],
      x: ["기간"],
    },
    ALP10010_04_1: {
      chartName: "preMonthData",
      legend: ["생활인구"],
      x: ["기간"],
    },
    ALP10010_05: {
      chartName: "monthData",
      legend: ["생활인구"],
      x: ["일자"],
    },
    ALP10010_06: {
      chartName: "genderageData",
      legend: ["생활인구"],
      x: ["남성", "여성"],
    },
    ALP10010_07: {
      chartName: "weekData",
      legend: ["생활인구"],
      x: ["요일"],
    },
    ALP10010_07_1: {
      chartName: "weekedData",
      legend: ["생활인구"],
      x: ["평일", "휴일"],
    },
    ALP10010_08: {
      chartName: "timeGenderPopData",
      legend: ["생활인구"],
      x: ["남성", "여성"],
    },
    ALP10010_09: {
      chartName: "timeAgePopData",
      legend: ["생활인구"],
      x: ["나이"],
    },
    ALP10010_10: {
      chartName: "timeDayPopData",
      legend: ["생활인구"],
      x: ["요일"],
    },
    ALP10010_11: {
      chartName: "timeWeekPopData",
      legend: ["생활인구"],
      x: ["평일", "휴일"],
    },
    ALP10010_12: {
      chartName: "districtData",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10010_13: {
      chartName: "inflowData",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10010_13_1: {
      chartName: "weekendInflowData",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10010_14: {
      chartName: "outflowData",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10010_14_1: {
      chartName: "weekendOutflowData",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10010_15: {
      chartName: "foreignerLastyearData",
      legend: ["외국인생활인구"],
      x: ["기간"],
    },
    ALP10010_15_1: {
      chartName: "foreignerPreMonthData",
      legend: ["외국인생활인구"],
      x: ["기간"],
    },
    ALP10010_16: {
      chartName: "foreignerMonthData",
      legend: ["외국인생활인구"],
      x: ["일자"],
    },
    ALP10010_17: {
      chartName: "foreignerWeekData",
      legend: ["외국인생활인구"],
      x: ["요일"],
    },
    ALP10010_17_1: {
      chartName: "foreignerTimeData",
      legend: ["외국인생활인구"],
      x: ["시간"],
    },
    ALP10010_18: {
      chartName: "foreignerTimeCountryData",
      legend: ["국가"],
      x: ["시간"],
    },
    ALP10010_19: {
      chartName: "foreignerData",
      legend: ["국가"],
    },
  },
  ALP10020: {
    ALP10020_03: {
      chartName: "timeSeriesDataGroup",
      legend: ["생활인구"],
    },
    ALP10020_04: {
      chartName: "lastyearDataGroup",
      legend: ["생활인구"],
      x: ["기간"],
    },
    ALP10020_04_1: {
      chartName: "preMonthDataGroup",
      legend: ["생활인구"],
      x: ["기간"],
    },
    ALP10020_05: {
      chartName: "monthDataGroup",
      legend: ["생활인구"],
      x: ["일자"],
    },
    ALP10020_06: {
      chartName: "genderageDataGroup",
      legend: ["생활인구"],
      x: ["남성", "여성"],
    },
    ALP10020_07: {
      chartName: "weekDataGroup",
      legend: ["생활인구"],
      x: ["요일"],
    },
    ALP10020_07_1: {
      chartName: "weekedDataGroup",
      legend: ["생활인구"],
      x: ["평일", "휴일"],
    },
    ALP10020_08: {
      chartName: "timeGenderPopDataGroup",
      legend: ["생활인구"],
      x: ["남성", "여성"],
    },
    ALP10020_09: {
      chartName: "timeAgePopDataGroup",
      legend: ["생활인구"],
      x: ["나이"],
    },
    ALP10020_10: {
      chartName: "timeDayPopDataGroup",
      legend: ["생활인구"],
      x: ["요일"],
    },
    ALP10020_11: {
      chartName: "timeWeekPopDataGroup",
      legend: ["생활인구"],
      x: ["평일", "휴일"],
    },
    ALP10020_12: {
      chartName: "districtDataGroup",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10020_13: {
      chartName: "inflowDataGroup",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10020_13_1: {
      chartName: "weekendInflowDataGroup",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10020_14: {
      chartName: "outflowDataGroup",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10020_14_1: {
      chartName: "weekendOutflowDataGroup",
      legend: ["생활인구"],
      x: ["지역"],
    },
    ALP10020_15: {
      chartName: "foreignerLastyearDataGroup",
      legend: ["외국인생활인구"],
      x: ["기간"],
    },
    ALP10020_15_1: {
      chartName: "foreignerPreMonthDataGroup",
      legend: ["외국인생활인구"],
      x: ["기간"],
    },
    ALP10020_16: {
      chartName: "foreignerMonthDataGroup",
      legend: ["외국인생활인구"],
      x: ["일자"],
    },
    ALP10020_17: {
      chartName: "foreignerWeekDataGroup",
      legend: ["외국인생활인구"],
      x: ["요일"],
    },
    ALP10020_17_1: {
      chartName: "foreignerTimeDataGroup",
      legend: ["외국인생활인구"],
      x: ["시간"],
    },
    ALP10020_18: {
      chartName: "foreignerTimeCountryDataGroup",
      legend: ["국가"],
      x: ["시간"],
    },
    ALP10020_19: {
      chartName: "foreignerDataGroup",
      legend: ["국가"],
    },
  },
  ALP20010: {
    ALP20010_03: {
      chartName: "pCurrentData",
      legend: ["거주인구", "직장인구", "방문인구"],
    },
    ALP20010_03_1: {
      chartName: "pMonthData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["일자"],
    },
    ALP20010_04: {
      chartName: "pDayData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["일자"],
    },
    ALP20010_05: {
      chartName: "pGenderData",
      legend: ["남성", "여성"],
      x: ["거주인구", "직장인구", "방문인구"],
    },
    ALP20010_05_1: {
      chartName: "pAgeData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["나이"],
    },
    ALP20010_06: {
      chartName: "pGenderAgeResidenceData",
      legend: ["남성", "여성"],
      x: ["거주인구"],
    },
    ALP20010_07: {
      chartName: "pGenderAgeWorkerData",
      legend: ["남성", "여성"],
      x: ["직장인구"],
    },
    ALP20010_08: {
      chartName: "pGenderAgeVisitorData",
      legend: ["남성", "여성"],
      x: ["방문인구"],
    },
    ALP20010_09: {
      chartName: "pWeekData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["요일"],
    },
    ALP20010_09_1: {
      chartName: "pWeekedData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["평일", "휴일"],
    },
    ALP20010_10: {
      chartName: "pTimeData",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["시간"],
    },
  },
  ALP20020: {
    ALP20020_03: {
      chartName: "pCurrentDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
    },
    ALP20020_03_1: {
      chartName: "pMonthDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["일자"],
    },
    ALP20020_04: {
      chartName: "pDayDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["일자"],
    },
    ALP20020_05: {
      chartName: "pGenderDataGroup",
      legend: ["남성", "여성"],
      x: ["거주인구", "직장인구", "방문인구"],
    },
    ALP20020_05_1: {
      chartName: "pAgeDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["나이"],
    },
    ALP20020_06: {
      chartName: "pGenderAgeResidenceDataGroup",
      legend: ["남성", "여성"],
      x: ["거주인구"],
    },
    ALP20020_07: {
      chartName: "pGenderAgeWorkerDataGroup",
      legend: ["남성", "여성"],
      x: ["직장인구"],
    },
    ALP20020_08: {
      chartName: "pGenderAgeVisitorDataGroup",
      legend: ["남성", "여성"],
      x: ["방문인구"],
    },
    ALP20020_09: {
      chartName: "pWeekDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["요일"],
    },
    ALP20020_09_1: {
      chartName: "pWeekedDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["평일", "휴일"],
    },
    ALP20020_10: {
      chartName: "pTimeDataGroup",
      legend: ["거주인구", "직장인구", "방문인구"],
      x: ["시간"],
    },
  },
  ALP30010: {
    ALP30010_03: {
      chartName: "currentData",
      legend: ["거주인구", "주민등록인구"],
    },
    ALP30010_03_1: {
      chartName: "cMonthData",
      legend: ["거주인구", "주민등록인구"],
    },
    ALP30010_04: {
      chartName: "cDayData",
      legend: ["거주인구 오전 2시", "거주인구 오후 2시", "주민등록인구"],
    },
    ALP30010_05: {
      chartName: "cGenderData",
      legend: ["남성", "여성"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30010_05_1: {
      chartName: "cAgeData",
      legend: ["거주인구", "주민등록인구"],
      x: ["나이"],
    },
    ALP30010_06: {
      chartName: "cGenderAgeResidenceData",
      legend: ["남성", "여성"],
      x: ["거주인구"],
    },
    ALP30010_07: {
      chartName: "cGenderAgeRegisteredData",
      legend: ["남성", "여성"],
      x: ["주민등록인구"],
    },
    ALP30010_08: {
      chartName: "cDistrictData",
      legend: ["지역"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30010_08_1: {
      chartName: "cDistrictStackData",
      legend: ["지역"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30010_09: {
      chartName: "modalCurrentData",
      legend: ["생활인구수"],
      x: ["지역"]
    },
    ALP30010_10: {
      chartName: "modalYearData",
      legend: ["주민등록인구"],
      x: ["기간"]
    },
    ALP30010_11: {
      chartName: "extinctionData",
      legend: ["생활인구수"],
      x: ["지역"]
    },
    ALP30010_12: {
      chartName: "modalGenderData",
      legend: ["남성", "여성"],
      x: ["주민등록인구"]
    },
    ALP30010_12_1: {
      chartName: "modalAgeData",
      legend: ["남성", "여성"],
      x: ["주민등록인구"]
    },
  },
  ALP30020: {
    ALP30020_03: {
      chartName: "currentDataGroup",
      legend: ["거주인구", "주민등록인구"],
    },
    ALP30020_03_1: {
      chartName: "cMonthDataGroup",
      legend: ["거주인구", "주민등록인구"],
    },
    ALP30020_04: {
      chartName: "cDayDataGroup",
      legend: ["거주인구 오전 2시", "거주인구 오후 2시", "주민등록인구"],
    },
    ALP30020_05: {
      chartName: "cGenderDataGroup",
      legend: ["남성", "여성"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30020_05_1: {
      chartName: "cAgeDataGroup",
      legend: ["거주인구", "주민등록인구"],
      x: ["나이"],
    },
    ALP30020_06: {
      chartName: "cGenderAgeResidenceDataGroup",
      legend: ["남성", "여성"],
      x: ["거주인구"],
    },
    ALP30020_07: {
      chartName: "cGenderAgeResidenceDataGroup",
      legend: ["남성", "여성"],
      x: ["주민등록인구"],
    },
    ALP30020_08: {
      chartName: "cDistrictDataGroup",
      legend: ["지역"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30020_08_1: {
      chartName: "cDistrictStackDataGroup",
      legend: ["지역"],
      x: ["거주인구", "주민등록인구"],
    },
    ALP30010_09: {
      chartName: "modalCurrentData",
      legend: ["생활인구수"],
      x: ["지역"]
    },
    ALP30010_10: {
      chartName: "modalYearData",
      legend: ["주민등록인구"],
      x: ["기간"]
    },
    ALP30010_11: {
      chartName: "extinctionData",
      legend: ["생활인구수"],
      x: ["지역"]
    },
    ALP30010_12: {
      chartName: "modalGenderData",
      legend: ["남성", "여성"],
      x: ["주민등록인구"]
    },
    ALP30010_12_1: {
      chartName: "modalAgeData",
      legend: ["남성", "여성"],
      x: ["주민등록인구"]
    },
  },
  ALP40010: {
    ALP40010_01: {
      chartName: "preYearData",
      legend: [
        "거주인구비율",
        "직장인구비율",
        "방문인구비율",
        "유입인구비율",
        "유출인구비율",
      ],
    },
    ALP40010_01_1: {
      chartName: "flowData",
      legend: ["지역", "생활인구"],
    },
  },
  ALP40020: {
    ALP40020_01: {
      chartName: "alpRace",
      legend: [],
      x: [],
    },
  },
};
