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

export const useThemeStore = create<ThemeState>((set, get)=>({
    theme: "light",

	setTheme: (theme) => {
        set({theme});
        if(typeof window !== "undefined"){
            localStorage.setItem("theme", theme);
		    document.documentElement.classList.toggle("dark", theme === "dark");
        }        
    },
	toggleTheme: () => {
        const next = get().theme ===  "light" ? "dark" : "light";
        get().setTheme(next);
    },
	initTheme: () => {
        if(typeof window !== "undefined") return;

        const saved = localStorage.getItem("theme") as Theme | null;
        const theme = saved ?? "light";

        set({theme});
        document.documentElement.classList.toggle("dark", theme === "dark")
    },
}))