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
import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import { useThemeStore } from "@/store/theme";
import { useSearchResultStore } from "@/store/searchResult";

export default function LineChart({ data, chartHeight }: Readonly<ChartProps>) {
	const theme = useThemeStore((s)=> s.theme);
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;
	
	const seriesData: { name: string }[] = data.series || [];
	const pathname = usePathname();
	const pageName = pathname.split("/")[1];

	const option: any = {
		title: statSummary.length > 1 ? data.title : null,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: function (params: any) {
				const xAxisValue = params[0].axisValue || ""; // x축 값
				const seriesInfo = params
					.map((item: any) => {
						if (item.value === undefined || item.value === null) {
							return "";
						}
						return `${item.marker} ${item.seriesName}: ${item.value.toLocaleString()}`;
					})
					.filter(Boolean)
					.join("<br>");
				return `${formatDateChart(xAxisValue)}<br>${seriesInfo}`;
			},
		},
		xAxis: {
			type: "category",
			data: data.x,
			axisTick: {
				show: true,
				alignWithLabel: true,
				interval: 0,
			},
			axisLine: { show: false },
			axisLabel: {
				show: true,
				fontSize: 12,
				fontFamily: "Pretendard",
				color: pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#75777F") : "#75777F",
				hideOverlap: true,
				formatter: (value: string) => {
					if (data.x.length > 10) {
						const parts = formatDateChart(value).split(" ");
						return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
					}
					return formatDateChart(value);
				},
			},
			...(data.dataBox &&
				data.dataBox.name?.includes("gis") && {
					axisPointer: {
						position: "top",

						value: data.x[0],
						type: "line",
						snap: true,
						lineStyle: {
							color: "#7581BD",
							width: 2,
						},
						label: {
							show: true,
							formatter: function (params: any) {
								return params.value;
							},
							backgroundColor: "#7581BD",
						},
						handle: {
							show: true,
							color: "#7581BD",
						},
					},
				}),
		},
		yAxis: {
			type: "value",
			splitLine: {
				show: true,
				lineStyle: {
					color: pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#ddd") : "#ddd",
				},
			},
			axisLabel: {
				fontFamily: "Pretendard",
				color: pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#75777F") : "#75777F",
				formatter: (value: number) => {
					const absValue = Math.abs(value);

					const formattedValue =
						absValue >= 10 ** 3
							? (absValue / 1000).toLocaleString("en-US") + "k"
							: absValue.toLocaleString("en-US");

					return value < 0 ? `-${formattedValue}` : formattedValue;
				},
				show: true,
				interval: 0,
			},
		},

		series: data.series ? data.series : [],
		legend: {
			data: seriesData.length >= 2 ? "" : {},
			type: "scroll",
			orient: "horizontal",
			bottom: data.dataSwipe ? "10%" : "bottom",
			textStyle: {
				color: theme === "dark" ? "#ffffff" : "#000000",
			},
			icon: "path://M200,-440l0,-80l560,0l0,80L200,-440Z",
			pageIconColor: "#009FE3",
			pageIconInactiveColor: "#E5E7EB",
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
		option.dataZoom = [
			{
				type: "slider",
				start: 0,
				end: 40,
				bottom: 5,
				height: 15,
			},
			{
				type: "inside",
				start: 0,
				end: 20,
			},
		];
	}
	return (
		<ReactECharts
			option={option}
			notMerge={true}
			style={chartHeight ? { height: `${chartHeight}px `, width: "100%" } : undefined}
		/>
	);
}
