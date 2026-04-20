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

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Deck, MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import { initialViewState, initialMapSettings } from "@/constants/gis";
import { topoToGeo } from "@/libs/dev/topoJsonHandler";
import { makeBaseMap } from "@/libs/layers/LayerFnts";
import useGisData from "@/hooks/queries/useGisData";
import { zoomToGeometry } from "../regional-dashboard/proto/functions/handleViewState";

interface ReportMapProps {
	regionCode: number;
	start: string;
}

export default function ReportMap({ regionCode, start }: ReportMapProps) {
	const mapRef = useRef<HTMLDivElement>(null);
	const deckRef = useRef<any>(null);

	const [viewState, setViewState] = useState<MapViewState>(initialViewState);
	const [mapSettings, setMapSettings] = useState<MapSettings>(initialMapSettings);
	// const [geoJson, setGeoJson] = useState<any>(null);
	const [polygon, setPolygon] = useState<GeoJsonLayer | null>(null);
	const baseMap = makeBaseMap(mapSettings);
	const { useGeometry } = useGisData();
	const { data: geoJson } = useGeometry(start, "adm", regionCode);

	// ViewState 자동 업데이트
	useEffect(() => {
		if (geoJson && mapRef.current) zoomToGeometry(mapRef, geoJson, setViewState);
	}, [regionCode, geoJson]);

	// useEffect(() => {
	// 	// geoJson
	// 	// const newGeoJson = topoToGeo({ regionCode, topoJson });
	// 	// setGeoJson(newGeoJson);

	// 	// polygon
	// 	const newPolygon = new GeoJsonLayer({
	// 		id: "geojson-layer",
	// 		data: geoJson || { type: "FeatureCollection", features: [] },
	// 		filled: true,
	// 		stroked: true,
	// 		getLineWidth: 0.01,
	// 		lineWidthScale: 100,
	// 		lineWidthUnits: "pixels",
	// 		getLineColor: [255, 255, 255, 100],
	// 		getFillColor: [220, 100, 27, 200], // TO_BE_CHECEKD
	// 	});
	// 	setPolygon(newPolygon);

	// 	if (geoJson) zoomToGeometry(mapRef, geoJson, setViewState);
	// }, [regionCode, geoJson]);
	const layers: (GeoJsonLayer | any)[] = useMemo(() => {
		const baseMap = makeBaseMap(initialMapSettings);
		const polygonLayer = new GeoJsonLayer({
			id: "geojson-layer",
			data: geoJson || { type: "FeatureCollection", features: [] },
			filled: true,
			stroked: true,
			getLineWidth: 0.01,
			lineWidthScale: 100,
			lineWidthUnits: "pixels",
			getLineColor: [255, 255, 255, 100],
			getFillColor: [220, 100, 27, 200], // TO_BE_CHECEKD
		});
		return [baseMap, polygonLayer];
	}, [regionCode, geoJson]);
	// const layers: (GeoJsonLayer | any)[] = useMemo(() => [baseMap, polygon], [baseMap, polygon]);

	const onViewStateChange = useCallback(({ viewState }: ViewStateChangeParameters) => {
		setViewState(viewState);
	}, []);

	// useEffect(() => {
	// 	// DeckGL 초기화
	// 	const gl = (document.getElementById("deckgl-overlay") as HTMLCanvasElement)?.getContext(
	// 		"webgl2",
	// 		{ preserveDrawingBuffer: true },
	// 	);

	// 	if (gl) deckRef.current = new Deck({ gl });

	// 	return () => {
	// 		deckRef.current?.finalize();
	// 	};
	// }, []);

	return (
		<div ref={mapRef} className="relative h-[400px] w-full border">
			<DeckGL
				ref={deckRef}
				style={{ width: "100%", height: "100%" }}
				viewState={viewState}
				onViewStateChange={onViewStateChange}
				controller={false}
				layers={layers}
				deviceProps={{
					type:'webgl'
				}}
			/>
		</div>
	);
}
