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
import { searchFilterDefaultValue, searchFilterStateDefaultValue } from "@/context/defaultValues";
import useGetData from "@/hooks/queries/useGetData";
import BaseModal from "@/components/modals/BaseModal";
import Dimmed from "@/components/modals/Dimmed";
import ReportSpinner from "@/components/loading/ReportSpinner";
import IconPrint from "@images/print.svg";
import ReportFilter from "./ReportFilter";
import ReportContents from "./ReportContents";
import { ExportReportToPdf } from "@/utils/dataExport";
import { getEndDayOfMonth, getFirstDayOfMonth, dateFormat } from "@/utils/date";
import { getRegionCodes } from "@/utils/query";
import { useShowToast } from "@/hooks/useToastShow";
import { useDateRangeStore } from "@/store/dateRange";

interface ReportModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	userInfo: User;
	regionInfo: Record<string, RegionInfo>;
}

export default function ReportModal({ open, setOpen, userInfo, regionInfo }: ReportModalProps) {
	const [isTabFixed, setIsTabFixed] = useState(false);
	const [isExportLoading, setIsExportLoading] = useState(false);
	const dateRange = useDateRangeStore((s)=> s.dateRange);
	
	const [searchFilterState, setSearchFilterState] = useState({
		...searchFilterStateDefaultValue,
		displayRegions: [
			{
				sido: {
					name: userInfo.baseRegion.sido.name,
					code: userInfo.baseRegion.sido.code,
				},
				sgg: {
					name: userInfo.baseInfo > 100 ? userInfo.baseRegion.sgg.name : "",
					code: userInfo.baseInfo > 100 ? userInfo.baseRegion.sgg.code : "",
				},
				adm: { name: "", code: "" },
			},
		],
	});
	
	const { displayRegions: regions, selectedDate } = searchFilterState;

	const [searchParams, setSearchParams] = useState<{ start: string; region: string }>({
		start: dateFormat(dateRange.maxDate, "yyyyMM"),
		region: getRegionCodes(regions)[0],
	});

	const { start, region } = searchParams;

	const startDate = getFirstDayOfMonth(selectedDate);
	const endDate = getEndDayOfMonth(startDate);
	const [reportFilter, setReportFilter] = useState<SearchFilter>({
		...searchFilterDefaultValue,
		regions: [
			{
				sido: {
					name: userInfo.baseRegion.sido.name,
					code: userInfo.baseRegion.sido.code,
				},
				sgg: {
					name: userInfo.baseInfo > 100 ? userInfo.baseRegion.sgg.name : "",
					code: userInfo.baseInfo > 100 ? userInfo.baseRegion.sgg.code : "",
				},
				adm: { name: "", code: "" },
			},
		],
		selectedRange: { startDate, endDate },
	});

	const { useReportQuery } = useGetData();
	const { data: reportResult, isLoading: isReportResultLoading } = useReportQuery(start, region);

	const regionName = `${reportFilter.regions[0].sido.name} ${reportFilter.regions[0].sgg.name} ${reportFilter.regions[0].adm.name}`;
	const reportName = `${regionName}_분석_리포트`;

	const showToast = useShowToast();
	// const testAccount = JSON.parse(sessionStorage.getItem('TA')!);

	// 출력 버튼 클릭 핸들러
	const handleExportReport = async () => {
		// if (testAccount === "N") {
			setIsExportLoading(true); // 로딩 시작
			try {
				await ExportReportToPdf(reportName);
			} catch (error) {
				console.error("Error while exporting report:", error);
			} finally {
				setIsExportLoading(false); // 로딩 종료
			}
		// }
		// else {
		// 	showToast("다운로드 권한이 없습니다", "info");
		// }
	};

	return (
		<BaseModal
			open={open}
			setOpen={setOpen}
			title="지역 분석 리포트"
			width="xl:w-[75%] w-[90%]"
			padding="px-7 pt-5 pb-7"
			buttons={[
				{
					title: isExportLoading ? "출력 중..." : "출력하기",
					Icon: IconPrint,
					onClick: handleExportReport,
					color: "black",
					disabled: isExportLoading,
				},
			]}
			scroll={false}
		>
			{isExportLoading && (
				<ReportLoadingDimmed message="요청하신 데이터를 PDF 파일로 출력 중입니다." />
			)}
			{isReportResultLoading && <ReportLoadingDimmed message="리포트를 준비 중입니다." />}

			<div className="relative flex h-[80vh] flex-col overflow-hidden">
				<div className={isTabFixed ? "hidden" : "block"}>
					<ReportFilter
						searchFilterState={searchFilterState}
						setSearchFilterState={setSearchFilterState}
						setSearchParams={setSearchParams}
						regionInfo={regionInfo}
						setReportFilter={setReportFilter}
					/>
				</div>
				<ReportContents
					data={reportResult}
					reportFilter={reportFilter}
					isTabFixed={isTabFixed}
					setIsTabFixed={setIsTabFixed}
					isLoading={isReportResultLoading}
					region={region}
					searchParams={searchParams}
				/>
			</div>
		</BaseModal>
	);
}

const ReportLoadingDimmed = ({ message }: { message: string }) => {
	return (
		<Dimmed>
			<div className="flex flex-col items-center justify-center pt-2 text-xl font-bold text-white">
				<ReportSpinner />
				<span className="mt-6">{message}</span>
				<span>잠시만 기다려 주세요.</span>
			</div>
		</Dimmed>
	);
};
