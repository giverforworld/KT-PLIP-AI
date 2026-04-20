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
import { useEffect, useRef, useState } from "react";
import { PATHS } from "@/constants/path";
import { tabList } from "./AvgSumUniqueTab";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import IcontDataTitle from "@images/data_title.svg";
import DataBookmark from "./DataBookmark";
import DataDownload from "./DataDownload";
import AIReportButton from "./AIReportButton";
import { extractPageInfo } from "@/utils/validate";

import IconInfo from "@images/info.svg";
import Tooltip from "@/components/tooltipv2/Tooltipv2";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import HelperText, { helperTextList } from "@/components/text/HelperText";
import { isDataSummary, isDataSummaryArray } from "./DataSummary";
import { useSearchFilterStore } from "@/store/searchFilter";
import { useActiveTabStore } from "@/store/activeTab";

interface DataHeaderProps {
	data: DataContainer;
	isReport?: boolean;
	hasBookmark?: boolean;
}

export default function DataHeader({ data, isReport, hasBookmark }: DataHeaderProps) {
	const pathname = usePathname();
	const { pageName } = extractPageInfo(pathname);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const [buttonPosition, setButtonPosition] = useState({ left: 0, top: 0 });
	const [openTooltip, setOpenTooltip] = useState(false);

	const searchFilter = useSearchFilterStore((s)=>s.filter);

	useEffect(() => {
		if (containerRef.current && buttonRef.current) {
			const containerRect = containerRef.current.getBoundingClientRect();
			const buttonRect = buttonRef.current.getBoundingClientRect();

			const relativeLeft = buttonRect.left - containerRect.left;
			const relativeTop = buttonRect.top - containerRect.top;

			setButtonPosition({ left: relativeLeft, top: relativeTop });
		}
	}, [buttonRef]);

	const isAlpRankAnalysis =
		pageName === PATHS.ALP && ["지역 현황 모아보기", "지역 랭킹"].includes(data.title);
	const hasUnique =
		isDataSummary(data.summary) || isDataSummaryArray(data.summary) || isAlpRankAnalysis;

	const activeTab = useActiveTabStore(s=>s.activeTabs[data.title]?.tab ?? "평균");
	const setActiveTab = useActiveTabStore(s=>s.setActiveTab);
	const handleClick = () => setOpenTooltip((prev) => !prev);

	const handleTabClick = (e: React.MouseEvent<HTMLElement>, tab: string) => {
		e.preventDefault();
		setActiveTab(data.title,tab);
	};
	const isTitleEmpty = data.title === "일별 주민등록인구 대비 거주인구 비교";
	return (
		<div className={`flex justify-between ${isTitleEmpty ? "items-start" : "items-center"}`}>
			<div className={`flex gap-2 ${isTitleEmpty ? "flex-col justify-center" : "items-center"}`}>
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					<IcontDataTitle />
					<span>{data.title}</span>
				</h3>
				{helperTextList[data.title] && <HelperText text={helperTextList[data.title]} />}
			</div>

			<div ref={containerRef} className="exclude relative flex items-center gap-4">
				{!isReport && hasUnique && (
					<div className="flex items-center gap-2">
						<button ref={buttonRef} onClick={handleClick}>
							<IconInfo className="text-textLightGray" />
						</button>
						{openTooltip && buttonPosition && (
							<Tooltip setOpenTooltip={setOpenTooltip} buttonPosition={buttonPosition}>
								<p className="w-[420px]">
									평균 : 선택한 기간, 선택한 지역에 따라 시간대별 생활인구의 평균 생활인구
									<br />
									유니크 : 언제(일자·시각), 어디(소영역)에 어떤(거주, 근무, 방문)유형의 사람이
									있었는지를 중복없이 신뢰성있게 측정한 Unique 인구
								</p>
							</Tooltip>
						)}
						<Tab type="line" size="small" width="w-[150px]">
							{tabList.map((tab) => {
								if (
									data.summary &&
									!((data.summary as DataSummary) || (data.summary as DataSummaryArray))[tab.key]
								)
									return null;

								if ("지역 랭킹".includes(data.title) && tab.key === "Unique") return null;
								if (
									"지역 현황 모아보기".includes(data.title) &&
									searchFilter.dateSelector === "기간별" &&
									tab.key === "Unique"
								)
									return null;

								return (
									<TabItem
										key={tab.key}
										type="line"
										size="small"
										isActive={tab.name === activeTab}
										onClick={(e) => handleTabClick(e, tab.name)}
									>
										{tab.name}
									</TabItem>
								);
							})}
						</Tab>
					</div>
				)}

				{(!isReport || pageName === PATHS.BOOKMARK) && (
					<ButtonGroup>
						{hasBookmark && <DataBookmark data={data} />}
						<DataDownload data={data} />
						<AIReportButton data={data} />
					</ButtonGroup>
				)}
			</div>
		</div>
	);
}
