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
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import { PATHS } from "@/constants/path";
import { useShowToast } from "@/hooks/useToastShow";
import SearchFilterHeader from "./SearchFilterHeader";
import DateSelectorContainer from "./DateSelectorContainer";
import RegionSelectorContainer from "./RegionSelectorContainer";
import HelperText from "@/components/text/HelperText";
import { generateSearchQueryParams, generateUniqueId } from "@/utils/generate";
import { getRegionCodes } from "@/utils/query";
import {
	isRegionEmpty,
	extractPageInfo,
	isInvalidRegionCodesInLlp,
	isInvalidDateInCompAnalysis,
	hasDuplicateObjects,
} from "@/utils/validate";
import { validateRegions } from "./mop/MopSearchFilterHeader";
import { changeDateToString } from "@/utils/date";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { RegionSelectorContainerSkeleton } from "./skeleton/RegionSelectorContainerSkeleton";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import { useSearchFilterStore } from "@/store/searchFilter";

interface SearchFilterProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	setQueryState: Dispatch<SetStateAction<QueryState>>;
	userRegion: Region;
	// regionInfo: Record<string, RegionInfo>;
	pathname: string;
	monthDate: Date;
	user: any;
}

export default function SearchFilter({
	searchFilterState,
	setSearchFilterState,
	setQueryState,
	userRegion,
	// regionInfo,
	pathname,
	monthDate,
	user,
}: Readonly<SearchFilterProps>) {
	const { pageName, subPageName } = extractPageInfo(pathname);

	const showToast = useShowToast();

	const searchFilter = useSearchFilterStore(s=>s.filter);
	const setSearchFilter = useSearchFilterStore((s) => s.mergeFilter);
	const [regionSelectors, setRegionSelectors] = useState<string[] | null>([]);
	const { dateSelector, selectedDate, selectedRange, displayRegions } = searchFilterState;

	// useEffect(() => {
	// 	if (setSearchFilterState) {
	// 		setSearchFilterState((prev) => ({ ...prev, selectedDate: monthDate }));
	// 	}
	// }, []);

	const date =
		searchFilterState.selectedDate.getDate() == new Date().getDate()
			? changeDateToString(monthDate).toString().slice(0, 6)
			: changeDateToString(searchFilterState.selectedDate).toString().slice(0, 6);

	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(date);

	useEffect(() => {
		const newId = generateUniqueId();
		setRegionSelectors([newId]);
		setSearchFilterState({
			...searchFilterStateDefaultValue,
			selectedDate: monthDate,
			displayRegions: displayRegions,
		}); // 필터 초기화
	}, []);
	const [filteredInfo, setFilteredInfo] = useState<any>();
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
						name: userRegion.sgg.name ?? "",
						code: userRegion.sgg.code ? "42" + userRegion.sgg.code.slice(2) : "",
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
			setRegionSelectors([newId]);
			setSearchFilterState({
				...searchFilterState,
				// selectedDate: monthDate,
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
	useEffect(() => {
		const regionCodes = getRegionCodes(searchFilter.regions);

		if (isInvalidRegionCodesInLlp(regionCodes, pageName)) {
			showToast("체류인구는 시군구 조회만 가능합니다.", "info");

			// const newRegions = searchFilter.regions.map((region) => {
			// 	return { ...region, adm: { name: "", code: "" } };
			// });
			// setSearchFilterState((prev) => ({
			// 	...prev,
			// 	displayRegions: newRegions,
			// }));
			// const newState: SearchFilter = {
			// 	dateSelector,
			// 	selectedDate: monthDate,
			// 	selectedRange,
			// 	regions: [
			// 		// {
			// 		// 	sido: {
			// 		// 		name: userRegion.sido.name,
			// 		// 		code: userRegion.sido.code,
			// 		// 	},
			// 		// 	sgg: { name: userRegion.sgg.name, code: userRegion.sgg.code },
			// 		// 	adm: { name: "", code: "" },
			// 		// },
			// 		// {
			// 		// 	sido: {
			// 		// 		name: "서울특별시",
			// 		// 		code: "11",
			// 		// 	},
			// 		// 	sgg: { name: "강남구", code: "11680" },
			// 		// 	adm: { name: "", code: "" },
			// 		// },
			// 	],
			// };
			// setSearchFilter((prev) => ({ ...prev, ...newState }));
			// const searchQueryParams = generateSearchQueryParams(newState);
			// setQueryState({
			// 	searchQueryParams,
			// 	pathname,
			// });
		}
	}, [pageName, searchFilter.regions]);

	useEffect(() => {
		if (isInvalidDateInCompAnalysis(dateSelector, subPageName)) {
			showToast("주민/생활비교분석은 월별 조회만 가능합니다.", "info");
		}
	}, [subPageName]);

	useEffect(() => {
		if (isRegionEmpty(displayRegions)) {
			showToast("지역을 선택해주세요.", "info");
			return;
		}
		if (hasDuplicateObjects(displayRegions)) {
			showToast("중복된 지역은 선택할 수 없습니다", "info");
			return;
		}
		if (pageName === PATHS.LLP && !validateRegions(displayRegions[0], displayRegions.slice(1))) {
			showToast("기준지역과 같은 계위의 출도착지를 선택해주세요.", "info");
			return;
		}

		const newState: SearchFilter = {
			dateSelector,
			selectedDate:
				searchFilterState.selectedDate.getDate() == new Date().getDate()
					? monthDate
					: searchFilterState.selectedDate,
			selectedRange,
			regions: displayRegions,
		};
		setSearchFilter(newState);
		const searchQueryParams = generateSearchQueryParams(newState);
		setQueryState({
			searchQueryParams,
			pathname,
		});
	}, [pathname]);
	return (
		<>
			<SearchFilterHeader
				setSearchFilter={setSearchFilter}
				setRegionSelectors={setRegionSelectors}
				searchFilterState={searchFilterState}
				setSearchFilterState={setSearchFilterState}
				setQueryState={setQueryState}
				monthDate={monthDate}
			/>
			{pageName === PATHS.BOOKMARK && (
				<HelperText text="일 단위 기간 선택 시, 읍면동 선택 시, 표출되지 않는 지표가 있습니다." />
			)}
			<div className="grid grid-cols-5 gap-4">
				<DateSelectorContainer
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
					// setSelectedRegion={undefined}
				/>
				{isLoading || data === undefined || data === null || !filteredInfo ? (
					<RegionSelectorContainerSkeleton />
				) : (
					<>
						<RegionSelectorContainer
							regionSelectors={regionSelectors ?? []}
							setRegionSelectors={setRegionSelectors}
							searchFilterState={searchFilterState}
							setSearchFilterState={setSearchFilterState}
							// regionInfo={data!.filteredInfo}
							regionInfo={filteredInfo}
							hasAddRegionButton={pageName !== PATHS.BOOKMARK}
							isAdmRender={pageName !== PATHS.LLP}
						/>
					</>
				)}
			</div>
		</>
	);
}
