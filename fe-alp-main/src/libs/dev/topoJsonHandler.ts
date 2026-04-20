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

import { FeatureCollection } from "geojson";
import { feature, merge } from "topojson-client";
import * as d3 from "d3-geo";
import { Topology } from "topojson-specification";
import simplify from "simplify-js";
import {
	groupedSgg,
	livingRegions,
} from "@/containers/regional-dashboard/proto/constants/groupedRegions";

type Params = {
	regionCode: number;
	topoJson: any;
	scale?: string;
};

export function topoToGeo({ regionCode, topoJson, scale }: Params): FeatureCollection | undefined {
	if (!topoJson) {
		// console.log("no topoJson");
		return;
	}
	const objects = Object.values(topoJson.objects) as Array<any>;
	const geometries = objects[0].geometries;
	// const geometries = topoJson.objects["data"].geometries || topoJson.objects["jjh"]?.geometries;

	let outlineScale: string;
	let borderScale: string;
	if (topoJson.objects.jjh) {
		outlineScale = +regionCode < 100 ? "sido" : "sgg";
		borderScale = +regionCode < 100 ? "sgg" : "adm_cd2";
	} else {
		outlineScale = +regionCode < 100 ? "SIDO_CD" : "SGG_CD";
		borderScale = +regionCode < 100 ? "SGG_CD" : "HEMD_CD";
	}
	if (scale) borderScale = "HEMD_CD";

	let filteredGeometries;
	if (regionCode === 0) {
		filteredGeometries = geometries;
	} else {
		filteredGeometries = geometries.filter((geometry: any) => {
			const { properties: p } = geometry;
			let regionCd = p[outlineScale] + "";

			return regionCd === regionCode + "";
		});
	}

	// 'sgg' 값을 기준으로 그룹화
	const groupedByBorderScale = filteredGeometries.reduce((acc: any, geometry: any) => {
		//kt로부터 받은 데이터는 sggcd가 sido를 포함하지 않은 3자리 이므로
		const { properties: p } = geometry;
		let regionCd = p[borderScale] + "";
		if (!acc[regionCd]) {
			acc[regionCd] = [];
		}
		acc[regionCd].push(geometry);
		return acc;
	}, {});

	// 병합된 지오메트리를 저장할 배열
	const mergedGeometries: any = [];

	Object.keys(groupedByBorderScale).forEach((regionCd, idx) => {
		// 각 'sgg' 그룹에 대해 병합 실행
		const geometries = groupedByBorderScale[regionCd].map((g: any) => g);
		const merged = merge(topoJson, geometries);
		const center = d3.geoCentroid(merged);

		// 병합된 지오메트리를 배열에 추가
		mergedGeometries.push({
			type: "Feature",
			geometry: merged,
			properties: {
				// 필요한 속성 설정
				regionCode: Number(regionCd),
				center,
			},
		});
	});

	// GeoJSON FeatureCollection 생성
	const geojson = {
		type: "FeatureCollection",
		features: mergedGeometries,
	} as FeatureCollection;

	return geojson;
}

export function topoToGeoSimple(topoJson: Topology): FeatureCollection<any> | undefined {
	// topoJson이 없을 경우 반환
	if (!topoJson) return;

	// TopoJSON을 GeoJSON으로 변환 (unknown으로 먼저 캐스팅 후 타입 확인)
	const geojson = feature(
		topoJson,
		topoJson.objects[Object.keys(topoJson.objects)[0]],
	) as unknown as FeatureCollection<any>;

	// 각 Feature에 center 계산 후 추가
	geojson.features = geojson.features.map((f) => {
		const center = d3.geoCentroid(f);
		return {
			...f,
			properties: {
				...f.properties,
				center, // 중심 좌표 추가
			},
		};
	});

	return geojson;
}

// 좌표 간소화 함수
function simplifyCoordinates(coordinates: any[], tolerance: number = 0.0001): any[] {
	// coordinates가 2차원 배열 (Polygon의 Ring)인 경우
	if (typeof coordinates[0][0] === "number") {
		return simplify(
			coordinates.map(([x, y]: [number, number]) => ({ x, y })),
			tolerance,
		).map((point) => [point.x, point.y]);
	}

	// coordinates가 3차원 배열 (MultiPolygon)인 경우
	return coordinates.map((ring) => simplifyCoordinates(ring, tolerance));
}

export function topoJsonToGeoJson(
	topoJson: Topology,
	scale: string = "sgg",
	regionCode?: number,
): FeatureCollection | undefined {
	if (!topoJson) return;

	// TopoJSON을 GeoJSON으로 변환
	const geojson = feature(
		topoJson,
		topoJson.objects[Object.keys(topoJson.objects)[0]],
	) as unknown as FeatureCollection;

	// 각 Feature를 필터링하여 REGION_CD가 5자리인 경우만 변환 및 좌표 간소화
	const outlineScale = scale === "sgg" ? 5 : scale === "adm" ? 8 : 2;
	geojson.features = geojson.features
		.filter((f: any) => {
			const regionCd = f.properties?.REGION_CD?.toString();
			if (regionCode) {
				const targetCode = regionCode.toString();
				if ((groupedSgg as Record<number, any>)[regionCode]) {
					return (
						regionCd === targetCode ||
						(groupedSgg as Record<number, any>)[regionCode].codes.includes(Number(regionCd))
					);
				}
				// if ((livingRegions as Record<number, any>)[regionCode]) {
				// 	return (
				// 		regionCd === targetCode ||
				// 		(livingRegions as Record<number, any>)[regionCode].codes === Number(regionCd)
				// 	);
				// }
			}
			return (
				regionCd &&
				regionCd.length === outlineScale &&
				(!regionCode || regionCd.startsWith(regionCode))
			);
		})
		.map((f) => {
			const geometry = f.geometry;

			// 좌표 간소화 적용 (폴리곤, 라인 스트링 등)
			if (geometry.type === "Polygon") {
				geometry.coordinates = geometry.coordinates.map((ring) => simplifyCoordinates(ring));
			} else if (geometry.type === "MultiPolygon") {
				geometry.coordinates = geometry.coordinates.map((polygon) =>
					polygon.map((ring) => simplifyCoordinates(ring)),
				);
			}

			// 중심 좌표 계산 후 추가
			const center = d3.geoCentroid(f);
			return {
				...f,
				geometry,
				properties: {
					...f.properties,
					center,
				},
			};
		});

	return geojson;
}
