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
import RoundedBox from "@/components/boxes/RoundedBox";
import ArrowUp from "@images/chartIcon/arrow_up.svg";
import ArrowDown from "@images/chartIcon/arrow_down.svg";
// import ChartSummary from "../ChartSummary";
import { usePathname } from "next/navigation";
import HelperText from "@/components/text/HelperText";
import { PATHS } from "@/constants/path";
import { useSearchResultStore } from "@/store/searchResult";

export default function RadarChart({ data }: Readonly<ChartProps>) {
	const { color, title, legend, radar, series, tooltip, grid } = data;
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];

	const searchResult = useSearchResultStore(s=>s.searchResult);
	
	const { statSummary } = searchResult.data;

	const getTrendClass = (trend: string): string => {
		switch (trend) {
			case "-":
				return "text-black";
			case "down":
				return "text-blue";
			default:
				return "text-primary";
		}
	};

	const renderTrendIcon = (trend: string): React.JSX.Element | null => {
		switch (trend) {
			case "-":
				return null;
			case "down":
				return <ArrowDown />;
			case "up":
				return <ArrowUp />;
			default:
				return null;
		}
	};

	const comparisonData =
		series?.data.length > 1
			? series.data[0].value.map((value: number, index: number) => {
					const currentValue = parseFloat(value.toString());
					const referenceValue = parseFloat(series.data[1]?.value[index]?.toString() || "0");

					if (isNaN(currentValue) || isNaN(referenceValue)) {
						return {
							difference: "-",
							trend: "-",
						};
					}

					const difference = referenceValue - currentValue;
					return {
						difference: difference.toFixed(1),
						trend: difference > 0 ? "up" : "down",
					};
				})
			: [];

	const updatedSeries = series
		? {
				...series,
				data: series.data?.map((dataItem: any, index: number) => ({
					...dataItem,
					lineStyle: {
						color: color[index % color.length],
						width: 2,
					},
					areaStyle: {
						color: color[index % color.length],
						opacity: 0.4,
					},
				})),
			}
		: {
				type: "radar",
				data: [],
			};

	const option = {
		color: color,
		title: statSummary.length > 1 ? title : null,
		legend: legend,
		radar: radar,
		series: updatedSeries,
		tooltip: tooltip,
	};

	return (
		<div className="w-full">
			<ReactECharts option={option} />
			{/* <ChartSummary /> */}
			{rootRoute === PATHS.LLP && <HelperText text="인구감소지역 평균 대비" />}
			<RoundedBox>
				<div className="flex gap-1">
					{radar?.indicator?.length > 0 ? (
						radar.indicator.map((item: any, i: number) => {
							const trendData = comparisonData[i] || {};
							return (
								<RoundedBox key={i} bgColor="bg-white" border padding="p-3" height="120px">
									<div className="flex h-[82px] flex-col justify-between">
										<h4 className="mb-auto mt-3 break-all text-center text-sm font-semibold">
											{item.name || "-"}
										</h4>
										<div className="mt-auto flex items-end justify-center gap-2 pb-3">
											<span className={`text-xs ${getTrendClass(trendData.trend)}`}>
												{trendData.difference ? `${trendData.difference} %` : "-"}
											</span>
											{renderTrendIcon(trendData.trend)}
										</div>
									</div>
								</RoundedBox>
							);
						})
					) : (
						<div className="text-center text-sm text-gray-500">데이터가 없습니다.</div>
					)}
				</div>
			</RoundedBox>
		</div>
	);
}
