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
import DeckGLMap from "@/components/gis/DeckGLMap";
import {
	animateTripsLayer,
	makeBaseMap,
	makeLayersAnalysisType0,
	makeLayersAnalysisType1,
	makeLayersAnalysisType2,
	repeatTripsLayer,
} from "@/libs/layers/LayerFnts";
import { MapViewState } from "deck.gl";
import {
	prepareAdmData,
	prepareAdmLlpData,
	prepareCurrentGridData,
	prepareCurrentLMGridData,
	prepareD3Data,
	prepareD3LlpData,
	prepareGrid50Data,
	prepareTripData,
} from "@/libs/layers/prepareLayerData";
import GISLegend from "./GISLegend";
import D3Layers from "@/libs/layers/D3Layers";
import GisTooltipModal from "@/components/gis/GisTooltipModal";
import { makeGrid50CellLayer } from "@/libs/layers/DeckLayersType0";
import BreifingModal from "@/components/gis/BreifingModal";
import GISChartLegend from "./GisChartLegend";
import GISFlowChartLegend from "./GisFlowChart";
import { useTextLayerStore } from "@/store/textLayer";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";
import { useGisTooltipInfoStore } from "@/store/gis/gisToolTipInfo";
import { useTimeSeriesStatusStore } from "@/store/gis/timeSeriesStatus";

type Props = {
	viewState: MapViewState;
	setViewState: React.Dispatch<React.SetStateAction<MapViewState>>;
	gisSettings: GisSettings;
	mapIdx: number;
	mapData: MapData; // undefinded 일 수 있음.
	isLoading: boolean;
	serverMapData: any;
	serverGrid50Data: any;
};
export default function DeckGLContainer({
	viewState,
	setViewState,
	gisSettings,
	mapIdx,
	mapData,
	isLoading,
	serverMapData,
	serverGrid50Data,
}: Props) {
	const {
		analysisType,
		isMovingPurpose,
		isGridScaleAuto,
		gridScale: gridScaleFromSettings,
		maps: { [mapIdx]: mapSettings },
	} = gisSettings;
	const { isdarkMode } = mapSettings;
	const [selectedRegion, setSelectedRegion] = React.useState(0);
	const [tripLayerTime, setTripLayerTime] = React.useState(0);
	const setTooltipInfo = useGisTooltipInfoStore(s=>s.setgisToolTipInfo);	
	const { currentTime } = useTimeSeriesStatusStore(s=>s.timeSeriesStatus);
	const isMapActive = useIsAnalysisStore((s) => s.isAnalysis);
	
	const top10Ref = React.useRef<any>(null);
	const intervalIdRef = React.useRef<NodeJS.Timeout | null>(null);
	const textLayerShow = useTextLayerStore(s=>s.textLayer);

	//FeatureCollection

	const { gridScale, isGridScale50 } = React.useMemo(() => {
		// return 0.25;
		// 유동인구는 무조건 50m
		if (
			serverGrid50Data &&
			(serverGrid50Data?.dataType === "fpop" || serverGrid50Data?.dataType !== "none") &&
			analysisType === 3
		) {
			return { gridScale: 0.05, isGridScale50: true };
		}
		if (gridScaleFromSettings === 0.05) {
			return { gridScale: 0.05, isGridScale50: true };
		}
		const gridScale = !isGridScaleAuto
			? gridScaleFromSettings === 0.05
				? 0.25
				: gridScaleFromSettings
			: viewState.zoom >= 12
				? 0.25
				: viewState.zoom > 10 && viewState.zoom < 12
					? 0.5
					: 1;

		return { gridScale, isGridScale50: false };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewState.zoom, mapSettings, serverGrid50Data]);

	const legendLabel = React.useMemo(() => {
		switch (gisSettings.analysisType) {
			case 0:
				return " 평균 생활인구";
			case 1:
				if (gisSettings.maps[mapIdx].inOutFlow) return "총 유입인구";
				return "총 유출인구";
			case 2:
				if (gisSettings.analysisSubType === 0) return "총 유입인구";
				return "월 체류인구";
			case 3:
				return "유동인구";
			default:
				return "인구";
		}
	}, [gisSettings]);

	const layerData: any = React.useMemo(() => {
		if (!serverMapData || !isMapActive) return;
		switch (serverMapData.dataType) {
			case "gridLP":
				if (!isGridScale50)
					return {
						layerType: "gridLP",
						...prepareCurrentGridData(
							serverMapData,
							gridScale,
							currentTime,
							gisSettings,
							mapSettings,
						),
					};
			case "gridLM":
				return {
					layerType: "gridLM",
					...prepareCurrentLMGridData(
						serverMapData,
						gridScale,
						currentTime,
						gisSettings,
						mapSettings,
						isMovingPurpose,
					),
				};
			case "trip":
				return {
					layerType: "trip",
					...prepareTripData(serverMapData, gisSettings, mapIdx, currentTime),
				};
			case "vector":
				return {
					layerType: "vector",
					...prepareD3Data(serverMapData, gisSettings, mapIdx, currentTime, setSelectedRegion),
				};
			case "adm":
				return {
					layerType: "adm",
					...prepareAdmData(serverMapData, mapSettings),
				};
			case "llpInflow":
				if (gisSettings.visualizeOption === 0) {
					return {
						layerType: "llpInflow",
						...prepareTripData(serverMapData, gisSettings, mapIdx, currentTime),
					};
				} else if (gisSettings.visualizeOption === 1) {
					return {
						layerType: "llpInflow",
						...prepareD3LlpData(serverMapData, gisSettings, mapIdx, currentTime, setSelectedRegion),
					};
				}
			case "admLlp":
				return {
					layerType: "admLlp",
					...prepareAdmLlpData(serverMapData, mapSettings),
				};
			case "depopul":
				return {
					layerType: "depopul",
					...prepareAdmLlpData(serverMapData, mapSettings),
				};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverMapData, gisSettings, currentTime, mapData, gridScale, mapSettings, isMapActive]);

	const grid50Data = React.useMemo(() => {
		if (!serverGrid50Data?.res || !isMapActive || !isGridScale50) return;
		const res = prepareGrid50Data(serverGrid50Data);
		return {
			layerType: serverGrid50Data.dataType,
			...res,
		};
	}, [serverGrid50Data, isMapActive]);

	const layersWithOutGrid50 = React.useMemo(() => {
		const baseMap = makeBaseMap(mapSettings);
		if (!layerData) return [baseMap];
		if (analysisType === 1) {
			return [
				baseMap,
				...makeLayersAnalysisType1({
					gisSettings,
					mapSettings,
					mapData,
					layerData,
					selectedRegion,
					setSelectedRegion,
					top10Ref,
					tripLayerTime,
					gridScale,
					mapIdx,
					setTooltipInfo,
					isTextLayerShow: textLayerShow,
				}),
			];
		} else if (analysisType === 0) {
			return [
				baseMap,
				...makeLayersAnalysisType0({
					gisSettings,
					mapSettings,
					mapData,
					layerData,
					viewState,
					isGridScale50,
					gridScale,
					mapIdx,
					setTooltipInfo,
					isTextLayerShow: textLayerShow,
				}),
			];
		} else if (analysisType === 2) {
			return [
				baseMap,
				...makeLayersAnalysisType2({
					gisSettings,
					mapSettings,
					mapData,
					layerData,
					selectedRegion,
					setSelectedRegion,
					top10Ref,
					tripLayerTime,
					// gridScale,
					setTooltipInfo,
					mapIdx,
					isTextLayerShow: textLayerShow,
				}),
			];
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// analysisType,
		mapData,
		// admGeo,
		isLoading,
		selectedRegion,
		gisSettings,
		tripLayerTime,
		layerData,
		mapSettings,
		textLayerShow,
	]);

	const layers50 = React.useMemo(() => {
		const baseMap = makeBaseMap(mapSettings);
		if (!grid50Data?.data) return [];
		return [
			baseMap,
			...makeGrid50CellLayer({
				currentGridData: grid50Data.data,
				viewState,
				setTooltipInfo,
				mapIdx,
				gisSettings,
				mapData,
			}),
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [grid50Data]);

	const layers = React.useMemo(() => {
		if (isGridScale50) return [...layersWithOutGrid50, ...layers50];
		return [...layersWithOutGrid50];
		// return [...layersWithOutGrid50, ...layers50];
	}, [layersWithOutGrid50, layers50]);

	React.useEffect(() => {
		// intervalIdRef.current = animateTripsLayer(setTripLayerTime);
		if (
			layerData?.layerType === "trip" || //
			(layerData?.layerType === "llpInflow" && gisSettings.visualizeOption === 0)
		) {
			intervalIdRef.current = repeatTripsLayer(setTripLayerTime);
		}
		return () => {
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
			}
		};
	}, [layerData]);
	// d3 layer를 리렌더 시키기 위한 임시 방편
	React.useEffect(() => {
		if (layerData?.layerType === "llpInflow" && gisSettings.visualizeOption === 1) {
			setViewState((prev) => ({ ...prev }));
			setSelectedRegion(Number(Object.keys(layerData?.data)[0]));
		}
		// if (layerData?.layerType === "vector") setViewState((prev) => ({ ...prev }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [layerData, gisSettings.visualizeOption]);

	// 인구감소지역 zoom
	// React.useEffect(() => {
	// 	if (layerData?.layerType === "depopul") {
	// 			setViewState((prev:any) => ({
	// 				...prev,
	// 				latitude: 36.72510189136719,
	// 				longitude: 127.24448919985551,
	// 				zoom: 7
	// 			}))
	// 	}
	// }, [layerData]);
	return (
		<div className={`mapContainer_${mapIdx} relative h-full w-full overflow-hidden`}>
			{serverMapData && serverMapData.res.message !== "Llp-error1" && (
				<BreifingModal
					{...{
						mapIdx,
						serverMapData: isGridScale50 && serverGrid50Data ? serverGrid50Data : serverMapData,
						// gisSettings.analysisType !== 2 && gisSettings.gridScale !== 0.05
						// 	? // serverMapData: gisSettings.analysisType !== 2
						// 		serverGrid50Data
						// 		? serverGrid50Data
						// 		: serverMapData
						// 	: serverGrid50Data
						// 		? serverGrid50Data
						// 		: serverMapData,
						gisSettings, // Use memoized settings
						viewState,
					}}
				/>
			)}
			{serverMapData &&
				serverMapData.res.message !== "Llp-error1" &&
				layers50.length === 0 &&
				(layerData?.layerType === "depopul" ||
					(layerData?.layerType === "llpInflow" && gisSettings.visualizeOption === 0)) && (
					<GISChartLegend
						data={
							layerData.layerType === "depopul"
								? serverMapData.res[0]
								: serverMapData.res[0].layerData[serverMapData.res[0].time]
						}
						mapIdx={mapIdx}
						gisSettings={gisSettings}
						{...layerData?.legendValues}
					/>
				)}
			{serverMapData &&
				serverMapData.res.message !== "Llp-error1" &&
				layers50.length === 0 &&
				layerData?.layerType === "trip" &&
				(gisSettings.visualizeOption === 0 || gisSettings.visualizeOption === 2) && (
					<GISFlowChartLegend
						data={layerData.data.trips}
						mapIdx={mapIdx}
						gisSettings={gisSettings}
						{...layerData?.legendValues}
						mapSettings={mapSettings}
						layerType="trip"
						regionName={
							serverMapData.res.inflow
								? serverMapData.res.inflow[0].regionName
								: serverMapData.res.outflow[0].regionName
						}
					/>
				)}
			{serverMapData &&
				serverMapData.res.message !== "Llp-error1" &&
				layers50.length === 0 &&
				layerData?.layerType === "adm" &&
				(gisSettings.visualizeOption === 0 || gisSettings.visualizeOption === 2) && (
					<GISFlowChartLegend
						data={Object.values(layerData.data)}
						mapIdx={mapIdx}
						gisSettings={gisSettings}
						{...layerData?.legendValues}
						mapSettings={mapSettings}
						layerType="adm"
						regionName={serverMapData.res[0].regionName}
					/>
				)}
			{layerData?.layerType !== "vector" && layerData?.layerTyope !== "llpInflow" && (
				<GISLegend
					{...(!isGridScale50 ? layerData?.legendValues : grid50Data?.legendValues)}
					legendLabel={legendLabel}
					mapIdx={mapIdx}
				/>
			)}
			<div className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 transform">
				<GisTooltipModal
					{...{ mapIdx, gisSettings, layerData: isGridScale50 ? grid50Data : layerData }}
				/>
				<DeckGLMap
					{...{
						viewState,
						setViewState,
						layers,
						layerData,
						selectedRegion,
						isLoading,
						gisSettings,
						sggGeo: mapData.sggGeo,
						mapData,
						serverMapData,
						serverGrid50Data,
					}}
				>
					<D3Layers
						{...{
							gisSettings,
							layerData,
							mapData,
							selectedRegion,
							viewState,
							top10Ref,
							isdarkMode,
							inOutFlow: gisSettings.maps[mapIdx].inOutFlow,
						}}
					/>
				</DeckGLMap>
			</div>
		</div>
	);
}
