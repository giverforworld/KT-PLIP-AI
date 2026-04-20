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

type IsAnalysisStore = {
	isAnalysis: Record<number, boolean>;
	setIsAnalysis: (key: number, value: boolean) => void;
	setIsAnalysisBulk: (payload:Record<number,boolean>) => void;
};

export const useIsAnalysisStore = create<IsAnalysisStore>((set) => ({
	isAnalysis: { 0: false, 1: false },

	setIsAnalysis: (key, value) =>
		set((state) => ({
			isAnalysis: {
				...state.isAnalysis,
				[key]: value,
			},
		})),
	setIsAnalysisBulk: (payload) =>
		set((state) => ({
			isAnalysis: {
				...state.isAnalysis,
				...payload,
			},
		})),
}));