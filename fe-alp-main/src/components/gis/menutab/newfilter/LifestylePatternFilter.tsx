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
import { pattern0Filter } from "@/utils/filter";
import GisFilter from "../common/GisFilter";

interface LifestylePatternFilterProps {
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function LifestylePatternFilter({
	mapIdx = 0,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
}: Readonly<LifestylePatternFilterProps>) {
	return (
		<GisFilter
			{...{
				mapIdx,
				filter: pattern0Filter,
				gisSettingKey: "lifestylePattern",
				gisSettings,
				setGisSettings,
				tempSettings,
				setTempSettings,
			}}
		>
			<div className="flex justify-between">
				<h3 className="font-pretendard font-semibold text-black">생활패턴별 인구</h3>
			</div>
		</GisFilter>
	);
}
