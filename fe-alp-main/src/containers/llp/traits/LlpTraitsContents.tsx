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

import StatSummary from "../../common/data/StatSummary";
import DataGroup from "@/containers/common/data/DataGroup";
import InfoBox from "@/containers/common/info/InfoBox";
import Spinner from "@/components/loading/Spinner";
import { useSearchResultStore } from "@/store/searchResult";

export default function LlpTraitsContents() {
	const searchResult = useSearchResultStore((s) => s.searchResult);
	const { statSummary, dataGroups } = searchResult.data;

	if (searchResult.isLoading) {
		return <Spinner />;
	} else {
		return (
			<div className="flex flex-col gap-6">
				<InfoBox name="llpTraitsInfo" />
				<StatSummary statSummary={statSummary} />
				{dataGroups && dataGroups.length !== 0 ? (
					dataGroups.map((dataGroup, index) => <DataGroup key={index} data={dataGroup} />)
				) : (
					<div className="text-center">데이터를 불러오지 못했습니다.</div>
				)}
			</div>
		);
	}
}
