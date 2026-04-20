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
export function sortStatSummary(
  data: StatSummariesObj[],
  desiredOrder: string[]
): any[] {
  return data.map((region) => {
    const { regionName, data } = region;

    return {
      regionName,
      data: {
        Avg: desiredOrder.map((key) => data.Avg[key] || "-"),
        Sum: desiredOrder.map((key) => data.Sum[key] || "-"),
        Unique: desiredOrder.map((key) => data.Unique[key] || "-"),
      },
    };
  });
}

export function mergeAndSortStatSummaries(
  data: StatSummariesObj[],
  desiredOrder: string[],
  isMonth: boolean
): any[] {
  // Group data by regionName
  const groupedData = data.reduce((acc, region) => {
    const { regionName, data } = region;
    if (!acc[regionName]) {
      acc[regionName] = { Avg: {}, Sum: {}, Unique: {} };
    }

    // Merge Avg, Sum, and Unique data
    ["Avg", "Sum", "Unique"].forEach((type) => {
      data[type] &&
        Object.entries(data[type]).forEach(([key, value]) => {
          acc[regionName][type][key] = value;
        });
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert grouped data into sorted array format
  return Object.entries(groupedData).map(([regionName, data]) => ({
    regionName,
    data: {
      Avg: desiredOrder.map((key) => data.Avg[key] || "-"),
      Sum: desiredOrder.map((key) => data.Sum[key] || "-"),
      ...(isMonth
        ? { Unique: desiredOrder.map((key) => data.Unique[key] || "-") }
        : {}),
    },
  }));
}
export function mergeAndSortStatSummary(
  data: StatSummaryObj[],
  desiredOrder: string[]
): any[] {
  // Group data by regionName
  const groupedData = data.reduce((acc, region) => {
    const { regionName, data } = region;
    if (!acc[regionName]) {
      acc[regionName] = {};
    }

    Object.entries(data).forEach(([key, value]) => {
      acc[regionName][key] = value;
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert grouped data into desired format
  return Object.entries(groupedData).map(([regionName, data]) => ({
    regionName,
    data: desiredOrder.map((key) => data[key] || "-"),
  }));
}
export function mergeAndSortKeyStatSummary(
  data: { [key: string]: StatSummaryObj[] }[] | StatSummaryObj[],
  desiredOrder: string[]
): any[] {
  const resultMap: Map<string, { Avg: string[]; Unique: string[] }> = new Map();

  data.forEach((category) => {
    if (category.hasOwnProperty("regionName")) {
      if (!resultMap.has((category as StatSummaryObj).regionName)) {
        resultMap.set((category as StatSummaryObj).regionName, {
          Avg: new Array(desiredOrder.length).fill("-"),
          Unique: new Array(desiredOrder.length).fill("-"),
        });
      }
      const regionData = resultMap.get(
        (category as StatSummaryObj).regionName
      )!;

      desiredOrder.forEach((k, index) => {
        if ((category as StatSummaryObj).data[k] !== undefined) {
          regionData["Avg"][index] = (category as StatSummaryObj).data[k];
        }
      });
    } else
      Object.entries(category as { [key: string]: StatSummaryObj[] }).forEach(
        ([key, value]) => {
          value.forEach(({ regionName, data }) => {
            if (!resultMap.has(regionName)) {
              resultMap.set(regionName, {
                Avg: new Array(desiredOrder.length).fill("-"),
                Unique: new Array(desiredOrder.length).fill("-"),
              });
            }
            const regionData = resultMap.get(regionName)!;

            desiredOrder.forEach((k, index) => {
              if (data[k] !== undefined) {
                regionData[key as "Avg" | "Unique"][index] = data[k];
              }
            });
          });
        }
      );
  });

  return Array.from(resultMap, ([regionName, data]) => ({ regionName, data }));
}
