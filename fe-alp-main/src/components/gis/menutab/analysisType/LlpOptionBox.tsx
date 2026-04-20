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
import * as React from "react";
import BaseButton from "@/components/buttons/BaseButton";
import Info from "@images/info.svg";
import RegionFilter from "../newfilter/RegionFilter";
import PeriodFilter from "../newfilter/PeriodFilter";
import SexAgeFilter from "../newfilter/SexAgeFilter";
import LocalFilter from "../newfilter/LocalFilter";
import GisSubMenuTab from "@/containers/gis/new/GisSubMenuTab";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { changeDateToString, getFirstDayOfMonth } from "@/utils/date";
import { GisRegionSelectorContainerSkeleton } from "@/containers/common/search/skeleton/GisRegionSelectorContainerSkeleton";
import { filterGisRegionInfo } from "@/services/filterRegionInfo";
import { UserContext } from "@/context/UserProviderContainer";

interface LlpOptionBoxProps {
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	handleSearchClick: () => void;
	date: Date;
	setDate: any;
}

export default function LlpOptionBox({
	mapIdx = 0,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	handleSearchClick,
	date,
	setDate,
}: Readonly<LlpOptionBoxProps>) {
	const [activeSubOption, setActiveSubOption] = React.useState(gisSettings.analysisSubType);
	const options: { value: 0 | 1; label: string; name: string }[] = [
		{ value: 0, label: "유입분석", name: "InflowAnalysis" },
		{ value: 1, label: "인구감소지역 비교", name: "PopulDecline" },
	];

	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(
		changeDateToString(getFirstDayOfMonth(date)).toString().slice(0, 6),
	);

	const [filteredInfo, setFilteredInfo] = React.useState<any>();
	
		const context = React.useContext(UserContext);
		if (!context) {
			throw new Error("GIScontainer must be used within a UserProderContainer");
		}
		const { user } = context;
	React.useEffect(() => {
		if (data) {
			const filtered = filterGisRegionInfo(data.regionInfo, user?.baseInfo.toString().slice(0, 2) === '51' && Number(tempSettings.maps[0].startDate.toString().slice(0, 6)) < 202307 
				? Number('42'+user.baseInfo.toString().slice(2))
				: user?.baseInfo.toString().slice(0, 2) === '52' && Number(tempSettings.maps[0].startDate.toString().slice(0, 6)) < 202403 
				? Number('45'+user.baseInfo.toString().slice(2))
				: user?.baseInfo.toString().slice(0, 2) === '42' && Number(tempSettings.maps[0].startDate.toString().slice(0, 6)) > 202306 
				? Number('51'+user.baseInfo.toString().slice(2))
				: user?.baseInfo.toString().slice(0, 2) === '45' && Number(tempSettings.maps[0].startDate.toString().slice(0, 6)) > 202402 
				? Number('52'+user.baseInfo.toString().slice(2))
				: user?.baseInfo!, 
			user?.apdInfo!);
			setFilteredInfo(filtered)
		}
	}, [data])
	return (
		<>
			<div
				className={`flex ${mapIdx === 0 ? "h-full" : "h-[calc(100%-215px)]"} flex-col gap-4 overflow-y-auto bg-[#F7F8F9]`}
			>
				{mapIdx === 0 && (
					<GisSubMenuTab
						{...{
							options,
							activeOption: activeSubOption,
							setActiveOption: setActiveSubOption,
							setTempSettings,
							gisSettings,
							setGisSettings,
						}}
					/>
				)}
				{activeSubOption === 1 && (
					<div className="flex items-center justify-center bg-[#F7F8F9] p-2 text-center text-[13px] text-textLightGray">
						<Info />
						<span>인구감소지역 비교의 경우 전국 인구감소지역이 모두 표출됩니다.</span>
					</div>
				)}
				{activeSubOption !== 1 && data && filteredInfo  ? (
					<RegionFilter
						isAdm
						// isSingleSelect
						gisSettingKey="inOutFlow"
						{...{
							mapIdx,
							regionInfo: filteredInfo,
							gisSettings,
							setGisSettings,
							...(mapIdx === 0 && { tempSettings, setTempSettings }),
						}}
					/>
				) : (
					activeSubOption !== 1 && <GisRegionSelectorContainerSkeleton />
				)}
				<PeriodFilter
					{...{ mapIdx, gisSettings, setGisSettings, tempSettings, setTempSettings, setDate }}
				/>
				<SexAgeFilter {...{ mapIdx, gisSettings, setGisSettings, tempSettings, setTempSettings }} />
				<LocalFilter {...{ mapIdx, gisSettings, setGisSettings, tempSettings, setTempSettings }} />
			</div>
			<div className="bt-[#e4e4e4] sticky bottom-0 z-20 border-t bg-white p-4">
				<BaseButton
					title={"분석하기"}
					fullWidth
					disabled={
						tempSettings.maps[mapIdx].isSearch && !tempSettings.maps[mapIdx].isSelectNewOption
					}
					onClick={handleSearchClick}
				/>
			</div>
		</>
	);
}