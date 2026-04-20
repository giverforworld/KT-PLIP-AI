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

import React, { useState, useRef, Dispatch, SetStateAction, useEffect } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { ko } from "date-fns/locale";
import { addDays, differenceInDays, endOfMonth, isSameMonth, startOfMonth } from "date-fns";
import BaseButton from "@/components/buttons/BaseButton";
import IconArrowTop from "@images/arrow.svg";
import useOutsideClick from "@/hooks/useOutsideClick";
import { dateFormat } from "@/utils/date";
import { useDateRangeStore } from "@/store/dateRange";

interface DateRangeSelectorProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	onConfirm?: (range: { startDate: Date; endDate: Date }) => void;
	maxDate?: Date;
	selectedPeriod: { startDate: Date; endDate: Date };
}

export default function DateRangeSelector({
	searchFilterState,
	setSearchFilterState,
	onConfirm,
	maxDate = new Date(),
	selectedPeriod,
}: Readonly<DateRangeSelectorProps>) {
	const { selectedRange } = searchFilterState;

	const MAX_RANGE_DAYS = 7; // 최대 선택 가능 기간

	const initialState = [
		{
			startDate: selectedPeriod?.startDate,
			endDate: selectedPeriod?.endDate,
			key: "selection",
		},
	];

	const dateRange = useDateRangeStore((s)=> s.dateRange);	
	const [tempState, setTempState] = useState(initialState);
	const [confirmedState, setConfirmedState] = useState(initialState); // 확인 버튼 누를 때 반영할 상태
	const [showDatePicker, setShowDatePicker] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [confirmCheck, setContirmCheck] = useState(false);

	useEffect(() => {
		setTempState([
			{
				startDate: selectedPeriod.startDate,
				endDate: selectedPeriod.endDate,
				key: "selection",
			},
		]);
		setSearchFilterState({
			...searchFilterState,
			selectedRange: {
				startDate: selectedPeriod.startDate,
				endDate: selectedPeriod.endDate
			}
		})
	}, []);

	useOutsideClick(wrapperRef, () => {
		setShowDatePicker(false);
		if (!confirmCheck) {
			setTempState(initialState);
		}
	});

	const handleInputClick = () => {
		setShowDatePicker(!showDatePicker);
	};

	const handleDateChange = (ranges: RangeKeyDict) => {
		const { startDate, endDate } = ranges.selection;

		if (startDate && endDate) {
			if (!isSameMonth(startDate, endDate)) {
				const adjustedEndDate =
					differenceInDays(endDate, startDate) > 0 ? endOfMonth(startDate) : startOfMonth(endDate);

				setTempState([
					{
						startDate: startDate,
						endDate: addDays(startDate, MAX_RANGE_DAYS - 1),
						key: "selection",
					},
				]);
			} else if (differenceInDays(endDate, startDate) > MAX_RANGE_DAYS - 1) {
				setTempState([
					{
						startDate: startDate,
						endDate: addDays(startDate, MAX_RANGE_DAYS - 1),
						key: "selection",
					},
				]);
			} else {
				setTempState([
					{
						startDate: startDate,
						endDate: endDate,
						key: "selection",
					},
				]);
			}			
		}
	};

	const handleConfirm = () => {
		const { startDate, endDate } = tempState[0];

		// 확인 버튼 클릭 시 상태 반영
		setConfirmedState(tempState);
		setContirmCheck(true);

		setSearchFilterState((prev) => ({
			...prev,
			selectedRange: {
				startDate,
				endDate,
			},
		}));

		setShowDatePicker(false);
	};

	if (selectedRange)
		return (
			<div ref={wrapperRef} className="relative h-full w-full">
				<button
					className="flex h-full w-full cursor-pointer items-center justify-between rounded-lg border bg-white pl-2 pr-1"
					onClick={handleInputClick}
				>
					<input
						type="text"
						value={`${dateFormat(tempState[0].startDate, "yyyy.MM.dd")} ~ ${dateFormat(tempState[0].endDate, "yyyy.MM.dd")}`}
						readOnly
						className="w-full cursor-pointer outline-none"
						placeholder="기간 선택"
					/>
					<span className={showDatePicker ? "" : "rotate-180"}>
						<IconArrowTop />
					</span>
				</button>

				{showDatePicker && (
					<div className="absolute left-0 z-50 w-full rounded bg-white">
						<div className="absolute z-50 flex w-auto flex-col rounded-sm border border-[#e5e7eb] shadow-md">
							<DateRange
								className="rounded-sm"
								locale={ko}
								editableDateInputs={true}
								onChange={handleDateChange}
								moveRangeOnFirstSelection={false}
								showDateDisplay={false}
								ranges={tempState}
								months={1}
								direction="horizontal"
								rangeColors={["#D63457"]}
								minDate={dateRange.minDate}
								maxDate={dateRange.maxDate}
							/>
							<div className="flex w-full items-center justify-between border-t border-[#E4E8EE] bg-white p-2">
								<span className="text-sm font-medium text-[#999999]">
									기간 선택은 동일 월 내에서 최대 7일까지 가능합니다.
								</span>
								<BaseButton title="확인" onClick={handleConfirm} />
							</div>
						</div>
					</div>
				)}
			</div>
		);
}
