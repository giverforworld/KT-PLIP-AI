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

import { convertCDtoFullNM, convertCDtoNM } from "@/helpers/convertNM";
import { calcMonthToDate, calculateDates } from "@/helpers/convertDate";
import util from "util";

export async function transChart(data: any, start: string) {
  const indicate: Indicate[] = [];
  const buckets = data.aggregations.by_sido_cd.buckets || [];
  const convertStart = calcMonthToDate(start);
  const num = (Number(convertStart.end) - Number(convertStart.start) + 1) * 24
  for (const item of buckets) {
    const regionName = await convertCDtoNM(item.key);
    const populNum = item.sum_tot_popul_num.value / num

    indicate.push({
      구분: regionName || "-",
      생활인구: Number(populNum.toFixed(2)),
    });
  }
  return indicate;
}

export async function transChart2(data: any, start: string) {
  const indicate: Indicate[] = [];
  const buckets = data?.aggregations?.sido_cd_aggregation?.buckets;
  if (!Array.isArray(buckets)) {
    throw new Error("Data is not iterable");
  }

  for (const item of buckets) {
    const regionName = await convertCDtoFullNM(Number(item.key));
    const populNum = item.total_population.value
    indicate.push({
      구분: regionName,
      체류인구: Number(populNum.toFixed(2)),
    });
  }
  return indicate;
}

export async function transChart3(data: any, start: string) {
  const indicate: Indicate[] = [];
  const convertStart = calcMonthToDate(start);
  const num = (Number(convertStart.end) - Number(convertStart.start) + 1)

  const detinaSidoBuckets =
    data?.aggregations?.by_detina_sido_cd?.buckets || [];
  const pdeparSidoBuckets =
    data?.aggregations?.by_pdepar_sido_cd?.buckets || [];

  for (const detinaSidoItem of detinaSidoBuckets) {
    const regionName = await convertCDtoNM(detinaSidoItem.key);
    const detinaSidoKey = detinaSidoItem.key;
    const detinaSidoPopulation =
      detinaSidoItem.total_detina_sido_cd_popul.value / num;

    const pdeparSidoItem = pdeparSidoBuckets.find(
      (pItem: any) => pItem.key === detinaSidoKey
    );
    const pdeparSidoPopulation = pdeparSidoItem
      ? pdeparSidoItem.total_pdepar_sido_cd_popul.value / num
      : 0;

    indicate.push({
      구분: regionName,
      유입인구: Number(detinaSidoPopulation.toFixed(2)),
      유출인구: Number(pdeparSidoPopulation.toFixed(2)),
    });
  }
  return indicate;
}

export async function transChart4(data: any, data1: any, data2: any) {
  const indicate: Indicate[] = [];
  const present_sido: any[] = [];
  const last_sido: any[] = [];
  const presentDValue = new Map<number, number>();
  const lastYDValue = new Map<number, number>();
  const presentPValue = new Map<number, number>();
  const lastYPValue = new Map<number, number>();
  const rgnDate = new Map<number, number>();
  const rgnMap = new Map<number, number>();

  const detinaSidoBuckets =
    data?.month?.aggregations?.group_by_detina_broad_sido_cd_start
      ?.group_by_detina_broad_sido_cd?.buckets || [];
  const detinalastSidoBuckets =
    data?.month?.aggregations?.group_by_detina_broad_sido_cd_last
      ?.group_by_detina_broad_sido_cd?.buckets || [];
  const pdeparSidoBuckets =
    data?.month?.aggregations?.group_by_pdepar_broad_sido_cd_start
      ?.group_by_pdepar_broad_sido_cd?.buckets || [];
  const pdeparlastSidoBuckets =
    data?.month?.aggregations?.group_by_pdepar_broad_sido_cd_last
      ?.group_by_pdepar_broad_sido_cd?.buckets || [];
  const presentSidoBucket = data1?.aggregations?.present?.sido?.buckets || [];
  const lastSidoBucket = data1?.aggregations?.last?.sido?.buckets || [];
  const rgnchangeBucket = data2?.aggregations?.unique?.buckets || [];
  
  for (const item of detinaSidoBuckets) {
    const key = item.key;
    const populNum = item.sum_tot_popul_num_detina_start.value ?? 0;
    presentDValue.set(key, populNum)
  }
  for (const item of detinalastSidoBuckets) {
    const key = item.key;
    const populNum = item.sum_tot_popul_num_detina_last.value ?? 0;
    lastYDValue.set(key, populNum)
  }
  for (const item of pdeparSidoBuckets) {
    const key = item.key;
    const populNum = item.sum_tot_popul_num_pdepar_start.value ?? 0;
    presentPValue.set(key, populNum)
  }
  for (const item of pdeparlastSidoBuckets) {
    const key = item.key;
    const populNum = item.sum_tot_popul_num_pdepar_last.value ?? 0;
    lastYPValue.set(key, populNum)
  }

  for (const item of presentSidoBucket) {
    const present_key = Number(item.key);
    present_sido.push(present_key)
  }
  for (const item of lastSidoBucket) {
    const last_key = Number(item.key);
    last_sido.push(last_key)
  }
  for (const item of rgnchangeBucket) {
    const cd = item?.key?.SIDO ?? 0;
    const o_cd = item?.key?.OSIDO ?? 0;
    const cday = item?.key?.BASE_YM ?? 0;
    rgnMap.set(o_cd, cd);
    rgnDate.set(o_cd, cday);
  }

  for (const [key, value] of rgnDate.entries()) {
    if (!present_sido.includes(key) && present_sido.includes(rgnMap.get(key))) {
      const last_ynum = lastYDValue.get(key);
      const last_pnum = lastYPValue.get(key);
      const last_rgnKey = rgnMap.get(key);
      if (last_ynum !== undefined && last_rgnKey !== undefined) {
        lastYDValue.set(last_rgnKey, last_ynum);
        lastYDValue.delete(key);
      }
      if (last_pnum !== undefined && last_rgnKey !== undefined) {
        lastYPValue.set(last_rgnKey, last_pnum)
        lastYPValue.delete(key);
      }
    }
  }

  for (const sidoCode of present_sido) {
    const regionName = await convertCDtoNM(sidoCode);
    const detinaSidoPopulation = presentDValue.get(sidoCode) || 0;
    const detinaSidolastPopulation = lastYDValue.get(sidoCode) || 0;
    const pdeparSidoPopulation = presentPValue.get(sidoCode) || 0;
    const pdeparSidolastPopulation = lastYPValue.get(sidoCode) || 0;

    indicate.push({
      구분: regionName,

      전년동기대비유입인구증감률:
        detinaSidolastPopulation !== 0
          ? Number(
              (
                ((detinaSidoPopulation - detinaSidolastPopulation) /
                  detinaSidolastPopulation) *
                100
              ).toFixed(2)
            )
          : 0,

      전년동기대비유출인구증감률:
        pdeparSidolastPopulation !== 0
          ? Number(
              (
                ((pdeparSidoPopulation - pdeparSidolastPopulation) /
                  pdeparSidolastPopulation) *
                100
              ).toFixed(2)
            )
          : 0,
    });
  }
  return indicate;
}

export async function transChart5(data1: any, data2: any, data3: any, start: any) {
  const results: any[] = [];
  const present_sido: any[] = [];
  const prev_sido: any[] = [];
  const last_sido: any[] = [];
  const presentValue = new Map<number, number>();
  const prevMValue = new Map<number, number>();
  const lastYValue = new Map<number, number>();
  const rgnDate = new Map<number, number>();
  const rgnMap = new Map<number, number>();
  const convertStart = calcMonthToDate(start);
  const { prevMonth, lastYear } = calculateDates(start)
  const convertPrevM = calcMonthToDate(prevMonth);
  const convertLastY = calcMonthToDate(lastYear)
  const current_param = (Number(convertStart.end) - Number(convertStart.start) + 1) * 24
  const prev_param = (Number(convertPrevM.end) - Number(convertPrevM.start) + 1) * 24
  const last_param = (Number(convertLastY.end) - Number(convertLastY.start) + 1) * 24

  const bucket = data1?.aggregations?.by_sido_cd?.buckets || [];
  const presentSidoBucket = data2?.aggregations?.present?.sido?.buckets || [];
  const prevSidoBucket = data2?.aggregations?.prev?.sido?.buckets || [];
  const lastSidoBucket = data2?.aggregations?.last?.sido?.buckets || [];
  const rgnchangeBucket = data3?.aggregations?.unique?.buckets || [];

  for (const item of presentSidoBucket) {
    const present_key = Number(item.key);
    present_sido.push(present_key)
  }
  for (const item of prevSidoBucket) {
    const prev_key = Number(item.key);
    prev_sido.push(prev_key)
  }
  for (const item of lastSidoBucket) {
    const last_key = Number(item.key);
    last_sido.push(last_key)
  }

  for (const item of bucket) {
    const key = Number(item.key);
    const num = Number(item.present.tot_popul_num.value ?? 0) / current_param;
    const prev_num = Number(item.prev.tot_popul_num.value ?? 0) / prev_param;
    const last_num = Number(item.last.tot_popul_num.value ?? 0) / last_param;
    presentValue.set(key, num);
    prevMValue.set(key, prev_num);
    lastYValue.set(key, last_num);
  }

  presentValue.forEach((value, key) => {
    if (value === 0) {
      presentValue.delete(key);
    }
  })
  prevMValue.forEach((value, key) => {
    if (value === 0) {
      prevMValue.delete(key);
    }
  })
  lastYValue.forEach((value, key) => {
    if (value === 0) {
      lastYValue.delete(key);
    }
  })

  for (const item of rgnchangeBucket) {
    const cd = item?.key?.SIDO ?? 0;
    const o_cd = item?.key?.OSIDO ?? 0;
    const cday = item?.key?.BASE_YM ?? 0;
    rgnMap.set(o_cd, cd);
    rgnDate.set(o_cd, cday);
  }

  for (const [key, value] of rgnDate.entries()) {
    if (!present_sido.includes(key) && present_sido.includes(rgnMap.get(key))) {
      const prev_num = prevMValue.get(key);
      const last_num = lastYValue.get(key);
      const prev_rgnKey = rgnMap.get(key);
      const last_rgnKey = rgnMap.get(key);
      if (prev_num !== undefined && prev_rgnKey !== undefined) {
        prevMValue.set(prev_rgnKey, prev_num);
        prevMValue.delete(key);
      }
      if (last_num !== undefined && last_rgnKey !== undefined) {
        lastYValue.set(last_rgnKey, last_num);
        lastYValue.delete(key);
      }
    }
  }

  for (const sidoCode of present_sido) {
    const present = presentValue.get(sidoCode) || 0;
    const prevMonth = prevMValue.get(sidoCode) || 0;
    const lastYear = lastYValue.get(sidoCode) || 0;

    const monthlyChange =
      prevMonth > 0
        ? Number((((present - prevMonth) / prevMonth) * 100).toFixed(2))
        : 0;

    const yearlyChange =
      lastYear > 0
        ? Number((((present - lastYear) / lastYear) * 100).toFixed(2))
        : 0;

    const result = {
      sidoCode,
      key: "alp",
      value: present,
      prevMonthComparison: monthlyChange,
      prevYearComparison: yearlyChange,
    };

    results.push(result);
  }
  return results;
}

export async function transChart6(data: any, data1: any, data2: any, start: string) {
  const results: any[] = [];
  const present_sido: any[] = [];
  const prev_sido: any[] = [];
  const last_sido: any[] = [];
  const presentValue = new Map<number, number>();
  const prevMValue = new Map<number, number>();
  const lastYValue = new Map<number, number>();
  const rgnDate = new Map<number, number>();
  const rgnMap = new Map<number, number>();

  const SidoBuckets = data?.aggregations?.sgg_cd?.buckets || [];
  const presentSidoBucket = data1?.aggregations?.present?.sido?.buckets || [];
  const prevSidoBucket = data1?.aggregations?.prev?.sido?.buckets || [];
  const lastSidoBucket = data1?.aggregations?.last?.sido?.buckets || [];
  const rgnchangeBucket = data2?.aggregations?.unique?.buckets || []
  

  for (const item of presentSidoBucket) {
    const present_key = Number(item.key);
    present_sido.push(present_key)
  }
  for (const item of prevSidoBucket) {
    const prev_key = Number(item.key);
    prev_sido.push(prev_key)
  }
  for (const item of lastSidoBucket) {
    const last_key = Number(item.key);
    last_sido.push(last_key)
  }
  for (const item of rgnchangeBucket) {
    const cd = item?.key?.SIDO ?? 0;
    const o_cd = item?.key?.OSIDO ?? 0;
    const cday = item?.key?.BASE_YM ?? 0;
    rgnMap.set(o_cd, cd);
    rgnDate.set(o_cd, cday);
  }

  for (const SidoItem of SidoBuckets) {
    const regionName = await convertCDtoNM(SidoItem.key);
    const SidoKey = Number(SidoItem.key);
    
    const baseYmBuckets = SidoItem?.base_ym_filter?.buckets || {};
    const sggCount = Number(baseYmBuckets.base_ym_start.unique_values.value);
    const sggPrevCount = Number(baseYmBuckets.base_ym_prev.unique_values.value);
    const sggLastCount = Number(baseYmBuckets.base_ym_last.unique_values.value);
    const SidoPopulation =
      Number(baseYmBuckets?.base_ym_start?.total_population?.value) / sggCount || 0;
    const prevSidoPopulation =
      Number(baseYmBuckets?.base_ym_prev?.total_population?.value) / sggPrevCount|| 0;
    const lastSidoPopulation =
      Number(baseYmBuckets?.base_ym_last?.total_population?.value) / sggLastCount || 0;

    presentValue.set(SidoKey, SidoPopulation)
    prevMValue.set(SidoKey, prevSidoPopulation)
    lastYValue.set(SidoKey, lastSidoPopulation)
  }

  presentValue.forEach((value, key) => {
    if (value === 0) {
      presentValue.delete(key);
    }
  })
  prevMValue.forEach((value, key) => {
    if (value === 0) {
      prevMValue.delete(key);
    }
  })
  lastYValue.forEach((value, key) => {
    if (value === 0) {
      lastYValue.delete(key);
    }
  })

  for (const [key, value] of rgnDate.entries()) {
    if (!present_sido.includes(key) && present_sido.includes(rgnMap.get(key))) {
      const prev_num = prevMValue.get(key);
      const last_num = lastYValue.get(key);
      const prev_rgnKey = rgnMap.get(key);
      const last_rgnKey = rgnMap.get(key);
      if (prev_num !== undefined && prev_rgnKey !== undefined) {
        prevMValue.set(prev_rgnKey, prev_num);
        prevMValue.delete(key);
      }
      if (last_num !== undefined && last_rgnKey !== undefined) {
        lastYValue.set(last_rgnKey, last_num);  
        lastYValue.delete(key);
      }
    }
  }

  for (const sidoCode of present_sido) {
    const present = presentValue.get(sidoCode) || 0;
    const prevMonth = prevMValue.get(sidoCode) || 0;
    const lastYear = lastYValue.get(sidoCode) || 0;

    const monthlyChange =
      prevMonth > 0
        ? Number((((present - prevMonth) / prevMonth) * 100).toFixed(2))
        : 0;

    const yearlyChange =
      lastYear > 0
        ? Number((((present - lastYear) / lastYear) * 100).toFixed(2))
        : 0;

    const result = {
      sidoCode,
      key: "llp",
      value: present,
      prevMonthComparison: monthlyChange,
      prevYearComparison: yearlyChange,
    };

    results.push(result);
  }
  return results;
}

export async function transChart7(data: any, data1: any, data2: any, start: string) {
  const results: any[] = [];
  const present_sido: any[] = [];
  const prev_sido: any[] = [];
  const last_sido: any[] = [];  
  const presentValue = new Map<number, number>();
  const prevMValue = new Map<number, number>();
  const lastYValue = new Map<number, number>();
  const rgnDate = new Map<number, number>();
  const rgnMap = new Map<number, number>();
  const convertStart = calcMonthToDate(start);
  const { prevMonth, lastYear } = calculateDates(start)
  const convertPrevM = calcMonthToDate(prevMonth);
  const convertLastY = calcMonthToDate(lastYear)
  const current_param = (Number(convertStart.end) - Number(convertStart.start) + 1)
  const prev_param = (Number(convertPrevM.end) - Number(convertPrevM.start) + 1)
  const last_param = (Number(convertLastY.end) - Number(convertLastY.start) + 1)

  const detinaSidoBuckets =
    data?.aggregations?.group_by_detina_sido_cd_start?.group_by_detina_sido_cd
      ?.buckets || [];
  const detinalastSidoBuckets =
    data?.aggregations?.group_by_detina_sido_cd_last?.group_by_detina_sido_cd
      ?.buckets || [];
  const detinaprevSidoBuckets =
    data?.aggregations?.group_by_detina_sido_cd_prev?.group_by_detina_sido_cd
      ?.buckets || [];
  const presentSidoBucket = data1?.aggregations?.present?.sido?.buckets || [];
  const prevSidoBucket = data1?.aggregations?.prev?.sido?.buckets || [];
  const lastSidoBucket = data1?.aggregations?.last?.sido?.buckets || [];
  const rgnchangeBucket = data2?.aggregations?.unique?.buckets || [];

  for (const item of presentSidoBucket) {
    const present_key = Number(item.key);
    present_sido.push(present_key)
  }
  for (const item of prevSidoBucket) {
    const prev_key = Number(item.key);
    prev_sido.push(prev_key)
  }
  for (const item of lastSidoBucket) {
    const last_key = Number(item.key);
    last_sido.push(last_key)
  }
  for (const item of rgnchangeBucket) {
    const cd = item?.key?.SIDO ?? 0;
    const o_cd = item?.key?.OSIDO ?? 0;
    const cday = item?.key?.BASE_YM ?? 0;
    rgnMap.set(o_cd, cd);
    rgnDate.set(o_cd, cday);
  }

  for (const item of detinaSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_detina_start?.value) / current_param;
    presentValue.set(key, num)
  }
  for (const item of detinaprevSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_detina_prev?.value) / prev_param;
    prevMValue.set(key, num)
  }
  for (const item of detinalastSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_detina_last?.value) / last_param;
    lastYValue.set(key, num)
  }

  for (const [key, value] of rgnDate.entries()) {
    if (!present_sido.includes(key) && present_sido.includes(rgnMap.get(key))) {
      const prev_num = prevMValue.get(key);
      const last_num = lastYValue.get(key);
      const prev_rgnKey = rgnMap.get(key);
      const last_rgnKey = rgnMap.get(key);
      if (prev_num !== undefined && prev_rgnKey !== undefined) {
        prevMValue.set(prev_rgnKey, prev_num);
        prevMValue.delete(key);
      }
      if (last_num !== undefined && last_rgnKey !== undefined) {
        lastYValue.set(last_rgnKey, last_num);  
        lastYValue.delete(key);
      }
    }
  }

  for (const sidoCode of present_sido) {
    const present = presentValue.get(sidoCode) || 0;
    const prevMonth = prevMValue.get(sidoCode) || 0;
    const lastYear = lastYValue.get(sidoCode) || 0;

    const monthlyChange =
      prevMonth > 0
        ? Number((((present - prevMonth) / prevMonth) * 100).toFixed(2))
        : 0;

    const yearlyChange =
      lastYear > 0
        ? Number((((present - lastYear) / lastYear) * 100).toFixed(2))
        : 0;

    const result = {
      sidoCode,
      key: "mopInflow",
      value: present,
      prevMonthComparison: monthlyChange,
      prevYearComparison: yearlyChange,
    };

    results.push(result);
  }
  return results;
}

export async function transChart8(data: any, data1: any, data2: any, start: string) {
  const results: any[] = [];
  const present_sido: any[] = [];
  const prev_sido: any[] = [];
  const last_sido: any[] = [];
  const presentValue = new Map<number, number>();
  const prevMValue = new Map<number, number>();
  const lastYValue = new Map<number, number>();
  const rgnDate = new Map<number, number>();
  const rgnMap = new Map<number, number>();
  const convertStart = calcMonthToDate(start);
  const { prevMonth, lastYear } = calculateDates(start)
  const convertPrevM = calcMonthToDate(prevMonth);
  const convertLastY = calcMonthToDate(lastYear)
  const current_param = (Number(convertStart.end) - Number(convertStart.start) + 1)
  const prev_param = (Number(convertPrevM.end) - Number(convertPrevM.start) + 1)
  const last_param = (Number(convertLastY.end) - Number(convertLastY.start) + 1)

  const pdeparSidoBuckets =
    data?.aggregations?.group_by_pdepar_sido_cd_start?.group_by_pdepar_sido_cd
      ?.buckets || [];
  const pdeparlastSidoBuckets =
    data?.aggregations?.group_by_pdepar_sido_cd_last?.group_by_pdepar_sido_cd
      ?.buckets || [];
  const pdeparprevSidoBuckets =
    data?.aggregations?.group_by_pdepar_sido_cd_prev?.group_by_pdepar_sido_cd
      ?.buckets || [];

  const presentSidoBucket = data1?.aggregations?.present?.sido?.buckets || [];
  const prevSidoBucket = data1?.aggregations?.prev?.sido?.buckets || [];
  const lastSidoBucket = data1?.aggregations?.last?.sido?.buckets || [];
  const rgnchangeBucket = data2?.aggregations?.unique?.buckets || [];

  for (const item of presentSidoBucket) {
    const present_key = Number(item.key);
    present_sido.push(present_key)
  }
  for (const item of prevSidoBucket) {
    const prev_key = Number(item.key);
    prev_sido.push(prev_key)
  }
  for (const item of lastSidoBucket) {
    const last_key = Number(item.key);
    last_sido.push(last_key)
  }
  for (const item of rgnchangeBucket) {
    const cd = item?.key?.SIDO ?? 0;
    const o_cd = item?.key?.OSIDO ?? 0;
    const cday = item?.key?.BASE_YM ?? 0;
    rgnMap.set(o_cd, cd);
    rgnDate.set(o_cd, cday);
  }

  for (const item of pdeparSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_pdepar_start?.value) / current_param;
    presentValue.set(key, num)
  }
  for (const item of pdeparprevSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_pdepar_prev?.value) / prev_param;
    prevMValue.set(key, num)
  }
  for (const item of pdeparlastSidoBuckets) {
    const key = item.key
    const num = Number(item?.sum_tot_popul_num_pdepar_last?.value) / last_param;
    lastYValue.set(key, num)
  }

  for (const [key, value] of rgnDate.entries()) {
    if (!present_sido.includes(key) && present_sido.includes(rgnMap.get(key))) {
      const prev_num = prevMValue.get(key);
      const last_num = lastYValue.get(key);
      const prev_rgnKey = rgnMap.get(key);
      const last_rgnKey = rgnMap.get(key);
      if (prev_num !== undefined && prev_rgnKey !== undefined) {
        prevMValue.set(prev_rgnKey, prev_num);
        prevMValue.delete(key);
      }
      if (last_num !== undefined && last_rgnKey !== undefined) {
        lastYValue.set(last_rgnKey, last_num);  
        lastYValue.delete(key);
      }
    }
  }

  for (const sidoCode of present_sido) {
    const present = presentValue.get(sidoCode) || 0;
    const prevMonth = prevMValue.get(sidoCode) || 0;
    const lastYear = lastYValue.get(sidoCode) || 0;

    const monthlyChange =
      prevMonth > 0
        ? Number((((present - prevMonth) / prevMonth) * 100).toFixed(2))
        : 0;

    const yearlyChange =
      lastYear > 0
        ? Number((((present - lastYear) / lastYear) * 100).toFixed(2))
        : 0;

    const result = {
      sidoCode,
      key: "mopOutflow",
      value: present,
      prevMonthComparison: monthlyChange,
      prevYearComparison: yearlyChange,
    };

    results.push(result);
  }
  return results;
}

export async function transMain(
  liveData: any,
  stayData: any,
  movData: any,
  timeData: any,
  sidoinfoData: any,
  rgnchangedData: any,
  start: any
): Promise<any[]> {
  const [chart1, chart2, chart3, chart4] = await Promise.all([
    transChart(liveData, start),
    transChart2(stayData, start),
    transChart3(movData, start),
    transChart4(timeData, sidoinfoData, rgnchangedData),
  ]);

  const data = [
    {
      key: "전국 시도별 생활인구",
      charts: [
        {
          name: "dashboardSidoAlp",
          indicate: chart1,
        },
      ],
    },
    {
      key: "전국 시군구별 체류인구",
      charts: [
        {
          name: "dashboardSidoLlp",
          indicate: chart2,
        },
      ],
    },
    {
      key: "전국 시도별 생활이동량",
      charts: [
        {
          name: "dashboardSidoMop",
          indicate: chart3,
        },
      ],
    },
    {
      key: "전국 시도별 인구 유입 및 유출 변화 분석",
      charts: [
        {
          name: "dashboardSidoScatterData",
          indicate: chart4,
        },
      ],
    },
  ];

  return data;
}

export async function transInfo(
  mainData: any,
  stay3Data: any,
  inflowData: any,
  outflowData: any,
  sidoinfoData: any,
  rgnchangedData: any,
  start: any,
): Promise<any> {
  const [chart1, chart2, chart3, chart4] = await Promise.all([
    transChart5(mainData, sidoinfoData, rgnchangedData, start),
    transChart6(stay3Data, sidoinfoData, rgnchangedData, start),
    transChart7(inflowData, sidoinfoData, rgnchangedData, start),
    transChart8(outflowData, sidoinfoData, rgnchangedData, start),
  ]);

  const data = [...chart1, ...chart2, ...chart3, ...chart4];

  return data;
}
