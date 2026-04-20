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

import * as d3 from "d3-geo";
import { Feature, FeatureCollection } from "geojson";
import { feature } from "topojson-client";

export function getGeometryInfo(feature: Feature) {
  // 지오메트리가 다각형인지 확인
  const geometry = feature.geometry as any;
  if (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon") {
    throw new Error("입력 지오메트리는 다각형이어야 합니다.");
  }

  // d3-geo를 사용하여 바운딩 박스 계산
  const bbox = d3.geoBounds(geometry);
  const [minX, minY] = bbox[0];
  const [maxX, maxY] = bbox[1];

  // d3-geo를 사용하여 중심점 계산
  const center = d3.geoCentroid(geometry);

  // 너비와 높이 계산
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    center: center,
    width: width,
    height: height,
  };
}

export function getZoomLevel(
  longitudeDelta: number,
  latitudeDelta: number,
  mapWidth: number,
  mapHeight: number
) {
  const WORLD_DPI = 340;
  const WORLD_COORDINATES_LONGITUDE = 360;
  const WORLD_COORDINATES_LATITUDE = 180;
  const ZOOM_MAX = 21;

  // 경도 기반 줌 레벨 계산
  const zoomLongitude =
    Math.log2(
      (mapWidth * WORLD_COORDINATES_LONGITUDE) / (WORLD_DPI * longitudeDelta)
    ) * 0.935;

  // 위도 기반 줌 레벨 계산
  const zoomLatitude =
    Math.log2(
      (mapHeight * WORLD_COORDINATES_LATITUDE) / (WORLD_DPI * latitudeDelta)
    ) * 0.995;

  // 두 계산 값 중 더 작은 값 반환
  const zoom = Math.min(zoomLongitude, zoomLatitude, ZOOM_MAX);
  return zoom;
}

export function createRegionInfo(topojson: any) {
  //@ts-ignore
  const geoJson: FeatureCollection = feature(
    topojson,
    topojson.objects[Object.keys(topojson.objects)[0]]
  ); // TopoJSON을 GeoJSON으로 변환
  const regions = geoJson.features;
  const regionInfo: any = {};

  regions.forEach((region: any) => {
    const { HEMD_CD, SGG_CD, SIDO_CD, HEMD_NM, SIDO_NM, SGG_NM } =
      region.properties;
    const center = d3.geoCentroid(region); // D3를 사용하여 각 지역의 중심 좌표 계산
    const regionName = (HEMD_NM || SGG_NM || SIDO_NM).split(" ");
    const name =
      regionName[regionName.length - 1].length > 2
        ? regionName[regionName.length - 1].slice(0, -1)
        : regionName[regionName.length - 1];

    regionInfo[HEMD_CD || SGG_CD || SIDO_CD] = {
      name,
      sidoCode: String(SIDO_CD),
      sggCode: String(SGG_CD),
      admCode: String(HEMD_CD),
      sidoName: SIDO_NM,
      sggName: SGG_NM,
      admName: HEMD_NM,
      center: center,
    };
  });

  return regionInfo;
}
