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
import { keyMap } from "@/config/keyMapConfig";
import { searchMapping, searchOPMapping } from "@/config/searchConfig";
import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import { formatTimeZone } from "@/helpers/convertTime";

export const getSearchData = async (
  screenId: string,
  options: Record<string, any>
) => {
  const searchConfig = searchMapping[screenId];
  if (!searchConfig) throw new Error("Invalid screen ID");
  const opHandler = searchOPMapping[screenId];
  if (!opHandler)
    throw new Error(`No handler found for Screen ID "${screenId}"`);

  const searchData = await opHandler.search(options);

  // 결과 매핑
  const searchResult: SearchDataResult = [];
  // searchConfig 기반으로 결과 데이터 매핑
  for (const config of searchConfig) {
    let { title, category, unit, type } = config;

    const mappedData = await Promise.all(
      options.regionArray.map(async (regionCode: string) => {
        const regionData = searchData.find(
          (item: any) => item.region.toString() === regionCode
        );
        let regionName = "";

        //출도착지역인 경우 flow
        if (options.region !== undefined) {
          //출도착지가 전국인 경우
          const isNationWide = options.region === options.regionArray[0];

          const originName = await convertCDtoNM(options.region);
          const flowName = isNationWide
            ? "전국"
            : await convertCDtoFullNM(Number(regionCode));

          regionName = options.isInflow
            ? `${flowName} -> ${originName}`
            : `${originName} -> ${flowName}`;
        } else {
          regionName = await convertCDtoFullNM(Number(regionCode));
        }

        // key-value 데이터에서 category에 해당하는 값을 찾기
        const valueObj = regionData?.data.find(
          (item: any) => item.key === category
        );
        const rawValue = valueObj ? valueObj.value : null;
        const isObj = typeof rawValue === "object";
        if (isObj) {
          const temp: { [key: string]: number | string } = {
            Avg: "",
            Unique: "",
          };
          ["Avg", "Unique"].forEach(async (key) => {
            const result =
              rawValue === null || rawValue[key] === null
                ? "-"
                : category === "region"
                ? regionName
                : await transformValueByCategory(category, rawValue[key]); // 변환된 값
            temp[key] = result;
          });

          return {
            regionName, // 지역 이름
            value: temp, // 매핑된 값
          };
        } else {
          let value =
            category === "region"
              ? regionName
              : rawValue === null
              ? "-"
              : await transformValueByCategory(category, rawValue); // 변환된 값
          return {
            regionName, // 지역 이름
            value: value, // 매핑된 값
          };
        }
      })
    );

    //출도착지역인 경우 isInflow에 따라 title 변경
    if (options.region !== undefined && !options.isInflow) {
      title = title.replace("유입", "유출");
    }
    // searchResult에 추가
    if (title === "유출인구 수") {
      for (let i = 0; i < mappedData.length; i++) {
        if (mappedData[i].value.Avg === "-") {
          const temp = "0"
          mappedData[i].value = temp
        }
      }
    } else if (title === "유입인구 수") {
      for (let i = 0; i < mappedData.length; i++) {
        if (mappedData[i].value.Avg === "-") {
          const temp = "0"
          mappedData[i].value = temp
        }
      }
    } else if (title === "행정구역명") {
      for (let i = 0; i < mappedData.length; i++) {
        const isNone = mappedData[i].value.Avg === "-"
        if (isNone) {
          const temp = mappedData[i].regionName
          mappedData[i].value = temp
        }
      }
    }
    searchResult.push({
      title,
      data: mappedData,
      type: type,
      unit: unit,
    });
  }
  return searchResult;
};

// 데이터 변환 함수
const transformValueByCategory = async (category: string, value: number) => {
  if (category.includes("Pop")) {
    if (typeof value === "string" && value === "-") return value;
    return Number(value.toFixed(0)).toLocaleString() || "-"; // 숫자 형식 변환
  } else if (category.includes("Region")) {
    return await convertCDtoFullNM(Number(value));
  } else if (category.includes("Pur")) {
    return keyMap["purpose"][value];
  } else if (category.includes("Way")) {
    return keyMap["way"][value];
  } else if (category.includes("ageGroup")) {
    return keyMap["ageGroup"][value];
  } else if (category.includes("timezn")) {
    return formatTimeZone(String(value));
  } else {
    return value;
  }
};

function isSearchSummaryDataObj() {

}