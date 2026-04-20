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

import { useSearchResultStore } from "@/store/searchResult";
import ReactECharts from "echarts-for-react";
export default function ScatterChart({ data }: Readonly<ChartProps>) {
	const searchResult = useSearchResultStore(s=>s.searchResult);	
	const { statSummary } = searchResult.data;

	const option = {
		title: statSummary.length > 1 ? data.title : null,
		xAxis: data.xAxis,
		yAxis: data.yAxis,
		grid: data.grid,
		tooltip: data.tooltip,
		series: data.series,
		legend: data.legend,
		color: data.color,
		markLine: data.markLine,
		graphic: data.graphic,
	};

	return <ReactECharts option={option} style={{ height: "600px" }} />;
}
