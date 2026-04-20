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

import { initialViewState } from "@/constants/gis";
import { MapViewState } from "deck.gl";
import { atom } from "recoil";

// export const ViewState = atom<MapViewState>({
// 	key: "viewState",
// 	default: initialViewState,
// });

// export const TimeSeriesStatus = atom<TimeSeriesStatus>({
// 	key: "timeSeriesStatus",
// 	default: {
// 		timeSeriesType: 1, // 기본값 : 시간별
// 		playStatus: 0, // 일시정지 시작
// 		currentTime: 0, // 기본은 0, 데이터 패칭 후 수정됨
// 		currentValue: 0,
// 		isData: true,
// 	},
// });

// export const tabType = atom<0 | 1 | 2 | 3>({
// 	key: "tabType",
// 	default: 1,
// });
// export const isAnalysis = atom<{ [key: string]: boolean }>({
// 	key: "isAnalysis",
// 	default: { 0: false, 1: false },
// });

// export const GisTooltipInfo = atom<GisTooltipInfo>({
// 	key: "gisToolTipInfo",
// 	default: {
// 		id: "",
// 		isActive: false,
// 		x: 0,
// 		y: 0,
// 		count: 0,
// 		data: undefined,
// 		mapType: "none",
// 		mapIdx: 0,
// 	},
// });
