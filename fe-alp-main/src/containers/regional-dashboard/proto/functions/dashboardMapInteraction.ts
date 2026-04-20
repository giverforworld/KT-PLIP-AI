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

import { Feature, FeatureCollection } from "geojson";

function moveTextNorth(
	districtInfo: any,
	selectedCity: string,
	deltaLatitude: number,
	deltalongitude: number,
) {
	return districtInfo.map((el: any) => {
		if (el.sggCode === selectedCity) {
			return {
				...el,
				center: [el.center[0] + deltalongitude, el.center[1] + deltaLatitude],
			};
		} else return el;
	});
}

export function moveFeatureNorth(
	feature: Feature,
	deltaLatitude: number,
	deltalongitude: number,
): Feature {
	// const deltaLatitude = 0.01; // 위도를 얼마나 올릴지 결정하는 값
	// const deltalongitude = -0.01;
	if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
		const newGeometry = feature.geometry.coordinates.map((polygon) =>
			polygon.map((ring: any) =>
				ring.map(([longitude, latitude]: any) => [
					longitude + deltalongitude,
					latitude + deltaLatitude,
				]),
			),
		);
		return {
			...feature,
			geometry: {
				...feature.geometry,
				coordinates: newGeometry,
			},
		};
	}
	return feature; // Polygon이나 MultiPolygon이 아닌 경우 변화 없이 반환
}

export function moveFeatureCollectionNorth(
	featureCollection: FeatureCollection,
	deltaLatitude: number,
	deltaLongitude: number,
): FeatureCollection {
	const movedFeatures = featureCollection.features.map((feature) => {
		if (feature.geometry.type === "Polygon") {
			const newCoordinates = (feature.geometry.coordinates as number[][][]).map((ring) =>
				ring.map(([longitude, latitude]) => [longitude + deltaLongitude, latitude + deltaLatitude]),
			);

			return {
				...feature,
				geometry: {
					...feature.geometry,
					coordinates: newCoordinates,
				},
			};
		} else if (feature.geometry.type === "MultiPolygon") {
			const newCoordinates = (feature.geometry.coordinates as number[][][][]).map((polygon) =>
				polygon.map((ring) =>
					ring.map(([longitude, latitude]) => [
						longitude + deltaLongitude,
						latitude + deltaLatitude,
					]),
				),
			);

			return {
				...feature,
				geometry: {
					...feature.geometry,
					coordinates: newCoordinates,
				},
			};
		}

		// Polygon이나 MultiPolygon이 아닌 경우 변화 없이 반환
		return feature;
	});

	return {
		...featureCollection,
		features: movedFeatures,
	};
}

export function animateFeatureNorth(feature: Feature, setter: any) {
	let rafId;
	let step = 0;

	const animate = () => {
		step += 1;
		const movedFeature = moveFeatureNorth(feature, 0 * step, 0); // TO_BE_CHEKCED
		setter(movedFeature);
		rafId = requestAnimationFrame(animate);
		if (step > 13) {
			cancelAnimationFrame(rafId);
		}
	};
	requestAnimationFrame(animate);
}

export function animateFeatureCollectionNorth(featureCollection: FeatureCollection, setter: any) {
	let rafId;
	let step = 0;
	const animate = () => {
		step += 1;
		const movedFeatureCollection = {
			...featureCollection,
			features: featureCollection.features.map(
				(feature) => moveFeatureNorth(feature, 0 * step, 0), // TO_BE_CHEKCED
			),
		};
		setter(movedFeatureCollection);
		rafId = requestAnimationFrame(animate);
		if (step > 13) {
			cancelAnimationFrame(rafId);
		}
	};
	requestAnimationFrame(animate);
}

export function animateTextNorth(districtInfo: any, selectedCity: string, setter: any) {
	let rafId;
	let step = 0;
	const animate = () => {
		step += 1;
		const movedText = moveTextNorth(districtInfo, selectedCity, 0 * step, 0); // TO_BE_CHEKCED
		setter(movedText);
		rafId = requestAnimationFrame(animate);
		if (step > 13) {
			cancelAnimationFrame(rafId);
		}
	};
	requestAnimationFrame(animate);
}

export function filterAdmTextInfo(
	selectedCity: string,
	regionInfo: { [key: string]: RegionInfo },
): Array<RegionInfo> {
	const sggCode = regionInfo[selectedCity]
		? regionInfo[selectedCity].sggCode
		: regionInfo[selectedCity.slice(0, -2)].sggCode;

	return Object.values(regionInfo)
		.filter((el) => el.sggCode === sggCode && el.admName)
		.map((el) => ({
			...el,
			isAdm: true, // Add isAdm property
		})) as Array<RegionInfo & { isAdm: boolean }>; // Update the type to include isAdm
}

export function getGeoJsonFeature(
	selectedCity: string | null,
	geoJson: FeatureCollection,
): Feature | null {
	if (!selectedCity) return null;
	const selectedFeature: Feature[] = geoJson.features.filter(
		(f: Feature) => f.properties?.regionCode === selectedCity,
	);
	return selectedFeature[0];
}

export function getZoomLevel(
	longitudeDelta: number,
	latitudeDelta: number,
	mapWidth: number,
	mapHeight: number,
) {
	const WORLD_DPI = 340;
	const WORLD_COORDINATES_LONGITUDE = 360;
	const WORLD_COORDINATES_LATITUDE = 180;
	const ZOOM_MAX = 21;

	// 경도 기반 줌 레벨 계산
	const zoomLongitude =
		Math.log2((mapWidth * WORLD_COORDINATES_LONGITUDE) / (WORLD_DPI * longitudeDelta)) * 0.935;

	// 위도 기반 줌 레벨 계산
	const zoomLatitude =
		Math.log2((mapHeight * WORLD_COORDINATES_LATITUDE) / (WORLD_DPI * latitudeDelta)) * 0.995;

	// 두 계산 값 중 더 작은 값 반환
	const zoom = Math.min(zoomLongitude, zoomLatitude, ZOOM_MAX);
	return zoom;
}

interface RegionInfo {
	name: string;
	sidoCode: string;
	sidoName?: string;
	center: number[];
	sggCode?: string;
	sggName?: string;
	admCode?: string;
	admName?: string;
}
