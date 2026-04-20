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

"use client";
import { useEffect, useState } from "react";
import BarChart from "./charts/BarChart";
import PieChart from "./charts/PieChart";
import LineChart from "./charts/LineChart";
import HeatmapChart from "./charts/HeatmapChart";
import HorizontalBar from "./charts/HorizontalBar";
import StackBarChart from "./charts/StackBarChart";
import ButterflyBarChart from "./charts/ButterflyChart";
import RadarChart from "./charts/RadarChart";
import SankeyChart from "./charts/SankeyChart";
import RaceChart from "./charts/RaceChart";
import ScatterChart from "./charts/ScatterChart";
import BumpChart from "./charts/BumpChart";
import TableChart from "./charts/TableChart";
import TableGroupChart from "./charts/TableGroupChart";
import CustomChart from "./charts/CustomChart";
import FullStackBarChart from "./charts/FullStackBarChart";
import PercentageChart from "./charts/PercentageChart";
import CustomPieChart from "./charts/CustomPieChart";
import {
	ChartOption,
	ButterflyOption,
	PieOption,
	HeatmapOption,
	RadarOption,
	SankeyOption,
	HorizontalOption,
	ScatterOption,
	FullStackOption,
	CustomOption,
	DynamicOption,
	CustomPieOption,
} from "./ChartOptions";
import DynamicChart from "./charts/DynamicChart";
import MapChart from "./charts/MapChart";

export default function ChartContext({
	name,
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	chartHeight,
	isSingleTable,
	isExceptionalChart,
	labels,
	chartUnit,
	regionInfo,
	isReport,
}: Readonly<ChartContext>) {
	const [graphdata, setGraphdata] = useState({});
	const [dynamicOption, setDynamicOption] = useState({});
	const [pieOption, setPieOption] = useState({});
	const [butterflyOption, setButterflyOption] = useState({});
	const [heatmapOption, setHeatmapOption] = useState({});
	const [radarOption, setRadarOption] = useState({});
	const [sankeyOption, setSankeyOption] = useState({});
	const [horizontalOption, setHorizontalOption] = useState({});
	const [scatterOption, setScatterOption] = useState({});
	const [fullStackOption, setFullStackOption] = useState({});
	const [customOption, setCustomOption] = useState({});

	useEffect(() => {
		if (
			type !== "pie" &&
			type !== "heatmap" &&
			type !== "butterfly" &&
			type !== "radar" &&
			type !== "sankey" &&
			type !== "horizontalBar" &&
			type !== "scatter" &&
			type !== "fullStack" &&
			type !== "race" &&
			type !== "bump" &&
			type !== "custom" &&
			type !== "customStack" &&
			type !== "customFullStack" &&
			type !== "percentage" &&
			type !== "map"
		) {
			const chartOpt = ChartOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setGraphdata(chartOpt);
		}
		if (type === "dynamic") {
			if (labels !== undefined) {
				const dynamicOpt = DynamicOption({
					title,
					data,
					type,
					xlabel,
					color,
					dataSwipe,
					chartLabelShow,
					isExceptionalChart,
					labels,
					chartUnit,
				});
				setDynamicOption(dynamicOpt);
			} else {
				const dynamicOpt = ChartOption({
					title,
					data,
					type,
					xlabel,
					color,
					dataSwipe,
					chartLabelShow,
					isExceptionalChart,
					labels,
					chartUnit,
				});
				setDynamicOption(dynamicOpt);
			}
		}

		if (type === "pie") {
			const pieOpt = PieOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
				isReport,
			});
			setPieOption(pieOpt);
		}

		if (type === "heatmap") {
			const heatmapOpt = HeatmapOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setHeatmapOption(heatmapOpt);
		}

		if (type === "butterfly") {
			const butterflyOpt = ButterflyOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setButterflyOption(butterflyOpt);
		}

		if (type === "radar") {
			const radarOpt = RadarOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setRadarOption(radarOpt);
		}

		if (type === "sankey") {
			const sankeyOpt = SankeyOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setSankeyOption(sankeyOpt);
		}

		if (type === "horizontalBar") {
			const horizontalOpt = HorizontalOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setHorizontalOption(horizontalOpt);
		}

		if (type === "scatter") {
			const scatteryOpt = ScatterOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setScatterOption(scatteryOpt);
		}

		if (type === "fullStack") {
			const fullStackOpt = FullStackOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				summary,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setFullStackOption(fullStackOpt);
		}

		if (["custom", "customStack", "customFullStack"].includes(type)) {
			const customOpt = CustomOption({
				title,
				data,
				type,
				xlabel,
				color,
				dataSwipe,
				chartLabelShow,
				isExceptionalChart,
				chartUnit,
			});
			setCustomOption(customOpt);
		}
	}, [
		title,
		data,
		type,
		xlabel,
		color,
		dataSwipe,
		summary,
		chartLabelShow,
		isExceptionalChart,
		chartUnit,
		,
		labels,
	]);

	return (
		<>
			{(() => {
				switch (type) {
					case "line":
						return <LineChart data={graphdata} name={name} {...{ chartHeight }} />;
					case "dynamic":
						return <DynamicChart data={dynamicOption} name={name} {...{ chartHeight }} />;
					case "stack":
						return <StackBarChart data={graphdata} />;
					case "fullStack":
						return <FullStackBarChart data={fullStackOption} />;
					case "horizontalBar":
						return <HorizontalBar data={horizontalOption} />;
					case "pie":
						return <PieChart data={pieOption} />;
					case "heatmap":
						return <HeatmapChart data={heatmapOption} />;
					case "butterfly":
						return <ButterflyBarChart data={butterflyOption} />;
					case "radar":
						return <RadarChart data={radarOption} />;
					case "sankey":
						return <SankeyChart data={sankeyOption} />;
					case "scatter":
						return <ScatterChart data={scatterOption} />;
					case "race":
						return (
							<RaceChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								dataSwipe={dataSwipe}
								summary={summary}
								chartUnit={chartUnit}
							/>
						);
					case "bump":
						return (
							<BumpChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								dataSwipe={dataSwipe}
								summary={summary}
								chartUnit={chartUnit}
							/>
						);
					case "table":
						return (
							<TableChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								dataSwipe={dataSwipe}
								summary={summary}
								isSingleTable={isSingleTable}
								chartUnit={chartUnit}
							/>
						);
					case "tableGroup":
						return (
							<TableGroupChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								dataSwipe={dataSwipe}
								summary={summary}
								isSingleTable={isSingleTable}
								chartUnit={chartUnit}
							/>
						);
					case "custom":
					case "customStack":
					case "customFullStack":
						return <CustomChart data={customOption} />;
					case "percentage":
						return (
							<PercentageChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								chartUnit={chartUnit}
							/>
						);
					case "map":
						return (
							<MapChart
								data={data}
								title={title}
								type={type}
								xlabel={xlabel}
								color={color}
								chartUnit={chartUnit}
								regionInfo={regionInfo}
							/>
						);
					default:
						return <BarChart data={graphdata} {...{ chartHeight }} />;
				}
			})()}
		</>
	);
}
