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

import { useMemo, useState } from "react";
import { SetterOrUpdater } from "recoil";
import { RadioButton } from "@/components/buttons/RadioButton";
import SelectorInput from "./SelectorInput";
import SelectDropdown from "./SelectDropdown";

interface MonthSelectorProps {
	searchFilter: SearchFilter;
	setSearchFilter: SetterOrUpdater<SearchFilter>;
}

// CHECKED_20241030: 해당 컴포넌트 사용하지 않음
export default function MonthSelectorOLD({ searchFilter, setSearchFilter }: MonthSelectorProps) {
	const [isSelectorOpen, setIsSelectorOpen] = useState(false);
	// const [selectedYear, setSelectedYear] = useState<number | undefined>(searchFilter.year);
	// const [selectedMonth, setSelectedMonth] = useState<number | undefined>(searchFilter.month);

	const yearMonthOptions = useMemo(() => generateYearMonthOptions(), []);
	const years = Array.from(new Set(yearMonthOptions.map((option) => option.year)));

	// const handleYearChange = (year: number) => {
	// 	setSelectedYear(year);
	// 	setSearchFilter((prev) => ({
	// 		...prev,
	// 		year,
	// 	}));
	// };

	// const handleMonthChange = (month: number) => {
	// 	setSelectedMonth(month);
	// 	setSearchFilter((prev) => ({
	// 		...prev,
	// 		month,
	// 	}));
	// };

	return (
		<div className="relative h-full w-full">
			{/* Input */}
			{/* <SelectorInput
				isSelectorOpen={isSelectorOpen}
				onClick={() => setIsSelectorOpen(!isSelectorOpen)}
			>
				{searchFilter.year ? `${searchFilter.year}` : ""}
				{searchFilter.month ? `. ${searchFilter.month.toString().padStart(2, "0")}` : ""}
			</SelectorInput> */}

			{/* Dropdown */}
			{/* <SelectDropdown isSelectorOpen={isSelectorOpen} setIsSelectorOpen={setIsSelectorOpen}>
				<div className="custom-scrollbar w-1/2 pr-2">
					<ul>
						{years.map((year) => (
							<li key={year} className="py-1">
								<RadioButton
									id={`year-${year}`}
									name="year"
									label={String(year)}
									value={String(year)}
									checked={selectedYear === year}
									onChange={() => handleYearChange(year)}
								/>
							</li>
						))}
					</ul>
				</div>

				<div className="custom-scrollbar w-1/2 overflow-y-auto pr-2">
					<ul>
						{yearMonthOptions
							.filter((option) => option.year === selectedYear)
							.map((option) => (
								<li key={option.month} className="py-1">
									<RadioButton
										id={`month-${option.year}-${option.month}`}
										name="month"
										label={`${option.month}월`}
										value={String(option.month)}
										checked={selectedMonth === option.month}
										onChange={() => handleMonthChange(option.month)}
									/>
								</li>
							))}
					</ul>
				</div>
			</SelectDropdown> */}
		</div>
	);
}

/**
 * 현재 달의 직전 달 마지막 날짜를 기준으로 36개월 전까지의 연도와 월을 계산하는 함수
 * @returns {Array<{ year: number; month: number }>} 36개월 동안의 연도와 월 배열
 */
function generateYearMonthOptions(): Array<{ year: number; month: number }> {
	const today = new Date();

	const lastMonthDate = new Date(today.getFullYear(), today.getMonth(), 0); // 현재 달의 마지막 날
	const startYear = lastMonthDate.getFullYear();
	const startMonth = lastMonthDate.getMonth() + 1;

	const options: Array<{ year: number; month: number }> = [];

	for (let i = 0; i < 36; i++) {
		const date = new Date(startYear, startMonth - 1 - i);
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		options.push({ year, month });
	}

	return options;
}
