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

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import DeckGL from "@deck.gl/react";
import { Topology } from "topojson-specification";
import { FlyToInterpolator, MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";
import { Feature, FeatureCollection } from "geojson";
import RegDasMapControlButtons from "@/containers/regional-dashboard/map/RegDasMapControlButtons";

import {
	animateFeatureNorth,
	animateTextNorth,
	filterAdmTextInfo,
	moveFeatureCollectionNorth,
} from "../proto/functions/dashboardMapInteraction";
import { getGeoJsonSgg, getGeoJsonSggAdm, getGeoJsonSggs } from "../proto/functions/getGeoJson";
import { zoomToGeometry } from "../proto/functions/handleViewState";
import { checkIncludesUserRegion } from "@/services/filterRegionInfo";
import { useThemeStore } from "@/store/theme";
interface RegDashboardMapProps {
	userInfo: User;
	geoJson: FeatureCollection;
	topoJson: Topology;
	regionInfo: Record<string, RegionInfo>;
	sggInfo: any;
	setSelectedRegion: Dispatch<
		SetStateAction<{ regionname: string; regioncode: string; sggName: string }>
		>;
		displayRegionSidoCode: string;
		selectedDate: string;
	}
	
	export default function RegDashboardMap({
		userInfo,
		geoJson,
	topoJson,
	regionInfo,
	sggInfo,
	setSelectedRegion,
	displayRegionSidoCode,
	selectedDate
}: Readonly<RegDashboardMapProps>) {
	const INITIAL_VIEW_STATE: Partial<MapViewState> = {
		longitude: 127.146,
		latitude: 37.586,
		zoom: 7,
		transitionInterpolator: new FlyToInterpolator({ speed: 4 }),
		transitionDuration: "auto",
	};

	const REG_DAS_MAP_STATUS = {
		depth: 0,
		currentRegionCode: userInfo.baseRegion.sgg.code === '51' && Number(selectedDate) < 202307 
			? 42 
			: userInfo.baseRegion.sgg.code === '52' && Number(selectedDate) < 202403 
			? 45 
			: Number(userInfo.baseRegion.sgg.code),
		defaultRegionCode: userInfo.baseRegion.sgg.code === '51' && Number(selectedDate) < 202307 
			? 42 
			: userInfo.baseRegion.sgg.code === '52' && Number(selectedDate) < 202403 
			? 45 
			: Number(userInfo.baseRegion.sgg.code),
	};
	const theme = useThemeStore((s)=> s.theme);
	const [filteredFeatures, setFilteredFeatures] = useState<any>()
	let filteredGG = [];
	if (userInfo.baseInfo.toString() === '41') {
		const groupedSgg = [41111, 41113, 41115, 41117, 41131, 41133, 41135, 41171, 41173, 41192, 41194, 41196,
			41271, 41273, 41281, 41285, 41287, 41461, 41463, 41465];
		filteredGG = userInfo.apdInfo.filter((item:any) => !groupedSgg.includes(item))
		filteredGG.push(41110, 41130, 41170, 41190, 41270, 41280, 41460);
	} else {
		filteredGG = userInfo.apdInfo;
	}
	
	useEffect(() => {
		const filtered = geoJson.features.filter(
			(f) =>
				f.properties?.regionCode.toString().slice(0, 2) === '11' ?
					f.properties?.regionCode.toString() === '11110' :
			userInfo.baseInfo.toString().length !== 5 ? 
				userInfo.baseRegion.sido.code.toString() === f.properties?.regionCode.toString().slice(0, 2) ||
			filteredGG.includes(f.properties?.regionCode)
			: Number(userInfo.baseRegion.sgg.code) === f.properties?.regionCode,
		);
		setFilteredFeatures(filtered);
	}, [geoJson])
	
	const [mapStatus, setMapStatus] = useState<RegDashboardMapStatus>(REG_DAS_MAP_STATUS);
	const [viewState, setViewState] = useState<Partial<MapViewState>>(INITIAL_VIEW_STATE);
	const [floatingFeature, setFloatingFeature] = useState<Feature | FeatureCollection | undefined>(
		undefined,
	);
	const [isPlay, setIsPlay] = useState(false);
	const [admGeoJson, setAdmGeoJson] = useState<FeatureCollection | undefined>(undefined);
	const [sggGeoJson, setSggGeoJson] = useState<FeatureCollection | undefined>(undefined);
	const [textInfo, setTextInfo] = useState<Array<RegionInfo>>(Object.values(sggInfo));

	// mapRef to resize component
	const mapRef = useRef<HTMLDivElement>(null);
	const isFirstRender = useRef(true);

	// iterate regions
	useEffect(() => {
		const list = filteredFeatures;
		if (!isPlay) return;
		let timeoutId: ReturnType<typeof setTimeout>;

		const update = (idx: number) => {
			const updatedIdx = (idx + 1) % list.length;
			const currentRegionCode =
				list[updatedIdx].properties?.sggCode || +list[updatedIdx].properties?.regionCode;

			setMapStatus((prev) => ({
				...prev,
				currentRegionCode,
			}));
			timeoutId = setTimeout(() => update(updatedIdx), 7000);
		};

		update(
			list.findIndex(
				(f:any) =>
					f.properties?.sggCode === mapStatus.currentRegionCode ||
					+f.properties?.regionCode === mapStatus.currentRegionCode,
			),
		);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [isPlay, displayRegionSidoCode, filteredFeatures]);

	useEffect(() => {
		if (userInfo.baseInfo.toString().length === 5) {
			const livingRegions = [41570, 41360, 41590, 41480, 41220];
			if (
				!mapRef.current ||
				!floatingFeature ||
				livingRegions.includes(mapStatus.currentRegionCode)
			)
				return;
			zoomToGeometry(mapRef, floatingFeature, setViewState);
		
			let featureCollection;
			featureCollection = getGeoJsonSggAdm({
				topoJson,
				sggCode: mapStatus.currentRegionCode,
			});
			
			setAdmGeoJson(moveFeatureCollectionNorth(featureCollection, 0, 0));
			const newAdmTextInfo = filterAdmTextInfo(mapStatus.currentRegionCode + "", regionInfo);
			setTextInfo(newAdmTextInfo);
		}
	}, [floatingFeature])
	// floating animation for sgg scale feature
	useEffect(() => {
		const currentRegionCodeStr = mapStatus.currentRegionCode.toString();
		let region;
		// // 사용자 권한 지역 아니면 막기
		if (checkIncludesUserRegion(currentRegionCodeStr, Number(userInfo.baseInfo), userInfo.apdInfo)) {
			if (currentRegionCodeStr.length > 5) {
				region = Object.values(regionInfo).find((adm) => adm.admCode === currentRegionCodeStr);
				if (region) {
					setSelectedRegion({
						regionname: region.admName ?? "Unknown Region",
						regioncode: currentRegionCodeStr,
						sggName: region.sggName ?? "Unknown SGG Region",
					});
				} else {
					// console.log("Region not found");
				}
			} else {
				region = sggInfo.find(
					(region: {
						name: string;
						sidoCode: string | number;
						sggCode: string;
						sidoName: string;
						sggName: string;
						center: [number, number];
					}) => region.sggCode === currentRegionCodeStr,
				);
				if (region) {
					setSelectedRegion({
						regionname: region.sggName,
						regioncode: currentRegionCodeStr,
						sggName: region.sggName,
					});
				} else {
					// console.log("Region not found");
				}
			}
		}
		// 선택된 도시 및 지역 코드 설정
		if (mapStatus.currentRegionCode > 1000000) {
			const sggCode = Math.floor(mapStatus.currentRegionCode / 1000);
			const sggGeo = getGeoJsonSggAdm({ topoJson, sggCode });
			const movedSggFeature = moveFeatureCollectionNorth(sggGeo, 0, 0);
			zoomToGeometry(mapRef, movedSggFeature, setViewState);
			setAdmGeoJson(movedSggFeature);

			// setFloatingFeature(undefined);
		} else {
			const feature = getGeoJsonSgg({
				topoJson,
				sggCode: mapStatus.currentRegionCode.toString().slice(0, 2) === '51' && Number(selectedDate) < 202307 
				? Number('42'+mapStatus.currentRegionCode.toString().slice(2)) 
				: mapStatus.currentRegionCode.toString().slice(0, 2) === '52' && Number(selectedDate) < 202403 
				? Number('45'+mapStatus.currentRegionCode.toString().slice(2)) 
				: mapStatus.currentRegionCode,
			});
			animateFeatureNorth(feature, setFloatingFeature);
			animateTextNorth(sggInfo, mapStatus.currentRegionCode + "", setTextInfo);

			// zoom to geoJson
			zoomToGeometry(mapRef, geoJson, setViewState);

			setAdmGeoJson(undefined);
			// setSggGeoJson(undefined);
			// setFloatingFeature(undefined);

			// const newAdmTextInfo = filterAdmTextInfo(
			//   mapStatus.currentRegionCode + "",
			//   regionInfo
			// );
			// setTextInfo(newAdmTextInfo);
		}
	}, [mapStatus.currentRegionCode]);

	// component resize
	useEffect(() => {
		const geometry = admGeoJson || geoJson;
		const handleResize = () => {
			zoomToGeometry(mapRef, geometry, setViewState);
		};
		// 윈도우 리사이즈 이벤트 리스너 등록
		window.addEventListener("resize", handleResize);
		if (isFirstRender.current) {
			isFirstRender.current = false;
			if (mapStatus.defaultRegionCode > 100000) {
				const feature = getGeoJsonSgg({
					topoJson,
					sggCode: Math.floor(mapStatus.defaultRegionCode / 1000),
				});
				setTimeout(() => zoomToGeometry(mapRef, feature, setViewState, 0), 0);
			} else {
				setTimeout(() => zoomToGeometry(mapRef, geometry, setViewState, 0), 0);
			}
		}

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [admGeoJson]);

	useEffect(() => {
		const currentRegionCode = userInfo.baseInfo.toString().startsWith(displayRegionSidoCode === '51' && Number(selectedDate) < 202307 
			? '42' 
			: displayRegionSidoCode === '52' && Number(selectedDate) < 202403 
			? '45'
			: userInfo.baseRegion.sido.code)
			? userInfo.baseInfo > 100
				? userInfo.baseInfo
				: userInfo.apdInfo[0] ?? userInfo.baseInfo
			: userInfo.apdInfo.find((region) => region.toString().startsWith(displayRegionSidoCode === '51' && Number(selectedDate) < 202307 
			? '42' 
			: displayRegionSidoCode === '52' && Number(selectedDate) < 202403 
			? '45'
			: userInfo.baseRegion.sido.code)) || 0;
		zoomToGeometry(mapRef, geoJson, setViewState);
		animateTextNorth(sggInfo, mapStatus.currentRegionCode + "", setTextInfo);
		setMapStatus((prev) => ({
			...prev,
			currentRegionCode: currentRegionCode,
		}));
		setIsPlay(false)
		setIsPlay(true)
	}, [displayRegionSidoCode]);

	// base layer
	const baseLayer = new GeoJsonLayer({
		id: "baseLayer",
		data: geoJson.features,
		pickable: true,
		lineWidthScale: 100,
		getLineWidth: () => 2,
		getLineColor: theme === "dark" ? [13, 13, 16] : [255, 255, 255],
		getFillColor: (d) => {
			return theme === "dark" ? [79, 96, 136] : [218, 229, 251];
			// const regionCode = d.properties?.sggCode ? +d.properties.sggCode : +d.properties?.regionCode;
			// return regionCode === mapStatus.currentRegionCode
			// 	? theme === "dark"
			// 		? [118, 160, 239]
			// 		: [125, 162, 242] // 선택된 지역
			// 	: theme === "dark"
			// 		? [79, 96, 136]
			// 		: [218, 229, 251]; // 기본 지역 색상
		},
		filled: true,
		onClick: ({ object: d }) => {
			const regionCode = d.properties?.sggCode ? +d.properties.sggCode : +d.properties?.regionCode;
			setMapStatus((prev) => ({
				...prev,
				currentRegionCode: regionCode,
			}));
		},
		updateTriggers: {
			getLineColor: [theme],
			getFillColor: [mapStatus.currentRegionCode, theme],
		},
	});

	// animating layer
	const floatingPolygonLayer =
		floatingFeature &&
		new GeoJsonLayer({
			id: "floated-layer",
			data: floatingFeature,
			pickable: true,
			lineWidthScale: 0,
			getFillColor: [118, 161, 239],

			onClick: ({ object }) => {
				//TO_BE_CHECKED : 생활권 막기
				// if (!mapRef.current || !floatingFeature) return;
				const livingRegions = [41570, 41360, 41590, 41480, 41220];
				if (
					!mapRef.current ||
					!floatingFeature ||
					livingRegions.includes(mapStatus.currentRegionCode)
				)
					return;
				zoomToGeometry(mapRef, floatingFeature, setViewState);

				let featureCollection;

				const idx = geoJson.features.findIndex(
					(feature) => +feature.properties?.sggCode === object.properties?.sggCode,
				);

				if (idx > 0 && geoJson.features[idx].properties?.subRegions) {
					const sggCodes = geoJson.features[idx].properties?.subRegions;
					// const regions = getGeoJsonSggs({ topoJson, sggCodes });
					// const featureCollection = moveFeatureCollectionNorth(regions, 0, 0);

					// setSggGeoJson(featureCollection);
					setMapStatus((prev) => ({
						...prev,
						currentRegionCode: object.properties.sggCode,
					}));
					//text info
					const subRegionsTextInfo = sggCodes.map((code: number) => regionInfo[code]);
					setTextInfo(subRegionsTextInfo);
				} else {
					featureCollection = getGeoJsonSggAdm({
						topoJson,
						sggCode: mapStatus.currentRegionCode,
					});
					setAdmGeoJson(moveFeatureCollectionNorth(featureCollection, 0, 0));
					const newAdmTextInfo = filterAdmTextInfo(mapStatus.currentRegionCode + "", regionInfo);
					setTextInfo(newAdmTextInfo);
				}
			},
		});

	// sgg polygon with adm border line
	// const sggLayer =
	// 	sggGeoJson &&
	// 	new GeoJsonLayer({
	// 		id: "adm-layer",
	// 		data: sggGeoJson.features,
	// 		pickable: true,
	// 		getLineWidth: 1,
	// 		lineWidthScale: 100,
	// 		getFillColor: (d: any) => {
	// 			if (+d.properties.sggCode === mapStatus.currentRegionCode) return [255, 100, 0];
	// 			return [0, 152, 59, 0];
	// 		},
	// 		onClick: ({ object }) => {
	// 			const sggCode = object.properties.sggCode;
	// 			const featureCollection = getGeoJsonSggAdm({
	// 				topoJson,
	// 				sggCode,
	// 			});

	// 			setAdmGeoJson(moveFeatureCollectionNorth(featureCollection, 0, 0));
	// 			// setSggGeoJson(undefined);
	// 			const newAdmTextInfo = filterAdmTextInfo(sggCode + "", regionInfo);
	// 			setTextInfo(newAdmTextInfo);
	// 		},
	// 		updateTriggers: {
	// 			getFillColor: [mapStatus.currentRegionCode],
	// 		},
	// 	});

	// sgg polygon with adm border line
	const admLayer =
		admGeoJson &&
		new GeoJsonLayer({
			id: "adm-layer",
			data: admGeoJson.features,
			pickable: true,
			getLineWidth: 1,
			getLineColor: theme === "dark" ? [13, 13, 16] : [255, 255, 255],
			lineWidthScale: 100,
			getFillColor: (d: any) => {
				if (+d.properties.admCode === mapStatus.currentRegionCode) return [0, 152, 227];
				return [118, 161, 239];
			},
			onClick: ({ object }) => {
				setMapStatus((prev) => ({
					...prev,
					currentRegionCode: object.properties.admCode,
				}));
			},
			updateTriggers: {
				getFillColor: [mapStatus.currentRegionCode],
			},
		});

	const textLayer = new TextLayer({
		id: "text-layer",
		data: textInfo,
		pickable: false,
		fontWeight: 600,
		getColor: (d) => {
			const currentRegionCodeStr = String(mapStatus.currentRegionCode);
			if ((d.sggCode as string) === currentRegionCodeStr) {
				return theme === "dark" ? [0, 0, 0, 255] : [3, 28, 74, 255];
			}
			if ((d.admCode as string) === currentRegionCodeStr) {
				return [255, 255, 255];
			}
			if (currentRegionCodeStr.length > 5) {
				return [3, 28, 74, 255];
			}

			return theme === "dark" ? [255, 255, 255] : [3, 28, 74, 255];
		},
		getPosition: (d) => d.center,
		getText: (d) => d.admName || d.sggName,
		fontFamily: "Pretendard",
		getSize: 3,
		sizeScale: 4,
		getAngle: 0,
		getTextAnchor: "middle",
		getAlignmentBaseline: "center",
		characterSet: "auto",
		outlineWidth: 0,
		outlineColor: [0, 0, 0, 0],
		fontSettings: { sdf: false },
		updateTriggers: {
			getColor: [mapStatus.currentRegionCode, theme],
		},
	});

	const layers = [baseLayer, floatingPolygonLayer, admLayer, textLayer].filter(Boolean);

	const getInitialStatus = () => {
		setMapStatus((prev) => ({
			...prev,
			currentRegionCode: userInfo?.baseInfo ?? 0,
		}));
		setTimeout(() => {
			setIsPlay((prev) => !prev)
		}, 300);
	};

	const onViewStateChange = useCallback(({ viewState }: ViewStateChangeParameters) => {
		setViewState(viewState);
	}, []);

	return (
		<div ref={mapRef} className="relative h-full w-full" onClick={() => setIsPlay(false)}>
			<div className="absolute left-4 top-4 z-10 flex gap-2">
				<RegDasMapControlButtons
					isPlay={isPlay}
					setIsPlay={setIsPlay}
					getInitialStatus={getInitialStatus}
					userInfo={userInfo}
				/>
			</div>

			<DeckGL
				viewState={viewState}
				onViewStateChange={onViewStateChange}
				controller={{
					dragPan: false,
					doubleClickZoom: false,
					touchZoom: false,
					touchRotate: false,
					keyboard: false,
					scrollZoom: false,
				}}
				layers={layers}
				useDevicePixels={true}
			></DeckGL>
		</div>
	);
}
