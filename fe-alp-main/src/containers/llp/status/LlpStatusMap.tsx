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

"use client";

import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, LineLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import useGisData from "@/hooks/queries/useGisData";
import LlpOwn from "@images/chartIcon/llp01.svg";
import LlpTwo from "@images/chartIcon/llp02.svg";
import LlpThr from "@images/chartIcon/llp03.svg";
import LlpFour from "@images/chartIcon/llpFour.svg";
import LlpFive from "@images/chartIcon/llpFive.svg";
import LlpSix from "@images/chartIcon/llpSix.svg";
import { changeDateToString } from "@/utils/date";
import { useSearchResultStore } from "@/store/searchResult";
import { useSearchFilterStore } from "@/store/searchFilter";

//TO_BE_CHECKED
interface MapContentsProps {
	regionInfo: Record<string, RegionInfo> | undefined;
	data: any;
	statSummary: any;
}
interface ScatterData {
	sidoCode: string;
	sidoName: string;
	center: number[];
	value: number;
}

const legendData = [
	{ label: "0-2", icon: <LlpOwn className="ml-3" /> },
	{ label: "2-4", icon: <LlpTwo className="ml-3" /> },
	{ label: "4-8", icon: <LlpThr className="ml-3" /> },
	{ label: "8-10", icon: <LlpFour className="ml-3" /> },
	{ label: "10 이상", icon: <LlpFive className="ml-3" /> },
	{ label: "인구감소지역 외", icon: <LlpSix className="ml-3" /> },
];

export default function LlpSatatusMap({ regionInfo, data }: MapContentsProps) {
	const searchFilter = useSearchFilterStore(s=>s.filter);
	const { useGeometry } = useGisData();
	const { data: geoJson } = useGeometry(changeDateToString(searchFilter.selectedDate).toString().slice(0, 6), "sgg");

	// TO_BE_CHECKED 이 코드 풀고 아래 주석 코드 // 처리
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;

	const sggInfo = useMemo(() => {
		if (!regionInfo) return {};
		return Object.entries(regionInfo).reduce(
			(acc, [key, val]) => {
				if (+key > 0) {
					acc[key] = {
						name: val.name,
						sggCode: key, // 시군구 코드로 매핑
						sggName: val.sggName || val.name, // 시군구 이름
						center: val.center,
					};
				}
				return acc;
			},
			{} as Record<string, { name: string; sggCode: string; sggName: string; center: number[] }>,
		);
	}, [regionInfo]);

	const scatterData = useMemo(() => {
		if (!data?.indicate) return [];
		return data.indicate.map((d: any) => {
			const matchingSgg = sggInfo[d.sggCode];

			const center = matchingSgg ? matchingSgg.center : [0, 0];
			const value = d.배수 || 0;

			return {
				sggCode: String(d.sggCode),
				sggName: matchingSgg?.sggName || "Unknown",
				center,
				value,
			};
		});
	}, [data, sggInfo]);

	// TO_BE_CHECKED 통계요약 API값 연결시 삭제
	// const statSummary = [
	// 	{ regionName: "대덕구" },
	// 	{ regionName: "영천시" },
	// 	{ regionName: "담양군" },
	// ];

	// 초기 ViewState를 statSummary의 첫 번째 지역으로 설정
	const initialViewState = useMemo(() => {
		if (!statSummary || statSummary.length === 0) {
			return {
				longitude: 127.7669, // 한국 중심 경도
				latitude: 35.9078, // 한국 중심 위도
				zoom: 5.5, // 기본 줌 레벨
				pitch: 0,
				bearing: 0,
			};
		}

		// statSummary 첫 번째 값에 해당하는 지역 중심 좌표 설정
		const firstRegionName = statSummary[0]?.regionName;
		const matchingRegion = Object.values(sggInfo).find(
			(region) => region.sggName === firstRegionName,
		);

		return {
			longitude: matchingRegion?.center[0] || 127.7669,
			latitude: matchingRegion?.center[1] || 35.9078,
			zoom: 7, // 확대 레벨
			pitch: 0,
			bearing: 0,
		};
	}, [statSummary, sggInfo]);

	const [viewState, setViewState] = useState(initialViewState);

	const filteredScatterData = useMemo(() => {
		return scatterData.filter((d: any) => {
			const isMatched = statSummary.some((item: any) => item.regionName === d.sggName);
			return isMatched;
		});
	}, [scatterData, statSummary]);

	const layers = [
		new GeoJsonLayer({
			id: "geojson-layer",
			data: geoJson || { type: "FeatureCollection", features: [] },
			filled: true,
			stroked: true,
			lineWidthMinPixels: 1,
			getFillColor: (feature: any) => {
				const featureSggCode = String(feature?.properties?.REGION_CD || "");
				const matchingScatter = scatterData.find((d: any) => String(d.sggCode) === featureSggCode);

				if (!matchingScatter) {
					return [212, 212, 212, 255];
				}

				const value = matchingScatter.value;

				if (value >= 10) return [35, 74, 144, 255];
				if (value >= 8) return [67, 101, 164, 255];
				if (value >= 4) return [93, 134, 212, 255];
				if (value >= 2) return [155, 182, 233, 255];
				if (value >= 0) return [222, 229, 242, 255];

				return [195, 195, 195, 255];
			},
			getLineColor: [255, 255, 255, 255],
		}),

		new ScatterplotLayer({
			id: "scatterplot-layer",
			data: filteredScatterData,
			getPosition: (d) => d.center,
			getRadius: (d: ScatterData) => {
				return Math.sqrt(d.value) * 10000;
			},
			getFillColor: (d: ScatterData): [number, number, number, number] => {
				if (!d.value) return [0, 0, 0, 0]; // 값이 없으면 투명 색상 반환
				const color: [number, number, number, number] = [51, 51, 51, 225]; // 기본 색상 정의
				return d.value >= 0 ? color : [0, 0, 0, 0];
			},
			radiusMinPixels: 5,
			radiusMaxPixels: 100,
			pickable: true,
			opacity: 0.7,
		}),

		new TextLayer({
			id: "text-layer",
			data: filteredScatterData,
			getPosition: (d) => d.center,
			getText: (d) => `${sggInfo[d.sggCode]?.name}\n${d.value}`,
			getSize: 14,
			getColor: [255, 255, 255, 255],
			getTextAnchor: "middle",
			getAlignmentBaseline: "center",
			pickable: false,
			fontFamily: "Pretendard",
			fontWeight: 800,
			characterSet: "auto",
			fontSettings: { sdf: true },
		}),
	];

	return (
		<div className="relative w-full">
			<div
				className="map-container rounded-md border-filterLightGray bg-whiteGray"
				style={{ width: "100%", height: "450px", position: "relative" }}
			>
				<DeckGL
					style={{
						width: "100%",
						height: "100%",
						cursor: "default",
					}}
					viewState={viewState}
					onViewStateChange={({ viewState }) =>
						setViewState(
							viewState as {
								longitude: number;
								latitude: number;
								zoom: number;
								pitch: number;
								bearing: number;
							},
						)
					}
					controller={true}
					layers={layers}
				/>
			</div>
			<div className="w-130px absolute bottom-0 right-0 gap-1 p-2 text-sm font-normal">
				<div className="text-right">체류인구 배수</div>
				{legendData.map(({ label, icon }, index) => (
					<div key={index} className="flex items-center justify-end">
						{label} {icon}
					</div>
				))}
			</div>
		</div>
	);
}
