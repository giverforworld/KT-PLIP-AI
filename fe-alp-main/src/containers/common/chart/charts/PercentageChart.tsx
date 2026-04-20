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

import React from "react";
import ReactECharts from "echarts-for-react";
import { formatDateChart } from "@/utils/chartUtils";
import { useThemeStore } from "@/store/theme";

export default function PercentageChart({
	title,
	data,
	type,
	xlabel,
	color,
	summary,
}: Readonly<ChartContext>) {
	const theme = useThemeStore((s)=> s.theme);
	let indicate = (data as BaseChartData)?.indicate;

	const keys =
		Array.isArray((data as BaseChartData)?.indicate) && (data as BaseChartData)?.indicate.length > 0
			? Object.keys((data as BaseChartData).indicate[0])
			: [];
	const categoryKey = keys[0];
	const valueKey = keys[1];

	// 총합 계산
	const totalValue =
		Array.isArray(indicate) && indicate.length > 0
			? indicate.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0) // item[valueKey]가 undefined인 경우 0으로 처리
			: 0;

	const options = {
		backgroundColor: `none`,
		tooltip: {
			trigger: "axis",
			axisPointer: { type: "shadow" },
			formatter: (params: any) => {
				const value = Number(params.value); // 명시적으로 숫자로 변환
				return !isNaN(value) ? `${(value * 100).toFixed(1)}%` : ""; // 숫자가 맞으면 변환, 아니면 빈 문자열
			},
		},
		legend: {
			bottom: 0,
			data: indicate?.map((item: any) => item[categoryKey]),
			textStyle: {
				color: theme === "dark" ? "#ffffff" : "#75777F",
			},
			icon: "circle",
		},
		grid: {
			left: "5%",
			right: "5%",
			top: "15%",
			bottom: "35%",
			containLabel: true,
		},
		xAxis: {
			type: "value",
			max: 100,
			axisLabel: {
				formatter: "{value}%",
			},
			splitLine: { show: false },
			boundaryGap: [0, 0.01],
		},
		yAxis: {
			type: "category",
			axisLabel: { show: false },
			axisTick: { show: false },
			axisLine: { show: false },
		},
		series: indicate?.map((item: any, index: number) => {
			const percentageValue = ((item[valueKey] / totalValue) * 100).toFixed(2); // 각 항목의 비율 계산
			return {
				name: item[categoryKey],
				type: "bar",
				stack: "total",
				label: {
					show: true,
					position: "inside",
					formatter: `${percentageValue}%`, // 비율로 표시
					color: "#ffffff",
				},
				data: [percentageValue], // 계산된 백분율 값
				itemStyle: {
					color: color[index % color.length], // 색상 배열에서 색상 선택
					borderRadius:
						index === 0 ? [3, 0, 0, 3] : index === indicate?.length - 1 ? [0, 3, 3, 0] : 0,
				},
			};
		}),
	};

	return (
		<div className="h-[80px] w-full">
			<ReactECharts
				option={options}
				style={{ height: "100%", width: "100%" }}
				theme={theme}
				opts={{ renderer: "svg" }}
			/>
		</div>
	);
}
