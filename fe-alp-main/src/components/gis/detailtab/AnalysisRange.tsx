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
import BaseButton from "@/components/buttons/BaseButton";
import Switch from "@/components/buttons/Switch";
import Tooltip from "@/components/tooltip/Tooltip";
import { MapViewState } from "deck.gl";
import * as React from "react";

type AnalysisRangeProps = {
	viewState: MapViewState;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
};

export default function AnalysisRange({
	viewState,
	gisSettings,
	setGisSettings,
}: Readonly<AnalysisRangeProps>) {
	// 동적으로 filter 생성
	const filter: Array<{ name: string; gridScale: number }> =
		(!gisSettings.isGridScaleAuto && gisSettings.gridScale === 0.05) ||
		gisSettings.analysisType === 3
			? [{ name: "50m", gridScale: 0.05 }] // analysisType이 3일 때
			: [
					{ name: "250m", gridScale: 0.25 },
					{ name: "500m", gridScale: 0.5 },
					{ name: "1km", gridScale: 1 },
				]; // 기본 filter

	const handleSwitchToggle = React.useCallback(() => {
		setGisSettings((prevGisSettings) => {
			const updatedState = {
				...prevGisSettings,
				isGridScaleAuto: !prevGisSettings.isGridScaleAuto,
			};
			return updatedState;
		});
	}, [setGisSettings]);

	React.useEffect(() => {
		// 새로운 gridScale을 계산
		const newGridScale =
			!gisSettings.isGridScaleAuto && gisSettings.gridScale === 0.05
				? 0.05
				: gisSettings.isGridScaleAuto
					? viewState.zoom >= 12
						? 0.25
						: viewState.zoom > 10 && viewState.zoom < 12
							? 0.5
							: 1
					: gisSettings.gridScale;

		// 불필요한 상태 업데이트 방지: 값이 다를 때만 업데이트
		if (gisSettings.gridScale !== newGridScale) {
			setGisSettings((prev) => ({
				...prev,
				gridScale: newGridScale,
				maps: prev.maps.map((map) => ({
					...map,
				})),
			}));
		}
	}, [gisSettings.isGridScaleAuto, gisSettings.gridScale, viewState.zoom, setGisSettings]);
	return (
		<div className="flex w-fit items-center gap-2">
			<h3
				className={`${(!gisSettings.isGridScaleAuto && gisSettings.gridScale === 0.05) || gisSettings.analysisType === 3 ? "min-w-16" : "min-w-20"} "break-keep text-[#6D6D6D]" text-sm font-medium`}
			>
				{`격자 크기 ${(!gisSettings.isGridScaleAuto && gisSettings.gridScale === 0.05) || gisSettings.analysisType === 3 ? "" : "고정"}`}
			</h3>
			{(!gisSettings.isGridScaleAuto && gisSettings.gridScale === 0.05) ||
			gisSettings.analysisType === 3 ? (
				<>
					<ul className="flex h-10 gap-2">
						{filter.map((label, index) => (
							<BaseButton
								size="md"
								key={label.name}
								title={label.name}
								color={
									gisSettings.gridScale === label.gridScale || gisSettings.analysisType === 3
										? "primary_light"
										: "gray"
								}
							/>
						))}
					</ul>
					{gisSettings.gridScale === 0.05 && <div className="mx-5 h-[26px] w-[1px] bg-[#e2e2e2]" />}
					<Tooltip
						aod
						message={
							"격자크기를 50으로 선택한 경우에는 격자크기 변경, 시계열분석, 듀얼분석이 불가능합니다."
						}
					/>
				</>
			) : (
				<>
					<Switch isActive={!gisSettings.isGridScaleAuto} onToggle={handleSwitchToggle} />
					<ul className="flex items-center gap-2">
						{filter.map((label, index) => (
							<li
								key={label.name}
								className={`${label.gridScale === gisSettings.gridScale ? "font-semibold text-primary" : "gray"} p-2`}
							>
								{label.name}
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
