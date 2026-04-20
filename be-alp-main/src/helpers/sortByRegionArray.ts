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

export function sortByRegionArray(regionArray: string[], dataArray: any[]) {
  return regionArray.map((regionKey) => {
    const foundItem = dataArray.find(
      (item) =>
        (typeof item.key === "number" ? item.key.toString() : item.key) ===
        regionKey
    );
    return foundItem || { key: regionKey };
  });
}

export function sortByRegionKeys(regionArray: string[], dataArray: any[]) {
  return regionArray.map((regionKey) => {
    const foundItem = dataArray.find(
      (item) =>
        item.hasOwnProperty(regionKey) && item[regionKey].doc_count !== 0
    );
    if (foundItem) {
      const key = Object.keys(foundItem)[0];
      const value = foundItem[key];
      return {
        key: key,
        ...value,
      };
    } else {
      return { key: regionKey };
    }
  });
}

export function hasExtraProperties(obj: any): boolean {
  //지역 데이터 객체가 null이 아니고, object 타입인지 확인 후 key 외에 다른 속성이 있는지 확인
  return (
    typeof obj === "object" &&
    obj !== null &&
    "key" in obj &&
    Object.keys(obj).length > 1
  ); // key 외 다른 속성이 있을 때 true
}
export function getUpperRegion(region: string): string {
  if (region.length === 2) return region;
  if (region.length === 5) return region.slice(0, 2);
  if (region.length === 8) return region.slice(0, 5);
  return region; // Default case, return as is
}
