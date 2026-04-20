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


type ActiveTabStore = {
    activeTabs: Record<string,{tab:string}>;
    setActiveTab:(title:string, tab:string)=>void;
    resetTab:(title:string)=>void;
    resetAll:()=>void;
};

export const useActiveTabStore = create<ActiveTabStore>((set) => ({
	activeTabs: {},

	setActiveTab: (title, tab) => 
		set(state=>({
            activeTabs:{
                ...state.activeTabs,
                [title]:{tab},
            }
        })),
    resetTab:(title)=>
        set(state=>{
            const next = {...state.activeTabs};
            delete next[title];
            return{activeTabs:next};
        }),
    resetAll:()=>set({activeTabs:{}})
}));