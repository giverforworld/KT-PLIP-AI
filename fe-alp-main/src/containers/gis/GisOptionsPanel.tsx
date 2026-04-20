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
import SlideButton from "@/components/buttons/SlideButton";

interface GISOptionsPanelProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	// filteredData: any;
}

export function GISOptionsPanel({
	gisSettings,
	setGisSettings,
	// filteredData,
}: Readonly<GISOptionsPanelProps>) {
	const legendColors = [
		"#CD1103",
		"#D53212",
		"#DE5321",
		"#E67430",
		"#EE953F",
		"#F7B64E",
		"#FFD75D",
	];
	const legendLabels = [
		"71.337 초과",
		"27,075 ~ 71,337 이하",
		"27,075 ~ 71,337 이하",
		"27,075 ~ 71,337 이하",
		"27,075 ~ 71,337 이하",
		"27,075 ~ 71,337 이하",
		"27,075 ~ 71,337 이하",
	];

	const handleTypeChange = React.useCallback((value: 0 | 1 | 2) => {
		setGisSettings((prev) => ({
			...prev,
			maps: prev.maps.map((map) => ({
				...map,
				isdarkMode: value === 1,
			})),
		}));
	}, []);

	return (
		<div
			className={`flex h-full ${gisSettings.isMenuOpen ? "w-[calc(100%-400px)]" : "w-full"} flex-col items-end justify-between`}
		>
			<div className="flex flex-col items-end gap-2 p-4">
				<SlideButton
					options={[
						{ value: 0, label: "기본", name: "light1" },
						{ value: 1, label: "흑백", name: "dark1" },
					]}
					initialValue={gisSettings.maps[0].isdarkMode ? 1 : 0}
					selectedValue={gisSettings.maps[0].isdarkMode ? 1 : 0}
					onChange={(value: 0 | 1 | 2) => handleTypeChange(value)}
					optionKey="darkMode"
				/>
			</div>
		</div>
	);
}
