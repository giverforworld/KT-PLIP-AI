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

import ChartButton from "@/containers/common/chart/ChartButton";
import HorizontalBar from "@/containers/common/chart/charts/HorizontalBar";
import TableGroupChart from "@/containers/common/chart/charts/TableGroupChart";
import React, { useEffect, useState } from "react";
import TableChart from "../common/chart/charts/TableChart";

interface GISChartLegendProps {
	data: any;
	mapIdx: number;
	colors: any;
	labels: any;
	gisSettings: any;
	mapSettings: MapSettings;
	layerType: string;
	regionName: string;
}

export default function GISFlowChartLegend({
	data,
	mapIdx,
	colors,
	labels,
	gisSettings,
	mapSettings,
	layerType,
	regionName,
}: Readonly<GISChartLegendProps>) {
	const label = labels.map((item: any) => {
		const match = item.match(/\d{1,3}(?:,\d{3})*/);
		if (match) {
			return parseInt(match[0].replace(/,/g, ""), 10);
		}
		return null;
	});

	let regionArr: any = [];
	let valueArr: any = [];
	let colorArr: any = [];

	const isSideBarVisible = gisSettings.maps[mapIdx]?.isSideBar;
	const title = gisSettings.analysisType === 0 ? "생활인구" : "";
	const subTitle = gisSettings.isMovingPurpose === true ? "이동목적" : "이동수단";
	const isFlow = mapSettings.inOutFlow === true ? "유입" : "유출";
	const template = {
		title: {
			text: "",
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 70,
		},
		x: regionArr,
		series: [
			{
				name: layerType === "trip" ? " 생활이동" : title,
				type: "bar",
				data: valueArr,
				itemStyle: {
					color: (color: any) => {
						return colorArr[color.dataIndex % colorArr.length];
					},
				},
				label: {
					show: false,
					position: "right",
					color: "#333333",
					fontWeight: "500",
					fontSize: 12,
					fontFamily: "Pretendard",
				},
				barWidth: "",
				labelLayout: {
					hideOverlap: true,
				},
			},
		],
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
		},
		color: [
			"#3473E7",
			"#4580E9",
			"#588EEB",
			"#80AAEE",
			"#6B9CED",
			"#94B9F1",
			"#AAC8F2",
			"#C1D7F5",
			"#D9E6F6",
			"#F1F5F9",
		],
		grid: {},
		dataZoom: {},
		// "dataSwipe": false,
		dataSwipe: true,
		dataBox: {
			regionName: layerType === "adm" ? "1시간 평균 생활인구" : `${isFlow}인구`,
			// name: inflowData,
			name: "gisLegend",
			kamso: false,
			indicate: [],
		},
	};

	let tableArr: any = [];

	// 유입분석
	if (data) {
		data.sort((a: any, b: any) => b.count - a.count);
		data.map((item: any) => {
			regionArr.push(item.regionName.split(" ").at(-1));
			valueArr.push(Math.ceil(item.count));
			if (item.count > label[0]) {
				colorArr.push(colors[0]);
			} else if (item.count > label[1]) {
				colorArr.push(colors[1]);
			} else if (item.count > label[2]) {
				colorArr.push(colors[2]);
			} else if (item.count > label[3]) {
				colorArr.push(colors[3]);
			} else if (item.count > label[4]) {
				colorArr.push(colors[4]);
			} else if (item.count > label[5]) {
				colorArr.push(colors[5]);
			} else {
				colorArr.push(colors[6]);
			}
		});
		for (let i = 0; i < regionArr.length; i++) {
			tableArr.push({
				구분: regionArr[i],
				isFlow: valueArr[i],
			});
		}
		template.dataBox.indicate = tableArr;
	}

	const start = gisSettings.maps[0].startDate.toString();
	const end = gisSettings.maps[0].endDate.toString();
	const time =
		start === end
			? `${end.slice(0, 4)}년 ${end.slice(4, 6)}월`
			: `${end.slice(0, 4)}년 ${end.slice(4, 6)}월 ${start.slice(6, 8)}~${end.slice(6, 8)}일`;

	const [chartTypes, setChartTypes] = useState("horizontalBar");
	const handleTypeChange = (newType: string) => {
		if (newType === "table") {
			setChartTypes("tabel");
		} else {
			setChartTypes("horizontalBar");
		}
	};

	return (
		<div
			className={`absolute bottom-8 w-64 rounded-lg ${mapIdx === 1 ? (isSideBarVisible ? "right-[440px]" : "right-[40px]") : isSideBarVisible ? "left-[440px]" : "left-[40px]"} z-10 bg-white`}
		>
			<div className="m-2 flex max-h-[50vh] flex-col gap-2 overflow-y-auto bg-[#F7F8F9]">
				{/* <div className="text-xs block rounded-lg bg-white w-full relative overflow-y-auto hide-scrollbar"> */}
				{/* <div className="flex place-content-between pt-4">  */}
				<div className="block flex flex-col gap-2 bg-white text-xs font-bold">
					{layerType === "trip" ? (
						<>
							<p>
								{subTitle} {isFlow}분석
							</p>
						</>
					) : (
						<p>{title}</p>
					)}
					<p>{regionName}</p>
					<p>{time}</p>
				</div>
				<div className="hide-scrollbar relative block w-full overflow-y-auto rounded-lg bg-white text-xs">
					<div className="flex place-content-between pt-4">
						<div className="font-bold">
							{layerType === "trip" ? `${isFlow}인구` : "1시간 평균 생활인구"}
						</div>
						<ChartButton
							currentType={chartTypes}
							availableTypes={["horizontalBar", "table"]}
							onChangeType={(newType) => handleTypeChange(newType)}
							isReport={false}
						/>
					</div>
					{chartTypes === "horizontalBar" ? (
						<HorizontalBar data={template} />
					) : (
						<TableChart
							data={template.dataBox}
							xlabel="구분"
							isSingleTable={false}
							title="gisLegend"
							type="table"
							color={[""]}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
