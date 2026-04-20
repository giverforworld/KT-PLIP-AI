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

import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from "react";
import Logo from "@/components/logo/Logo";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";
import Spinner from "@/components/loading/Spinner";
import DataContainer from "../common/data/DataContainer";
import ReportMap from "./ReportMap";
import { changeDateToString, dateFormat } from "@/utils/date";
import { scrollToTargetContainer } from "@/utils/scroll";
import { formatStatSummaryString } from "@/containers/common/data/StatSummary";
import { endOfMonth } from "date-fns";

interface ReportContentsProps {
	data: ReportResult | undefined;
	reportFilter: SearchFilter;
	isTabFixed: boolean;
	setIsTabFixed: Dispatch<SetStateAction<boolean>>;
	isLoading: boolean;
	region: string;
	searchParams: { start: string; region: string };
}

type ReportTab = {
	id: string;
	name: string;
	data?: DataContainer[];
};

export default function ReportContents({
	data,
	reportFilter,
	isTabFixed,
	setIsTabFixed,
	isLoading,
	region,
	searchParams,
}: ReportContentsProps) {
	const tabRef = useRef<HTMLDivElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const reportElRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	const tabList: ReportTab[] = [
		{ id: "report-summary", name: "요약" },
		{ id: "report-mop", name: "생활이동", data: data?.mop },
		{ id: "report-alp", name: "생활인구", data: data?.alp },
		{ id: "report-llp", name: "체류인구", data: data?.llp },
	];
	const [activeTabId, setActiveTabId] = useState(tabList[0].id);
	const activeTabRef = useRef(activeTabId);
	const regionName = `${reportFilter.regions[0].sido.name} ${reportFilter.regions[0].sgg.name} ${reportFilter.regions[0].adm.name}`;

	const year = Number(searchParams.start.slice(0, 4));
	const month = Number(searchParams.start.slice(4, 6)) - 1;
	const startDate = new Date(year, month, 1);

	const handleTabClick = (tab: ReportTab) => {
		const reportEl = document.getElementById("report");

		setActiveTabId(tab.id);
		scrollToTargetContainer(reportEl, tab.id, 50);
	};

	// 옵저버 생성
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const createObserver = () => {
		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.target === sentinelRef.current) {
						setIsTabFixed(!entry.isIntersecting);
					}

					if (entry.isIntersecting) {
						const visibleSectionId = entry.target.id;

						// 상태가 변경된 경우에만 업데이트
						if (activeTabRef.current !== visibleSectionId) {
							activeTabRef.current = visibleSectionId;
							setActiveTabId(visibleSectionId); // 상태 업데이트 최소화
						}
					}
				});
			},
			{ threshold: 0.5 },
		);

		tabList.forEach((tab) => {
			const section = document.getElementById(tab.id);
			if (section && observerRef.current) {
				observerRef.current.observe(section);
			}
		});

		if (sentinelRef.current && observerRef.current) {
			observerRef.current.observe(sentinelRef.current);
		}
	};

	useEffect(() => {
		createObserver();

		const handleScroll = () => {
			if (reportElRef.current && sentinelRef.current) {
				const sentinelTop = sentinelRef.current.offsetTop;
				setIsTabFixed(reportElRef.current.scrollTop > sentinelTop);
			}
		};

		reportElRef.current?.addEventListener("scroll", handleScroll);

		return () => {
			if (observerRef.current && sentinelRef.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				observerRef.current.unobserve(sentinelRef.current);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
			reportElRef.current?.removeEventListener("scroll", handleScroll);
		};
	}, [createObserver, setIsTabFixed]);

	return (
		<div
			ref={reportElRef}
			id="report"
			className="custom-scrollbar whitespace-pre-lines overflow-y-auto break-keep"
		>
			<div id="report-title" className="py-4">
				<Logo width={120} />
				<h3 className="text-2xl">
					<strong className="font-extrabold">{regionName}</strong> <span>분석 리포트</span>
				</h3>
			</div>

			<div ref={sentinelRef}></div>

			{/* Tab */}
			<div
				ref={tabRef}
				className={`mb-3 ${isTabFixed ? "absolute top-0 z-[40] w-full bg-white" : ""}`}
			>
				<Tab type="line">
					{tabList.map((item) => (
						<TabItem
							key={item.id}
							type="line"
							isActive={activeTabId === item.id}
							onClick={() => handleTabClick(item)}
						>
							{item.name}
						</TabItem>
					))}
				</Tab>
			</div>

			{/* Summary */}
			<div id={tabList[0].id} className="report-contents py-2">
				<p className="pb-4 text-xl font-semibold">요약</p>
			</div>
			<div className="report-contents py-2">
				<div className="flex items-end justify-between px-1">
					<h4 className="font-semibold">분석범위</h4>
					<span className="text-sm">분석일자: {dateFormat(new Date(), "yyyy. MM. dd")}</span>
				</div>
			</div>

			{/* Table */}
			<div className="report-contents py-2">
				<table className="w-full text-sm">
					<caption className="hidden">분석범위</caption>
					<colgroup>
						<col style={{ width: "8%" }} />
						<col style={{ width: "39%" }} />
						<col style={{ width: "auto" }} />
						<col style={{ width: "10%" }} />
						<col style={{ width: "39%" }} />
					</colgroup>
					<tbody>
						<tr>
							<th scope="row" className="py-2 pr-2">
								<span>• 시간적 범위</span>
							</th>
							<td className="py-2 pl-2">
								<span>{formatDateRange(startDate, endOfMonth(startDate))}</span>
							</td>
							<td></td>
							<th scope="row" className="py-2">
								<span>• 공간적 범위</span>
							</th>
							<td className="py-2">
								<span>{regionName}</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* Map */}
			<div className="report-contents pb-4 pt-2">
				<ReportMap regionCode={Number(region)} start={searchParams.start.slice(0, 6)} />
			</div>

			{/* keyword */}
			<div className="pb-6 pt-2 text-black">
				<span className="text-base font-semibold">• 데이터별 요약</span>

				{data?.summary.map((item, index) => {
					return (
						<div key={index} className="report-contents py-4">
							<span className="block pb-4 text-base font-semibold">
								{index + 1}. {item.title}
							</span>
							<div className="min-w-full text-center text-sm">
								{/* Header */}
								<div className="flex items-center bg-[#FAFAFA] text-base font-medium">
									<div className="w-1/6 border-b border-r border-[#EAEAEA] px-4 py-2">
										<span>요약 키워드</span>
									</div>
									<div className="border-[#EAEAEA]px-4 w-5/6 border-b py-2">
										<span className="text-primary">요약 내용</span>
									</div>
								</div>

								{/* Body */}
								<div>
									{item.data.map((t: any, i: any) => (
										<div key={i} className="flex border-[#EAEAEA] text-sm">
											<div className="w-1/6 border-r bg-[#FAFAFA] px-4 py-2 font-medium">
												<span>{t.name}</span>
											</div>
											<div className="w-5/6 px-4 py-2 text-left">
												<p>{formatStatSummaryString(t.data)}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Charts */}
			{tabList.map((tab) => (
				<ReportData key={tab.id} id={tab.id} name={tab.name} data={tab.data} />
			))}
		</div>
	);
}

const ReportData = ({ id, name, data }: ReportTab) => {
	if (id === "report-summary") return null;
	if (data)
		return (
			<>
				<div id={id} className="report-contents py-4">
					<p className="text-xl font-semibold">{name}</p>
				</div>
				<DataContainer data={data} isReport={true} />
			</>
		);
};

function formatDateRange(startDate: Date, endDate: Date): string {
	const startDateToString = dateFormat(startDate, "yyyy년 MM월 dd일");
	const endDateToString = dateFormat(endDate, "yyyy년 MM월 dd일");

	const differenceInTime = endDate.getTime() - startDate.getTime();
	const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)) + 1;

	return `${startDateToString} ~ ${endDateToString}, 총 ${differenceInDays - 1}일`;
}
