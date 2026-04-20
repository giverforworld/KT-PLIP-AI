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

import { useState, useEffect } from "react";
import StatSummary from "../../common/data/StatSummary";
import DataGroup from "../../common/data/DataGroup";
import RegPopulation from "./RegPopulation";
import InfoBox from "@/containers/common/info/InfoBox";
import Spinner from "@/components/loading/Spinner";
import { useSearchResultStore } from "@/store/searchResult";

export default function AlpCompAnalysisContents() {
	const searchResult = useSearchResultStore(s=>s.searchResult);	
	const { statSummary, dataGroups } = searchResult.data;
	const [regDataGroup, setRegDataGroup] = useState<any>();
	const [dataGroup, setDataGroup] = useState<any>();
	
	useEffect(() => {
		if (dataGroups && dataGroups.length !== 0) {
			const condition = (item:any) => item.id === 'ALP30010_09' || item.id === 'ALP30010_10' || item.id === 'ALP30010_11' || item.id === 'ALP30010_12' || item.id === 'ALP30010_12_1';
			const regDataGroups = dataGroups[0].data.filter(condition);
			setRegDataGroup(regDataGroups);
			const dataGroupss = dataGroups[0].data.filter((item:any) => !condition(item));
			let newGroup = [];
			newGroup.push({title: "주민등록인구와 생활인구 비교", data: dataGroupss});
			setDataGroup(newGroup);
		}
	}, [dataGroups])
	
	if (searchResult.isLoading) {
		return <Spinner />;
	} else {
		return (
			<div className="flex flex-col gap-6">
				<InfoBox name="alpComparativeInfo" />
				{regDataGroup &&  regDataGroup.length !== 0 && <RegPopulation data={regDataGroup}/>}
				<StatSummary statSummary={statSummary} />
				{dataGroup && dataGroup.length !== 0 ? (
					dataGroup.map((data:any, index:any) => <DataGroup key={index} data={data} />)
				) : (
					<div className="text-center">데이터를 불러오지 못했습니다.</div>
				)}
			</div>
		);
	}
}
