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

import React, { useEffect, useState } from "react";
import GisControlButton from "@/components/gis/actionbutton/GisControlButton";
import StepChartButton from "@images/gis/step_chart_button.svg";
import BubbleChartButton from "@images/gis/bubble_chart_button.svg";
import ThreedChartButton from "@images/gis/3d_chart_button.svg";
import SpaceAnalysisButton from "@images/gis/space_analysis_button.svg";
import { useShowToast } from "@/hooks/useToastShow";
import Switch from "@/components/buttons/Switch";
import { useTextLayerStore } from "@/store/textLayer";

interface ChartTypeSelectorProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export function ChartTypeSelector({
	gisSettings,
	setGisSettings,
}: Readonly<ChartTypeSelectorProps>) {
	const showToast = useShowToast();
	const textLayerShow = useTextLayerStore((s) => s.textLayer);
	const setTextLayerShow = useTextLayerStore((s) => s.setTextLayer);
	const onClickTextLayer = () => {
		setTextLayerShow(!textLayerShow);
		if (!textLayerShow) {
			showToast("지도 텍스트가 표시되었습니다.", "success", "middle");
		} else {
			showToast("지도 텍스트가 숨김처리 되었습니다.", "success", "middle");
		}
	};

	return (
		<div className="flex gap-2">
			<GisControlButton
				onClick={() =>
					setGisSettings({
						...gisSettings,
						visualizeOption: 0,
						maps: gisSettings.maps.map((map, index) => ({
							...map,
							isVectorAnalysis: true,
						})),
					})
				}
				icon={<StepChartButton />}
				label="히트맵"
				isActive={gisSettings.visualizeOption === 0}
			/>
			{(gisSettings.analysisType === 1 ||
				(gisSettings.analysisType === 2 && gisSettings.analysisSubType === 0)) && (
				<GisControlButton
					onClick={() => {
						if (!gisSettings.maps[0].isVectorAnalysis) return null;
						else {
							setGisSettings((prevSettings) => ({
								...prevSettings,
								visualizeOption: 1,
								isTimeLine: false,
								maps: prevSettings.maps.map((map, index) => ({
									...map,
									isVectorAnalysis: false,
								})),
							}));
						}
					}}
					icon={<SpaceAnalysisButton />}
					label="공간벡터분석"
					isActive={!gisSettings.maps[0].isVectorAnalysis && gisSettings.visualizeOption === 1}
				/>
			)}
			{(gisSettings.analysisType === 0 ||
				gisSettings.analysisType === 1 ||
				(gisSettings.analysisType === 2 && gisSettings.analysisSubType === 1)) && (
				<GisControlButton
					onClick={() =>
						setGisSettings({
							...gisSettings,
							visualizeOption: 2,
							maps: gisSettings.maps.map((map, index) => ({
								...map,
								isVectorAnalysis: true,
							})),
						})
					}
					icon={<BubbleChartButton />}
					label="버블차트"
					isActive={gisSettings.visualizeOption === 2}
				/>
			)}
			{((gisSettings.analysisType === 0 && gisSettings.isNative) ||
				(gisSettings.analysisType !== 1 &&
					gisSettings.analysisType !== 2 &&
					gisSettings.analysisSubType === 1)) && (
				<GisControlButton
					onClick={() =>
						setGisSettings({
							...gisSettings,
							visualizeOption: 3,
							maps: gisSettings.maps.map((map, index) => ({
								...map,
								isVectorAnalysis: true,
							})),
						})
					}
					icon={<ThreedChartButton />}
					label="차트맵"
					isActive={gisSettings.visualizeOption === 3}
				/>
			)}
			{(gisSettings.visualizeOption === 0 || gisSettings.visualizeOption === 2) &&
				!(gisSettings.analysisType === 3 && gisSettings.visualizeOption === 0) &&
				!(gisSettings.analysisType === 2 && gisSettings.analysisSubType === 1 ) && 
			(
					// <button onClick={onClickTextLayer}>
					// 	{textLayerShow ? <IconLabelTrue /> : <IconLabelFalse />}
					// </button>
					<div className="ml-1 flex items-center gap-1">
						<Switch isActive={textLayerShow} onToggle={onClickTextLayer} />
						<div className="select-none whitespace-nowrap text-sm font-semibold">인구수 표출</div>
					</div>
				)}
		</div>
	);
}
