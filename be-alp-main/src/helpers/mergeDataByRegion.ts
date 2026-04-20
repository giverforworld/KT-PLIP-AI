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
import { getChangedRegion } from "@/utils/changedRegionCache";
import { couldStartTrivia } from "typescript";
import { execFile } from "child_process";

const unionArray = [ "41110", "41130", "41170", "41190", "41270", "41280", "41460"]
export async function getCompareRegionMap(
  regionArray: string[],
  regionMap: any,
  // {
  //   [key: string]: { codes: string[]; field: string; index: string };
  // },
  start?: string | undefined
) {
  const isMaxSgg = regionMap.hasOwnProperty("adm");
  const changeRegion = await getChangedRegion("sido");
  const addOneYear = (baseYm: string) => {
    const year = parseInt(baseYm.slice(0, 4), 10);
    const month = parseInt(baseYm.slice(4, 6), 10);
    const newYear = year + 1;
    return `${newYear}${month.toString().padStart(2, "0")}`;
  };

  // 지역 코드를 길이에 따라 분류
  regionArray.forEach((region) => {
    const regionCode = Number(region.slice(0, 2));
    const regionInfo = changeRegion.find((info) => info.SIDO === regionCode);

    if (regionInfo && start) {
      const startDate = Number(start.slice(0, 6));

      const baseYm = regionInfo.BASE_YM;
      const baseYmPlusOneYear = Number(addOneYear(baseYm.toString()));

      if (startDate <= baseYmPlusOneYear) {
        const oldRegionCode = regionInfo.OSIDO.toString();
        if (region.length === 2) {
          regionMap.sido.codes.push(oldRegionCode, region);
        } else if (region.length === 5) {
          regionMap.sgg.codes.push(oldRegionCode + region.slice(2, 5), region);
        } else {
          regionMap.adm.codes.push(oldRegionCode + region.slice(2), region);
        }
      } else {
        if (isMaxSgg && regionMap.adm.field.includes("_CD")) {
          if (region.length === 2) regionMap.sido.codes.push(region);
          else regionMap.sgg.codes.push(region);
        } else {
          if (region.length === 2) regionMap.sido.codes.push(region);
          else if (region.length === 5) regionMap.sgg.codes.push(region);
          else regionMap.adm.codes.push(region);
        }
      }
    } else {
      if (region.length === 2) {
        regionMap.sido.codes.push(region);
      } else if (region.length === 5) {
        regionMap.sgg.codes.push(region);
      } else {
        regionMap.adm.codes.push(region);
      } 
    }
  });
  return regionMap;
}
export async function getCompareMopRegionMap(
  region: string,
  regionMap: any,
  start?: string | undefined
) {
  const isMaxSgg = regionMap.hasOwnProperty("adm");
  const changeRegion = await getChangedRegion("sido");
  const addOneYear = (baseYm: string) => {
    const year = parseInt(baseYm.slice(0, 4), 10);
    const month = parseInt(baseYm.slice(4, 6), 10);
    const newYear = year + 1;
    return `${newYear}${month.toString().padStart(2, "0")}`;
  };

  // 지역 코드를 길이에 따라 분류
  const regionCode = Number(region.slice(0, 2));
  const regionInfo = changeRegion.find((info) => info.SIDO === regionCode);

  if (regionInfo && start) {
    const startDate = Number(start.slice(0, 6));

    const baseYm = regionInfo.BASE_YM;
    const baseYmPlusOneYear = Number(addOneYear(baseYm.toString()));

    if (startDate <= baseYmPlusOneYear) {
      const oldRegionCode = regionInfo.OSIDO.toString();
      if (region.length === 2) {
        regionMap.sido.codes.push(oldRegionCode, region);
      } else if (region.length === 5) {
        regionMap.sgg.codes.push(oldRegionCode + region.slice(2, 5), region);
      } else {
        regionMap.adm.codes.push(oldRegionCode + region.slice(2), region);
      }
    } else {
      if (isMaxSgg && regionMap.adm.field.includes("_CD")) {
        if (region.length === 2) regionMap.sido.codes.push(region);
        else regionMap.sgg.codes.push(region);
      } else {
        if (region.length === 2) regionMap.sido.codes.push(region);
        else if (region.length === 5) regionMap.sgg.codes.push(region);
        else regionMap.adm.codes.push(region);
      }
    }
  } else {
    if (region.length === 2) {
      regionMap.sido.codes.push(region);
    } else if (region.length === 5) {
      regionMap.sgg.codes.push(region);
    } else {
      regionMap.adm.codes.push(region);
    } 
  }
  return regionMap;
}

export async function mergeDataByRegion(
  data: any,
  regionArray: string[],
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  for (const region of regionArray) {
    const targetPrefix = region.slice(0, 2);
    const targetSuffix = region.length === 2 ? '' : region.slice(2);
    const mergePrefixes = regionsToMerge[targetPrefix] || [];
    if (mergePrefixes.length !== 0) {
      const referenceItem = data.find((item: any) => item.key.toString() === region);
      if (!referenceItem) continue;
      const mergedItem = structuredClone(referenceItem)
      for (const mergePrefix of mergePrefixes) {
        const toMergeItem = data.find((item: any) =>
          item?.key?.toString().startsWith(mergePrefix) && item.key.toString().endsWith(targetSuffix)
        );

        if (!toMergeItem || processedKeys.has(toMergeItem.key)) continue;
        for (const key in toMergeItem) {
          if (Array.isArray(toMergeItem[key]) && Array.isArray(mergedItem[key])) {
            mergedItem[key] = [...mergedItem[key], ...toMergeItem[key]];
          } else if (
            typeof toMergeItem[key] === "object" &&
            typeof mergedItem[key] === "object"
          ) {
            mergedItem[key] = mergeObjects(mergedItem[key], toMergeItem[key]);
          } else if (!(key in mergedItem)) {
            mergedItem[key] = toMergeItem[key];
          }
          
          if (mergedItem[key].buckets !== undefined) {
            mergedItem[key].buckets.sort(
              (a: any, b: any) => a.key_as_string - b.key_as_string
            );

          }
        }

        processedKeys.add(toMergeItem.key);
      }
      result.push(mergedItem);
      processedKeys.add(referenceItem.key);
    } else {
      const notMergedItem = data.find(
        (item: any) => item.key.toString() === region
      );
      result.push(notMergedItem);
    }
  }
  return result;
}

export async function mergeRawData(
  data: any,
  regionArray: string[]
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  for (const region of regionArray) {
    const targetPrefix = region.substring(0, 2);
    const targetSuffix = region.substring(2) ?? 0;
    const mergePrefixes = regionsToMerge[targetPrefix] || [];

    if (mergePrefixes.length !== 0) {
      const referenceItem = data.find((item: any) =>
        Object.entries(item).some(([key, value]) =>
          key.startsWith(targetPrefix) && key.endsWith(targetSuffix) && key === region
        )
      );

      if (!referenceItem) continue;
      const mergedItem = structuredClone(referenceItem)
      for (const mergePrefix of mergePrefixes) {
        const toMergeItem = data.find((item: any) =>
          Object.entries(item).some(([key, value]) => 
            key.startsWith(mergePrefix.toString()) && key.endsWith(targetSuffix) && key === region
          )
        );

        if (!toMergeItem || processedKeys.has(toMergeItem.key)) continue;
        for (const key in toMergeItem) {
          const merge = Object.keys(mergedItem)[0]
          
          
          if (merge && mergedItem[merge]?.by_lastYear?.total) {
            mergedItem[merge].by_lastYear.total.value += toMergeItem[key].by_lastYear.total.value
            // mergedItem[merge].key = parseInt(merge)
          } 
        }

        processedKeys.add(toMergeItem.key);
      }
      result.push(mergedItem);
      // const updatedResult = result.map((obj: any) => {
      //   const key = Object.keys(obj)[0];
      //   return {
      //     ...obj[key],
      //     key: parseInt(key),
      //   }
      // })
      result.forEach((obj: any, index: any) => {
        const key = Object.keys(obj)[0];
        obj[key].key = parseInt(key);
      });
      processedKeys.add(referenceItem.key);
    } else {
      const notMergedItem = data.find((item: any) => 
        Object.entries(item).some(([key, value]) =>
          key.toString() === region
        )
      );
      result.push(notMergedItem);
    }
  }
  return result;
}

export async function mergeDataByRanking(
  data: any,
  regionArray: string[]
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  result.push(data)
  const lastYValue = new Map<number, number>();
  
  for (const item of data) {
    const regionKey = item.key.toString();
    const targetPrefix = regionKey.substring(0, 2);
    const mergePrefixes = regionsToMerge[targetPrefix] || [];

    if (mergePrefixes.length === 0) {
      const targetPreKey = regionKey.substring(0, 2);
      const targetSufKey = regionKey.substring(2) ?? 0;
      const buckets = item.popul_by_year.buckets || [];

      for (const item of buckets) {
        if (item.key === "lastYear") {
          const value = item.popul_sum.value
          lastYValue.set(targetSufKey, value)
        }
      }
    }
  }

  for (const item of data) {
    const regionKey = item.key.toString();
    const targetPrefix = regionKey.substring(0, 2);
    const mergePrefixes = regionsToMerge[targetPrefix] || [];

    if (mergePrefixes.length !== 0) {
      const mergeKey = item.key.toString();
      const mergePreKey = mergeKey.substring(0,2);
      const mergeSufKey = mergeKey.substring(2) ?? 0;
      const mergeBucket = item.popul_by_year.buckets || [];
  
      for (const key of lastYValue.keys()) {
        if (key === mergeSufKey) {
          for (const item of mergeBucket) {
            if (item.key === "lastYear") {
              item.popul_sum.value += lastYValue.get(key);
            }
          }
        }
      }
    }
  }
  return result;
}

export async function mergeDataByFlowRegion(
  data: any,
  regionArray: string[],
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  for (const region of regionArray) {
    const targetPrefix = region.substring(0, 2);
    const targetSuffix = region.substring(2) ?? 0;
    const mergePrefixes = regionsToMerge[targetPrefix] || [];
    const referenceItem = isAll
      // ? data.filter((item: any) => item.key.toString().startsWith(targetPrefix))
      ? data.filter((item: any) => item.key.toString().startsWith(targetPrefix) && (item.key.toString().endsWith(targetSuffix)))
      : data.filter((item: any) => item.key.toString());
    if (!referenceItem) continue;
    const mergedItem = structuredClone(referenceItem)
    for (const mergePrefix of mergePrefixes) {
      const toMergeItem = isAll
        ? data.filter((item: any) =>
            // item?.key?.toString().startsWith(targetPrefix) && (item.key.toString().endsWith(targetSuffix))
            item?.key?.toString().startsWith(mergePrefix) && (item.key.toString().endsWith(targetSuffix))
            // item?.key?.toString().startsWith(mergePrefix)
          )
        : data.filter((item: any) => item?.key?.toString());

      if (!isAll && (!toMergeItem || processedKeys.has(toMergeItem.key)))
        continue;
      for (const key in toMergeItem) {
        if (Array.isArray(toMergeItem[key]) && Array.isArray(mergedItem[key])) {
          mergedItem[key] = [...mergedItem[key], ...toMergeItem[key]];
        } else if (
          typeof toMergeItem[key] === "object" &&
          typeof mergedItem[key] === "object"
        ) {
          if (toMergeItem[key].by_lastYear) {
            mergedItem[key].by_lastYear.doc_count += toMergeItem[key].by_lastYear.doc_count;
            mergedItem[key].by_lastYear.pop_by_lastYear.value += toMergeItem[key].by_lastYear.pop_by_lastYear.value;
          }
          if (toMergeItem[key].by_prevMonth) {
            mergedItem[key].by_prevMonth.doc_count += toMergeItem[key].by_prevMonth.doc_count;
            mergedItem[key].by_prevMonth.pop_by_prevMonth.value += toMergeItem[key].by_prevMonth.pop_by_prevMonth.value;
          }
          // if (!mergedItem[key].by_prevMonth.pop_by_prevMonth.value) {
          //   mergedItem[key].by_prevMonth.pop_by_prevMonth.value += toMergeItem[key].by_prevMonth.pop_by_prevMonth.value;
          // }
        } else if (!(key in mergedItem)) {
          mergedItem[key] = toMergeItem[key];
        }
        mergedItem[key].buckets !== undefined
          ? mergedItem[key].buckets.sort(
              (a: any, b: any) => a.key_as_string - b.key_as_string
            )
          : mergedItem[key].buckets;
      }

      processedKeys.add(toMergeItem.key);
    }

    result = mergedItem;
    processedKeys.add(referenceItem.key);
  }

  return result;
}
// 생활이동 통합시군구
export async function mergeDataByMopFlowRegion(
  data: any,
  region: string,
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  const targetPrefix = region.substring(0, 2);
  const mergePrefixes = regionsToMerge[targetPrefix] || [];
  // if (mergePrefixes.length !== 0 && !data[0].current_year && !data[0].by_lastYear) {
  if (mergePrefixes.length !== 0) {
    const referenceItem = data.find((item: any) =>
      // item.key.toString().startsWith(targetPrefix)
      item.key.toString() === region
    );
    if (!referenceItem) {
      return;
    }
    const mergedItem = structuredClone(referenceItem)
    for (const mergePrefix of mergePrefixes) {
      const toMergeItem = data.find((item: any) =>
        item?.key?.toString().startsWith(mergePrefix) && item.key === region
      );
      if (!toMergeItem || processedKeys.has(toMergeItem.key)) continue;
      for (const key in toMergeItem) {
        if (Array.isArray(toMergeItem[key]) && Array.isArray(mergedItem[key])) {
          mergedItem[key] = [...mergedItem[key], ...toMergeItem[key]];
        } else if (
          typeof toMergeItem[key] === "object" &&
          typeof mergedItem[key] === "object"
        ) {
          mergedItem[key] = mergeObjects(mergedItem[key], toMergeItem[key]);
        } else if (!(key in mergedItem)) {
          mergedItem[key] = toMergeItem[key];
        }
        mergedItem[key].buckets !== undefined
          ? mergedItem[key].buckets.sort(
              (a: any, b: any) => a.key_as_string - b.key_as_string
            )
          : mergedItem[key].buckets;
      }
      processedKeys.add(toMergeItem.key);
    }
    result.push(mergedItem);
    processedKeys.add(referenceItem.key);
  } else {
    if (data.find((item: any) => item.key) && data.find((item: any) => item.key.toString() === region)) {
      const notMergedItem = data.find(
        (item: any) => item.key.toString() === region
      );
      result.push(notMergedItem);
    } else {
      let mergedUnion = await mergeUnionMop(data, region);

      result.push(mergedUnion);
    }
  }
  return result;
}

function mergeObjects(obj1: any, obj2: any) {
  let existingKeys: any = [];
  const result = { ...obj1 };
  for (const key in obj2) {
    if (
      key === "buckets" &&
      Array.isArray(obj2[key]) &&
      Array.isArray(obj1[key])
    ) {
      existingKeys = new Set(obj1[key].map((bucket: any) => bucket.key));
      const newBuckets = obj2[key].filter((bucket: any) => {
        const value = Object.values(bucket).find(
          (item) => typeof item === "object" && item !== null && "value" in item
        )?.value;

        return (
          !existingKeys.has(bucket.key) ||
          (existingKeys.has(bucket.key) && value !== 0)
        );
      });

      result[key] = [...obj1[key], ...newBuckets];
    } else if (typeof obj2[key] === "object" && !Array.isArray(obj2[key])) {
      if (obj2[key].value !== undefined) {
        result[key] = obj2[key].value === 0 ? obj1[key] : obj2[key];
      } else {
        result[key] = mergeObjects(obj1[key] || {}, obj2[key]);
      }
    } else {
      // result[key] = { ...obj1[key], ...obj2[key] };
      result[key] = obj2[key];
    }
  }

  return result;
}

export async function getCompareDashRegionMap(
  region: string,
  regionMap: any,
  start?: string | undefined
) {
  const isMaxSgg = regionMap.hasOwnProperty("adm");
  const isLLP = regionMap.sgg.index.includes("stay")
  const changeRegion = await getChangedRegion("sido");
  const addOneYear = (baseYm: string) => {
    const year = parseInt(baseYm.slice(0, 4), 10);
    const month = parseInt(baseYm.slice(4, 6), 10);
    const newYear = year + 1;
    return `${newYear}${month.toString().padStart(2, "0")}`;
  };

  // 지역 코드를 길이에 따라 분류
  const regionCode = Number(region.slice(0, 2));
  const regionInfo = changeRegion.find((info) => info.SIDO === regionCode);
  if (regionInfo && typeof start === "string" && start) {
    const startDate = Number(start.slice(0, 6));
    const baseYm = regionInfo.BASE_YM;
    const baseYmPlusOneYear = Number(addOneYear(baseYm.toString()));
    if (startDate <= baseYmPlusOneYear) {
      const oldRegionCode = regionInfo.OSIDO.toString();
      if (region.length === 2) {
        regionMap.sido.codes.push(oldRegionCode, region);
      } else if (region.length === 5) {
        regionMap.sgg.codes.push(oldRegionCode + region.slice(2, 5), region);
      } else {
        regionMap.adm.codes.push(oldRegionCode + region.slice(2), region);
      }
    } else {
      if (isMaxSgg && isLLP) {
        if (region.length === 2) regionMap.sido.codes.push(region);
        else regionMap.sgg.codes.push(region);
      } else {
        if (region.length === 2) regionMap.sido.codes.push(region);
        else if (region.length === 5) regionMap.sgg.codes.push(region);
        else regionMap.adm.codes.push(region);
      }
    }
  } else {
    if (region.length === 2) regionMap.sido.codes.push(region);
    else if (region.length === 5) regionMap.sgg.codes.push(region);
    else regionMap.adm.codes.push(region);
  }
  return regionMap;
}

export async function addUnionRegionMap(
  region: string,
  regionMap: any
) {
  
  if (regionMap.sgg.field.includes("PDEPAR_SGG_CD") || regionMap.sgg.field.includes("DETINA_SGG_CD") || regionMap.sgg.field.includes("LDGMT") || regionMap.sgg.field.includes("LLPP") || regionMap.sgg.field.includes("MOPP")) {
    switch (region) {
      case "41110":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41111", "41113", "41115", "41117")
        break;
      case "41130":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41131", "41133", "41135")
        break;
      case "41170":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41171", "41173")
        break;
      case "41190":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41192", "41194", "41196")
        break;
      case "41270":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41271", "41273")
        break;
      case "41280":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41281", "41285", "41287")
        break;
      case "41460":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41461", "41463", "41465")
        break;
      default:
        regionMap.sgg.codes.push(region)
    }
  } else {
    regionMap.adm.codes.push(region)
  }
  return regionMap
}

export async function addUnionRegionsDash(
  region: string,
  regionMap: any
) {
  
  if (regionMap.sgg.field.includes("PDEPAR_SGG_CD") || regionMap.sgg.field.includes("DETINA_SGG_CD") || regionMap.sgg.field.includes("LDGMT")) {
    switch (region) {
      case "41110":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41111", "41113", "41115", "41117")
        break;
      case "41130":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41131", "41133", "41135")
        break;
      case "41170":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41171", "41173")
        break;
      case "41190":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41192", "41194", "41196")
        break;
      case "41270":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41271", "41273")
        break;
      case "41280":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41281", "41285", "41287")
        break;
      case "41460":
        regionMap.sgg.codes = []
        regionMap.sgg.codes.push("41461", "41463", "41465")
        break;
      default:
        regionMap.sgg.codes.push(region)
    }
  } else {
    regionMap.sido.codes.push(region)
  }
  return regionMap
}

export async function addUnionRegionsMap(
  regionArray: string[],
  regionMap: any,
  category?: string
) {
  regionArray.forEach((region) => {
    const regionCode = region

    if (category === "alp_forn" || category === "forn") {
      switch (regionCode) {
        case "41110":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41110")
          regionMap.sgg.codes.push("41111", "41113", "41115", "41117")
          break;
        case "41130":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41130")
          regionMap.sgg.codes.push("41131", "41133", "41135")
          break;
        case "41170":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41170")
          regionMap.sgg.codes.push("41171", "41173")
          break;
        case "41190":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41190")
          regionMap.sgg.codes.push("41192", "41194", "41196")
          break;
        case "41270":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41270")
          regionMap.sgg.codes.push("41271", "41273")
          break;
        case "41280":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41280")
          regionMap.sgg.codes.push("41281", "41285", "41287")
          break;
        case "41460":
          regionMap.sgg.codes = regionMap.sgg.codes.filter((code: string) => code !== "41460")
          regionMap.sgg.codes.push("41461", "41463", "41465")
          break;
        default:
          regionMap.sgg.codes.push(regionCode)
      }
    } else {
      if (regionArray.length === 2) {
        regionMap.sido.codes.push(regionCode)
      } else if (regionArray.length === 5) {
        regionMap.sgg.codes.push(regionCode)
      } else {
        regionMap.adm.codes.push(regionCode)
      }
    }
  });
  return regionMap
}

export async function mergeDataByDashRegion(
  data: any,
  region: string,
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  const targetPrefix = region.substring(0, 2);
  const mergePrefixes = regionsToMerge[targetPrefix] || [];
  if (mergePrefixes.length !== 0) {
    const referenceItem = data.find((item: any) =>
      item.key.toString().startsWith(targetPrefix)
    );
    if (!referenceItem) {
      return;
    }
    const mergedItem = structuredClone(referenceItem)
    for (const mergePrefix of mergePrefixes) {
      const toMergeItem = data.find((item: any) =>
        item?.key?.toString().startsWith(mergePrefix)
      );
      if (!toMergeItem || processedKeys.has(toMergeItem.key)) continue;
      for (const key in toMergeItem) {
        if (Array.isArray(toMergeItem[key]) && Array.isArray(mergedItem[key])) {
          mergedItem[key] = [...mergedItem[key], ...toMergeItem[key]];
        } else if (
          typeof toMergeItem[key] === "object" &&
          typeof mergedItem[key] === "object"
        ) {
          mergedItem[key] = mergeObjects(mergedItem[key], toMergeItem[key]);
        } else if (!(key in mergedItem)) {
          mergedItem[key] = toMergeItem[key];
        }
        mergedItem[key].buckets !== undefined
          ? mergedItem[key].buckets.sort(
              (a: any, b: any) => a.key_as_string - b.key_as_string
            )
          : mergedItem[key].buckets;
      }
      processedKeys.add(toMergeItem.key);
    }
    result.push(mergedItem);
    processedKeys.add(referenceItem.key);
  } else {
    if (data.find((item: any) => item.key.toString() === region)) {
      const notMergedItem = data.find(
        (item: any) => item.key.toString() === region
      );
      result.push(notMergedItem);
    } else {
      const mergeData = await mergeUnion(data, region)
      result.push(mergeData)
    }
  }
  return result;
}
export async function mergeDataByLlpRegion(
  data: any,
  region: string,
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  let result: any = [];
  const processedKeys = new Set();

  const targetPrefix = region.substring(0, 2);
  const mergePrefixes = regionsToMerge[targetPrefix] || [];
  if (mergePrefixes.length !== 0 && !data[0].current_year && !data[0].by_lastYear) {
    const referenceItem = data.find((item: any) =>
      item.key.toString().startsWith(targetPrefix)
    );
    if (!referenceItem) {
      return;
    }
    const mergedItem = structuredClone(referenceItem)
    for (const mergePrefix of mergePrefixes) {
      const toMergeItem = data.find((item: any) =>
        item?.key?.toString().startsWith(mergePrefix)
      );
      if (!toMergeItem || processedKeys.has(toMergeItem.key)) continue;
      for (const key in toMergeItem) {
        if (Array.isArray(toMergeItem[key]) && Array.isArray(mergedItem[key])) {
          mergedItem[key] = [...mergedItem[key], ...toMergeItem[key]];
        } else if (
          typeof toMergeItem[key] === "object" &&
          typeof mergedItem[key] === "object"
        ) {
          mergedItem[key] = mergeObjects(mergedItem[key], toMergeItem[key]);
        } else if (!(key in mergedItem)) {
          mergedItem[key] = toMergeItem[key];
        }
        mergedItem[key].buckets !== undefined
          ? mergedItem[key].buckets.sort(
              (a: any, b: any) => a.key_as_string - b.key_as_string
            )
          : mergedItem[key].buckets;
      }
      processedKeys.add(toMergeItem.key);
    }
    result.push(mergedItem);
    processedKeys.add(referenceItem.key);
  } else {
    if (data.find((item: any) => item.key) && data.find((item: any) => item.key.toString() === region)) {
      const notMergedItem = data.find(
        (item: any) => item.key.toString() === region
      );
      result.push(notMergedItem);
    } else {
      let mergedUnion = await mergeUnionLlp(data, region);

      result.push(mergedUnion);
    }
  }
  return result;
}
export async function compareDataByRegion(
  data: any,
  regionArray: string[],
  isAll?: boolean
) {
  const changeRegion = await getChangedRegion("sido");

  const regionsToMerge: { [key: string]: number[] } = {};
  changeRegion.forEach((region) => {
    const { SIDO, OSIDO } = region;

    if (!regionsToMerge[SIDO.toString()]) {
      regionsToMerge[SIDO.toString()] = [];
    }
    regionsToMerge[SIDO.toString()].push(OSIDO);
  });

  return data.map((item: any) => {
    const keyStr = item.key.toString();
    for (const [newPrefix, prefixes] of Object.entries(regionsToMerge)) {
      if (prefixes.some((prefix) => keyStr.startsWith(prefix.toString()))) {
        return {
          ...item,
          key: Number(
            `${newPrefix}${keyStr.slice(prefixes[0].toString().length)}`
          ),
        };
      }
    }
    return item;
  });
}

export async function mergeUnionMop(
  data: any,
  region: string
) {
  let result: any = [];
  // console.log('mergeUnionMop', data);
  
  const checkMaxFlow = data.find((item:any) => item.max_flow_region && item.flow_pop && item.max_flow_prps);
  const checkLastAndStartAndMonth = data.find((item:any) => item.by_lastYear && item.by_start && item.by_prevMonth);
  const checkLastAndStart = data.find((item:any) => item.by_lastYear && item.by_start);
  const checkCD = data.find((item:any) => item.max_flow_prps && item.max_flow_time && item.total);
  const checkMaxFlowTime = data.find((item:any) => item.max_flow_time);
  const checkCurrentSitu = data.find((item:any) => item.by_flow && item.by_purpose && item.by_day && item.by_weekdays && item.by_dow);
  const checkMoveCd = data.find((item:any) => item.by_flow && item.by_move && item.by_dow && item.by_day && item.by_weekdays);
  const checkByWay = data.find((item:any) => item.by_way);
  const checkByTimeMOV7 = data.find((item:any) => item.by_time && item.by_time.buckets[0].MOV7);
  const checkByTimeMOV = data.find((item:any) => item.by_time && item.by_time.buckets[0].MOV0);
  const checkByTime = data.find((item:any) => item.by_time);
  const checkPopByFlow = data.find((item:any) => item.pop_by_flow);
  const checkbyRegion = data.find((item:any) => item.by_purpose && item.by_day && item.by_weekdays && item.by_dow && item.f50);
  const checkMaxFlowWay = data.find((item:any) => item.max_flow_way);

  
  if (checkMaxFlow) {
    const flowPop = data.reduce((sum: number, item: any) => (sum + item.flow_pop.value), 0);
    const mergedObject :any = {
      max_flow_region: {buckets: {max_region_pop: { value: 0}}},
      max_flow_prps: {buckets: {max_prps_pop: { value: 0}}},
    };
    
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.max_flow_region.buckets.forEach((bucket:any) => {
        const { key, max_region_pop } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, max_region_pop: {value: 0}}
        }
        mergedBuckets[key].max_region_pop.value += max_region_pop.value;
      });
    })
    mergedObject.max_flow_region.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.max_flow_prps.buckets.forEach((bucket:any) => {
        const { key, max_prps_pop } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, max_prps_pop: {value: 0}}
        }
        mergedBuckets[key].max_prps_pop.value += max_prps_pop.value;
      });
    })
    mergedObject.max_flow_prps.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      flow_pop: { value: flowPop },
      ...mergedObject
    })
  }
  else if (checkLastAndStartAndMonth) {
    const prevM_value = data.reduce((sum: number, item: any) => sum + item.by_prevMonth.pop_by_prevMonth.value, 0);
    const prevY_value = data.reduce((sum: number, item: any) => sum + item.by_lastYear.pop_by_lastYear.value, 0);
    const present_value = data.reduce((sum: number, item: any) => sum + item.by_start.pop_by_start.value, 0);
    result.push({
      key: parseInt(region),
      by_prevMonth: { pop_by_prevMonth: { value: prevM_value }},
      by_lastYear: { pop_by_lastYear: { value: prevY_value }},
      by_start: { pop_by_start: { value: present_value }},
    })

  }
  else if (checkLastAndStart) {
    const prevY_value = data.reduce((sum: number, item: any) => sum + item.by_lastYear.pop_by_lastYear.value, 0);
    const present_value = data.reduce((sum: number, item: any) => sum + item.by_start.pop_by_start.value, 0);
    result.push({
      key: parseInt(region),
      by_lastYear: { pop_by_lastYear: { value: prevY_value }},
      by_start: { pop_by_start: { value: present_value }},
    })
  }
  else if (checkCD) {
    const mergedObject :any = {
      max_flow_prps: {buckets: {max_prps_pop: { value: 0}}},
    };
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.max_flow_prps.buckets.forEach((bucket:any) => {
        const { key, max_prps_pop } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, max_prps_pop: {value: 0}}
        }
        mergedBuckets[key].max_prps_pop.value += max_prps_pop.value;
      });
    })
    mergedObject.max_flow_prps.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...ageReduceValue(data),
      ...mergedObject
    })
  }
  else if (checkMaxFlowTime) {
    const mergedObject :any = {
      max_flow_time: {buckets: {time_pop: { value: 0 }}},
    };
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.max_flow_time.buckets.forEach((bucket:any) => {
        const { key, time_pop } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, time_pop: {value: 0}}
        }
        mergedBuckets[key].time_pop.value += time_pop.value;
      });
    })
    mergedObject.max_flow_time.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkCurrentSitu) {
    const mergedObject :any = {
      by_flow: {buckets: {pop_by_flow: { value: 0 }}},
      by_purpose: {buckets: { pop_by_purpose: { value: 0 }}},
      by_day: {buckets: { pop_by_day: { value: 0 }}},
      by_weekdays: {buckets: {weekday: {pop_by_weekdays: {value:0}}, weekend: {pop_by_weekdays: {value:0}}}},
      by_dow: {buckets: {pop_by_dow: { value:0 }}}
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_flow.buckets.forEach((bucket:any) => {
        const { key, pop_by_flow } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, pop_by_flow: { value: 0 } };
        }
          mergedBuckets[key].pop_by_flow.value += pop_by_flow.value;
      });
    });
    mergedObject.by_flow.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_purpose.buckets.forEach((bucket:any) => {
        const { key, pop_by_purpose } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_purpose: {value: 0}}
        }
        mergedBuckets[key].pop_by_purpose.value += pop_by_purpose.value;
      });
    })
    mergedObject.by_purpose.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_day.buckets.forEach((bucket:any) => {
        const { key_as_string, pop_by_day } = bucket;
        if (!mergedBuckets[key_as_string]) {
          mergedBuckets[key_as_string] = {key_as_string, pop_by_day: {value: 0}}
        }
        mergedBuckets[key_as_string].pop_by_day.value += pop_by_day.value;
      });
    })
    mergedObject.by_day.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      mergedObject.by_weekdays.buckets.weekday.pop_by_weekdays.value +=
        item.by_weekdays.buckets.weekday.pop_by_weekdays.value;
      mergedObject.by_weekdays.buckets.weekend.pop_by_weekdays.value +=
        item.by_weekdays.buckets.weekend.pop_by_weekdays.value;
    });
    
    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_dow.buckets.forEach((bucket:any) => {
        const { key, pop_by_dow } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_dow: {value: 0}}
        }
        mergedBuckets[key].pop_by_dow.value += pop_by_dow.value;
      });
    })
    mergedObject.by_dow.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...ageReduceValue(data),
      ...mergedObject
    })
  }
  else if (checkMoveCd) {
    const mergedObject :any = {
      by_flow: {buckets: {pop_by_flow: { value: 0 }}},
      by_move: {buckets: {}},
      by_day: {buckets: { pop_by_day: { value: 0 }}},
      by_weekdays: {buckets: {weekday: {by_move: {buckets: {pop_by_move: {value:0}}}}, weekend: {by_move: {buckets: {pop_by_move: {value:0}} }}}},
      by_dow: {buckets: {pop_by_dow: { value:0 }}}
    };
    let mergedBuckets:any = {};
    let mergedMoveBuckets:any = {};
    data.forEach((item:any) => {
      item.by_flow.buckets.forEach((bucket:any) => {
        const { key, pop_by_flow, by_move } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, pop_by_flow: { value: 0 }, by_move: {buckets: []} };
        }
        mergedBuckets[key].pop_by_flow.value += pop_by_flow.value;
        
        by_move.buckets.forEach((moveBucket:any) => {
          const { key: k, pop_by_move } = moveBucket;
          if (!mergedMoveBuckets[k]) {
            mergedMoveBuckets[k] = { key:k, pop_by_move: { value: 0 } };
          }
          mergedMoveBuckets[k].pop_by_move.value += pop_by_move.value;
        })
        mergedBuckets[key].by_move.buckets.push(...Object.values(mergedMoveBuckets));
        mergedMoveBuckets = {};
      });
    });
    mergedObject.by_flow.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_move.buckets.forEach((bucket:any) => {
        const { key, f10, f15, f20, f25, f30, f35, f40, f45, f50, f55, f60, f65, f70, f75, f80, total_female,
          m10, m15, m20, m25, m30, m35, m40, m45, m50, m55, m60, m65, m70, m75, m80, total_male, total } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, f10: {value:0}, f15: {value:0}, f20: {value:0}, f25: {value:0}, f30: {value:0},
           f35: {value:0}, f40: {value:0}, f45: {value:0}, f50: {value:0}, f55: {value:0}, f60: {value:0}, 
           f65: {value:0}, f70: {value:0}, f75: {value:0}, f80: {value:0}, total_female: {value:0}, m10: {value:0}, 
           m15: {value:0}, m20: {value:0}, m25: {value:0}, m30: {value:0}, m35: {value:0}, m40: {value:0}, 
           m45: {value:0}, m50: {value:0}, m55: {value:0}, m60: {value:0}, m65: {value:0}, m70: {value:0}, 
           m75: {value:0}, m80: {value:0}, total_male: {value:0}, total: {value:0}}
        }
        mergedBuckets[key].m10.value += f10.value;
        mergedBuckets[key].f15.value += f15.value;
        mergedBuckets[key].f20.value += f20.value;
        mergedBuckets[key].f25.value += f25.value;
        mergedBuckets[key].f30.value += f30.value;
        mergedBuckets[key].f35.value += f35.value;
        mergedBuckets[key].f40.value += f40.value;
        mergedBuckets[key].f45.value += f45.value;
        mergedBuckets[key].f50.value += f50.value;
        mergedBuckets[key].f55.value += f55.value;
        mergedBuckets[key].f60.value += f60.value;
        mergedBuckets[key].f65.value += f65.value;
        mergedBuckets[key].f70.value += f70.value;
        mergedBuckets[key].f75.value += f75.value;
        mergedBuckets[key].f80.value += f80.value;
        mergedBuckets[key].m10.value += m10.value;
        mergedBuckets[key].m15.value += m15.value;
        mergedBuckets[key].m20.value += m20.value;
        mergedBuckets[key].m25.value += m25.value;
        mergedBuckets[key].m30.value += m30.value;
        mergedBuckets[key].m35.value += m35.value;
        mergedBuckets[key].m40.value += m40.value;
        mergedBuckets[key].m45.value += m45.value;
        mergedBuckets[key].m50.value += m50.value;
        mergedBuckets[key].m55.value += m55.value;
        mergedBuckets[key].m60.value += m60.value;
        mergedBuckets[key].m65.value += m65.value;
        mergedBuckets[key].m70.value += m70.value;
        mergedBuckets[key].m75.value += m75.value;
        mergedBuckets[key].m80.value += m80.value;
        mergedBuckets[key].total.value += total.value;
        mergedBuckets[key].total_male.value += total_male.value;
        mergedBuckets[key].total_female.value += total_female.value;
      });
    })
    mergedObject.by_move.buckets = Object.values(mergedBuckets);
    
    mergedBuckets = {};
    mergedMoveBuckets = {};
    data.forEach((item:any) => {
      item.by_day.buckets.forEach((bucket:any) => {
        const { key_as_string, by_move } = bucket;
        if (!mergedBuckets[key_as_string]) {
          mergedBuckets[key_as_string] = {key_as_string, by_move: {buckets: []}}
        }
        by_move.buckets.forEach((dayBucket:any) => {
          const { key:k, pop_by_move } = dayBucket;
          if (!mergedMoveBuckets[k]) {
            mergedMoveBuckets[k] = { key:k, pop_by_move: { value: 0 } };
          }
          mergedMoveBuckets[k].pop_by_move.value += pop_by_move.value;
        })
        mergedBuckets[key_as_string].by_move.buckets.push(...Object.values(mergedMoveBuckets));
        mergedMoveBuckets = {};
      });
    })
    mergedObject.by_day.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    let mergedBuckets2: any = {};
    data.forEach((item:any) => {
      item.by_weekdays.buckets.weekday.by_move.buckets.forEach((bucket:any) => {
        const { key, pop_by_move } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_move: {value: 0}}
        }
        mergedBuckets[key].pop_by_move.value += pop_by_move.value;
      })
      item.by_weekdays.buckets.weekend.by_move.buckets.forEach((bucket:any) => {
        const { key, pop_by_move } = bucket;
        if (!mergedBuckets2[key]) {
          mergedBuckets2[key] = {key, pop_by_move: {value: 0}}
        }
        mergedBuckets2[key].pop_by_move.value += pop_by_move.value;
      })
    });
    mergedObject.by_weekdays.buckets.weekday.by_move.buckets = Object.values(mergedBuckets);
    mergedObject.by_weekdays.buckets.weekend.by_move.buckets = Object.values(mergedBuckets2);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_dow.buckets.forEach((bucket:any) => {
        const { key, by_move } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, by_move}
        }
        by_move.buckets.forEach((moveBucket:any) => {
          const { key: k, pop_by_move } = moveBucket;
          if (!mergedBuckets[key].by_move.buckets[k]) {
            mergedBuckets[key].by_move.buckets[k] = {key, pop_by_move: {value: 0}}
          }
          mergedBuckets[key].by_move.buckets[k].pop_by_move.value += pop_by_move.value;
        })
      });
    })
    mergedObject.by_dow.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkByWay) {
    const mergedObject :any = {
      by_way: {buckets: {pop_by_way: { value: 0 }}},
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_way.buckets.forEach((bucket:any) => {
        const { key, pop_by_way } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, pop_by_way: { value: 0 } };
        }
          mergedBuckets[key].pop_by_way.value += pop_by_way.value;
      });
    });
    mergedObject.by_way.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkByTimeMOV7) {
    const mergedObject :any = {
      by_time: {buckets: {total: { value: 0 }}},
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_time.buckets.forEach((bucket:any) => {
        const { key, total, MOV0, MOV1, MOV2, MOV3, MOV4, MOV5, MOV6, MOV7 } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, total: {value: 0}, MOV0: {value: 0}, MOV1: {value:0}, MOV2: {value:0}, 
              MOV3: {value:0}, MOV4: {value:0}, MOV5: {value:0}, MOV6: {value:0}, MOV7: {value:0} };
        }
        mergedBuckets[key].total.value += total.value;
        mergedBuckets[key].MOV0.value += MOV0.value;
        mergedBuckets[key].MOV1.value += MOV1.value;
        mergedBuckets[key].MOV2.value += MOV2.value;
        mergedBuckets[key].MOV3.value += MOV3.value;
        mergedBuckets[key].MOV4.value += MOV4.value;
        mergedBuckets[key].MOV5.value += MOV5.value;
        mergedBuckets[key].MOV6.value += MOV6.value;
        mergedBuckets[key].MOV7.value += MOV7.value;
      });
    });
    mergedObject.by_time.buckets = Object.values(mergedBuckets);
    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkByTimeMOV) {
    const mergedObject :any = {
      by_time: {buckets: {total: { value: 0 }}},
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_time.buckets.forEach((bucket:any) => {
        const { key, total, MOV0, MOV1, MOV2, MOV3, MOV4, MOV5, MOV6 } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, total: {value: 0}, MOV0: {value: 0}, MOV1: {value:0}, MOV2: {value:0}, 
              MOV3: {value:0}, MOV4: {value:0}, MOV5: {value:0}, MOV6: {value:0} };
        }
        mergedBuckets[key].total.value += total.value;
        mergedBuckets[key].MOV0.value += MOV0.value;
        mergedBuckets[key].MOV1.value += MOV1.value;
        mergedBuckets[key].MOV2.value += MOV2.value;
        mergedBuckets[key].MOV3.value += MOV3.value;
        mergedBuckets[key].MOV4.value += MOV4.value;
        mergedBuckets[key].MOV5.value += MOV5.value;
        mergedBuckets[key].MOV6.value += MOV6.value;
      });
    });
    mergedObject.by_time.buckets = Object.values(mergedBuckets);
    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkByTime) {
    const mergedObject :any = {
      by_time: {buckets: {total: { value: 0 }}},
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_time.buckets.forEach((bucket:any) => {
        const { key, total } = bucket;
        if (!mergedBuckets[key]) {
            mergedBuckets[key] = { key, total: {value: 0} };
        }
        mergedBuckets[key].total.value += total.value;
      });
    });
    mergedObject.by_time.buckets = Object.values(mergedBuckets);
    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkPopByFlow) {
    const flowPop = data.reduce((sum: number, item: any) => sum + item.pop_by_flow.value, 0);
    result.push({
      key: parseInt(region),
      pop_by_flow: { value: flowPop }
    })
  }
  else if (checkbyRegion) {
    const mergedObject :any = {
      by_purpose: {buckets: { pop_by_purpose: { value: 0 }}},
      by_day: {buckets: { pop_by_day: { value: 0 }}},
      by_weekdays: {buckets: {weekday: {pop_by_weekdays: {value:0}}, weekend: {pop_by_weekdays: {value:0}}}},
      by_dow: {buckets: {pop_by_dow: { value:0 }}}
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_purpose.buckets.forEach((bucket:any) => {
        const { key, pop_by_purpose } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_purpose: {value: 0}}
        }
        mergedBuckets[key].pop_by_purpose.value += pop_by_purpose.value;
      });
    })
    mergedObject.by_purpose.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_day.buckets.forEach((bucket:any) => {
        const { key_as_string, pop_by_day } = bucket;
        if (!mergedBuckets[key_as_string]) {
          mergedBuckets[key_as_string] = {key_as_string, pop_by_day: {value: 0}}
        }
        mergedBuckets[key_as_string].pop_by_day.value += pop_by_day.value;
      });
    })
    mergedObject.by_day.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      mergedObject.by_weekdays.buckets.weekday.pop_by_weekdays.value +=
        item.by_weekdays.buckets.weekday.pop_by_weekdays.value;
      mergedObject.by_weekdays.buckets.weekend.pop_by_weekdays.value +=
        item.by_weekdays.buckets.weekend.pop_by_weekdays.value;
    });
    
    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_dow.buckets.forEach((bucket:any) => {
        const { key, pop_by_dow } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_dow: {value: 0}}
        }
        mergedBuckets[key].pop_by_dow.value += pop_by_dow.value;
      });
    })
    mergedObject.by_dow.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...ageReduceValue(data),
      ...mergedObject
    })
  }
  else if (checkMaxFlowWay) {
    const mergedObject :any = {
      max_flow_way: {buckets: {max_way_pop: { value: 0 }}},
    };
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.max_flow_way.buckets.forEach((bucket:any) => {
        const { key, max_way_pop } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, max_way_pop: {value: 0}}
        }
        mergedBuckets[key].max_way_pop.value += max_way_pop.value;
      });
    })
    mergedObject.max_flow_way.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }

  return result;
}
export async function mergeUnionLlp(
  data: any,
  region: string
) {
  let result: any = [];
  // 체류인구현황 탭
  const checkLastYear = data.find((item:any) => item.by_lastYear);
  const checkGender = data.find((item:any) => item.female_pop && item.max_stay_region);
  const checkAge = data.find((item:any) => item.total_70_num);
  const checkAvgStayDay = data.find((item:any) => item.avg_stay_day);
  const checkAvgDay = data.find((item:any) => item.avg_day);
  const checkBySido = data.find((item:any) => item.current_year);
  const checkPrevMonth = data.find((item:any) => item.by_prevMonth);
  const checkWeek = data.find((item:any) => item.weekday_weekend_buckets);
  const checkSexageRrop = data.find((item:any) => item.by_sexage_rrop);
  const checkRrop = data.find((item:any) => item.pop_by_rrop);
  const checkCurrentAndLast = data.find((item:any) => item.current_year && item.by_lastYear);
  
  // 체류인구특성 탭
  const checkTotTop = data.find((item:any) => item.tot_pop_index && item.by_stay_8);
  const checkByTimeTotal = data.find((item:any) => item.by_stay_time && item.pop_by_day && item.by_time_total);
  const checkAvgLdgmt = data.find((item:any) => item.avg_ldgmt && item.by_ldgmt_total && item.by_ldgmt_4);
  const checkLdgmt = data.find((item:any) => item.by_sex && item.by_age);

  
  if (checkCurrentAndLast) {
    const mergedObject :any = {
      current_year: { by_sido: {buckets: { key: 0, pop_by_sido: { value: 0 }}}},
      by_lastYear: { by_sido: {buckets: { key: 0, pop_by_sido: { value: 0 }}}},
    };
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.current_year.forEach((bucket:any) => {
        const { key, pop_by_sido } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_sido: {value: 0}}
        }
        mergedBuckets[key].pop_by_sido.value += pop_by_sido.value;
      });
    })
    mergedObject.current_year.by_sido.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_lastYear.forEach((bucket:any) => {
        const { key, pop_by_sido } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, pop_by_sido: {value: 0}}
        }
        mergedBuckets[key].pop_by_sido.value += pop_by_sido.value;
      });
    })
    mergedObject.by_lastYear.by_sido.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkLdgmt) {
    const ldgmt01 = data.reduce((sum: number, item: any) => item.by_sex.buckets[0].key === 0 && (sum + item.by_sex.buckets[0].by_ldgmt_1.value), 0);
    const ldgmt02 = data.reduce((sum: number, item: any) => item.by_sex.buckets[0].key === 0 && (sum + item.by_sex.buckets[0].by_ldgmt_2.value), 0);
    const ldgmt03 = data.reduce((sum: number, item: any) => item.by_sex.buckets[0].key === 0 && (sum + item.by_sex.buckets[0].by_ldgmt_3.value), 0);
    const ldgmt04 = data.reduce((sum: number, item: any) => item.by_sex.buckets[0].key === 0 && (sum + item.by_sex.buckets[0].by_ldgmt_4.value), 0);
    const ldgmt11 = data.reduce((sum: number, item: any) => item.by_sex.buckets[1].key === 1 && (sum + item.by_sex.buckets[1].by_ldgmt_1.value), 0);
    const ldgmt12 = data.reduce((sum: number, item: any) => item.by_sex.buckets[1].key === 1 && (sum + item.by_sex.buckets[1].by_ldgmt_2.value), 0);
    const ldgmt13 = data.reduce((sum: number, item: any) => item.by_sex.buckets[1].key === 1 && (sum + item.by_sex.buckets[1].by_ldgmt_3.value), 0);
    const ldgmt14 = data.reduce((sum: number, item: any) => item.by_sex.buckets[1].key === 1 && (sum + item.by_sex.buckets[1].by_ldgmt_4.value), 0);
    
    const mergedObject: any = {
      by_age: {buckets: []}
    };
    let mergedBuckets:any = {};
    data.forEach((item:any) => {
      item.by_age.buckets.forEach((bucket:any) => {
        const { key, by_ldgmt_1, by_ldgmt_2, by_ldgmt_3, by_ldgmt_4 } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, by_ldgmt_1: {value: 0}, by_ldgmt_2: {value: 0}, by_ldgmt_3: {value: 0}, by_ldgmt_4: {value: 0},}
        }
        mergedBuckets[key].by_ldgmt_1.value += by_ldgmt_1.value;
        mergedBuckets[key].by_ldgmt_2.value += by_ldgmt_2.value;
        mergedBuckets[key].by_ldgmt_3.value += by_ldgmt_3.value;
        mergedBuckets[key].by_ldgmt_4.value += by_ldgmt_4.value;
      });
    });
    mergedObject.by_age.buckets = Object.values(mergedBuckets);    

    result.push({
      key: parseInt(region),
      by_sex: {buckets: [{
        key: 0, by_ldgmt_1: {value: ldgmt01}, by_ldgmt_2: {value: ldgmt02},
        by_ldgmt_3: {value: ldgmt03}, by_ldgmt_4: {value: ldgmt04},
      },
      {
        key: 1, by_ldgmt_1: {value: ldgmt11}, by_ldgmt_2: {value: ldgmt12},
        by_ldgmt_3: {value: ldgmt13}, by_ldgmt_4: {value: ldgmt14},
      }]},
      ...mergedObject
    })
  }
  else if (checkBySido) {
    const currentPop = data[0].current_year.reduce((sum: number, item: any) => sum + item.pop_by_sido.value, 0);
    const lastPop = data[0].by_lastYear.reduce((sum: number, item: any) => sum + item.pop_by_sido.value, 0);

    result.push({
      key: parseInt(region),
      current_year: { by_sido: { value: currentPop }},
      by_lastYear: { by_sido: { value: lastPop }},
    })
  }
  else if (checkRrop) {
    const rrop = data.reduce((sum: number, item: any) => sum + item.pop_by_rrop.tot_pop_num.value, 0);
    if (data[0].by_month) {
      const mergedObject :any = {
        by_month: {buckets: {pop_by_month: { value: 0}}},
      };
      
      let mergedBuckets: any = {};
      data.forEach((item:any) => {
        item.by_month.buckets.forEach((bucket:any) => {
          const { key_as_string, pop_by_month } = bucket;
          if (!mergedBuckets[key_as_string]) {
            mergedBuckets[key_as_string] = {key_as_string, pop_by_month: {value: 0}}
          }
          mergedBuckets[key_as_string].pop_by_month.value += pop_by_month.value;
        });
      })
      mergedObject.by_month.buckets = Object.values(mergedBuckets);
      result.push({
        key: parseInt(region),
        pop_by_rrop: { tot_pop_num: { value: rrop }},
        by_sexage_rrop: ageReduce(data, 'by_sexage_rrop'),
        ...mergedObject
      })
    }
    else {
      result.push({
        key: parseInt(region),
        pop_by_rrop: { tot_pop_num: { value: rrop }},
        by_sexage_rrop: ageReduce(data, 'by_sexage_rrop'),
      })
    }
  }
  else if (checkSexageRrop) {
    const current_value = data.reduce((sum: number, item: any) => sum + item.by_current.pop_by_month.value, 0);

    if (data[0].by_month) {
      const mergedObject :any = {
        by_month: {buckets: {pop_by_month: { value: 0}}},
        by_month_age: {buckets: {  }}
      };
      let mergedBuckets: any = {};
      data.forEach((item:any) => {
        item.by_month.buckets.forEach((bucket:any) => {
          const { key_as_string, pop_by_month } = bucket;
          if (!mergedBuckets[key_as_string]) {
            mergedBuckets[key_as_string] = {key_as_string, pop_by_month: {value: 0}}
          }
          mergedBuckets[key_as_string].pop_by_month.value += pop_by_month.value;
        });
      })
      mergedObject.by_month.buckets = Object.values(mergedBuckets);
  
      mergedBuckets = {};
      data.forEach((item:any) => {
        item.by_month_age.buckets.forEach((bucket:any) => {
          const { key_as_string, f50, f30, f10, f75, f55, m70, f35, m50, f15, total, total_male, total_female,
            f80, f60, f40, f65, m80, f20, f45, m60, f25, m40, m20, m65, m45, m25, m75, f70, m10, m35, m15, m55, m30
           } = bucket;
  
          if (!mergedBuckets[key_as_string]) {
            mergedBuckets[key_as_string] = {key_as_string, f10: {value: 0}, f15: {value: 0}, f20: {value: 0}, f25: {value: 0}, f30: {value: 0}, m20: {value: 0},
            f35: {value: 0}, f40: {value: 0}, f45: {value: 0}, f50: {value: 0}, f55: {value: 0}, f60: {value: 0}, f65: {value: 0}, f70: {value: 0}, f75: {value: 0}, f80: {value: 0}, m10: {value: 0}, m15: {value: 0},
            m25: {value: 0}, m30: {value: 0}, m35: {value: 0}, m40: {value: 0}, m45: {value: 0}, m50: {value: 0}, m55: {value: 0}, m60: {value: 0}, m65: {value: 0}, m70: {value: 0}, m75: {value: 0}, m80: {value: 0},
            total: {value: 0}, total_male: {value: 0}, total_female: {value: 0}};
          }
          mergedBuckets[key_as_string].f10.value += f10.value;
          mergedBuckets[key_as_string].f15.value += f15.value;
          mergedBuckets[key_as_string].f20.value += f20.value;
          mergedBuckets[key_as_string].f25.value += f25.value;
          mergedBuckets[key_as_string].f30.value += f30.value;
          mergedBuckets[key_as_string].f35.value += f35.value;
          mergedBuckets[key_as_string].f40.value += f40.value;
          mergedBuckets[key_as_string].f45.value += f45.value;
          mergedBuckets[key_as_string].f50.value += f50.value;
          mergedBuckets[key_as_string].f55.value += f55.value;
          mergedBuckets[key_as_string].f60.value += f60.value;
          mergedBuckets[key_as_string].f65.value += f65.value;
          mergedBuckets[key_as_string].f70.value += f70.value;
          mergedBuckets[key_as_string].f75.value += f75.value;
          mergedBuckets[key_as_string].f80.value += f80.value;
          mergedBuckets[key_as_string].m10.value += m10.value;
          mergedBuckets[key_as_string].m15.value += m15.value;
          mergedBuckets[key_as_string].m20.value += m20.value;
          mergedBuckets[key_as_string].m25.value += m25.value;
          mergedBuckets[key_as_string].m30.value += m30.value;
          mergedBuckets[key_as_string].m35.value += m35.value;
          mergedBuckets[key_as_string].m40.value += m40.value;
          mergedBuckets[key_as_string].m45.value += m45.value;
          mergedBuckets[key_as_string].m50.value += m50.value;
          mergedBuckets[key_as_string].m55.value += m55.value;
          mergedBuckets[key_as_string].m60.value += m60.value;
          mergedBuckets[key_as_string].m65.value += m65.value;
          mergedBuckets[key_as_string].m70.value += m70.value;
          mergedBuckets[key_as_string].m75.value += m75.value;
          mergedBuckets[key_as_string].m80.value += m80.value;
          mergedBuckets[key_as_string].total.value += total.value;
          mergedBuckets[key_as_string].total_male.value += total_male.value;
          mergedBuckets[key_as_string].total_female.value += total_female.value;
        });
      })
      mergedObject.by_month_age.buckets = Object.values(mergedBuckets);
      result.push({
        key: parseInt(region),
        by_current: { pop_by_month: { value: current_value }},
        by_sexage_rrop: ageReduce(data, 'by_sexage_rrop'),
        ...mergedObject
      })
    }
    else {
      result.push({
        key: parseInt(region),
        by_current: { pop_by_month: { value: current_value }},
        by_sexage_rrop: ageReduce(data, 'by_sexage_rrop'),
      })
    }
  }
  else if (checkWeek) {
    const mergedObject :any = {
      by_day: {buckets: []},
      weekday_weekend_buckets: {buckets: {weekday: {pop_by_weekdays: {value:0}}, weekend: {pop_by_weekdays: {value:0}}}}
    };
    const mergedBuckets: any = {};

    data.forEach((item:any) => {
      item.by_day.buckets.forEach((bucket:any) => {
        const { key_as_string, pop_by_day } = bucket;
        if (!mergedBuckets[key_as_string]) {
          mergedBuckets[key_as_string] = {key_as_string, pop_by_day: {value: 0}}
        }
        mergedBuckets[key_as_string].pop_by_day.value += pop_by_day.value;
      });
      mergedObject.weekday_weekend_buckets.buckets.weekday.pop_by_weekdays.value +=
        item.weekday_weekend_buckets.buckets.weekday.pop_by_weekdays.value;
      mergedObject.weekday_weekend_buckets.buckets.weekend.pop_by_weekdays.value +=
        item.weekday_weekend_buckets.buckets.weekend.pop_by_weekdays.value;
    });
    mergedObject.by_day.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  else if (checkPrevMonth) {
    const prevM_value = data.reduce((sum: number, item: any) => sum + item.by_prevMonth.pop_by_prevMonth.value, 0);
    const prevY_value = data.reduce((sum: number, item: any) => sum + item.by_lastYear.pop_by_lastYear.value, 0);
    const present_value = data.reduce((sum: number, item: any) => sum + item.by_start.pop_by_start.value, 0);

    result.push({
      key: parseInt(region),
      by_prevMonth: { pop_by_prevMonth: { value: prevM_value }},
      by_lastYear: { pop_by_lastYear: { value: prevY_value }},
      by_start: { pop_by_start: { value: present_value }},
    })
  }
  else if (checkLastYear) {
    const last_value = data.reduce((sum: number, item: any) => sum + item.by_lastYear.pop_by_lastYear.value, 0);
    const present_value = data.reduce((sum: number, item: any) => sum + item.by_start.pop_by_start.value, 0);

    result.push({
      key: parseInt(region),
      by_lastYear: { pop_by_lastYear: { value: last_value }},
      by_start: { pop_by_start: { value: present_value }},
    })
  }
  else if (checkAvgLdgmt) {
    const avgLdgmt = data.reduce((sum: number, item: any) => sum + item.avg_ldgmt.value, 0);
    const total = data.reduce((sum: number, item: any) => sum + item.by_ldgmt_total.value, 0);
    const ldgmt_1 = data.reduce((sum: number, item: any) => sum + item.by_ldgmt_1.tot_pop_num.value, 0);
    const ldgmt_2 = data.reduce((sum: number, item: any) => sum + item.by_ldgmt_1.tot_pop_num.value, 0);
    const ldgmt_3 = data.reduce((sum: number, item: any) => sum + item.by_ldgmt_1.tot_pop_num.value, 0);
    const ldgmt_4 = data.reduce((sum: number, item: any) => sum + item.by_ldgmt_1.tot_pop_num.value, 0);

    result.push({
      key: parseInt(region),
      avg_ldgmt: {value: avgLdgmt},
      by_ldgmt_1: {tot_pop_num: {value: ldgmt_1}},
      by_ldgmt_2: {tot_pop_num: {value: ldgmt_2}},
      by_ldgmt_3: {tot_pop_num: {value: ldgmt_3}},
      by_ldgmt_4: {tot_pop_num: {value: ldgmt_4}},
      by_ldgmt_total: {value: total},
    })
  }
  else if (checkGender) {
    const female_value = data.reduce((sum: number, item: any) => sum + item.female_pop.value, 0);
    const male_value = data.reduce((sum: number, item: any) => sum + item.male_pop.value, 0);
    const max_stay_value = data[0].max_stay_region.buckets[0].key;
    
    result.push({
      key: parseInt(region),
      female_pop: { value: female_value },
      max_stay_region: { 
        buckets: [{ key: max_stay_value }]},
      male_pop: { value: male_value },
    })
  }
  else if (checkAge) {
    const total00_value = data.reduce((sum: number, item: any) => sum + item.total_00_num.value, 0);
    const total10_value = data.reduce((sum: number, item: any) => sum + item.total_10_num.value, 0);
    const total15_value = data.reduce((sum: number, item: any) => sum + item.total_15_num.value, 0);
    const total20_value = data.reduce((sum: number, item: any) => sum + item.total_20_num.value, 0);
    const total25_value = data.reduce((sum: number, item: any) => sum + item.total_25_num.value, 0);
    const total30_value = data.reduce((sum: number, item: any) => sum + item.total_30_num.value, 0);
    const total35_value = data.reduce((sum: number, item: any) => sum + item.total_35_num.value, 0);
    const total40_value = data.reduce((sum: number, item: any) => sum + item.total_40_num.value, 0);
    const total45_value = data.reduce((sum: number, item: any) => sum + item.total_45_num.value, 0);
    const total50_value = data.reduce((sum: number, item: any) => sum + item.total_50_num.value, 0);
    const total55_value = data.reduce((sum: number, item: any) => sum + item.total_55_num.value, 0);
    const total60_value = data.reduce((sum: number, item: any) => sum + item.total_60_num.value, 0);
    const total65_value = data.reduce((sum: number, item: any) => sum + item.total_65_num.value, 0);
    const total70_value = data.reduce((sum: number, item: any) => sum + item.total_70_num.value, 0);
    const total75_value = data.reduce((sum: number, item: any) => sum + item.total_75_num.value, 0);
    const total80_value = data.reduce((sum: number, item: any) => sum + item.total_80_num.value, 0);

    result.push({
      key: parseInt(region),
      total_00_num: { value: total00_value},
      total_10_num: { value: total10_value},
      total_15_num: { value: total15_value},
      total_20_num: { value: total20_value},
      total_25_num: { value: total25_value},
      total_30_num: { value: total30_value},
      total_35_num: { value: total35_value},
      total_40_num: { value: total40_value},
      total_45_num: { value: total45_value},
      total_50_num: { value: total50_value},
      total_55_num: { value: total55_value},
      total_60_num: { value: total60_value},
      total_65_num: { value: total65_value},
      total_70_num: { value: total70_value},
      total_75_num: { value: total75_value},
      total_80_num: { value: total80_value},
    })
  }
  else if (checkAvgStayDay) {
    const avgStay_value = data.reduce((sum: number, item: any) => sum + item.avg_stay_day.value, 0);
    const avg_value = avgStay_value / data.length;

    result.push({
      key: parseInt(region),
      avg_stay_day: { value: avg_value }
    })
  }
  else if (checkAvgDay) {
    const avgDay_value = data.reduce((sum: number, item: any) => sum + item.avg_day.value, 0);
    const avg_value = avgDay_value / data.length;

    result.push({
      key: parseInt(region),
      avg_day: { value: avg_value }
    })
  }
  // 체류인구특성 월 검색
  else if (checkTotTop) {
    const totTopIndexValue = data.reduce((sum: number, item: any) => sum + item.tot_pop_index.value, 0);
    const totTopValue = data.reduce((sum: number, item: any) => sum + item.tot_pop.value, 0);
    
    result.push({
      key: parseInt(region),
      tot_pop_index: { value: totTopIndexValue},
      tot_pop: { value: totTopValue},
      'by_stay_2-7': ageReduce(data, 'by_stay_2-7'),
       by_stay_total: ageReduce(data, 'by_stay_total'),
       by_stay_8: ageReduce(data, 'by_stay_8'),
       by_stay_1: ageReduce(data, 'by_stay_1'),
    })
  }
  // 체류인구특성 일 검색
  else if (checkByTimeTotal) {
    const mergedObject :any = {
      by_stay_time: {buckets: []},
      pop_by_day: { buckets: [] },
      by_time_total: {buckets: []},
    };
    let mergedBuckets: any = {};
    data.forEach((item:any) => {
      item.by_stay_time.buckets.forEach((bucket:any) => {
        const { key, f50, f30, f10, f75, f55, m70, f35, m50, f15, total, total_male, total_female, f80, f60,
           f40, f65, m80, f20, f45, m60, f25, m40, m20, m65, m45, m25, m75, f70, m10, m35, m15, m55, m30 } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, f10: {value: 0}, f15: {value: 0}, f20: {value: 0}, f25: {value: 0}, f30: {value: 0}, m20: {value: 0},
            f35: {value: 0}, f40: {value: 0}, f45: {value: 0}, f50: {value: 0}, f55: {value: 0}, f60: {value: 0}, f65: {value: 0}, f70: {value: 0}, f75: {value: 0}, f80: {value: 0}, m10: {value: 0}, m15: {value: 0},
            m25: {value: 0}, m30: {value: 0}, m35: {value: 0}, m40: {value: 0}, m45: {value: 0}, m50: {value: 0}, m55: {value: 0}, m60: {value: 0}, m65: {value: 0}, m70: {value: 0}, m75: {value: 0}, m80: {value: 0},
            total: {value: 0}, total_male: {value: 0}, total_female: {value: 0} };
        }
        mergedBuckets[key].f10.value += f10.value;
        mergedBuckets[key].f15.value += f15.value;
        mergedBuckets[key].f20.value += f20.value;
        mergedBuckets[key].f25.value += f25.value;
        mergedBuckets[key].f30.value += f30.value;
        mergedBuckets[key].f35.value += f35.value;
        mergedBuckets[key].f40.value += f40.value;
        mergedBuckets[key].f45.value += f45.value;
        mergedBuckets[key].f50.value += f50.value;
        mergedBuckets[key].f55.value += f55.value;
        mergedBuckets[key].f60.value += f60.value;
        mergedBuckets[key].f65.value += f65.value;
        mergedBuckets[key].f70.value += f70.value;
        mergedBuckets[key].f75.value += f75.value;
        mergedBuckets[key].f80.value += f80.value;
        mergedBuckets[key].m10.value += m10.value;
        mergedBuckets[key].m15.value += m15.value;
        mergedBuckets[key].m20.value += m20.value;
        mergedBuckets[key].m25.value += m25.value;
        mergedBuckets[key].m30.value += m30.value;
        mergedBuckets[key].m35.value += m35.value;
        mergedBuckets[key].m40.value += m40.value;
        mergedBuckets[key].m45.value += m45.value;
        mergedBuckets[key].m50.value += m50.value;
        mergedBuckets[key].m55.value += m55.value;
        mergedBuckets[key].m60.value += m60.value;
        mergedBuckets[key].m65.value += m65.value;
        mergedBuckets[key].m70.value += m70.value;
        mergedBuckets[key].m75.value += m75.value;
        mergedBuckets[key].m80.value += m80.value;
        mergedBuckets[key].total.value += total.value;
        mergedBuckets[key].total_male.value += total_male.value;
        mergedBuckets[key].total_female.value += total_female.value;
      });
    });
    mergedObject.by_stay_time.buckets = Object.values(mergedBuckets);
    
    mergedBuckets = {};
    let mergedBuckets2: any = {};
    data.forEach((item:any) => {
      item.pop_by_day.buckets.forEach((bucket:any) => {
        const { key_as_string, daily_total, by_stay_time } = bucket;
        if (!mergedBuckets[key_as_string]) {
          mergedBuckets[key_as_string] = {key_as_string, daily_total: {value: 0}}
        }
        mergedBuckets[key_as_string].daily_total.value += daily_total.value;

        by_stay_time.buckets.forEach((obj:any) => {
          mergedBuckets2 = {};
          const { key, pop_by_day } = obj;
          if (!mergedBuckets2[key]) {
            mergedBuckets2[key] = {key, pop_by_day: {value: 0}}
          }
          mergedBuckets2[key].pop_by_day.value += pop_by_day.value;
        })
        mergedBuckets[key_as_string].by_stay_time = {buckets: Object.values(mergedBuckets2)};
      });
    });    
    mergedObject.pop_by_day.buckets = Object.values(mergedBuckets);

    mergedBuckets = {};
    data.forEach((item:any) => {
      item.by_time_total.buckets.forEach((bucket:any) => {
        const { key, by_time_total } = bucket;
        if (!mergedBuckets[key]) {
          mergedBuckets[key] = {key, by_time_total: {value: 0}}
        }
        mergedBuckets[key].by_time_total.value += by_time_total.value;
      });
    });
    mergedObject.by_time_total.buckets = Object.values(mergedBuckets);

    result.push({
      key: parseInt(region),
      ...mergedObject
    })
  }
  return result;
}
export async function mergeUnion(
  data: any,
  region: string
) {
  let result: any = {};
  const checkOD = data.some((item:any) => item.present_mopin)
  
  if (checkOD && region.length === 5) {
    const present_value = data.reduce((sum: number, item: any) => sum + item.present_mopin.tot_popul_num.value, 0)
    const last_value = data.reduce((sum: number, item: any) => sum + item.last_mopin.tot_popul_num.value, 0)
    const prev_value = data.reduce((sum: number, item: any) => sum + item.prev_mopin.tot_popul_num.value, 0)

    result={
      key: parseInt(region),
      present_mopin: { tot_popul_num: { value: present_value }},
      last_mopin: { tot_popul_num: { value: last_value }},
      prev_mopin: { tot_popul_num: { value: prev_value }}
    }
  } else if (!checkOD && region.length === 5) {
    const present_value = data.reduce((sum: number, item: any) => sum + item.present_mopout.tot_popul_num.value, 0)
    const last_value = data.reduce((sum: number, item: any) => sum + item.last_mopout.tot_popul_num.value, 0)
    const prev_value = data.reduce((sum: number, item: any) => sum + item.prev_mopout.tot_popul_num.value, 0)

    result={
      key: parseInt(region),
      present_mopout: { tot_popul_num: { value: present_value }},
      last_mopout: { tot_popul_num: { value: last_value }},
      prev_mopout: { tot_popul_num: { value: prev_value }},
    }
    
  }
  return result;
}

export async function mergeUnionByOne(
  data: any,
  region: string
) {
  let result: any = [];
  let sum_0 = 0;
  let sum_1 = 0;
  let sum_2 = 0;
  let sum_3 = 0;
  let sum_4 = 0;
  let sum_5 = 0;
  let sum_6 = 0;
  let sum_7 = 0;
  const Bucket = data.aggregations.by_region.buckets || [];
  const checkPr = Bucket.find((item:any) => item.by_prps)
  
  if (checkPr) {
    for (const item of Bucket) {
      const prBucket = item.by_prps.buckets || [];
      const value_0 = prBucket.reduce((sum: number, item: any) => 
        item.key === 0 ? sum + item.tot_popul_num.value : sum, 0)
      const value_1 = prBucket.reduce((sum: number, item: any) => 
        item.key === 1 ? sum + item.tot_popul_num.value : sum, 0)
      const value_2 = prBucket.reduce((sum: number, item: any) => 
        item.key === 2 ? sum + item.tot_popul_num.value : sum, 0)
      const value_3 = prBucket.reduce((sum: number, item: any) => 
        item.key === 3 ? sum + item.tot_popul_num.value : sum, 0)
      const value_4 = prBucket.reduce((sum: number, item: any) => 
        item.key === 4 ? sum + item.tot_popul_num.value : sum, 0)
      const value_5 = prBucket.reduce((sum: number, item: any) => 
        item.key === 5 ? sum + item.tot_popul_num.value : sum, 0)
      const value_6 = prBucket.reduce((sum: number, item: any) => 
        item.key === 6 ? sum + item.tot_popul_num.value : sum, 0)
      sum_0 += value_0
      sum_1 += value_1
      sum_2 += value_2
      sum_3 += value_3
      sum_4 += value_4
      sum_5 += value_5
      sum_6 += value_6
    }
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: parseInt(region),
              by_prps: {
                buckets: [
                  {
                    key: 0,
                    tot_popul_num : { value: sum_0 }
                  },
                  {
                    key: 1,
                    tot_popul_num : { value: sum_1}
                  },
                  {
                    key: 2,
                    tot_popul_num : { value: sum_2 }
                  },
                  {
                    key: 3,
                    tot_popul_num : { value: sum_3 }
                  },
                  {
                    key: 4,
                    tot_popul_num : { value: sum_4 }
                  },
                  {
                    key: 5,
                    tot_popul_num : { value: sum_5 }
                  },
                  {
                    key: 6,
                    tot_popul_num : { value: sum_6 }
                  }
                ]
              }
            }
          ]
        }
      }
    })
  } else {
    for (const item of Bucket) {
      const wayBucket = item.by_way.buckets || [];
      const value_0 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 0 ? sum + item.tot_popul_num.value : sum, 0)
      const value_1 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 1 ? sum + item.tot_popul_num.value : sum, 0)
      const value_2 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 2 ? sum + item.tot_popul_num.value : sum, 0)
      const value_3 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 3 ? sum + item.tot_popul_num.value : sum, 0)
      const value_4 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 4 ? sum + item.tot_popul_num.value : sum, 0)
      const value_5 = wayBucket.reduce((sum: number, item: any) => 
        item.key === 5 ? sum + item.tot_popul_num.value : sum, 0)
      const value_6 = wayBucket.reduce((sum: number, item: any) =>
        item.key === 6 ? sum + item.tot_popul_num.value : sum, 0)
      const value_7 = wayBucket.reduce((sum: number, item: any) =>
        item.key === 7 ? sum + item.tot_popul_num.value : sum, 0)
      sum_0 += value_0
      sum_1 += value_1
      sum_2 += value_2
      sum_3 += value_3
      sum_4 += value_4
      sum_5 += value_5
      sum_6 += value_6
      sum_7 += value_7
    }
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: parseInt(region),
              by_way: {
                buckets: [
                  {
                    key: 0,
                    tot_popul_num : { value: sum_0 }
                  },
                  {
                    key: 1,
                    tot_popul_num : { value: sum_1}
                  },
                  {
                    key: 2,
                    tot_popul_num : { value: sum_2 }
                  },
                  {
                    key: 3,
                    tot_popul_num : { value: sum_3 }
                  },
                  {
                    key: 4,
                    tot_popul_num : { value: sum_4 }
                  },
                  {
                    key: 5,
                    tot_popul_num : { value: sum_5 }
                  },
                  {
                    key: 6,
                    tot_popul_num : { value: sum_6 }
                  },
                  {
                    key: 7,
                    tot_popul_num : { value: sum_7 }
                  }
                ]
              }
            }
          ]
        }
      }
    })
  }
  return result;
}

export async function mergeUnionByRank(
  data: any,
  region: string
) {
  let result: any = [];
  let temp: any = [];
  const valueMap = new Map<number, number>();
  const totalValue = new Map<number, number>();
  const checkOD = data.aggregations.by_detina
  let sumValue = 0;
  let cnt = 0;

  if (unionArray.includes(region)) {
    if (checkOD) {
      const bucket = data.aggregations.by_detina.buckets || [];

      for (const item of bucket) {
        const rankBucket = item.by_pdepar.buckets || [];

        for (const item of rankBucket) {
          const key = item.key;
          const value = item.pdepar_tot_popul_num.value;
          if (valueMap.has(key)) {
            sumValue = valueMap.get(key) + value
            valueMap.set(key, sumValue)
          } else {
            valueMap.set(key, value)
          }
        }
      }
      const sortMap = [...valueMap.entries()].sort((a, b) => b[1] - a[1]);
      for (const [key, value] of sortMap) {
        if (cnt < 5) {
          temp.push({
            key: key,
            pdepar_tot_popul_num: { value: value }
          })
          cnt++;
        }
      }
      result.push({
        aggregations: {
          by_detina: {
            buckets: [
              {
                key: parseInt(region),
                by_pdepar: {
                  buckets: temp
                }
              }
            ]
          }
        }
      })
    } else {
      const bucket = data.aggregations.by_pdepar.buckets || [];
      
      for (const item of bucket) {
        const rankBucket = item.by_detina.buckets || [];

        for (const item of rankBucket) {
          const key = item.key;
          const value = item.tot_popul_num.value;
          if (valueMap.has(key)) {
            sumValue = valueMap.get(key) + value
            valueMap.set(key, sumValue)
          } else {
            valueMap.set(key, value)
          }
        }
      }
      const sortMap = [...valueMap.entries()].sort((a, b) => b[1] - a[1]);
      for (const [key, value] of sortMap) {
        if (cnt < 5) {
          temp.push({
            key: key,
            tot_popul_num: { value: value }
          })
          cnt++;
        }
      }
      result.push({
        aggregations: {
          by_pdepar: {
            buckets: [
              {
                key: parseInt(region),
                by_detina: {
                  buckets: temp
                }
              }
            ]
          }
        }
      })
    }
  } else {
    result.push(data);
  }
  return result;
}

export async function mergeUnionByAlp(
  data: any,
  regionArray: string[],
  category?: string
) {
  let result: any = [];
  let isOD: string;
  const groupMap: { [region: string]: string[] } = {
    "41110": ["41111", "41113", "41115", "41117"],
    "41130": ["41131", "41133", "41135"],
    "41170": ["41171", "41173"],
    "41190": ["41192", "41194", "41196"],
    "41270": ["41271", "41273"],
    "41280": ["41281", "41285", "41287"],
    "41460": ["41461", "41463", "41465"]
  }
  
  regionArray.forEach((region) => {
    if (category === "alp_forn" && unionArray.includes(region)) {
      const groupKeys = groupMap[region];
      let tot_value = 0;
      for (const item of data) {
        const key = item.key.toString();
        if (groupMap[region].includes(key)) {
          tot_value += item.tot_sum.value;
        }
      }
      result.push({
        key: parseInt(region),
        tot_sum: { value : tot_value }
      });
    } else if (category === "alp_forn" && !unionArray.includes(region)) {
      let tot_value = 0;
      for (const item of data) {
        const key = item.key.toString();
        if (region === key) {
          tot_value += item.tot_sum.value
        }
      }
      result.push({
        key: parseInt(region),
        tot_sum: { value : tot_value }
      });
    } else if (category === "alp_OD" && unionArray.includes(region)) {
      let maxKey = 0;
      let maxValue = -Infinity;
      let totalODValue = new Map<number, number>();
      const checkKeys = groupMap[region];
      for (const item of data) {
        const [key] = Object.keys(item);
        const regionData = item[key];
        const groupKey = regionData.group_by_detina_sum ? "group_by_detina_sum" : regionData.group_by_pdepar_sum ? "group_by_pdepar_sum" : null;
        if (!groupKey) {
          continue;
        }
        if (groupKey === "group_by_detina_sum") {
          isOD = "group_by_detina_sum"
        } else {
          isOD = "group_by_pdepar_sum"
        } 
        const buckets = regionData[groupKey].buckets

        if (checkKeys && checkKeys.includes(key)) {
          for (const bucket of buckets) {
            const regionKey = bucket.key;
            const value = bucket.total.value;
            const tot = totalODValue.get(regionKey) || 0;
            totalODValue.set(regionKey, tot + value);
          }
        }
      }

      for (const [key, value] of totalODValue.entries()) {
        if (value > maxValue) {
          maxKey = key;
          maxValue = value;
        }
      }

      if (isOD === "group_by_detina_sum") {
        result.push({
          [region]: {
            group_by_detina_sum: {
              buckets: [
                {
                  key: maxKey,
                  total: { value: maxValue }
                }
              ]
            }
          }
        })
      } else {
        result.push({
          [region]: {
            group_by_pdepar_sum: {
              buckets: [
                {
                  key: maxKey,
                  total: { value: maxValue }
                }
              ]
            }
          }
        })
      }
    } else if (category === "alp_OD" && !unionArray.includes(region)){ // 비통합시군구 지역도 다시 가공
      let totalODValue = new Map<number, number>();
      let maxKey = 0;
      let maxValue = -Infinity;

      for (const item of data) {
        const [key] = Object.keys(item);
        const regionData = item[key];
        const groupKey = regionData.group_by_detina_sum ? "group_by_detina_sum" : regionData.group_by_pdepar_sum ? "group_by_pdepar_sum" : null;
        if (!groupKey) {
          continue;
        }
        if (groupKey === "group_by_detina_sum") {
          isOD = "group_by_detina_sum"
        } else {
          isOD = "group_by_pdepar_sum"
        } 
        const buckets = regionData[groupKey].buckets

        if (region === key) {
          for (const bucket of buckets) {
            const regionKey = bucket.key;
            const value = bucket.total.value;
            const tot = totalODValue.get(regionKey) || 0;
            totalODValue.set(regionKey, tot + value)
          }
    
          for (const [key, value] of totalODValue.entries()) {
            if (value > maxValue) {
              maxKey = key;
              maxValue = value;
            }
          }
          if (isOD === "group_by_detina_sum") {
            result.push({
              [region]: {
                group_by_detina_sum: {
                  buckets: [
                    {
                      key: maxKey,
                      total: { value: maxValue }
                    }
                  ]
                }
              }
            })
          } else {
            result.push({
              [region]: {
                group_by_pdepar_sum: {
                  buckets: [
                    {
                      key: maxKey,
                      total: { value: maxValue }
                    }
                  ]
                }
              }
            })
          }
        }
      }
    }
  });
  return result
}

export async function mergeUnionByAlpStatus(
  regionArray: string[],
  data: any[],
  category? :string
) {
  let result: any = [];
  const groupMap: { [region: string]: string[] } = {
    "41110": ["41111", "41113", "41115", "41117"],
    "41130": ["41131", "41133", "41135"],
    "41170": ["41171", "41173"],
    "41190": ["41192", "41194", "41196"],
    "41270": ["41271", "41273"],
    "41280": ["41281", "41285", "41287"],
    "41460": ["41461", "41463", "41465"]
  }
  let isOD = data.some((obj) => {
    const regionKey = Object.keys(obj)[0];
    return obj[regionKey]?.group_by_pdepar_sum !== undefined
  })

  regionArray.forEach((region) => {
    if (category === "weekFlow" && unionArray.includes(region)) {
      const subRegions = groupMap[region];
      const sumBucketsMap = new Map<string | number, number>();

      subRegions.forEach((subRegion) => {
        const regionData = data.find((item) => item[subRegion]);
        if (!regionData) return;

        if (isOD) {
          const buckets = regionData[subRegion].group_by_pdepar_sum.buckets || [];
          buckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (sumBucketsMap.has(key)) {
              sumBucketsMap.set(key, sumBucketsMap.get(key)! + value);
            } else {
              sumBucketsMap.set(key, value);
            }
          });
          const sumBuckets = Array.from(sumBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({ key, total: { value } }))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 11);
          result.push({
            [region]: {
              group_by_pdepar_sum: {
                buckets: sumBuckets
              }
            }
          })
        } else {
          const buckets = regionData[subRegion].group_by_detina_sum.buckets || [];
          buckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (sumBucketsMap.has(key)) {
              sumBucketsMap.set(key, sumBucketsMap.get(key)! + value);
            } else {
              sumBucketsMap.set(key, value);
            }
          });
          const sumBuckets = Array.from(sumBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({ key, total: { value } }))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 11);
          result.push({
            [region]: {
              group_by_detina_sum: {
                buckets: sumBuckets
              }
            }
          })
        }
      })
    } else if (category === "weekFlow" && !unionArray.includes(region)) {
      result = data
    } else if (category === "weeked" && unionArray.includes(region)) {
      const subRegions = groupMap[region];
      const sumBucketsMap = new Map<string | number, number>();

      subRegions.forEach((subRegion) => {
        const regionData = data.find((item) => item[subRegion]);
        if (!regionData) return;

        if (isOD) {
          const buckets = regionData[subRegion].group_by_pdepar_sum.buckets || [];
          buckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (sumBucketsMap.has(key)) {
              sumBucketsMap.set(key, sumBucketsMap.get(key)! + value);
            } else {
              sumBucketsMap.set(key, value);
            }
          });
          const sumBuckets = Array.from(sumBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({ key, total: { value } }))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 11);
          result.push({
            [region]: {
              group_by_pdepar_sum: {
                buckets: sumBuckets
              }
            }
          })
        } else {
          const buckets = regionData[subRegion].group_by_detina_sum.buckets || [];
          buckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (sumBucketsMap.has(key)) {
              sumBucketsMap.set(key, sumBucketsMap.get(key)! + value);
            } else {
              sumBucketsMap.set(key, value);
            }
          });
          const sumBuckets = Array.from(sumBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({ key, total: { value } }))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 11);
          result.push({
            [region]: {
              group_by_detina_sum: {
                buckets: sumBuckets
              }
            }
          })
        }
      })
    } else if (category === "weeked" && !unionArray.includes(region)) {
      result = data
    } else if (category === "rankFlow" && unionArray.includes(region)) {
      const rankRegions = groupMap[region];
      const rankBucketsMap = new Map<string | number, number>();

      if (isOD) {
        rankRegions.forEach((rankRegion) => {
          const rankData = data.find((item) => item[rankRegion])
          const rankBuckets = rankData[rankRegion].group_by_pdepar_sum.buckets || [];
          rankBuckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (rankBucketsMap.has(key)) {
              rankBucketsMap.set(key, rankBucketsMap.get(key)! + value);
            } else {
              rankBucketsMap.set(key, value);
            }

          });
          const rankBucket = Array.from(rankBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({key, total: { value }}))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 10)

          result.push({
            [region]: {
              group_by_pdepar_sum: {
                buckets: rankBucket
              }
            }
          });
        })

      } else {
        rankRegions.forEach((rankRegion) => {
          const rankData = data.find((item) => item[rankRegion])
          const rankBuckets = rankData[rankRegion].group_by_detina_sum.buckets || [];
          rankBuckets.forEach((bucket: any) => {
            const key = bucket.key;
            const value = bucket.total.value ?? 0;

            if (rankBucketsMap.has(key)) {
              rankBucketsMap.set(key, rankBucketsMap.get(key)! + value);
            } else {
              rankBucketsMap.set(key, value);
            }

          });
          const rankBucket = Array.from(rankBucketsMap.entries())
            .filter(([key, _]) => key !== 99)
            .map(([key, value]) => ({key, total: { value }}))
            .sort((a, b) => b.total.value - a.total.value)
            .slice(0, 10)

          result.push({
            [region]: {
              group_by_detina_sum: {
                buckets: rankBucket
              }
            }
          });
        })
      }
      
    } else if (category === "rankFlow" && !unionArray.includes(region)) {
      result = data;
    } else if (category === "rankCompareFlow" && unionArray.includes(region)) {
      let sum_lastValue = 0;
      let sum_curValue = 0;
      data.forEach((item: any) => {
        const regionKey = Object.keys(item)[0]
        const regionData = item[regionKey]

        const lastValue = regionData?.by_lastYear.total.value || 0;
        const curValue = regionData?.by_start.total.value || 0;
        sum_lastValue += lastValue;
        sum_curValue += curValue;
      });
      result.push({
        [region]: {
          by_lastYear: { total : { value : sum_lastValue}},
          by_start: { total : { value : sum_curValue}}
        }
      })
    } else if (category === "rankCompareFlow" && !unionArray.includes(region)) {
      result = data;
    }
  })
  return result;
}

export async function mergeUnionByAlpStatusForn(
  regionArray: string[],
  data: any,
  category?: string
) {
  let result: any = [];
  const countryList = ["USA", "LKA", "KAZ", "MNG", "CHN",
    "JPN", "NPL", "THA", "CAN", "KHM",
    "RUS", "IDN", "MMR", "FRA", "VNM",
    "PHL", "PAK", "UZB", "IND", "BGD"
  ] as const;
  type CountryCode = typeof countryList[number];
  type CountryWithTotal = CountryCode | "total";
  const countrySum: Record<string, number> = {};
  const dayBucketsMap = new Map<string | number, number>();
  const timeBucketsMap: Map<number, Record<CountryWithTotal, number>> = new Map();
  const dowBucketsMap = new Map<number, number>();
  const groupMap: { [region: string]: string[] } = {
    "41110": ["41111", "41113", "41115", "41117"],
    "41130": ["41131", "41133", "41135"],
    "41170": ["41171", "41173"],
    "41190": ["41192", "41194", "41196"],
    "41270": ["41271", "41273"],
    "41280": ["41281", "41285", "41287"],
    "41460": ["41461", "41463", "41465"]
  }
  

  regionArray.forEach((region) => {
    if (category === "alp_forn" && unionArray.includes(region)) {
      let avg_value = 0;
      let tot_value = 0;
      countryList.forEach((country) => {
        countrySum[country] = 0;
      });

      for (const item of data) {
        const key = item.key.toString();
        if (groupMap[region].includes(key)) {
          avg_value += item.tot_avg.value;
          tot_value += item.tot_sum.value;
          countryList.forEach((country) => {
            countrySum[country] += item[country]?.value || 0;
          })
        }
      }

      for (const item of data) {
        const key = item.key.toString();
        if (groupMap[region].includes(key)) {
          const dayBucket = item.by_day.buckets || [];
          const timeBucket = item.by_timezn.buckets || [];
          const dowBucket = item.by_dow.buckets || [];

          dayBucket.forEach((bucket: any) => {
            const tmst_key = bucket.key;
            const pop_value = bucket.pop_by_day.value;

            if (dayBucketsMap.has(tmst_key)) {
              dayBucketsMap.set(tmst_key, dayBucketsMap.get(tmst_key)! + pop_value);
            } else {
              dayBucketsMap.set(tmst_key, pop_value);
            }
          });

          timeBucket.forEach((bucket: any) => {
            const time_key: number = bucket.key;
            const existing = timeBucketsMap.get(time_key) || {} as Record<CountryWithTotal, number>;
            let total_value = 0;

            countryList.forEach((country) => {
              const curValue = bucket[country]?.value || 0;
              existing[country] = (existing[country] || 0) + curValue;
              total_value += curValue;
            });

            existing["total"] = (existing["total"] || 0) + total_value;
            timeBucketsMap.set(time_key, existing)
          });

          dowBucket.forEach((bucket: any) => {
            const dow_key = bucket.key;
            const pop_value = bucket.pop_by_dow.value;

            if (dowBucketsMap.has(dow_key)) {
              dowBucketsMap.set(dow_key, dowBucketsMap.get(dow_key)! + pop_value)
            } else {
              dowBucketsMap.set(dow_key, pop_value)
            }
          });
        }
      }

      const dayBuckets = Array.from(dayBucketsMap.entries())
            .map(([key, value]) => ({ key, key_as_string: new Date(key).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
          }).replace(/\.\s?/g, "") , pop_by_day: { value } }));
      const timeBuckets = Array.from(timeBucketsMap.entries())
            .map(([timeKey, countryValues]) => ({
              key: timeKey,
              ...Object.fromEntries([
                ...countryList.map((country) => [
                  country,
                  { value: countryValues[country as CountryCode] }
                ]),
                ["total", { value : countryValues.total || 0 }]
              ])
            })
          );
      const dowBuckets = Array.from(dowBucketsMap.entries())
            .map(([key,  value]) => ({
              key,
              pop_by_dow: { value }
            }));

      result.push({
        key: parseInt(region),
        tot_avg: { value : avg_value },
        tot_sum: { value: tot_value },
        ...Object.fromEntries(
          countryList.map((country) => [country, { value: countrySum[country] }])
        ),
        by_day: {
          buckets: dayBuckets
        },
        by_timezn: {
          buckets:timeBuckets
        },
        by_dow: {
          buckets: dowBuckets
        }
      })
    } else if (category === "alp_forn" && !unionArray.includes(region)) {
      result = data;
    }
  });
  return result
}

export async function mergeUnionBySubzone(
  regionArray: string[],
  data: any,
  category?: string
) {
  let result: any = [];
  const timeznMap: Record<number, Record<string, number>> = {};

  regionArray.forEach((region) => {
    if (unionArray.includes(region)) {
      for (const item of data) {
        const regionKey = item.key.toString();
        const timeBuckets = item.by_timezn?.buckets || [];

        timeBuckets.forEach((bucket: any) => {
          const time = bucket.key;
          const subzoneBuckets = bucket.by_subzone?.buckets || [];

          subzoneBuckets.forEach((bucket: any) => {
            const subzoneKey = bucket.key.toString();
            const shortKey = subzoneKey.slice(0, 5);
            if (shortKey === regionKey) {
              const value = bucket.total?.value || 0;
              
              if (!timeznMap[time]) timeznMap[time] = {};
              timeznMap[time][shortKey] = (timeznMap[time][shortKey] || 0) + value;
            } 
          })
        })
      }
      const timeznBuckets = Object.entries(timeznMap).map(([time, subzones]) => ({
        key: Number(time),
        by_subzone: {
          buckets: Object.entries(subzones).map(([key, value]) => ({
            key: Number(key),
            total: { value }
          }))
        }
      }));

      result.push({
        key: Number(region),
        by_timezn: {
          buckets: timeznBuckets
        }
      })

    } else {
      result = data;
    }
  })
  return result
}

export async function mergeUnionByAlpCompareForn(
  regionArray: string[],
  data: any,
  category?: string
) {
  let result: any = [];

  regionArray.forEach((region => {
    if (region.length === 5 && unionArray.includes(region)) {
      const present_value = data.reduce((sum: number, item: any) => sum + item.by_start.pop_by_start.value, 0)
      const last_value = data.reduce((sum: number, item: any) => sum + item.by_lastYear.pop_by_lastYear.value, 0)
      const prev_value = data.reduce((sum: number, item: any) => sum + item.by_prevMonth.pop_by_prevMonth.value, 0)
  
      result.push({
        key: parseInt(region),
        by_prevMonth: { pop_by_prevMonth: { value: present_value }},
        by_lastYear: { pop_by_lastYear: { value: last_value }},
        by_start: { pop_by_start: { value: prev_value }}
      })
    } else {
      result = data;
    }

  }))

  return result;
}

export async function mergeUnionByDashRank(
  data: any,
  region: string
) {
  let result: any = [];
  let temp: any = [];
  const valueMap = new Map<number, number>();
  const totalValue = new Map<number, number>();
  const checkOD = data.aggregations.by_detina
  let sumValue = 0;
  let cnt = 0;
  let tot_value = 0;

  if (checkOD) {
    const bucket = data.aggregations.by_detina.buckets || [];

    for (const item of bucket) {
      const rankBucket = item.by_pdepar.buckets || [];
      tot_value = item.tot_popul_num.value;

      for (const item of rankBucket) {
        const key = item.key;
        const value = item.pdepar_tot_popul_num.value;
        if (valueMap.has(key)) {
          sumValue = valueMap.get(key) + value
          valueMap.set(key, sumValue)
        } else {
          valueMap.set(key, value)
        }
      }
    }
    const sortMap = [...valueMap.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, value] of sortMap) {
      if (cnt < 5) {
        temp.push({
          key: key,
          pdepar_tot_popul_num: { value: value }
        })
        cnt++;
      }
    }
    result.push({
      aggregations: {
        by_detina: {
          buckets: [
            {
              key: parseInt(region),
              tot_popul_num: { value : tot_value },
              by_pdepar: {
                buckets: temp
              }
            }
          ]
        }
      }
    })
  } else {
    const bucket = data.aggregations.by_pdepar.buckets || [];
    
    for (const item of bucket) {
      const rankBucket = item.by_detina.buckets || [];
      tot_value = item.tot_popul_num.value;

      for (const item of rankBucket) {
        const key = item.key;
        const value = item.detina_tot_popul_num.value;
        if (valueMap.has(key)) {
          sumValue = valueMap.get(key) + value
          valueMap.set(key, sumValue)
        } else {
          valueMap.set(key, value)
        }
      }
    }
    const sortMap = [...valueMap.entries()].sort((a, b) => b[1] - a[1]);
    for (const [key, value] of sortMap) {
      if (cnt < 5) {
        temp.push({
          key: key,
          detina_tot_popul_num: { value: value }
        })
        cnt++;
      }
    }
    result.push({
      aggregations: {
        by_pdepar: {
          buckets: [
            {
              key: parseInt(region),
              tot_popul_num: { value : tot_value },
              by_detina: {
                buckets: temp
              }
            }
          ]
        }
      }
    })
  }
  return result;
}

export async function mergeUnionByDashCompareMOP(
  data: any,
  region: string,
  typeValue?: string
) {
  let result: any = [];
  let dow: any = [];
  let time: any = [];
  let prps: any = [];
  let way: any = [];
  const total_dowvalue = new Map<number, number>();
  const total_timevalue = new Map<number, number>();
  const ageSums: Record<string, number> = {};
  const prps_ageSums: Record<string, number> = {};
  const prps_value = new Map<number, number>();
  const way_value = new Map<number, number>();
  let sumValue = 0;
  let timeValue = 0;
  let week_value = 0;
  let weekend_value = 0;
  let men = 0;
  let women = 0;

  if (typeValue === "mopout_report" || typeValue === "mopin_report") {
    let cur_value = 0;
    let prev_value = 0;
    let last_value = 0;
    data.forEach((item: any) => {
      const curValue = item?.present.tot_popul_num.value || 0;
      const prevValue = item?.prev.tot_popul_num.value || 0;
      const lastValue = item?.last.tot_popul_num.value || 0;

      cur_value += curValue;
      prev_value += prevValue;
      last_value += lastValue;
    });

    result.push({
      key: Number(region),
      last: { tot_popul_num: { value: last_value }},
      prev: { tot_popul_num: { value: prev_value }},
      present: { tot_popul_num: { value: cur_value }}
    });
  } else if (typeValue === "day_report") {
    const regionBuckets = data.aggregations.by_region.buckets || [];

    regionBuckets.forEach((bucket: any) => {
      const dowBuckets = bucket.by_dow.buckets || [];
      week_value += bucket.by_holiday.buckets.weekday.tot_sum.value;
      weekend_value += bucket.by_holiday.buckets.weekend.tot_sum.value;

      dowBuckets.forEach((bucket: any) =>{
        const key = bucket.key
        const value = bucket.tot_sum.value

        if (total_dowvalue.has(key)) {
          sumValue = total_dowvalue.get(key) + value
          total_dowvalue.set(key, sumValue);
        } else {
          total_dowvalue.set(key, value);
        }
      });
    });
    const dowMap = [...total_dowvalue.entries()]
    for (const [key, value] of dowMap) {
      dow.push({
        key: key,
        tot_sum: { value: value}
      });
    }

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_dow: {
                buckets: dow
              },
              by_holiday: {
                buckets: {
                  weekday: { tot_sum: { value : week_value } },
                  weekend: { tot_sum: { value : weekend_value } }
                }
              }
            }
          ]
        }
      }
    })
  } else if (typeValue === "time_report") {
    const regionBuckets = data.aggregations.by_region.buckets || [];
    
    regionBuckets.forEach((bucket: any) => {
      const timeBuckets = bucket.by_timezn.buckets || [];

      timeBuckets.forEach((bucket: any) => {
        const key = bucket.key
        const value = bucket.tot_popul_num.value

        if (total_timevalue.has(key)) {
          timeValue = total_timevalue.get(key) + value
          total_timevalue.set(key, timeValue)
        } else {
          total_timevalue.set(key, value);
        }
      });
    });
    const timeMap = [...total_timevalue.entries()]
    for (const [key, value] of timeMap) {
      time.push({
        key: key,
        tot_popul_num: { value: value}
      });
    }

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_timezn: {
                buckets: time
              }
            }
          ]
        }
      }
    });
  } else if (typeValue === "age_report") {
    const ageBuckets = data.aggregations.by_region.buckets || [];

    ageBuckets.forEach((bucket: any) => {
      men += bucket.male.value;
      women += bucket.female.value;

      const ageGroups = bucket.age_groups.value || {};
      for (const [ageGroup, value] of Object.entries(ageGroups)) {
        ageSums[ageGroup] = (ageSums[ageGroup] || 0) + (value as number);
      }
    });

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              age_groups: {
                value: ageSums
              },
              female: { value: women },
              male: { value : men }
            }
          ]
        }
      }
    });
  } else if (typeValue === "prps_report") {
    const regionBucket = data.aggregations.by_region.buckets || [];

    regionBucket.forEach((bucket: any) => {
      const prpsBucket = bucket.by_prps.buckets || [];

      prpsBucket.forEach((bucket: any) => {
        const key = bucket.key;
        const value = bucket.tot_popul_num.value;
  
        if (prps_value.has(key)) {
          sumValue = prps_value.get(key) + value
          prps_value.set(key, sumValue);
        } else {
          prps_value.set(key, value);
        }
      });
    });

    const prpsMap = [...prps_value.entries()]
    for (const [key, value] of prpsMap) {
      prps.push({
        key: key,
        tot_popul_num: { value: value}
      });
    }

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_prps: {
                buckets: prps
              }
            }
          ]
        }
      }
    });
  } else if (typeValue === "prps_time_report" || typeValue === "way_time_report") {
    interface TimeBucket {
      key: number;
      [field: string]: { value: number } | number; 
    }
    const regionBucket = data.aggregations.by_region.buckets || [];
    const timeBucketsMap: Record<number, Record<string, { value: number}>> = {};

    regionBucket.forEach((bucket: any) => {
      (bucket.by_timezn.buckets || []).forEach((timeBucket: TimeBucket) => {
        const timeKey = timeBucket.key;
        if (!timeBucketsMap[timeKey]) {
          timeBucketsMap[timeKey] = {};
        }

        Object.keys(timeBucket).forEach((field) => {
          if (field !== "key") {
            const fieldValue = (timeBucket[field] as { value : number}).value || 0;

            if (!timeBucketsMap[timeKey][field]) {
              timeBucketsMap[timeKey][field] ={ value: 0 };
            }
            timeBucketsMap[timeKey][field].value += fieldValue;
          }
        })
      });
    });

    const timeBucketsArray: TimeBucket[] = Object.entries(timeBucketsMap).map(([timeKey, fields]) => ({
      key: Number(timeKey),
      ...fields
    }));

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_timezn: {
                buckets: timeBucketsArray,
              }
            }
          ]
        }
      }
    })
  } else if (typeValue === "sex_report") {
    interface PrpsBucket {
      key: number;
      [field: string]: { value: number } | number;
    }
    const regionBucket = data.aggregations.by_region.buckets || [];
    const prpsBucketsMap: Record<number, Record<string, { value: number}>> = {};

    regionBucket.forEach((bucket: any) => {
      (bucket.by_prps.buckets || []).forEach((prpsBucket: PrpsBucket) => {
        const prpsKey = prpsBucket.key;
        if (!prpsBucketsMap[prpsKey]) {
          prpsBucketsMap[prpsKey] = {};
        }

        Object.keys(prpsBucket).forEach((field) => {
          if (field !== "key") {
            const fieldValue = (prpsBucket[field] as { value : number}).value || 0;

            if (!prpsBucketsMap[prpsKey][field]) {
              prpsBucketsMap[prpsKey][field] = { value: 0};
            }
            prpsBucketsMap[prpsKey][field].value += fieldValue;
          }
        });
      });
    });

    const prpsBucketsArray: PrpsBucket[] = Object.entries(prpsBucketsMap).map(([prpsKey, fields]) => ({
      key: Number(prpsKey),
      ...fields
    }));
    
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_prps: {
                buckets: prpsBucketsArray,
              }
            }
          ]
        }
      }
    })
  } else if (typeValue === "sex_age_report") {
    interface AgeGroups {
      [ageGroup: string]: number;
    }
    const tempResult: Record<number, AgeGroups> = {};
    const regionBuckets = data.aggregations.by_region.buckets || [];

    regionBuckets.forEach((bucket: any) => {
      const prpsBuckets = bucket.by_prps.buckets || [];

      prpsBuckets.forEach((item: any) => {
        const prpsKey = item.key;
        const ageGroups = item.age_groups.value || {};

        if (!tempResult[prpsKey]) {
          tempResult[prpsKey] = {};
        }

        for (const [ageGroup, value] of Object.entries(ageGroups)) {
          tempResult[prpsKey][ageGroup] = (tempResult[prpsKey][ageGroup] || 0) + (value as number);
        }
      });
    });

    const prpsBucketsArray = Object.entries(tempResult).map(([key, ageGroups]) => ({
      key: Number(key),
      age_groups: {
        value: ageGroups,
      }
    }));
    
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_prps: {
                buckets: prpsBucketsArray,
              }
            }
          ]
        }
      }
    });
  } else if (typeValue === "way_report") {
    const regionBucket = data.aggregations.by_region.buckets || [];

    regionBucket.forEach((bucket: any) => {
      const wayBucket = bucket.by_way.buckets || [];

      wayBucket.forEach((bucket: any) => {
        const key = bucket.key;
        const value = bucket.tot_popul_num.value;
  
        if (way_value.has(key)) {
          sumValue = way_value.get(key) + value
          way_value.set(key, sumValue);
        } else {
          way_value.set(key, value);
        }
      });
    });

    const wayMap = [...way_value.entries()]
    for (const [key, value] of wayMap) {
      way.push({
        key: key,
        tot_popul_num: { value: value}
      });
    }

    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_way: {
                buckets: way
              }
            }
          ]
        }
      }
    });
  } else if (typeValue === "way_sex_age_report") {
    interface AgeGroups {
      [ageGroup: string]: number;
    }
    const tempResult: Record<number, AgeGroups> = {};
    const regionBuckets = data.aggregations.by_region.buckets || [];

    regionBuckets.forEach((bucket: any) => {
      const wayBuckets = bucket.by_way.buckets || [];

      wayBuckets.forEach((item: any) => {
        const wayKey = item.key;
        const ageGroups = item.age_groups.value || {};

        if (!tempResult[wayKey]) {
          tempResult[wayKey] = {};
        }

        for (const [ageGroup, value] of Object.entries(ageGroups)) {
          tempResult[wayKey][ageGroup] = (tempResult[wayKey][ageGroup] || 0) + (value as number);
        }
      });
    });

    const wayBucketsArray = Object.entries(tempResult).map(([key, ageGroups]) => ({
      key: Number(key),
      age_groups: {
        value: ageGroups,
      }
    }));
    
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_way: {
                buckets: wayBucketsArray,
              }
            }
          ]
        }
      }
    });
  } else if (typeValue === "way_sex_report") {
    interface WayBucket {
      key: number;
      [field: string]: { value: number } | number;
    }
    const regionBucket = data.aggregations.by_region.buckets || [];
    const wayBucketsMap: Record<number, Record<string, { value: number}>> = {};

    regionBucket.forEach((bucket: any) => {
      (bucket.by_way.buckets || []).forEach((wayBucket: WayBucket) => {
        const wayKey = wayBucket.key;
        if (!wayBucketsMap[wayKey]) {
          wayBucketsMap[wayKey] = {};
        }

        Object.keys(wayBucket).forEach((field) => {
          if (field !== "key") {
            const fieldValue = (wayBucket[field] as { value : number}).value || 0;

            if (!wayBucketsMap[wayKey][field]) {
              wayBucketsMap[wayKey][field] = { value: 0};
            }
            wayBucketsMap[wayKey][field].value += fieldValue;
          }
        });
      });
    });

    const wayBucketsArray: WayBucket[] = Object.entries(wayBucketsMap).map(([wayKey, fields]) => ({
      key: Number(wayKey),
      ...fields
    }));
    
    result.push({
      aggregations: {
        by_region: {
          buckets: [
            {
              key: Number(region),
              by_way: {
                buckets: wayBucketsArray,
              }
            }
          ]
        }
      }
    });
  }
  return result;
}
const ageReduceValue = (data:any) => {
  const f50_value = data.reduce((sum: number, item: any) => sum + item.f50.value, 0);
  const f30_value = data.reduce((sum: number, item: any) => sum + item.f30.value, 0);
  const f10_value = data.reduce((sum: number, item: any) => sum + item.f10.value, 0);
  const f75_value = data.reduce((sum: number, item: any) => sum + item.f75.value, 0);
  const f55_value = data.reduce((sum: number, item: any) => sum + item.f55.value, 0);
  const m70_value = data.reduce((sum: number, item: any) => sum + item.m70.value, 0);
  const f35_value = data.reduce((sum: number, item: any) => sum + item.f35.value, 0);
  const f45_value = data.reduce((sum: number, item: any) => sum + item.f45.value, 0);
  const m50_value = data.reduce((sum: number, item: any) => sum + item.m50.value, 0);
  const m75_value = data.reduce((sum: number, item: any) => sum + item.m75.value, 0);
  const f15_value = data.reduce((sum: number, item: any) => sum + item.f15.value, 0);
  const m30_value = data.reduce((sum: number, item: any) => sum + item.m30.value, 0);
  const m55_value = data.reduce((sum: number, item: any) => sum + item.m55.value, 0);
  const m10_value = data.reduce((sum: number, item: any) => sum + item.m10.value, 0);
  const m35_value = data.reduce((sum: number, item: any) => sum + item.m35.value, 0);
  const m15_value = data.reduce((sum: number, item: any) => sum + item.m15.value, 0);
  const total_value = data.reduce((sum: number, item: any) => sum + item.total.value, 0);
  const total_male_value = data.reduce((sum: number, item: any) => sum + item.total_male.value, 0);
  const total_female_value = data.reduce((sum: number, item: any) => sum + item.total_female.value, 0);
  const f80_value = data.reduce((sum: number, item: any) => sum + item.f80.value, 0);
  const f60_value = data.reduce((sum: number, item: any) => sum + item.f60.value, 0);
  const f40_value = data.reduce((sum: number, item: any) => sum + item.f40.value, 0);
  const f65_value = data.reduce((sum: number, item: any) => sum + item.f65.value, 0);
  const m80_value = data.reduce((sum: number, item: any) => sum + item.m80.value, 0);
  const f20_value = data.reduce((sum: number, item: any) => sum + item.f20.value, 0);
  const m60_value = data.reduce((sum: number, item: any) => sum + item.m60.value, 0);
  const f25_value = data.reduce((sum: number, item: any) => sum + item.f25.value, 0);
  const m40_value = data.reduce((sum: number, item: any) => sum + item.m40.value, 0);
  const m20_value = data.reduce((sum: number, item: any) => sum + item.m20.value, 0);
  const m65_value = data.reduce((sum: number, item: any) => sum + item.m65.value, 0);
  const m45_value = data.reduce((sum: number, item: any) => sum + item.m45.value, 0);
  const m25_value = data.reduce((sum: number, item: any) => sum + item.m25.value, 0);
  const f70_value = data.reduce((sum: number, item: any) => sum + item.f70.value, 0);

  return {
    f10: { value: f10_value}, f15: { value: f15_value}, f20: { value: f20_value}, f25: { value: f25_value}, f30: { value: f30_value}, f35: { value: f35_value}, 
    f40: { value: f40_value}, f45: { value: f45_value}, f50: { value: f50_value}, f55: { value: f55_value}, f60: { value: f60_value}, f65: { value: f65_value}, 
    f70: { value: f70_value}, f75: { value: f75_value}, f80: { value: f80_value}, m10: { value: m10_value}, m15: { value: m15_value}, m20: { value: m20_value}, 
    m25: { value: m25_value}, m30: { value: m30_value}, m35: { value: m35_value}, m40: { value: m40_value}, m45: { value: m45_value}, m50: { value: m50_value}, 
    m55: { value: m55_value}, m60: { value: m60_value}, m65: { value: m65_value}, m70: { value: m70_value}, m75: { value: m75_value}, m80: { value: m80_value}, 
    total: { value: total_value}, total_male: { value: total_male_value}, total_female: {value: total_female_value}
  }
}
const ageReduce = (data:any, name: string) => {
  const f50_value = data.reduce((sum: number, item: any) => sum + item[name].f50.value, 0);
  const f30_value = data.reduce((sum: number, item: any) => sum + item[name].f30.value, 0);
  const f10_value = data.reduce((sum: number, item: any) => sum + item[name].f10.value, 0);
  const f75_value = data.reduce((sum: number, item: any) => sum + item[name].f75.value, 0);
  const f55_value = data.reduce((sum: number, item: any) => sum + item[name].f55.value, 0);
  const m70_value = data.reduce((sum: number, item: any) => sum + item[name].m70.value, 0);
  const f35_value = data.reduce((sum: number, item: any) => sum + item[name].f35.value, 0);
  const f45_value = data.reduce((sum: number, item: any) => sum + item[name].f45.value, 0);
  const m50_value = data.reduce((sum: number, item: any) => sum + item[name].m50.value, 0);
  const m75_value = data.reduce((sum: number, item: any) => sum + item[name].m75.value, 0);
  const f15_value = data.reduce((sum: number, item: any) => sum + item[name].f15.value, 0);
  const m30_value = data.reduce((sum: number, item: any) => sum + item[name].m30.value, 0);
  const m55_value = data.reduce((sum: number, item: any) => sum + item[name].m55.value, 0);
  const m10_value = data.reduce((sum: number, item: any) => sum + item[name].m10.value, 0);
  const m35_value = data.reduce((sum: number, item: any) => sum + item[name].m35.value, 0);
  const m15_value = data.reduce((sum: number, item: any) => sum + item[name].m15.value, 0);
  const total_value = data.reduce((sum: number, item: any) => sum + item[name].total.value, 0);
  const total_male_value = data.reduce((sum: number, item: any) => sum + item[name].total_male.value, 0);
  const total_female_value = data.reduce((sum: number, item: any) => sum + item[name].total_female.value, 0);
  const f80_value = data.reduce((sum: number, item: any) => sum + item[name].f80.value, 0);
  const f60_value = data.reduce((sum: number, item: any) => sum + item[name].f60.value, 0);
  const f40_value = data.reduce((sum: number, item: any) => sum + item[name].f40.value, 0);
  const f65_value = data.reduce((sum: number, item: any) => sum + item[name].f65.value, 0);
  const m80_value = data.reduce((sum: number, item: any) => sum + item[name].m80.value, 0);
  const f20_value = data.reduce((sum: number, item: any) => sum + item[name].f20.value, 0);
  const m60_value = data.reduce((sum: number, item: any) => sum + item[name].m60.value, 0);
  const f25_value = data.reduce((sum: number, item: any) => sum + item[name].f25.value, 0);
  const m40_value = data.reduce((sum: number, item: any) => sum + item[name].m40.value, 0);
  const m20_value = data.reduce((sum: number, item: any) => sum + item[name].m20.value, 0);
  const m65_value = data.reduce((sum: number, item: any) => sum + item[name].m65.value, 0);
  const m45_value = data.reduce((sum: number, item: any) => sum + item[name].m45.value, 0);
  const m25_value = data.reduce((sum: number, item: any) => sum + item[name].m25.value, 0);
  const f70_value = data.reduce((sum: number, item: any) => sum + item[name].f70.value, 0);

  return {
    f10: { value: f10_value}, f15: { value: f15_value}, f20: { value: f20_value}, f25: { value: f25_value}, f30: { value: f30_value}, f35: { value: f35_value}, 
    f40: { value: f40_value}, f45: { value: f45_value}, f50: { value: f50_value}, f55: { value: f55_value}, f60: { value: f60_value}, f65: { value: f65_value}, 
    f70: { value: f70_value}, f75: { value: f75_value}, f80: { value: f80_value}, m10: { value: m10_value}, m15: { value: m15_value}, m20: { value: m20_value}, 
    m25: { value: m25_value}, m30: { value: m30_value}, m35: { value: m35_value}, m40: { value: m40_value}, m45: { value: m45_value}, m50: { value: m50_value}, 
    m55: { value: m55_value}, m60: { value: m60_value}, m65: { value: m65_value}, m70: { value: m70_value}, m75: { value: m75_value}, m80: { value: m80_value}, 
    total: { value: total_value}, total_male: { value: total_male_value}, total_female: {value: total_female_value}
  }
}

const ageReduceBucket = (data:any, name: string) => {
  const f50_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f50.value, 0);
  const f30_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f30.value, 0);
  const f10_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f10.value, 0);
  const f75_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f75.value, 0);
  const f55_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f55.value, 0);
  const m70_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m70.value, 0);
  const f35_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f35.value, 0);
  const f45_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f45.value, 0);
  const m50_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m50.value, 0);
  const m75_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m75.value, 0);
  const f15_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f15.value, 0);
  const m30_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m30.value, 0);
  const m55_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m55.value, 0);
  const m10_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m10.value, 0);
  const m35_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m35.value, 0);
  const m15_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m15.value, 0);
  const total_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.total.value, 0);
  const total_male_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.total_male.value, 0);
  const total_female_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.total_female.value, 0);
  const f80_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f80.value, 0);
  const f60_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f60.value, 0);
  const f40_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f40.value, 0);
  const f65_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f65.value, 0);
  const m80_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m80.value, 0);
  const f20_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f20.value, 0);
  const m60_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m60.value, 0);
  const f25_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f25.value, 0);
  const m40_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m40.value, 0);
  const m20_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m20.value, 0);
  const m65_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m65.value, 0);
  const m45_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m45.value, 0);
  const m25_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.m25.value, 0);
  const f70_value = data.reduce((sum: number, item: any) => sum + item[name].buckets.f70.value, 0);

  return {buckets: {
    f10: { value: f10_value}, f15: { value: f15_value}, f20: { value: f20_value}, f25: { value: f25_value}, f30: { value: f30_value}, f35: { value: f35_value}, 
    f40: { value: f40_value}, f45: { value: f45_value}, f50: { value: f50_value}, f55: { value: f55_value}, f60: { value: f60_value}, f65: { value: f65_value}, 
    f70: { value: f70_value}, f75: { value: f75_value}, f80: { value: f80_value}, m10: { value: m10_value}, m15: { value: m15_value}, m20: { value: m20_value}, 
    m25: { value: m25_value}, m30: { value: m30_value}, m35: { value: m35_value}, m40: { value: m40_value}, m45: { value: m45_value}, m50: { value: m50_value}, 
    m55: { value: m55_value}, m60: { value: m60_value}, m65: { value: m65_value}, m70: { value: m70_value}, m75: { value: m75_value}, m80: { value: m80_value}, 
    total: { value: total_value}, total_male: { value: total_male_value}, total_female: {value: total_female_value}
  }}
}