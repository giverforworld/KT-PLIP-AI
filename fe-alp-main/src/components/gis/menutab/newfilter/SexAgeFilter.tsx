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
import { age1Filter, genderFilter } from "@/utils/filter";
import GisFilter from "../common/GisFilter";

interface GenderFilterProps {
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
	closeBtn?: boolean;
}

export default function SexAgeFilter({
	mapIdx = 0,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	closeBtn = false,
}: Readonly<GenderFilterProps>) {
	return (
		<div className="flex flex-col">
			<GisFilter
				{...{
					mapIdx,
					gisSettings,
					setGisSettings,
					tempSettings,
					setTempSettings,
					filter: genderFilter,
					gisSettingKey: "gender",
					closeBtn,
				}}
			>
				<h3 className="w-full font-pretendard font-semibold text-black">성/연령별</h3>
			</GisFilter>
			<GisFilter
				{...{
					closeBtn,
					mapIdx,
					gisSettings,
					setGisSettings,
					tempSettings,
					setTempSettings,
					filter: age1Filter,
					gisSettingKey: "ageGroup",
				}}
			/>
		</div>
	);
}
