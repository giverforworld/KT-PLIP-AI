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

import { movingPurposeFilter, movingVehicleFilter } from "@/utils/filter";
import GisFilter from "../common/GisFilter";

interface MovingTypeFilterProps {
	closeBtn?: boolean;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}
export default function MovingTypeFilter({
	closeBtn = false,
	gisSettings,
	setGisSettings,
}: Readonly<MovingTypeFilterProps>) {
	return (
		<GisFilter
			{...{
				closeBtn,
				gisSettings,
				setGisSettings,
				filter: gisSettings.isMovingPurpose ? movingPurposeFilter : movingVehicleFilter,
				gisSettingKey: gisSettings.isMovingPurpose ? "movingPurposeGroup" : "movingVehicleGroup",
			}}
		>
			<h3 className="w-full cursor-default font-pretendard font-semibold text-black">
				{gisSettings.isMovingPurpose ? "이동목적" : "이동수단"}
			</h3>
		</GisFilter>
	);
}
