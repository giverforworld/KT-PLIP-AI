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
import {
  generateStatByChartId,
  generateSummaryByChartId,
} from "./generateSummary";
import { formatDay, getUTCDate } from "@/helpers/convertDate";
import { mapAgeToCategory } from "@/helpers/sortByAgeOrder";
import { keyMap } from "@/config/keyMapConfig";
export async function lineOrBarChart(
  id: string,
  name: string,
  category: string,
  existStat: boolean,
  existSummary: boolean,
  data: NormalizedData[],
  options: any,
  key?: string
): Promise<ChartHandlerData> {
  let { chartName, legend, x } = chartMapping[id.split("_")[0]][id];

  const isResid09 = id === "ALP30010_09" ? true : false;
  const isResid10 = id === "ALP30010_10" ? true : false;
  const isResid11 = id === "ALP30010_11" ? true : false;
  const isResid12 = id === "ALP30010_12" ? true : false;
  const isResid12_1 = id === "ALP30010_12_1" ? true : false;

  //ALP100*0_13, ALP100*0_14 는 stat 때문에 Avg 추가한 예외사항
  //Avg는 chart 추가 X Sum의 chartName도 Sum 빼기
  let isALPExcept = false;
  if (id.startsWith("ALP1") && (id.includes("13") || id.includes("14"))) {
    isALPExcept = true;
  }
  if (key && !isALPExcept) chartName += key;

  if (options.isInflow !== undefined) {
    legend = legend.map((item) => {
      if (item === "인구") return options.isInflow ? "유입인구" : "유출인구";
      else return item;
    });
  }
  if (options.moveCdArray !== undefined) {
    // isPurpose가 false인 경우 purpose를 trans 변경
    if (options.isPurpose === false) {
      chartName = chartName.replace("purpose", "trans");
      chartName = chartName.replace("oddPur", "oddTra");
    }
    if (options.isInflow === false) {
      chartName = chartName.replace("Inflow", "Outflow");
    }
    if (x)
      x = x.map((item) => {
        if (item === "이동") return options.isPurpose ? "이동목적" : "이동수단";
        else return item;
      });
  }

  const isGroup = options.regionArray.length > 1;
  //출도착지 비교분석의 전국인 경우
  const isNationWide =
    options.region !== undefined && options.region === options.regionArray[0];
  const moveCdMap = options.isPurpose ? keyMap.purpose : keyMap.way;
  const stayCdMap = keyMap.stayDays;
  const timeCdMap = keyMap.timeDays;
  const weekCdMap = keyMap.weekDays;
  const ldgmtCdMap = keyMap.ldgmtDays;

  const result: ChartHandlerData = {
    summary: isGroup ? [] : "",
    charts: [],
  };
  let stats: StatSummaryObj[] = [];

  const union = ['41110', '41130', '41170', '41190', '41270', '41280', '41460'];
  const unionSgg = ["41111", "41113", "41115", "41117", "41131", "41133", "41135", "41171", "41173",
    "41192", "41194", "41196", "41271", "41273", "41281", "41285", "41287", "41461", "41463", "41465"];

  if (isResid09) {
    const region = options.regionArray[0];
    const regionName = await convertCDtoNM(region);
    let sidoNM = '';
    let sggNM = '';
    let admNM = '';
    if (region.length === 2) {
      sidoNM = regionName;
    }
    else if (region.length === 5) {
      sggNM = regionName;
      if (union.includes(region)) {
        sggNM = regionName;
      } else if (unionSgg.includes(region)) {
        sggNM = regionName.split(' ')[1];
      }
      sidoNM = await convertCDtoNM(region.slice(0, 2));
    }
    else if (region.length === 8) {
      const sggRegionName = await convertCDtoNM(region.slice(0, 5));
      if (unionSgg.includes(region.slice(0, 5))) {
        sggNM = sggRegionName.split(' ')[1];
      } else {
        sggNM = sggRegionName;
      }
      admNM = regionName;
    }
    const region0: any = data[0].data.filter((item:any) => item.key.toString() === region.toString());
    const regionLength = data[0].data.length.toString();
    const regionRank = data[0].data.findIndex((item:any) => item.key.toString() === region.toString());
    if (regionRank < 17) {
      data[0].data.splice(17);
    } else {
      data[0].data.splice(16);
      data[0].data.push(...region0);
    }
    const regionPop = Number(region0[0].tot.value);
    const residPop = await Promise.all(data[0].data.map(async (item:any) => {
      return {
        구분: await convertCDtoNM(item.key),
        생활인구수: item.tot?.value
      }
    }));
    
    result.summary = `\{${regionName}\}\n주민등록인구 수는 ${regionPop.toLocaleString()}명,\n${!sggNM ? '전국' : !admNM ? sidoNM : sggNM} ${!sggNM ? '17':regionLength}개 시군 중 ${!sggNM ? sidoNM : !admNM ? sggNM : admNM}는 ${regionRank+1}위 입니다.`
    result.charts.push({
      name: 'modalCurrentData',
      regionName,
      indicate: residPop
    });

    return result;
  } else if (isResid10) {
    const region = options.regionArray[0];
    const regionName = await convertCDtoNM(region);

    const residPopYear = data[0].data.map((item:any) => {
      return {
        구분: item.key_as_string.slice(0, 4),
        주민등록인구: item.tot.value
      }
    });
    const regionArrLen = residPopYear.length;

    result.summary = `\{${regionName}\}\n주민등록인구 수는  ${Number(residPopYear[regionArrLen-1].주민등록인구).toLocaleString()}명 입니다.`
    result.charts.push({
      name: 'modalCurrentData',
      regionName,
      indicate: residPopYear
    });
    
    return result;
  }
  else if (isResid11) {
    const region = options.regionArray[0];
    const regionName = await convertCDtoNM(region);

    const region0: any = data[0].data.filter((item:any) => item.key.toString() === region.toString());
    const nonZeroRegion = data[0].data.filter((item:any) => item.female_tot.value !== 0);
    const regionRank = nonZeroRegion.findIndex((item:any) => item.key.toString() === region.toString());
    if (regionRank < 17) {
      nonZeroRegion.splice(17);
    } else {
      nonZeroRegion.splice(16);
      nonZeroRegion.push(...region0);
    }
    
    const extincNum = (region0[0].female_index.value / region0[0].tot_80_popul_num.value).toFixed(2);
    const extinc = await Promise.all(nonZeroRegion.map(async (item:any) => {
      return {
        구분: await convertCDtoNM(item.key),
        생활인구수: (item.female_index.value / item.tot_80_popul_num.value).toFixed(2)
      }
    }));
    const extincGrade = (score: number) => {
      if (score >= 1.5) {
        return '소멸위험 지수 매우 낮음';
      } else if (score >= 1.0) {
        return '소멸위험 지수 보통';
      } else if (score >= 0.5) {
        return '주의 단계';
      } else if (score >= 0.2) {
        return '소멸위험지역-진입단계';
      } else {
        return '소멸위험지역-고위험단계';
      }
    }
    
    result.summary = [`\{${regionName}\}\n지방소멸위험지수는 ${extincNum} 점,  ${extincGrade(Number(extincNum))} 지역에 해당합니다.`,
      `\{${regionName}\}의 지방소멸위험지수는 ${extincNum}점으로 ${extincGrade(Number(extincNum))} 지역에 해당`
    ];
    result.charts.push({
      name: 'extinctionData',
      regionName,
      indicate: extinc  
    });

    return result;
  }
  else if (isResid12) {
    const region = options.regionArray[0];
    const regionName = await convertCDtoNM(region);
    const region0: any = data[0].data.filter((item:any) => item.key.toString() === region.toString());
    const malePersent = Number((100 * region0[0].male_tot.value / (region0[0].female_tot.value + region0[0].male_tot.value)).toFixed(1));
    const femalePersent = 100-Number(malePersent);
    const diff = malePersent > femalePersent ? (malePersent - femalePersent).toFixed(1) : malePersent < femalePersent ? (femalePersent - malePersent).toFixed(1) : 0;
    const many = malePersent > femalePersent ? '남성' : malePersent < femalePersent ? '여성' : '여성';

    const indi1:any = [
      {
        구분: "남성",
        주민등록인구: region0[0].male_tot.value,
      },
      {
        구분: "여성",
        주민등록인구: region0[0].female_tot.value,
      },
    ];
    result.summary = [`\{${regionName}\}\n남성은 ${malePersent}%, 여성은 ${femalePersent}% 입니다.`,
      `남성이 ${malePersent}%, 여성이 ${femalePersent}%로 ${many}이 ${many === '여성' ? '남성' : '여성'} 대비 ${diff}% 많음`
    ];
    result.charts.push({
      name: 'modalGenderData',
      regionName,
      indicate: indi1
    })
    return result;
  }
  else if (isResid12_1) {
    const region = options.regionArray[0];
    const region0: any = data[0].data.filter((item:any) => item.key.toString() === region.toString());
    const regionName = await convertCDtoNM(region);
    const totalAge = region0[0].tot_20_popul_num.value + region0[0].tot_35_popul_num.value + region0[0].tot_65_popul_num.value + region0[0].tot_80_popul_num.value;
    const age20 = Number(((100 * region0[0].tot_20_popul_num.value) / totalAge).toFixed(1));
    const age35 = Number(((100 * region0[0].tot_35_popul_num.value) / totalAge).toFixed(1));
    const age65 = Number(((100 * region0[0].tot_65_popul_num.value) / totalAge).toFixed(1));
    const age80 = Number(((100 * region0[0].tot_80_popul_num.value) / totalAge).toFixed(1));
    const mostAge = Math.max(age20, age35, age65, age80);
    const ageName = mostAge === age20 ? '청소년층'
                  : mostAge === age35 ? '청년층'
                  : mostAge === age65 ? '중장년층' : '노년층'

    const indi2:any = [
      {
        구분: "청소년층(0~19세)",
        주민등록인구: region0[0].tot_20_popul_num.value,
      },
      {
        구분: "청년층(20~34세)",
        주민등록인구: region0[0].tot_35_popul_num.value,
      },
      {
        구분: "중장년층(35~64세)",
        주민등록인구: region0[0].tot_65_popul_num.value,
      },
      {
        구분: "노년층(65세이상)",
        주민등록인구: region0[0].tot_80_popul_num.value,
      },
    ];
    
    result.summary = [`\{${regionName}\}\n${ageName} 인구가 ${mostAge}%로 가장 많습니다.`,
      `노년층 인구는 ${age80}%, 중장년층 인구는 ${age65}%, 청년층 인구는 ${age35}%, 청소년층 인구는 ${age20}%`
    ];
    result.charts.push({
      name: 'modalAgeData',
      regionName,
      indicate: indi2
    })

    return result;
  }

  for (const regionCode of options.regionArray) {
    let regionName = await convertCDtoNM(regionCode);
    const regionData = data.find((item: any) => {
      return item.region.toString() === regionCode;
    });

    //출도착지역인 경우
    if (options.region !== undefined && options.isInflow !== undefined) {
      const originName = await convertCDtoNM(options.region);
      const flowName = isNationWide
        ? "전국"
        : await convertCDtoFullNM(Number(regionCode));

      regionName = options.isInflow
        ? `${flowName} -> ${originName}`
        : `${originName} -> ${flowName}`;
    }
    if (regionData && regionData.data.length !== 0) {
      let indicate: any = [];
      for (const item of regionData.data) {
        let keyStr =
          category === "day" || category === "fornDay"
            ? `${formatDay(item.key as string)}`
            : category === "age"
            ? mapAgeToCategory(item.key as string)
            : category === "move"
            ? moveCdMap[item.move]
            : category === "stayDays"
            ? stayCdMap[item.stay]
            : category === "stayTimes"
            ? timeCdMap[item.time - 1]
            : category === "weekdays"
            ? weekCdMap[regionData.data.indexOf(item)]
            : category === "ldgmtDays"
            ? ldgmtCdMap[item.ldgmt - 1]
            : category === "current"
            ? legend[item.ptrn]
            : item.key;

        if (item.key === "lastYear") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear() - 1}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "start") {
          const date = getUTCDate(options.start);
          keyStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
        }
        if (item.key === "prevMonth") {
          const date = getUTCDate(options.start);

          const year = date.getFullYear();
          const month = date.getMonth();

          let prevYear = year;
          let prevMonth = month;

          if (prevMonth === 0) {
            prevYear = year - 1;
            prevMonth = 12;
          }

          keyStr = `${prevYear}년 ${prevMonth}월`;
        }

        if (x?.includes("지역")) {
          if (typeof item.key === "number")
            keyStr =
              category === "subzone"
                ? await convertCDtoNM(item.key)
                : await convertCDtoFullNM(item.key);
        }

        if (category === "inflowSgg" && regionCode === item.key) {
          continue;
        } else if (category === "subzone") {
          indicate.push({
            구분: keyStr,
            시간: item.time.toString(),
            [legend[0]]: Math.round(item.value),
          });
        } else if (category === "current") {
          indicate.push({
            구분: keyStr,
            [item.key]: Math.round(item.value),
          });
        } else if (category === "inflowDaysAvg") {
          indicate.push({
            구분: keyStr,
            [legend[0]]: item.value.toFixed(2),
          });
        } else {
          indicate.push({
            구분: keyStr,
            [legend[0]]: Math.round(item.value),
          });
          if (category === "inflowSido")
            indicate = indicate
              .sort(
                (a: any, b: any) =>
                  (b[legend[0]] as number) - (a[legend[0]] as number)
              ) // 내림차순 정렬
              .slice(0, 10);
        }
      }
      if (category === "subzone") indicate = sortSubzone(indicate);

      const regionSummary = existSummary
        ? generateSummaryByChartId(id, regionName, indicate, legend, x)
        : undefined;
      const stat = existStat
        ? generateStatByChartId(id, regionName, indicate, legend, x)
        : undefined;
      //요약때문에 추가한 lastYear 삭제
      if (category === "lastYear" || category === "fornLastYear") {
        const date = getUTCDate(options.start);

        const year = date.getFullYear();
        const month = date.getMonth();

        let prevYear = year;
        let prevMonth = month;

        if (prevMonth === 0) {
          prevYear = year - 1;
          prevMonth = 12;
        }
        const targetKey = `${prevYear}년 ${prevMonth}월`;
        indicate = indicate
          .filter((item: any) => item !== undefined)
          .filter((item: any) => item.구분 !== targetKey);
      }
      if (category === "stayDays" || category === "ldgmtDays") {
        indicate = indicate.filter((item: any) => item.구분 !== undefined);
      }
      //요약때문에 추가한 week 지역 삭제
      if (category.endsWith("Weeked")) {
        indicate = indicate.slice(0, 10);
      }
      result.charts.push({
        regionName,
        name: chartName,
        indicate: indicate,
      });

      if (regionSummary)
        if (isGroup) {
          (result.summary as string[]).push(regionSummary);
        } else {
          result.summary = regionSummary;
        }
      if (stat) {
        stats.push(stat as StatSummaryObj);
      }
    } else {
      if (existSummary)
        if (isGroup) {
          (result.summary as string[]).push(`{${regionName}}`);
        } else {
          result.summary = `{${regionName}}`;
        }
      if (existStat) {
        stats.push({
          regionName,
          data: { [category]: "-" },
        });
      }
    }
  }
  if (existStat) result.stat = stats;

  if (key) {
    if (key !== "Sum" && isALPExcept) {
      return { charts: [], summary: "", stat: result.stat };
    }
    return {
      ...result,
      ...(existStat && {
        stat: { [key]: result.stat } as { [key: string]: StatSummaryObj[] },
      }),
      summary: { [key]: result.summary } as Summary | Summaries,
    };
  }
  return result;
}
// 지역별로 먼저 정렬하고, 그 안에서 시간 순으로 정렬
function sortSubzone(data: Indicate[]) {
  data.sort((a, b) => {
    // 지역명 기준으로 먼저 정렬
    if (a.구분 < b.구분) return -1;
    if (a.구분 > b.구분) return 1;

    // 시간 기준으로 정렬 (0~23시)
    const hourA =
      typeof a.시간 === "string"
        ? parseInt(a.시간.replace("시", ""), 10)
        : a.시간;
    const hourB =
      typeof b.시간 === "string"
        ? parseInt(b.시간.replace("시", ""), 10)
        : b.시간;
    return hourA - hourB;
  });
  return data;
}
