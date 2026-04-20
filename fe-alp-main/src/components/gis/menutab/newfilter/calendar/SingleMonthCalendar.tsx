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

import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { FaChevronDown } from "react-icons/fa";
import { endOfMonth, startOfMonth } from "date-fns";
import useOutsideClick from "@/hooks/useOutsideClick";
import { format } from "date-fns";
import { numberToDate } from "@/libs/gisOptionFunc";
import { useDateRangeStore } from "@/store/dateRange";

interface SingleMonthCalendarProps {
	mapIdx?: 0 | 1;
	onDateChange?: (startDate: Date, endDate: Date) => void;
	placeholder?: string;
	dateFormat?: string;
	locale?: Locale;
	readOnly?: boolean;
	customClassName?: string;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
	setDate: any;
	isFop?: boolean;
}

export default function SingleMonthCalendar({
	mapIdx = 0,
	onDateChange,
	placeholder = "월 선택",
	dateFormat = "yyyy년 MM월",
	locale = ko,
	readOnly = true,
	customClassName = "w-full border p-2 cursor-default",
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	setDate,
	isFop,
}: Readonly<SingleMonthCalendarProps>) {
	const dateRange = useDateRangeStore((s)=> s.dateRange);	
	const endMonth = JSON.parse(sessionStorage.getItem("info")!).endDate.slice(0, 6) + `01`;
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	useOutsideClick(wrapperRef, () => setIsOpen(false));
	const [selectedDate, setSelectedDate] = useState<Date | null>(numberToDate(Number(endMonth)));
	// 격자50일 때 월 초기화
	const yyyymm = JSON.parse(sessionStorage.getItem("info")!).yyyymm;
	useEffect(() => {
		if (setTempSettings && tempSettings?.analysisType === 0 && tempSettings.gridScale === 0.05) {
			setSelectedDate(numberToDate(Number(endMonth)));
			setTempSettings((prev) => ({
				...prev,
				maps: [
					{ ...prev.maps[0], startDate: yyyymm, endDate: yyyymm },
					{ ...prev.maps[1], startDate: yyyymm, endDate: yyyymm },
				],
			}));
		}
	}, [tempSettings?.analysisType, tempSettings?.gridScale]);

	const handleChange = (date: Date | null) => {
		if (date) {
			setSelectedDate(date);

			tempSettings
				? setTempSettings?.({
						...tempSettings,
						maps: tempSettings.maps.map((map, index) =>
							index === mapIdx
								? {
										...map,
										startDate: parseInt(format(startOfMonth(date), "yyyyMM")),
										endDate: parseInt(format(endOfMonth(date), "yyyyMM")),
									}
								: map,
						),
					})
				: setGisSettings((prev) => ({
						...prev,
						maps: prev.maps.map((map, index) =>
							index === mapIdx
								? {
										...map,
										startDate: parseInt(format(startOfMonth(date), "yyyyMM")),
										endDate: parseInt(format(endOfMonth(date), "yyyyMM")),
									}
								: map,
						),
					}));

			const startDate = startOfMonth(date);
			const endDate = endOfMonth(date);
			if (onDateChange) {
				onDateChange(startDate, endDate);
			}
		}
		setDate(date);
		setIsOpen(false);
	};

	const handleButtonClick = () => {
		setIsOpen(!isOpen);
	};

	//격자50일때 최대 조회 가능 범위 1개월
	const getFopMonth = (date: Date): Date => {
		let year = date.getFullYear();
		let month = date.getMonth();
		// month -= 2;
		if (month <= 0) {
			year -= 1;
			month += 12;
		}
		return new Date(year, month, 1);
	};

	return (
		<div
			ref={wrapperRef}
			className={`relative mt-4 flex min-w-72 items-center justify-between ${customClassName}`}
		>
			<DatePicker
				placeholderText={placeholder}
				selected={selectedDate}
				onChange={handleChange}
				dateFormat={dateFormat}
				showMonthYearPicker
				locale={locale}
				className="w-full cursor-default border-[#e5e7eb] focus:outline-none"
				open={isOpen}
				popperPlacement="bottom"
				readOnly={readOnly}
				onInputClick={handleButtonClick}
				minDate={
					isFop || tempSettings?.gridScale === 0.05
						? getFopMonth(dateRange.maxDate)
						: dateRange.minDate
				}
				maxDate={dateRange.maxDate}
			/>
			<button
				onClick={handleButtonClick}
				type="button"
				className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-500 focus:outline-none"
			>
				<FaChevronDown />
			</button>
		</div>
	);
}
