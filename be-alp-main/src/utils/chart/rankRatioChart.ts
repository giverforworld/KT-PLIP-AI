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

import util from "util";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import { chartMapping } from "@/config/chartConfig";

export async function rankRatioChart(
  id: string,
  name: string,
  category: string[],
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedObj,
  options: any
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];
  const result: ChartHandlerData = {
    summary: "",
    charts: [],
  };

  let stats: StatSummaryObj[] = [];

  const isGroup = options.regionArray.length > 1;

  // "체류인구 배수", stayPop,  decreasePop, residPop, residPopAvg,
  // "평균 체류일수", stayDaysAvg,
  // "평균 체류시간", stayTimesAvg
  for (const regionCode of options.regionArray) {
    let regionName = await convertCDtoNM(regionCode);

    const daysRegionData = data.stayDaysAvg.find(
      (item: any) => item.region.toString() === regionCode
    );

    const timesRegionData = data.stayTimesAvg.find(
      (item: any) => item.region.toString() === regionCode
    );

    let indicateData: Array<Record<string, string | number>> = [];

    if (daysRegionData) {
      // 차트 데이터 생성
      const decreasePopValue =
        data.decreasePop.find(
          (item: any) => item.region.toString() === regionCode
        )?.data[0].value ?? 0;
      const stayPopValue =
        data.stayPop.find((item: any) => item.region.toString() === regionCode)
          ?.data[0].value ?? 0;
      const residPopValue =
        data.residPop.find((item: any) => item.region.toString() === regionCode)
          ?.data[0].value ?? 0;
      // const residPopAvgValue =
      //   data.residAvgPop.find((item: any) => item.region.toString() === regionCode)
      //     ?.data[0].value ?? 0;
      const overallAvgData = 
        data.decreaseAvgPop.find((item: any) => item.region === "전체평균")?.data[0].value ?? 0;
      for (const item of daysRegionData.data) {
        let indicateEntry: Record<string, string | number> = {};
        const isDecrease = typeof item.key === "string";

        // console.log("residPopAvgValue : ", residPopAvgValue);
        // console.log("residPopValue : ", residPopValue);
        // console.log("decreasePopValue : ", decreasePopValue);

        const popValue = isDecrease
          ? overallAvgData
          : residPopValue === 0
            ? 0
            : stayPopValue / residPopValue;

        const timesData =
          timesRegionData?.data.find((time) => time.key === item.key)?.value ??
          0;

        let keyStr = item.key;
        if (typeof item.key === "number")
          keyStr = await convertCDtoNM(item.key);
        indicateEntry = {
          구분: keyStr,
          [legend[0]]: popValue,
          [legend[1]]: item.value,
          [legend[2]]: timesData,
        };

        indicateData.push(indicateEntry);
      }

      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicateData,
      });
    }
  }

  return result;
}
