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

import { useEffect, useState } from "react";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import GIScontainer from "./GisContainer";

interface GisContainerProps {
	startEnd: [
		{
			START: string;
			END: string;
		},
	];
}

export default function GISContainerBox({ startEnd }: GisContainerProps) {
	let dataInfo;
	let rangeDate;
	const formatDateToData = (
		start: string,
		end: string,
	): { startDate: string; endDate: string; yyyymm: string } => {
		let startMonth = parseInt(start.slice(4, 6), 10).toString().padStart(2, "0");
		let endMonth = parseInt(end.slice(4, 6), 10).toString().padStart(2, "0");
		let startYear = start.slice(0, 4);
		let endYear = end.slice(0, 4);
		let endDay = end.slice(6, 8).padStart(2, "0");

		return {
			startDate: `${startYear}${startMonth}01`,
			endDate: endYear + endMonth + endDay,
			yyyymm: endYear + endMonth,
		};
	};
	if (JSON.parse(sessionStorage.getItem("info")!)) {
		dataInfo = JSON.parse(sessionStorage.getItem("info")!);
		rangeDate = formatDateToData(startEnd[0].START, startEnd[0].END);
	} else {
		const temp = formatDateToData(startEnd[0].START, startEnd[0].END);
		sessionStorage.setItem("info", JSON.stringify(temp));
		dataInfo = temp;
		rangeDate = formatDateToData(startEnd[0].START, startEnd[0].END);
	}

	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(dataInfo.yyyymm);
	const [regionInfo, setRegionInfo] = useState<Record<string, RegionInfo>>();
	useEffect(() => {
		if (data) {
			setRegionInfo(data.filteredInfo);
		}
	}, [data]);

	return regionInfo && <GIScontainer rangeDate={rangeDate} regionInfo={regionInfo} />;
}
