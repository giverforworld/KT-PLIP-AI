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

import React, { useState } from "react";
import Pre from "@images/chartIcon/pre.svg";
import Next from "@images/chartIcon/next.svg";
import {
	sankeyTable,
	singleSankeyTable,
	heatmapChart,
	mopScatter,
} from "@/constants/chart/chartFilter";
import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import { formatDate } from "@/utils/chartUtils";
import { useSearchResultStore } from "@/store/searchResult";
interface DataItem {
	[key: string]: any;
}
interface YDataSum {
	key: string;
	sum: number;
}

export default function TableComponent({
	title,
	data,
	type,
	xlabel,
	color,
	summary,
	isSingleTable,
}: Readonly<ChartContext>) {
	const [count, setCount] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;
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
	let rankedYData: YDataSum[] = [];
	let totalPages: number;

	if ((data as MergedChartData)?.data?.[0]?.indicate) {
		// MergedChartData일 경우
		totalPages = Math.ceil((data as MergedChartData).data[0].indicate.length / count);
	} else {
		// 기본 데이터 테이블일 경우
		totalPages = Math.ceil((data as BaseChartData).indicate.length / count);
	}

	// 페이지네이션 슬라이싱
	const startIdx: number = (currentPage - 1) * count;
	const endIdx: number = startIdx + count;
	const currentRankedData = rankedYData.slice(startIdx, endIdx);

	const handlePaginationChange = (newPage: number) => setCurrentPage(newPage);

	const renderPagination = () => (
		<div className="flex items-center justify-end">
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
					onClick={() => handlePaginationChange(currentPage - 1)}
				>
					<Pre />
				</button>
				<span className="mx-1">
					{currentPage} of {totalPages}
				</span>
				<button
					className="p-2"
					disabled={currentPage === totalPages}
					onClick={() => handlePaginationChange(currentPage + 1)}
				>
					<Next />
				</button>
			</div>
		</div>
	);

	const renderMergedTable = () => {
		const scatter = mopScatter.includes(data.name);
		//생활이동 랭킹분석 스캐터
		if (scatter) {
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								{(data as MergedChartData).data.map((regionData, regionIndex) =>
									regionData.indicate.map((item, i) => (
										<th
											key={`${regionIndex}-${i}`}
											className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
										>
											<p>{item["구분"] || "-"} </p>
										</th>
									)),
								)}
							</tr>
						</thead>
						<tbody>
							{Object.keys((data as MergedChartData).data[0]?.indicate[0] || {})
								.filter((key) => key !== "구분")
								.map((key, idx) => (
									<tr key={idx}>
										<td className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-2 py-2">
											<p>{key} </p>
										</td>
										{(data as MergedChartData).data.map((regionData) =>
											regionData.indicate.map((item, i) => {
												const value = item[key];
												const parsedValue = typeof value === "string" ? parseFloat(value) : value;
												return (
													<td
														key={`${regionData.regionName}-${i}`}
														className="w-[100px] border-b border-gray-300 px-2 py-2"
													>
														<p>
															{value !== undefined
																? !isNaN(parsedValue)
																	? parsedValue.toLocaleString("ko-KR")
																	: value
																: "-"}
														</p>
													</td>
												);
											}),
										)}
									</tr>
								))}
						</tbody>
					</table>
				</div>
			);
		}
		//비교화면 중첩차트 mergedData, custom
		return (
			<div className="max-w-screen relative">
				<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
					<TableColgroup />
					<thead className="bg-gray-100">
						<tr>
							<th
								rowSpan={2}
								colSpan={2}
								className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2"
							>
								<p>{xlabel}</p>
							</th>
							{Array.from({ length: 4 }).map((_, index) => (
								<th
									key={index}
									className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
								>
									<p>{(data as MergedChartData).data[index]?.regionName || "-"}</p>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{(data as MergedChartData).data[0].indicate.map((item: any, index: number) => {
							const populationTypes = Object.keys(item).filter((key) => key !== xlabel);

							return (
								<React.Fragment key={index}>
									{populationTypes.map((type, typeIndex) => (
										<tr key={`${index}-${typeIndex}`}>
											{/* 구분 열 (rowSpan으로 구분 날짜 표시) */}
											{typeIndex === 0 && (
												<td
													rowSpan={populationTypes.length}
													className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-2 py-2"
												>
													<p>{item[xlabel]}</p>
												</td>
											)}
											{/* 인구 유형 (남성, 여성 등) */}
											<td className="sticky left-[150px] z-10 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
												<p>{type}</p>
											</td>

											{/* 각 region에 대한 값 표시 */}
											{(data as MergedChartData).data.map((region, regionIndex) => {
												const value = region.indicate[index][type];
												return (
													<td
														key={`${regionIndex}-${type}`}
														className="border-b border-gray-300 px-4 py-2"
													>
														<p>{value !== undefined ? value.toLocaleString("ko-KR") : "-"}</p>
													</td>
												);
											})}

											{/* 빈 셀 추가하여 4개 열 채우기 */}
											{Array.from({
												length: 4 - (data as MergedChartData).data.length,
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
			</div>
		);
	};

	const renderBasicTable = () => {
		const dataKey =
			data &&
			(data as BaseChartData).indicate &&
			Array.isArray((data as BaseChartData).indicate) &&
			(data as BaseChartData).indicate.length > 0
				? (() => {
						const indicate = (data as BaseChartData).indicate;

						const allKeys = new Set<string>();
						indicate.forEach((d) => {
							Object.keys(d).forEach((key) => {
								allKeys.add(key);
							});
						});

						const adjustedIndicate = indicate.map((d) => {
							const adjustedItem: any = { ...d };
							allKeys.forEach((key) => {
								if (!(key in adjustedItem)) {
									adjustedItem[key] = undefined;
								}
							});
							return adjustedItem;
						});

						// 보정된 배열에서 xlabel을 제외한 키 반환
						return Object.keys(adjustedIndicate[0]).filter((key) => key !== xlabel);
					})()
				: [];
		const regions = (data as BaseChartData).indicate.map((item) => item[xlabel]);
		const sankey = sankeyTable.includes(data.name);
		const singleSankey = singleSankeyTable.includes(data.name);
		const heatmap = heatmapChart.includes(data.name);

		// 각표 테이블
		if (isSingleTable) {
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								{(data as BaseChartData).indicate.map((item: DataItem, index: number) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>{formatDate(item[xlabel]) || "-"}</p>
									</th>
								))}
								{Array.from({
									length: Math.max(0, 4 - (data as BaseChartData).indicate.length),
								}).map((_, index) => (
									<th
										key={`empty-cell-${index}`}
										className="min-w-[100px] border-b border-gray-300 px-4 py-2"
									>
										<p>-</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{dataKey.map((date, index) => (
								<tr key={index}>
									<td className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
										<p>{date}</p>
									</td>
									{(data as BaseChartData).indicate.map((regionData, regionIndex) => (
										<td
											key={`${regionIndex}-${index}`}
											className="min-w-[100px] border-b border-gray-300 px-4 py-2"
										>
											<p>{regionData[date]?.toLocaleString("ko-KR") || "-"}</p>
										</td>
									))}
									{Array.from({
										length: Math.max(0, 4 - (data as BaseChartData).indicate.length),
									}).map((_, index) => (
										<td
											key={`empty-cell-${index}`}
											className="min-w-[100px] border-b border-gray-300 px-4 py-2"
										>
											<p>-</p>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		// 체류인구 맵데이터 확인 후 삭제 예정
		// if (data.name === "llpMapData") {
		// 	const header = ["순위", "시군구", "배수", "전년대비 증감"];
		// 	return (
		// 		<div className="flex max-h-[400px] w-full flex-col">
		// 			<div
		// 				className={`grid border-collapse grid-cols-${header.length} gap-2 rounded-md bg-tableGray p-2 text-sm font-bold text-textGray`}
		// 			>
		// 				{header.map((title, index) => (
		// 					<div key={index} className={`flex ${index > 1 ? "ml-auto text-right" : "ml-2"}`}>
		// 						<span>{title}</span>
		// 					</div>
		// 				))}
		// 			</div>

		// 			<div className="custom-scrollbar grow overflow-x-auto">
		// 				{(data as BaseChartData).indicate.map((item, index) => (
		// 					<div
		// 						key={index}
		// 						className={`m-1 grid grid-cols-${Object.keys(item).length + 1} gap-2 rounded-md border border-borderGray text-sm ${
		// 							index < 3 ? "border-white bg-tableBlue bg-opacity-20 text-tableBlue" : ""
		// 						}`}
		// 					>
		// 						<div
		// 							className={`m-1.5 flex h-6 w-6 items-center justify-center rounded-md p-2 text-center ${
		// 								index < 3 ? "bg-white font-semibold text-tableBlue" : "bg-tableGray text-black"
		// 							}`}
		// 						>
		// 							<span>{index + 1}</span>
		// 						</div>
		// 						{Object.entries(item).map(([key, value], idx) => (
		// 							<div key={idx} className={`p-2 ${typeof value === "number" ? "text-right" : ""}`}>
		// 								<span>{value}</span>
		// 							</div>
		// 						))}
		// 					</div>
		// 				))}
		// 			</div>
		// 		</div>
		// 	);
		// }

		// 히트맵 테이블표
		if (heatmap) {
			const heatmapKeys = Object.keys((data as BaseChartData)?.indicate[0]) as [
				string,
				string,
				string,
			];
			const regionKey = heatmapKeys[0]; // 행정구역별 키
			const timeKey = heatmapKeys[1]; // 시간 키
			const heatmapValueKey = heatmapKeys[2]; // 생활인구 키

			// 고유한 지역 목록을 정렬하여 `regions` 배열 생성
			const regions = Array.from(
				new Set((data as BaseChartData)?.indicate.map((item) => item[regionKey] as string)),
			).sort();

			// 고유한 시간 목록을 정렬하여 `times` 배열 생성
			const times = Array.from(
				new Set((data as BaseChartData)?.indicate.map((item) => item[timeKey] as string)),
			).sort((a, b) => parseInt(a) - parseInt(b)); // 시간을 숫자로 변환하여 정렬
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th
									rowSpan={2}
									className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2"
								>
									<p>{xlabel}</p>
								</th>
								{times.map((time, index) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>{formatDate(time)}</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{regions.map((region, regionIndex) => (
								<tr key={regionIndex}>
									<td className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
										<p>{region}</p>
									</td>
									{times.map((time, timeIndex) => {
										const regionData = (data as BaseChartData).indicate.find(
											(item) => item[regionKey] === region && item[timeKey] === time,
										);
										return (
											<td
												key={`${regionIndex}-${timeIndex}`}
												className="min-w-[100px] border-b border-gray-300 px-4 py-2"
											>
												<p>
													{regionData ? regionData[heatmapValueKey]?.toLocaleString("ko-KR") : "-"}
												</p>
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		//생키 테이블표
		if (sankey) {
			const removeEjection = (name: string) => {
				// name이 유효한 문자열인지 확인
				return typeof name === "string" ? name.replace(/ (유출|유입)$/, "") : name;
			};
			const isOutflow = data.name.toLowerCase().includes("out");
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-r border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								<th className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2">
									<p>{Object.keys((data as BaseChartData).indicate[0])[2] || "-"}</p>
								</th>
							</tr>
						</thead>
						<tbody>
							{(data as BaseChartData).indicate.map((item: DataItem, index: number) => {
								const keys = Object.keys(item);
								const regionFrom = item["구분"] as string;
								const regionTo = item["지역"] as string;
								const popValue = item[
									keys.find((key) => key.includes("인구")) || "생활인구"
								] as number;
								const displayText = isOutflow
									? `${removeEjection(regionFrom)} -> ${removeEjection(regionTo)}`
									: `${removeEjection(regionFrom)} -> ${removeEjection(regionTo)}`;
								return (
									<tr key={index}>
										<td className="border-b border-r border-gray-300 bg-gray-100 px-4 py-2">
											<p>{displayText}</p>
										</td>
										<td className="border-b border-gray-300 px-4 py-2">
											<p>{popValue.toLocaleString("ko-KR")}</p>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			);
		}

		// 가로바 생키차트- 생활인구 평일,휴일(데이터 구조 다름)
		if (singleSankey) {
			const regions = (data as BaseChartData).regionName;
			const isOutflow = data.name.toLowerCase().includes("out");
			const removeEjection = (name: string) => {
				// name이 유효한 문자열인지 확인
				return typeof name === "string" ? name.replace(/ (유출|유입)$/, "") : name;
			};
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-r border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								<th className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2">
									<p>{Object.keys((data as BaseChartData).indicate[0])[1] || "-"}</p>
								</th>
							</tr>
						</thead>
						<tbody>
							{(data as BaseChartData).indicate.map((item: DataItem, index: number) => {
								const keys = Object.keys(item);
								const regionFrom = item["구분"] as string; // 출발 지역 (각 구분 값)
								const popValue = item[
									keys.find((key) => key.includes("인구")) || "생활인구"
								] as number; // 인구 수
								const displayText = isOutflow
									? `${regions} -> ${removeEjection(regionFrom)}`
									: `${removeEjection(regionFrom)} -> ${regions}`;
								return (
									<tr key={index}>
										<td className="border-b border-r border-gray-300 bg-gray-100 px-4 py-2">
											<p>{displayText}</p>
										</td>
										<td className="border-b border-gray-300 px-4 py-2">
											<p>{popValue.toLocaleString("ko-KR")}</p>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			);
		}
		if (title === "gisLegend") {
			return (
				//기본 테이블
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-xs">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[120px] border-b border-gray-300 bg-gray-100 px-4 py-1">
									<p>{xlabel}</p>
								</th>
								{Array.from({ length: 1 }).map((_, index) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-1"
									>
										<p>
											{(data as BaseChartData).regionName && index === 0
												? (data as BaseChartData).regionName
												: "-"}
										</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(data as BaseChartData).indicate.map((item: DataItem, index: number) => (
								<tr key={index}>
									<td className="sticky left-0 z-10 min-w-[120px] border-b border-gray-300 bg-gray-100 px-2 py-1">
										<p>{formatDate(item[xlabel]) || "-"}</p>
									</td>
									{Object.keys(item)
										.filter((key) => key !== xlabel)
										.map((key) => {
											const value = item[key];
											const parsedValue = parseFloat(value);
											return (
												<td key={key} className="w-[100px] border-b border-gray-300 px-2 py-1">
													<p>
														{value
															? !isNaN(parsedValue)
																? parsedValue.toLocaleString("ko-KR")
																: value
															: "-"}
													</p>
												</td>
											);
										})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
		//기본 차트 범례 有
		if ((data as BaseChartData).regionName) {
			return dataKey.length > 1 ? (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th
									rowSpan={2}
									colSpan={2}
									className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2"
								>
									<p>{xlabel}</p>
								</th>
								{Array.from({ length: 4 }).map((_, index) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>
											{(data as BaseChartData).regionName && index === 0
												? (data as BaseChartData).regionName
												: "-"}
										</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(data as BaseChartData).indicate.map((item, index) => {
								const populationTypes = Object.keys(item).filter((key) => key !== xlabel);
								return (
									<React.Fragment key={index}>
										<tr>
											<td
												rowSpan={populationTypes.length}
												className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2"
											>
												<p>{item[xlabel]}</p>
											</td>
											<td className="sticky left-[150px] z-10 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
												<p>{populationTypes[0]}</p>
											</td>
											<td className="min-w-[100px] border-b border-gray-300 px-4 py-2">
												<p>
													{item[populationTypes[0]] !== undefined
														? item[populationTypes[0]].toLocaleString("ko-KR")
														: "-"}
												</p>
											</td>
											{Array.from({ length: 3 }).map((_, i) => (
												<td
													key={`empty-${i}`}
													className="min-w-[100px] border-b border-gray-300 px-4 py-2 text-textGray"
												>
													<p>-</p>
												</td>
											))}
										</tr>
										{populationTypes.slice(1).map((type, subIndex) => (
											<tr key={`${index}-${subIndex}`}>
												<td className="sticky left-[150px] z-10 min-w-[100px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
													<p>{type}</p>
												</td>
												<td className="min-w-[100px] border-b border-gray-300 px-4 py-2">
													{item[type] !== undefined ? item[type].toLocaleString("ko-KR") : "-"}
												</td>
												{Array.from({ length: 3 }).map((_, i) => (
													<td
														key={`empty-${subIndex}-${i}`}
														className="min-w-[100px] border-b border-gray-300 px-4 py-2 text-textGray"
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
				</div>
			) : (
				//기본 테이블
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-separate border-spacing-0 whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								{Array.from({ length: 4 }).map((_, index) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>
											{(data as BaseChartData).regionName && index === 0
												? (data as BaseChartData).regionName
												: "-"}
										</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(data as BaseChartData).indicate.map((item: DataItem, index: number) => (
								<tr key={index}>
									<td className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-2 py-2">
										<p>{formatDate(item[xlabel]) || "-"}</p>
									</td>
									{Object.keys(item)
										.filter((key) => key !== xlabel)
										.map((key) => {
											const value = item[key];
											const parsedValue = parseFloat(value);
											return (
												<td key={key} className="w-[100px] border-b border-gray-300 px-2 py-2">
													<p>
														{value
															? !isNaN(parsedValue)
																? parsedValue.toLocaleString("ko-KR")
																: value
															: "-"}
													</p>
												</td>
											);
										})}
									{Array.from({
										length: 4 - Object.keys(item).filter((key) => key !== xlabel).length,
									}).map((_, i) => (
										<td
											key={`empty-${i}`}
											className="w-[100px] border-b border-gray-300 px-2 py-2 text-textGray"
										>
											<p>-</p>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		} else {
			// 비교 화면용 한 차트 테이블
			return (
				<div className="max-w-screen relative">
					<table className="min-w-full table-auto border-collapse whitespace-nowrap border-x border-t border-gray-300 text-center text-sm">
						<TableColgroup />
						<thead className="overflow-x-auto bg-gray-100">
							<tr>
								<th className="sticky left-0 top-0 z-20 min-w-[150px] border-b border-l border-gray-300 bg-gray-100 px-4 py-2">
									<p>{xlabel}</p>
								</th>
								{regions.map((region: any, index) => (
									<th
										key={index}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>{formatDate(region)}</p>
									</th>
								))}
								{Array.from({ length: Math.max(0, 4 - regions.length) }).map((_, index) => (
									<th
										key={`empty-header-${index}`}
										className="sticky top-0 z-10 min-w-[100px] border-b border-gray-300 bg-gray-100 px-4 py-2"
									>
										<p>-</p>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{dataKey.map((date, index) => (
								<tr key={index}>
									<td className="sticky left-0 z-10 min-w-[150px] border-b border-gray-300 bg-gray-100 px-4 py-2">
										<p>{date}</p>
									</td>
									{(data as BaseChartData).indicate.map((regionData, regionIndex) => (
										<td
											key={`${regionIndex}-${index}`}
											className="min-w-[100px] border-b border-gray-300 px-4 py-2"
										>
											<p>{regionData[date]?.toLocaleString("ko-KR") || "-"}</p>
										</td>
									))}
									{Array.from({
										length: Math.max(0, 4 - (data as BaseChartData).indicate.length),
									}).map((_, index) => (
										<td
											key={`empty-cell-${index}`}
											className="min-w-[100px] border-b border-gray-300 px-4 py-2"
										>
											<p>-</p>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	};

	// TO_BE_CHECKED 체류인구 맵데이터 확인 후 삭제 예정
	// return (
	// 	<div className="mt-1 h-full w-full">
	// 		{!(
	// 			data.name === "llpMapData" ||
	// 			sankeyTable.includes(data.name) ||
	// 			singleSankeyTable.includes(data.name) ||
	// 			(Array.isArray((data as MergedChartData)?.data) &&
	// 				(data as MergedChartData).data.length > 0)
	// 		) && (
	// 			<div className="mb-1 text-base font-semibold text-subText">
	// 				{statSummary.length > 1 ? (data as BaseChartData).regionName : ""}
	// 			</div>
	// 		)}
	// 		<div
	// 			className={`${
	// 				data.name === "llpMapData"
	// 					? ""
	// 					: "custom-scrollbar max-h-[400px] overflow-x-auto overflow-y-auto"
	// 			}`}
	// 		>
	// 			{Array.isArray((data as MergedChartData)?.data) && (data as MergedChartData).data.length > 0
	// 				? renderMergedTable()
	// 				: renderBasicTable()}
	// 		</div>
	// 	</div>
	// );
	return (
		<div className="mt-1 h-full w-full">
			{!(
				sankeyTable.includes(data.name) ||
				singleSankeyTable.includes(data.name) ||
				(Array.isArray((data as MergedChartData)?.data) &&
					(data as MergedChartData).data.length > 0)
			) &&
				title !== "gisLegend" && (
					<div className="mb-1 text-base font-semibold text-subText">
						{statSummary.length > 1 ? (data as BaseChartData).regionName : ""}
					</div>
				)}

			<div className="custom-scrollbar max-h-[400px] overflow-x-auto overflow-y-auto">
				{Array.isArray((data as MergedChartData)?.data) && (data as MergedChartData).data.length > 0
					? renderMergedTable()
					: renderBasicTable()}
			</div>
		</div>
	);
}
