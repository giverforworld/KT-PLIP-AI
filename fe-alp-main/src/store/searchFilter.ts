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


import { searchFilterDefaultValue } from "@/context/defaultValues";
import {create} from "zustand";

type SearchFilterStore = {
	filter:SearchFilterStoreState;
    //전체 병합 업데이트 
    mergeFilter:(
        payload: Partial<SearchFilterStoreState>
    )=>void;
    //초기화
    resetFilter:()=>void;
};

export const useSearchFilterStore = create<SearchFilterStore>((set) => ({
	filter: searchFilterDefaultValue,

	mergeFilter: (payload) =>
		set((state) => ({
			filter: {
				...state.filter,
				...payload,
			},
		})),
	resetFilter: () => set({ filter: searchFilterDefaultValue }),
}));