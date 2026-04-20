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
import * as dashService from "@/service/dashboards/dash";
import { transInfo, transMain } from "@/utils/dashboard/transformChart";

export async function getSidoChartData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start } = req.query;

  try {
    const [liveData, stayData, movData, timeData, sidoinfoData, rgnchangedData] = await Promise.all([
      dashService.getSidoAlpData(start as string),
      dashService.getSidoLlpData(start as string),
      dashService.getSidoMopData(start as string),
      dashService.getSidoPeriodData(start as string),
      dashService.getSidoInfoData(start as string),
      dashService.getRgnChangedInfoData(),
      start as string,
    ]);

    const combinedData = await transMain(liveData, stayData, movData, timeData, sidoinfoData, rgnchangedData, start);

    res.status(200).json(combinedData);
  } catch (error) {
    next(error);
  }
}

export async function getSidoInfoData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start } = req.query;

  try {
    const [
      mainData,
      stay3Data,
      inflowData,
      outflowData,
      sidoinfoData,
      rgnchangedData,
    ] = await Promise.all([
      dashService.getSidoHourData(start as string),
      dashService.getStay3Data(start as string),
      dashService.getInFlowData(start as string),
      dashService.getOutFlowData(start as string),
      dashService.getSidoInfoData(start as string),
      dashService.getRgnChangedInfoData(),
    ]);

    const combinedData = await transInfo(
      mainData,
      stay3Data,
      inflowData,
      outflowData,
      sidoinfoData,
      rgnchangedData,
      start,
    );

    res.status(200).json(combinedData);
  } catch (error) {
    next(error);
  }
}
