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
import BaseButton from "@/components/buttons/BaseButton";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import * as React from "react";
import { useState, useMemo } from "react";
import ChartControlButton from "./ChartControlButton";
import { formatUnixToString, numberToDate } from "@/libs/gisOptionFunc";
import { format } from "date-fns";
import SwipeButton from "@images/gis/swipe_button.svg";
import { FaChevronDown } from "react-icons/fa";
import { filterDataByDateRange } from "@/libs/gisChartFunc";
import ChartContext from "@/containers/common/chart/ChartContext";
import { getNumberToFirstDay, getNumberToLastDay } from "@/utils/date";
import { useTimeSeriesStatusStore } from "@/store/gis/timeSeriesStatus";

interface TimeSeriesAnalysisProps {
	isTimeSeries?: boolean;
	gisSettings: GisSettings;
	chartData: any;
}

export default function TimeSeriesAnalysis({
	isTimeSeries,
	gisSettings,
	chartData,
}: Readonly<TimeSeriesAnalysisProps>) {
	const timeStatus = useTimeSeriesStatusStore(s=>s.timeSeriesStatus);
	const setTimeStatus = useTimeSeriesStatusStore((s) => s.setTimeSeriesStatus);
	const [divHeight, setDivHeight] = useState(200);
	const [isDragging, setIsDragging] = useState(false);
	const [optionOpen, setOptionOpen] = useState(false);
	const startDate =
		gisSettings.maps[0].startDate.toString().length === 6
			? numberToDate(getNumberToFirstDay(gisSettings.maps[0].startDate))
			: numberToDate(gisSettings.maps[0].startDate);
	const endDate =
		gisSettings.maps[0].endDate.toString().length === 6
			? numberToDate(getNumberToLastDay(gisSettings.maps[0].endDate))
			: numberToDate(gisSettings.maps[0].endDate);
	const diffInDays = endDate.getDate() - startDate.getDate();
	const dateOptions = useMemo(() => {
		const options = [];
		if (diffInDays > 7) {
			const totalChunks = Math.ceil(diffInDays / 7);
			for (let i = 0; i < totalChunks; i++) {
				const chunkStart = new Date(startDate);
				chunkStart.setDate(startDate.getDate() + i * 7);
				const chunkEnd = new Date(chunkStart);
				if (i === totalChunks - 1) {
					chunkEnd.setDate(startDate.getDate() + diffInDays - 1);
				} else {
					chunkEnd.setDate(chunkStart.getDate() + 6);
				}
				options.push({
					idx: i,
					label: `${format(chunkStart, "yyyy.MM.dd")} - ${format(chunkEnd, "yyyy.MM.dd")}`,
					start: chunkStart,
					end: chunkEnd,
				});
			}
		} else {
			// const totalChunks = Math.ceil(diffInDays);
			// for (let i = 0; i < totalChunks; i++) {
			// 	const chunkStart = new Date(startDate);
			// 	chunkStart.setDate(startDate.getDate() + i * 7);
			// 	const chunkEnd = new Date(chunkStart);
			// 	if (i === totalChunks - 1) {
			// 		chunkEnd.setDate(startDate.getDate() + diffInDays);
			// 	} else {
			// 		chunkEnd.setDate(chunkStart.getDate() + 6);
			// 	}
			// 	options.push({
			// 		idx: i,
			// 		label: `${format(chunkStart, "yyyy.MM.dd")} - ${format(chunkEnd, "yyyy.MM.dd")}`,
			// 		start: chunkStart,
			// 		end: chunkEnd,
			// 	});
			// }
			// diffInDays 가 7 이하일 때를 처리
			options.push({
				idx: 0,
				label: `${format(startDate, "yyyy.MM.dd")} - ${format(endDate, "yyyy.MM.dd")}`,
				start: startDate,
				end: endDate,
			});
		}
		return options;
	}, [startDate, diffInDays]);
	const [selectedDateRange, setSelectedDateRange] = useState(dateOptions[0]);

	const handleInputClick = () => setOptionOpen(!optionOpen);

	const handleMouseDown = () => setIsDragging(true);

	const MAX_HEIGHT = 610;

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging) {
			setDivHeight((prevHeight) => {
				const newHeight = prevHeight - e.movementY;
				return Math.min(MAX_HEIGHT, Math.max(150, newHeight));
			});
		}
	};

	const handleMouseUp = () => setIsDragging(false);

	const handleOptionClick = (selectedDate: any) => {
		setTimeStatus({ ...timeStatus, currentTime: new Date(selectedDate.start).getTime() });
		setSelectedDateRange(selectedDate);
		handleInputClick();
	};

	React.useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		} else {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging]);
	// 기존 useEffect 아래에 추가
	React.useEffect(() => {
		if (isTimeSeries && selectedDateRange) {
			setTimeStatus((prev) => ({
				...prev,
				currentTime: new Date(selectedDateRange.start).getTime(),
			}));
		}
	}, [isTimeSeries, selectedDateRange, setTimeStatus]);
	return (
		<>
			{isTimeSeries && (
				<>
					<button onMouseDown={handleMouseDown}>
						<SwipeButton width={600} height={22} />
					</button>
					<div className="flex h-full w-full items-center justify-between">
						<div className="flex w-full items-center gap-2 py-2">
							{/* <ButtonGroup>
								<BaseButton
									title="일별"
									color={timeStatus.timeSeriesType === 0 ? "primary_light" : "gray"}
									onClick={() =>
										setTimeStatus({
											...timeStatus,
											timeSeriesType: 0,
											playStatus: 0,
											currentTime: 0,
										})
									}
								/>
								<BaseButton
									title="시간대별"
									color={timeStatus.timeSeriesType === 1 ? "primary_light" : "gray"}
									onClick={() =>
										setTimeStatus({
											...timeStatus,
											timeSeriesType: 1,
											playStatus: 0,
											currentTime: 0,
										})
									}
								/>
							</ButtonGroup> */}
							<span className="font-semibold text-[#444444]">
								{timeStatus.currentTime !== 0 &&
									formatUnixToString(timeStatus.currentTime, timeStatus.timeSeriesType)}
							</span>
							{timeStatus.timeSeriesType === 1 && dateOptions.length > 0 && (
								<div className="relative w-fit">
									<button
										className="flex w-fit cursor-default items-center justify-between gap-2 rounded-sm border px-4 py-2"
										onClick={handleInputClick}
									>
										<strong className="font-semibold text-[#D63457]">
											{selectedDateRange.idx + 1}주
										</strong>
										<input
											type="text"
											value={selectedDateRange.label}
											readOnly
											className="cursor-pointer outline-none"
											placeholder="기간 선택"
										/>
										<FaChevronDown className="w-5 text-gray-500" />
									</button>
									{optionOpen && (
										<div className="absolute left-0 top-full z-50 mt-0.5 w-full rounded bg-white">
											<div className="relative z-50 flex w-full flex-col rounded-sm border border-[#e5e7eb]">
												{dateOptions.map((d: any) => (
													<button
														key={d.label}
														className="flex w-full cursor-pointer items-center gap-2 px-4 py-2"
														onClick={() => handleOptionClick(d)}
													>
														<strong className="font-semibold text-[#D63457]">{d.idx + 1}주</strong>
														{d.label}
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						{timeStatus.isData && <ChartControlButton />}
					</div>
				</>
			)}

			<div style={{ height: `${divHeight}px` }}>
				{/* {timeStatus.timeSeriesType === 0 && (
					<ChartContext
						data={timeSeriesData}
						title={``}
						type={"dynamic"}
						xlabel={"구분"}
						color={["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"]}
						chartHeight={divHeight}
					/>
				)}
				{timeStatus.timeSeriesType === 1 && ( */}
				<ChartContext
					data={filterDataByDateRange(chartData, selectedDateRange)}
					title={`시간대별 생활인구`}
					type={"dynamic"}
					xlabel={"구분"}
					color={["#418AEC", "#5789AF", "#79C8C4", "#8472F0", "#F9C74F", "#D63457", "#C4C4C4"]}
					chartHeight={divHeight}
				/>
				{/* )} */}
			</div>
		</>
	);
}
