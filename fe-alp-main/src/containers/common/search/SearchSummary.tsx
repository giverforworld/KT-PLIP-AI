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

import { useEffect, useState } from "react";
import { tabList } from "../data/AvgSumUniqueTab";
import AccordionBox from "@/components/boxes/AccordionBox";
import SearchSummaryTable from "./SearchSummaryTable";

interface SearchSummaryProps {
	searchSummary: SearchSummary[] | undefined;
	isSearchSummaryLoading: boolean;
	searchFilter: MopSearchFilter & MopFlowSearchFilter;
}

export default function SearchSummary({
	searchSummary,
	isSearchSummaryLoading,
	searchFilter,
}: SearchSummaryProps) {
	const [activeTab, setActiveTab] = useState<{ key: DataSummaryKeys; name: string }>(tabList[0]);
	const shouldDisplayTab = (tabkey: DataSummaryKeys) => {
		if (searchSummary) {
			const data = searchSummary[0]?.data[0]?.value;
			if (typeof data === "object" && data !== null) return Boolean(data[tabkey]);
		}
	};

	useEffect(() => {
		setActiveTab(tabList[0]);
	}, [searchSummary]);

	return (
		<AccordionBox
			title="지역분석표"
			bgColor="bg-white"
			padding="p-3"
			border
			shadow
			tabState={{ activeTab, setActiveTab, shouldDisplayTab }}
		>
			<SearchSummaryTable
				data={searchSummary}
				isSearchSummaryLoading={isSearchSummaryLoading}
				activeTabKey={activeTab.key}
				searchFilter={searchFilter}
			/>
		</AccordionBox>
	);
}
