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

import { useState } from "react";
import ScrollTopButton from "@/components/buttons/ScrollTopButton";
import IconDataList from "@images/data_list.svg";
import IconGuideList from "@images/guide_list.svg";
import GuideIcon from "@images/helpIcon.svg";
import DataListIcon from "@images/dataListIcon.svg";
import { useSearchResultStore } from "@/store/searchResult";
import { useDrawerStore } from "@/store/drawer";

export default function AssistButtons() {
	const setDrawer = useDrawerStore(s=>s.setDrawer);
	const [hoveredButton, setHoveredButton] = useState<string | null>(null);

	const searchResult = useSearchResultStore(s=>s.searchResult);
	const currentPageData = searchResult.data;

	return (
		<div className="fixed bottom-10 right-10 z-30 flex flex-col items-center justify-center gap-4">
			<div className="flex flex-col">
				<button
					onClick={() => setDrawer({ title: "도움말", isOpen: true })}
					onMouseEnter={() => setHoveredButton("guide")}
					onMouseLeave={() => setHoveredButton(null)}
				>
					<IconGuideList className="text-white hover:text-[#F5FAFF]" />
				</button>
				{hoveredButton === "guide" && (
					<div className="absolute left-[-80px] top-[10px]">
						<GuideIcon />
					</div>
				)}

				{currentPageData?.dataGroups?.length === 0 ? null : (
					<button
						onClick={() => setDrawer({ title: "DATA LIST", isOpen: true })}
						onMouseEnter={() => setHoveredButton("data")}
						onMouseLeave={() => setHoveredButton(null)}
					>
						<IconDataList className="text-white hover:text-[#F5FAFF]" />
					</button>
				)}
				{hoveredButton === "data" && (
					<div className="absolute left-[-115px] top-[75px]">
						<DataListIcon />
					</div>
				)}
			</div>

			<ScrollTopButton />
		</div>
	);
}
