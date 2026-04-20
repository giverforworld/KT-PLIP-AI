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
import { useEffect, useState } from "react";
import { PATHS } from "@/constants/path";
import { tabList } from "./AvgSumUniqueTab";
import { isDataSummaryArray } from "./DataSummary";
import AccordionBox from "@/components/boxes/AccordionBox";
import ToggleButton from "@/components/buttons/ToggleButton";

// Icons
import IconPeople from "@images/stat_people.svg";
import IconEarth from "@images/stat_earth.svg";
import IconHandsup from "@images/stat_handsup.svg";
import IconMf from "@images/stat_mf.svg";
import IconMoveLocation from "@images/stat_move_location.svg";
import IconTrophy from "@images/stat_trophy.svg";
import IconTimeCount from "@images/stat_time_count.svg";
import IconInOutFlow from "@images/stat_in_out_flow.svg";
import IconInOutLocation from "@images/stat_in_out_location.svg";
import IconCalendar from "@images/stat_calendar.svg";
import IconCalendarTime from "@images/stat_calendar_time.svg";
import IconInflow from "@images/stat_inflow.svg";
import IconHouse from "@images/stat_house.svg";
import IconUpdown from "@images/stat_updown.svg";
import IconPercent from "@images/stat_percent.svg";
import IconStayPercent from "@images/stat_stay_percent.svg";
import IconNightPercent from "@images/stat_night_percent.svg";
import IconNight from "@images/stat_night.svg";
import IconTime from "@images/stat_time.svg";
import IconTrans from "@images/stat__car.svg";
import IconPurpose from "@images/stat_purpose.svg";

interface StatSummaryProps {
	statSummary: StatSummary[] | undefined;
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>[]> = {
	"mop-status": [
		IconInOutFlow,
		IconInOutLocation,
		IconTimeCount,
		IconMf,
		IconHandsup,
		IconCalendar,
	],
	"mop-purpose": [
		IconInflow,
		IconMoveLocation,
		IconTimeCount,
		IconMf,
		IconHandsup,
		IconCalendarTime,
	],
	"mop-trans": [IconInflow, IconMoveLocation, IconTimeCount, IconMf, IconHandsup, IconCalendarTime],
	"mop-rank-analysis": [
		IconInflow,
		IconStayPercent,
		IconPurpose,
		IconInflow,
		IconStayPercent,
		IconMoveLocation,
	],
	"alp-status": [IconPeople, IconMf, IconHandsup, IconMoveLocation, IconEarth, IconTrophy],
	"alp-pattern": [IconPeople, IconPeople, IconMf, IconPeople],
	"alp-comparative-analysis": [IconPeople, IconTimeCount, IconMf, IconHandsup],
	"alp-rank-analysis": [IconPeople, IconMoveLocation, IconPeople, IconMf],
	"llp-status": [IconPeople, IconHouse, IconUpdown, IconMf, IconHandsup, IconPercent],
	"llp-traits": [
		IconStayPercent,
		IconNightPercent,
		IconMoveLocation,
		IconCalendarTime,
		IconNight,
		IconTime,
	],
	"llp-rank-analysis": [
		IconPeople,
		IconHouse,
		IconTrans,
		IconStayPercent,
		IconNightPercent,
		IconPurpose,
	],
};

export default function StatSummary({ statSummary }: Readonly<StatSummaryProps>) {
	const pathname = usePathname();
	const pageName = pathname.split("/")[1];
	const subPageName = pathname.split("/")[2];
	const isRankAnalysis = subPageName === PATHS.RANK_ANALYSIS;

	const [activeTab, setActiveTab] = useState<{ key: DataSummaryKeys; name: string }>(tabList[0]);
	const [activeRegion, setActiveRegion] = useState<string | null>(null);
	const [regionNames, setRegionNames] = useState<string[]>([]);

	useEffect(() => {
		if (statSummary && statSummary.length > 0) {
			const regions = statSummary.map((item) => item.regionName);
			setRegionNames(regions);
			setActiveRegion(regions[0]);
		}
	}, [statSummary]);

	const handleToggle = (e: React.MouseEvent<HTMLElement>, selected: string) => {
		e.preventDefault();
		setActiveRegion(selected);
	};

	const currentData = statSummary?.find((item) => item.regionName === activeRegion);
	const currentDataSummary = isDataSummaryArray(currentData?.data)
		? currentData?.data[activeTab.key]
		: currentData?.data;

	const shouldDisplayTab = (tabkey: DataSummaryKeys) => {
		if (currentData) {
			const data = currentData.data;
			return Boolean(isDataSummaryArray(data) && data[tabkey]);
		}
		return Boolean();
	};

	const getGridCols = (currentData: string[]) => {
		return `grid-cols-${currentData.length / 2}`;
	};

	return (
		<AccordionBox
			title={isRankAnalysis ? "지역분석요약" : "통계요약"}
			tabState={{ activeTab, setActiveTab, shouldDisplayTab }}
		>
			<div className="mt-3">
				{regionNames.length > 1 && <ToggleButton labels={regionNames} onToggle={handleToggle} />}
			</div>

			{statSummary && statSummary.length !== 0 && regionNames.length && currentDataSummary ? (
				<div className={`mt-6 grid ${getGridCols(currentDataSummary)} grid-rows-2 gap-4`}>
					{currentDataSummary.map((item, index) => {
						const key = `${pageName}-${subPageName}`;
						const Icon = iconMap[key][index];
						return (
							<div key={index} className="flex flex-col items-center">
								<div className="flex h-[70px] w-[70px] items-center justify-center rounded-md border bg-white">
									{Icon && <Icon />}
								</div>
								<p className="break-keep p-2 text-center">{formatStatSummaryString(item)}</p>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center">데이터를 불러오지 못했습니다.</div>
			)}

			{/* <div className={`mt-6 grid grid-cols-3 grid-rows-2 gap-4`}>
				{Array.from({ length: 6 }).map((_, index) => {
					const key = `${pageName}-${subPageName}`;
					const Icon = iconMap[key][index];

					return (
						<div key={index} className="flex flex-col items-center">
							<div className="flex h-[70px] w-[70px] items-center justify-center rounded-md border bg-white">
								{Icon && <Icon />}
							</div>
						</div>
					);
				})}
			</div> */}
		</AccordionBox>
	);
}

export const formatStatSummaryString = (text: string | undefined) => {
	if (typeof text !== "string") {
		// console.error("Expected a string, but received:", typeof text);
		return null;
	}

	return (
		text
			// .replace("기타", "-")
			.split("\n")
			.map((line, lineIndex) => (
				<span key={lineIndex} className="block">
					{line.split(/({[^}]+})/g).map((part, partIndex) =>
						part.startsWith("{") && part.endsWith("}") ? (
							<span key={partIndex} className="font-semibold">
								{part.slice(1, -1)}
							</span>
						) : (
							<span key={partIndex}>{part}</span>
						),
					)}
				</span>
			))
	);
};
