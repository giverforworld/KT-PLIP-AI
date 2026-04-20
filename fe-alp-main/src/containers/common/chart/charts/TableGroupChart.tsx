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

import React, { useState, useRef, useEffect } from "react";
import Pre from "@images/chartIcon/pre.svg";
import Next from "@images/chartIcon/next.svg";
import {
	AlpTableChart,
	LlpTableChart,
	mopTableChart,
	AlpTableCharts,
	LlpTableCharts,
	mopTableCharts,
	rankChartHeader,
	rankingChart,
} from "@/constants/chart/chartFilter";
import { usePathname } from "next/navigation";
import { formatDate } from "@/utils/chartUtils";
import Tooltip from "@/components/tooltipv2/Tooltipv2";
import IconInfo from "@images/info.svg";
import ArrowUp from "@images/chartIcon/rankUp.svg";
import ArrowDown from "@images/chartIcon/rankDown.svg";

interface DataItem {
	[key: string]: any;
}

export default function TableGroupChart({ data, xlabel }: Readonly<ChartContext>) {
	const [count, setCount] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const containerRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [buttonPosition, setButtonPosition] = useState({ left: 0, top: 0 });
	const [openTooltip, setOpenTooltip] = useState(false);

	useEffect(() => {
		if (containerRef.current && buttonRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect();
			const buttonRect = buttonRef.current.getBoundingClientRect();

			const relativeLeft = buttonRect.left - containerRect.left;
			const relativeTop = buttonRect.top - containerRect.top;

			setButtonPosition({ left: relativeLeft, top: relativeTop });
		}
	}, [buttonRef]);

	const handleClick = () => setOpenTooltip((prev) => !prev);

	const TableColgroup = () => (
		<colgroup>
			<col className="w-1/6" />
			<col className="w-auto" />
			<col className="w-auto" />
			<col className="w-auto" />
			<col className="w-auto" />
		</colgroup>
	);
	let yData: Record<string, number> = {};

	const transformDataForCharts = (data: ChartData[]): { charts: MergedChartData[] } => {
		const charts = data.reduce((acc: MergedChartData[], item: ChartData) => {
			if (!("indicate" in item) || !("regionName" in item)) {
				return acc;
			}

			const baseItem = item as BaseChartData;
			if (!baseItem.indicate || baseItem.indicate.length === 0) {
				return acc;
			}

			let chartGroup = acc.find((group: MergedChartData) => group.name === baseItem.name);

			if (!chartGroup) {
				chartGroup = { name: baseItem.name, data: [] };
				acc.push(chartGroup);
			}

			chartGroup.data.push({
				regionName: baseItem.regionName!,
				indicate: baseItem.indicate,
			});

			return acc;
		}, []);

		return { charts };
	};

	const transformedData = transformDataForCharts(Array.isArray(data) ? data : [data]);

	const startIdx: number = (currentPage - 1) * count;
	const endIdx: number = startIdx + count;
	const totalPages = Math.ceil(transformedData.charts[0].data[0].indicate.length / count);
	const getRankingHeader = () => {
		// 조건을 객체로 매핑
		const chartMapping: Record<string, any> = {
			alpRaceDataAvg: AlpTableChart,
			alpRaceDataSum: AlpTableChart,
			alpRaceDataGroupAvg: AlpTableChart,
			alpRaceDataGroupSum: AlpTableChart,
			alpRaceTownDataAvg: AlpTableCharts,
			alpRaceTownDataSum: AlpTableCharts,
			alpRaceTownDataGroupAvg: AlpTableCharts,
			alpRaceTownDataGroupSum: AlpTableCharts,
			llpRaceData: LlpTableChart,
			mopRaceData: mopTableChart,
			llpRaceDataGroup: LlpTableChart,
			mopRaceDataGroup: mopTableChart,
			mopRaceTownData: mopTableCharts,
			mopRaceTownDataGroup: mopTableCharts,
		};

		// 매핑된 값을 반환, 기본값은 `AlpTableChart`
		return chartMapping[transformedData.charts[0].name] || AlpTableChart;
	};
	const rankHeader = rankChartHeader.includes(transformedData.charts[0].name);
	const renderTable = () => {
		const dataKey = Object.keys(transformedData.charts[0].data[0].indicate[0]).filter(
			(key) => key !== xlabel,
		);

		// 비교화면 각차트 범례
		return dataKey.length > 1 ? (
			<div className="max-w-screen relative">
				<table className="min-w-full table-auto border-collapse border-b border-t border-gray-300 text-center text-sm">
					<TableColgroup />
					<thead>
						<tr className="bg-gray-100">
							<th
								rowSpan={2}
								colSpan={2}
								className="sticky left-0 top-0 z-20 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2"
							>
								<p>{xlabel}</p>
							</th>
							{Array.from({ length: 4 }).map((_, index) => (
								<th
									key={index}
									className="sticky left-[150px] top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
								>
									<p>{transformedData.charts[0].data[index]?.regionName || "-"}</p>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{transformedData.charts[0].data[0].indicate.map((item: any, index: number) => {
							const populationTypes = Object.keys(item).filter((key) => key !== xlabel);

							return (
								<React.Fragment key={index}>
									{populationTypes.map((type, typeIndex) => (
										<tr key={`${index}-${typeIndex}`}>
											{/* 구분 열 (rowSpan으로 구분 날짜 표시) */}
											{typeIndex === 0 && (
												<td
													rowSpan={populationTypes.length}
													className="sticky left-0 z-10 min-w-[150px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2"
												>
													<p>{formatDate(item[xlabel])}</p>
												</td>
											)}
											{/* 인구 유형 (남성, 여성 등) */}
											<td className="sticky left-[150px] z-10 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
												<p>{type}</p>
											</td>

											{/* 각 region에 대한 값 표시 */}
											{transformedData.charts[0].data.map((region, regionIndex) => {
												const matchedIndicate = region.indicate[index];
												const value =
													matchedIndicate[type] !== undefined ? matchedIndicate[type] : "-";

												return (
													<td
														key={`${regionIndex}-${type}`}
														className="border-b border-gray-300 px-4 py-2"
													>
														<p>
															{typeof value === "number" ? value.toLocaleString("ko-KR") : value}
														</p>
													</td>
												);
											})}

											{/* 빈 셀 추가하여 4개 열 채우기 */}
											{Array.from({
												length: 4 - transformedData.charts[0].data.length,
											}).map((_, i) => (
												<td
													key={`empty-${i}`}
													className="border-b border-gray-300 px-4 py-2 text-textGray"
												>
													<p>-</p>
												</td>
											))}
										</tr>
									))}
								</React.Fragment>
							);
						})}
					</tbody>
				</table>

				{/* 셀렉트 박스 및 페이지네이션 */}
				{/* <div className="mt-4 flex items-center justify-end">
			<div className="flex items-center">
				<label htmlFor="dataCount" className="mr-2 text-sm text-textGray">
					Rows per page:
				</label>
				<select
					id="dataCount"
					className="rounded border px-2 py-1 text-sm"
					value={count}
					onChange={(e) => {
						setCount(Number(e.target.value));
						setCurrentPage(1); // 페이지 변경 시 첫 페이지로 이동
					}}
				>
					<option value={10}>10</option>
					<option value={30}>30</option>
				</select>
			</div>

			<div className="flex items-center">
				<button
					className="p-2"
					disabled={currentPage === 1}
					onClick={() => setCurrentPage(currentPage - 1)}
				>
					<Pre />
				</button>
				<span className="mx-1">
					{currentPage} of {totalPages}
				</span>
				<button
					className="p-2"
					disabled={currentPage === totalPages}
					onClick={() => setCurrentPage(currentPage + 1)}
				>
					<Next />
				</button>
			</div>
		</div> */}
			</div>
		) : (
			// 비교화면 각차트
			<div className="max-w-screen relative">
				<table className="min-w-full table-auto border-collapse border-b border-t border-gray-300 text-center text-sm">
					<TableColgroup />
					<thead>
						<tr className="bg-gray-100">
							<th className="sticky left-0 top-0 z-10 min-w-[150px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
								<p>{xlabel}</p>
							</th>
							{Array.from({ length: 4 }).map((_, index) => (
								<th
									key={index}
									className="sticky left-[150px] top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
								>
									<p>{transformedData.charts[0].data[index]?.regionName || "-"}</p>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{transformedData.charts[0].data[0].indicate.map((item: any, index: number) => (
							<tr key={index}>
								<td className="sticky left-0 z-10 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
									<p>{item[xlabel]}</p>
								</td>
								{Array.from({ length: 4 }).map((_, i) => {
									const region = transformedData.charts[0].data[i];
									const matchedIndicate = region
										? region.indicate.find(
												(indicateItem: any) => indicateItem[xlabel] === item[xlabel],
											)
										: null;
									const valueKey = matchedIndicate
										? Object.keys(matchedIndicate).find((key) => key !== xlabel)
										: null;
									const value = matchedIndicate && valueKey ? matchedIndicate[valueKey] : "-";

									return (
										<td key={i} className="border-b border-t border-gray-300 px-4 py-2">
											<p>{typeof value === "number" ? value.toLocaleString("ko-KR") : value}</p>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	const alp = [
		"alpRaceDataAvg",
		"alpRaceDataGroupAvg",
		"alpRaceTownDataAvg",
		"alpRaceTownDataGroupAvg",
	];
	const llp = ["llpRaceData", "llpRaceDataGroup"];
	const isRank = rankingChart.includes(transformedData.charts[0].name);

	const isLlpRaceData = llp.includes(transformedData.charts[0].name);
	const isAlpRaceData = alp.includes(transformedData.charts[0].name);

	if (isRank) {
		const sortedRaceData = transformedData.charts[0].data[0]?.indicate || []; // 안전하게 기본값 설정
		sortedRaceData.forEach((d: DataItem) => {
			Object.keys(d).forEach((key) => {
				if (key !== xlabel) {
					if (!yData[key]) {
						yData[key] = 0;
					}
					yData[key] += d[key];
				}
			});
		});
	}
	const dayCount = transformedData.charts[0].data[0]?.indicate.length || 1;
	const rankedData = Object.keys(yData)
		.map((key) => ({ region: key, sum: yData[key] }))
		.sort((a, b) => b.sum - a.sum)
		.map((item, index) => ({
			rank: index + 1,
			region: item.region,
			sum: isAlpRaceData ? Math.round(item.sum / dayCount) : item.sum,
		}));

	// 추가 조건 처리
	const additionalData =
		transformedData.charts[0].data[1]?.indicate &&
		transformedData.charts[0].data[1].indicate.length > 0
			? transformedData.charts[0].data[1].indicate
			: []; // 조건에 맞지 않으면 빈 배열 반환

	const additionalValues = Object.entries(additionalData[0] || {})
		.filter(([key]) => key !== "구분")
		.map(([, value]) => value);

	const mergedTableData = rankedData.map((item, index) => ({
		...item,
		additionalValue: additionalValues[index] ?? "-",
	}));

	const renderRankingTable = () => {
		const rankingHeaders = getRankingHeader();
		return (
			<div ref={containerRef} className="flex max-h-[500px] w-full flex-col">
				{/* 헤더 영역 */}
				<div
					className={`grid border-collapse ${
						rankHeader ? "grid-cols-6" : "grid-cols-5"
					} gap-2 rounded-md bg-tableGray p-2 text-sm font-bold text-textGray`}
				>
					{rankingHeaders.map((header: string, index: number) => (
						<div
							key={index}
							className={`flex items-center ${
								rankHeader ? (index >= 4 ? "ml-auto" : "") : index >= 3 ? "ml-auto" : ""
							} ml-2`}
						>
							<p>{header}</p>

							{/* llpRaceData일 때 마지막 헤더에만 버튼 추가 */}
							{isLlpRaceData && index === rankingHeaders.length - 1 && (
								<>
									<button ref={buttonRef} onClick={handleClick} className="ml-2 flex items-center">
										<IconInfo className="text-textLightGray" />
									</button>
									{openTooltip && buttonPosition && (
										<Tooltip setOpenTooltip={setOpenTooltip} buttonPosition={buttonPosition}>
											<p>체류인구를 주민등록인구로 나눈 값</p>
										</Tooltip>
									)}
								</>
							)}
						</div>
					))}
				</div>

				{/* 데이터 영역 */}
				<div className="custom-scrollbar grow overflow-x-auto">
					{mergedTableData.map((item, index) => {
						const regionParts = item.region.split(" ");
						let firstPart = "";
						let secondPart = "";
						let thirdPart = "";

						if (regionParts.length === 4 && rankHeader) {
							firstPart = regionParts[0];
							secondPart = regionParts[1] + " " + regionParts[2];
							thirdPart = regionParts[3];
						} else if (regionParts.length === 3 && rankHeader) {
							firstPart = regionParts[0];
							secondPart = regionParts[1];
							thirdPart = regionParts[2];
						} else if (regionParts.length === 3) {
							firstPart = regionParts[0];
							secondPart = regionParts[1] + " " + regionParts[2];
						} else {
							firstPart = regionParts[0];
							secondPart = regionParts[1];
							thirdPart = regionParts[2];
						}

						return (
							<div
								key={index}
								className={`grid ${
									rankHeader ? "grid-cols-6" : "grid-cols-5"
								} my-1 gap-2 rounded-md border border-borderGray text-sm ${
									index < 3 ? "border-white bg-tableBlue bg-opacity-20 text-tableBlue" : ""
								}`}
							>
								<div
									className={`m-1.5 flex h-6 w-6 items-center justify-center rounded-md p-2 text-center ${
										index < 3 ? "bg-white font-semibold text-tableBlue" : "bg-tableGray text-black"
									}`}
								>
									<p>{item.rank}</p>
								</div>
								<p className="p-2">{firstPart}</p>
								<p className="p-2">{secondPart}</p>
								{rankHeader && <p className="p-2">{thirdPart}</p>}
								<p className="p-2 text-right">{item.sum.toLocaleString()}</p>
								{isLlpRaceData ? (
									<p className="p-2 text-right">{item.additionalValue}</p>
								) : item.additionalValue && !isNaN(Number(item.additionalValue)) ? (
									Number(item.additionalValue) < 0 ? (
										<p className="flex items-center justify-end p-2 text-right">
											<ArrowDown className="mr-1" /> {item.additionalValue} %
										</p>
									) : (
										<p className="flex items-center justify-end p-2 text-right">
											<ArrowUp className="mr-1" /> {item.additionalValue} %
										</p>
									)
								) : (
									<p className="p-2 text-right">-</p>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="mt-1 h-full w-full">
			<div
				className={` ${isRank ? "" : "custom-scrollbar max-h-[400px] overflow-x-auto overflow-y-auto"} `}
			>
				{isRank ? renderRankingTable() : renderTable()}
			</div>
		</div>
	);
}
