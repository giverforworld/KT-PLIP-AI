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

import { Dispatch, SetStateAction, useEffect } from "react";
import FilterChip from "@/components/chips/FilterChip";
import FilterChipButton from "@/components/chips/FilterChipButton";
import ToggleButton from "@/components/buttons/ToggleButton";
import {
	FilterType,
	MOVE_FILTER_TYPES,
	DATE_FILTER_TYPES,
	AGE_FILTER_TYPES,
	MoveFilterType,
	DateFilterType,
	AgeFilterType,
	FilterToggleType,
} from "@/constants/filter";

interface RankFilterProps {
	filter: FilterType;
	displayFilters: { [key: string]: number[] };
	setDisplayFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	setSelectedFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	activeToggle: RankFilterToggle;
	onToggle: <T extends FilterToggleType, U extends string>(filterType: T, selected: U) => void;
}

interface ToggleButtonConfig {
	[key: string]: {
		toggleType: FilterToggleType;
		labels: string[];
		selected: MoveFilterType | DateFilterType | AgeFilterType | null;
	};
}

export default function RankFilter({
	filter,
	displayFilters,
	setDisplayFilters,
	setSelectedFilters,
	activeToggle,
	onToggle,
}: RankFilterProps) {
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

	const toggleButtonConfig: ToggleButtonConfig = {
		이동목적: { toggleType: "move", labels: MOVE_FILTER_TYPES, selected: activeToggle.move },
		이동수단: { toggleType: "move", labels: MOVE_FILTER_TYPES, selected: activeToggle.move },
		요일: { toggleType: "date", labels: DATE_FILTER_TYPES, selected: activeToggle.date },
		연령: { toggleType: "age", labels: AGE_FILTER_TYPES, selected: activeToggle.age },
	};

	const toggleConfig = toggleButtonConfig[filter.category as keyof ToggleButtonConfig];

	// 모든 항목이 선택되어있지 않을 시(display), 상태에 전체 레이블 추가(selected)
	useEffect(() => {
		const selectedFilter =
			!displayFilters[filter.key!] || displayFilters[filter.key!]?.length === 0
				? { [filter.key!]: filter.labels.map((label) => label.value) }
				: displayFilters;
		setSelectedFilters((prev) => ({ ...prev, ...selectedFilter }));
	}, [displayFilters, filter, setSelectedFilters]);

	return (
		<div className={`${getWidth(filter.category)}`}>
			<h4 className="mb-2 flex h-[32px] items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">{filter.category}</span>
					<FilterChipButton
						filter={filter}
						displayFilters={displayFilters}
						setDisplayFilters={setDisplayFilters}
					/>
				</div>

				{toggleConfig && (
					<ToggleButton
						labels={toggleConfig.labels}
						selected={toggleConfig.selected}
						onToggle={(e, selected) => onToggle(toggleConfig.toggleType, selected)}
					/>
				)}
			</h4>
			<ul className={`flex gap-2 ${filter.category === "연령" ? "w-auto flex-wrap" : "w-full"}`}>
				{filter.labels.map((label) => {
					const { labelKey, value } = label;
					return (
						<li key={value} className={filter.category === "연령" ? "w-auto" : "w-full"}>
							<FilterChip
								label={labelKey}
								selected={displayFilters[filter.key!]?.includes(value)}
								onClick={() => toggleFilter(filter.key!, value)}
								// size="lg"
								fullWidth={!(filter.category === "연령")}
							/>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

const getWidth = (category: string) => {
	switch (category) {
		case "유입/유출인구":
		case "거주/직장/방문":
		case "체류일수별":
			return "w-3/12";

		case "숙박일수별":
			return "w-4/12";

		case "이동목적":
		case "이동수단":
			return "w-8/12";

		case "요일":
			return "w-4/12";

		case "성별":
			return "w-3/12";

		case "연령":
			return "w-8/12";

		default:
			return "w-auto";
	}
};
