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

"use client"

import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { useEffect, useState } from "react";
import DashboardContents from "./DashboardContents";

interface DashboardProps {
    startEnd: [{
        START: string, END: string,
    }]
}

export default function DashboardContainerProps({startEnd}: DashboardProps) {
    let dataInfo;
    if (JSON.parse(sessionStorage.getItem('info')!)) {
        dataInfo = JSON.parse(sessionStorage.getItem('info')!);
    } else {
        const formatDateToData = (start: string, end: string): {startDate: string, endDate: string, yyyymm: string} => {
            let startMonth = (parseInt(start.slice(4, 6), 10)).toString().padStart(2, '0');            
            let endMonth = (parseInt(end.slice(4, 6), 10)).toString().padStart(2, '0');
            let startYear = start.slice(0, 4);
            let endYear = end.slice(0, 4);
            let endDay = end.slice(6, 8).padStart(2, '0');
    
            return { startDate: `${startYear}${startMonth}01`, endDate: endYear+endMonth+endDay, yyyymm: endYear+endMonth };
        }
        const temp = formatDateToData(startEnd[0].START, startEnd[0].END);
        sessionStorage.setItem('info', JSON.stringify(temp));
        dataInfo = temp;
    }
    const [selectedDate, setSelectedDate] = useState<string>(dataInfo.yyyymm);

    // useEffect(() => {
    //     setSelectedDate(dataInfo.yyyymm);
    // }, []);
    
    const { useRegionInfoQuery } = useRegionInfo();
    const { data, isLoading } = useRegionInfoQuery(selectedDate);
    const [regionInfo, setRegionInfo] = useState<Record<string, RegionInfo>>();
    useEffect(() => {
        if (data) {
            setRegionInfo(data.regionInfo);
        }
    }, [data]);

	return regionInfo && <DashboardContents regionInfo={regionInfo} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
}