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

export const generateFilter = (options: ParamsOptions) => {
  const filters: any[] = [];
  // 기간 필터
  if (options.start && options.end) {
    const monthYN =
      typeof options.start === "string" && options.start.length === 6 ? 0 : 1;
    filters.push(
      {
        term: {
          MONTH_YN: monthYN,
        },
      },
      {
        term: {
          ST_YMD: options.start,
        },
      },
      {
        term: {
          END_YMD: options.end,
        },
      }
    );
  }

  // 지역 필터 기준 + 비교 지역인 경우 or flowRegions 인 경우
  if (options.regionArray.length) {
    filters.push({ terms: { "FILTER.regionArray": options.regionArray } });
  }

  // 출도착 지역 조회일 경우의 기준 지역
  if ("region" in options) {
    filters.push({ term: { "FILTER.region": options.region } });
  }

  // Mop
  if ("includeSame" in options) {
    filters.push({ term: { "FILTER.includeSame": options.includeSame } });
  }
  if ("isInflow" in options) {
    filters.push({ term: { "FILTER.isInflow": options.isInflow } });
  }
  if ("isPurpose" in options) {
    filters.push({ term: { "FILTER.isPurpose": options.isPurpose } });
  }
  if ("moveCdArray" in options) {
    filters.push({ terms: { "FILTER.moveCdArray": options.moveCdArray } });
  }

  return filters;
};
