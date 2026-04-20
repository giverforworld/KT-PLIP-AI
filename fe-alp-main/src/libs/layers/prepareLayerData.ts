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

import { getLegendValuesForAdm } from "./getLegendValues";
import { getLegendValues } from "./LayerFnts";
import { makeD3Data, makeTripLayerData } from "./makeLayerData";
import {
	preprocessingTripData,
	recountAdmData,
	recountGridData,
	recountLMGridData,
} from "./recountMapData";

export function prepareCurrentGridData(
	serverMapData: any,
	gridScale: number,
	currentTime: number,
	gisSettings: GisSettings,
	mapSettings: MapSettings,
) {
	if (serverMapData?.dataType !== "gridLP") return;
	if (serverMapData.res.message) return;
	if (!gridScale) return;

	const layerData = serverMapData.res[0]?.layerData;
	if (!layerData) return;
	if (gisSettings.isTimeLine) {
		const selectedTime = layerData[currentTime] ? currentTime : Object.keys(layerData)[0];
		// : Object.keys(layerData)[Math.floor(Math.random() * Object.keys(layerData).length)];
		const data = layerData[selectedTime][gridScale];
		const maxCount = data.reduce((max: number, item: any) => {
			return item.count > max ? item.count : max;
		}, -Infinity);
		return { data: layerData[selectedTime][gridScale], legendValues: getLegendValues(maxCount) };
	}

	const data: any = Object.values(layerData)[0];
	const result = recountGridData(data[gridScale], mapSettings);
	const maxCount = result.reduce((max: number, item: any) => {
		return item.count > max ? item.count : max;
	}, -Infinity);
	return { data: result, legendValues: getLegendValues(maxCount) };
	// return recountGridData(data[gridScale], mapSettings);
}

export function prepareCurrentLMGridData(
	serverMapData: any,
	gridScale: number,
	currentTime: number,
	gisSettings: any,
	mapSettings: any,
	isMovingPurpose: boolean,
) {
	if (serverMapData?.dataType !== "gridLM" || !gridScale) return;
	if (serverMapData.res.message) return;
	const { inOutFlow } = mapSettings;
	const gridLM = serverMapData?.res[inOutFlow ? "inflow" : "outflow"];
	if (!gridLM?.length) return;
	const layerData = gridLM[0].layerData;
	if (gisSettings.isTimeLine) {
		const selectedTime = layerData[currentTime] ? currentTime : Object.keys(layerData)[0];
		// : Object.keys(layerData)[Math.floor(Math.random() * Object.keys(layerData).length)];

		const result = recountLMGridData(
			layerData[selectedTime][gridScale],
			gisSettings,
			mapSettings,
			isMovingPurpose,
		);
		const maxCount = result.reduce((max: number, item: any) => {
			return item.count > max ? item.count : max;
		}, -Infinity);
		return { data: result, legendValues: getLegendValues(maxCount) };
	}

	const data: any = Object.values(layerData)[0];
	const result = recountLMGridData(data[gridScale], gisSettings, mapSettings, isMovingPurpose);
	const maxCount = result.reduce((max: number, item: any) => {
		return item.count > max ? item.count : max;
	}, -Infinity);
	return { data: result, legendValues: getLegendValues(maxCount) };
}

export function prepareGrid50Data(serverGrid50Data: any) {
	if (!serverGrid50Data?.res) return { ok: false, data: null };
	const gridLM = serverGrid50Data?.res[0];
	const layerData = gridLM.layerData;
	const data: any = (Object.values(layerData)[0] as any)[0.05];
	const maxCount = data.reduce((max: number, item: any) => {
		return item.count > max ? item.count : max;
	}, -Infinity);
	return { data, legendValues: getLegendValues(maxCount) };
}

export function prepareTripData(
	serverMapData: any,
	gisSettings: any,
	mapIdx: number,
	currentTime: number,
	// inOutFlow: boolean,
) {
	if (serverMapData?.dataType !== "trip" && serverMapData?.dataType !== "llpInflow") return;
	if (serverMapData.res.message) return;

	const {
		maps: { [mapIdx]: mapSettings },
	} = gisSettings;
	const { inOutFlow } = mapSettings;
	let trip;
	if (serverMapData.dataType === "trip") {
		trip = serverMapData.res[inOutFlow ? "inflow" : "outflow"];
		if (!trip) {
			const flow: any = Object.values(serverMapData.res)[0];
			trip = flow[0];
		} else trip = trip[0];
	} else trip = serverMapData.res[0];
	if (!trip) return;
	const layerData = trip.layerData;

	const isLlp = serverMapData.dataType === "trip" ? false : true;
	const { filteredData, maxCount } = preprocessingTripData({
		layerData,
		gisSettings,
		mapIdx,
		currentTime,
		isLlp,
	});
	let data: any = {};
	if (trip.options.isIn === 0) {
		data = makeTripLayerData(
			filteredData,
			[...(trip.center as [number, number]), 0],
			trip.regionCode,
			trip.regionName,
			filteredData.length + 1,
			inOutFlow,
		);
	} else {
		data = makeTripLayerData(
			filteredData,
			[...(trip.center as [number, number]), 0],
			trip.regionCode,
			trip.regionName,
			11,
			inOutFlow,
		);
	}
	const counts = filteredData
		.map((el: any) => el.count)
		.sort((a: number, b: number) => b - a)
		.splice(0, 9);

	// trips 데이터의 표현 숫자를 결정하고, 이를 유입/유출에 의해 구분하여 방향을 정한다
	data.trips = data.trips
		.filter((obj: any) => obj.count > 0)
		.map((el: any) => ({
			...el,
			coordinates: inOutFlow === true ? el.coordinates?.reverse() : el.coordinates,
		}));
	return { data, legendValues: getLegendValuesForAdm(counts) };
}
export function prepareD3Data(
	serverMapData: any,
	gisSettings: any,
	mapIdx: number,
	currentTime: number,
	setSelectedRegion: React.Dispatch<React.SetStateAction<number>>,
) {
	if (serverMapData?.dataType !== "vector") return;
	if (serverMapData.res.message) return;

	const {
		maps: { [mapIdx]: mapSettings },
	} = gisSettings;
	const { inOutFlow } = mapSettings;
	const vector = serverMapData.res?.inflow
		? serverMapData.res["inflow"][0]
		: serverMapData.res["outflow"][0];
	const layerData = vector.layerData;

	let centerOri;
	const { center, regionCode: oriCd } = Object.values(layerData)[0] as any;
	if (center) centerOri = center;
	else {
		const layerDataObj = Object.values(layerData)[0] as any;
		const destinations = layerDataObj.destinations;
		const center = destinations.find(
			(destination: any) => destination.regionCode === oriCd,
		)?.center;
		centerOri = center;
	}
	// return;
	const { filteredData, maxCount } = preprocessingTripData({
		layerData,
		gisSettings,
		mapIdx,
		currentTime,
	});
	setSelectedRegion(oriCd);

	const D3Data = makeD3Data(filteredData, centerOri, oriCd);
	return { data: { [oriCd]: D3Data }, legendValues: getLegendValues(maxCount) };
}

export function prepareD3LlpData(
	serverMapData: any,
	gisSettings: any,
	mapIdx: number,
	currentTime: number,
	setSelectedRegion: React.Dispatch<React.SetStateAction<number>>,
) {
	if (serverMapData?.dataType !== "llpInflow") return;
	if (serverMapData.res.message) return;

	const vector = serverMapData.res[0];
	if (!vector) return;
	const layerData = vector.layerData;

	const {
		center: centerOri,
		regionCode: oriCd,
		regionName: oriName,
	} = Object.values(layerData)[0] as any;
	const { filteredData, maxCount } = preprocessingTripData({
		layerData,
		gisSettings,
		mapIdx,
		currentTime,
		isLlp: true,
	});
	setSelectedRegion(oriCd);

	const D3Data = makeD3Data(filteredData, centerOri, oriCd, oriName);
	const result = {
		// legendValues: getLegendValues(maxCount),
		data: { [oriCd]: { ...D3Data, desArr: D3Data.desArr } },
	};

	// result.data[oriCd].dd = D3Data.desArr;
	return result;
}

export function prepareAdmData(serverMapData: any, mapSettings: MapSettings) {
	if (serverMapData?.dataType !== "adm") return;
	if (serverMapData.res.message) return;

	const layerData = serverMapData.res[0]?.layerData;
	if (!layerData) return;
	const data: any = Object.values(layerData)[0];
	const result = recountAdmData(data, mapSettings);
	const obj = result.reduce((acc: any, el: any) => {
		acc[el.regionCode] = el;
		return acc;
	}, {});
	const counts = result.map((el: any) => el.count);
	return { data: obj, legendValues: getLegendValuesForAdm(counts) };
}

export function prepareAdmLlpData(serverMapData: any, mapSettings: MapSettings) {
	if (serverMapData?.dataType !== "admLlp" && serverMapData?.dataType !== "depopul") return;
	if (serverMapData.res.message) return;

	const layerData = serverMapData.res[0]?.layerData;
	if (!layerData) return;
	const data: any = Object.values(layerData)[0];
	if (!data) return;
	const admData = serverMapData.dataType === "admLlp" ? data?.destinations : data;
	const result = recountAdmData(admData, mapSettings);
	const obj = result.reduce((acc: any, el: any) => {
		acc[el.regionCode] = el;
		return acc;
	}, {});
	const counts = result.map((el: any) => el.count);
	return {
		data: obj,
		legendValues: getLegendValuesForAdm(counts, serverMapData?.dataType === "depopul"),
	};
}
