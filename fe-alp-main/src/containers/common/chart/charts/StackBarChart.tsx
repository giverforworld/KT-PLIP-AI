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
import { formatDateChart } from "@/utils/chartUtils";
import { useSearchResultStore } from "@/store/searchResult";

export default function StackBarChart({ data }: Readonly<ChartProps>) {
	const searchResult = useSearchResultStore(s=>s.searchResult);
	
	const { statSummary } = searchResult.data;

	const option = {
		title: statSummary.length > 1 ? data.title : null,
		xAxis: {
			type: "category",
			data: data.x,
			axisTick: { show: false },
			axisLine: { show: false },
			axisLabel: {
				show: true,
				fontSize: 12,
				fontFamily: "Pretendard",
				interval: 0,
				hideOverlap: true,
				formatter: (value: string) => {
					if (data.x.length > 14) {
						const parts = formatDateChart(value).split(" ");
						return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
					}
					return formatDateChart(value);
				},
				color: "#75777F",
			},
		},
		yAxis: [
			{
				type: "value",
				axisLabel: {
					formatter: (value: number) => {
						const absValue = Math.abs(value);

						let formattedValue: string;
						if (absValue >= 10 ** 3) {
							formattedValue = Math.floor(absValue / 1000).toLocaleString("en-US") + "k";
						} else {
							formattedValue = absValue.toLocaleString();
						}
						return value < 0 ? `-${formattedValue}` : formattedValue;
					},
					show: true,
					interval: 0,
					color: "#75777F",
				},
			},
		],
		tooltip: data.tooltip,
		series: data.series,
		legend: {
			type: "scroll",
			icon: "circle",
			orient: "horizontal",
			bottom: data.dataSwipe ? "10%" : "bottom", // dataSwipe가 true일 때 범례를 위로 올림
			pageIconColor: "#009fe3",
			pageIconInactiveColor: "#e5e7eb",
			pageIconSize: [10, 10],
			pageTextStyle: {
				color: "#FFFFFF",
			},
		},
		color: data.color,
		grid: {
			top: data?.title?.text ? "10%" : "5%",
			left: "1%",
			right: "1%",
			bottom: data.dataSwipe ? "20%" : "10%",
			containLabel: true,
		},
	};

	if (data.dataSwipe === true) {
		(option as any).dataZoom = [
			{
				type: "slider", // 슬라이더 타입
				start: 0, // 처음에는 0%에서 시작
				end: 40, // 처음에 40%만 보여줌
				bottom: 5,
				height: 15,
			},
			{
				type: "inside", // 내부 스크롤
				start: 0,
				end: 20,
			},
		];
	}

	return <ReactECharts option={option} notMerge={true} />;
}
