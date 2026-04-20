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

import { useRef } from "react";
import { SetterOrUpdater } from "recoil";
import { useShowToast } from "@/hooks/useToastShow";
import SelectorInput from "./SelectorInput";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { addDays, startOfDay } from "date-fns";
import { dateFormat } from "@/utils/date";

interface DateRangeSelectorProps {
	searchFilter: SearchFilter;
	setSearchFilter: SetterOrUpdater<SearchFilter>;
}

// CHECKED_20241030: 해당 컴포넌트 사용하지 않음
export default function DateRangeSelectorOLD({
	searchFilter,
	setSearchFilter,
}: DateRangeSelectorProps) {
	// const showToast = useShowToast();
	// const endDatePickerRef = useRef<DatePicker>(null);
	// let maxDay: number = 90;
	// const today = startOfDay(new Date());
	// const maxDate = searchFilter.startDate ? addDays(searchFilter.startDate, maxDay) : undefined;
	// const handleDayClick = (date: Date) => {
	// 	if (maxDate && date > maxDate) {
	// 		showToast(`최대 ${maxDay}일 선택 가능합니다.`, "info");
	// 	}
	// };
	// const handleStartDateChange = (date: Date | null) => {
	// 	const newStartDate = date ?? undefined;
	// 	if (newStartDate) {
	// 		const newEndDate = addDays(newStartDate, maxDay); // startDate의 90일 뒤
	// 		setSearchFilter((prev) => ({
	// 			...prev,
	// 			startDate: newStartDate,
	// 		}));
	// 		setSearchFilter((prev) => ({
	// 			...prev,
	// 			endDate: newEndDate > today ? today : newEndDate,
	// 		}));
	// 	}
	// 	// startDate를 선택한 후 곧바로 endDate의 달력을 열도록 설정
	// 	if (endDatePickerRef.current) {
	// 		endDatePickerRef.current.setOpen(true);
	// 	}
	// };
	// const handleEndDateChange = (date: Date | null) => {
	// 	const newEndDate = date ?? undefined;
	// 	if (newEndDate) {
	// 		setSearchFilter((prev) => ({
	// 			...prev,
	// 			endDate: newEndDate,
	// 		}));
	// 	}
	// };
	// return (
	// 	<div className="date-range-selector flex h-full w-full items-center">
	// 		<DatePicker
	// 			locale={ko}
	// 			selected={searchFilter.startDate}
	// 			onChange={handleStartDateChange}
	// 			startDate={searchFilter.startDate}
	// 			endDate={searchFilter.endDate}
	// 			selectsStart
	// 			minDate={undefined} // 시작일은 오늘 이후로 설정하지 않음
	// 			maxDate={today}
	// 			customInput={
	// 				<SelectorInput type="DateRangeSelector">
	// 					{searchFilter.startDate ? dateFormat(searchFilter.startDate) : "날짜 선택"}
	// 				</SelectorInput>
	// 			}
	// 			renderDayContents={(day, date) => (
	// 				<div
	// 					onClick={() => handleDayClick(date)}
	// 					className={`day-content ${
	// 						searchFilter.startDate && date < searchFilter.startDate ? "disabled" : ""
	// 					}`}
	// 				>
	// 					{day}
	// 				</div>
	// 			)}
	// 		/>
	// 		<span className="mx-1">-</span>
	// 		<DatePicker
	// 			locale={ko}
	// 			selected={searchFilter.endDate}
	// 			onChange={handleEndDateChange}
	// 			startDate={searchFilter.startDate}
	// 			endDate={searchFilter.endDate}
	// 			selectsEnd
	// 			minDate={searchFilter.startDate}
	// 			maxDate={maxDate! > today ? today : maxDate}
	// 			customInput={
	// 				<SelectorInput type="DateRangeSelector">
	// 					{searchFilter.endDate ? dateFormat(searchFilter.endDate) : "날짜 선택"}
	// 				</SelectorInput>
	// 			}
	// 			ref={endDatePickerRef}
	// 			renderDayContents={(day, date) => (
	// 				<div
	// 					onClick={() => handleDayClick(date)}
	// 					className={`day-content ${
	// 						searchFilter.startDate && date < searchFilter.startDate ? "disabled" : ""
	// 					}`}
	// 				>
	// 					{day}
	// 				</div>
	// 			)}
	// 		/>
	// 	</div>
	// );
}
