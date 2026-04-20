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
import React from "react";
import Info from "@images/info.svg";
import RegionFilter from "../newfilter/RegionFilter";
import PeriodFilter from "../newfilter/PeriodFilter";
import SexAgeFilter from "../newfilter/SexAgeFilter";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { changeDateToString, getFirstDayOfMonth } from "@/utils/date";
import { GisRegionSelectorContainerSkeleton } from "@/containers/common/search/skeleton/GisRegionSelectorContainerSkeleton";
import { UserContext } from "@/context/UserProviderContainer";
import { filterGisRegionInfo } from "@/services/filterRegionInfo";

interface FlpOptionBoxProps {
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings: GisSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	handleSearchClick: () => void;
	date: Date;
	setDate: any;
}

export default function FlpOptionBox({
	mapIdx = 0,
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	handleSearchClick,
	date,
	setDate,
}: Readonly<FlpOptionBoxProps>) {
	const isFlpOptionBoxValid = () => {
		const { regionCode } = gisSettings;
		const { startDate, endDate } = gisSettings.maps[mapIdx];
		return startDate !== undefined && endDate !== undefined && regionCode;
	};
	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(
		changeDateToString(getFirstDayOfMonth(date)).toString().slice(0, 6),
	);
	const isFop = true;

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
		<div className="custom-scrollbar flex flex-grow flex-col gap-2 overflow-y-auto border-t border-t-[#F7F8F9] bg-[#F7F8F9]">
			<div className="flex items-center justify-center bg-[#F7F8F9] p-2 text-center text-[13px] text-textLightGray">
				<Info />
				<span>유동인구 : 50m*50m 단위로 매시간 중복을 허용한 보행인구 유동량</span>
			</div>
			{data && filteredInfo ? (
				<RegionFilter
					{...{
						// regionInfo: data?.filteredInfo,
						regionInfo: filteredInfo,
						gisSettings,
						setGisSettings,
						tempSettings,
						setTempSettings,
					}}
				/>
			) : (
				<GisRegionSelectorContainerSkeleton />
			)}
			<PeriodFilter
				{...{ gisSettings, setGisSettings, tempSettings, setTempSettings, setDate, isFop }}
			/>
			<SexAgeFilter {...{ gisSettings, setGisSettings, tempSettings, setTempSettings }} />

			<div className="bt-[#e4e4e4] sticky bottom-0 z-20 border-t bg-white p-4">
				<BaseButton
					title={"분석하기"}
					fullWidth
					disabled={!isFlpOptionBoxValid()}
					onClick={handleSearchClick}
				/>
			</div>
		</div>
	);
}
