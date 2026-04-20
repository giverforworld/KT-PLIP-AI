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

import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import useOutsideClick from "@/hooks/useOutsideClick";
import IconArrowTop from "@images/arrow.svg";
import { useDateRangeStore } from "@/store/dateRange";

interface MonthSelectorProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	onDateChange?: (startDate: Date, endDate: Date) => void;
	placeholder?: string;
	dateFormat?: string;
	locale?: Locale;
	readOnly?: boolean;
	customClassName?: string;
	selectedMonth: Date;
	setSelectMonth: Dispatch<SetStateAction<Date>>;
	setSelectedDate?: (date: string) => void;
	setDate: any;
	setSelectedRegion?:any;
	user?:any;
}

export default function MonthSelector({
	searchFilterState,
	setSearchFilterState,
	placeholder = "월 선택",
	dateFormat = "yyyy. MM",
	locale = ko,
	readOnly = true,
	selectedMonth,
	setSelectMonth,
	setSelectedDate,
	setDate,
	setSelectedRegion,
	user
}: Readonly<MonthSelectorProps>) {
	const { selectedDate } = searchFilterState;
	const dateRange = useDateRangeStore((s)=> s.dateRange);
	
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	useOutsideClick(wrapperRef, () => setIsOpen(false));

	const handleChange = (date: Date | null) => {
		if (date) {
			setSearchFilterState((prev) => ({ ...prev, selectedDate: date, isInflowRca: false }));
			setSelectMonth(date);
			const formatToYYYYMM = (date: Date): string => {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, "0");
				return `${year}${month}`;
			};
			if (setSelectedDate) {
				if (setSelectedRegion && user) {
					setSelectedRegion({
						regionname: user.baseRegion.sgg.name,
						regioncode: user.baseRegion.sgg.code.slice(0, 2) === '51' && Number(selectedMonth)<202307 ? '42'+user.baseRegion.sgg.code.slice(2)
						 : user.baseRegion.sgg.code.slice(0, 2) === '52' && Number(selectedMonth)<202403 ? '45'+user.baseRegion.sgg.code.slice(2)
						 : user.baseRegion.sgg.code,
						sggName: user.baseRegion.sgg.name,
					})
				}
				setSelectedDate(formatToYYYYMM(date));
			}
			if (setDate) {
				setDate(date);
			}
		}
		setIsOpen(false);
	};

	const handleButtonClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div
			ref={wrapperRef}
			className={`monthSelector relative flex h-full w-full items-center justify-between dark:text-[#DDDDDD]`}
		>
			<DatePicker
				placeholderText={placeholder}
				// selected={selectedDate}
				selected={selectedMonth}
				onChange={handleChange}
				dateFormat={dateFormat}
				showMonthYearPicker
				locale={locale}
				className="flex h-full w-full cursor-pointer rounded-lg border pl-2 pr-1 focus:outline-none dark:border-[#777777] dark:bg-darkModeBackGary"
				open={isOpen}
				popperPlacement="bottom"
				readOnly={readOnly}
				onInputClick={handleButtonClick}
				minDate={dateRange.minDate}
				maxDate={dateRange.maxDate}
			/>
			{/* <button
				onClick={handleButtonClick}
				type="button"
				className={`absolute right-1 top-1/2 -translate-y-1/2 transform focus:outline-none ${isOpen ? "" : "rotate-180"}`}
			>
				<IconArrowTop />
			</button> */}
			<IconArrowTop
				onClick={handleButtonClick}
				className={`absolute right-1 top-1/2 -translate-y-1/2 transform focus:outline-none ${isOpen ? "" : "rotate-180"}`}
			/>
		</div>
	);
}
