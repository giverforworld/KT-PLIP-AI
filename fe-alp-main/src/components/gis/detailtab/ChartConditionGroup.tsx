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

import { useState } from "react";
import { detailOption } from "@/constants/gis";
import MovingTypeFilter from "../menutab/newfilter/MovingTypeFilter";

interface ChartConditionGroupProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function ChartConditionGroup({
	gisSettings,
	setGisSettings,
}: Readonly<ChartConditionGroupProps>) {
	return (
		<>
			<div
				className={`${gisSettings.gridScale === 0.05 ? "" : "mx-5 h-[26px] w-[1px] bg-[#e2e2e2]"}`}
			/>

			{gisSettings.analysisType === 1 && !gisSettings.isTimeLine && (
				<MovingTypeFilter
					{...{ closeBtn: true, gisSettings: gisSettings, setGisSettings: setGisSettings }}
				/>
			)}
		</>
	);
}
