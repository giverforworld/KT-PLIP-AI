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
import * as React from "react";
import ChartTooltip from "./ChartTooltip";
import CountTooltip from "./CountTooltip";
import { useGisTooltipInfoStore } from "@/store/gis/gisToolTipInfo";

export default function GisTooltipModal({
	mapIdx,
	gisSettings,
	layerData,
}: {
	mapIdx: number;
	gisSettings: GisSettings;
	layerData: any;
}) {
	const tooltipInfo = useGisTooltipInfoStore(s=>s.gisToolTipInfo);
	const setTooltipInfo = useGisTooltipInfoStore(s=>s.setgisToolTipInfo);

	const { x, y, isActive, mapIdx: mapId, data } = tooltipInfo;
	const tooltipRef = React.useRef<HTMLDivElement>(null);
	const parentRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (!parentRef.current) return;
			const elAtPoint = document.elementFromPoint(event.clientX, event.clientY);

			const isOverMapOrTooltip = 
				elAtPoint?.closest?.(".map-container-class") || elAtPoint?.closest?.(".tooltip-class");

			if (!isOverMapOrTooltip) {
				setTooltipInfo(prev => ({ ...prev, isActive: false}));
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove)
	}, [setTooltipInfo]);

	if (!layerData) return;
	const { regionName, visualizeOption, analysisType } = gisSettings;
	const { layerType } = layerData;
	const name = data?.regionName
		? data.regionName.split(" ").slice(-2).join(" ")
		: data?.desnm
			? data.desnm
			: regionName;

	// 툴팁 위치 계산 (상하 경계만 체크)
	let adjustedX = x + 10; // 좌우는 그대로 사용
	let adjustedY = y - 10;

	let relativeBottom = 0;
	let relativeRight = 0;
	if (isActive && tooltipRef.current && parentRef.current) {
		const tooltipHeight = tooltipRef.current.offsetHeight || 0;

		// 부모 컨테이너 크기 및 위치
		const parentRect = parentRef.current.getBoundingClientRect();
		const parentTop = parentRect.top;
		const parentHeight = parentRect.height;
		const parentWidth = parentRect.width;
		const relativeTop = (parentHeight - parentTop) * 0.15 + 125;
		relativeBottom = (parentHeight - parentTop) * 0.1 + 46;
		relativeRight = parentWidth * 0.15 + 130;

		// 기본 좌표를 부모 기준으로 조정
		adjustedY -= tooltipHeight;

		// 부모 컨테이너 아래쪽 경계 체크
		if (adjustedY + tooltipHeight > parentHeight) {
			adjustedY = parentHeight - tooltipHeight;
		}

		// 부모 컨테이너 위쪽 경계 체크
		if (adjustedY < relativeTop) {
			adjustedY = relativeTop;
		}
	}

	// style 객체를 조건부로 생성
	const tooltipStyle = {
		...(visualizeOption === 3
			? {
					right: relativeRight,
					bottom: relativeBottom,
				}
			: {
					left: adjustedX,
					top: adjustedY,
				}),
		opacity: isActive && mapIdx === mapId ? 1 : 0,
	};

	return (
		<div ref={parentRef} className="relative h-full w-full">
			{
				<div
					ref={tooltipRef}
					className="pointer-events-none absolute z-50 rounded-lg border bg-white p-3 drop-shadow-md"
					style={tooltipStyle}
				>
					<p className="mb-1 text-xl font-bold">{name}</p>
					{(visualizeOption === 0 || visualizeOption === 1 || visualizeOption === 2) && (
						<CountTooltip {...{ tooltipInfo, gisSettings, mapIdx }} />
					)}
					{visualizeOption === 3 && <ChartTooltip tooltipInfo={tooltipInfo} />}
				</div>
			}
		</div>
	);
}
