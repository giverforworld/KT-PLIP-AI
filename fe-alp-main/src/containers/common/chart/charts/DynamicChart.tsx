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

import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { formatUnixToString } from "@/libs/gisOptionFunc";
import { useTimeSeriesStatusStore } from "@/store/gis/timeSeriesStatus";

export default function DynamicChart({ data, chartHeight }: Readonly<ChartProps>) {
	const currentIndexRef = useRef(0);
	const [chartOptions, setChartOptions] = useState({});
	const timeStatus = useTimeSeriesStatusStore(s=>s.timeSeriesStatus);
	const setTimeStatus = useTimeSeriesStatusStore((s) => s.setTimeSeriesStatus);

	const generateChartOptions = () => {
		if (!data.x || !timeStatus) return {};
		const currentDateValue = data.x[currentIndexRef.current] ? data.x[currentIndexRef.current] : "";
		return {
			title: data.title,
			xAxis: {
				data: data.x.map((d: string) => formatUnixToString(Number(d), 1)),
				type: "category",
				axisPointer: {
					value: formatUnixToString(Number(currentDateValue), 1), // 안전하게 현재 날짜 값을 설정
					type: "line",
					snap: true,
					lineStyle: {
						color: "#767676",
						width: 2,
					},
					label: {
						show: true,
						formatter: (params: any) => params.value,
						backgroundColor: "#414141",
						margin: `-${chartHeight}`,
					},
					handle: {
						show: true,
						size: 25,
						margin: 5,
					},
				},
				splitLine: { show: false },
			},
			yAxis: {
				type: "value",
				axisLabel: {
					formatter: (value: number) => {
						let val: any = Math.abs(value);
						if (val >= 10 ** 4) {
							val = Number((val / 10000).toFixed(0)).toLocaleString() + " 만";
						} else {
							val = Number(val).toLocaleString();
						}
						return value < 0 ? `-${val}` : val;
					},
					show: true,
					interval: "auto",
				},
			},
			grid: {
				top: data?.title?.text ? "10%" : "5%",
				left: "1%",
				right: "0%",
				bottom: data.dataSwipe ? "20%" : "10%",
				containLabel: true,
			},
			tooltip: {
				...data.tooltip,
				triggerOn: "none",
			},
			series: data?.series ? data.series.map((serie: any) => {
				return {
					...serie,
					// data: arr2,
					type: "line",
					// areaStyle: {
					// 	color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					// 		{ offset: 0, color: "rgba(65, 138, 236, 0.15)" },
					// 		{ offset: 1, color: "rgba(65, 138, 236, 0)" },
					// 	]),
					// },
					showSymbol: false,
				};
			}):[],
			legend: {
				// data: data.series.length >= 2 ? "" : {},
				type: "scroll",
				orient: "horizontal",
				bottom: data.dataSwipe ? "10%" : "bottom",
				icon: "path://M200,-440l0,-80l560,0l0,80L200,-440Z",
				pageIconColor: "#009FE3",
				pageIconInactiveColor: "#E5E7EB",
				pageIconSize: [10, 10],
				pageTextStyle: { color: "#FFFFFF" },
			},
			color: data.color,
			animation: false,
		};
	};

	useEffect(() => {
		setChartOptions(generateChartOptions());
	}, [data, timeStatus, chartHeight]);

	useEffect(() => {
		let intervalId: NodeJS.Timeout | undefined;

		const intervalTime =
			timeStatus.playStatus === 1
				? 3000
				: timeStatus.playStatus === 2
					? 2000
					: timeStatus.playStatus === 3
						? 1000
						: 0;

		if (intervalTime && setTimeStatus) {
			intervalId = setInterval(() => {
				currentIndexRef.current = (currentIndexRef.current + 1) % (data.x?.length || 1);
				const currentDate = Number(data.x[currentIndexRef.current]);
				const currentValue = Math.abs(data.series[0].data[currentIndexRef.current]);
				if (currentDate)
					setTimeStatus({
						...timeStatus,
						currentTime: currentDate,
						currentValue: currentValue,
					});
				else setTimeStatus({ ...timeStatus, currentTime: 0 });
			}, intervalTime);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [data, timeStatus.playStatus]);

	const onChartEvents = {
		updateAxisPointer: (event: any) => {
			const axisValue = event.axesInfo[0]?.value;
			currentIndexRef.current = axisValue;
		},
	};

	const isDataEmpty = !data || Object.keys(data).length === 0 || data.series.length === 0;

	useEffect(() => {
		if (data.x) {
			setTimeStatus({
				...timeStatus,
				isData: data.x[currentIndexRef.current] !== undefined,
				currentTime:
					data.x[currentIndexRef.current] !== undefined
						? Number(data.x[currentIndexRef.current])
						: 0,
			});
		} else {
			setTimeStatus({ ...timeStatus, isData: false });
		}
	}, [isDataEmpty]);
	return (
		<>
			{isDataEmpty ? (
				<div className="flex h-full items-center justify-center text-gray-500">
					해당 기간에 데이터가 없습니다.
				</div>
			) : (
				<ReactECharts
					option={chartOptions}
					onEvents={onChartEvents}
					notMerge={true}
					lazyUpdate={true}
					className="w-full"
					style={{ height: `${chartHeight}px` }}
				/>
			)}
		</>
	);
}
