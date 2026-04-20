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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import useGetData from "@/hooks/queries/useGetData";
import ThemeToggle from "@/components/buttons/ThemeToggle";
import RoundedBox from "@/components/boxes/RoundedBox";
import DateSelectorContainer from "../common/search/DateSelectorContainer";
import RegionSelectorContainer from "../common/search/RegionSelectorContainer";
import { generateUniqueId } from "@/utils/generate";
import { getEndDayOfMonth, getFirstDayOfMonth, dateFormat } from "@/utils/date";
import { getRegionCodes } from "@/utils/query";
import RegDasChartLeftContainer from "./RegDasChartLeftContainer";
import RegDasChartRightContainer from "./RegDasChartRightContainer";
import RegDashboardMapContainer from "./map/RegDashboardMapContainer";
import Dimmed from "@/components/modals/Dimmed";
import ReportSpinner from "@/components/loading/ReportSpinner";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import useUser from "@/hooks/queries/useUser";
import { useThemeStore } from "@/store/theme";

interface RegionalDashboardContentsProps {
	regionInfo: Record<string, RegionInfo>;
	user: User;
	selectedDate: string;
	setSelectedDate: any;
	RegDasChartData:any;
	isRegDasResultLoading:any;
	selectedRegion:any;
	setSelectedRegion:Dispatch<
		SetStateAction<{ regionname: string; regioncode: string; sggName: string }>
	>;
}

export default function RegionalDashboardContents({
	regionInfo,
	user,
	selectedDate,
	setSelectedDate,
	RegDasChartData,
	isRegDasResultLoading,
	selectedRegion,
	setSelectedRegion,
}: RegionalDashboardContentsProps) {
	useEffect(() => {
		setSearchFilterState((prev) => ({
			...prev,
			displayRegions: [
				{
					sido: {
						name: user.baseRegion.sido.name,
						code: user.baseRegion.sido.code,
					},
					sgg: { name: "", code: "" },
					adm: { name: "", code: "" },
				}
			]
		}))
	}, [selectedDate])
	const theme = useThemeStore((s)=> s.theme);
	
	let y = Number(selectedDate.slice(0, 4));
	let m = Number(selectedDate.slice(4, 6));
	let newDate = new Date(y, m, 1);
	
	const [searchFilterState, setSearchFilterState] = useState({
		...searchFilterStateDefaultValue,
		selectedDate: newDate,
		displayRegions: [
			{
				sido: {
					name: user.baseRegion.sido.name,
					code: user.baseRegion.sido.code,
				},
				sgg: { name: "", code: "" },
				adm: { name: "", code: "" },
			},
		],
	});
	const { displayRegions } = searchFilterState;
	// 회원 조건에 따른 지역
	let filteredInfo = filterRegionInfo(regionInfo, user.baseInfo || 0, user.apdInfo || []);
	if (user.baseInfo.toString().length === 5) {
		const noSidoFiltered = Object.entries(filteredInfo).filter((item:any) => item[0].length !== 2);
		filteredInfo = Object.fromEntries(noSidoFiltered);
	}	
	useEffect(() => {
		const newId = generateUniqueId();
		setRegionSelectors([newId]);
	}, []);

	const [regionSelectors, setRegionSelectors] = useState<string[] | null>([]);
	const [isInitialLoading, setIsInitialLoading] = useState(true);

	useEffect(() => {
		if (!isRegDasResultLoading && isInitialLoading) {
			setIsInitialLoading(false);
		}
	}, [isRegDasResultLoading, isInitialLoading]);
	return (
		<div className="flex h-[100vh] flex-col bg-[#f7f7f7] p-8 pt-0 dark:bg-darkModeBackGary">
			<header className="flex h-[50px] w-full items-center justify-end">
				<ThemeToggle />
			</header>
			{isInitialLoading && <RegDasLoadingDimmed message="데이터를 불러오는 중입니다." />}
			<div className="flex h-[calc(100vh-50px)] w-full justify-between gap-8 overflow-hidden max-md:flex-wrap">
				<section className={(theme === "dark" ? "dark" : "custom-scrollbar") +" flex w-full flex-col overflow-y-auto md:w-[30%]"}>
					<RegDasChartLeftContainer data={RegDasChartData} selectedRegion={selectedRegion} />
				</section>

				<section className="flex w-full flex-col gap-4 max-md:order-first md:w-[38%]">
					<h1 className="break-keep text-center text-4xl font-bold">
						<span className="text-primary">{user.baseInfo.toString().length === 5 ? user.baseRegion.sgg.name : displayRegions[0].sido.name} </span>{" "}
						<span className="dark:text-white">생활이동 상황판</span>
					</h1>

					{/* 기간 및 지역 선택 */}
					<div className="grid grid-cols-2 gap-4">
						<DateSelectorContainer
							searchFilterState={searchFilterState}
							setSearchFilterState={setSearchFilterState}
							onlyMonth
							labelColor="text-primary"
							setSelectedDate={setSelectedDate}
							setSelectedRegion={setSelectedRegion}
							user={user}
						/>
						<RegionSelectorContainer
							regionSelectors={regionSelectors ?? []}
							setRegionSelectors={setRegionSelectors}
							searchFilterState={searchFilterState}
							setSearchFilterState={setSearchFilterState}
							regionInfo={filteredInfo}
							hasAddRegionButton={false}
							isSggRender={false}
							labelColor="text-primary"
						/>
					</div>

					<div className="flex h-full w-full overflow-hidden">
						<RoundedBox
							bgColor="bg-white"
							padding="p-0"
							border
							darkMode={theme === "dark"}
							darkBgColor="bg-darkModeMapBackGray"
						>
							{user && (
								<RegDashboardMapContainer
									regionInfo={regionInfo}
									userInfo={user}
									displayRegionSidoCode={displayRegions[0].sido.code}
									setSelectedRegion={setSelectedRegion}
									selectedDate={selectedDate}
								/>
							)}
						</RoundedBox>
					</div>
				</section>

				<section className={(theme === "dark" ? "dark" : "custom-scrollbar") +" flex w-full flex-col overflow-y-auto md:w-[30%]"}>
					<RegDasChartRightContainer data={RegDasChartData} selectedRegion={selectedRegion} />
				</section>
			</div>
		</div>
	);
}

export const RegDasLoadingDimmed = ({ message }: { message: string }) => {
	return (
		<Dimmed>
			<div className="flex flex-col items-center justify-center pt-2 text-xl font-bold text-white">
				<ReportSpinner />
				<span className="mt-6">{message}</span>
				<span>잠시만 기다려 주세요.</span>
			</div>
		</Dimmed>
	);
};
