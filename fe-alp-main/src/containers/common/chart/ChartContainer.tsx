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

import ChartDataType from "./ChartDataType";
import NestedChartDataType from "./NestedChartDataType";

interface ChartContainerProps {
	data: DataContainer;
	isReport?: boolean;
	chartHeight?: number;
	regionInfo?:Record<string, RegionInfo>;
}

export default function ChartContainer({
	data,
	isReport,
	chartHeight,
	regionInfo,
}: Readonly<ChartContainerProps>) {
	const groupedCharts = data.charts.reduce((acc: any, chart: ChartData) => {
		const groupName = chart.name;
		if (!acc[groupName]) {
			acc[groupName] = [];
		}
		acc[groupName].push(chart);
		return acc;
	}, {});

	const chartGroups = Object.values(groupedCharts);

	const hasMultipleChartsInGroup = chartGroups.some((group: any) => group.length > 1);
	return (
		<>
			{hasMultipleChartsInGroup ? (
				// 비교화면 각차트, 머지드데이터의 테이블차트
				<NestedChartDataType data={data} isReport={isReport} />
			) : (
				// 기본차트, 비교화면 중첩차트
				<ChartDataType data={data} isReport={isReport} {...{ chartHeight }}regionInfo={regionInfo}  />
			)}
		</>
	);
}
