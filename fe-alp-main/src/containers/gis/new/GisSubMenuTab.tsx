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

"use client";
import SubTab from "@/components/tabs/SubTab";
import SubTabItem from "@/components/tabs/SubTabItem";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";
import * as React from "react";

interface Option {
	value: 0 | 1;
	label: string;
	name: string;
}

interface GisSubMenuTabProps {
	mapIdx?: 0 | 1;
	options: Option[];
	activeOption: 0 | 1;
	setActiveOption: React.Dispatch<React.SetStateAction<0 | 1>>;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function GisSubMenuTab({
	mapIdx = 0,
	options,
	activeOption,
	setActiveOption,
	setTempSettings,
	gisSettings,
	setGisSettings,
}: Readonly<GisSubMenuTabProps>) {
	const isSearch = useIsAnalysisStore((s) => s.isAnalysis);	
	const setIsSearch = useIsAnalysisStore((s) => s.setIsAnalysis);
	
	return (
		<SubTab size="small" disabled={gisSettings.isDual}>
			{options.map((option) => (
				<SubTabItem
					size="small"
					key={option.label}
					isActive={option.value === activeOption}
					onClick={
						gisSettings.isDual
							? () => {}
							: () => {
									setActiveOption(option.value);
									setTempSettings((prevSettings) => ({
										...prevSettings,
										analysisSubType: option.value,
									}));
									// setGisSettings((prevSettings) => ({
									// 	...prevSettings,
									// 	visualizeOption: 0,
									// }));
									setIsSearch(mapIdx, !isSearch[mapIdx]);
								}
					}
				>
					{option.label}
				</SubTabItem>
			))}
		</SubTab>
	);
}
