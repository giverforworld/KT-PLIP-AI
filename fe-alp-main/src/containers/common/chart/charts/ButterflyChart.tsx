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

import ReactECharts from "echarts-for-react";
import { useSearchResultStore } from "@/store/searchResult";
export default function ButterflyChart({ data }: Readonly<ChartProps>) {
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;

	const option = {
		title: statSummary.length > 1 ? data.title : null,
		grid: data.grid,
		xAxis: data.xAxis,
		yAxis: data.yAxis,
		tooltip: data.tooltip,
		series: data.series,
		legend: data.legend,
		color: data.color,
	};

	return <ReactECharts option={option} />;
}
