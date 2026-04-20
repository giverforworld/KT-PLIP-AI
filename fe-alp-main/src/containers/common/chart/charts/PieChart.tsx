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
import { useState, useEffect } from "react";
import { rowSpanChart } from "@/constants/chart/chartFilter";
import { useSearchResultStore } from "@/store/searchResult";
export default function PieChart({ data }: Readonly<ChartProps>) {
	const searchResult = useSearchResultStore(s=>s.searchResult);
	
	const { statSummary } = searchResult.data;

	const [isRendered, setIsRendered] = useState(false);

	useEffect(() => {
		setIsRendered(true); // DOM 렌더링 완료 상태로 설정
	}, []);

	if (!isRendered) {
		return null; // DOM 준비 전에는 차트를 렌더링하지 않음
	}

	const pieGroup = rowSpanChart.includes(data.dataBox?.name);
	const option = {
		title: statSummary.length > 1 ? data.title : null,
		tooltip: data.tooltip,
		series: data.series,
		// legend: pieGroup ? null : data.legend,
		legend: data.legend,
		color: data.color,
		grid: data.grid,
	};

	return (
		<div
			className="chart-container"
			style={{
				width: pieGroup
					? (() => {
							switch (statSummary.length) {
								case 2:
									return "400px";
								case 3:
									return "330px";
								case 4:
									return "270px";
								default:
									return "250px";
							}
						})()
					: "100%",
				height: pieGroup ? "250px" : "300px",
			}}
		>
			<ReactECharts option={option} style={{ width: "100%", height: "100%" }} />
		</div>
	);
}
