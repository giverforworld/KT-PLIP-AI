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

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import InputWrapper from "@/components/forms/InputWrapper";
import MonthSelector from "./selectors/MonthSelector";
import DateRangeSelector from "./selectors/DateRangeSelector";
// import useGetData from "@/hooks/queries/useGetData";
import { useDateRangeStore } from "@/store/dateRange";

interface DateSelectorContainerProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	onlyMonth?: boolean;
	labelColor?: string;
	setSelectedDate?: (date: string) => void;
	setDate?: any;
	setSelectedRegion?: Dispatch<
		SetStateAction<{ regionname: string; regioncode: string; sggName: string }>
	>;
	user?:any;
}

export default function DateSelectorContainer({
	searchFilterState,
	setSearchFilterState,
	onlyMonth = false,
	labelColor,
	setSelectedDate,
	setDate,
	setSelectedRegion,
	user,
}: DateSelectorContainerProps) {
	const { dateSelector } = searchFilterState;
	const dateRange = useDateRangeStore((s)=> s.dateRange);
	const setDateRange = useDateRangeStore(s=> s.setDateRange)
	
	// const { useDataInfoQuery } = useGetData();
	// const { data, isLoading } = useDataInfoQuery();
	const data = JSON.parse(sessionStorage.getItem('info')!);
	const stringToDate = (date: string): Date => {
		let year = date.slice(0, 4);
		let month = date.slice(4, 6);
		let day = date.slice(6, 8);
		return new Date(`${year}, ${month}, ${day}`);
	}
	const [ selectedMonth, setSelectedMonth ] = useState(stringToDate(data.endDate));
	const [ selectedPeriod, setSelectedPeriod ] = useState<{startDate: Date, endDate: Date}>({
		startDate: new Date(),
		endDate: new Date(),
	});
	useEffect(() => {
		// if (data) {			
			// '20241231'을 2024,12,31로 변환
			const formatDate = (date: string): string => {
				const year = date.slice(0, 4);
				const month = parseInt(date.slice(4, 6), 10).toString();
				const day = date.slice(6, 8);
				return `${year},${month},${day}`;
			}
			const start = formatDate(data.startDate);
			const end = formatDate(data.endDate);
			setDateRange({minDate: new Date(start), maxDate: new Date(end)});

			// 20241231을 startDate와 endDate로 
			const formatDateToData = (date: string): { startDate: Date, endDate: Date } => {
				let month = (parseInt(date.slice(4, 6), 10)).toString();
				let year = date.slice(0, 4);
				return { startDate: new Date(`${year},${month},1`), endDate: new Date(`${year},${month},7`) };
			}
			const periodDate = formatDateToData(data.endDate);

			setSearchFilterState((prev) => ({ ...prev, selectedDate:periodDate.startDate, selectedRange: { startDate:periodDate.startDate, endDate:periodDate.endDate } }));
			setSelectedMonth(periodDate.startDate);
			setSelectedPeriod({startDate:periodDate.startDate, endDate:periodDate.endDate});
			
		// }
	}, []);

	const onToggle = (e: React.MouseEvent<HTMLElement>, selected: string) => {
		e.preventDefault();
		setSearchFilterState((prev) => ({ ...prev, dateSelector: selected as DateSelectorType }));
	};

	return (
		<InputWrapper
			label="기간조회"
			name="date"
			toggleLabels={!onlyMonth ? ["월별", "기간별"] : undefined}
			onToggle={!onlyMonth ? onToggle : undefined}
			labelColor={labelColor}
			dateSelector={dateSelector}
		>
			{onlyMonth || dateSelector === "월별" ? (
				<MonthSelector
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
					selectedMonth={selectedMonth}
					setSelectMonth={setSelectedMonth}
					setSelectedDate={setSelectedDate}
					setDate={setDate}
					setSelectedRegion={setSelectedRegion}
					user={user}
				/>
			) : (
				<DateRangeSelector
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
					selectedPeriod={selectedPeriod}
				/>
			)}
		</InputWrapper>
	);
}
