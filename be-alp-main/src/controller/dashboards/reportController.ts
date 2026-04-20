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
import * as docuService from "@/service/dashboards/docu";
import {
  transData,
  transData1,
  transData2,
  transData3,
  transData4,
  transData5,
  transData6,
} from "@/utils/dashboard/docu/transData";
import {
  transMopData,
  transMopData1,
  transMopData10,
  transMopData11,
  transMopData12,
  transMopData2,
  transMopData3,
  transMopData4,
  transMopData5,
  transMopData6,
  transMopData7,
  transMopData8,
  transMopData9,
} from "@/utils/dashboard/docu/transMopData";
import {
  transLlpData,
  transLlpData1,
  transLlpData2,
  transLlpData3,
  transLlpData4,
  transLlpData5,
  transLlpData6,
  transLlpData7,
} from "@/utils/dashboard/docu/transLlpData";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";

export async function report(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { start, region } = req.query;

  try {
    const [
      periodLiveData,
      sexLiveData,
      dayData,
      timeData,
      timedateData,
      timesetData,
      setUniquePopulAgeData,
      setUniqueLiveData,
      outPurposeData,
      inPurposeData,
      outPeriodPurposeData,
      inPeriodPurpose,
      dayOutData,
      dayInData,
      timeOutdata,
      timeIndata,
      ageOutdata,
      ageIndata,
      prpsOutData,
      prpsInData,
      prpsOutTimeData,
      prpsInTimeData,
      prpsInSexData,
      prpsInSexAgeData,
      prpsOutSexData,
      prpsOutSexAgeData,
      wayOutData,
      wayInData,
      wayOutTimeData,
      wayInTimeData,
      WayInSexAgeData,
      WayInSexData,
      WayOutSexAgeData,
      WayOutSexData,
      comparedStayPop,
      comparedStayDayPopData,
      staySexPopData,
      stayUniquePop,
      stayUniqueData,
      stayAvgData,
      dcrIndexData,
      timeByPopData,
      dcrTimeIndexData,
      ldgmtAvgData,
      dcrLdgmtIndexData,
      inRsdnData,
    ] = await Promise.all([
      docuService.getPeriodLiveData(start as string, region as string),
      docuService.getSexLiveData(start as string, region as string),
      docuService.getDayData(start as string, region as string),
      docuService.getTimeData(start as string, region as string),
      docuService.getTimeDateData(start as string, region as string),
      docuService.getTimeSetData(start as string, region as string),
      docuService.getUniqueData(start as string, region as string),
      docuService.getUniqueLiveData(start as string, region as string),
      docuService.getOutPurposeData(start as string, region as string),
      docuService.getInPurposeData(start as string, region as string),
      docuService.getPeriodOutPurposeData(start as string, region as string),
      docuService.getPeriodInPurposeData(start as string, region as string),
      docuService.getDayOutPurposeData(start as string, region as string),
      docuService.getDayInPurposeData(start as string, region as string),
      docuService.getTimeOutPurposeData(start as string, region as string),
      docuService.getTimeInPurposeData(start as string, region as string),
      docuService.getAgeOutPurposeData(start as string, region as string),
      docuService.getAgeInPurposeData(start as string, region as string),
      docuService.getOutByPurposeData(start as string, region as string),
      docuService.getInByPurposeData(start as string, region as string),
      docuService.getPrpsOutTimeData(start as string, region as string),
      docuService.getPrpsInTimeData(start as string, region as string),
      docuService.getInSexData(start as string, region as string),
      docuService.getInSexAgeData(start as string, region as string),
      docuService.getOutSexData(start as string, region as string),
      docuService.getOutSexAgeData(start as string, region as string),
      docuService.getOutByWayData(start as string, region as string),
      docuService.getInByWayData(start as string, region as string),
      docuService.getWayOutTimeData(start as string, region as string),
      docuService.getWayInTimeData(start as string, region as string),
      docuService.getWaySexAgeIn(start as string, region as string),
      docuService.getWaySexIn(start as string, region as string),
      docuService.getWaySexAgeOut(start as string, region as string),
      docuService.getWaySexOut(start as string, region as string),
      docuService.getComparedStayPop(start as string, region as string),
      docuService.getComparedStayDayPop(start as string, region as string),
      docuService.getStaySexPop(start as string, region as string),
      docuService.getUniqueStayPop(start as string, region as string),
      docuService.getUniquePop(start as string, region as string),
      docuService.getStayAvgDate(start as string, region as string),
      docuService.getDcrIndex(start as string),
      docuService.getStayTimeByPop(start as string, region as string),
      docuService.getDcrTimeIndex(start as string),
      docuService.getLdgmtAvgDate(start as string, region as string),
      docuService.getDcrLdgmtIndex(start as string),
      docuService.getInRsdnData(start as string, region as string)
    ]);
    const { prevMonth, lastYear } = calculateDates(start as string);
    const RegionFullName = await convertCDtoFullNM(Number(region));
    const RegionShortName = await convertCDtoNM(region);

    const { summaryContent, results: periodLiveResults } = await transData(
      periodLiveData,
      region as string,
      start as string
    );
    const { summaryContent1, results: ageResults } = await transData1(
      sexLiveData,
      region as string,
      start as string
    );
    const { summaryContent2, results: dayResults } = await transData2(
      dayData,
      start as string
    );
    const { summaryContent3, results: timeResults } = await transData3(
      timeData,
      start as string
    );
    const { summaryContent4, results: timesetResults } = await transData5(
      timesetData,
      start as string
    );
    const { summaryContent5, results: uniqueResults } = await transData6(
      setUniquePopulAgeData,
      setUniqueLiveData,
      start as string
    );
    const {
      summaryMopContent1,
      summaryMopContent2,
      results: flowResults,
    } = await transMopData(outPurposeData, inPurposeData, start as string);

    const { inPeriodPurposeData } = inPeriodPurpose;
    const results = await transMopData1(
      outPeriodPurposeData,
      inPeriodPurposeData,
      start as string,
      region as string,
      prevMonth as string,
      lastYear as string
    );

    const { summaryMopContent3, results: dayInOutResults } =
      await transMopData2(
        dayOutData,
        dayInData,
        start as string,
        region as string
      );

    const { summaryMopContent4, results: timeInOutResults } =
      await transMopData3(
        timeOutdata,
        timeIndata,
        start as string,
        region as string
      );

    const { summaryMopContent5, results: ageInOutResults } =
      await transMopData4(
        ageOutdata,
        ageIndata,
        start as string,
        region as string
      );

    const {
      summaryMopContent6,
      summaryMopContent7,
      results: prpsInOutResults,
    } = await transMopData5(
      prpsOutData,
      prpsInData,
      start as string,
      region as string
    );

    const {
      summaryMopContent8,
      summaryMopContent9,
      results: wayResults,
    } = await transMopData9(
      wayOutData,
      wayInData,
      start as string,
      region as string
    );

    const { comparedStayPopData } = comparedStayPop;
    const { summaryLlpContent, results: stayResults } = await transLlpData(
      comparedStayPopData,
      start as string,
      region as string,
      prevMonth as string,
      lastYear as string
    );

    const { summaryLlpContent1, results: stayDayResults } = await transLlpData1(
      comparedStayDayPopData,
      start as string,
      region as string
    );

    const { summaryLlpContent2, results: staySexResults } = await transLlpData2(
      staySexPopData,
      start as string,
      region as string
    );

    const {
      stayUniquePopData,
      prevYear1,
      prevYear2,
      prevYear3,
      prevYear4,
      prevYear5,
      prevYear6,
      prevYear7,
      prevYear8,
      prevYear9,
      prevYear10,
      prevYear11,
      prevYear12,
    } = stayUniquePop;

    const { summaryLlpContent3, results: stayUniqueResults } =
      await transLlpData3(
        stayUniquePopData,
        stayUniqueData,
        start as string,
        region as string,
        prevYear1 as string,
        prevYear2 as string,
        prevYear3 as string,
        prevYear4 as string,
        prevYear5 as string,
        prevYear6 as string,
        prevYear7 as string,
        prevYear8 as string,
        prevYear9 as string,
        prevYear10 as string,
        prevYear11 as string,
        prevYear12 as string
      );

    const { summaryLlpContent4, results: stayAvgDayResults } =
      await transLlpData4(
        stayAvgData,
        dcrIndexData,
        start as string,
        region as string
      );

    const { summaryLlpContent5, results: timebypopResults } =
      await transLlpData7(
        timeByPopData,
        dcrTimeIndexData,
        start as string,
        region as string
      );

    const { summaryLlpContent6, results: ldgmtResults } =
      await transLlpData5(
        ldgmtAvgData,
        dcrLdgmtIndexData,
        start as string,
        region as string,
      )

    const { summaryLlpContent7, results: rsdnResults } =
      await transLlpData6(
        inRsdnData,
        start as string,
        region as string
      )

    const summary = [
      {
        title: "생활이동",
        data: [
          {
            name: "유입/유출 인구",
            data: summaryMopContent1,
          },
          {
            name: "유입/유출 지역별",
            data: summaryMopContent2,
          },
          {
            name: "유입/유출 평일/휴일별",
            data: summaryMopContent3,
          },
          {
            name: "유입/유출 시간대별",
            data: summaryMopContent4,
          },
          {
            name: "유입/유출 성/연령대별",
            data: summaryMopContent5,
          },
          {
            name: "유입 이동목적/수단별",
            data: summaryMopContent6 + summaryMopContent8,
          },
          {
            name: "유출 이동목적/수단별",
            data: summaryMopContent7 + summaryMopContent9,
          },
        ],
      },
      {
        title: "생활인구",
        data: [
          {
            name: "전년 동월/전월",
            data: summaryContent,
          },
          {
            name: "성/연령대별",
            data: summaryContent1,
          },
          {
            name: "요일/시간대별",
            data: summaryContent2 + summaryContent3,
          },
          {
            name: "생활패턴별",
            data: summaryContent4,
          },
          {
            name: "주민/생활 비교",
            data: summaryContent5,
          },
        ],
      },
      {
        title: "체류인구",
        data: [
          {
            name: "전년 동월/전월",
            data: summaryLlpContent,
          },
          {
            name: "평일/휴일별",
            data: summaryLlpContent1,
          },
          {
            name: "성/연령대별",
            data: summaryLlpContent2,
          },
          {
            name: "주민/체류 비교",
            data: summaryLlpContent3,
          },
          {
            name: "체류일수/시간별",
            data: summaryLlpContent4 + summaryLlpContent5,
          },
          {
            name: "숙박일수별",
            data: summaryLlpContent6,
          },
          {
            name: "유입지역별",
            data: summaryLlpContent7,
          },
        ],
      },
    ];

    const reportResult = {
      regionName: RegionFullName,
      summary,
      mop: [
        ...flowResults,
        ...results,
        ...dayInOutResults,
        ...timeInOutResults,
        ...ageInOutResults,
        ...prpsInOutResults,
        ...(await transMopData6(
          prpsOutTimeData,
          prpsInTimeData,
          start as string,
          region as string
        )),
        ...(await transMopData7(
          prpsInSexData,
          prpsInSexAgeData,
          start as string,
          region as string
        )),
        ...(await transMopData8(
          prpsOutSexData,
          prpsOutSexAgeData,
          start as string,
          region as string
        )),
        ...wayResults,
        ...(await transMopData10(
          wayOutTimeData,
          wayInTimeData,
          start as string,
          region as string
        )),
        ...(await transMopData11(
          WayInSexAgeData,
          WayInSexData,
          start as string,
          region as string
        )),
        ...(await transMopData12(
          WayOutSexAgeData,
          WayOutSexData,
          start as string,
          region as string
        )),
      ],
      alp: [
        ...periodLiveResults,
        ...ageResults,
        ...dayResults,
        ...timeResults,
        ...(await transData4(timedateData, start as string)),
        ...timesetResults,
        ...uniqueResults,
      ],
      llp: [
        ...stayResults,
        ...stayDayResults,
        ...staySexResults,
        ...stayUniqueResults,
        ...stayAvgDayResults,
        ...ldgmtResults,
        ...rsdnResults,
        ...timebypopResults,
      ],
    };

    res.status(200).json(reportResult);
  } catch (error) {
    next(error);
  }
}

export async function setStayData(
  res: Response,
  req: Request,
  next: NextFunction
): Promise<any> {
  const { start, region } = req.query;

  try {
    if (!start) {
      return res.status(400).json({ message: "start are required." });
    } else if (
      typeof start === "string" &&
      start.length !== 6 &&
      start.length !== 8
    ) {
      return res.status(400).json({ message: "start, end are wrong" });
    }

    const StayAvgData = await docuService.getStayAvgDate(
      start as string,
      region as string
    );
    const dcrIndexData = await docuService.getDcrIndex(start as string);
    const transResult = await transLlpData4(
      StayAvgData,
      dcrIndexData,
      start as string,
      region as string
    );

    res.status(200).json(transResult);
  } catch (error) {
    next(error);
  }
}
