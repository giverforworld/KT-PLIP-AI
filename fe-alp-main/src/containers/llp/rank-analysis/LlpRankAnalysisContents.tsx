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

import { useEffect, useState } from "react";
import useGetData from "@/hooks/queries/useGetData";
import ShadowBox from "@/components/boxes/ShadowBox";
import Spinner from "@/components/loading/Spinner";
import StatSummary from "@/containers/common/data/StatSummary";
import DataGroup from "@/containers/common/data/DataGroup";
import DataHeader from "@/containers/common/data/DataHeader";
import ChartContainer from "@/containers/common/chart/ChartContainer";
import RankFilterContainer from "@/containers/common/rank/RankFilterContainer";
import { generateRankingQueryParams } from "@/utils/generate";
import _ from "lodash";
import { useSearchResultStore } from "@/store/searchResult";
import { useSearchFilterStore } from "@/store/searchFilter";

export default function MopRankAnalysisContents() {
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary, dataGroups } = searchResult.data;

	const [displayFilters, setDisplayFilters] = useState<{ [key: string]: number[] }>({});
	const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: number[] }>({});
	const [activeToggle, setActiveToggle] = useState<RankFilterToggle>({
		move: "이동목적",
		date: "요일선택",
		age: "10세 단위",
	});

	const searchFilter = useSearchFilterStore(s=>s.filter);
	const [searchQueryParams, setSearchQueryParams] = useState<SearchQueryParams>({});

	const { useRankingQuery } = useGetData();
	const { data, isLoading: isRankingLoading } = useRankingQuery(searchQueryParams, "llp");

	useEffect(() => {
		if (!_.isEmpty(selectedFilters)) {
			setSearchQueryParams(
				generateRankingQueryParams(searchFilter, selectedFilters, activeToggle, "llp"),
			);
		}
	}, []);

	if (searchResult.isLoading) {
		return <Spinner />;
	} else {
		return (
			<div className="flex flex-col gap-6">
				<StatSummary statSummary={statSummary} />
				{dataGroups && dataGroups.length !== 0 ? (
					dataGroups.map((dataGroup, index) => <DataGroup key={index} data={dataGroup} />)
				) : (
					<div className="text-center">데이터를 불러오지 못했습니다.</div>
				)}

				{/* 지역 랭킹 */}
				<ShadowBox>
					<div className="flex flex-col gap-4">
						{data && <DataHeader data={data} />}
						<RankFilterContainer
							searchFilter={searchFilter}
							setSearchQueryParams={setSearchQueryParams}
							displayFilters={displayFilters}
							setDisplayFilters={setDisplayFilters}
							selectedFilters={selectedFilters}
							setSelectedFilters={setSelectedFilters}
							activeToggle={activeToggle}
							setActiveToggle={setActiveToggle}
						/>
						{isRankingLoading ? <Spinner /> : data && <ChartContainer data={data} />}
					</div>
				</ShadowBox>
			</div>
		);
	}
}
