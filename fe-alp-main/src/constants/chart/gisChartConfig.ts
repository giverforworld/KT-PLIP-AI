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

interface ChartConfig {
	name: string;
	title: string;
	type: string | string[];
	xlabel: string;
	color: string[];
	group?: boolean;
	summary?: string;
}

export const gisAlpConfig: ChartConfig[] = [
	//생활인구 일반차트
	{
		name: "genderData",
		title: "성별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "ageGroupData",
		title: "연령별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "lifestylePatternData",
		title: "생활패턴별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "periodData",
		title: "기간별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "dayOfWeekData",
		title: "요일별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "timeSlotData",
		title: "시간대별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
];

export const gisChartConfig: ChartConfig[] = [
	//생활인구 시계열
	{
		name: "gisTimeSeriesDayData",
		title: "일별 생활인구",
		type: ["dynamic", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "gisTimeSeriesTimeData",
		title: "시간대별 생활인구",
		type: ["dynamic", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},

	//생활인구 기간듀얼차트
	{
		name: "AlpPeriodDualData",
		title: "기간별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpGenderPeriodDualData",
		title: "기간별 성별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpAgePeriodDualData",
		title: "기간별 연령별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpLifePatternPeriodDualData",
		title: "기간별 생활패턴별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	//생활인구 요일듀얼차트
	{
		name: "AlpDowDualData",
		title: "요일별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpRegionTop10DowDualData",
		title: "상위 10개 지역별 생활인구",
		type: ["horizontalBar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpGenderDowDualData",
		title: "요일별 성별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpAgeDowDualData",
		title: "요일별 연령별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpLifePatternDowDualData",
		title: "요일별 생활패턴별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	//생활인구 시간대듀얼차트
	{
		name: "AlpTimeDualData",
		title: "시간대별 생활인구",
		type: ["bar", "table"],
		xlabel: "시간대별",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpRegionTop10TimeDualData",
		title: "상위 10개 지역별 생활인구",
		type: ["horizontalBar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpGenderTimeDualData",
		title: "시간대별 성별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpAgeTimeDualData",
		title: "시간대별 연령별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	{
		name: "AlpLifePatternTimeDualData",
		title: "시간대별 생활패턴별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D56CF6"],
	},
	//생활인구 행정구역_성별차트
	{
		name: "AlpDistrictSexData",
		title: "성별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},
	{
		name: "AlpDistrictSexPeriodData",
		title: "성별 기간별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "AlpDistrictSexDowData",
		title: "성별 요일별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	{
		name: "AlpDistrictSexTimeData",
		title: "성별 시간대별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#D8D8D8"],
	},
	//생활인구 행정구역_연령별차트
	{
		name: "AlpDistrictAgeData",
		title: "연령별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},
	{
		name: "AlpDistrictAgePeriodData",
		title: "연령별 기간별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpDistrictAgeDowData",
		title: "연령별 요일별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpDistrictAgeTimeData",
		title: "연령별 시간대별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	//생활인구 행정구역_생활패턴별차트
	{
		name: "AlpDistrictLifeStyleData",
		title: "생활패턴별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},
	{
		name: "AlpDistrictLifeStylePeriodData",
		title: "생활패턴별 기간별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpDistrictLifeStyleDowData",
		title: "생활패턴별 요일별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpDistrictLifeStyleTimeData",
		title: "생활패턴별 시간대별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	//생활인구 외국인 행정구역_생활패턴차트
	{
		name: "AlpForeignRegionTop10Data",
		title: "상위 10개 지역별 생활인구",
		type: ["horizontalBar", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},
	{
		name: "AlpForeignTop10Data",
		title: "상위 10개 국가별 생활인구",
		type: ["horizontalBar", "table"],
		xlabel: "구분",
		color: ["#418AEC"],
	},
	{
		name: "AlpForeignDistrictPeriodData",
		title: "기간별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpForeignDistrictAgeDowData",
		title: "요일별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
	{
		name: "AlpForeignDistrictAgeTimeData",
		title: "시간대별 생활인구",
		type: ["line", "table"],
		xlabel: "구분",
		color: ["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"],
	},
];
