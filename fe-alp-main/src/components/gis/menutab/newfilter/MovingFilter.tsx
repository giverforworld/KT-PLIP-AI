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

import React from "react";
import OptionSelectBox from "../OptionSelectBox";
import Tooltip from "@/components/tooltip/Tooltip";
import GisFilter from "../common/GisFilter";

interface MovingFilterProps {
	mapIdx?: 0 | 1;
	isFirst?: boolean;
	fullWidth?: boolean;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function MovingFilter({
	mapIdx = 0,
	isFirst = false,
	fullWidth = false,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
}: Readonly<MovingFilterProps>) {
	const movingOptions = [
		{ label: "기준지역으로 유입", value: true },
		{ label: "기준지역에서 유출", value: false },
	];
	const movingPVOptions = [
		{ label: "이동목적", value: true },
		{ label: "이동수단", value: false },
	];

	const handleSetOption: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
		tempSettings && setTempSettings
			? setTempSettings({
					...tempSettings,
					maps: tempSettings.maps.map((map, index) =>
						index === mapIdx
							? {
									...map,
									isSelectNewOption: true,
									inOutFlow:
										typeof value === "boolean" ? value : tempSettings.maps[mapIdx].inOutFlow,
								}
							: map,
					),
				})
			: setGisSettings((prev) => ({
					...prev,
					maps: prev.maps.map((map, index) =>
						index === mapIdx
							? {
									...map,
									isSelectNewOption: true,
									inOutFlow: typeof value === "boolean" ? value : map.inOutFlow,
								}
							: map,
					),
				}));
	};

	const handleSetPVOption: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
		setTempSettings((prev) => ({
			...prev,
			isMovingPurpose: typeof value === "boolean" ? value : prev.isMovingPurpose,
			maps: tempSettings.maps.map((map, index) =>
				index === mapIdx
					? {
						...map,
						isSelectNewOption: true,							
					}
					: map,
			),
		}));
	};

	return (
		<div className="flex flex-col bg-white py-2">
			<GisFilter
				{...{
					mapIdx,
					gisSettings,
					tempSettings,
					setTempSettings,
				}}
			>
				{tempSettings && (
					<div className="mb-4 flex w-full justify-start">
						<h3 className="break-keep font-pretendard font-semibold text-black">분석유형</h3>
						{/* <div className="flex items-center">
							<Tooltip
								left
								bgcolor
								closeButton
								message={
									"유입: 기준지역으로 유립하는 이동을 시각화\n상대 지역에서 출발하여 기준 지역으로 도착하는 데이터\n유출: 기준지역에서 유출하는 이동을 시각화\n기준 지역에서 출발하여 상대 지역으로 도착하는 데이터"
								}
							/>
						</div> */}
					</div>
				)}
				<OptionSelectBox
					{...{
						mapIdx,
						fullWidth,
						options: movingPVOptions,
						selectedOption:
							tempSettings && mapIdx === 0
								? tempSettings?.isMovingPurpose
								: gisSettings.isMovingPurpose,
						setOption: handleSetPVOption,
						disabled: mapIdx === 1,
					}}
				/>
			</GisFilter>
			<GisFilter
				{...{
					mapIdx,
					isFirst: isFirst,
					gisSettings,
					setGisSettings,
				}}
			>
				<OptionSelectBox
					{...{
						mapIdx,
						fullWidth,
						options: movingOptions,
						selectedOption: tempSettings.maps[mapIdx].inOutFlow,
						setOption: handleSetOption,
					}}
				/>
			</GisFilter>
		</div>
	);
}
