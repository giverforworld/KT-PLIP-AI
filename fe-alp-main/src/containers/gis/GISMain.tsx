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
import * as React from "react";
import BaseModal from "@/components/modals/BaseModal";
import RegionSelectBox from "@/components/region/RegionSelectBox_prev";
import Tooltip from "@/components/tooltip/Tooltip";
import AnalysisCardGrid from "@/components/gis/main/AnalysisCardGrid";
import { AlpAnalysis, gisPreset, LlpAnalysis, MopAnalysis } from "@/utils/filter";
import Info from "@images/info.svg";
import RoundedBox from "@/components/boxes/RoundedBox";

interface GISMainProps {
	regionInfo: Record<string, RegionInfo>;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function GISMain({
	regionInfo,
	gisSettings,
	setGisSettings,
}: Readonly<GISMainProps>) {
	const renderAnalysisContent = (cardInfo: any) => (
		<RoundedBox>
			<AnalysisCardGrid {...{ cardInfo, gisSettings, setGisSettings }} />
		</RoundedBox>
	);

	return (
		<BaseModal
			open={gisSettings.isMainModalOpen}
			setOpen={() =>
				setGisSettings((prev) => ({
					...prev,
					isSelfAnalysis: true,
					isMainModalOpen: false,
					isMenuOpen: true,
					analysisType: gisSettings.analysisType,
				}))
			}
			title="시각화 프리셋"
			subtitle="시각화 종류를 선택하세요"
			scroll={false}
		>
			<div className="flex w-full items-center justify-between py-4">
				<div className="flex w-full items-center justify-start">
					<Info />
					<h3 className="w-full text-sm font-normal text-textLightGray">{`시각화 종류 선택 후 세부항목은 수정할 수 있습니다.`}</h3>
				</div>
				<div className="flex w-full items-center justify-end gap-2">
					<p className="break-keep text-center">지역</p>
					<RegionSelectBox
						// {...(activeOption === "체류인구" && { isAdm: true })}
						{...{ regionInfo, gisSettings, setGisSettings }}
					/>
				</div>
			</div>

			<div className="custom-scrollbar mt-3 h-[500px] w-full overflow-y-auto">
				{renderAnalysisContent(gisPreset)}
			</div>
		</BaseModal>
	);
}
