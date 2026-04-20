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

export const useToastStore = create<ToastStore>((set) =>({
    toasts:[],

    addToast:(toast)=>set((state)=>({
        toasts:[...state.toasts, toast],
    })),

    removeToast:(id)=> set((state)=>({
        toasts:state.toasts.filter((t)=> t.id !==id),
    })),

    clear:()=>set({toasts:[]}),
}));