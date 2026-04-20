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

import AccordionBox from "@/components/boxes/AccordionBox";
import ShadowBox from "@/components/boxes/ShadowBox";
import { getChartIcon } from "@/utils/chartUtils";
import { scrollToTargetContainer } from "@/utils/scroll";
import { useDrawerStore } from "@/store/drawer";
import { useSearchResultStore } from "@/store/searchResult";

export default function DataList() {
	const setDrawer = useDrawerStore(s=>s.setDrawer);
	const searchResult = useSearchResultStore(s=>s.searchResult);
	
	const currentPageData = searchResult.data;

	const mainEl = document.querySelector("main");

	const handleClick = (id: string) => {
		scrollToTargetContainer(mainEl, id, 30);
		setDrawer({ title: "", isOpen: false });
	};

	return (
		<div className="custom-scrollbar grow overflow-y-auto">
			<div className="my-4 flex flex-col gap-4">
				{currentPageData?.dataGroups?.map((dataGroup) => (
					<AccordionBox
						key={dataGroup.title}
						title={dataGroup.title}
						bgColor="bg-white"
						border={false}
					>
						<ul className="my-4 flex flex-col gap-4">
							{dataGroup.data.map((item) => {
								const ChartIcon = getChartIcon(item.charts[0]?.name);
								return (
									<li
										key={item.title}
										className="cursor-pointer"
										onClick={() => handleClick(item.title)}
									>
										<ShadowBox padding="p-3">
											<div className="mb-1 flex items-center gap-2">
												{ChartIcon ? <ChartIcon /> : ""}
												<h5 className="line-clamp-1 font-semibold">{item.title}</h5>
											</div>
											{/* <p className="line-clamp-1 text-sm text-textGray">차트 설명</p> */}
										</ShadowBox>
									</li>
								);
							})}
						</ul>
					</AccordionBox>
				))}
			</div>
		</div>
	);
}
