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

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator, MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import useGisData from "@/hooks/queries/useGisData";
import { topoToGeoSimple } from "@/libs/dev/topoJsonHandler";

interface DasMapContainerProps {
	regionInfo: Record<string, RegionInfo>;
	start: string;
	selectedSido: { sidoCode: string; sidoName: string };
	setSelectedSido: Dispatch<SetStateAction<{ sidoCode: string; sidoName: string }>>;
	data: DashboardResult | undefined;
	activeTabKey: DashboardMapTabKey;
}

interface ScatterData {
	sidoCode: string;
	sidoName: string;
	center: number[];
	value: Record<DashboardMapTabKey, number>;
}

const INITIAL_VIEW_STATE: MapViewState = {
	longitude: 127.7669,
	latitude: 35.9078,
	zoom: 5.5,
	pitch: 0,
	bearing: 0,
};

const colorPalette: [number, number, number, number][] = [
	[136, 173, 241, 255],
	[63, 123, 232, 255],
	[27, 98, 228, 255],
	[20, 74, 173, 255],
	[14, 51, 119, 255],
];

// 색상을 Multiply 모드로 계산하는 함수
const multiplyColors = (
	color1: [number, number, number, number],
	color2: [number, number, number, number],
): [number, number, number, number] => {
	// RGB 값 곱셈
	const r = (color1[0] / 255) * (color2[0] / 255) * 255;
	const g = (color1[1] / 255) * (color2[1] / 255) * 255;
	const b = (color1[2] / 255) * (color2[2] / 255) * 255;

	// 알파 값 계산 (Blending)
	const a = color1[3] + color2[3] - (color1[3] * color2[3]) / 255;

	// 색상과 투명도 제한
	return [Math.min(r, 255), Math.min(g, 255), Math.min(b, 255), Math.min(a, 255)];
};

export default function DashboardMap({
	regionInfo,
	start,
	selectedSido,
	setSelectedSido,
	data,
	activeTabKey,
}: DasMapContainerProps) {
	const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
	const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

	const { useGeometry } = useGisData();
	const { data: geoJson } = useGeometry(start, "sido");
	// const geoJson = useMemo(() => topoToGeoSimple(topoJson));

	const sidoInfo = useMemo(() => {
		return Object.entries(regionInfo).reduce(
			(acc, [key, val]) => {
				if (0 <= +key && +key <= 100) {
					acc[key] = {
						name: val.name,
						sidoCode: val.sidoCode,
						sidoName: val.sidoName || val.name,
						center: val.center,
					};
				}
				return acc;
			},
			{} as Record<string, { name: string; sidoCode: string; sidoName: string; center: number[] }>,
		);
	}, [regionInfo]);

	const scatterData = useMemo(() => {
		return data?.info?.map((d) => {
			const matchingSido = sidoInfo[d.sidoCode];

			let center = matchingSido ? matchingSido.center : [0, 0];
			if (String(d.sidoCode) === "41") center = [center[0] + 0.5, center[1] + 0.05];
			else if (String(d.sidoCode) === "51") center = [center[0] + 0.3, center[1] + 0.05];

			const value = d.data.reduce<Record<DashboardMapTabKey, number>>(
				(acc, { key, value }) => {
					acc[key] = value;
					return acc;
				},
				{ alp: 0, mopInflow: 0, mopOutflow: 0, llp: 0 },
			);

			return {
				sidoCode: String(d.sidoCode),
				sidoName: matchingSido?.sidoName || "",
				center,
				value,
			};
		});
	}, [data, sidoInfo, activeTabKey]);

	const onViewStateChange = useCallback(({ viewState }: ViewStateChangeParameters) => {
		setViewState(viewState);
	}, []);

	const onHover = useCallback(
		(info: any) => {
			if (info.object) {
				const { x, y } = info;
				const text =
					info.layer.id === "geojson-layer"
						? `${info.object.properties.REGION_NM}`
						: `${info.object.sidoName}: ${info.object.value[activeTabKey]}`;
				setTooltip({ x, y, text });
			} else {
				setTooltip(null);
			}
		},
		[activeTabKey],
	);

	const onClick = useCallback(
		(info: any) => {
			if (info.object) {
				let sidoCode = "";
				let sidoName = "";
				let center: number[] | undefined;
				if (info.layer.id === "geojson-layer") {
					sidoCode = String(info.object.properties.REGION_CD);
					sidoName = info.object.properties.REGION_NM;
					center = info.coordinate;
				} else if (info.layer.id === "scatterplot-layer") {
					sidoCode = String(info.object.sidoCode);
					sidoName = info.object.sidoName;
					center = info.object.center;
				}
				setSelectedSido({ sidoCode, sidoName });

				// if (center) {
				// 	setViewState((prev) => ({
				// 		...prev,
				// 		longitude: center[0],
				// 		latitude: center[1],
				// 		zoom: 6,
				// 		transitionDuration: 500,
				// 		transitionInterpolator: new FlyToInterpolator(),
				// 	}));
				// }
			} else {
				setSelectedSido({ sidoCode: "", sidoName: "" });
			}
		},
		[setSelectedSido],
	);

	const values = scatterData?.map((data) => data.value[activeTabKey]).filter(Boolean);
	const maxValue = values ? Math.max(...values) : 0;
	const minValue = values ? Math.min(...values) : 0;

	const layers = [
		new GeoJsonLayer({
			id: "geojson-layer",
			data: geoJson || { type: "FeatureCollection", features: [] },
			filled: true,
			stroked: true,
			lineWidthMinPixels: 1,
			getFillColor: (d: any) =>
				String(d.properties.REGION_CD) === selectedSido.sidoCode
					? [0, 0, 0, 70]
					: [216, 216, 216, 255],
			getLineColor: [253, 253, 253, 255],
			pickable: true,
			// onHover,
			onClick,
			updateTriggers: { getFillColor: selectedSido.sidoCode },
		}),

		new ScatterplotLayer({
			id: "scatterplot-layer",
			data: scatterData,
			getPosition: (d: ScatterData) => [d.center[0], d.center[1]],
			getRadius: (d: ScatterData) => {
				const normalizedValue = (d.value[activeTabKey] - minValue) / (maxValue - minValue);
				return Math.sqrt(normalizedValue) * 80000;
			},
			getFillColor: (d: ScatterData) => {
				const normalizedValue = (d.value[activeTabKey] - minValue) / (maxValue - minValue);
				const paletteIndex = Math.floor(normalizedValue * (colorPalette.length - 1));

				// 색상 팔레트에서 해당 색상 및 투명도 반환
				const baseColor =
					colorPalette[Math.min(Math.max(paletteIndex, 0), colorPalette.length - 1)];
				return d.value[activeTabKey]
					? multiplyColors(baseColor, [235, 235, 235, 255])
					: [0, 0, 0, 0];
			},
			radiusMinPixels: 5,
			radiusMaxPixels: 100,
			pickable: true,
			// onHover,
			onClick,
			opacity: 0.7,
		}),

		new TextLayer({
			id: "text-layer",
			data: scatterData,
			getPosition: (d) => d.center,
			getText: (d) => `${sidoInfo[d.sidoCode]?.name}`,
			getSize: 14,
			getColor: [255, 255, 255, 255],
			getTextAnchor: "middle",
			getAlignmentBaseline: "center",
			pickable: false,
			fontFamily: "Pretendard",
			fontWeight: 600,
			characterSet: "auto",
			fontSettings: { sdf: true },
		}),
	];

	return (
		<>
			<DeckGL
				style={{ width: "100%", height: "100%" }}
				viewState={viewState}
				onViewStateChange={onViewStateChange}
				controller={false}
				layers={layers}
			/>
			{tooltip && (
				<div
					style={{
						position: "absolute",
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
					}}
					className="pointer-events-none whitespace-nowrap rounded-md bg-black bg-opacity-80 p-2 text-xs text-white"
				>
					{tooltip.text}
				</div>
			)}
		</>
	);
}
