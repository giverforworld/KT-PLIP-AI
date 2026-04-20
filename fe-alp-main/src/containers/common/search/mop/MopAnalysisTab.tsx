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

import { useRef, useState, Dispatch, SetStateAction, useCallback } from "react";
import { debounce } from "lodash";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import RCAPopUp from "@images/RegionComparisonAdderPopUP.svg";
import RAAPopUp from "@images/RouteAnalysisAdderPopUP.svg";

interface MopAnalysisTabProps {
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	mopAnalysis: MopAnalysis;
	setMopAnalysis: Dispatch<SetStateAction<MopAnalysis>>;
	mopAnalysisHelperTooltip: MopAnalysis;
	setMopAnalysisHelperTooltip: Dispatch<SetStateAction<MopAnalysis>>;
}

export default function MopAnalysisTab({
	setSearchFilterState,
	mopAnalysis,
	setMopAnalysis,
	mopAnalysisHelperTooltip,
	setMopAnalysisHelperTooltip,
}: MopAnalysisTabProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const rcaTabRef = useRef<HTMLLIElement>(null);
	const raaTabRef = useRef<HTMLLIElement>(null);
	const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

	const handleMouseEnter = useCallback(
		debounce((type: "mopRca" | "mopRaa") => {
			const tabRef = type === "mopRca" ? rcaTabRef.current : raaTabRef.current;
			if (containerRef.current && tabRef) {
				const containerRect = containerRef.current.getBoundingClientRect();
				const tabRect = tabRef.getBoundingClientRect();

				const relativeLeft = tabRect.left - containerRect.left;
				const relativeTop = tabRect.bottom - containerRect.top;

				setTooltipPosition({ left: relativeLeft, top: relativeTop });
			}
			setMopAnalysisHelperTooltip((prev) => ({ ...prev, [type]: true }));
		}, 200),
		[],
	);

	const handleMouseLeave = (type: "mopRca" | "mopRaa") => {
		setMopAnalysisHelperTooltip((prev) => ({ ...prev, [type]: false }));
	};

	return (
		<div ref={containerRef}>
			<Tab type="border" size="small" width="w-auto">
				<TabItem
					ref={rcaTabRef}
					type="border"
					size="small"
					isActive={mopAnalysis.mopRca}
					onClick={(e) => {
						e.preventDefault();
						setMopAnalysis({ mopRca: true, mopRaa: false });
					}}
					onMouseOver={() => handleMouseEnter("mopRca")}
					onMouseOut={() => handleMouseLeave("mopRca")}
				>
					지역비교 분석
				</TabItem>
				<TabItem
					ref={raaTabRef}
					type="border"
					size="small"
					isActive={mopAnalysis.mopRaa}
					onClick={(e) => {
						e.preventDefault();
						setMopAnalysis({ mopRca: false, mopRaa: true });
					}}
					onMouseOver={() => handleMouseEnter("mopRaa")}
					onMouseOut={() => handleMouseLeave("mopRaa")}
				>
					출도착지 분석
				</TabItem>
			</Tab>
			{/* Tooltip */}
			{/* {mopAnalysisHelperTooltip.mopRca && !mopAnalysis.mopRca && (
				<div
					className="absolute z-20"
					style={{
						left: tooltipPosition.left + 45,
						top: tooltipPosition.top,
						transform: "translateX(-50%)",
					}}
				>
					<RCAPopUp />
				</div>
			)}
			{mopAnalysisHelperTooltip.mopRaa && !mopAnalysis.mopRaa && (
				<div
					className="absolute z-20"
					style={{
						left: tooltipPosition.left + 45,
						top: tooltipPosition.top,
						transform: "translateX(-50%)",
					}}
				>
					<RAAPopUp />
				</div>
			)} */}
		</div>
	);
}
