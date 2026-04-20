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
import GisControlButton from "@/components/gis/actionbutton/GisControlButton";
import TimeSeriesButton from "@images/gis/timeseries_button.svg";
import DualButton from "@images/gis/dual_button.svg";

interface ControlButtonGroupProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export function ControlButtonGroup({
	gisSettings,
	setGisSettings,
}: Readonly<ControlButtonGroupProps>) {
	const toggleDualAnalysis = React.useCallback(() => {
		setGisSettings((prev) => ({
			...prev,
			isDual: !prev.isDual, // isDual 값만 토글
		}));
	}, [setGisSettings]);

	return (
		<div className="ml-4 flex w-fit items-center justify-end gap-x-2 bg-white">
			{((gisSettings.analysisType === 0 && gisSettings.isGrid && gisSettings.gridScale !== 0.05) ||
				(gisSettings.analysisType == 1 &&
					(gisSettings.isGrid || gisSettings.visualizeOption === 0))) && (
				<GisControlButton
					onClick={() =>
						setGisSettings((prev) => ({
							...prev,
							isTimeLine: !prev.isTimeLine,
							isDual: false,
						}))
					}
					icon={<TimeSeriesButton />}
					label="시계열"
					isActive={gisSettings.isTimeLine}
				/>
			)}

			{gisSettings.isNative &&
				gisSettings.gridScale !== 0.05 &&
				gisSettings.analysisType !== 3 &&
				!gisSettings.isTimeLine && (
					<GisControlButton
						onClick={toggleDualAnalysis}
						icon={<DualButton />}
						label="듀얼분석"
						isActive={gisSettings.isDual}
					/>
				)}

			{!gisSettings.isNative && (
				<div className="flex w-max items-center justify-between">
					<h2 className="px-8 font-semibold">1시간 평균 외국인 생활인구</h2>
					<span>{`${(12312413).toLocaleString()} 명`}</span>
					{/* <span>{`${filterData[0].avgData.toLocaleString()} 명`}</span> */}
				</div>
			)}
		</div>
	);
}
