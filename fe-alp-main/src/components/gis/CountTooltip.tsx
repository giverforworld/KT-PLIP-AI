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

export default function CountTooltip({
	tooltipInfo,
	gisSettings,
	mapIdx,
}: {
	tooltipInfo: any;
	gisSettings: GisSettings;
	mapIdx: number;
}) {
	const {
		analysisType,
		analysisSubType,
		maps: { [mapIdx]: mapSettings },
	} = gisSettings;
	const { inOutFlow } = mapSettings;
	const { count } = tooltipInfo;

	let text = "";
	if (analysisType === 0) {
		text = "1시간 평균 생활인구";
	} else if (analysisType === 1) {
		if (inOutFlow) {
			text = "총 유입인구";
		} else {
			text = "총 유출인구";
		}
	} else if (analysisType === 2) {
		if (analysisSubType === 0) text = "총 유입인구";
		else text = "체류 인구";
	} else if (analysisType === 3) {
		text = "유동 인구";
	}
	return (
		<div className="flex min-w-60 justify-between gap-4 rounded-md bg-gray-100 p-2">
			<p>{text}</p>
			<p className="font-bold">{Math.ceil(count).toLocaleString()} 명</p>
		</div>
	);
}
