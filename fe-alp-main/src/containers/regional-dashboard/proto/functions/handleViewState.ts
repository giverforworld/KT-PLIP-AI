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

import { Feature, FeatureCollection, Geometry } from "geojson";
import { getGeometryInfo } from "./getGeometryInfo";
import { getZoomLevel } from "./dashboardMapInteraction";
// import { FlyToInterpolator } from "react-map-gl";
import * as d3 from "d3";
import bbox from "@turf/bbox";

function calculateBoundingBoxAndCenter(geometry: Geometry | FeatureCollection) {
	if (geometry.type === "FeatureCollection") {
		const bounds = bbox(geometry);
		const formattedBounds = [
			[bounds[0], bounds[1]],
			[bounds[2], bounds[3]],
		];
		const center = d3.geoCentroid(geometry);
		const [minX, minY] = formattedBounds[0];
		const [maxX, maxY] = formattedBounds[1];
		const width = maxX - minX;
		const height = maxY - minY;

		return { center, width, height };
	} else {
		return getGeometryInfo({ type: "Feature", geometry } as Feature);
	}
}

/**
 * 주어진 GeoJSON Feature 또는 FeatureCollection의 경계에 맞춰
 * 지도의 줌 레벨과 뷰를 조정하는 함수입니다.
 *
 * 이 함수는 제공된 Feature 또는 FeatureCollection의 바운딩 박스와 중심점을 계산한 후,
 * 해당 정보에 맞게 지도의 뷰 상태를 조정합니다. 단일 GeoJSON Feature와 여러 개의 Feature를 포함한
 * FeatureCollection 모두를 처리할 수 있습니다.
 *
 * @param {React.RefObject<HTMLDivElement>} mapRef - 지도의 컨테이너 요소에 대한 참조입니다. 지도의 너비와 높이를 계산하는 데 사용됩니다.
 * @param {Feature | FeatureCollection} featureOrCollection - 줌 레벨을 조정하기 위해 경계를 사용할 GeoJSON Feature 또는 FeatureCollection입니다.
 * @param {(viewState: any) => void} setViewState - 지도의 뷰 상태를 업데이트하는 함수입니다. 일반적으로 상태 관리 훅과 함께 사용됩니다.
 *
 * @throws {Error} 제공된 지오메트리가 유효한 GeoJSON Feature 또는 FeatureCollection이 아닌 경우 오류를 발생시킵니다.
 *
 * @example
 * // 단일 Feature에 맞춰 줌
 * const feature = { type: "Feature", geometry: { type: "Polygon", coordinates: [...] }, properties: {} };
 * zoomToFeature(mapRef, feature, setViewState);
 *
 * @example
 * // FeatureCollection에 맞춰 줌
 * const featureCollection = { type: "FeatureCollection", features: [...] };
 * zoomToFeature(mapRef, featureCollection, setViewState);
 */
export function zoomToGeometry(
	mapRef: React.RefObject<HTMLDivElement | null>,
	featureOrCollection: Feature | FeatureCollection,
	setViewState: (viewState: any) => void,
	transitionDuration: string | number = "auto",
) {
	if (!mapRef.current || !featureOrCollection) return;

	const mapWidth = mapRef.current.offsetWidth;
	const mapHeight = mapRef.current.offsetHeight;

	const { center, width, height } = calculateBoundingBoxAndCenter(
		featureOrCollection.type === "Feature" ? featureOrCollection.geometry : featureOrCollection,
	);

	const [longitude, latitude] = center;
	const newZoom = getZoomLevel(width, height, mapWidth, mapHeight);

	setViewState((prevState: any) => ({
		...prevState,
		zoom: newZoom,
		latitude: latitude,
		longitude,
		// transitionInterpolator: new FlyToInterpolator({ speed: 2.5 }),
		// transitionDuration,
	}));
}
