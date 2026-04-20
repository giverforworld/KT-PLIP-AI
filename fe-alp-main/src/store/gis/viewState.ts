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
import { MapViewState } from "deck.gl";
import { initialViewState } from "@/constants/gis";

type ViewStatusStore = {
	viewState: MapViewState;
	setViewState: (updater: MapViewState | ((prev: MapViewState) => MapViewState)) => void;
	resetViewState: () => void;
};

export const useViewStatusStore = create<ViewStatusStore>((set) => ({
	viewState: initialViewState,
	setViewState: (updater) =>
		set((state) => ({
			viewState: typeof updater === "function" ? updater(state.viewState) : updater,
		})),
	resetViewState: () => {
		set({
			viewState: initialViewState,
		});
	},
}));