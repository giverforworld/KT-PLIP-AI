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

import SlideButton from "@/components/buttons/SlideButton";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import Tooltip from "@/components/tooltip/Tooltip";
import { time1Filter } from "@/utils/filter";
import { changeDateToString } from "@/utils/date";
import SingleMonthCalendar from "./calendar/SingleMonthCalendar";
import RangeCalendar from "./calendar/RangeCalendar";
import GisFilter from "../common/GisFilter";

interface PeriodFilterProps {
	isFirst?: boolean;
	isOnlyMonth?: boolean;
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	setDate: any;
	isFop?: boolean;
}

export default function PeriodFilter({
	mapIdx = 0,
	isFirst = false,
	isOnlyMonth = false,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	setDate,
	isFop,
}: Readonly<PeriodFilterProps>) {
	const handleDateTypeChange = (value: 0 | 1 | 2) => {
		if (!tempSettings || !setTempSettings) return;
		const first = JSON.parse(sessionStorage.getItem('info')!).endDate;
		const firstDay = new Date(Number(first.slice(0, 4)), Number(first.slice(4, 6)) - 1, 1);
		const sevenDay = new Date(Number(first.slice(0, 4)), Number(first.slice(4, 6)) - 1, 7);
		// 기간조회 일수 변경
		const afterMaxDay = tempSettings?.isGrid
			? Number(first.slice(0, 6) + `01`)
			: Number(first.slice(0, 6));
		// const afterMaxDay = tempSettings?.isGrid ? Number(first.slice(0, 4)+first.slice(4, 6)+`02`) : Number(first.slice(0, 4)+first.slice(4, 6)+`07`);

		setTempSettings((prev) => ({
			...prev,
			maps: prev.maps.map((map, index) =>
				index === mapIdx
					? {
							...map,
							isSelectNewOption:true,
							dateType: value === 2 ? 1 : value,
							startDate: value !== 1 ? Number(changeDateToString(firstDay).toString().slice(0, 6)) : changeDateToString(firstDay),
							endDate: value !== 1 ? afterMaxDay : changeDateToString(sevenDay),
						}
					: map,
			),
		}));
	};

	const handleSingleChange = (startDate: Date, endDate: Date) => {
		if (tempSettings && setTempSettings) {
			setTempSettings((prev) => ({
				...prev,
				maps: prev.maps.map((map, index) =>
					index === mapIdx
						? {
								...map,
								isSelectNewOption: true,
								dateType: 0,
								startDate: parseInt(format(startDate, "yyyyMM")),
								endDate: parseInt(format(endDate, "yyyyMM")),
							}
						: map,
				),
			}));
		}
	};

	const handleRangeConfirm = (range: { startDate: Date; endDate: Date }) => {
		const { startDate, endDate } = range;

		if (tempSettings && setTempSettings) {
			setTempSettings((prev) => ({
				...prev,
				maps: prev.maps.map((map, index) =>
					index === mapIdx
						? {
								...map,
								isSelectNewOption: true,
								dateType: 1,
								startDate: parseInt(format(startDate, "yyyyMMdd")),
								endDate: parseInt(format(endDate, "yyyyMMdd")),
							}
						: map,
				),
			}));
		}
	};

	const renderCalendar = (dateType: number) => {
		if (dateType === 0) {
			return (
				<SingleMonthCalendar
					{...{
						mapIdx,
						onDateChange: handleSingleChange,
						gisSettings,
						setGisSettings,
						tempSettings,
						setTempSettings,
						setDate,
						isFop,
					}}
				/>
			);
		} else if (dateType === 1) {
			return (
				<RangeCalendar
					{...{
						mapIdx,
						onConfirm: handleRangeConfirm,
						gisSettings,
						setGisSettings,
						tempSettings,
						setTempSettings,
						setDate,
						isFop,
					}}
				/>
			);
		}
	};

	return (
		<>
			<GisFilter {...{ isFirst, mapIdx, gisSettings, tempSettings, setTempSettings }}>
				<div
					className={`flex items-center ${isOnlyMonth ? "relative justify-start" : "justify-between"}`}
				>
					<h3 className="font-pretendard font-semibold text-black">기간조회</h3>
					{!isOnlyMonth ? (
						<SlideButton
							{...{
								mapIdx,
								options: [
									{
										value: 0,
										label: "월별",
										name: `Monthly${mapIdx}`,
									},
									{ value: 1, label: "기간선택", name: `DateRange${mapIdx}` },
								],
								initialValue: tempSettings
									? tempSettings?.maps[mapIdx].dateType
									: gisSettings.maps[mapIdx].dateType,
								selectedValue: tempSettings
									? tempSettings?.maps[mapIdx].dateType
									: gisSettings.maps[mapIdx].dateType,
								onChange: handleDateTypeChange,
								disabled: mapIdx === 1 && !tempSettings,
								gisSettings,
							}}
						/>
					) : (
						<div className="flex items-center">
							<Tooltip left bgcolor closeButton message={"월별 선택만 가능합니다."} />
						</div>
					)}
				</div>
				<>
					{renderCalendar(
						tempSettings?.maps[mapIdx].dateType !== undefined
							? tempSettings.maps[mapIdx].dateType
							: mapIdx !== undefined
								? tempSettings.maps[mapIdx].dateType
								: 0,
					)}
				</>
			</GisFilter>
			{tempSettings.analysisType !== 2 && <GisFilter
				{...{
					mapIdx,
					isFirst: isFirst,
					filter: time1Filter,
					gisSettingKey: "timeSlot",
					gisSettings,
					setGisSettings,
					tempSettings,
					setTempSettings,
				}}
			>
				<div className="flex justify-start">
					<h3 className="font-pretendard font-semibold text-black">시간대</h3>
					<Tooltip left bgcolor closeButton message={"선택한 시간의 집계값이 표출됩니다."} />
				</div>
			</GisFilter>}
		</>
	);
}
