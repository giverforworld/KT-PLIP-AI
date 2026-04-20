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
import { localFilter } from "@/utils/filter";
import GisFilter from "../common/GisFilter";

interface LocalFilterProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function LocalFilter({
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
}: Readonly<LocalFilterProps>) {
	return (
		<GisFilter
			{...{
				filter: localFilter,
				gisSettingKey: "localGroup",
				gisSettings,
				setGisSettings,
				tempSettings,
				setTempSettings,
			}}
		>
			<h3 className="cursor-default font-pretendard font-semibold text-black">내/외지인</h3>
		</GisFilter>
	);
}
