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

type GisTooltipInfoStore = {
	gisToolTipInfo: GisTooltipInfo;
	setgisToolTipInfo: (
		updater:
			| GisTooltipInfo 
			| ((prev:GisTooltipInfo)=> GisTooltipInfo)
		) => void;
	resetgisToolTipInfo: () => void;
};

const defaultTooltip :GisTooltipInfo = {
		id: "",
		isActive: false,
		x: 0,
		y: 0,
		count: 0,
		data: undefined,
		mapType: "none",
		mapIdx: 0,
	}

export const useGisTooltipInfoStore = create<GisTooltipInfoStore>((set) => ({
	gisToolTipInfo: defaultTooltip,
	setgisToolTipInfo: (updater) =>
		set((state) => ({
			gisToolTipInfo: typeof updater === "function" ? updater(state.gisToolTipInfo) : updater,
		})),
	resetgisToolTipInfo: () => {
		set({
			gisToolTipInfo: defaultTooltip,
		});
	},
}));