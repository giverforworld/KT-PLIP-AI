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
import BaseButton from "@/components/buttons/BaseButton";
import GoBack from "@images/gis/goback_arrow.svg";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import { menuList } from "@/constants/menu";
import { usePathname } from "next/navigation";
import * as React from "react";

interface GisTabMenuProps {
	mapIdx?: 0 | 1;
	setTabValue: any;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	initialTempSettings: GisSettings; // ✅ 초기 설정값 추가
}

export default function GisTabMenu({
	mapIdx = 0,
	setTabValue,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	initialTempSettings, // ✅ 추가
}: Readonly<GisTabMenuProps>) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const subMenu = menuList.find((menu) => menu.path === rootRoute)?.subMenu;

	const endDate = JSON.parse(sessionStorage.getItem("info")!).endDate;

	if (!subMenu || subMenu.length === 0) return null;

	// 1️⃣ 탭 메뉴의 순서 설정 (보이는 순서)
	const orderForTabs = ["MOP", "ALP", "LLP", "FLP"];
	const sortedSubMenu = [...subMenu].sort(
		(a, b) => orderForTabs.indexOf(a.path) - orderForTabs.indexOf(b.path),
	);

	// 2️⃣ analysisType 순서 설정 (인덱스 매핑)
	const orderForAnalysisType = ["ALP", "MOP", "LLP", "FLP"];

	return (
		<div className="z-50 flex flex-col items-center justify-center gap-4 bg-white p-4">
			<div className="flex w-full items-center justify-between">
				<h3 className="text-xl font-bold">
					{mapIdx === 0 && !gisSettings.isDual ? "분석 옵션" : mapIdx !== 1 ? "화면01" : "화면02"}
				</h3>
				{mapIdx === 0 && (
					<BaseButton
						IconFirst={false}
						title="시각화 프리셋"
						color="outlined_gray"
						size="m"
						Icon={GoBack}
						onClick={() => {
							let newMaps: any = [...initialTempSettings.maps];
							newMaps[0] = { ...newMaps[0], startDate: Number(endDate), endDate: Number(endDate) };
							newMaps[1] = { ...newMaps[1], startDate: Number(endDate), endDate: Number(endDate) };

							setGisSettings({
								...initialTempSettings,
								regionName: tempSettings.regionName,
								regionCode: tempSettings.regionCode,
								regionNameArr: tempSettings.regionNameArr,
								regionCodeArr: tempSettings.regionCodeArr,
								isMainModalOpen: true,
								isSelfAnalysis: false,
								isMenuOpen: false,
								maps: newMaps,
							});
						}}
					/>
				)}
			</div>
			{mapIdx === 0 && (
				<Tab size="small" disabled={gisSettings.isDual}>
					{sortedSubMenu.map((sub) => (
						<TabItem
							size="small"
							key={sub.path}
							isActive={tempSettings.analysisType === orderForAnalysisType.indexOf(sub.path)}
							onClick={
								gisSettings.isDual
									? () => {}
									: () => {
											const newAnalysisType = orderForAnalysisType.indexOf(sub.path);
											if (newAnalysisType !== -1 && tempSettings.analysisType !== newAnalysisType) {
												// const endDate = JSON.parse(sessionStorage.getItem('info')!).endDate.slice(0, 6);
												// let newMapsForRange = [...tempSettings.maps];
												// newMapsForRange[0] = {...newMapsForRange[0], startDate: Number(endDate+`01`), endDate: Number(endDate+`07`)};
												// newMapsForRange[1] = {...newMapsForRange[1], startDate: Number(endDate+`01`), endDate: Number(endDate+`07`)};
												// let newMapsForMonth = [...tempSettings.maps];
												// newMapsForMonth[0] = {...newMapsForMonth[0], startDate: Number(endDate), endDate: Number(endDate)};
												// newMapsForMonth[1] = {...newMapsForMonth[1], startDate: Number(endDate), endDate: Number(endDate)};
												setTempSettings({
													// ...initialTempSettings,
													...tempSettings,
													analysisType: newAnalysisType as 0 | 1 | 2 | 3,
													// maps: newAnalysisType === 0 ? newMapsForRange : newMapsForMonth
												});
												setTabValue(newAnalysisType as 0 | 1 | 2 | 3);
											} else {
												setTabValue(newAnalysisType as 0 | 1 | 2 | 3);
											}
										}
							}
						>
							{sub.name}
						</TabItem>
					))}
				</Tab>
			)}
		</div>
	);
}
