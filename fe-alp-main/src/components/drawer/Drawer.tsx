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

import IconClose from "@images/close.svg";
import DataList from "@/containers/common/data/DataList";
import GuideList from "@/containers/common/data/GuideList";
import { useDrawerStore } from "@/store/drawer";

/**
 * 우측에서 슬라이드 되는 Drawer
 * @param {DrawerProps} DrawerProps
 * @returns {React.JSX.Element} div
 */
export default function Drawer() {
	const drawer = useDrawerStore(s=>s.drawer)
	const setDrawer = useDrawerStore(s=>s.setDrawer);
	

	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
	};

	if (!drawer.isOpen) return null;

	return (
		// <div
		// 	className={`${
		// 		drawer ? "fixed left-0 top-0 z-50 h-full w-full bg-gray-800 bg-opacity-75" : ""
		// 	}`}
		// 	onClick={() => setDrawer(false)}
		// >
		<div
			className={`fixed right-0 top-0 z-50 flex h-full w-[560px] transform flex-col bg-[#F7F8F9] shadow-lg transition-transform duration-300 ${
				drawer ? "translate-x-0" : "translate-x-full"
			}`}
			// onClick={handleOutsideClick}
		>
			<div className="flex items-center justify-between bg-[white] px-4 py-3">
				<h3 className="text-xl font-semibold">{drawer.title}</h3>
				<button
					className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-filterLightGray text-gray-700 hover:text-gray-900 focus:outline-none"
					onClick={() =>
						setDrawer({
							title: "",
							isOpen: false,
						})
					}
				>
					<IconClose />
				</button>
			</div>
			{drawer.title === "DATA LIST" ? <DataList /> : <GuideList />}
		</div>
		// </div>
	);
}
