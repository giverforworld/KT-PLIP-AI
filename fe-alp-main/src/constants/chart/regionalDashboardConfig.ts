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
	name: string | string[]; 
	title: string;
	type: string | string[];
	xlabel: string;
	color: string[];
	summary?: string;
	isSingleTable?: boolean;
	chartUnit: string;
}

export const regionalDashboardConfig: ChartConfig[] = [
	{
		name: "regTimeSeriesData",
		title: "시계열 생활인구",
		type: ["line"],
		xlabel: "구분",
		color: ["#418AEC"],
		chartUnit: "명",
	},
	{
		name: "regTimePatternData",
		title: "시간대별 생활패턴별 생활인구 수",
		type: ["line"],
		xlabel: "구분",
		color: ["#418AEC", "#79C8C4", "#7C69EF"],
		chartUnit: "명",
	},
	{
		name: "regStayDaysRatioData",
		title: "체류일수별 비율",
		type: ["percentage"],
		xlabel: "구분",
		color: ["#418AEC", "#79C8C4", "#7C69EF"],
		chartUnit: "%",
	},
	{
		name: "regShortStayRatioData",
		title: "숙박일수별 비율",
		type: ["percentage"],
		xlabel: "구분",
		color: ["#418AEC", "#79C8C4", "#7C69EF", "#5BC7EE"],
		chartUnit: "%",
	},
	{
		name: "regPurposeFlowData",
		title: "이동목적별 유입/유출량",
		type: ["bar"],
		xlabel: "구분",
		color: ["#418AEC", "#79C8C4"],
		chartUnit: "명",
	},
	{
		name: "regTransFlowData",
		title: "이동수단별 유입/유출량",
		type: ["bar"],
		xlabel: "구분",
		color: ["#418AEC", "#79C8C4"],
		chartUnit: "명",
	},
	{
		name: "regTop5InboundAreasData",
		title: "유입지역 TOP 5",
		type: ["horizontalBar"],
		xlabel: "구분",
		color: ["#3473E7", "#4580E9", "#588EEB", "#6B9CED", "#80AAEE"],
		chartUnit: "명",
	},
	{
		name: "regTop5OutboundAreasData",
		title: "유출지역 TOP 5",
		type: ["horizontalBar"],
		xlabel: "구분",
		color: ["#69BEB7", "#76C3BE", "#82CAC4", "#90D0CB", "#9ED6D2"],
		chartUnit: "명",
	},
];
