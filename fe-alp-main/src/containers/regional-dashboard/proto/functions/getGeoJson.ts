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

import { GeometryCollection, Topology } from "topojson-specification";
import { Feature, FeatureCollection, Polygon } from "geojson";
import { feature, merge } from "topojson-client";
import * as d3 from "d3";

type GetGeoJsonSidoSgg = {
  topoJson: Topology; // 입력으로 받을 TopoJSON 객체
  sidoCode?: number; // 선택적으로 입력받는 sidoCode, 없을 경우 모든 지오메트리를 반환
};

/**
 * getGeoJsonSidoSgg 함수
 *
 * 이 함수는 TopoJSON 객체와 선택적인 시도 코드(sidoCode)를 입력받아
 * 해당하는 시도의 시군구 지오메트리 데이터를 필터링하고, 이를 시군구 단위로 병합한 후
 * GeoJSON 형태로 변환하여 반환합니다.
 *
 * @param {Topology} topoJson - 변환할 TopoJSON 객체
 * @param {number} [sidoCode] - 선택적인 시도 코드, 제공되지 않으면 모든 지오메트리를 포함
 * @returns {FeatureCollection} - 병합된 시군구 단위의 GeoJSON FeatureCollection 객체
 *
 * 사용 예:
 * const geoJsonData = getGeoJsonSidoSgg({ topoJson, sidoCode: 41 });
 * console.log(geoJsonData);
 */
export function getGeoJsonSidoSgg({
  topoJson,
  sidoCode,
}: GetGeoJsonSidoSgg): FeatureCollection {
  // TopoJSON에서 첫 번째 객체를 가져옴
  const geometryCollection = topoJson.objects[
    Object.keys(topoJson.objects)[0]
  ] as GeometryCollection;

  // 모든 지오메트리를 가져옴
  const geometries = geometryCollection.geometries;

  // sidoCode에 따라 지오메트리를 필터링함
  let filteredGeometries;
  if (!sidoCode) {
    // sidoCode가 없으면 모든 지오메트리를 사용
    filteredGeometries = geometries;
  } else {
    // sidoCode가 있으면 해당 코드와 일치하는 지오메트리만 필터링
    filteredGeometries = geometries.filter((geometry: any) => {
      const { properties: p } = geometry;
      let regionCd = p.SIDO_CD + ""; // SIDO_CD를 문자열로 변환하여 비교
      return regionCd === sidoCode + ""; // sidoCode와 일치하는 지오메트리만 반환
    });
  }

  // 'sggCode' 값을 기준으로 지오메트리를 그룹화
  const groupedByBorderScale = filteredGeometries.reduce(
    (acc: any, geometry: any) => {
      const { properties: p } = geometry;
      let regionCd = p.SGG_CD + ""; // SGG_CD를 문자열로 변환하여 그룹화
      if (!acc[regionCd]) {
        acc[regionCd] = [];
      }
      acc[regionCd].push(geometry);
      return acc;
    },
    {}
  );

  // 병합된 지오메트리를 저장할 배열
  const mergedGeometries: any = [];

  // 그룹화된 각 'sggCode'에 대해 지오메트리를 병합
  Object.keys(groupedByBorderScale).forEach((regionCd) => {
    const geometries = groupedByBorderScale[regionCd].map((g: any) => g);
    const merged = merge(topoJson, geometries); // 병합 실행
    const center = d3.geoCentroid(merged); // 병합된 지오메트리의 중심 계산
    const { SIDO_NM, SGG_NM, SGG_CD, SIDO_CD } = geometries[0].properties; // 병합된 지오메트리의 속성 가져오기

    // 병합된 지오메트리를 배열에 추가
    mergedGeometries.push({
      type: "Feature",
      geometry: merged,
      properties: {
        sidoCode: SIDO_CD, // 시도 코드
        sggCode: +regionCd, // 시군구 코드, 숫자로 변환하여 저장
        sidoName: SIDO_NM, // 시도 이름
        sggName: SGG_NM, // 시군구 이름
        center, // 병합된 지오메트리의 중심
      },
    });
  });

  // 최종적으로 변환된 GeoJSON FeatureCollection 반환
  const geojson = {
    type: "FeatureCollection", // GeoJSON FeatureCollection 타입 지정
    features: mergedGeometries, // 변환된 Feature 객체들을 포함
  } as FeatureCollection;

  return geojson; // 최종 GeoJSON 반환
}

type GetGeoJsonSggAdm = {
  topoJson: Topology; // 입력으로 받을 TopoJSON 객체
  sggCode?: number; // 선택적으로 입력받는 sggCode, 없을 경우 모든 지오메트리를 반환
};

/**
 * getGeoJsonSggAdm 함수
 *
 * 이 함수는 TopoJSON 객체와 선택적인 시군구 코드(sggCode)를 입력받아
 * 해당하는 시군구의 지오메트리 데이터를 필터링하고, 이를 GeoJSON 형태로 변환하여 반환합니다.
 *
 * @param {Topology} topoJson - 변환할 TopoJSON 객체
 * @param {number} [sggCode] - 선택적인 시군구 코드, 제공되지 않으면 모든 지오메트리를 포함
 * @returns {FeatureCollection} - 필터링된 GeoJSON FeatureCollection 객체
 *
 * 사용 예:
 * const geoJsonData = getGeoJsonSggAdm({ topoJson, sggCode: 41117 });
 * console.log(geoJsonData);
 */
export function getGeoJsonSggAdm({
  topoJson,
  sggCode,
}: GetGeoJsonSggAdm): FeatureCollection {
  // TopoJSON에서 첫 번째 객체를 가져옴
  const geometryCollection = topoJson.objects[
    Object.keys(topoJson.objects)[0]
  ] as GeometryCollection;

  // 모든 지오메트리를 가져옴
  const geometries = geometryCollection.geometries;

  // sggCode에 따라 지오메트리를 필터링함
  let filteredGeometries;
  if (!sggCode) {
    // sggCode가 없으면 모든 지오메트리를 사용
    filteredGeometries = geometries;
  } else {
    // sggCode가 있으면 해당 코드와 일치하는 지오메트리만 필터링
    filteredGeometries = geometries.filter((geometry: any) => {
      const { properties: p } = geometry;
      let regionCd = p.SGG_CD + ""; // SGG_CD를 문자열로 변환하여 비교
      return regionCd === sggCode + ""; // sggCode와 일치하는 지오메트리만 반환
    });
  }

  // 필터링된 지오메트리를 GeoJSON으로 변환
  const geoJsonFeatures: Feature[] = filteredGeometries.map((geometry: any) => {
    const geoJsonFeature = feature(topoJson, geometry) as Feature;

    // properties를 새로운 형태로 변환
    const { HEMD_CD, SGG_CD, SIDO_CD, HEMD_NM, SIDO_NM, SGG_NM }: any =
      geoJsonFeature.properties;

    // 필요 없는 속성(RI_CD)을 제거하고, 새로운 키 이름으로 변경
    geoJsonFeature.properties = {
      admCode: HEMD_CD, // 행정동 코드
      sggCode: Number(SGG_CD), // SGG_CD를 숫자로 변환하여 sggCode로 저장
      sidoCode: SIDO_CD, // 시도 코드
      admName: HEMD_NM, // 행정동 이름
      sidoName: SIDO_NM, // 시도 이름
      sggName: SGG_NM, // 시군구 이름
    };

    return geoJsonFeature; // 변환된 Feature 객체 반환
  });

  // 변환된 GeoJSON FeatureCollection 반환
  const geoJsonFeatureCollection: FeatureCollection = {
    type: "FeatureCollection", // GeoJSON FeatureCollection 타입 지정
    features: geoJsonFeatures, // 변환된 Feature 객체들을 포함
  };

  return geoJsonFeatureCollection; // 최종 GeoJSON 반환
}

type GetGeoJsonSgg = {
  topoJson: Topology; // 입력으로 받을 TopoJSON 객체
  sggCode: number; // 필터링할 시군구 코드
};

/**
 * getGeoJsonBySggCode 함수
 *
 * 이 함수는 TopoJSON 객체와 특정 시군구 코드(sggCode)를 입력받아
 * 해당하는 시군구의 지오메트리 데이터를 필터링하고, 이를 GeoJSON 형태로 변환하여 반환합니다.
 *
 * @param {Topology} topoJson - 변환할 TopoJSON 객체
 * @param {number} sggCode - 필터링할 시군구 코드
 * @returns {FeatureCollection} - 필터링된 단일 GeoJSON FeatureCollection 객체
 *
 * 사용 예:
 * const geoJsonData = getGeoJsonBySggCode({ topoJson, sggCode: 41117 });
 * console.log(geoJsonData);
 */
/**
 * getGeoJsonBySggCode 함수
 *
 * 이 함수는 TopoJSON 객체와 특정 시군구 코드(sggCode)를 입력받아
 * 해당하는 시군구의 모든 지오메트리 데이터를 필터링하고, 이를 병합하여
 * GeoJSON 형태로 변환하여 반환합니다.
 *
 * @param {Topology} topoJson - 변환할 TopoJSON 객체
 * @param {number} sggCode - 필터링할 시군구 코드
 * @returns {FeatureCollection} - 병합된 단일 GeoJSON Feature 객체
 *
 * 사용 예:
 * const feature = getGeoJsonBySggCode({ topoJson, sggCode: 41117 });
 * new GeoJsonLayer({
      id: "geoJson-layer",
      data: feature,
      ...
 */
export function getGeoJsonSgg({ topoJson, sggCode }: GetGeoJsonSgg): Feature {
  // TopoJSON에서 첫 번째 객체를 가져옴
  const geometryCollection = topoJson.objects[
    Object.keys(topoJson.objects)[0]
  ] as GeometryCollection;

  // 모든 지오메트리를 가져옴
  const geometries = geometryCollection.geometries;

  // sggCode에 따라 지오메트리를 필터링함
  let filteredGeometries: any = geometries.filter((geometry: any) => {
    const { properties: p } = geometry;
    let regionCd = p.SGG_CD + ""; // SGG_CD를 문자열로 변환하여 비교
    return regionCd === sggCode + ""; // sggCode와 일치하는 지오메트리만 반환
  });
  let isMergedSgg = false;
  if (!filteredGeometries.length) {
    filteredGeometries = geometries.filter((geometry: any) => {
      const { properties: p } = geometry;
      const regionCd = String(p.SGG_CD); // SGG_CD를 문자열로 변환
      const sggCodePrefix = String(sggCode).slice(0, 4); // sggCode의 처음 4자리 가져오기
      return regionCd.startsWith(sggCodePrefix); // regionCd가 sggCodePrefix로 시작하는지 확인
    });
    isMergedSgg = true;
  }

  // 병합된 지오메트리를 생성
  const mergedGeometry = merge(topoJson, filteredGeometries);

  // 병합된 지오메트리의 중심 계산
  const center = d3.geoCentroid(mergedGeometry);

  // 첫 번째 지오메트리의 속성 가져오기
  const { SIDO_NM, SGG_NM, SGG_CD, SIDO_CD } = filteredGeometries[0].properties;

  // 병합된 지오메트리의 속성을 설정
  const mergedGeoJsonFeature: Feature = {
    type: "Feature",
    geometry: mergedGeometry,
    properties: {
      sidoCode: SIDO_CD, // 시도 코드
      sggCode: isMergedSgg ? Math.floor(+SGG_CD / 10) * 10 : +SGG_CD, // 시군구 코드, 숫자로 변환하여 저장
      sidoName: SIDO_NM, // 시도 이름
      sggName: SGG_NM, // 시군구 이름
      center, // 병합된 지오메트리의 중심
    },
  };

  return mergedGeoJsonFeature;
}

type GetGeoJsonSggs = {
  topoJson: Topology;
  sggCodes: Array<number>;
};
export function getGeoJsonSggs({
  topoJson,
  sggCodes,
}: GetGeoJsonSggs): FeatureCollection {
  const features: Feature[] = sggCodes.map((sggCode) => {
    return getGeoJsonSgg({ topoJson, sggCode });
  });
  return {
    type: "FeatureCollection",
    features,
  };
}
