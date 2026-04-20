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

type ChartContext = {
	name?: string;
	data: ChartData;
	title: string;
	type: string;
	xlabel: string;
	color: string[];
	dataSwipe?: boolean;
	summary?: string;
	chartLabelShow?: Boolean;
	chartHeight?: number;
	isSingleTable?: boolean;
	isExceptionalChart?: boolean;
	labels?: string[];
	chartUnit?: string;
	regionInfo?: Record<string, RegionInfo>;
	isReport?: boolean;
};

type Series = {
	name: string | string[] | number;
	type: string;
	stack?: string;
	data: (number | null)[];
	label?: {
		show: boolean;
		position?: string;
		distance?: number;
		fontWeight?: string;
		fontSize?: number;
		formatter?: (params: any) => any;
		color?: string;
		fontFamily?: string;
		align?: string;
	};
	labelLayout?: {
		hideOverlap: boolean;
		moveOverlap?: string;
	};
	areaStyle?: {
		color: string[];
	};
	barWidth?: string;
	itemStyle?: {
		borderRadius?: number[];
		color?: (params: any) => string;
	};
	barCategoryGap?: number;
	symbol?: string;
	symbolSize?: number;
	showSymbol?: boolean;
	lineStyle?: {
		width: number;
	};
	xAxisIndex?: number;
	yAxisIndex?: number;
};

type ChartProps = {
	data: {
		[key: string]: any;
	};
	name?: string;
	chartRef?: React.MutableRefObject<EChartsReact | null>;
	chartHeight?: number;
};

type DataMap = {
	[region: string]: {
		[time: string]: number;
	};
};

type DataItem = {
	value: number[];
	name?: string[];
	areaStyle: {
		color: string[];
	};
};

type MergedChartData = {
	name: string;
	data: { regionName: string; indicate: Record<string, string | number>[] }[];
};

type BaseChartData = {
	regionName?: string;
	name: string;
	indicate: Record<string, string | number>[];
};

type ChartData = BaseChartData | MergedChartData;

type RegDasChartSummary = {
	key: string;
	title: string;
	value: number;
	prevMonthComparison: number;
	prevYearComparison: number;
};

type RegDasChart = {
	regionName?: number;
	name: string;
	indicate: Record<string, string | number>[];
};

type RegDasChartData = {
	[key: string]: RegDasChart[] | RegDasChartSummary[];
};

type ChartGroup = { [groupName: string]: ChartData[] };

type ChartConfig = {
	name: string;
	title: string;
	type: string | string[];
	xlabel: string;
	color: string[];
	group?: boolean;
	groupType?: string | string[];
	summary?: string;
	isSingleTable?: boolean;
	isExceptionalChart?: boolean;
	chartUnit?: string;
};
