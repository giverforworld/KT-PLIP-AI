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

import { usePathname } from "next/navigation";
import { useState } from "react";
import { menuList } from "@/constants/menu";
import { PATHS } from "@/constants/path";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import HelperText from "@/components/text/HelperText";

interface SelectRegionTabProps {
	regions: string[];
	selectRegion: () => void;
}

// CHECKED_20241018: 해당 컴포넌트 사용하지 않음
export default function SelectRegionTab({ regions, selectRegion }: SelectRegionTabProps) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/").pop();

	const subMenu = menuList
		.find((menu) => menu.path === rootRoute)
		?.subMenu?.find((subMenu) => subMenu.path === endRoute);

	const [selectedRegion, setSelectedRegion] = useState(regions[0]);

	const handleClick = (region: string) => {
		selectRegion();
		setSelectedRegion(region);
	};

	return (
		<div className="my-2">
			{subMenu && (subMenu?.path === PATHS.PATTERN || subMenu?.path === PATHS.COMP_ANALYSIS) && (
				<HelperText
					text={`${subMenu.name} 지표는 지역간 비교가 불가능해 각 지역별 지표를 조회할 수 있습니다.`}
				/>
			)}
			<Tab type="line" width="w-auto">
				{regions?.map((region) => (
					<TabItem
						key={region}
						type="line"
						isActive={region === selectedRegion}
						onClick={() => handleClick(region)}
						width="w-auto"
					>
						{region}
					</TabItem>
				))}
			</Tab>
		</div>
	);
}
