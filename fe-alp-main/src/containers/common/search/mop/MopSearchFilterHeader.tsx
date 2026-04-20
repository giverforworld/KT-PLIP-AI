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
import {
	searchFilterStateDefaultValue,
	initialPurposeFilter,
	initialTransFilter,
} from "@/context/defaultValues";
import { SearchFilterHeaderProps } from "../SearchFilterHeader";
import { useShowToast } from "@/hooks/useToastShow";
import BaseButton from "@/components/buttons/BaseButton";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import IconReset from "@images/reset.svg";
import MopAnalysisTab from "./MopAnalysisTab";
import {
	generateMopFlowSearchQueryParams,
	generateMopSearchQueryParams,
	generateUniqueId,
} from "@/utils/generate";
import { isRegionEmpty, isEmptyObject, hasDuplicateObjects, isNewlyCreateRegion } from "@/utils/validate";
import { getRegionCodes } from "@/utils/query";
import { dateFormat } from "@/utils/date";

interface MopSearchFilterHeaderProps extends SearchFilterHeaderProps {
	setRouteRegionSelectors: Dispatch<SetStateAction<string[] | null>>;
	setDisplayFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	setSelectedFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
	mopAnalysis: MopAnalysis;
	setMopAnalysis: Dispatch<SetStateAction<MopAnalysis>>;
	mopAnalysisHelperTooltip: MopAnalysis;
	setMopAnalysisHelperTooltip: Dispatch<SetStateAction<MopAnalysis>>;
	isRankingPage: boolean;
	monthDate: Date;
}

export default function MopSearchFilterHeader({
	setSearchFilter,
	setRegionSelectors,
	searchFilterState,
	setSearchFilterState,
	setQueryState,

	// MopSearchFilterHeaderProps
	setRouteRegionSelectors,
	setDisplayFilters,
	setSelectedFilters,
	mopAnalysis,
	setMopAnalysis,
	mopAnalysisHelperTooltip,
	setMopAnalysisHelperTooltip,
	isRankingPage,
	monthDate,
}: MopSearchFilterHeaderProps) {
	const pathname = usePathname();

	const showToast = useShowToast();

	const {
		dateSelector,
		selectedDate,
		selectedRange,
		displayRegions,
		includeSame,
		routeDisplayRegions,
		isFlow,
		isInflowRca,
		isInflowRaa,
		purpose,
		trans,
	} = searchFilterState;

	const resetFilter = () => {
		const newId = generateUniqueId();
		const newRouteId = generateUniqueId();
		setRegionSelectors([newId]);
		setRouteRegionSelectors([newRouteId]);
		setSearchFilterState({...searchFilterStateDefaultValue, selectedDate: monthDate});

		setDisplayFilters({});
		setSelectedFilters({
			purpose: initialPurposeFilter,
			trans: initialTransFilter,
		});
		setMopAnalysis({
			mopRca: true,
			mopRaa: false,
		});
		setMopAnalysisHelperTooltip({
			mopRca: false,
			mopRaa: false,
		});
	};

	const applyFilter = () => {
		const searchDate = dateSelector === "월별"
			? dateFormat(selectedDate, "yyyyMM")
			: dateFormat(selectedRange.startDate, "yyyyMM");
		if (!isFlow) {
			// 지역비교분석
			if (isRegionEmpty(displayRegions)) {
				showToast("지역을 선택해주세요.", "info");
				return;
			}
			if (hasDuplicateObjects(displayRegions)) {
				showToast("중복된 지역은 선택할 수 없습니다", "info");
				return;
			}
			
			const regionCodes = getRegionCodes(displayRegions);
			if (isNewlyCreateRegion(regionCodes, searchDate)) {
				showToast("신설 지역은 전년 및 전월 데이터 비교가 불가합니다.", "info");
			}

			const newState: MopSearchFilter = {
				dateSelector,
				selectedDate,
				selectedRange,
				regions: displayRegions,
				isFlow,
				includeSame,
				purpose,
				trans,
				isInflowRca,
			};
			setSearchFilter(newState);
			const searchQueryParams = generateMopSearchQueryParams(newState, pathname);
			setQueryState({
				searchQueryParams,
				pathname,
			});
		} else {
			// 출도착지분석
			const newRouteDisplayRegions = routeDisplayRegions.slice(1); // "전국"을 선택할 수 있는 첫번째 selector를 제외한 Region[]
			if (isRegionEmpty(newRouteDisplayRegions)) {
				showToast("출도착지를 선택해주세요.", "info");
				return;
			}

			if (hasDuplicateObjects(routeDisplayRegions)) {
				showToast("중복된 지역은 선택할 수 없습니다", "info");
				return;
			}

			if (
				!isEmptyObject(routeDisplayRegions[0]) &&
				!validateRegions(displayRegions[0], routeDisplayRegions) // "전국"을 제외한 selecotr가 기준지역 계위와 동일하지 않을 경우
			) {
				showToast("기준지역과 같은 계위의 출도착지를 선택해주세요.", "info");
				return;
			}
			const regionCodes = getRegionCodes([...displayRegions, ...routeDisplayRegions]);
			if (isNewlyCreateRegion(regionCodes, searchDate)) {
				showToast("신설 지역은 전년 및 전월 데이터 비교가 불가합니다.", "info");
			}

			const newState: MopFlowSearchFilter = {
				dateSelector,
				selectedDate,
				selectedRange,
				regions: displayRegions,
				isFlow,
				isInflowRaa,
				flowRegions: routeDisplayRegions,
				purpose,
				trans,
			};
			setSearchFilter(newState);
			const searchQueryParams = generateMopFlowSearchQueryParams(newState, pathname);
			setQueryState({
				searchQueryParams,
				pathname,
			});
		}
	};

	return (
		<div className="grid grid-cols-5 gap-4">
			<div className="col-span-2 flex items-center">
				<h3 className="text-lg font-semibold">필터</h3>
			</div>
			<div
				className={`relative col-span-3 flex items-center ${isRankingPage ? "justify-end" : "justify-between"}`}
			>
				{!isRankingPage ? (
					<MopAnalysisTab
						setSearchFilterState={setSearchFilterState}
						mopAnalysis={mopAnalysis}
						setMopAnalysis={setMopAnalysis}
						mopAnalysisHelperTooltip={mopAnalysisHelperTooltip}
						setMopAnalysisHelperTooltip={setMopAnalysisHelperTooltip}
					/>
				) : null}
				<ButtonGroup>
					<BaseButton title="초기화" color="outlined" Icon={IconReset} onClick={resetFilter} />
					<BaseButton title="적용하기" onClick={applyFilter} />
				</ButtonGroup>
			</div>
		</div>
	);
}

// 기준 객체에서 마지막으로 채워진 계위를 확인하는 함수
function getFilledLevel(region: Region): string | null {
	if (region.adm.name || region.adm.code) return "adm";
	if (region.sgg.name || region.sgg.code) return "sgg";
	if (region.sido.name || region.sido.code) return "sido";
	return null;
}

// 비교 지역 객체 배열이 기준 객체의 계위와 일치하는지 검증하는 함수
export function validateRegions(baseRegion: Region, compareRegions: Region[]): boolean {
	const baseLevel = getFilledLevel(baseRegion);

	// 모든 비교 지역 객체가 기준 계위와 동일한가
	return compareRegions.every((region) => getFilledLevel(region) === baseLevel);
}
