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

import React, { useEffect, useState } from "react";
import Tooltip from "@/components/tooltip/Tooltip";
import SlideButton from "@/components/buttons/SlideButton";
import GisFilter from "../common/GisFilter";
import RegionSelectBox from "@/components/region/RegionSelectBox";

interface RegionFilterProps {
	mapIdx?: 0 | 1;
	isAdm?: boolean;
	isDual?: boolean;
	isSingleSelect?: boolean;
	filter?: Filter;
	gisSettingKey?: string;
	regionInfo: Record<string, RegionInfo>;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function RegionFilter({
	mapIdx = 0,
	isAdm = false,
	isDual = false,
	isSingleSelect = false,
	filter,
	gisSettingKey,
	regionInfo,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
}: Readonly<RegionFilterProps>) {
	// const isRegionCodeExceeded =
	// 	String(tempSettings?.regionCode).length > 5 &&
	// 	((tempSettings?.analysisType ?? gisSettings?.analysisType) === 0 ||
	// 		(tempSettings?.analysisType ?? gisSettings?.analysisType) === 1);

	const handleTypeChange = (value: 0 | 1 | 2, optionType: string) => {
		if (!setTempSettings || !tempSettings || mapIdx === 1) return;

		setTempSettings((prev) => {
			if (!prev) return prev;
			const isGridValue = value !== 0;
			const gridScaleValue =
				(tempSettings?.analysisType ?? gisSettings?.analysisType) === 0 && value === 1
					? 0.05
					: 0.25;
			const endDate = JSON.parse(sessionStorage.getItem("info")!).endDate;
			return {
				...prev,
				[optionType]: isGridValue,
				isGridScaleAuto:
					(tempSettings?.analysisType ?? gisSettings?.analysisType) === 0
						? value !== 2 && value !== 1
						: value !== 1,
				gridScale: isGridValue ? gridScaleValue : 0,
				maps: prev.maps.map((map, idx) => {
					// mapIdx가 1이면 원래 값을 그대로 유지
					if (idx !== 0) return map;

					return {
						...map,
						isSelectNewOption: true,
						...(tempSettings.maps[0].dateType === 0 && {
							startDate: Number(endDate.slice(0, 6)),
							endDate: Number(endDate.slice(0, 6)),
						}),
						...(tempSettings.maps[0].dateType === 1 &&
							isGridValue && {
								startDate: Number(endDate.slice(0, 6) + `01`),
								endDate: Number(endDate.slice(0, 6) + `01`),
							}),
						...(tempSettings.maps[0].dateType === 1 &&
							!isGridValue && {
								startDate: Number(endDate.slice(0, 6) + `01`),
								endDate: Number(endDate.slice(0, 6) + `07`),
							}),
					};
				}),
			};
		});
	};

	const options: gridOptions =
		(tempSettings?.analysisType ?? gisSettings?.analysisType) === 0
			? [
					{
						value: 0,
						label: "행정구역",
						name: "district",
						// disabled: isRegionCodeExceeded,
					},
					{
						value: 1,
						label: "격자50",
						name: "grid50",
					},
					{
						value: 2,
						label: "격자250",
						name: "grid250",
					},
				]
			: [
					{
						value: 0,
						label: "행정구역",
						name: "district",
						// disabled: isRegionCodeExceeded,
					},
					{
						value: 1,
						label: "격자250",
						name: "grid250",
					},
				]; // 기본 filter

	return (
		<GisFilter
			{...{
				mapIdx,
				isDual,
				isSingleSelect,
				filter,
				gisSettings,
				setGisSettings,
				tempSettings,
				setTempSettings,
				gisSettingKey: gisSettingKey as keyof MapSettings,
			}}
		>
			<div className={`mb-4 flex items-center justify-between`}>
				<div className="flex justify-start">
					<h3 className="break-keep font-pretendard font-semibold text-black">{`${tempSettings?.analysisType === 0 ? "기준" : ""}지역`}</h3>
					{gisSettingKey === "inOutFlow" && !isAdm && (
						<div className="flex items-center">
							<Tooltip
								bottom
								bgcolor
								closeButton
								message={
									"유입: 기준지역으로 유립하는 이동을 시각화\n상대 지역에서 출발하여 기준 지역으로 도착하는 데이터\n유출: 기준지역에서 유출하는 이동을 시각화\n기준 지역에서 출발하여 상대 지역으로 도착하는 데이터"
								}
							/>
						</div>
					)}
					{isAdm && (
						<div className="flex items-center">
							<Tooltip
								left
								bgcolor
								closeButton
								message={"시간대별 조회(시계열 스트리밍)는 읍면동 범위에서만 가능합니다."}
							/>
						</div>
					)}
				</div>
				{(tempSettings?.analysisType ?? gisSettings?.analysisType) !== 2 &&
					(tempSettings?.analysisType ?? gisSettings?.analysisType) !== 3 && (
						<SlideButton
							{...{
								mapIdx,
								options,
								initialValue:
									(tempSettings?.isGrid ?? gisSettings?.isGrid)
										? (tempSettings?.gridScale ?? gisSettings?.gridScale) === 0.25 &&
											(tempSettings?.analysisType ?? gisSettings?.analysisType) === 0
											? 2
											: 1
										: 0,

								selectedValue:
									(tempSettings?.isGrid ?? gisSettings?.isGrid)
										? ((tempSettings?.gridScale ?? gisSettings?.gridScale) === 0.25 || 
											(tempSettings?.gridScale ?? gisSettings?.gridScale) === 0.5 ||
											(tempSettings?.gridScale ?? gisSettings?.gridScale) === 1) &&
											(tempSettings?.analysisType ?? gisSettings?.analysisType) === 0
											? 2
											: 1
										: 0,

								onChange: (value: 0 | 1 | 2) => handleTypeChange(value, "isGrid"),
								disabled: mapIdx === 1 && !tempSettings,
							}}
						/>
					)}
			</div>
			<RegionSelectBox
				{...{
					mapIdx,
					isAdm,
					regionInfo,
					gisSettings,
					setGisSettings,
					...(mapIdx === 0 && { tempSettings, setTempSettings }),
				}}
			/>
		</GisFilter>
	);
}