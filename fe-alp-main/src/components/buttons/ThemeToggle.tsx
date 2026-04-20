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

import { useEffect } from "react";
import IconDarkToggle from "@images/darkmode.svg";
import IconLightToggle from "@images/lightmode.svg";
import { useThemeStore } from "@/store/theme";

export default function ThemeToggle() {
	const theme = useThemeStore((s)=> s.theme);
	const toggleTheme = useThemeStore((s)=>s.toggleTheme);
	const initTheme = useThemeStore((s)=>s.initTheme);

	useEffect(() => {
		initTheme();
	}, [initTheme]);

	
	return (
		<button onClick={toggleTheme}>
			{theme === "dark" ? <IconDarkToggle /> : <IconLightToggle />}
		</button>
	);
}
