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

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { searchFilterStateDefaultValue } from "@/context/defaultValues";
import RoundedBox from "@/components/boxes/RoundedBox";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import BaseButton from "@/components/buttons/BaseButton";
import IconReset from "@images/reset.svg";
import Spinner from "@/components/loading/Spinner";
import DateSelectorContainer from "../common/search/DateSelectorContainer";
import RegionSelectorContainer from "../common/search/RegionSelectorContainer";
import { generateUniqueId } from "@/utils/generate";
import { getFirstDayOfMonth, getEndDayOfMonth, dateFormat, changeDateToString, changeStrToDate } from "@/utils/date";
import { getRegionCodes } from "@/utils/query";
import useRegionInfo from "@/hooks/queries/useRegionInfo";
import { RegionSelectorContainerSkeleton } from "../common/search/skeleton/RegionSelectorContainerSkeleton";

interface ReportFilterProps {
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	setSearchParams: Dispatch<SetStateAction<{ start: string; region: string }>>;
	regionInfo: Record<string, RegionInfo>;
	setReportFilter: Dispatch<SetStateAction<SearchFilter>>;
}

export default function ReportFilter({
	searchFilterState,
	setSearchFilterState,
	setSearchParams,
	regionInfo,
	setReportFilter,
}: ReportFilterProps) {
	const [regionSelectors, setRegionSelectors] = useState<string[] | null>([]);
	const { selectedDate, displayRegions: regions } = searchFilterState;

	const resetFilter = () => {
		setSearchFilterState(searchFilterStateDefaultValue);
		setRegionSelectors([generateUniqueId()]);
	};

	const applyFilter = () => {
		if (selectedDate) {
			const startDate = getFirstDayOfMonth(selectedDate);
			const endDate = getEndDayOfMonth(startDate);
			setReportFilter((prev) => ({
				...prev,
				selectedRange: { startDate, endDate },
				regions,
			}));

			const start = dateFormat(startDate, "yyyyMM");
			const region = getRegionCodes(regions)[0];
			setSearchParams({ start, region });
		}
	};

	useEffect(() => {
		const newId = generateUniqueId();
		setRegionSelectors([newId]);
	}, []);

	const endDate = JSON.parse(sessionStorage.getItem('info')!).endDate;
	const changeDate = new Date(endDate.slice(0, 4), endDate.slice(4, 6), 1);
	
	const [date, setDate] = useState(changeDate);
	const { useRegionInfoQuery } = useRegionInfo();
	const { data, isLoading } = useRegionInfoQuery(changeDateToString(getFirstDayOfMonth(date)).toString().slice(0, 6));

	if (!regionSelectors) return <Spinner />;

	return (
		<RoundedBox border>
			<h3 className="mb-4 text-lg font-semibold">필터설정</h3>
			<div className="grid grid-cols-3 items-end gap-4">
				<DateSelectorContainer
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
					onlyMonth
					setDate={setDate}
				/>
				{data ? <RegionSelectorContainer
					regionSelectors={regionSelectors}
					setRegionSelectors={setRegionSelectors}
					searchFilterState={searchFilterState}
					setSearchFilterState={setSearchFilterState}
					regionInfo={data.filteredInfo}
					hasAddRegionButton={false}
					isAdmRender={false}
				/>
				: <RegionSelectorContainerSkeleton />
				}
				<ButtonGroup justify="justify-end">
					<BaseButton title="초기화" color="outlined" Icon={IconReset} onClick={resetFilter} />
					<BaseButton title="확인" onClick={applyFilter} />
				</ButtonGroup>
			</div>
		</RoundedBox>
	);
}
