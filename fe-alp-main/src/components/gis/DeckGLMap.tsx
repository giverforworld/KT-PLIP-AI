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
import { DeckGL, MapViewState, FlyToInterpolator } from "deck.gl";
import * as React from "react";
import { initialViewState } from "@/constants/gis";
import { FeatureCollection, Feature } from "geojson";
import { getGeometryInfo } from "@/libs/layers/getGeometryInfo";
import { getZoomLevel } from "@/containers/regional-dashboard/proto/functions/getGeometryInfo";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";

type Props = {
	viewState: MapViewState;
	setViewState: (viewState: MapViewState) => void;
	layers: any;
	selectedRegion: number;
	children?: React.ReactNode; // children 타입 추가
	isLoading: boolean;
	sggGeo: FeatureCollection;
	gisSettings: GisSettings;
	serverMapData: any;
	serverGrid50Data: any;
	layerData: any;
	mapData: any;
};

export default function DeckGLMap({
	viewState,
	setViewState,
	layers,
	layerData,
	children,
	isLoading,
	sggGeo,
	mapData,
	gisSettings,
	serverMapData,
	serverGrid50Data,
}: Props) {
	const mapRef = React.useRef<HTMLDivElement | null>(null);
	const isMapActive = useIsAnalysisStore((s) => s.isAnalysis);
	const { layerType } = layerData || {};

	// isLoading이 false로 변경될 때 수행할 작업
	// console.log(isMapActive);
	React.useEffect(() => {
		if (!isLoading && sggGeo && isMapActive) {
			const { regionCode } = gisSettings;
			const geoJson: FeatureCollection =
				regionCode > 100000 ? mapData.admGeo : regionCode > 100 ? mapData.sggGeo : mapData.sidoGeo;
			const sggFeature = geoJson.features.find(
				(feature) => feature.properties?.REGION_CD.toString() === regionCode.toString(),
			);
			if (sggFeature) {
				handleResize(layerType, sggFeature, mapRef, viewState, setViewState);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, serverMapData, serverGrid50Data, isMapActive]);

	return (
		<div ref={mapRef} style={{ width: "100%", height: "100%" }}>
			<DeckGL
				initialViewState={initialViewState}
				onViewStateChange={({ viewState }) => setViewState(clampViewState(viewState))}
				viewState={viewState}
				controller={{
					dragRotate: false,
				}}
				layers={layers}
			>
				{children}
			</DeckGL>
		</div>
	);
}

function clampViewState(viewState: any) {
	const { latitude, longitude, zoom } = viewState;
	const newZoom = Math.min(Math.max(zoom, 7), 17);
	const newLat = Math.max(Math.min(38.3, latitude), 33.3);
	const newLon = Math.min(Math.max(125.68, longitude), 130);

	return { ...viewState, zoom: newZoom, latitude: newLat, longitude: newLon };
}

const handleResize = (
	layerType: string,
	selectedFeature: Feature,
	mapRef: React.RefObject<HTMLDivElement | null>,
	viewState: MapViewState,
	setViewState: (viewState: MapViewState) => void,
) => {
	if (mapRef.current) {
		const { width, height } = mapRef.current.getBoundingClientRect();
		const scale = layerType === "vector" || layerType === "trip" ? 0.15 : 0.5;

		if (layerType === "depopul") {
			setViewState({
				...viewState,
				latitude: 37,
				longitude: 127,
				zoom: 8,
				// zoom: 10,
			});
			return;
		}
		const mapWidth = width * scale;
		const mapHeight = height * scale;

		const geoInfo = getGeometryInfo(selectedFeature!);
		const newZoom = getZoomLevel(geoInfo.width, geoInfo.height, mapWidth, mapHeight);
		setViewState({
			...viewState,
			longitude: geoInfo.center[0],
			latitude: geoInfo.center[1],
			zoom: newZoom,
			transitionInterpolator: new FlyToInterpolator({ speed: 1.5 }) as any,
			transitionDuration: "auto",
		});
	}
};