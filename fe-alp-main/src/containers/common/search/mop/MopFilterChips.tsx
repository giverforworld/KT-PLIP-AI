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

import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { FilterType, purposeFilter, transFilter } from "@/constants/filter";
import FilterChip from "@/components/chips/FilterChip";
import FilterChipButton from "@/components/chips/FilterChipButton";

interface MopFilterChipsProps {
	subPageName: string;
	displayFilters: { [key: string]: number[] };
	setDisplayFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	setSelectedFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
}

export default function MopFilterChips({
	subPageName,
	displayFilters,
	setDisplayFilters,
	setSelectedFilters,
}: MopFilterChipsProps) {
	const filter = useMemo(() => {
		const filterByPathname: Record<string, FilterType> = {
			purpose: purposeFilter,
			trans: transFilter,
		};
		return filterByPathname[subPageName] || [];
	}, [subPageName]);

	const toggleFilter = (key: string, label: number) => {
		setDisplayFilters((prevSelected) => {
			const currentSelections = prevSelected[key] || [];
			let newSelections = currentSelections.includes(label)
				? currentSelections.filter((item) => item !== label)
				: [...currentSelections, label];

			return {
				...prevSelected,
				[key]: newSelections,
			};
		});
	};

	// 모든 항목이 선택되어있지 않을 시(display), 상태에 전체 레이블 추가(selected)
	useEffect(() => {
		const selectedFilter =
			!displayFilters[filter.key!] || displayFilters[filter.key!]?.length === 0
				? { [filter.key!]: filter.labels.map((label) => label.value) }
				: displayFilters;
		setSelectedFilters((prev) => ({ ...prev, ...selectedFilter }));
	}, [displayFilters, filter, setSelectedFilters]);

	return (
		<div className="border-t-[4px] border-[#F4F4F4] py-4">
			<div className="flex items-center gap-2">
				<h4 className="font-semibold">{filter.category}</h4>
				<FilterChipButton
					filter={filter}
					displayFilters={displayFilters}
					setDisplayFilters={setDisplayFilters}
				/>
			</div>

			<p className="my-1 text-sm text-textLightGray">
				항목을 선택하지 않으면 전체 목적에 대한 분석이 제공됩니다.
			</p>
			<ul className="flex w-2/3 gap-4">
				{filter.labels.map((label) => {
					const { labelKey, value } = label;
					return (
						<li key={labelKey} className="w-full">
							<FilterChip
								label={labelKey}
								selected={displayFilters[filter.key!]?.includes(value)}
								onClick={() => toggleFilter(filter.key!, value)}
								fullWidth
							/>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
