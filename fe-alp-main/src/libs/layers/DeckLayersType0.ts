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

import {
	GeoJsonLayer,
	ScatterplotLayer,
	TextLayer,
	BitmapLayer,
	PolygonLayer,
	GridCellLayer,
} from "@deck.gl/layers";
import {TileLayer} from "@deck.gl/geo-layers";

import { Feature, FeatureCollection } from "geojson";

import { DataFilterExtension } from "@deck.gl/extensions";
import * as d3 from "d3";
import proj4 from "proj4";
import { ageGroupColor, lifestylePatternColor } from "@/constants/gis";
import { interpolate, interpolateMinMax, parseRGB } from "./LayerFnts";
import { makeBorderLayer, makeOutlineInRegion, makeOutlineLayer } from "./DeckLayersType1";
import { getRankedColor } from "./getRankedColor";

const popuContourParams = {
	UNIT: 250,
	// UNIT: 1000,
	SMALL_AREA_FILTER_CRITERIA: 300000,
	POPU_SPREAD_DECAY_RADIUS: 500,
	aggrMethod: "JUST_SUM" as any,
};

export function makeDefaultBackgroundMapLayer(isDarkMode: boolean, mapSettings: MapSettings): {}[] {
	const { isdarkMode: userOption } = mapSettings;
	const id = isDarkMode ? "bgMapDark" : "bgMapLight";
	const initialLayers = [
		new TileLayer({
			id,
			//data:   "./test1.png",
			tileSize: 256,
			// 타일맵 요청 범위 제한
			extent: [121, 32, 132, 41],
			maxZoom: 18,
			minZoom: 7,

			// 먼저 getTileLayer가 작동하고
			// 그 후에 renderSubLayer가 작동함
			getTileData: ({ index, signal, bbox }: any): Promise<ImageBitmap | null> | null => {
				if (signal && signal.aborted) {
					// console.log("signal.aborted:", signal);
					return null;
				}

				const ktmapExtent = {
					minx: 171162,
					miny: 1214781,
					maxx: 1744026,
					maxy: 2787645,
				};

				// EPSG:4326과 EPSG:5179의 정의
				const epsg4326 = "EPSG:4326";
				const epsg5179 =
					"+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

				const adjustedZ = index.z - 6; // 서버가 일반적인 줌 레벨보다 6만큼 작게 처리

				//일단, 현재 타일의 위경도 중심점을 찾는다.
				const tileCenter4326 = proj4(epsg4326, epsg5179, [
					(bbox.west + bbox.east) / 2,
					(bbox.south + bbox.north) / 2,
				]);
				const diff = {
					x: tileCenter4326[0] - ktmapExtent.minx,
					y: ktmapExtent.maxy - tileCenter4326[1],
				};

				const tileSize = 256; //px
				const res = 2048 / Math.pow(2, adjustedZ);
				const tile_x_index = Math.floor(diff.x / (res * tileSize));
				const tile_y_index = Math.floor(diff.y / (res * tileSize));

				const newUrlLightMode = `https://tile.gis.kt.com/current/base.default/${adjustedZ}/${tile_y_index}/${tile_x_index}.png`;
				const newUrlDarkMode = `https://tile.gis.kt.com/current/base.satellite/${adjustedZ}/${tile_y_index}/${tile_x_index}.jpg`;
				const newUrl = isDarkMode ? newUrlDarkMode : newUrlLightMode;

				// 타일 데이터를 반환하기 위한 fetch 호출
				return fetch(newUrl)
					.then((response) => response.blob())
					.then((blob) => createImageBitmap(blob));
			},

			renderSubLayers: (props: any) => {
				const { west, south, east, north } = props.tile.bbox;

				const epsg4326 = "EPSG:4326";
				const epsg5179 =
					"+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

				//kt map 한계범위(epsg5179 좌표계)
				const ktmapExtent = {
					minx: 171162,
					miny: 1214781,
					maxx: 1744026,
					maxy: 2787645,
				};

				const adjustedZ = props.tile.zoom - 6; //ktmap은 표준과 6 차이남

				//현재 처리하는 타일의 기준 좌표는 epsg4326 기준.
				//처리하는 타일의 사각형 네 꼭지점  [x0,y0], [x1,y1],[x2,y2],[x3,y3] 을 구한다.
				//구하는 사각형은 우선 epsg5179 기준으로 구하고(tile5179) - epsg5179에서 정사각형임
				//좌표계 변환하여 epsg4326의 네 꼭지점( [x0,y0], [x1,y1],[x2,y2],[x3,y3])으로 변환한다. - epsg4326에서 부정형의 사각형이 됨
				//그 부정형의 사각형에 epsg5179의 정사각형 타일맵을 텍스쳐로 입힘
				//텍스쳐 변환은 gpu에서 이루어짐
				const tileCenter4326 = proj4(epsg4326, epsg5179, [(west + east) / 2, (south + north) / 2]);
				const diff = {
					x: tileCenter4326[0] - ktmapExtent.minx,
					y: ktmapExtent.maxy - tileCenter4326[1],
				};

				const tileSize = 256; //px
				const res = 2048 / Math.pow(2, adjustedZ);
				const tile5179_xmin =
					Math.floor(diff.x / (res * tileSize)) * (res * tileSize) + ktmapExtent.minx;
				const tile5179_ymax =
					ktmapExtent.maxy - Math.floor(diff.y / (res * tileSize)) * (res * tileSize);

				const tile5179 = {
					xmin: tile5179_xmin,
					xmax: tile5179_xmin + res * tileSize,
					ymin: tile5179_ymax - res * tileSize,
					ymax: tile5179_ymax,
				};

				const [x0, y0] = proj4(epsg5179, epsg4326, [tile5179.xmin, tile5179.ymin]);
				const [x1, y1] = proj4(epsg5179, epsg4326, [tile5179.xmin, tile5179.ymax]);
				const [x2, y2] = proj4(epsg5179, epsg4326, [tile5179.xmax, tile5179.ymax]);
				const [x3, y3] = proj4(epsg5179, epsg4326, [tile5179.xmax, tile5179.ymin]);

				return new BitmapLayer(props, {
					data: undefined,
					image: props.data,
					bounds: [
						[x0, y0],
						[x1, y1],
						[x2, y2],
						[x3, y3],
					],
					desaturate: isDarkMode ? 0.7 : 0.5,
					// desaturate: 0.6,
					//transparentColor: [255, 0, 0, 255],
				});
			},
			//extent: [117, 28, 133, 44],
			// tintColor: [150, 150, 150, 5], // 중간 회색으로 살짝 어둡게
			refinementStrategy: "no-overlap",
			onTileError: (error, tile) => {},
			onHover: ({}) => {
				//console.log(`Longitude: ${lngLat[0]}, Latitude: ${lngLat[1]}`);
			},
			parameters: {
				depthTest: false,
			},

			//tintColor: [200, 180, 180],
			visible: isDarkMode === userOption,
			updateTriggers: {
				visible: [userOption],
			},
		}),
	];

	return initialLayers;
}

// /**
//  * admArr 배열에서 count가 가장 큰 첫 번째 객체의 count를 0으로 설정하는 함수
//  * @param {Array} admArr - 처리할 데이터 배열
//  */
// function resetFirstMaxCount(admArr: any[]) {
// 	if (!Array.isArray(admArr) || admArr.length === 0) {
// 		console.warn("admArr이 비어 있거나 배열이 아닙니다.");
// 		return;
// 	}

// 	// 최대 count 값 찾기
// 	const maxCount = Math.max(...admArr.map((item) => item.count));

// 	// 첫 번째로 최대 count 값을 가진 객체 찾기
// 	const maxIndex = admArr.findIndex((item) => item.count === maxCount);

// 	if (maxIndex !== -1) {
// 		// console.log(`최대 count 값을 가진 객체 (${admArr[maxIndex].name})의 count를 0으로 설정합니다.`);
// 		admArr[maxIndex].count = 0;
// 	} else {
// 		// console.warn("최대 count 값을 가진 객체를 찾을 수 없습니다.");
// 	}
// }

type MakeScatterLayer = {
	data: any;
	geoJson: FeatureCollection;
	selectAllOutLine?: boolean;
	regionScale?: string;
	setTooltipInfo: any;
	mapIdx: number;
	layerType?: string;
	isTextLayerShow: boolean
};
export function makeScatterLayer({ // 버블차트
	data,
	geoJson,
	selectAllOutLine,
	regionScale,
	setTooltipInfo,
	mapIdx,
	layerType,
	isTextLayerShow
}: MakeScatterLayer): {}[] {
	const admArr: any = Object.values(data);
	if (admArr.length === 0) return [];
	// 기준점의 count는 항상 최대값이라 간주하고 0으로 세팅하는 함수
	// resetFirstMaxCount(admArr);
	// 외곽선 그릴 지역을 구분하기 위한 데이터 있는 지역코드의 배열
	const targetRegions = admArr.map((el: any) => el.regionCode);
	// const minValue = Math.min(...admArr.map((el: any) => el.count));
	const maxValue = Math.max(...admArr.map((el: any) => el.count));
	const counts = Object.values(admArr).map((el: any) => el.count);
	const firstRegionCode = +admArr[0]?.regionCode;
	const scale =
		regionScale === "sido"
			? 50000
			: firstRegionCode > 100000
				? 500
				: firstRegionCode > 100
					? 3000
					: 50000;
	// const scale = !regionScale ? 3000 : regionScale === "sido" ? 50000 : 1000;
	const scatterObj = new ScatterplotLayer({
		id: "scatter-layer" + mapIdx,
		data: admArr,
		pickable: true,
		// opacity: 0.5,
		stroked: false,
		filled: true,
		// radiusUnits: "meters", // 지도 상의 실제 거리 기준으로 반경 설정
		// radiusScale: 1, // 반경 조정을 위한 스케일 (필요에 따라 조정)
		// radiusMinPixels: 30, // 최소 반경 크기 (줌아웃 시 최소값 설정)
		// radiusMaxPixels: 200, // 줌인 시 최대 크기 제한 없음
		lineWidthMinPixels: 1,
		getPosition: (d: any) => d.center,
		getRadius: (d: any) => {
			// return scale * (arrLength - d.index);
			return Math.max((d.count / maxValue) * scale, scale / 4); // 반경을 실제 거리 단위로 설정
			return 0;
			return d.countRate * scale;
		},
		onHover: ({ index, object, x, y }) => {
			if (!object) {
				setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
				return;
			}
			setTooltipInfo((prev: GisTooltipInfo) => ({
				mapType: "polygon",
				mapIdx,
				id: index,
				x,
				y,
				isActive: true,
				count: object.count,
				data: object,
			}));
		},

		getFillColor: (d: any) => {
			if (d.count === 0) return [0, 0, 0, 0];
			return getRankedColor(d.count, counts, layerType === "depopul");
		},
		opacity: 0.5,
		getLineColor: [0, 0, 0],
	});

	let textData = admArr.map((obj: any) => ({
		text:
			isTextLayerShow && obj.count && layerType !== "depopul"
				? `${obj.regionName.split(" ").at(-1)}\n${Math.ceil(Math.abs(obj.count)).toLocaleString()} 명`
				: `${obj.regionName.split(" ").at(-1)}`,
		...obj,
	}));

	const textSize =
		layerType === "depopul"
			? 2000
			: regionScale === "sido"
				? 100
				: firstRegionCode > 100000
					? 50
					: firstRegionCode > 100
						? 60
						: 100;
	// const textSize =
	// layerType === "depopul"
	// 	? 2000
	// 	: firstRegionCode > 100000
	// 		? 150
	// 		: firstRegionCode > 100
	// 			? 50
	// 			: 2000;
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
		getSize: textSize,
		getAngle: 0,
		fontFamily: "pretendard",
		// sizeMaxPixels: 15,
		sizeMinPixels: 16,
		// sizeScale: 1,
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
	if (geoJson) {
		const geoObj = makeOutlineInRegion({
			geoJson,
			targetRegions,
			mapIdx,
		});

		return [geoObj, scatterObj, textObj];
	}

	return [scatterObj, textObj];
}

export function makeAggregatedLayer(layerMat: any, isGrid: boolean): {}[] {
	const { originalId, convertedData4326, aggr4326, valueMin, valueMax, gridScale } =
		layerMat as any;

	// const { isGrid } = mapSettings;

	const original = new ScatterplotLayer({
		id: originalId + "-original",
		data: convertedData4326,
		pickable: true,
		opacity: 0.8,
		stroked: false,
		filled: true,
		radiusUnits: "pixels",
		radiusScale: 2,
		radiusMinPixels: 1,
		radiusMaxPixels: 100,
		lineWidthMinPixels: 1,
		getPosition: (d: any) => [d.x, d.y],
		getRadius: (d: any) => 2,
		// getRadius: (d: any) => 8,
		getFillColor: [0, 0, 0],
		getLineColor: [0, 0, 0],
		visible: isGrid,
	});
	const gridObj = new ScatterplotLayer({
		id: originalId + "-grid",
		data: aggr4326,
		pickable: true,
		opacity: 0.8,
		stroked: false,
		filled: true,
		radiusUnits: "meters",
		radiusScale: 1,
		radiusMinPixels: 1,
		radiusMaxPixels: 100,
		lineWidthMinPixels: 1,
		getPosition: (d: any) => [d.x, d.y],
		// getRadius: (d: any) => popuContourParams.UNIT / 2,
		getRadius: (d: any) => ((popuContourParams.UNIT / 2) * gridScale) / 0.25,
		getFillColor: (d: any) => {
			const mapColor = d3.scaleSequential(d3.interpolateViridis).domain([valueMax, valueMin]);
			let color0 = d3.color(mapColor(d.value)) as d3.RGBColor;
			return [color0.r, color0.g, color0.b, 200];
		},
		getLineColor: [0, 0, 0],
		visible: isGrid,
	});

	const textObj = new TextLayer({
		id: originalId + "-text",
		data: aggr4326,
		/* props from TextLayer class */

		// background: false,
		// backgroundPadding: [0, 0, 0, 0],
		// billboard: true,
		// characterSet: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~",
		fontFamily: "Malgun Gothic",
		// fontSettings: {},
		// fontWeight: 'normal',
		getAlignmentBaseline: "center",
		getAngle: 0,
		// getBackgroundColor: [255, 255, 255, 255],
		// getBorderColor: [0, 0, 0, 255],
		// getBorderWidth: 0,
		// getColor: [0, 0, 0, 255],
		// getPixelOffset: [0, 0],
		//getFilterValue: d => [d.visitemd, d.freq],
		//filterRange: [[visitAdmNow, visitEmdNow],[freqNow, freqNow]],
		getPosition: (d: any) => [d.x, d.y],
		getSize: (d: any) => {
			// return popuContourParams.UNIT * 0.4;
			return (popuContourParams.UNIT * 0.4 * gridScale) / 0.25;
		},
		getText: (d: any) => "" + Math.round(d.value),
		getTextAnchor: "middle",
		// lineHeight: 1,
		// maxWidth: -1,
		// outlineColor: [0, 0, 0, 255],
		// outlineWidth: 0,
		sizeMaxPixels: 100,
		sizeMinPixels: 16,
		sizeScale: 1,
		sizeUnits: "meters",
		// wordBreak: 'break-word',

		/* props inherited from Layer class */

		// autoHighlight: false,
		// coordinateOrigin: [0, 0, 0],
		// coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
		// highlightColor: [0, 0, 128, 128],
		// modelMatrix: null,
		// opacity: 1,
		//pickable: true,
		updateTriggers: {
			// This tells deck.gl to recalculate radius when `currentYear` changes
			//getSize: [optGlb.widthFactor],
		},
		extensions: [new DataFilterExtension({ filterSize: 1 })],
		getFilterValue: (d: any) => [d.value],
		filterRange: [[0, 130000]],
		// visible: true,
		// wrapLongitude: false,
		visible: isGrid,
	});
	return [original, gridObj, textObj];
	// return [gridCellObj, textObj];
}
//

type MakeAdmPolygons = {
	geoJson?: FeatureCollection;
	admData: any;
	isGrid: boolean;
	visualizeOption: number;
	mapIdx: number;
	setTooltipInfo: (fn:(prev:GisTooltipInfo)=>GisTooltipInfo) => void;
	features?: FeatureCollection;
	layerType?: string;
	isTextLayerShow: boolean
};
export function makeAdmPolygons({
	geoJson,
	admData,
	isGrid,
	visualizeOption,
	mapIdx,
	features,
	setTooltipInfo,
	layerType,
	isTextLayerShow
}: MakeAdmPolygons) {
	if (!geoJson) {
		// console.log("no geoJson");
		return;
	}

	// const { isGrid } = mapSettings;
	const firstRegionCode = +geoJson.features[0].properties?.REGION_CD;
	// const scale = firstRegionCode < 100 ? 200 : firstRegionCode < 100000 ? 20 : 2;
	const targetRegions = Object.keys(admData);
	const counts = Object.values(admData).map((el: any) => el.count);

	const geoObj = new GeoJsonLayer({
		id: "geoJson-layer",
		data: features || geoJson.features,
		pickable: true,
		stroked: true,
		// lineWidthScale: 10,
		lineWidthMaxPixels: 2,
		opacity: 0.5,
		getLineWidth: 200,
		// getLineColor: [255, 255, 255, 100],
		getLineColor: (d: Feature) => {
			const regionCode = +d.properties?.REGION_CD;
			if (!admData[regionCode]) return [0, 0, 0, 0];
			const { count, isOri } = admData[regionCode];
			return [255, 255, 255, 200];

			return [...getRankedColor(count, counts), 50];
		},
		// getFillColor: [70, 170, 170, 0],
		getFillColor: (d: Feature) => {
			const regionCode = +d.properties?.REGION_CD;
			if (!admData[regionCode]) return [0, 0, 0, 0];
			const { count, isOri } = admData[regionCode];
			if (isOri) return [255, 255, 0, 100];

			return getRankedColor(count, counts, layerType === "depopul");
		},
		filled: true,
		onHover: ({ index, object, x, y }: any) => {
			if (!object) {
				setTooltipInfo((prev: GisTooltipInfo) => ({ ...prev, isActive: false }));
				return;
			}
			const {
				properties: { REGION_CD },
			} = object;
			const data = admData[REGION_CD];
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

		visible: !isGrid,
		updateTriggers: {
			// admData가 변경될 때마다 getFillColor와 getLineColor가 재계산되도록 설정
			getFillColor: admData,
			getLineColor: admData,
			data: admData, // 데이터 자체가 변경될 때 레이어를 업데이트
		},
	});

	const textData = Object.entries(admData).map(([regionCode, val]: any) => ({
		regionCode,
		...val,
		text: `${val.regionName.split(" ").at(-1)}${isTextLayerShow && val.count && layerType !== "depopul" ? `\n${Math.ceil(val.count).toLocaleString()} 명` : ""}`,
	}));
	const textSize =
		layerType === "depopul"
			? 2000
			: firstRegionCode > 100000
				? 150
				: firstRegionCode > 100
					? 300
					: 2000;

	const textObj = new TextLayer({
		id: "text-layer",
		data: textData,
		pickable: false,
		getColor: [255, 255, 255],
		billboard: false,
		fontWeight: 600,
		getPosition: (d: any) => d.center,
		getText: (d) => d.text,
		getSize: textSize,
		sizeScale: 1,
		getAngle: 0,
		fontFamily: "pretendard",
		// sizeMaxPixels: 40,
		sizeMinPixels: 16,
		sizeUnits: "meters",
		getTextAnchor: "middle",
		getAlignmentBaseline: "center",
		characterSet: "auto",
		outlineWidth: 4,
		fontSettings: { sdf: true },
		// transitions: {
		// 	getColor: {
		// 		duration: 1000, // 색상 변화에 대한 지속 시간(밀리초)
		// 	},
		// },
		visible: !isGrid && visualizeOption !== 3,
	});
	const polyChartData = Object.entries(admData).flatMap(([regionCode, val]: any) => {
		if (!val.chartData) return;
		const obj = Object.entries(val.chartData).map(([key, el]) => ({
			lat: key.startsWith("m") ? 0.001 : 0.002,
			lng: +key.slice(1) * 0.00015,
			val: el,
			center: val.center,
			regionCode,
			data: val.chartData,
			// currentTime: normalizedCurrentTime,
			xLabel: +key.slice(1) + "대",
		}));
		obj.push(
			{ lat: 0.0017, lng: 0, center: val.center, yLabel: "남성" } as any,
			{ lat: 0.0027, lng: 0, center: val.center, yLabel: "여성" } as any,
		);
		// console.log(obj);
		return obj;
	});

	const polyChartObj = new PolygonLayer({
		visible: visualizeOption !== 0,
		id: "polygon-layer",
		data: polyChartData,
		extruded: true,
		elevationScale: 0.1,
		getPolygon: (d: any) => {
			if (d?.center && d.lat && d.lng) {
				const biasLng = 0.006;
				const biasLat = 0.0016;
				const [lng, lat] = [d.center[0] + d.lng - biasLng, d.center[1] + d.lat + biasLat];
				const sizeLng = 0.0007; // 경도의 크기
				const sizeLat = 0.0004; // * (1 / Math.cos((lat * Math.PI) / 180)); // 위도의 크기 보정
				const rect = [
					[lng - sizeLng, lat - sizeLat],
					[lng + sizeLng, lat - sizeLat],
					[lng + sizeLng, lat + sizeLat],
					[lng - sizeLng, lat + sizeLat],
				];

				return rect;
			}
			return [
				[127.05129363690509, 37.27021103611863],
				[127.0516936369051, 37.27021103611863],
				[127.0516936369051, 37.270713683954476],
				[127.05129363690509, 37.270713683954476],
			];
		},
		getElevation: (d) => d && d.val,
		getFillColor: (d) => (d?.lat === 0.002 ? [216, 27, 96] : [48, 128, 255, 255]),
		pickable: true,
		// onClick: ({ object }) => {
		//   const { regionCode, currentTime } = object;
		//   const data = makeTooltipData(object.data);
		//   setTooltipData({
		//     regionCode,
		//     currentTime,
		//     data,
		//   });
		// },
		// updateTriggers: {
		//   getElevation: [normalizedCurrentTime], // Add this to trigger updates when normalizedCurrentTime changes
		// },
		transitions: {
			getElevation: {
				duration: 0,
			},
		},
	});
	return [geoObj, textObj, polyChartObj];
}

const latToMeters = 111320; // 위도 1도당 미터
const lonToMeters = 111320 * Math.cos(37 * (Math.PI / 180)); // 경도 1도당 미터

export function makeGridCellLayer({
	isGrid,
	currentGridData,
	gridScale,
	mapData,
	regionCode,
	setTooltipInfo,
	mapIdx,
	isGridScale50,
}: any): {}[] {
	if (!currentGridData) {
		// console.log("no gridData");
		return [];
	}

	// const { analyzeOption } = mapSettings;

	const valueMax = currentGridData.reduce((max: number, item: any) => {
		return item.count > max ? item.count : max;
	}, -Infinity);
	const valueMin = currentGridData.reduce((min: number, item: any) => {
		return item.count < min ? item.count : min;
	}, Infinity);

	if (!valueMax) return [];

	const gridCellObj = new GridCellLayer({
		id: "gridCell-" + mapIdx,
		data: currentGridData, // 초기 데이터 설정 (기본 스케일)

		// 기타 GridCellLayer 설정
		opacity: 0.3,
		pickable: true,
		// getPosition: (d: any) => [
		// 	d.coord[0] - (250 * gridScale) / (2 * lonToMeters) / 0.26,
		// 	d.coord[1] - (250 * gridScale) / (2 * latToMeters) / 0.26,
		// ],
		getPosition: (d: any) => [d.coord[0], d.coord[1]],
		cellSize: (250 * gridScale) / 0.26,
		extruded: false,
		filled: true,
		getFillColor: (d: any) => {
			if (d.count === 0) return [128, 128, 128, 100];
			if (d.analyzeOption === "analyzeGender") {
				const rgbString = interpolateMinMax(d.count, valueMin, valueMax);
				return [...parseRGB(rgbString)] as any;
			} else if (d.analyzeOption === "analyzeAgeGroup") {
				return ageGroupColor[d.maxValueKey as string] as any;
			} else if (d.analyzeOption === "analyzeLifestylePattern") {
				return lifestylePatternColor[d.maxValueKey as string] as any;
			}
			const rgbString = interpolate(Math.pow(d.count / valueMax, 1 / 2));
			return [...parseRGB(rgbString)] as any;
		},
		onHover: ({ index, object, x, y }: any) => {
			// console.log()
			setTooltipInfo((prev: GisTooltipInfo) =>
				index < 0
					? { ...prev, isActive: false }
					: prev.id !== index
						? {
								mapType: "grid",
								mapIdx,
								id: index,
								x,
								y,
								isActive: true,
								count: object.count,
								data: object,
							}
						: prev.isActive
							? prev
							: { ...prev, isActive: true },
			);
		},

		getLineColor: [0, 0, 0],
		visible: isGrid && !isGridScale50,
	});

	if (mapData?.admGeo || mapData?.sggGeo) {
		const { admGeo, sggGeo, sidoGeo } = mapData;
		const geoForBorder = regionCode > 100 ? admGeo : sggGeo;
		const geoForOutline = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;

		const features = geoForOutline.features.filter(
			(f: any) => +f.properties.REGION_CD === +regionCode,
		);
		const outline = makeOutlineLayer({ features, regionCode: regionCode.toString() });
		const border = makeBorderLayer({ geoJson: geoForBorder, regionCode });
		return [gridCellObj, outline, border];
	}
	return [gridCellObj];
}

export function makeGrid50CellLayer({
	gisSettings,
	currentGridData,
	mapData,
	setTooltipInfo,
	mapIdx,
}: any): {}[] {
	const valueMax = currentGridData.reduce((max: number, item: any) => {
		return item.count > max ? item.count : max;
	}, -Infinity);
	const valueMin = currentGridData.reduce((min: number, item: any) => {
		return item.count < min ? item.count : min;
	}, Infinity);

	const { regionCode } = gisSettings;
	if (!valueMax) return [];

	const gridCellObj = new GridCellLayer({
		id: "gridCell_50m",
		data: currentGridData, // 초기 데이터 설정 (기본 스케일)

		// 기타 GridCellLayer 설정
		opacity: 0.3,
		pickable: true,
		// getPosition: (d: any) => [
		// 	d.coord[0] - (250 * gridScale) / (2 * lonToMeters) / 0.26,
		// 	d.coord[1] - (250 * gridScale) / (2 * latToMeters) / 0.26,
		// ],
		getPosition: (d: any) => (d.coord ? [d.coord[0], d.coord[1]] : [d.center[0], d.center[1]]),
		cellSize: 48.08,
		extruded: false,
		filled: true,
		getFillColor: (d: any) => {
			if (d.count === 0) return [255, 255, 255, 150];
			if (d.analyzeOption === "analyzeGender") {
				const rgbString = interpolateMinMax(d.count, valueMin, valueMax);
				return [...parseRGB(rgbString)] as any;
			} else if (d.analyzeOption === "analyzeAgeGroup") {
				return ageGroupColor[d.maxValueKey as string] as any;
			} else if (d.analyzeOption === "analyzeLifestylePattern") {
				return lifestylePatternColor[d.maxValueKey as string] as any;
			}
			const rgbString = interpolate(Math.pow(d.count / valueMax, 1 / 2));
			return [...parseRGB(rgbString)] as any;
		},
		onHover: ({ index, object, x, y }: any) => {
			// console.log()
			setTooltipInfo((prev: GisTooltipInfo) =>
				index < 0
					? { ...prev, isActive: false }
					: prev.id !== index
						? {
								mapType: "grid",
								mapIdx,
								id: index,
								x,
								y,
								isActive: true,
								count: object.count,
								data: object,
							}
						: prev.isActive
							? prev
							: { ...prev, isActive: true },
			);
		},

		getLineColor: [0, 0, 0],
		// visible: isGrid,
	});

	if (!mapData) return [gridCellObj];
	// const { sidoGeo, sggGeo, admGeo } = mapData;
	// const geoJson = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;
	// if (geoJson) {
	// 	const features = geoJson.features.filter((f: any) => +f.properties.REGION_CD === +regionCode);
	// 	const geoObj = makeOutlineLayer({ features, regionCode: regionCode.toString() });
	// 	return [geoObj, gridCellObj];
	// }
	//격자 50 레이어에 안쪽 경계 추가
	if (mapData?.admGeo || mapData?.sggGeo) {
		const { admGeo, sggGeo, sidoGeo } = mapData;
		const geoForBorder = regionCode > 100 ? admGeo : sggGeo;
		const geoForOutline = regionCode > 100000 ? admGeo : regionCode > 100 ? sggGeo : sidoGeo;

		const features = geoForOutline.features.filter(
			(f: any) => +f.properties.REGION_CD === +regionCode,
		);
		const outline = makeOutlineLayer({ features, regionCode: regionCode.toString() });
		const border = makeBorderLayer({ geoJson: geoForBorder, regionCode });
		return [gridCellObj, outline, border];
	}
	return [gridCellObj];
}
