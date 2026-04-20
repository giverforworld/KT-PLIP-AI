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

import { useRouter } from "next/navigation";
import { useState } from "react";
import { basePath, PATHS } from "@/constants/path";
import BaseButton from "@/components/buttons/BaseButton";
import IconDashboard from "@images/dashboard.svg";
import IconBookmark from "@images/bookmark_das.svg";
import IconReport from "@images/report.svg";
import ReportModal from "../report/ReportModal";
import { useShowToast } from "@/hooks/useToastShow";
import { filterRegionInfo } from "@/services/filterRegionInfo";

interface DashboardMenuProps {
	regionInfo: Record<string, RegionInfo>;
	userInfo: User;
	pageName?: string;
}

export default function DashboardMenu({ regionInfo, userInfo, pageName }: DashboardMenuProps) {
	const router = useRouter();
	const [openReportModal, setOpenReportModal] = useState(false);

	const showToast = useShowToast();

	const handleByAuth = () => {
		showToast("스탠다드, 프리미엄 회원만 이용 가능합니다", "info");
	};

	// 회원 조건에 따른 지역
	const filteredInfo = filterRegionInfo(regionInfo, userInfo.baseInfo, userInfo.apdInfo);

	const dashboardMenuList: {
		name: string;
		icon: React.FC<React.SVGProps<SVGSVGElement>>;
		onClick: () => void;
	}[] = [
		{
			name: "지역별 대시보드",
			icon: IconDashboard,
			onClick: () =>
				userInfo.alpAuthCd === "4"
					? handleByAuth()
					: window.open(`${window.location.origin}${basePath}/${PATHS.REG_DAS}`, "_blank"),
		},
		{
			name: "북마크 관리",
			icon: IconBookmark,
			onClick: () =>
				userInfo.alpAuthCd === "4" ? handleByAuth() : router.push(`/${PATHS.BOOKMARK}`),
		},
		{
			name: "지역 분석 리포트 발급",
			icon: IconReport,
			onClick: () => (userInfo.alpAuthCd === "4" ? handleByAuth() : setOpenReportModal(true)),
		},
	];

	return (
		<>
			<ul className="flex items-center gap-2">
				{dashboardMenuList.map((item) => (
					<li key={item.name} onClick={item.onClick}>
						<BaseButton color="outlined" title={item.name} Icon={item.icon} />
					</li>
				))}
			</ul>
			{openReportModal && (
				<ReportModal
					open={openReportModal}
					setOpen={setOpenReportModal}
					userInfo={userInfo}
					regionInfo={filteredInfo}
				/>
			)}
		</>
	);
}
