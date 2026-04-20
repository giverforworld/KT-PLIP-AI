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

import * as d3 from "d3";
import {
	makeAdmPolygons,
	makeDefaultBackgroundMapLayer,
	makeGridCellLayer,
	makeScatterLayer,
} from "./DeckLayersType0";
import { makeAdmPolyForTrip, makeBasePolygons } from "./DeckLayersType1";
import { Feature, FeatureCollection } from "geojson";

export function makeBaseMap(mapSettings: MapSettings) {
	const tileLayerDarkMode = makeDefaultBackgroundMapLayer(true, mapSettings);
	const tileLayerLightMode = makeDefaultBackgroundMapLayer(false, mapSettings);
	return [tileLayerLightMode, tileLayerDarkMode];
}

type MakeAdmLayers = {
	admData: AdmData | undefined;
	admGeo: GeoJson | undefined;
	features?: FeatureCollection;
	isGrid: boolean;
	visualizeOption: number;
	mapIdx: number;
	setTooltipInfo: (fn: (prev: GisTooltipInfo) => GisTooltipInfo) => void;
	layerType?: string;
	isTextLayerShow: boolean;
};
export function makeAdmLayers({
	admData,
	admGeo,
	isGrid,
	visualizeOption,
	mapIdx,
	features,
	setTooltipInfo,
	layerType,
	isTextLayerShow
}: MakeAdmLayers) {
	if (!admData || !admGeo) {
		// console.log("no data for adm layers");
		return [];
	}
	const layers = makeAdmPolygons({
		geoJson: admGeo,
		admData,
		features,
		isGrid,
		visualizeOption,
		mapIdx,
		setTooltipInfo,
		layerType,
		isTextLayerShow
	});
	// polygon 레이어와 함꼐 adm layers 에 추가로 들어갈 레이어들 정의

	return layers;
}

export function makeLayersAnalysisType0({
	gisSettings,
	mapSettings,
	mapData,
	mapIdx,
	layerData,
	gridScale,
	setTooltipInfo,
	isGridScale50,
	isTextLayerShow
}: any) {
	const { visualizeOption, regionCode, isGrid } = gisSettings;
	const { layerType, data } = layerData;
	const { sidoGeo, sggGeo, admGeo } = mapData;
	const geoJson = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;
	const scatterGeoJson = regionCode < 100 ? sggGeo : admGeo;
	const geoForPolyLayer = regionCode > 100 ? admGeo : sggGeo;
	if (layerType === "gridLP") {
		const gridLayer = makeGridCellLayer({
			isGrid,
			gridScale,
			currentGridData: data,
			mapData,
			regionCode,
			setTooltipInfo,
			mapIdx,
			isGridScale50,
			isTextLayerShow
		});
		return [gridLayer];
	}
	if (layerType === "adm") {
		if (visualizeOption === 0) {
			const polyLayers = makeAdmLayers({
				admData: data,
				admGeo: geoForPolyLayer,
				isGrid,
				visualizeOption,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [polyLayers];
		}
		if (visualizeOption === 3) {
			const polyLayers = makeAdmLayers({
				admData: data,
				admGeo: geoForPolyLayer,
				isGrid,
				visualizeOption,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [polyLayers];
		}
		if (visualizeOption === 2) {
			const scatterLayer = makeScatterLayer({
				data,
				geoJson: scatterGeoJson,
				setTooltipInfo,
				mapIdx,
				layerType,
				isTextLayerShow
			});

			return [scatterLayer];
		}
	}
	// if (visualizeOption === 3) {
	// 	const polyLayers = makeAdmLayers({
	// 		admGeo,
	// 		admData: data,
	// 		mapSettings,
	// 		visualizeOption,
	// 		setTooltipInfo,
	// 		mapIdx,
	// 	});
	// 	return [polyLayers];
	// }
	return [];
}

export function makeLayersAnalysisType1({
	gisSettings,
	mapSettings,
	mapData,
	layerData,
	selectedRegion,
	setSelectedRegion,
	top10Ref,
	tripLayerTime,
	gridScale,
	setTooltipInfo,
	mapIdx,
	isTextLayerShow
}: any) {
	const { visualizeOption, regionCode, inOutFlow, isGrid } = gisSettings;
	const { sggGeo, admGeo, sidoGeo } = mapData;
	const { layerType, data } = layerData;

	// const geoJson = regionCode > 100000 ? admGeo : sggGeo;
	// const geoForPolyLayer = regionCode > 100 ? admGeo : sggGeo;
	const geoJson = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;
	if (layerType === "gridLM") {
		const gridLayer = makeGridCellLayer({
			mapData,
			isGrid,
			gridScale,
			currentGridData: data,
			regionCode,
			setTooltipInfo,
			mapIdx,
			isTextLayerShow
		});
		return [gridLayer];
	}

	if (layerType === "trip") {
		// console.log("isText", isTextLayerShow);
		if (visualizeOption === 0) {
			const basePolygons = makeAdmPolyForTrip({
				geoJson,
				tripData: data,
				mapSettings,
				tripLayerTime,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [basePolygons];
		}
		if (visualizeOption === 2) {
			const scatterLayer = makeScatterLayer({
				data: Object.values(data.regionsObj),
				geoJson,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [scatterLayer];
		}
	}

	if (layerType === "vector") {
		const basePolygons = makeBasePolygons({
			// admGeo: sggGeo,
			features: geoJson?.features,
			top10Ref,
			selectedRegion,
			setSelectedRegion,
			mapSettings,
			setTooltipInfo,
			mapIdx,
			isTextLayerShow
		});
		return [basePolygons];
	}

	return [];
}
type MakeLayersAnalysisType2 = {
	gisSettings: GisSettings;
	mapSettings: MapSettings;
	mapData: any;
	mapIdx: number;
	selectedRegion: number;
	tripLayerTime: number;
	layerData: any;
	top10Ref: any;
	setSelectedRegion: any;
	setTooltipInfo: any;
	isTextLayerShow: any
};
export function makeLayersAnalysisType2({
	gisSettings,
	mapSettings,
	mapData,
	layerData,
	selectedRegion,
	setSelectedRegion,
	top10Ref,
	tripLayerTime,
	setTooltipInfo,
	mapIdx,
	isTextLayerShow
}: MakeLayersAnalysisType2) {
	const { visualizeOption, regionCode, isGrid } = gisSettings;
	const { sggGeo, admGeo, sidoGeo } = mapData;
	const { layerType, data } = layerData;
	const geoJson = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;
	// 기준지역 폴리곤
	let featureOri = sggGeo?.features?.filter((f: any) => f.properties.REGION_CD === regionCode)[0];
	if (!featureOri)
		featureOri = sidoGeo?.features?.filter((f: any) => f.properties.REGION_CD === regionCode)[0];
	// 인구감소지역에서 결과가 없을 때 직후에 유입분석하면 나는 오류 수정
	if (featureOri && typeof regionCode === typeof 1) {
		const { REGION_NM: regionName, center } = featureOri?.properties || {};
		data[regionCode] = { ...data[regionCode], regionCode, regionName, center, isOri: true };
	}

	if (layerType === "llpInflow") {
		if (!admGeo || !sggGeo) return [];
		const features: any = [...(featureOri ? [featureOri] : []), ...admGeo?.features];
		if (visualizeOption === 0) {
			const basePolygons = makeAdmPolyForTrip({
				geoJson,
				features,
				tripData: data,
				mapSettings,
				tripLayerTime,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [basePolygons];
		}
		if (visualizeOption === 1) {
			const basePolygons = makeBasePolygons({
				features,
				top10Ref,
				selectedRegion,
				setSelectedRegion,
				isTextLayerShow
			});
			return [basePolygons];
		}
	}
	if (layerType === "depopul") {
		if (visualizeOption === 0) {
			const polyLayers = makeAdmLayers({
				admData: data,
				admGeo: sggGeo,
				isGrid,
				visualizeOption,
				setTooltipInfo,
				mapIdx,
				layerType,
				isTextLayerShow
			});
			return [polyLayers];
		} else if (visualizeOption === 2) {
			const scatterLayer = makeScatterLayer({
				data,
				geoJson: sggGeo,
				selectAllOutLine: true,
				regionScale: "sido",
				setTooltipInfo,
				mapIdx,
				layerType,
				isTextLayerShow
			});
			return [scatterLayer];
		} else if (visualizeOption === 3) {
			const polyLayers = makeAdmLayers({
				admData: data,
				admGeo: sggGeo,
				isGrid,
				visualizeOption,
				setTooltipInfo,
				mapIdx,
				isTextLayerShow
			});
			return [polyLayers];
		}
	}

	return [];
}

export const interpolate = d3.interpolateRgb("#FFD75E", "#CD1103");
export function parseRGB(rgbString: string): Array<number> {
	const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
	if (match) {
		return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
	}
	return []; // 일치하는 형식이 없는 경우 빈 배열 반환
}
export function interpolateMinMax(value: number, minValue: number, maxValue: number): string {
	// minValue와 maxValue가 0인 경우 대비
	if (minValue === 0) minValue = -1;
	if (maxValue === 0) maxValue = 1;

	if (value >= 0) {
		const interpolatePositive = d3.interpolateRgb("#FFFFFF", "#418AEC");
		// 값이 maxValue를 초과하지 않도록 제한
		const normalizedValue = Math.max(0, Math.min(1, Math.pow(value / maxValue, 1 / 2)));
		return interpolatePositive(normalizedValue);
	} else {
		const interpolateNegative = d3.interpolateRgb("#FFFFFF", "#FF6362");
		// 값이 minValue를 초과하지 않도록 제한
		const normalizedValue = Math.max(0, Math.min(1, Math.pow(Math.abs(value / minValue), 1 / 2)));
		return interpolateNegative(normalizedValue);
	}
}

export function animateTripsLayer(
	setCurrentTime: (time: number) => void,
	duration: number = 1000,
	step: number = 0.05,
	// trips레이어의 좌표는 30등분 되어있음.
) {
	let currentTime = 0;
	const intervalTime = duration * step;

	const intervalId = setInterval(() => {
		currentTime += step;

		// currentTime이 1.5 이상이 되면 1.5로 고정하고 종료
		if (currentTime >= 1.5) {
			currentTime = 1;
			setCurrentTime(currentTime);
			clearInterval(intervalId); // 애니메이션 종료
		} else {
			setCurrentTime(currentTime);
		}
	}, intervalTime);

	return intervalId;
}

export function repeatTripsLayer(
	setCurrentTime: (time: number) => void,
	duration: number = 1000,
	step: number = 0.05,
) {
	let currentTime = 0;
	const intervalTime = duration * step;

	const intervalId = setInterval(() => {
		currentTime += step;
		// currentTime이 1을 초과하면 0으로 리셋
		if (currentTime >= 1) {
			currentTime = 0;
		}

		setCurrentTime(currentTime);
	}, intervalTime);

	return intervalId;
}
export function getLegendValues(maxCount: number) {
	// 범례 배열 생성
	const step = maxCount / 7; // 5단계로 나누기
	const legendValues = Array.from({ length: 8 }, (_, i) => Math.round(maxCount - i * step)); // 내림차순 생성

	// labels 배열 생성
	const labels = legendValues.slice(0, -1).map((value, i) => {
		const nextValue = legendValues[i + 1] + 1; // 다음 값에 +1로 연속 범위 처리
		return i === legendValues.length - 2 // 마지막 범위 처리
			? `${value.toLocaleString()} 이하`
			: i === 0
				? `${(nextValue - 1).toLocaleString()} 초과`
				: `${nextValue.toLocaleString()} ~ ${value.toLocaleString()}`;
	});

	// colors 배열 생성
	const colors = legendValues.slice(0, -1).map((value) => interpolate(value / maxCount));

	return { labels, colors };
}
