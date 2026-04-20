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
import RegionalDashboardContents, { RegDasLoadingDimmed } from "./RegionalDashboardContents";
import { useEffect, useState } from "react";
import useGetData from "@/hooks/queries/useGetData";

interface RegionalDashboardContainerProps {
	regionInfo: Record<string, RegionInfo>;
	selectedDate: string;
	setSelectedDate: (date: string) => void;
	user:any;
	isLoadingUser:any;
}

export default function RegionalDashboardContainer({
	regionInfo,
	selectedDate,
	setSelectedDate,
	user,
	isLoadingUser,
}: RegionalDashboardContainerProps) {
	const [selectedRegion, setSelectedRegion] = useState<{
		regionname: string;
		regioncode: string;
		sggName: string;
	}>({
		regionname: user.baseRegion.sgg.name,
		regioncode: user.baseRegion.sgg.code.slice(0, 2) === '51' && Number(selectedDate) < 202307 
			? '42'+user.baseRegion.sgg.code.slice(2) 
			: user.baseRegion.sgg.code.slice(0, 2) === '52' && Number(selectedDate) < 202403
			? '45'+user.baseRegion.sgg.code.slice(2) 
			: user.baseRegion.sgg.code,
		sggName: user.baseRegion.sgg.name,
	});
	const { useRegionalDashboardQuery } = useGetData();
	const { data: RegDasChartData, isLoading: isRegDasResultLoading } = useRegionalDashboardQuery(
		// start,
		selectedDate,
		selectedRegion.regioncode.slice(0,2) === '51' && Number(selectedDate)<202307 ?
		'42'+selectedRegion.regioncode.slice(2)
		: selectedRegion.regioncode.slice(0,2) === '52' && Number(selectedDate)<202403 ?
		'45'+selectedRegion.regioncode.slice(2)
		: selectedRegion.regioncode.slice(0,2) === '42' && Number(selectedDate)>202306 ?
		'51'+selectedRegion.regioncode.slice(2)
		: selectedRegion.regioncode.slice(0,2) === '45' && Number(selectedDate)>202401 ?
		'52'+selectedRegion.regioncode.slice(2)
		: selectedRegion.regioncode
	);

	if (isLoadingUser || !user) {
		return (
			<div className="flex h-[100vh] flex-col bg-[#f7f7f7] p-8 pt-0 dark:bg-darkModeBackGary">
				<RegDasLoadingDimmed message="데이터를 불러오는 중입니다." />
			</div>
		);
	}
	user = {
		...user,
		baseInfo: user.baseInfo.toString().slice(0, 2) === '51' && Number(selectedDate) < 202307 
			? '42'+user.baseInfo.toString().slice(2) 
			: user.baseInfo.toString() === '52' && Number(selectedDate) < 202403 
			? '45'+user.baseInfo.toString().slice(2)
			: user.baseInfo.toString(),
		baseRegion: {
			...user.baseRegion,
			sido: {
				code: user.baseRegion.sido.code === '51' && Number(selectedDate) < 202307 
					? '42' 
					: user.baseRegion.sido.code === '52' && Number(selectedDate) < 202403 
					? '45'
					:user.baseRegion.sido.code,
				name: user.baseRegion.sido.name === '강원특별자치도' && Number(selectedDate) < 202307 
					? '강원도' 
					: user.baseRegion.sido.name === '전북특별자치도' && Number(selectedDate) < 202403 
					? '전라북도'
					: user.baseRegion.sido.name,
			},
			sgg: {
				code: user.baseRegion.sgg.code.slice(0, 2) === '51' && Number(selectedDate) < 202307 
					? '42'+user.baseRegion.sgg.code.slice(2) 
					: user.baseRegion.sgg.code.slice(0, 2) === '52' && Number(selectedDate) < 202403 
					? '45'+user.baseRegion.sgg.code.slice(2) 
					: user.baseRegion.sgg.code,
				name: user.baseRegion.sgg.name
			}
		}
	};

	return <RegionalDashboardContents selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} RegDasChartData={RegDasChartData} 
		isRegDasResultLoading={isRegDasResultLoading} regionInfo={regionInfo} user={user} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>;
}
