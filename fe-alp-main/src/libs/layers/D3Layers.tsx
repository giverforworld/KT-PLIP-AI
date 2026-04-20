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
import * as React from "react";
import SvgMoveIndicator from "./SvgMoveIndicator";
import { SvgSpeechBubbleLayer } from "./SvgSpeechBuubleLayer";
import { WebMercatorViewport } from "deck.gl";
import { SvgChartLayer } from "./SvgChartLayer";

export default function D3Layers({
	gisSettings,
	layerData,
	mapData,
	selectedRegion,
	viewState,
	top10Ref,
	isdarkMode,
	inOutFlow,
}: any) {
	const [layer, setLayer] = React.useState<string>("non");
	const viewport = new WebMercatorViewport(viewState);
	const { visualizeOption, analysisType } = gisSettings as GisSettings;
	const { sggGeo, admGeo } = mapData;
	const geoJson = layerData?.layerType === "vector" ? sggGeo : admGeo;
	// if (layerData?.layerType === "vector" || layerData?.layerType === "llpInflow") setLayer("vector");
	const data = React.useMemo(() => {
		return layerData?.data && Object.values(layerData?.data);
	}, [layerData]);
	const zoomBoundry = React.useMemo(() => {
		if (!layerData?.data || !Object.keys(layerData?.data)) return 9;
		return +Object.keys(layerData.data)[0] > 100000 ? 13 : 9;
	}, [layerData]);
	if (!data) return null;
	return (
		<div className="h-full w-full">
			{(layerData?.layerType === "vector" ||
				(layerData?.layerType === "llpInflow" && visualizeOption === 1)) &&
				mapData.sggGeo && (
					<SvgMoveIndicator
						centerEmd={selectedRegion} // regionCode state
						viewState={viewState} // vewState
						emdMap={{ current: geoJson }} // geoJson
						emdMapPropName={"adm_cd2"} //string
						// moveMap_oriBased={ODData} //data
						moveMap_oriBased={layerData?.data as any} //data
						top10Ref={top10Ref}
						isDarkMode={isdarkMode}
						layerType={layerData?.layerType}
						inOutFlow={inOutFlow}
					/>
				)}
			{visualizeOption === 3 &&
				(viewState.zoom > zoomBoundry ? (
					<SvgChartLayer {...{ data, viewport, viewState, analysisType }} />
				) : (
					<SvgSpeechBubbleLayer data={data} viewport={viewport} />
				))}
		</div>
	);
}
