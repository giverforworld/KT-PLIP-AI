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
import { markLineChart, otherColorChart } from "@/constants/chart/chartFilter";
import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import { formatDateChart } from "@/utils/chartUtils";
import { useThemeStore } from "@/store/theme";
import { useSearchResultStore } from "@/store/searchResult";

export default function HorizontalBar({ data }: Readonly<ChartProps>) {
	const theme = useThemeStore((s)=> s.theme);
	const searchResult = useSearchResultStore(s=>s.searchResult);
	
	const { statSummary } = searchResult.data;

	const otherColor = otherColorChart.includes(data.dataBox?.name);
	const markLine = markLineChart.includes(data.dataBox?.name);
	const gisLegend = data.dataBox?.name === "gisLegend";
	const gisKamso = data.dataBox?.kamso === true;
	const pathname = usePathname();
	const pageName = pathname.split("/")[1];

	const option = {
		title: statSummary.length > 1 ? data.title : null,
		xAxis: {
			type: "value",
			splitNumber: 5,
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

					let formattedValue: string;
					if (absValue >= 10 ** 3) {
						formattedValue = Math.floor(absValue / 1000).toLocaleString("en-US") + "k";
					} else {
						formattedValue = absValue.toLocaleString();
					}
					return value < 0 ? `-${formattedValue}` : formattedValue;
				},
				interval: 0,
				hideOverlap: true,
			},
		},
		yAxis: {
			type: "category",
			data: data.x,
			inverse: true,
			axisLabel: {
				fontFamily: "Pretendard",
				color:
					pageName === PATHS.REG_DAS
						? theme === "dark"
							? "#9B9B9C"
							: "#75777F"
						: gisLegend
							? "#000"
							: "#75777F",
				show: true,
				interval: 0,
				fontSize: gisLegend ? 11 : 16,
				fontWeight: gisLegend ? "normal" : "semibold",
				formatter: (value: string) => {
					if (gisLegend) {
						return formatDateChart(value);
					} else if (data.x.length > 10) {
						const parts = formatDateChart(value).split(" ");
						return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
					}
					return formatDateChart(value);
				},
			},
			axisLine: {
				show: false,
			},
			axisTick: {
				show: false,
			},
			z: 2,
			barCategoryGap: "10%",
		},
		grid: {
			top: data?.title?.text && !gisLegend ? "8%" : "8px",
			left: "0%",
			right: "5%",
			bottom: data.dataSwipe && !gisLegend ? "20%" : "",
			containLabel: true,
		},
		series: data?.series ? data.series.map((serie: any) => {
			if (otherColor) {
				return {
					...serie,
					itemStyle: {
						color: (params: any) => {
							return data.color[params.dataIndex % data.color.length];
						},
					},
				};
			} else if (markLine) {
				return {
					...serie,
					markLine: {
						symbol: ["none", "none"],
						data: [
							{
								xAxis: 120000,
								label: {
									color: "#FFFFFF",
									backgroundColor: "#414141",
									formatter: `강남구 평균\n 23,231만`,
									linHeight: 70,
									position: "insideEnd",
									padding: [4, 6],
									width: 100,
									height: 40,
									align: "center",
									verticalAlign: "middle",
									borderRadius: 6,
									overflow: "break",
									rotate: 0,
								},
								lineStyle: {
									color: "#414141",
									type: "dashed",
								},
							},
						],
					},
				};
			} else if (gisLegend) {
				return {
					...serie,
					animation: false,
				};
			} else {
				// 기본 처리
				return {
					...serie,
				};
			}
		}):[],
		animation: gisLegend ? false : true,
		// tooltip: data.tooltip,
		tooltip: gisLegend
			? {
					...data.tooltip,
					trigger: "axis",
					appendToBody: true,
				}
			: data.tooltip,
		color: data.color,
	};

	if (data.dataSwipe === true) {
		(option as any).dataZoom =
			// 인구감소지역 , 유입분석
			gisLegend
				? [
						// 	type: "slider",
						// 	orient: "vertical",
						// 	yAxisIndex: 0,
						// 	start: 0, // 처음에는 0%에서 시작
						// 	end: 20, // 처음에 40%만 보여줌
						// },
						// {
						// 	type: "inside",
						// 	orient: "vertical",
						// 	zoomLock: true,
						// 	start: 0,
						// 	end: 100
						// },
						{
							type: "inside",
							orient: "vertical",
							zoomLock: true,
							start: 0,
							end: 100,
						},
					]
				: // : // 유입분석
					// 	gisLegend && !gisKamso
					// 	? [
					// 			{
					// 				type: "inside",
					// 				orient: "vertical",
					// 				zoomLock: true,
					// 				start: 0,
					// 				end: 100,
					// 			},
					// 		]
					[
						{
							type: "slider", // 슬라이더 타입
							start: 0, // 처음에는 0%에서 시작
							end: 40, // 처음에 40%만 보여줌
							bottom: 10,
						},
						{
							type: "inside", // 내부 스크롤
							start: 0,
							end: 20,
						},
					];
	}
	return (
		<ReactECharts
			option={option}
			notMerge={gisLegend ? false : true}
			style={
				pageName === PATHS.REG_DAS
					? { height: `200px` }
					: gisLegend && gisKamso
						? { height: "1500px", overflow: "auto" }
						: gisLegend && !gisKamso
							? {
									height: `${data ? data.x.length * 20 : "200"}px`,
									maxHeight: "1000px",
									overflow: "auto",
								}
							: undefined
			}
		/>
	);
}
