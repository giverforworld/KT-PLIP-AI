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
import { Dispatch, SetStateAction } from "react";
import { SetterOrUpdater } from "recoil";
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import { PATHS } from "@/constants/path";
import { useShowToast } from "@/hooks/useToastShow";
import BaseButton from "@/components/buttons/BaseButton";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import IconReset from "@images/reset.svg";
import { generateSearchQueryParams, generateUniqueId } from "@/utils/generate";
import { getRegionCodes } from "@/utils/query";
import {
	isRegionEmpty,
	hasDuplicateObjects,
	isInvalidRegionCodesInLlp,
	isInvalidDateInCompAnalysis,
	extractPageInfo,
	isNewlyCreateRegion,
} from "@/utils/validate";
import { validateRegions } from "./mop/MopSearchFilterHeader";
import { dateFormat } from "@/utils/date";

export interface SearchFilterHeaderProps {
	setSearchFilter: (payload: Partial<SearchFilterStoreState>) => void;
	setRegionSelectors: Dispatch<SetStateAction<string[] | null>>;
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	setQueryState: Dispatch<SetStateAction<QueryState>>;
	monthDate: Date;
}

export default function SearchFilterHeader({
	setSearchFilter,
	setRegionSelectors,
	searchFilterState,
	setSearchFilterState,
	setQueryState,
	monthDate,
}: SearchFilterHeaderProps) {
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);

	const showToast = useShowToast();

	const { dateSelector, selectedDate, selectedRange, displayRegions } = searchFilterState;
	const resetFilter = () => {
		setSearchFilterState({...searchFilterStateDefaultValue, selectedDate: monthDate});
		setRegionSelectors([generateUniqueId()]);
	};

	const applyFilter = () => {
		const regionCodes = getRegionCodes(displayRegions);

		if (isRegionEmpty(displayRegions)) {
			showToast("지역을 선택해주세요.", "info");
			return;
		}
		if (hasDuplicateObjects(displayRegions)) {
			showToast("중복된 지역은 선택할 수 없습니다", "info");
			return;
		}
		if (isInvalidRegionCodesInLlp(regionCodes, pageName)) {
			showToast("체류인구는 시군구 조회만 가능합니다.", "info");
			return;
		}
		if (isInvalidDateInCompAnalysis(dateSelector, subPageName)) {
			showToast("주민/생활비교분석은 월별 조회만 가능합니다.", "info");
			return;
		}
		if (pageName === PATHS.LLP && !validateRegions(displayRegions[0], displayRegions.slice(1))) {
			showToast("기준지역과 같은 계위의 출도착지를 선택해주세요.", "info");
			return;
		}

		const searchDate = dateSelector === "월별"
					? dateFormat(selectedDate, "yyyyMM")
					: dateFormat(selectedRange.startDate, "yyyyMM");
		if (isNewlyCreateRegion(regionCodes, searchDate)) {
			showToast("신설 지역은 전년 및 전월 데이터 비교가 불가합니다.", "info");
		}

		const newState: SearchFilter = {
			dateSelector,
			selectedDate,
			selectedRange,
			regions: displayRegions,
		};
		setSearchFilter(newState);
		const searchQueryParams = generateSearchQueryParams(newState);
		setQueryState({
			searchQueryParams,
			pathname,
		});
	};

	return (
		<div className="flex items-center justify-between">
			<h3 className="text-lg font-semibold">필터</h3>
			<ButtonGroup>
				<BaseButton title="초기화" color="outlined" Icon={IconReset} onClick={resetFilter} />
				<BaseButton title="적용하기" onClick={applyFilter} />
			</ButtonGroup>
		</div>
	);
}
