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
import {
  findMaxKeyValue,
  findMaxMinForKeys,
  findMaxRegionTime,
  findMaxTimeForKeys,
  findMaxValue,
  findOverallMaxObj,
} from "@/helpers/getMax";
import util from "util";
import { calculateRate } from "./summaryTemplate";
import { formatTimeZone } from "@/helpers/convertTime";

export function barTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;
  const month = Object.keys(data[0]).find((key) => key !== "구분");
  if (!month) return result;
  result +=
    data
      .map(
        (entry: any) =>
          `${entry.구분}${x && x.includes("평일") ? "에" : ""}는 ${entry[
            month
          ].toLocaleString()}명`
      )
      .join(x && x.includes("평일") ? ",\n" : ", ") + " 입니다.";
  return result;
}
export function groupBarTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const regionData = data.find((item: any) => item.구분 === regionName);
  let result = `{${regionName}} \n`;
  if (regionData) {
    return (result +=
      (x && x.includes("평일") ? x : legend)
        .map(
          (key) =>
            `${key}${x && x.includes("평일") ? "에" : ""}는 ${regionData[
              key
            ].toLocaleString()}명`
        )
        .join(x && x.includes("평일") ? ",\n" : ", ") + " 입니다.");
  }

  return result;
}
export function groupLineDowTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}는 {${minMax[key].최대값.구분}}요일`;
    if (index === legend.length - 1) {
      result += `에 가장 많습니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}
export function groupLineDowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const regionData = data.find((item: any) => item.구분 === regionName);
  let result = `{${regionName}} \n`;
  if (regionData) {
    const minMax = findMaxKeyValue(regionData);
    result +=
      `{${minMax.maxKey}요일} {${Math.round(
        minMax.maxValue
      ).toLocaleString()}}명으로 가장 많고,\n ` +
      `{${minMax.minKey}요일} {${Math.round(
        minMax.minValue
      ).toLocaleString()}}명으로 가장 적습니다.`;
  }

  return result;
}
export function stackWeekdaysPtrnTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;

  legend.forEach((key, index) => {
    const comparison = data[0][key] > data[1][key] ? "평일" : "휴일";

    result += `${key}는 ${comparison}`;

    if (index === legend.length - 1) {
      result += `에 많습니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}
export function ptrnDayLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxTimeForKeys(data, legend);
  let result = `{${regionName}} \n`;

  legend.forEach((key, index) => {
    result += `${key}는 {${
      minMax[key].구분.split("/")[0] +
      "월 " +
      minMax[key].구분.split("/")[1] +
      "일"
    }} {${minMax[key].최대값.toLocaleString()}}명`;

    if (index === legend.length - 1) {
      result += `으로 가장 많습니다.`;
    } else {
      result += `,\n`;
    }
  });

  return result;
}
export function ptrnTimeLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxTimeForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    result += `${key}는 {${minMax[key].구분.padStart(2, "0")}}시  {${minMax[
      key
    ].최대값.toLocaleString()}}명`;

    if (index === legend.length - 1) {
      result += `으로 가장 많습니다.`;
    } else {
      result += `,\n`;
    }
  });

  return result;
}
export function ptrnsexAgeTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const ageData = data.filter(
    (item: any) => item["구분"] !== "남성" && item["구분"] !== "여성"
  );
  const ageMax = findMaxTimeForKeys(ageData, legend);

  const mtot = data.find((item: any) => item.구분 === "남성");
  const ftot = data.find((item: any) => item.구분 === "여성");

  let result = `{${regionName}} \n`;
  legend.forEach((key, index) => {
    const sexMax = mtot[key] > ftot[key] ? "남성" : "여성";
    result += `${key}는 ${sexMax}과 {${ageMax[key].구분}}`;
    if (index === legend.length - 1) {
      result += `가 가장 많습니다.`;
    } else {
      result += `,\n`;
    }
  });
  return result;
}

export function comparePeriodTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  //단일지역일경우 구분이 날짜
  //비교지역일경우 구분이 지역명
  if (data[0].구분.includes("년")) {
    legend.forEach((key, index) => {
      if (legend.includes("외국인") || legend.includes("외국인생활인구")) result += `외국인 생활인구 `;
      else {
        result += `내국인 생활인구 `;
      }
      result += `${data[1][key].toLocaleString()}명으로,\n`;
      result += `전년 동월 대비 ${calculateRate(data[1][key], data[0][key])}`;
      if (data.length > 2) {
        result += ` 및 전월 대비 ${calculateRate(data[1][key], data[2][key])}`;
      }
      if (index === legend.length - 1) {
        result += `했습니다.`;
      } else {
        result += `,\n`;
      }
    });
  } else {
    const regionData = data.find((item: any) => item.구분 === regionName);
    const values: any = Object.values(regionData);
    result += `내국인 생활인구 ${values[2].toLocaleString()}명으로,\n`;
    result += `전년 동월 대비 ${calculateRate(values[2], values[1])}`;
    if (values.length > 3) {
      result += ` 및 전월 대비 ${calculateRate(values[2], values[3]).replace(
        "% ",
        "%\n"
      )}했습니다.`;
    } else {
      result += `했습니다.`;
    }
  }
  return result;
}
export function groupLineDayTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key) => {
    result +=
      `{${
        minMax[key].최대값.구분.split("/")[0] +
        "월 " +
        minMax[key].최대값.구분.split("/")[1] +
        "일"
      }} {${Math.round(
        minMax[key].최대값.값
      ).toLocaleString()}}명으로 가장 많고,\n ` +
      `{${
        minMax[key].최소값.구분.split("/")[0] +
        "월 " +
        minMax[key].최소값.구분.split("/")[1] +
        "일"
      }} {${Math.round(
        minMax[key].최소값.값
      ).toLocaleString()}}명으로 가장 적습니다.`;
  });
  return result;
}
export function groupLineDayRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, [regionName]);
  let result = `{${regionName}} \n`;
  result +=
    `{${
      minMax[regionName].최대값.구분.split("/")[0] +
      "월 " +
      minMax[regionName].최대값.구분.split("/")[1] +
      "일"
    }} {${Math.round(
      minMax[regionName].최대값.값
    ).toLocaleString()}}명으로 가장 많고,\n ` +
    `{${
      minMax[regionName].최소값.구분.split("/")[0] +
      "월 " +
      minMax[regionName].최소값.구분.split("/")[1] +
      "일"
    }} {${Math.round(
      minMax[regionName].최소값.값
    ).toLocaleString()}}명으로 가장 적습니다.`;

  return result;
}
export function groupLineTimeTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x?: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  legend.forEach((key) => {
    result += `{${(x?.includes("시간") ? formatTimeZone : formatKorDateTime)(
      minMax[key].최대값.구분
    )}`;
    result += `${x?.includes("요일") ? "요일에" : ""}}`;
    result += ` {${Math.round(
      minMax[key].최대값.값
    ).toLocaleString()}}명으로 가장 많고,\n `;

    result += `{${(x?.includes("시간") ? formatTimeZone : formatKorDateTime)(
      minMax[key].최소값.구분
    )}`;
    result += `${x?.includes("요일") ? "요일에" : ""}}`;
    result += ` {${Math.round(
      minMax[key].최소값.값
    ).toLocaleString()}}명으로 가장 적습니다.`;
  });
  return result;
}
export function groupLineTimeRegionTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const minMax = findMaxMinForKeys(data, [regionName]);
  let result = `{${regionName}} \n`;
  result += `{${(x?.includes("시간") ? formatTimeZone : formatKorDateTime)(
    minMax[regionName].최대값.구분
  )}`;
  result += `${x?.includes("요일") ? "요일에" : ""}}`;
  result += ` {${Math.round(
    minMax[regionName].최대값.값
  ).toLocaleString()}}명으로 가장 많고,\n `;

  result += `{${(x?.includes("시간") ? formatTimeZone : formatKorDateTime)(
    minMax[regionName].최소값.구분
  )}`;
  result += `${x?.includes("요일") ? "요일에" : ""}}`;
  result += ` {${Math.round(
    minMax[regionName].최소값.값
  ).toLocaleString()}}명으로 가장 적습니다.`;

  return result;
}
export function groupTimeznTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  let result = `{${regionName}} \n`;
  if (x.length > 1) {
    const minMax = findMaxTimeForKeys(data, x);
    x.forEach((key, index) => {
      result += `${key}${x.includes("평일") ? "에는" : ""} ${formatTimeZone(
        minMax[key].구분
      )}`;
      if (index === x.length - 1) {
        result += `에 가장 많습니다.`;
      } else {
        result += `,\n`;
      }
    });
  } else {
    const minMax = findOverallMaxObj(data);
    if (minMax) {
      if (x.includes("나이")) result += `최다 연령대는 ${minMax.key}(으)로 `;
      if (x.includes("요일")) result += `최다 요일은 ${minMax.key}요일으로 `;
      if (legend.includes("국가"))
        result += `최다 외국인 생활인구 국가는 {${minMax.key}}(으)로 `;

      result += `{${formatTimeZone(minMax.구분)}}에 가장 많습니다.`;
    }
  }
  return result;
}
export function subzoneTimeTemplate(
  regionName: string,
  data: any,
  legend: string[],
  x: string[]
): string {
  const regionMax = findMaxRegionTime(data);
  return (
    `{${regionName}}\n` +
    `{${regionMax.구분}}에서 {${formatTimeZone(
      regionMax.시간
    )}}에 {${Math.round(
      regionMax.생활인구
    ).toLocaleString()}}명으로 가장 많습니다.`
  );
}
export function inflowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  //평일 값 data.length - 1 에 추가해둠
  result += `평일 최다 유입지역은 ${data[data.length - 1].구분}이며,\n`;
  result += `휴일 최다 유입지역은 ${data[0].구분}입니다.`;
  return result;
}
export function outflowRegionTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  //평일 값 data.length - 1 에 추가해둠
  result += `평일 최다 유출지역은 ${data[data.length - 1].구분}이며,\n`;
  result += `휴일 최다 유출지역은 ${data[0].구분}입니다.`;
  return result;
}
export function ratioTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n외국인 생활인구 비중은 `;
  const key = Object.keys(data[0]).find((k) => k !== "구분");
  const totalSum = data.reduce((sum: number, item: any) => {
    return sum + (key ? item[key] : 0);
  }, 0);
  result += `{${data[0].구분}}(이)가 `;
  result += `{${((data[0][key!] / totalSum) * 100).toFixed(
    1
  )}}%로 가장 많습니다.`;

  return result;
}

function formatKorDateTime(str: string): string {
  const regex = /(\d{2})\/(\d{2}) (\d{2}):(\d{2})/;
  const match = str.match(regex);

  if (!match) return str;

  let [, month, day, hour, minute] = match;
  const intMonth = parseInt(month, 10);
  const intDay = parseInt(day, 10);
  let intHour = parseInt(hour, 10);
  const period = intHour < 12 ? "오전" : "오후";
  if (intHour > 12) {
    intHour -= 12;
  } else if (intHour === 0) {
    intHour = 12;
  }

  return `${intMonth}월 ${intDay}일 ${period} ${intHour}시`;
}
export function residDayLineTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  const minMax = findMaxMinForKeys(data, legend);
  let result = `{${regionName}} \n`;
  //주민등록인구
  result += `주민등록인구는 ${minMax[
    legend[2]
  ].최대값.값.toLocaleString()}명,\n`;
  result += `거주인구는 ${legend[1].slice(5)}에 `;
  result += `{${
    minMax[legend[1]].최대값.구분.split("/")[0] +
    "월 " +
    minMax[legend[1]].최대값.구분.split("/")[1] +
    "일"
  }} {${minMax[legend[1]].최대값.값.toLocaleString()}}명으로 가장 많고,\n`;
  result += `${legend[0].slice(5)}에 `;
  result += `{${
    minMax[legend[0]].최소값.구분.split("/")[0] +
    "월 " +
    minMax[legend[0]].최소값.구분.split("/")[1] +
    "일"
  }} {${minMax[legend[0]].최소값.값.toLocaleString()}}명으로 가장 적습니다.`;

  return result;
}
export function residSubzoneTemplate(
  regionName: string,
  data: any,
  legend: string[]
): string {
  let result = `{${regionName}} \n`;
  let max = data[0];
  let min = data[0];

  for (const region of data) {
    const ratio = region.거주인구 - region.주민등록인구;

    if (ratio > max.거주인구 - max.주민등록인구) {
      max = region;
    }
    if (ratio < min.거주인구 - min.주민등록인구) {
      min = region;
    }
  }
  result +=
    `주민등록인구 대비 거주인구의 차이가 가장 큰 곳은 {${max.구분}}이며,\n` +
    `주민등록인구 대비 거주인구의 차이가 가장 작은 곳은 {${min.구분}}입니다.`;

  return result;
}
