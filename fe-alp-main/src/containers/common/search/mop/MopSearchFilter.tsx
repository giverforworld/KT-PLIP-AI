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

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import {
	searchFilterStateDefaultValue,
	initialPurposeFilter,
	initialTransFilter,
} from "@/context/defaultValues";
import { PATHS } from "@/constants/path";
import { useShowToast } from "@/hooks/useToastShow";
import MopSearchFilterHeader, { validateRegions } from "./MopSearchFilterHeader";
import DateSelectorContainer from "../DateSelectorContainer";
import RegionSelectorContainer from "../RegionSelectorContainer";
import HelperText, { helperTextList } from "@/components/text/HelperText";
import {
	generateMopFlowSearchQueryParams,
	generateMopSearchQueryParams,
	generateUniqueId,
} from "@/utils/generate";
import { getRegionCodes } from "@/utils/query";
import {
	extractPageInfo,
	isRegionEmpty,
	isEmptyObject,
	hasDuplicateObjects,
} from "@/utils/validate";

// mop
import RouteSelectorContainer from "./RouteSelectorContainer";
import MopFilterChips from "./MopFilterChips";
import Switch from "@/components/buttons/Switch";
import { changeDateToString } from "@/utils/date";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { MopRegionSelectorContainerSkeleton } from "../skeleton/MopRegionSelectorContainerSkeleton";
import { RegionSelectorContainerSkeleton } from "../skeleton/RegionSelectorContainerSkeleton";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import { useSearchFilterStore } from "@/store/searchFilter";

interface SearchFilterProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	setQueryState: Dispatch<SetStateAction<QueryState>>;
	userRegion: Region;
	// regionInfo: Record<string, RegionInfo>;
	// filteredRegionInfo: Record<string, RegionInfo>;
	pathname: string;
	monthDate: Date;
	user: any;
}

export default function MopSearchFilter({
	searchFilterState,
	setSearchFilterState,
	setQueryState,
	userRegion,
	// regionInfo,
	// filteredRegionInfo,
	pathname,
	monthDate,
	user,
}: Readonly<SearchFilterProps>) {
	const { pageName, subPageName } = extractPageInfo(pathname);
	const isRankingPage = subPageName === PATHS.RANK_ANALYSIS;

	const showToast = useShowToast();

	const setSearchFilter = useSearchFilterStore(s=>s.mergeFilter)
	const [regionSelectors, setRegionSelectors] = useState<string[] | null>([]);
	const {
		dateSelector,
		selectedDate,
		selectedRange,
		displayRegions,
		routeDisplayRegions,
		includeSame,
		isFlow,
		isInflowRca,
		isInflowRaa,
		purpose,
		trans,
	} = searchFilterState;

	useEffect(() => {
		if (setSearchFilterState) {
			setSearchFilterState((prev) => ({ ...prev, selectedDate: monthDate }));
		}
	}, []);

	const date =
		searchFilterState.selectedDate.getDate() === new Date().getDate()
			? changeDateToString(monthDate).toString().slice(0, 6)
			: changeDateToString(searchFilterState.selectedDate).toString().slice(0, 6);

	const [filteredInfo, setFilteredInfo] = useState<any>();
	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(date);
	useEffect(() => {
		const newId = generateUniqueId();
		const newRouteId = generateUniqueId();
		setRegionSelectors([newId]);
		setRouteRegionSelectors([newRouteId]);
		setSearchFilterState({
			...searchFilterStateDefaultValue,
			selectedDate: monthDate,
			displayRegions: displayRegions,
		}); // 필터 초기화
		setMopAnalysis({
			mopRca: true,
			mopRaa: false,
		});
		setMopAnalysisHelperTooltip({
			mopRca: false,
			mopRaa: false,
		});
	}, []);

	useEffect(() => {
		if (data) {
			if (
				Number(changeDateToString(searchFilterState.selectedDate).toString().slice(0, 6)) <
					202307 &&
				userRegion.sido.code === "51"
			) {
				userRegion = {
					...userRegion,
					sido: {
						name: "강원도",
						code: "42",
					},
					sgg: {
						name: userRegion.sgg.name,
						code: "42" + userRegion.sgg.code.slice(2),
					},
				};
			}
			if (
				Number(changeDateToString(searchFilterState.selectedDate).toString().slice(0, 6)) <
					202403 &&
				userRegion.sido.code === "52"
			) {
				userRegion = {
					...userRegion,
					sido: {
						name: "전라북도",
						code: "45",
					},
					sgg: {
						name: userRegion.sgg.name,
						code: "45" + userRegion.sgg.code.slice(2),
					},
				};
			}
			const newId = generateUniqueId();
			const newRouteId = generateUniqueId();
			setRegionSelectors([newId]);
			setRouteRegionSelectors([newRouteId]);
			setSearchFilterState({
				...searchFilterState,
				displayRegions: [userRegion],
				routeDisplayRegions: searchFilterStateDefaultValue.routeDisplayRegions,
			});

			let baseInfo =
				user.baseInfo.toString().slice(0, 2) === "51" &&
				Number(changeDateToString(selectedDate).toString().slice(0, 6)) < 202307
					? Number("42" + user.baseInfo.toString().slice(2))
					: user.baseInfo.toString().slice(0, 2) === "52" &&
						  Number(changeDateToString(selectedDate).toString().slice(0, 6)) < 202403
						? Number("45" + user.baseInfo.toString().slice(2))
						: user.baseInfo;

			const filteredInfo = filterRegionInfo(data.regionInfo, baseInfo || 0, user.apdInfo || []);
			setFilteredInfo(filteredInfo);
		} // 필터 초기화
	}, [data]);

	// 동일 지역 내 이동 표출 Switch
	const handleSwitchToggle = () => {
		setSearchFilterState((prev) => ({
			...prev,
			includeSame: !prev.includeSame,
		}));
	};

	// 분석타입 선택
	const [mopAnalysis, setMopAnalysis] = useState<MopAnalysis>({
		mopRca: true, // 지역비교분석
		mopRaa: false, // 출도착지분석
	});
	const [mopAnalysisHelperTooltip, setMopAnalysisHelperTooltip] = useState<MopAnalysis>({
		mopRca: false,
		mopRaa: false,
	});

	// 출도착지분석시 출발지역 or 도착지역으로 들어갈 비교지역 selectors
	const [routeRegionSelectors, setRouteRegionSelectors] = useState<string[] | null>([]);

	// 이동목적,이동수단 FilterChips
	const [displayFilters, setDisplayFilters] = useState<{ [key: string]: number[] }>({});
	const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: number[] }>({
		purpose: initialPurposeFilter,
		trans: initialTransFilter,
	});

	// 이동목적,이동수단 FilterChips - 페이지 이동시 초기화
	useEffect(() => {
		setDisplayFilters({});
		setSelectedFilters({
			purpose: initialPurposeFilter,
			trans: initialTransFilter,
		});
	}, [pathname]);

	// 랭킹분석 페이지 이동시 초기화
	useEffect(() => {
		if (isRankingPage) {
			setMopAnalysis({
				mopRca: true,
				mopRaa: false,
			});
		}
	}, [isRankingPage]);

	useEffect(() => {
		setSearchFilterState((prev) => ({
			...prev,
			isFlow: mopAnalysis.mopRaa,
		}));
	}, [mopAnalysis]);

	useEffect(() => {
		setSearchFilterState((prev) => ({
			...prev,
			purpose: selectedFilters.purpose,
			trans: selectedFilters.trans,
		}));
	}, [selectedFilters]);

	useEffect(() => {
		if (!isFlow || isRankingPage) {
			// 지역비교분석
			if (isRegionEmpty(displayRegions)) {
				showToast("지역을 선택해주세요.", "info");
				return;
			}
			if (hasDuplicateObjects(displayRegions)) {
				showToast("중복된 지역은 선택할 수 없습니다", "info");
				return;
			}

			const newState: MopSearchFilter = {
				dateSelector,
				selectedDate:
					searchFilterState.selectedDate.getDate() == new Date().getDate()
						? monthDate
						: searchFilterState.selectedDate,
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

			const newState: MopFlowSearchFilter = {
				dateSelector,
				selectedDate:
					searchFilterState.selectedDate.getDate() == new Date().getDate()
						? monthDate
						: searchFilterState.selectedDate,
				selectedRange,
				regions: displayRegions,
				isFlow: isRankingPage ? undefined : isFlow,
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
	}, [pathname]);

	return (
		<>
			<MopSearchFilterHeader
				setSearchFilter={setSearchFilter}
				setRegionSelectors={setRegionSelectors}
				searchFilterState={searchFilterState}
				setSearchFilterState={setSearchFilterState}
				setQueryState={setQueryState}
				// mop
				setRouteRegionSelectors={setRouteRegionSelectors}
				setDisplayFilters={setDisplayFilters}
				setSelectedFilters={setSelectedFilters}
				mopAnalysis={mopAnalysis}
				setMopAnalysis={setMopAnalysis}
				mopAnalysisHelperTooltip={mopAnalysisHelperTooltip}
				setMopAnalysisHelperTooltip={setMopAnalysisHelperTooltip}
				isRankingPage={isRankingPage}
				monthDate={monthDate}
			/>
			<div className="grid grid-cols-5 gap-4">
				<DateSelectorContainer
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
				/>
				{isLoading || data === undefined || data === null || !filteredInfo ? (
					<RegionSelectorContainerSkeleton />
				) : (
					<RegionSelectorContainer
						regionSelectors={regionSelectors ?? []}
						setRegionSelectors={setRegionSelectors}
						searchFilterState={searchFilterState}
						setSearchFilterState={setSearchFilterState}
						// regionInfo={data!.filteredInfo}
						regionInfo={filteredInfo}
						mopAnalysis={mopAnalysis}
						hasAddRegionButton={mopAnalysis?.mopRca}
					/>
				)}

				{/* 출발지 / 도착지 Selectors*/}
				{mopAnalysis.mopRaa && (
					<div className="col-span-3">
						{isLoading || data === undefined || data === null ? (
							<MopRegionSelectorContainerSkeleton />
						) : (
							<>
								<RouteSelectorContainer
									routeRegionSelectors={routeRegionSelectors ?? []}
									setRouteRegionSelectors={setRouteRegionSelectors}
									searchFilterState={searchFilterState}
									setSearchFilterState={setSearchFilterState}
									regionInfo={data!.regionInfo}
									pageName={pageName}
								/>
							</>
						)}
					</div>
				)}
			</div>

			{[PATHS.TRANS, PATHS.PURPOSE].includes(subPageName) && (
				<MopFilterChips
					subPageName={subPageName}
					displayFilters={displayFilters}
					setDisplayFilters={setDisplayFilters}
					setSelectedFilters={setSelectedFilters}
				/>
			)}

			{!mopAnalysis.mopRaa && (
				<div className="flex items-center gap-2">
					<Switch isActive={includeSame} onToggle={handleSwitchToggle} />
					<div className="mr-2 text-base font-semibold">동일 지역 내 이동 표출 </div>
					{helperTextList["동일 지역 내 이동 표출"] && (
						<HelperText text={helperTextList["동일 지역 내 이동 표출"]} />
					)}
				</div>
			)}
		</>
	);
}
