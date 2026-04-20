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

import { Dispatch, SetStateAction } from "react";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";

export interface AvgSumUniqueTabProps {
	activeTab: { key: DataSummaryKeys; name: string };
	setActiveTab: Dispatch<SetStateAction<{ key: DataSummaryKeys; name: string }>>;
	shouldDisplayTab: (tabKey: DataSummaryKeys) => boolean | undefined;
}

export const tabList: { key: DataSummaryKeys; name: string }[] = [
	{ key: "Avg", name: "평균" },
	{ key: "Unique", name: "유니크" },
];

export default function AvgSumUniqueTab({
	activeTab,
	setActiveTab,
	shouldDisplayTab,
}: AvgSumUniqueTabProps) {
	const handleTabClick = (
		e: React.MouseEvent<HTMLElement>,
		tab: { key: DataSummaryKeys; name: string },
	) => {
		e.preventDefault();
		setActiveTab(tab);
	};

	return (
		<Tab type="line" size="small" width="w-[150px]">
			{tabList.map((tab) => {
				if (!shouldDisplayTab(tab.key)) return null;
				return (
					<TabItem
						key={tab.key}
						type="line"
						size="small"
						isActive={tab.key === activeTab.key}
						onClick={(e) => handleTabClick(e, tab)}
					>
						{tab.name}
					</TabItem>
				);
			})}
		</Tab>
	);
}
