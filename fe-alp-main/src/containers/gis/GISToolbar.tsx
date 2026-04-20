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
import AnalysisRange from "@/components/gis/detailtab/AnalysisRange";
import GisOptionsModal from "@/components/gis/GisOptionModal";
import TimeSeriesAnalysis from "@/components/gis/actionbutton/TimeSeriesAnalysis";
import { ChartTypeSelector } from "@/components/gis/detailtab/ChartTypeSelector";
import { GISOptionsPanel } from "./GisOptionsPanel";
import { ControlButtonGroup } from "@/components/gis/detailtab/ControlButtonGroup";
import ChartConditionGroup from "@/components/gis/detailtab/ChartConditionGroup";
import useGisData from "@/hooks/queries/useGisData";
import { timeLineChartDataHandler } from "@/libs/gisChartFunc";
import GisDataLoading from "./GisDataLoading";
import { MapViewState } from "deck.gl";

interface GISToolbarProps {
	viewState: MapViewState;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	mapLoading: boolean;
	// filteredData: any;
}

export function GISToolbar({
	viewState,
	gisSettings,
	setGisSettings,
	mapLoading,
	// filteredData,
}: Readonly<GISToolbarProps>) {
	const { useGisTimeLineChartQuery } = useGisData();
	const { data: tLChartData, isLoading: isLoadingTlChartData } =
		useGisTimeLineChartQuery(gisSettings);
	const timeSeriesData = {
		indicate: timeLineChartDataHandler(tLChartData, gisSettings),
		name: "gisTimeSeriesDayData",
	};

	if (
		mapLoading ||
		(gisSettings.isTimeLine && mapLoading && isLoadingTlChartData === true) ||
		(!gisSettings.isSelfAnalysis && mapLoading)
	)
		return <GisDataLoading />;
	return (
		<>
			<div
				className={`absolute ${
					gisSettings.isMenuOpen ? "left-[400px]" : "left-0"
				} flex h-full w-full flex-col items-start`}
			>
				<div
					className={`absolute z-50 flex h-fit ${
						gisSettings.isMenuOpen
							? "custom-scrollbar w-[calc(100%-400px)] overflow-x-auto"
							: "w-full"
					} items-center justify-between border-b bg-white px-4 py-3`}
				>
					<div className="flex w-full items-center justify-start">
						{gisSettings.isGrid || gisSettings.analysisType === 3 ? (
							<AnalysisRange {...{ viewState, gisSettings, setGisSettings }} />
						) : (
							<ChartTypeSelector {...{ gisSettings, setGisSettings }} />
						)}
						{gisSettings.isNative &&
							!gisSettings.isDual &&
							!gisSettings.timeLine &&
							((gisSettings.regionCode.toString().length > 5 && gisSettings.gridScale === 0.05) ||
								gisSettings.gridScale !== 0.05) && (
								<ChartConditionGroup {...{ gisSettings, setGisSettings }} />
							)}
					</div>
					<ControlButtonGroup {...{ gisSettings, setGisSettings }} />
				</div>

				<GISOptionsPanel
					gisSettings={gisSettings}
					setGisSettings={setGisSettings}
					// filteredData={filteredData}
				/>
			</div>
			{gisSettings.isTimeLine && (
				<div className={`absolute bottom-4 right-48 flex items-end py-4`}>
					<GisOptionsModal isTimeSeries>
						{!isLoadingTlChartData && (
							<TimeSeriesAnalysis isTimeSeries {...{ gisSettings, chartData: timeSeriesData }} />
						)}
					</GisOptionsModal>
				</div>
			)}
		</>
	);
}
