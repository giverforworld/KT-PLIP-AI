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

import * as template from "@/utils/summary/summaryTemplate";
import * as alpTemplate from "@/utils/summary/summaryALPTemplate";

export const summaryTemplates: {
  [screenId: string]: { [chartId: string]: SummeryTemplateConfig };
} = {
  MOP10010: {
    MOP10010_03: {
      summaryTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP10010_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.comparePeriodTemplate(regionName, data, legend!),
    },
    MOP10010_05: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupLineDayTemplate(regionName, data, legend!),
    },
    MOP10010_06: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarDowTemplate(regionName, data, legend!),
    },
    MOP10010_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP10010_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10010_08: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10010_09: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10010_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP10010_10_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
    MOP10010_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP10010_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP10010_13: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarPurposeTemplate(regionName, data, legend!),
    },
    MOP10010_14: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarWayTemplate(regionName, data, legend!),
    },
  },
  MOP10020: {
    MOP10020_03: {
      summaryTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP10020_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.comparePeriodTemplate(regionName, data, legend!),
    },
    MOP10020_05: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupLineDayTemplate(regionName, data, legend!),
    },
    MOP10020_06: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarDowTemplate(regionName, data, legend!),
    },
    MOP10020_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP10020_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP10020_08: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP10020_09: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10020_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP10020_10_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
    MOP10020_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP10020_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP10020_13: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarPurposeTemplate(regionName, data, legend!),
    },
    MOP10020_14: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarWayTemplate(regionName, data, legend!),
    },
  },
  MOP20010: {
    MOP20010_03: {
      summaryTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20010_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.comparePeriodTemplate(regionName, data, legend!),
    },
    MOP20010_05: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupLineDayTemplate(regionName, data, legend!),
    },
    MOP20010_06: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarDowTemplate(regionName, data, legend!),
    },
    MOP20010_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20010_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20010_08: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20010_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP20010_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
    MOP20010_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20010_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20010_12: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarPurposeTemplate(regionName, data, legend!),
    },
    MOP20010_13: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarWayTemplate(regionName, data, legend!),
    },
  },
  MOP20020: {
    MOP20020_03: {
      summaryTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20020_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.comparePeriodTemplate(regionName, data, legend!),
    },
    MOP20020_05: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupLineDayTemplate(regionName, data, legend!),
    },
    MOP20020_06: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarDowTemplate(regionName, data, legend!),
    },
    MOP20020_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20020_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20020_08: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20020_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP20020_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
    MOP20020_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20020_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20020_12: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarPurposeTemplate(regionName, data, legend!),
    },
    MOP20020_13: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarWayTemplate(regionName, data, legend!),
    },
  },
  MOP20030: {
    MOP20030_03: {
      summaryTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20030_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.comparePeriodODTemplate(regionName, data, legend!),
    },
    MOP20030_05: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupLineDayODTemplate(regionName, data, legend!),
    },
    MOP20030_06: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarDowTemplate(regionName, data, legend!),
    },
    MOP20030_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20030_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP20030_08: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP20030_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarSexTemplate(regionName, data, legend!, x!),
    },
    MOP20030_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
    MOP20030_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20030_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    MOP20030_12: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarPurposeTemplate(regionName, data, legend!),
    },
    MOP20030_13: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupBarWayTemplate(regionName, data, legend!),
    },
  },
  MOP30010: {
    MOP30010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.MoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP30010_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupLineDayMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarDowMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP30010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP30020: {
    MOP30020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.MoveMergedTemplate(regionName, data, legend!, x!),
    },
    MOP30020_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP30020_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupLineDayMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarDowMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP30020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40010: {
    MOP40010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.MoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_04: {
      summaryTemplate: (regionName, data, legend) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP40010_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupLineDayMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarDowMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40020: {
    MOP40020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.MoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupLineDayMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarDowMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40030: {
    MOP40030_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.MoveMergedTemplate(regionName, data, legend!, x!),
    },
    MOP40030_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupLineDayMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.groupBarDowMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_07: {
      summaryTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40030_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  LLP20010: {
    LLP20010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20010_04: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayComparePeriodTemplate(regionName, data, legend!),
    },
    LLP20010_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysTemplate(regionName, data, legend!),
    },
    LLP20010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDowTemplate(regionName, data, legend!),
    },
    LLP20010_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.staySexAgeTemplate(regionName, data, legend!),
    },
    LLP20010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayMonsAgeTemplate(regionName, data, legend!),
    },
    LLP20010_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayRropTemplate(regionName, data),
    },
    LLP20010_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.staySexTemplate(regionName, data, legend!),
    },
    LLP20010_10_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayAgeTemplate(regionName, data, legend!),
    },
  },
  LLP20020: {
    LLP20020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20020_04: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayComparePeriodTemplate(regionName, data, legend!),
    },
    LLP20020_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysTemplate(regionName, data, legend!),
    },
    LLP20020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDowTemplate(regionName, data, legend!),
    },
    LLP20020_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.staySexAgeTemplate(regionName, data, legend!),
    },
    LLP20020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayMonsAgeTemplate(regionName, data, legend!),
    },
    LLP20020_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayRropTemplate(regionName, data),
    },
    LLP20020_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.staySexTemplate(regionName, data, legend!),
    },
    LLP20020_10_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayAgeTemplate(regionName, data, legend!),
    },
  },
  LLP30010: {
    LLP30010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_03_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_04_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysSexAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_05_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysSexAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowDaysSexTemplate(regionName, data, legend!, x!),
    },
    LLP30010_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeTemplate(regionName, data, legend!, x!),
    },
    LLP30010_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeSexTemplate(regionName, data, legend!, x!),
    },
    LLP30010_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeAgeTemplate(regionName, data, legend!, x!),
    },
  },
  LLP30020: {
    LLP30020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_03_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_04_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysSexAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_05: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_05_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_06_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDaysSexAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowDaysSexTemplate(regionName, data, legend!, x!),
    },
    LLP30020_08_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayDTAvgRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeTemplate(regionName, data, legend!, x!),
    },
    LLP30020_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeSexTemplate(regionName, data, legend!, x!),
    },
    LLP30020_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.stayTimeAgeTemplate(regionName, data, legend!, x!),
    },
  },
  ALP10010: {
    ALP10010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeTemplate(regionName, data, legend!, x),
    },
    ALP10010_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.comparePeriodTemplate(regionName, data, legend!),
    },
    ALP10010_05: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.groupLineDayTemplate(regionName, data, legend!),
    },
    ALP10010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP10010_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeTemplate(regionName, data, legend!, x),
    },
    ALP10010_07_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.barTemplate(regionName, data, legend!, x!),
    },
    ALP10010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10010_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10010_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10010_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10010_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.subzoneTimeTemplate(regionName, data, legend!, x!),
    },
    ALP10010_13_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.inflowRegionTemplate(regionName, data, legend!),
    },
    ALP10010_14_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.outflowRegionTemplate(regionName, data, legend!),
    },
    ALP10010_15: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.comparePeriodTemplate(regionName, data, legend!),
    },
    ALP10010_16: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.groupLineDayTemplate(regionName, data, legend!),
    },
    ALP10010_17: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeTemplate(regionName, data, legend!, x),
    },
    ALP10010_17_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeTemplate(regionName, data, legend!, x!),
    },
    ALP10010_18: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10010_19: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.ratioTemplate(regionName, data, legend!),
    },
  },
  ALP10020: {
    ALP10020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeRegionTemplate(regionName, data, legend!, x!),
    },
    ALP10020_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.comparePeriodTemplate(regionName, data, legend!),
    },
    ALP10020_05: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.groupLineDayRegionTemplate(regionName, data, legend!),
    },
    ALP10020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP10020_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineDowRegionTemplate(regionName, data, legend!, x!),
    },
    ALP10020_07_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupBarTemplate(regionName, data, legend!, x!),
    },
    ALP10020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10020_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10020_10: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10020_11: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10020_12: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.subzoneTimeTemplate(regionName, data, legend!, x!),
    },
    ALP10020_13_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.inflowRegionTemplate(regionName, data, legend!),
    },
    ALP10020_14_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.outflowRegionTemplate(regionName, data, legend!),
    },
    ALP10020_15: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.comparePeriodTemplate(regionName, data, legend!),
    },
    ALP10020_16: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.groupLineDayRegionTemplate(regionName, data, legend!),
    },
    ALP10020_17: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineDowRegionTemplate(regionName, data, legend!, x!),
    },
    ALP10020_17_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineTimeRegionTemplate(regionName, data, legend!, x!),
    },
    ALP10020_18: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupTimeznTemplate(regionName, data, legend!, x!),
    },
    ALP10020_19: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.ratioTemplate(regionName, data, legend!),
    },
  },
  ALP20010: {
    ALP20010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.barTemplate(regionName, data, legend!, x!),
    },
    ALP20010_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnDayLineTemplate(regionName, data, legend!),
    },
    ALP20010_05_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP20010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20010_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20010_09: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupLineDowTemplate(regionName, data, legend!),
    },
    ALP20010_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.stackWeekdaysPtrnTemplate(regionName, data, legend!, x!),
    },
    ALP20010_10: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnTimeLineTemplate(regionName, data, legend!),
    },
  },
  ALP20020: {
    ALP20020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupBarTemplate(regionName, data, legend!, x!),
    },
    ALP20020_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnDayLineTemplate(regionName, data, legend!),
    },
    ALP20020_05_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP20020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20020_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP20020_09: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.groupLineDowTemplate(regionName, data, legend!),
    },
    ALP20020_09_1: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.stackWeekdaysPtrnTemplate(regionName, data, legend!, x!),
    },
    ALP20020_10: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnTimeLineTemplate(regionName, data, legend!),
    },
  },
  ALP30010: {
    ALP30010_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.barTemplate(regionName, data, legend!, x!),
    },
    ALP30010_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.residDayLineTemplate(regionName, data, legend!),
    },
    ALP30010_05_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP30010_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP30010_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP30010_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.residSubzoneTemplate(regionName, data, legend!),
    },
  },
  ALP30020: {
    ALP30020_03: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.groupBarTemplate(regionName, data, legend!, x!),
    },
    ALP30020_04: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.residDayLineTemplate(regionName, data, legend!),
    },
    ALP30020_05_1: {
      summaryTemplate: (regionName, data, legend) =>
        alpTemplate.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP30020_06: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP30020_07: {
      summaryTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP30020_08: {
      summaryTemplate: (regionName, data, legend, x) =>
        alpTemplate.residSubzoneTemplate(regionName, data, legend!),
    },
  },
};
