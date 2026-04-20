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


import {create} from "zustand";

type TimeSeriesStatusStore = {
	timeSeriesStatus: TimeSeriesStatus;
	setTimeSeriesStatus: (
		updater:
			| TimeSeriesStatus 
			| ((prev:TimeSeriesStatus)=> TimeSeriesStatus)
		) => void;
	resetTimeSeriesStatus: () => void;
};

const defaultTooltip: TimeSeriesStatus = {
	timeSeriesType: 1, // 기본값 : 시간별
	playStatus: 0, // 일시정지 시작
	currentTime: 0, // 기본은 0, 데이터 패칭 후 수정됨
	currentValue: 0,
	isData: true,
};

export const useTimeSeriesStatusStore = create<TimeSeriesStatusStore>((set) => ({
	timeSeriesStatus: defaultTooltip,
	setTimeSeriesStatus: (updater) =>
		set((state) => ({
			timeSeriesStatus: typeof updater === "function" ? updater(state.timeSeriesStatus) : updater,
		})),
	resetTimeSeriesStatus: () => {
		set({
			timeSeriesStatus: defaultTooltip,
		});
	},
}));