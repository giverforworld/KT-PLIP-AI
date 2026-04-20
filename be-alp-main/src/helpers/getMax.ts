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
export function findMaxTimeForKeys(data: Indicate[], keys: string[]): MaxData {
  const result: MaxData = {};

  keys.forEach((key) => {
    result[key] = { 구분: "", 최대값: -Infinity };
  });

  // Filter out "기타" from the data before processing
  const filteredData = data.filter(
    (item) =>
      item.구분 !== "기타" && keys.some((key) => typeof item[key] === "number")
  );

  // Iterate through the filtered data
  filteredData.forEach((item) => {
    const { 구분 } = item;

    keys.forEach((key) => {
      const value = item[key];

      // If the value is a number and greater than the current max, update the result
      if (typeof value === "number" && value > result[key].최대값) {
        result[key] = { 구분: 구분.toString(), 최대값: value };
      }
    });
  });
  return result;
}

export function findMaxMinForKeys(data: any, keys: string[]): MaxMinResult {
  const result: MaxMinResult = {};
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }
  keys.forEach((key) => {
    result[key] = {
      최대값: { 구분: "", 값: -Infinity },
      최소값: { 구분: "", 값: Infinity },
    };
  });

  keys.forEach((key) => {
    const filteredData = data.filter(
      (item: any) => item.구분 !== "기타" && typeof item[key] === "number"
    );

    if (filteredData.length > 0) {
      // 최대값 계산
      const maxItem = filteredData.reduce(
        (max: { [x: string]: number }, current: { [x: string]: number }) =>
          current[key] > max[key] ? current : max
      );
      result[key].최대값 = { 구분: maxItem.구분.toString(), 값: maxItem[key] };

      // 최소값 계산
      const minItem = filteredData.reduce(
        (min: { [x: string]: number }, current: { [x: string]: number }) =>
          current[key] < min[key] ? current : min
      );
      result[key].최소값 = { 구분: minItem.구분.toString(), 값: minItem[key] };
    } else {
      // "기타"만 있는 경우를 대비하여 기본 처리
      const maxItem = data.reduce(
        (max: { [x: string]: number }, current: { [x: string]: number }) =>
          current[key] > max[key] ? current : max
      );
      result[key].최대값 = { 구분: maxItem.구분.toString(), 값: maxItem[key] };

      const minItem = data.reduce(
        (min: { [x: string]: number }, current: { [x: string]: number }) =>
          current[key] < min[key] ? current : min
      );
      result[key].최소값 = { 구분: minItem.구분.toString(), 값: minItem[key] };
    }
  });

  return result;
}

export function findOverallMaxObj(data: Indicate[]): MaxObj | null {
  let maxObj: MaxObj | null = null;
  data.forEach((item) => {
    const currentHour = item.구분 as string;

    // 각 시간대의 모든 지역 인구수를 확인
    for (const [region, value] of Object.entries(item)) {
      if (region !== "구분" && typeof value === "number") {
        if (!maxObj || value > maxObj.최대값) {
          // 최대값과 관련된 정보를 갱신
          maxObj = {
            구분: currentHour,
            key: region,
            최대값: value,
          };
        }
      }
    }
  });

  return maxObj;
}

export function findMaxRegionTime(data: Indicate[]): {
  구분: string;
  시간: string;
  생활인구: number;
} {
  let maxPopulation = -Infinity;
  let result = { 구분: "", 시간: "", 생활인구: 0 };

  data.forEach((item) => {
    if ((item.생활인구 as number) > maxPopulation) {
      maxPopulation = item.생활인구 as number;
      result = {
        구분: item.구분 as string,
        시간: item.시간 as string,
        생활인구: item.생활인구 as number,
      };
    }
  });

  return result;
}

export function findMaxValue(data: NormalizedChartData[]) {
  let maxItem: { 구분: string | number; 최대값: number } = {
    구분: "",
    최대값: -Infinity,
  };

  data.forEach((item) => {
    if (item.value > maxItem.최대값) {
      maxItem = { 구분: item.key, 최대값: item.value };
    }
  });

  return maxItem;
}

export function getMaxCategoryPercentage(data: any[], keys: string[]) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }
  // 결과를 담을 객체
  const result: Record<
    string,
    { maxCategory: string | null; maxValue: number; percentage: number }
  > = {};
  const filteredData = data.filter((item: any) => item.구분 !== "기타");
  keys.forEach((key) => {
    // 키별 전체 값 합산
    const totalPopulation = filteredData.reduce(
      (sum, item) => sum + (item[key] || 0),
      0
    );

    if (totalPopulation === 0) {
      result[key] = {
        maxCategory: null,
        maxValue: 0,
        percentage: 0,
      };
      return; // 다음 키 처리
    }

    // 최대 값을 가진 항목 찾기
    let maxCategory = null;
    let maxValue = -Infinity;

    filteredData.forEach((item) => {
      const population = item[key];
      if (population > maxValue) {
        maxValue = population;
        maxCategory = item["구분"];
      }
    });

    // 비율 계산
    const percentage = ((maxValue / totalPopulation) * 100).toFixed(2);

    result[key] = {
      maxCategory,
      maxValue,
      percentage: parseFloat(percentage), // 소수점 2자리 비율
    };
  });
  return result;
}
export function findMaxKeyAndRatio(
  data: any
): { maxKey: string; ratio: number } | null {
  const { 구분, ...values } = data; // "구분" 필드를 제외

  let maxKey: string | null = null;
  let maxValue = -Infinity;
  let secondMaxKey: string | null = null;
  let secondMaxValue = -Infinity;
  let totalValue = 0;

  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "number") {
      totalValue += value;
      // 최대값 갱신
      if (value > maxValue) {
        secondMaxValue = maxValue;
        secondMaxKey = maxKey;
        maxValue = value;
        maxKey = key;
      } else if (value > secondMaxValue) {
        // 차순위 갱신
        secondMaxValue = value;
        secondMaxKey = key;
      }
    }
  }

  if (maxKey === null || totalValue === 0) {
    return null; // 유효한 값이 없는 경우
  }

  // "기타"가 최대값일 경우, 차순위 사용
  const finalKey = maxKey === "기타" ? secondMaxKey : maxKey;
  const finalValue = maxKey === "기타" ? secondMaxValue : maxValue;
  const ratio = (finalValue / totalValue) * 100;

  return { maxKey: finalKey || "", ratio };
}
export function getMaxKeyPerDiv(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }

  const result: Record<string, string> = {};

  data.forEach((region) => {
    const { 구분, ...values } = region; // 지역 이름과 값 분리

    // 최대값과 차순위값 추적
    let maxKey: string | null = null;
    let maxValue = -Infinity;
    let secondMaxKey = null;
    let secondMaxValue = -Infinity;

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "number") {
        if (value > maxValue) {
          // 현재 값이 최대값보다 크면 최대값을 갱신하고 이전 최대값을 차순위로 이동
          secondMaxValue = maxValue;
          secondMaxKey = maxKey;
          maxValue = value;
          maxKey = key;
        } else if (value > secondMaxValue) {
          // 현재 값이 차순위값보다 크면 차순위값 갱신
          secondMaxValue = value;
          secondMaxKey = key;
        }
      }
    });

    // '기타'인 경우 차순위 키를 사용
    result[구분] =
      maxKey === "기타"
        ? secondMaxValue !== 0
          ? secondMaxKey!
          : maxKey
        : maxKey!;
  });

  return result;
}
export function getMaxCategoryDate(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }

  let maxCategory: string = ""; // 최다 이동 목적
  let maxCategorySum: number = -Infinity; // 최다 이동 목적의 총 합
  let maxDate: string = ""; // 해당 이동 목적에서 가장 큰 값이 나온 날짜
  let maxValue: number = -Infinity; // 해당 날짜에서의 최대값

  // 각 이동 목적별로 합산을 계산
  const purposeSums: Record<string, number> = {};

  data.forEach((entry) => {
    const { 구분, ...values } = entry;

    // 각 목적에 대해 값을 더해줍니다.
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "number") {
        // 이동 목적별 합산
        if (!purposeSums[key]) {
          purposeSums[key] = 0;
        }
        purposeSums[key] += value;
      }
    });
  });
  const sortedEntries = Object.entries(purposeSums).sort(
    ([, totalA], [, totalB]) => totalB - totalA
  );
  for (let [purpose, total] of sortedEntries) {
    if (purpose === "기타") {
      continue;
    }
    maxCategory = purpose;
    maxCategorySum = total;
    break;
  }

  // 가장 큰 합을 가지는 이동 목적 찾기
  // Object.entries(purposeSums).forEach(([purpose, total]) => {
  //   if (total > maxCategorySum) {
  //     maxCategorySum = total;
  //     maxCategory = purpose;
  //   }
  // });

  // 가장 큰 합을 가진 이동 목적의 경우, 해당 목적에 대해 가장 큰 값을 가진 날짜 찾기
  data.forEach((entry) => {
    const { 구분, ...values } = entry;

    // 해당 이동 목적에 대해서만 비교
    const value = values[maxCategory];
    if (typeof value === "number" && value > maxValue) {
      maxValue = value;
      maxDate = 구분;
    }
  });

  return {
    maxCategory, // 최다 이동 목적
    maxDate, // 해당 이동 목적에서 가장 큰 값을 가진 날짜
    maxValue, // 해당 날짜에서의 최대값
    maxCategorySum, // 최다 이동 목적의 총합
  };
}
export function getMaxCategoryKey(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }
  let maxSumValue = -Infinity;
  let maxCategory = "";
  let maxCategoryKey: string = ""; // 명확하게 string 타입 지정

  if (data[0].구분?.length === 1) {
    const sumOfValue = (obj: any) => {
      return Object.keys(obj).reduce((acc, key) => {
        if (key !== "구분" && key !== "기타") {
          acc += obj[key];
        }
        return acc;
      }, 0);
    };
    const findLargest = (data: any) => {
      let maxSum = 0;
      let maxDivision = "";
      data.forEach((item: any) => {
        const sum = sumOfValue(item);
        if (sum > maxSum) {
          maxSum = sum;
          maxDivision = item["구분"];
        }
      });
      return maxDivision;
    };
    maxCategoryKey = findLargest(data);
  }

  const purposeSums: Record<string, number> = {};

  // 각 날짜에 대해 '구분'을 제외한 값들의 합을 계산
  data.forEach((entry) => {
    const { 구분, ...values }: { [key: string]: number } = entry; // 구분 제외한 데이터 추출
    // Object.entries(values).forEach(([key, value]) => {
    //   if (typeof value === "number") {
    //     // 이동 목적별 합산
    //     if (!purposeSums[key]) {
    //       purposeSums[key] = 0;
    //     }
    //     purposeSums[key] += value;
    //   }
    // });
    // const sortedEntries = Object.entries(purposeSums).
    // sort(([, totalA], [, totalB]) => totalB - totalA);
    // for (let [purpose, total] of sortedEntries) {
    //   if (purpose === '기타') { continue; }
    //   maxCategory = purpose;
    //   maxSumValue = total;
    //   break;
    // }
    const sum = Object.values(values).reduce((total, value) => {
      if (typeof value === "number") {
        total += value;
      }
      return total;
    }, 0);

    // 합산된 값이 기존의 최대 합보다 큰 경우
    if (sum > maxSumValue) {
      maxSumValue = sum;
      maxCategoryKey = 구분 as unknown as string; // 구분이 string임을 확실히 타입을 지정

      // 각 키에서 최대값을 찾아 해당하는 키 저장
      // 최대값과 차순위값 추적
      let maxKey: string = "";
      let maxValue = -Infinity;
      let secondMaxKey = null;
      let secondMaxValue = -Infinity;

      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === "number") {
          if (value > maxValue) {
            // 현재 값이 최대값보다 크면 최대값을 갱신하고 이전 최대값을 차순위로 이동
            secondMaxValue = maxValue;
            secondMaxKey = maxKey;
            maxValue = value;
            maxKey = key;
          } else if (value > secondMaxValue) {
            // 현재 값이 차순위값보다 크면 차순위값 갱신
            secondMaxValue = value;
            secondMaxKey = key;
          }
        }
      });

      // '기타'인 경우 차순위 키를 사용
      maxKey =
        maxKey === "기타"
          ? secondMaxValue !== 0
            ? secondMaxKey!
            : maxKey
          : maxKey!;

      // 최대값을 가지는 키와 값 기록
      maxCategory = maxKey;
    }
  });

  // 결과 반환
  return {
    maxCategory,
    maxCategoryKey,
  };
}

interface MaxObj {
  구분: string;
  key: string;
  최대값: number;
}
interface MaxData {
  [key: string]: { 구분: string; 최대값: number };
}
type MaxMinResult = {
  [key: string]: {
    최대값: { 구분: string; 값: number };
    최소값: { 구분: string; 값: number };
  };
};
type DataItem = { key: number; value: number };
// 상위 10개 국가 추출 함수
export function getTop10Countries(byTimezn: any): string[] {
  const countryTotals: { [key: string]: number } = {};

  // 전체 시간대에서 국가별 총 인구 수 합산
  byTimezn.buckets.forEach((bucket: any) => {
    Object.entries(bucket.by_timezn_country_sums.value).forEach(
      ([country, value]) => {
        if (country !== "TOT_POPUL_NUM") {
          countryTotals[country] =
            (countryTotals[country] || 0) + (value as number);
        }
      }
    );
  });

  // 인구 수 기준으로 상위 10개 국가 추출
  return Object.entries(countryTotals)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, 10)
    .map(([country]) => country);
}
export function getAgeGroupWithHighestRatio(
  data: any[],
  legend: string
): {
  ageGroup: string;
  ratio: number;
} {
  // 연령대별 그룹화
  const ageGroups: { [key: string]: string[] } = {
    "10세 미만": ["10세 미만"],
    "10대": ["10~14세", "15~19세"],
    "20대": ["20~24세", "25~29세"],
    "30대": ["30~34세", "35~39세"],
    "40대": ["40~44세", "45~49세"],
    "50대": ["50~54세", "55~59세"],
    "60대": ["60~64세", "65~69세"],
    "70대": ["70~74세", "75~79세"],
    "80세 이상": ["80세 이상"],
  };

  // 전체 유입인구 계산
  const total = data.reduce((sum, entry) => sum + entry[legend], 0);
  // 각 연령대별 유입인구 합 계산
  const ageGroupTotals: Record<string, number> = {};

  for (const ageGroup in ageGroups) {
    ageGroupTotals[ageGroup] = data
      .filter((entry) => ageGroups[ageGroup].includes(entry["구분"]))
      .reduce((sum, entry) => sum + entry[legend], 0);
  }

  // 각 연령대의 비율 계산
  const ageGroupRatios = Object.entries(ageGroupTotals).map(
    ([ageGroup, totalForGroup]) => {
      const ratio = ((totalForGroup / total) * 100).toFixed(2); // 비율 계산
      return { ageGroup, ratio: parseFloat(ratio) };
    }
  );

  // 가장 높은 비율 찾기
  const highestRatio = ageGroupRatios.reduce((max, entry) =>
    entry.ratio > max.ratio ? entry : max
  );

  return highestRatio;
}
export function getMaxAgeGroupWithMaxCategory(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "Invalid data: Please provide a non-empty array of objects."
    );
  }

  // 연령대별 그룹화
  const ageGroups: { [key: string]: string[] } = {
    "10세 미만": ["10세 미만"],
    "10대": ["10~14세", "15~19세"],
    "20대": ["20~24세", "25~29세"],
    "30대": ["30~34세", "35~39세"],
    "40대": ["40~44세", "45~49세"],
    "50대": ["50~54세", "55~59세"],
    "60대": ["60~64세", "65~69세"],
    "70대": ["70~74세", "75~79세"],
    "80세 이상": ["80세 이상"],
  };

  // 연령대별 데이터 저장
  const ageGroupData: { [key: string]: { [key: string]: number } } = {};

  // 각 항목의 합산값을 계산하고 연령대별 데이터 생성
  data.forEach((entry) => {
    const { 구분, ...values } = entry;

    // 해당 구분이 속한 연령대를 찾음
    for (const [ageGroup, groupKeys] of Object.entries(ageGroups)) {
      if (groupKeys.includes(구분)) {
        if (!ageGroupData[ageGroup]) {
          ageGroupData[ageGroup] = {};
        }

        // 값을 합산하여 연령대별 데이터에 저장
        for (const [key, value] of Object.entries(values)) {
          if (typeof value === "number") {
            ageGroupData[ageGroup][key] =
              (ageGroupData[ageGroup][key] || 0) + value;
          }
        }
        break;
      }
    }
  });

  // 최다 연령대와 해당 연령대의 최대 카테고리 찾기
  let maxAgeGroup = "";
  let maxSumValue = -Infinity;
  let maxCategory = "";
  let temp = -Infinity;
  let localMaxValue = -Infinity;
  for (const [ageGroup, values] of Object.entries(ageGroupData)) {
    const totalSum = Object.values(values).reduce((sum, val) => sum + val, 0);
    if (totalSum > maxSumValue) {
      maxSumValue = totalSum;
      maxAgeGroup = ageGroup;
      // 해당 연령대에서 최대값을 가지는 카테고리 찾기
      // 기타이면 차순위로
      for (const [key, value] of Object.entries(values)) {
        if (value > temp && key !== '기타') {
          localMaxValue = value;
          maxCategory = key;
          temp = value;
        } else if (value > temp && key !== '기타') {
          temp = value;
        }
      }
    } else {
      maxSumValue = totalSum;
    }
  }
  
  // 결과 반환
  return {
    maxAgeGroup,
    maxSumValue,
    maxCategory,
  };
}

export function findMaxKeyValue(data: Record<string, any>) {
  let maxKey = "",
    minKey = "";
  let maxValue = -Infinity,
    minValue = Infinity;

  for (const key in data) {
    if (key === "구분") continue; //구분 필드 제외

    const value = data[key];
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }

    if (value < minValue) {
      minValue = value;
      minKey = key;
    }
  }
  return { maxKey, maxValue, minKey, minValue };
}
export function findMaxTimeForKeyStr(
  data: Indicate[],
  keys: string[]
): {
  [key: string]: { key: string; 최대값: number };
} {
  const result: {
    [key: string]: { key: string; 최대값: number };
  } = {};

  keys.forEach((key) => {
    result[key] = { key: "", 최대값: -Infinity };
  });

  // Filter out "기타" from the data before processing
  const filteredData = data.filter(
    (item) =>
      item.key !== "기타" && keys.some((key) => typeof item[key] === "number")
  );

  // Iterate through the filtered data
  filteredData.forEach((item) => {
    const { key } = item;

    keys.forEach((key) => {
      const value = item[key];

      // If the value is a number and greater than the current max, update the result
      if (typeof value === "number" && value > result[key].최대값) {
        result[key] = { key: key.toString(), 최대값: value };
      }
    });
  });
  return result;
}
