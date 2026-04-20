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

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import { PATHS } from "@/constants/path";
import useGetData from "@/hooks/queries/useGetData";
import SearchFilter from "./SearchFilter";
import MopSearchFilter from "./mop/MopSearchFilter";
import SearchFilterDownload from "./SearchFilterDownload";
import SearchSummary from "./SearchSummary";
import { extractPageInfo } from "@/utils/validate";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import { UserContext } from "@/context/UserProviderContainer";
import { endOfMonth } from "date-fns";
import { useSearchResultStore } from "@/store/searchResult";
import { useSearchFilterStore } from "@/store/searchFilter";

interface SearchFilterContainerProps {
	startEnd: [{
        START: string, END: string,
    }]
}

export default function SearchFilterContainer({startEnd}: Readonly<SearchFilterContainerProps>) {
    let dataInfo;
    if (JSON.parse(sessionStorage.getItem('info')!)) {
        dataInfo = JSON.parse(sessionStorage.getItem('info')!);
    } else {
        const formatDateToData = (start: string, end: string): {startDate: string, endDate: string, yyyymm: string} => {
            let startMonth = (parseInt(start.slice(4, 6), 10)).toString().padStart(2, '0');            
            let endMonth = (parseInt(end.slice(4, 6), 10)).toString().padStart(2, '0');
            let startYear = start.slice(0, 4);
            let endYear = end.slice(0, 4);
            let endDay = end.slice(6, 8).padStart(2, '0');
    
            return { startDate: `${startYear}${startMonth}01`, endDate: endYear+endMonth+endDay, yyyymm: endYear+endMonth };
        }
        const temp = formatDateToData(startEnd[0].START, startEnd[0].END);
		const safeJSONStringify = (value:any) => {
			return JSON.stringify(value, (key, val) => {
				if (typeof val === 'string') {
					return val.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // XSS 방지
				}
				return val;
			});
		};
		sessionStorage.setItem('info', safeJSONStringify(temp)); 
        dataInfo = temp;
    }

	const searchFilter = useSearchFilterStore(s=>s.filter)
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("GIScontainer must be used within a UserProderContainer");
	}
	const { user } = context;
	
	const userRegion = {
		sido: {
			name: user!.baseRegion.sido.name,
			code: user!.baseRegion.sido.code,
		},
		sgg: {
			name: user!.baseInfo > 100 ? user!.baseRegion.sgg.name : "",
			code: user!.baseInfo > 100 ? user!.baseRegion.sgg.code : "",
		},
		adm: {
			name: user!.baseRegion.adm.name ?? "",
			code: user!.baseRegion.adm.code ?? "",
		},
	};
	const [searchFilterState, setSearchFilterState] = useState({
		...searchFilterStateDefaultValue,
		displayRegions: [userRegion],
	});
	
	const formatDateToDateData = (date: string):  Date => {
		let month = (parseInt(date.slice(4, 6), 10)).toString();
		let year = date.slice(0, 4);
		return new Date(`${year},${month},1`);
	}
	const [ monthDate, setMonthDate ] = useState<Date>(formatDateToDateData(dataInfo.endDate));
	// const monthDate = formatDateToDateData(dataInfo.endDate);
	// setMonthDate(month);
	useEffect(() => {
		if (monthDate) { setSearchFilterState((prev) => ({...prev, selectedDate: monthDate})); }
	}, [])

	const setSearchResult = useSearchResultStore(s=> s.setSearchResult);
	// 회원 조건에 따른 지역

	const { useSearchSummaryQuery, useSearchResultQuery } = useGetData();
	const [queryState, setQueryState] = useState<QueryState>({
		searchQueryParams: {},
		pathname,
	});

	const { data: searchSummary, isLoading: isSearchSummaryLoading } =
		useSearchSummaryQuery(queryState);
	const { data: searchResult, isLoading: isSearchResultLoading } = useSearchResultQuery(queryState);

	useEffect(() => {
		setSearchResult({
			queryState,
			data:
				!isSearchResultLoading && searchResult ? searchResult : { statSummary: [], dataGroups: [] },
			isLoading: isSearchResultLoading,
		});
	}, [isSearchResultLoading, searchResult, setSearchResult, queryState]);

	// useEffect(() => {
	// 	if (regionInfo) {
	// 	}
	// }, [regionInfo, user]);
	// if (pageName === PATHS.BOOKMARK && (!bookmarkGroup || bookmarkGroup.data.length === 0))
	// 	return null;
	if (pageName === PATHS.BOOKMARK) return null;

	return (
		<>
			<Wrapper border bgColor="bg-backGray">
				{pageName !== PATHS.MOP ? (
					monthDate && <SearchFilter
						searchFilterState={searchFilterState}
						setSearchFilterState={setSearchFilterState}
						setQueryState={setQueryState}
						userRegion={userRegion}
						// regionInfo={data.regionInfo}
						pathname={pathname}
						monthDate={monthDate}
						user={user}
					/>
				) : (
					monthDate && <MopSearchFilter
						searchFilterState={searchFilterState}
						setSearchFilterState={setSearchFilterState}
						setQueryState={setQueryState}
						userRegion={userRegion}
						// regionInfo={data.regionInfo!}
						// filteredRegionInfo={data.filteredInfo}
						pathname={pathname}
						monthDate={monthDate}
						user={user}
					/>
				)}
			</Wrapper>

			{pageName !== PATHS.BOOKMARK && (
				<Wrapper>
					<SearchFilterDownload
						searchResult={searchResult}
						pageName={pageName}
						subPageName={subPageName}
					/>
					<SearchSummary
						searchSummary={searchSummary}
						isSearchSummaryLoading={isSearchSummaryLoading}
						searchFilter={searchFilter}
					/>
				</Wrapper>
			)}
		</>
	);
}

const Wrapper = ({
	children,
	border = false,
	bgColor = "bg-white",
}: {
	children: React.ReactNode;
	border?: boolean;
	bgColor?: "bg-backGray" | "bg-white";
}) => {
	return (
		<div className={`${border && "border-b border-t"} ${bgColor} py-4`}>
			<div className="m-auto flex w-9/12 max-w-[1280px] flex-col gap-4">{children}</div>
		</div>
	);
};
