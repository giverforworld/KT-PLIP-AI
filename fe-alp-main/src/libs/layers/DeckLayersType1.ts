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

import { GeoJsonLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";

import * as d3 from "d3";
import { interpolateMinMax, parseRGB } from "./LayerFnts";
import { ageGroupColor, prpsColor } from "@/constants/gis";
import { Feature } from "geojson";
import { getRankedColor } from "./getRankedColor";
import TripsLayerCustom from "./TripsLayerCustom";

const interpolate = d3.interpolateRgb("#FFD75E", "#CD1103");
const tripColor = [244, 81, 117];

export function makeBasePolygons({
	features,
	top10Ref,
	selectedRegion,
	setTooltipInfo,
	mapIdx,
}: any) {
	if (!features) return [];
	// const { isVectorAnalysis } = mapSettings;

	const emdObj = new GeoJsonLayer({
		id: "emdmap-type1",
		// visible: isVectorAnalysis,
		// data: "./maps/adm.geojson",
		data: features,
		stroked: true,
		filled: true,
		// lineWidthMinPixels: 1,
		// lineWidthScale: 100,
		lineWidthMaxPixels: 2,
		getLineWidth: 200,
		pickable: true,
		opacity: 0.4,
		autoHighlight: true,
		// getLineColor: [80, 80, 80, 60],
		getLineColor: (d: any) => {
			// properteis 내의 admCd의 키 명이 바뀌면 반영해 줘야함
			const emdcd = Number(d.properties?.REGION_CD);
			if (emdcd === selectedRegion) return [255, 255, 255, 200];
			if (top10Ref.current && top10Ref.current.top10.some((item: any) => item.descd === emdcd)) {
				const count = top10Ref.current.top10.find((item: any) => item.descd === emdcd).popu;
				if (count === 0) return [0, 0, 0, 0];
				return [255, 255, 255, 200];
			} else {
				return [0, 0, 0, 0];
			}
		},
		getFillColor: (d: any) => {
			// properteis 내의 admCd의 키 명이 바뀌면 반영해 줘야함
			const emdcd = Number(d.properties?.REGION_CD);

			if (emdcd === selectedRegion) return [230, 166, 48];

			if (top10Ref.current && top10Ref.current.top10.some((item: any) => item.descd === emdcd)) {
				return [250, 250, 60, 150];
			} else {
				return [0, 0, 0, 10];
			}
		},
		highlightColor: [50, 150, 200, 0],

		onHover: ({ index, object, x, y }: any) => {
			try {
				if (!object) {
					if (typeof setTooltipInfo === "function")
						setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
					return;
				}
				const {
					properties: { REGION_CD },
				} = object;
				const data = top10Ref?.current?.top10?.find((el: any) => el.descd === +REGION_CD);

				if (!data) {
					if (typeof setTooltipInfo === "function")
						setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
					return;
				}
				if (typeof setTooltipInfo === "function") {
					setTooltipInfo({
						mapType: "vector",
						isActive: true,
						id: index,
						mapIdx,
						x,
						y,
						count: data?.popu,
						data: { ...data },
					});
				}
			} catch (error) {
				if (typeof setTooltipInfo === "function") {
					setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
				}
			}
		},

		updateTriggers: {
			getFillColor: top10Ref.current,
			getLineColor: top10Ref.current,
		},
		// visible: selectedId === originalId,
	});

	// 배경 딤드 레이어 추가
	const backgroundDimLayer = new PolygonLayer({
		id: "background-dim-layer",
		data: [
			{
				// 전체 지도를 덮는 큰 사각형
				contour: [
					[-180, -90],
					[180, -90],
					[180, 90],
					[-180, 90],
				],
			},
		],
		getPolygon: (d: any) => d.contour,
		getFillColor: [0, 0, 0, 120], // 반투명 검은색
		pickable: false,
		stroked: false,
	});
	return [backgroundDimLayer, emdObj];
	// return [emdObj];
}

export function makeAdmPolyForTrip({
	geoJson,
	features,
	tripData,
	mapSettings,
	tripLayerTime,
	setTooltipInfo,
	mapIdx,
	lyaerType,
	isTextLayerShow
}: any) {
	if (!geoJson || !tripData) {
		return [];
	}
	const { regionsObj, trips } = tripData;
	// const { inOutFlow } = mapSettings;
	const targetRegions = Object.keys(regionsObj);

	const counts = Object.values(regionsObj).map((el: any) => el.count);
	const filteredFeatures = (features || geoJson.features).filter(
		(d: any) => regionsObj[d.properties.REGION_CD],
	);

	const geoObj = new GeoJsonLayer({
		id: "geoJson-layer",
		visible: true,
		data: filteredFeatures,
		// data: geoJson.features,
		pickable: true,
		filled: true,
		stroked: true,
		// lineWidthScale: 2,
		// lineWidthUnits: "pixels",
		lineWidthMaxPixels: 2,
		getLineWidth: 200,
		getLineColor: (d) => {
			const { REGION_CD: regionCode }: { REGION_CD: string } = d.properties as any;
			if (!regionsObj[regionCode]) return [0, 0, 0, 0];
			if (regionsObj[regionCode].countRate === 0) return [0, 0, 0, 0];
			return [255, 255, 255, 200];
		},
		opacity: 0.5,
		getFillColor: (d, i) => {
			const { REGION_CD: regionCode }: { REGION_CD: string } = d.properties as any;
			if (!regionsObj[regionCode]) return [0, 0, 0, 0];
			// if
			const regionObj = regionsObj[regionCode];
			const { count, index, analyzeOption, maxValueKey } = regionObj;
			if (index === 0) return [161, 194, 245];
			if (count === 0) return [0, 0, 0, 0];
			return getRankedColor(count, counts);
			// 인구 분석에서 사용했던 색상 선택 방식
			// if (regionObj.analyzeOption === "analyzeGender") {
			// 	const rgbString = interpolateMinMax(count, valueMin, valueMax);
			// 	return [...parseRGB(rgbString)] as any;
			// } else if (analyzeOption === "analyzeAgeGroup") {
			// 	return ageGroupColor[maxValueKey as string] as any;
			// } else if (analyzeOption === "movingPurposeGroup") {
			// 	return prpsColor[maxValueKey as string] as any;
			// }
		},
		onHover: ({ index, object, x, y }: any) => {
			if (!object) {
				setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
				return;
			}
			const {
				properties: { REGION_CD },
			} = object;
			const data = regionsObj[REGION_CD];
			const isActive = targetRegions.includes(REGION_CD.toString());
			setTooltipInfo((prev: GisTooltipInfo) =>
				!isActive
					? { ...prev, isActive }
					: {
							mapType: "polygon",
							mapIdx,
							id: index,
							x,
							y,
							isActive,
							count: data?.count,
							data,
						},
			);
		},
		updateTriggers: {
			getFillColor: [regionsObj],
		},
	});

	let textData = Object.entries(regionsObj)
		.map(([key, obj]: any) => ({
			regionCode: key,
			text: `${obj.regionName.split(" ").at(-1)}${isTextLayerShow && obj.count !== 0 ? `\n${Math.ceil(Math.abs(obj.count)).toLocaleString()} 명` : ""}`,
			...obj,
		}))
		.filter((el) => (el.analyzeOption === "analyzeGender" ? true : el.count > 0 || el.index === 0));

	const textObj = new TextLayer({
		id: "text-layer",
		visible: true,
		data: textData,
		pickable: false,
		getColor: [255, 255, 255],
		billboard: false,
		fontWeight: 600,
		getPosition: (d: any) => [d.center[0], d.center[1]],
		getText: (d) => d.text.replace(/(?<=\S)시(?=\S|$)/g, "시 "),
		getSize: (d) => {
			const { regionCode } = d;
			if (+regionCode > 100000) return 200;
			if (+regionCode > 100) return 500;
			return 2000;
		}, 
		getAngle: 0,
		sizeScale: 1,
		fontFamily: "pretendard",
		// sizeMaxPixels: 23,
		sizeMinPixels: 16,
		sizeUnits: "meters",
		getTextAnchor: "middle",
		getAlignmentBaseline: "center",
		characterSet: "auto",
		outlineWidth: 4,
		fontSettings: { sdf: true },
		transitions: {
			getColor: {
				duration: 1000, // 색상 변화에 대한 지속 시간(밀리초)
			},
		},
	});

	// 5초 후 애니메이션 정지 (예시)

	// const isInflow
	// const tripsWithDirection = trips
	// 	.filter((obj: any) => obj.count > 0)
	// 	.map((el: any) => ({
	// 		...el,
	// 		coordinates: inOutFlow === true ? el.coordinates?.reverse() : el.coordinates,
	// 	}));

	const lineScale = +targetRegions[0] < 100 ? 1000 : 500;

	const baseTripObj = new TripsLayer({
		id: "TripsLayer-path",
		visible: true,
		// data: trips.filter((obj: any) => obj.count > 0),
		data: trips,
		getPath: (d: any) => d.coordinates,
		getTimestamps: (d: any) => d.timestamps,
		getColor: (d: any) => {
			// const rgbString = interpolate(d.countRate * 20);
			// return parseRGB(rgbString);
			if (d.countRate < 0) return [244, 81, 117];
			return [255, 255, 255, 150];
			// return [0, 0, 0, 150];
		},
		getWidth: (d: any) => lineScale * d.countRate,
		trailLength: 100,
		currentTime: 20,
		// capRounded: true,
		// jointRounded: true,
		widthMinPixels: 4,
	});
	const tripObj = new TripsLayerCustom({
		id: "TripsLayer",
		visible: true,
		// data: trips.filter((obj: any) => obj.count > 0),
		data: trips,
		getPath: (d: any) => d.coordinates,
		getTimestamps: (d: any) => d.timestamps,
		getColor: (d: any) => {
			// const rgbString = interpolate(d.countRate * 20);
			// return parseRGB(rgbString);
			if (d.countRate < 0) return [255, 255, 255];
			return [255, 255, 255];
		},
		getWidth: (d: any) => lineScale * d.countRate,
		trailLength: 0.3,
		currentTime: tripLayerTime,
		// capRounded: true,
		// jointRounded: true,
		widthMinPixels: 4,
	});
	
	// 체류인구 내지인 화살표 없애기 => 내지인 외지인 둘 다 화살표 없애기
	if (trips.length !== 0 && !trips[0].chartData) {
		return [geoObj, textObj];
	} else {
		return [geoObj, baseTripObj, tripObj, textObj];
	}
}

export function makeOutlineLayer({ features, regionCode }: any) {
	if (!features || !regionCode) return [];

	const outlineLayer = new GeoJsonLayer({
		id: "outline-layer",
		visible: true,
		data: features,
		stroked: true,
		filled: false,
		getLineWidth: 2,
		// lineWidthScale: 10,
		// lineWidthMaxPixels: 2,
		lineWidthUnits: "pixels",
		getLineColor: (d) => {
			if (d.properties.REGION_CD === regionCode) return [0, 100, 255, 150];
			return [0, 0, 0, 30];
		},
		pickable: false,
		interactive: false,
	});

	return [outlineLayer];
}

export function makeOutlineInRegion({ geoJson, targetRegions, mapIdx }: any) {
	if (!geoJson) return [];
	const filteredFeatureCollection: Feature[] = geoJson.features.filter((f: Feature) =>
		targetRegions.includes(+f.properties?.REGION_CD),
	);

	const outlineLayer = new GeoJsonLayer({
		id: `outline-layer_${mapIdx}`,
		visible: true,
		// data: geoJson.features,
		data: filteredFeatureCollection,
		stroked: true,
		filled: false,
		getLineWidth: 200,
		// lineWidthScale: 10,
		lineWidthMaxPixels: 1.5,
		// lineWidthUnits: "pixels",
		// getFillColor: [255, 0, 0, 30],
		getLineColor: [128, 128, 128, 255],
		pickable: false,
	});

	return [outlineLayer];
}

export function makeBorderLayer({ geoJson, regionCode }: any) {
	if (!geoJson) return [];
	const features: Feature[] = geoJson.features.filter((f: Feature) =>
		// (f.properties?.REGION_CD).startsWith(regionCode.toString()),
		typeof f.properties?.REGION_CD === String(undefined) && (f.properties?.REGION_CD).startsWith(regionCode.toString()),
	);

	const outlineLayer = new GeoJsonLayer({
		id: `border-line-layer`,
		visible: true,
		data: features,
		stroked: true,
		filled: false,
		getLineWidth: 1.5,
		// lineWidthScale: 10,
		// lineWidthMaxPixels: 2,
		lineWidthUnits: "pixels",
		getLineColor: (d) => {
			return [0, 100, 255, 150];
		},
		pickable: false,
		interactive: false,
	});

	return [outlineLayer];
}
