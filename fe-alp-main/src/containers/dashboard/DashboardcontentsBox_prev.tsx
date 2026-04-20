// /* 
// * ALP version 1.0

// * Copyright © 2024 kt corp. All rights reserved.

// * 

// * This is a proprietary software of kt corp, and you may not use this file except in

// * compliance with license agreement with kt corp. Any redistribution or use of this

// * software, with or without modification shall be strictly prohibited without prior written

// * approval of kt corp, and the copyright notice above does not evidence any actual or

// * intended publication of such software.

// */

// "use client";

// import { useContext, useEffect, useState } from "react";
// import { dateFormat } from "@/utils/date";
// import { searchFilterStateDefaultValue } from "@/context/defaultValues";
// import useGetData from "@/hooks/queries/useGetData";
// import DashboardContents from "./DashboardContents";

// interface DashboardContentsBoxProps {
// 	regionInfo: Record<string, RegionInfo>;
// }

// export default function DashboardContentsBox({ regionInfo }: DashboardContentsBoxProps) {
//     const [selectedDate, setSelectedDate] = useState<string>('');
//     const { useDataInfoQuery } = useGetData();
//     const { data, isLoading: infoLoading } = useDataInfoQuery();
//     useEffect(() => {
//         if (data) {
//             const end = data.data.data[0].END;
//             const formatDateToData = (date: string): Date => {
//                 let month = (parseInt(date.slice(4, 6), 10)).toString();
//                 let year = date.slice(0, 4);
//                 return new Date(`${year},${month},1`);
//             }
//             const endDate = formatDateToData(end);
//             const selectedDate = dateFormat(endDate, "yyyyMM");
//             setSelectedDate(selectedDate);
//         }
//     }, [data]);

//     return (
//         selectedDate && <DashboardContents selectedDate={selectedDate} setSelectedDate={setSelectedDate} regionInfo={regionInfo} />
//     )
// }