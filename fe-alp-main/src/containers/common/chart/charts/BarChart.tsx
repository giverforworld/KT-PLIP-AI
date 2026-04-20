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
import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { PATHS } from "@/constants/path";
import { usePathname } from "next/navigation";
import {
	otherColorChart,
	barGradientChart,
	markLineChart,
	averageValuechart,
	maxMinChart,
	popUp,
	rowSpanChart,
	percentValueChart,
	// averageLinechart,
} from "@/constants/chart/chartFilter";
import { formatDateChart } from "@/utils/chartUtils";
import { useThemeStore } from "@/store/theme";
import { useSearchResultStore } from "@/store/searchResult";

export default function BarChart({ data, chartHeight }: Readonly<ChartProps>) {
	const pathname = usePathname();
	const pageName = pathname.split("/")[1];
	const theme = useThemeStore((s)=> s.theme);	
	const seriesData = data.series || [];
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;
	const otherColor = otherColorChart.includes(data.dataBox?.name);
	const gradient = barGradientChart.includes(data.dataBox?.name);
	const popUpTitle = popUp.includes(data.dataBox?.name); // alp 도움말 소멸단계차트
	const markLine = markLineChart.includes(data.dataBox?.name); //llp 평균체류일수. . . (비교화면) 차트
	const average = averageValuechart.includes(data.dataBox?.name); //llp 체류시간별 인구교 차트
	const maxMin = maxMinChart.includes(data.dataBox?.name); // llp 주민등록현황대비 차트
	const rowSpan = rowSpanChart.includes(data.dataBox?.name);

	const xAxisData = markLine ? data.x.slice(1) : data.x;
	const [isRendered, setIsRendered] = useState(false);

	useEffect(() => {
		setIsRendered(true);
	}, []);

	if (!isRendered) {
		return null;
	}
	const option = {
		title: statSummary.length > 1 ? data.title : null,
		xAxis: [
			{
				type: "category",
				data: xAxisData,
				axisTick: { show: false },
				axisLine: { show: false },
				axisLabel: {
					show: true,
					fontSize: 12,
					fontFamily: "Pretendard",
					color:
						pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#75777F") : "#75777F",
					interval: 0,
					hideOverlap: true,
					formatter: (value: string) => {
						if (pageName === PATHS.DAS) {
							if (value.includes("특별")) {
								return value.length > 5 ? value.slice(0, 4) + "..." : value;
							}
						}
						if (data.x.length > 10) {
							const parts = formatDateChart(value).split(" ");
							return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
						}
						return formatDateChart(value);
					},
				},
			},
		],
		yAxis: [
			{
				type: "value",
				max:
					data.isExceptionalChart || percentValueChart.includes(data.dataBox.name)
						? undefined
						: data.chartUnit === "%"
							? 100
							: undefined,
				// max: () => {
				// 	if (markLine) {
				// 		const dataMax = Math.max(...option.series.flatMap((serie) => serie.data));
				// 		const markLineMax = Math.max(
				// 			...option.series.flatMap(
				// 				(serie) => serie.markLine?.data?.map((line) => line.yAxis || 0) || [],
				// 			),
				// 		);

				// 		// 데이터 최대값과 마크라인 최대값 중 더 큰 값 선택
				// 		const maxValue = Math.max(dataMax, markLineMax);

				// 		// 가장 가까운 올림된 단위로 맞춤
				// 		const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue))); // 자리수 계산
				// 		const roundedMax = Math.ceil(maxValue / magnitude) * magnitude; // 올림된 최대값 계산
				// 		return roundedMax;
				// 	}

				// 	// 기본 조건
				// 	if (data.isExceptionalChart) {
				// 		return undefined; // 예외 차트는 max 자동 계산
				// 	}

				// 	if (data.chartUnit === "%") {
				// 		return 100; // 백분율 차트는 100 고정
				// 	}

				// 	return undefined; // y축 max 자동
				// },
				axisLabel: {
					formatter: (value: number) => {
						const absValue = Math.abs(value);
						let formattedValue: string;
						if (data.isExceptionalChart && data.chartUnit === "%") {
							formattedValue =
								absValue >= 10 ** 3
									? Math.floor(absValue / 1000).toLocaleString("en-US") + "k"
									: absValue.toLocaleString();
							return value < 0 ? `-${formattedValue}` : formattedValue;
						}

						if (data.isExceptionalChart) {
							formattedValue =
								absValue >= 10 ** 3
									? Math.floor(absValue / 1000).toLocaleString("en-US") + "k"
									: absValue.toLocaleString();
							return value < 0 ? `-${formattedValue}` : formattedValue;
						}

						if (data.chartUnit === "%") {
							return `${absValue}%`;
						}

						formattedValue =
							absValue >= 10 ** 3
								? Math.floor(absValue / 1000).toLocaleString("en-US") + "k"
								: absValue.toLocaleString();
						return value < 0 ? `-${formattedValue}` : formattedValue;
					},
					show: true,
					interval: 0,
					fontFamily: "Pretendard",
					color:
						pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#75777F") : "#75777F",
				},
				splitLine: {
					show: true,
					lineStyle: {
						color: pageName === PATHS.REG_DAS ? (theme === "dark" ? "#9B9B9C" : "#ddd") : "#ddd",
					},
				},
			},
		],
		tooltip: data.tooltip,
		series: data?.series ? data.series.map((seriesItem: any) => {
			if (otherColor) {
				return {
					...seriesItem,
					itemStyle: {
						color: (params: any) => {
							return data.color[params.dataIndex % data.color.length];
						},
					},
				};
			}
			//alp 도움말 차트
			if (popUpTitle) {
				const averageValue =
					data.series[0].data.reduce((sum: number, val: number) => sum + val, 0) /
					data.series[0].data.length;

				const closestIndex = data.series[0].data.reduce(
					(closestIdx: number, currentVal: number, currentIndex: number) => {
						const closestVal = data.series[0].data[closestIdx];
						return Math.abs(currentVal - averageValue) < Math.abs(closestVal - averageValue)
							? currentIndex
							: closestIdx;
					},
					0,
				);

				const averageCityName = data.x[closestIndex];
				return {
					...seriesItem,
					markPoint: {
						data: [
							{
								type: "average",
								name: "평균값",
								symbol: "roundRect",
								symbolSize: [140, 40],
								symbolOffset: [0, -100],
								label: {
									formatter: "평균\n{c}",
									position: "inside",
									color: "#FFFFFF",
									fontSize: 12,
									padding: [4, 6],
									width: 105,
									height: 40,
									align: "center",
									verticalAlign: "middle",
									borderRadius: 10,
									backgroundColor: "#414141",
								},
								itemStyle: {
									color: "#ffffff",
								},
							},
						],
					},
					markLine: {
						symbol: ["none", "none"],
						data: [
							{
								xAxis: averageCityName,
								lineStyle: {
									type: "dashed",
									color: "#414141",
								},
								label: { show: false },
							},
							{
								yAxis: 1.0,
								label: {
									color: "#F9C74F",
									formatter: "주의단계",
									position: "insideEndTop",
								},
								lineStyle: {
									color: "#F9C74F",
									type: "dashed",
								},
							},
							{
								yAxis: 0.5,
								label: {
									color: "#FB5A00",
									formatter: "소멸위험진입단계",
									position: "insideEndTop",
								},
								lineStyle: {
									color: "#FB5A00",
									type: "dashed",
								},
							},
							{
								yAxis: 0.2,
								label: {
									color: "#DD1413",
									formatter: "소멸고위험단계",
									position: "insideEndTop",
								},
								lineStyle: {
									color: "#DD1413",
									type: "dashed",
								},
							},
						],
					},
				};
			}

			// 그라데이션 이용
			if (gradient) {
				const gradientColorsForSeries = [
					[
						"#0E3377",
						"#12429B",
						"#144AAD",
						"#1752C0",
						"#195AD2",
						"#1B62E4",
						"#2D6EE6",
						"#3F7BE8",
						"#5287EB",
						"#6494ED",
						"#76A1EF",
						"#88ADF1",
						"#9BBAF3",
						"#ADC6F5",
						"#BFD3F7",
						"#D1E0FA",
						"#E4ECFC",
					], // 첫 번째 시리즈의 색상 계열
					[
						"#155955",
						"#2D6C69",
						"#34807B",
						"#42A19B",
						"#47ADA8",
						"#4DBDB6",
						"#5CC2BD",
						"#6CC9C4",
						"#79CCC7",
						"#87D1CD",
						"#96D6D3",
						"#ADE5E3",
						"#B7E7E5",
						"#C7EEEC",
						"#D3F2F1",
						"#DFF3F2",
						"#E6F6F5",
					], // 두 번째 시리즈의 색상 계열
				];

				return {
					...seriesItem,
					itemStyle: {
						color: (params: any) => {
							const seriesIndex = params.seriesIndex; // 시리즈 인덱스
							const gradientColors = gradientColorsForSeries[seriesIndex]; // 시리즈별 색상 배열
							const colorIndex = params.dataIndex % gradientColors.length; // 데이터별 색상 인덱스
							return gradientColors[colorIndex];
						},
					},
				};
			}
			// llp 평균 체류시간, 체류일수, 숙박일수 차트
			if (markLine) {
				const firstIndex = 0;
				const firstCategory = data.x[firstIndex];
				const firstValue = seriesItem.data[firstIndex];
				const barData = seriesItem.data.slice(1);
				return {
					...seriesItem,
					data: barData,
					barWidth: "50%",
					markLine: {
						symbol: ["none", "none"],
						data: [
							{
								xAxis: firstCategory, // x축의 첫 번째 값
								yAxis: firstValue, // y축의 첫 번째 값
								lineStyle: {
									type: "dashed",
									color: "#414141",
								},
								label: {
									show: true,
									formatter: `인구감소평균\n{c}`,
									position: "end",
									align: "center",
									backgroundColor: "#414141",
									color: "#FFFFFF",
									padding: [4, 6],
									borderRadius: 4,
								},
							},
						],
					},
				};
			}
			// llp 체류시간별 인구 비교 차트
			if (average) {
				const baseIndex = data.x.findIndex((label: any) => label.includes("3시간"));
				const twoIndex = data.x.findIndex((label: any) => label.includes("2시간"));
				const thrIndex = data.x.findIndex((label: any) => label.includes("1시간"));

				const baseValue = data.series.map((seriesItem: any) => seriesItem.data[baseIndex]);
				const twoValue = data.series.map((seriesItem: any) => seriesItem.data[twoIndex]);
				const thrValue = data.series.map((seriesItem: any) => seriesItem.data[thrIndex]);

				const isHigher = baseValue[0] < twoValue[0];
				const isHigh = baseValue[0] < thrValue[0];
				return {
					...seriesItem,
					itemStyle: {
						color: (params: any) => {
							if (params.dataIndex === baseIndex) {
								return data.color[0];
							} else {
								return data.color[1];
							}
						},
					},
					markPoint: {
						data: [
							{
								coord: [twoIndex, twoValue[0]],
								label: {
									formatter: () => {
										const difference = Math.abs(twoValue[0] - baseValue[0]);
										return isHigher
											? `+ ${difference.toLocaleString()}`
											: `- ${difference.toLocaleString()}`;
									},
									position: isHigher ? "bottom" : "bottom",
									color: "#FFFFFF",
									fontSize: 12,
									padding: [6, 6],
									align: "center",
									verticalAlign: "middle",
									borderRadius: 10,
									backgroundColor: isHigher ? "#D63457" : "#414141",
								},
								itemStyle: {
									color: "none",
								},
							},
							{
								coord: [thrIndex, thrValue[0]],
								label: {
									formatter: () => {
										const difference = Math.abs(thrValue[0] - baseValue[0]);
										return isHigh
											? `+ ${difference.toLocaleString()}`
											: `- ${difference.toLocaleString()}`;
									},
									position: isHigh ? "bottom" : "bottom",
									color: "#FFFFFF",
									fontSize: 12,
									padding: [6, 6],
									align: "center",
									verticalAlign: "middle",
									borderRadius: 10,
									backgroundColor: isHigh ? "#D63457" : "#414141",
								},
								itemStyle: {
									color: "none",
								},
							},
						],
					},
					markLine: {
						symbol: ["none", "none"],
						data: [
							{
								yAxis: baseValue,
								lineStyle: {
									color: "#418AEC",
									type: "dashed",
								},
								label: { show: false },
							},
						],
					},
				};
			}
			// 주민등록현황비교 차트
			if (maxMin) {
				const baseValue = data.series.map((seriesItem: any) => seriesItem.data[0])[0];
				const secondValue = data.series.map((seriesItem: any) => seriesItem.data[1])[0];
				const isHigher = secondValue > baseValue;
				return {
					...seriesItem,
					itemStyle: {
						color: (params: any) => {
							return data.color[params.dataIndex % data.color.length];
						},
					},
					markLine: {
						lineStyle: isHigher
							? { type: "solid", color: "#D63457", width: 2 } // 높은 경우
							: { type: "solid", color: "#414141", width: 2 }, // 낮은 경우
						data: [
							[
								{
									name: isHigher ? "Above Base" : "Below Base",
									value: baseValue, // 항상 baseValue에서 시작
									coord: [0, baseValue], // 첫 번째 값으로 설정
								},
								{
									coord: [1, secondValue], // 두 번째 값으로 설정
								},
							],
						],
						label: {
							show: true,
							formatter: () => {
								const difference = Math.abs(baseValue - secondValue); // 차이 계산
								const ratio = (secondValue / baseValue).toFixed(1);

								return isHigher
									? `${ratio}배` // higher일 경우
									: `${difference.toLocaleString()}명`; // lower일 경우
							},
							position: "middle",
							backgroundColor: isHigher ? "#D63457" : "#414141", // 라인 색상에 맞춤
							color: "#ffffff",
							padding: [5, 5],
							borderRadius: 10,
						},
					},
				};
			} else {
				return {
					...seriesItem,
				};
			}
		}):[],
		legend: {
			data: seriesData.length >= 2 ? "" : {},
			type: "scroll",
			icon: "circle",
			orient: "horizontal",
			bottom: data.dataSwipe ? "5%" : "bottom",
			textStyle: {
				color: theme === "dark" ? "#ffffff" : "#000000",
			},
			pageIconColor: "#009fe3",
			pageIconInactiveColor: "#e5e7eb",
			pageIconSize: [10, 10],
			pageTextStyle: {
				color: "#FFFFFF",
			},
		},
		color: gradient ? ["#1752C0", "#42A19B"] : data.color,
		grid: {
			top: data?.title?.text ? "10%" : "5%",
			left: markLine ? "5%" : "1%",
			right: markLine ? "5%" : "0%",
			bottom: data.dataSwipe ? "20%" : "10%",
			containLabel: true,
		},
	};

	if (data.dataSwipe === true) {
		(option as any).dataZoom = [
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
		<div
			className="chart-container"
			style={{
				width: rowSpan
					? (() => {
							switch (statSummary.length) {
								case 2:
									return "550px";
								case 3:
									return "340px";
								case 4:
									return "270px";
								default:
									return "250px";
							}
						})()
					: "100%",
				height: rowSpan ? "250px" : chartHeight ? `${chartHeight}px` : "300px",
			}}
		>
			<ReactECharts option={option} notMerge={true} style={{ width: "100%", height: "100%" }} />
		</div>
	);
}
