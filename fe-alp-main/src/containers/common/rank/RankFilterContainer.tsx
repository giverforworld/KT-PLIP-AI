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

import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { PATHS } from "@/constants/path";
import RoundedBox from "@/components/boxes/RoundedBox";
import RankFilterHeader from "./RankFilterHeader";
import RankFilter from "./RankFilter";
import {
	FilterType,
	MoveFilterType,
	AgeFilterType,
	DateFilterType,
	FilterToggleType,
	inoutFilter,
	purposeFilter,
	transFilter,
	patternFilter,
	stayFilter,
	nightFilter,
	weekdayFilter,
	weekendFilter,
	genderFilter,
	agePerFiveFilter,
	agePerTenFilter,
} from "@/constants/filter";
import { extractPageInfo } from "@/utils/validate";
import { generateMopRankingQueryParams, generateRankingQueryParams } from "@/utils/generate";

interface RankFilterContainerProps {
	searchFilter: SearchFilter & MopSearchFilter;
	setSearchQueryParams: Dispatch<SetStateAction<SearchQueryParams>>;
	displayFilters: { [key: string]: number[] };
	setDisplayFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	selectedFilters: { [key: string]: number[] };
	setSelectedFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	activeToggle: RankFilterToggle;
	setActiveToggle: Dispatch<
		SetStateAction<{
			move: MoveFilterType | null;
			date: DateFilterType | null;
			age: AgeFilterType | null;
		}>
	>;
}

export default function RankFilterContainer({
	searchFilter,
	setSearchQueryParams,
	displayFilters,
	setDisplayFilters,
	selectedFilters,
	setSelectedFilters,
	activeToggle,
	setActiveToggle,
}: RankFilterContainerProps) {
	const pathname = usePathname();
	const { pageName } = extractPageInfo(pathname);

	const rankFilters = useMemo(() => {
		const filtersByPathname: Record<string, FilterType[]> = {
			mop: [
				// inoutFilter,
				activeToggle.move === "이동목적" ? purposeFilter : transFilter,
				activeToggle.date === "요일선택" ? weekdayFilter : weekendFilter,
				genderFilter,
				activeToggle.age === "10세 단위" ? agePerTenFilter : agePerFiveFilter,
			],
			alp: [
				patternFilter,
				activeToggle.date === "요일선택" ? weekdayFilter : weekendFilter,
				genderFilter,
				activeToggle.age === "10세 단위" ? agePerTenFilter : agePerFiveFilter,
			],
			llp: [
				// stayFilter,
				// nightFilter,
				// activeToggle.date === "요일선택" ? weekdayFilter : weekendFilter,
				genderFilter,
				activeToggle.age === "10세 단위" ? agePerTenFilter : agePerFiveFilter,
			],
		};
		return filtersByPathname[pageName] || [];
	}, [activeToggle, pageName]);

	const resetFilter = () => {
		setSelectedFilters({});
		setDisplayFilters({});
		setActiveToggle({
			move: "이동목적",
			date: "요일선택",
			age: "10세 단위",
		});
	};

	const handleToggle = (filterType: FilterToggleType, selected: string) => {
		setActiveToggle((prev) => ({
			...prev,
			[filterType]: selected,
		}));

		setSelectedFilters((prev) => {
			switch (filterType) {
				case "move":
					return {
						...prev,
						purpose: selected === "이동수단" ? [] : prev.purpose,
						trans: selected === "이동목적" ? [] : prev.trans,
					};
				case "date":
					return {
						...prev,
						weekday: selected === "평일/휴일" ? [] : prev.weekdayFilter,
						weekend: selected === "요일선택" ? [] : prev.weekendFilter,
					};
				case "age":
					return {
						...prev,
						agePerTen: selected === "5세 단위" ? [] : prev.agePerTen,
						agePerFive: selected === "10세 단위" ? [] : prev.agePerFive,
					};
				default:
					return prev;
			}
		});
	};

	const applyFilter = () => {
		setSearchQueryParams(
			pageName === PATHS.MOP
				? generateMopRankingQueryParams(searchFilter, selectedFilters, activeToggle)
				: generateRankingQueryParams(searchFilter, selectedFilters, activeToggle, pageName),
		);
	};

	useEffect(() => {
		resetFilter();
		setSearchQueryParams(
			pageName === PATHS.MOP
				? generateMopRankingQueryParams(
						searchFilter,
						{},
						{ move: "이동목적", date: "요일선택", age: "10세 단위" },
					)
				: generateRankingQueryParams(
						searchFilter,
						{},
						{ move: "이동목적", date: "요일선택", age: "10세 단위" },
						pageName,
					),
		);
	}, [searchFilter]);

	return (
		<RoundedBox bgColor="bg-whiteGray" border={false}>
			<RankFilterHeader resetFilter={resetFilter} applyFilter={applyFilter} />
			<div className="mt-2 flex flex-wrap gap-x-10 gap-y-6 rounded-md bg-white p-4">
				{rankFilters.map((filter, index) => {
					return (
						<RankFilter
							key={index}
							filter={filter}
							displayFilters={displayFilters}
							setDisplayFilters={setDisplayFilters}
							setSelectedFilters={setSelectedFilters}
							activeToggle={activeToggle}
							onToggle={handleToggle}
						/>
					);
				})}
			</div>
		</RoundedBox>
	);
}
