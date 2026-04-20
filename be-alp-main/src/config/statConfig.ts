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

import * as template from "@/utils/summary/statTemplate";

export const statTemplates: {
  [screenId: string]: { [chartId: string]: StatTemplateConfig };
} = {
  MOP10010: {
    MOP10010_03: {
      statTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP10010_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP10010_09: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10010_10: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP10010_10_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
  },
  MOP10020: {
    MOP10020_03: {
      statTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP10020_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP10020_09: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP10020_10: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP10020_10_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
  },
  MOP20010: {
    MOP20010_03: {
      statTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20010_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20010_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20010_08: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20010_09: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP20010_09_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
  },
  MOP20020: {
    MOP20020_03: {
      statTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20020_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20020_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20020_08: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineTemplate(regionName, data, legend!),
    },
    MOP20020_09: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexTemplate(regionName, data, legend!, x!),
    },
    MOP20020_09_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
  },
  MOP20030: {
    MOP20030_03: {
      statTemplate: (regionName, data, legend) =>
        template.flowODTemplate(regionName, data, legend!),
    },
    MOP20030_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysRatioTemplate(regionName, data, legend!, x!),
    },
    MOP20030_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP20030_08: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineRegionTemplate(regionName, data, legend!),
    },
    MOP20030_09: {
      statTemplate: (regionName, data, legend, x) =>
        template.groupBarSexTemplate(regionName, data, legend!, x!),
    },
    MOP20030_09_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageTemplate(regionName, data, legend!, x!),
    },
  },
  MOP30010: {
    MOP30010_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_04: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP30010_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP30010_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30010_08_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP30020: {
    MOP30020_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveMergedTemplate(regionName, data, legend!, x!),
    },
    MOP30020_04: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP30020_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP30020_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP30020_08_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40010: {
    MOP40010_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_04: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveFlowRegionTemplate(regionName, data, legend!),
    },
    MOP40010_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40010_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40010_08_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40020: {
    MOP40020_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveNTemplate(regionName, data, legend!, x!),
    },
    MOP40020_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40020_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40020_08_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP40030: {
    MOP40030_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.MoveMergedTemplate(regionName, data, legend!, x!),
    },
    MOP40030_06_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stackWeekdaysMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_07: {
      statTemplate: (regionName, data, legend) =>
        template.groupTimeLineMoveTemplate(regionName, data, legend!),
    },
    MOP40030_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexMoveTemplate(regionName, data, legend!, x!),
    },
    MOP40030_08_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.ageMoveTemplate(regionName, data, legend!, x!),
    },
  },
  MOP50010: {
    MOP50010_01: {
      statTemplate: (regionName, data, legend, x) =>
        template.mopTotalTemplate(regionName, data, legend!, x!),
    },
  },
  // 체류인구현황 - 단일지역
  LLP20010: {
    LLP20010_04: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatLastRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20010_04_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatTotalTemplate(regionName, data, legend!, x!),
    },
    LLP20010_06: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatWeekRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20010_07: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatSexRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20010_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20010_09: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatResidRatioTemplate(regionName, data, legend!, x!),
    },
  },
  // 체류인구현황 - 지역비교
  LLP20020: {
    LLP20020_04: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatLastRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20020_04_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatTotalTemplate(regionName, data, legend!, x!),
    },
    LLP20020_06: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatWeekRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20020_07: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatSexRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20020_08: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatAgeRatioTemplate(regionName, data, legend!, x!),
    },
    LLP20020_09: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayStatResidRatioTemplate(regionName, data, legend!, x!),
    },
  },
  // 체류인구특성 - 단일지역
  LLP30010: {
    LLP30010_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayDaysRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_03_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
    LLP30010_05: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayDaysRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_05_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
    LLP30010_07_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30010_09_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
  },
  // 체류인구특성 - 지역비교
  LLP30020: {
    LLP30020_03: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayDaysRatioNTemplate(regionName, data, legend!, x!),
    },
    LLP30020_03_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
    LLP30020_05: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayDaysRatioNTemplate(regionName, data, legend!, x!),
    },
    LLP30020_05_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
    LLP30020_07_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.inflowRegionRatioTemplate(regionName, data, legend!, x!),
    },
    LLP30020_09_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.stayTimeAvgTemplate(regionName, data, legend!, x!),
    },
  },
  LLP40010: {
    LLP40010_01_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.llpTotalTemplate(regionName, data, legend!, x!),
    },
  },
  ALP10010: {
    ALP10010_04: {
      statTemplate: (regionName, data, legend) =>
        template.totTemplate(regionName, data, legend!),
    },
    ALP10010_06: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP10010_13_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.inflowRegionTemplate(regionName, data, legend!),
    },
    ALP10010_15: {
      statTemplate: (regionName, data, legend) =>
        template.totTemplate(regionName, data, legend!),
    },
    ALP10010_19: {
      statTemplate: (regionName, data, legend) =>
        template.fornTemplate(regionName, data, legend!),
    },
  },
  ALP10020: {
    ALP10020_04: {
      statTemplate: (regionName, data, legend) =>
        template.totTemplate(regionName, data, legend!),
    },
    ALP10020_06: {
      statTemplate: (regionName, data, legend, x) =>
        template.sexAgeTemplate(regionName, data, legend!, x!),
    },
    ALP10020_13_1: {
      statTemplate: (regionName, data, legend, x) =>
        template.inflowRegionTemplate(regionName, data, legend!),
    },
    ALP10020_15: {
      statTemplate: (regionName, data, legend) =>
        template.totTemplate(regionName, data, legend!),
    },
    ALP10020_19: {
      statTemplate: (regionName, data, legend) =>
        template.fornTemplate(regionName, data, legend!),
    },
  },
  ALP20010: {
    ALP20010_04: {
      statTemplate: (regionName, data, legend) =>
        template.ptrnDayLineTemplate(regionName, data, legend!),
    },
    ALP20010_05_1: {
      statTemplate: (regionName, data, legend) =>
        template.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP20010_09: {
      statTemplate: (regionName, data, legend) =>
        template.groupLineDowTemplate(regionName, data, legend!),
    },
  },
  ALP20020: {
    ALP20020_04: {
      statTemplate: (regionName, data, legend) =>
        template.ptrnDayLineTemplate(regionName, data, legend!),
    },
    ALP20020_05_1: {
      statTemplate: (regionName, data, legend) =>
        template.ptrnsexAgeTemplate(regionName, data, legend!),
    },
    ALP20020_09: {
      statTemplate: (regionName, data, legend) =>
        template.groupLineDowTemplate(regionName, data, legend!),
    },
  },
  ALP30010: {
    ALP30010_03: {
      statTemplate: (regionName, data, legend) =>
        template.residTotTemplate(regionName, data, legend!),
    },
    ALP30010_04: {
      statTemplate: (regionName, data, legend) =>
        template.residDayLineTemplate(regionName, data, legend!),
    },
    ALP30010_05_1: {
      statTemplate: (regionName, data, legend) =>
        template.residsexAgeTemplate(regionName, data, legend!),
    },
  },
  ALP30020: {
    ALP30020_03: {
      statTemplate: (regionName, data, legend) =>
        template.residGroupTotTemplate(regionName, data, legend!),
    },
    ALP30020_04: {
      statTemplate: (regionName, data, legend) =>
        template.residDayLineTemplate(regionName, data, legend!),
    },
    ALP30020_05_1: {
      statTemplate: (regionName, data, legend) =>
        template.residsexAgeTemplate(regionName, data, legend!),
    },
  },
  ALP40010: {
    ALP40010_01: {
      statTemplate: (regionName, data, legend, x) =>
        template.alpTotalTemplate(regionName, data, legend!, x!),
    },
  },
};
