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

import { MapViewState } from "deck.gl";
import { GISToolbar } from "./GISToolbar";
import GisSideBar from "./new/GisSideBar";
import { useTabTypeStore } from "@/store/gis/tabType";

interface GisAnalysisContainerProps {
	viewState: MapViewState;
	regionInfo: Record<string, RegionInfo>;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	// filteredData: AlpChartData[];
	isLoading: boolean;
	// rangeDate: {startDate: string, endDate: string};
	onApplySettings:(next:GisSettings)=>void;
}

export default function GisAnalysisContainer({
	viewState,
	isLoading,
	regionInfo,
	gisSettings,
	setGisSettings,
	onApplySettings,
	// rangeDate,
}: Readonly<GisAnalysisContainerProps>) {
	const tabValue = useTabTypeStore((s) => s.tabType);
	return (
		<>
			<GisSideBar
				{...{
					mapIdx: 0,
					position: "left",
					regionInfo,
					gisSettings,
					setGisSettings,
					onApplySettings,
					// rangeDate,
				}}
			/>

			{((!gisSettings.isMainModalOpen &&
				gisSettings.maps[0].isSearch &&
				tabValue === gisSettings.analysisType) ||
				(!gisSettings.maps[0].isSearch && gisSettings.isDual)) && (
				<GISToolbar {...{ viewState, gisSettings, setGisSettings, mapLoading: isLoading }} />
			)}

			{gisSettings.isDual && (
				<GisSideBar
					{...{
						mapIdx: 1,
						position: "right",
						regionInfo,
						gisSettings,
						setGisSettings,
						onApplySettings,
					}}
				/>
			)}
		</>
	);
}
