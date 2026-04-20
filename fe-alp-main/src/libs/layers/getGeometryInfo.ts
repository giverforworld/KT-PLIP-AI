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

import * as turf from "@turf/turf";
import { Feature, FeatureCollection } from "geojson";

/**
 * 다각형 지오메트리의 센터, 너비, 높이를 계산하여 반환합니다.
 * @param {Object} geometry - GeoJSON 다각형 지오메트리 객체
 * @returns {Object} 중심점, 너비, 높이를 포함하는 객체
 */
export function getGeometryInfo(feature: Feature) {
	// 지오메트리가 다각형인지 확인
	const geometry = feature.geometry as any;
	if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
		throw new Error("입력 지오메트리는 다각형이어야 합니다.");
	}

	// 다각형의 바운딩 박스 계산
	const bbox = turf.bbox(geometry);
	const [minX, minY, maxX, maxY] = bbox;

	// 중심점 계산
	const center = turf.center(geometry).geometry.coordinates;

	// 너비와 높이 계산
	const width = maxX - minX;
	const height = maxY - minY;

	return {
		center: center,
		width: width,
		height: height,
	};
}

export function getGeometryInfoFromCollection(featureCollection: FeatureCollection) {
	if (featureCollection.type !== "FeatureCollection") {
		throw new Error("입력은 FeatureCollection이어야 합니다.");
	}

	const results = featureCollection.features.map((feature) => {
		// 다각형 지오메트리만 처리
		if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") {
			return {
				error: "Feature is not a polygon",
				featureId: feature.id,
			};
		}

		// 다각형의 바운딩 박스 계산
		//@ts-ignore
		const bbox = turf.bbox(feature.geometry);
		const [minX, minY, maxX, maxY] = bbox;

		// 중심점 계산
		//@ts-ignore
		const center = turf.center(feature.geometry).geometry.coordinates;

		// 너비와 높이 계산
		const width = maxX - minX;
		const height = maxY - minY;

		return {
			featureId: feature.id,
			center: center,
			width: width,
			height: height,
		};
	});

	return results;
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
		Math.log2((mapWidth * WORLD_COORDINATES_LONGITUDE) / (WORLD_DPI * longitudeDelta)) * 0.1;

	// 위도 기반 줌 레벨 계산
	const zoomLatitude =
		Math.log2((mapHeight * WORLD_COORDINATES_LATITUDE) / (WORLD_DPI * latitudeDelta)) * 0.1;

	// 두 계산 값 중 더 작은 값 반환
	const zoom = Math.min(zoomLongitude, zoomLatitude, ZOOM_MAX);
	return zoom;
}

export function handleResize(mapRef: any) {
	if (mapRef.current) {
		//@ts-ignore
		const mapWidth = mapRef.current.offsetWidth;
		//@ts-ignore
		const mapHeight = mapRef.current.offsetHeight;
		return getZoomLevel(1.564, 1.42, mapWidth, mapHeight); // 예제 값
	}
}
