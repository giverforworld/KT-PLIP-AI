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

"use client";

import { useEffect, useState } from "react";
import IconScrollTop from "@images/arrow_upward.svg";

export default function ScrollTopButton() {
	const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

	useEffect(() => {
		const element = document.querySelector("main");
		setMainEl(element as HTMLElement);
	}, []);

	const handleClick = () => {
		if (mainEl) {
			mainEl.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<button
			className="flex h-[50px] w-[50px] items-center justify-center rounded-md border bg-white shadow-lg"
			onClick={handleClick}
		>
			<IconScrollTop />
		</button>
	);
}
