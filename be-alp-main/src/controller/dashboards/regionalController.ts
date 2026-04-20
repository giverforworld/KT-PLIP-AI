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

import { Request, Response, NextFunction } from "express";
import * as regionalService from "@/service/dashboards/regionaldashboards";
import {
  transRegData,
  transRegData1,
  transRegData10,
  transRegData11,
  transRegData2,
  transRegData3,
  transRegData4,
  transRegData5,
  transRegData6,
  transRegData7,
  transRegData8,
  transRegData9,
} from "@/utils/dashboard/transregionalChart";

export async function regional(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, region } = req.query;

  try {
    const [
      AvgData,
      stay3Data,
      movOutData,
      movInData,
      timePopData,
      timeSetData,
      outPurposeData,
      inPurposeData,
      outWayData,
      inWayData,
      inRankData,
      outRankData,
      stayDayData,
      ldgmtDayData,
    ] = await Promise.all([
      regionalService.getSggAvgLivePopData(start as string, region as string),
      regionalService.getStayLivePop(start as string, region as string),
      regionalService.getMovOut(start as string, region as string),
      regionalService.getMovIn(start as string, region as string),
      regionalService.getTimePop(start as string, region as string),
      regionalService.getTimeSet(start as string, region as string),
      regionalService.getOutPurpose(start as string, region as string),
      regionalService.getInPurpose(start as string, region as string),
      regionalService.getOutWay(start as string, region as string),
      regionalService.getInWay(start as string, region as string),
      regionalService.getInRank(start as string, region as string),
      regionalService.getOutRank(start as string, region as string),
      regionalService.getStayDay(start as string, region as string),
      regionalService.getLdgmtDay(start as string, region as string),
    ]);

    const results = await transRegData6(
      outPurposeData,
      inPurposeData,
      start as string,
      region as string
    );

    const results1 = await transRegData7(
      outWayData,
      inWayData,
      start as string,
      region as string
    );

    const results2 = await transRegData8(
      inRankData,
      start as string,
      region as string
    );

    const results3 = await transRegData9(
      outRankData,
      start as string,
      region as string
    );

    const results4 = await transRegData10(
      stayDayData,
      start as string,
      region as string
    );

    const results5 = await transRegData11(
      ldgmtDayData,
      start as string,
      region as string
    )

    const RegDasChartData = {
      summary: [
        ...(await transRegData(
          AvgData,
          start as string,
          region as string
        )),
        ...(await transRegData1(stay3Data, start as string, region as string)),
        ...(await transRegData3(movInData, start as string, region as string)),
        ...(await transRegData2(movOutData, start as string, region as string)),
      ],
      alp: [
        ...(await transRegData4(
          timePopData,
          start as string,
          region as string
        )),
        ...(await transRegData5(
          timeSetData,
          start as string,
          region as string
        )),
      ],
      llp: [...results4, ...results5],
      mop: [...results, ...results1, ...results2, ...results3],
    };
    res.status(200).json(RegDasChartData);
  } catch (error) {
    next(error);
  }
}
