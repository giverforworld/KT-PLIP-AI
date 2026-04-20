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

import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import useGetData from "@/hooks/queries/useGetData";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import Spinner from "@/components/loading/Spinner";
import ContentHeader from "@/components/text/ContentHeader";
import HelperText from "@/components/text/HelperText";
import DateSelectorContainer from "../common/search/DateSelectorContainer";
import DashboardMenu from "./DashboardMenu";
import DashboardMap from "./DashboardMap";
import DashboardCard from "./DashboardCard";
import DataContainer from "../common/data/DataContainer";
import { UserContext } from "@/context/UserProviderContainer";

interface DashboardContentsProps {
	regionInfo: Record<string, RegionInfo>;
	selectedDate: string;
	setSelectedDate: (date: string) => void;
}

export default function DashboardContents({
	regionInfo,
	selectedDate,
	setSelectedDate,
}: DashboardContentsProps) {
	const pathname = usePathname();
	const pageName = pathname.split("/")[1];

	const context = useContext(UserContext);
	if (!context) {
		throw new Error("Header must be used within a UserProderContainer");
	}
	const { user } = context;
	const [searchFilterState, setSearchFilterState] = useState(searchFilterStateDefaultValue);

	const tabList: { key: DashboardMapTabKey; name: string }[] = [
		{ key: "mopInflow", name: "유입인구" },
		{ key: "mopOutflow", name: "유출인구" },
		{ key: "alp", name: "생활인구" },
		{ key: "llp", name: "체류인구" },
	];
	const [activeTab, setActiveTab] = useState(tabList[0]);
	const [selectedSido, setSelectedSido] = useState<{ sidoCode: string; sidoName: string }>({
		sidoCode: "",
		sidoName: "",
	});

	const { useDashboardsQuery } = useGetData();
	const { data: dashboardResult, isLoading } = useDashboardsQuery(selectedDate);

	useEffect(() => {
		if (user) {
			setSelectedSido({ sidoCode: user.baseRegion.sido.code, sidoName: user.baseRegion.sido.name });
		}
	}, [user]);

	useEffect(() => {
		if (selectedSido.sidoCode === '51' && Number(selectedDate) < 202307) {
			setSelectedSido({
				sidoCode: '42',
				sidoName: '강원도'
			})
		}
		if (selectedSido.sidoCode === '52' && Number(selectedDate) < 202403) {
			setSelectedSido({
				sidoCode: '45',
				sidoName: '전라북도'
			})
		}
		if (selectedSido.sidoCode === '42' && Number(selectedDate) > 202306) {
			setSelectedSido({
				sidoCode: '51',
				sidoName: '강원특별자치도'
			})
		}
		if (selectedSido.sidoCode === '45' && Number(selectedDate) > 202402) {
			setSelectedSido({
				sidoCode: '52',
				sidoName: '전북특별자치도'
			})
		}
	}, [selectedDate])
	return (
		<div className="custom-scrollbar h-full overflow-y-auto">
			<Wrapper>
				<h2 className="my-2 text-2xl font-semibold text-primary">광역시도별 종합현황분석</h2>
				<div className="flex items-end justify-between">
					<div className="w-[280px]">
						<DateSelectorContainer
							searchFilterState={searchFilterState}
							setSearchFilterState={setSearchFilterState}
							setSelectedDate={setSelectedDate}
							onlyMonth
						/>
					</div>
					{user && <DashboardMenu regionInfo={regionInfo} userInfo={user} pageName={pageName} />}
				</div>
			</Wrapper>

			<div className="mx-auto flex w-9/12 max-w-[1280px] grow flex-col gap-6 py-6">
				{/* Map & Cards Area */}
				<div className="grid grid-cols-[1fr_2fr] gap-4">
					<div className="flex flex-col">
						<div className="flex justify-between">
							<h3 className="text-lg font-semibold">전국 시도별 인구</h3>
							<Tab type="line" size="small" width="w-[240px]">
								{tabList.map((item) => (
									<TabItem
										key={item.key}
										type="line"
										size="small"
										isActive={activeTab.key === item.key}
										onClick={() => setActiveTab(item)}
									>
										{item.name}
									</TabItem>
								))}
							</Tab>
						</div>
					</div>
					<div className="flex items-center">
						<HelperText text="지도의 광역시도명을 클릭하면 해당 지역의 주요 지표로 변경됩니다." />
					</div>

					{/* Map */}
					<div className="relative h-[450px] w-full border bg-whiteGray">
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<Spinner />
							</div>
						) : (
							<DashboardMap
								regionInfo={regionInfo}
								start={selectedDate}
								selectedSido={selectedSido}
								setSelectedSido={setSelectedSido}
								data={dashboardResult}
								activeTabKey={activeTab.key}
							/>
						)}
					</div>

					{/* Cards */}
					<div className="flex flex-col gap-4 border-b">
						<ContentHeader title={`${selectedSido.sidoName} 주요 지표`} textAlign="text-center" />
						<div className="gird-rows-[1fr_1fr] grid h-full grid-cols-2 gap-4">
							{Array.from({ length: 4 }).map((_, index) => {
								return (
									<DashboardCard
										key={index}
										data={dashboardResult}
										index={index}
										isLoading={isLoading}
										selectedSidoCode={selectedSido.sidoCode}
										activeTabKey={activeTab.key}
										selectedDate={selectedDate}
									/>
								);
							})}
						</div>
					</div>
				</div>

				{/* Data Containers */}
				{dashboardResult && <DataContainer data={dashboardResult.data} hasBookmark={false} />}
			</div>
		</div>
	);
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="border-b border-t bg-backGray py-4">
			<div className="m-auto flex w-9/12 max-w-[1280px] flex-col gap-4">{children}</div>
		</div>
	);
};
