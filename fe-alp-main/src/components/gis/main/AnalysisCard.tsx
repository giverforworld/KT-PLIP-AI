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
import Tooltip from "@/components/tooltip/Tooltip";
import Image from "next/image";
import { basePath } from "@/constants/path";
import { useTabTypeStore } from "@/store/gis/tabType";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";

interface AnalysisCard {
	title: string;
	options: string[];
	image: string;
	settingsOption: GisSettings;
	tooltip?: string;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function AnalysisCard({
	title,
	options,
	image,
	settingsOption,
	tooltip,
	gisSettings,
	setGisSettings,
}: Readonly<AnalysisCard>) {
	const setTabValue = useTabTypeStore(s=>s.setActiveTab);
	const setIsSearch = useIsAnalysisStore(s=>s.setIsAnalysis);

	const isDisabled =
		gisSettings.regionCode.toString().length > 5 && settingsOption.analysisType === 2;

	const handleAnalysisOption = () => {
		if (isDisabled) return;

		setIsSearch(0, true);
		setTabValue(settingsOption.analysisType);
		setGisSettings((prev) => {
			const updatedMaps = prev.maps.map((existingMap, index) => {
				if (index === 0) {
					return {
						...existingMap,
						...settingsOption.maps[0],
						isSearch: true,
						isSelectNewOption: false,
						isSideBar: true,
					};
				}
				return existingMap;
			});

			return {
				...prev,
				...settingsOption,
				maps: updatedMaps,
				isMenuOpen: !gisSettings.isMenuOpen,
				isMainModalOpen: !gisSettings.isMainModalOpen,
			};
		});
	};

	return (
		<button
			className={`card flex flex-col items-center justify-between rounded-lg bg-white p-4 ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
			onClick={handleAnalysisOption}
			disabled={isDisabled}
		>
			<div className="flex w-full flex-col items-center">
				{tooltip && (
					<div className="flex w-full justify-start">
						<Tooltip
							bgcolor
							closeButton
							message={"선택한 지역과 관계없이 인구감소지역의 체류인구를 보여줍니다."}
						/>
					</div>
				)}
				<Image
					alt="프리셋"
					src={`${basePath}/images/gis/${image}.png`}
					width={100}
					height={100}
					unoptimized={true}
				/>
				<h3 className="whitespace-pre-line p-2 text-center text-sm font-medium text-[#333333]">
					{title.replace("{region}", gisSettings.regionName)}
				</h3>
			</div>

			<div className="flex flex-wrap justify-center gap-2 p-2">
				{options.map((option, index) => (
					<span
						key={option}
						className={`px-1 text-xs ${option.includes("유입") || option === "생활패턴" ? "bg-primary-light text-primary" : option === "유출" ? "bg-[#F0F6FF] text-[#365D96]" : option === "인구감소지역" ? "bg-[#F3F1FF] text-[#7C69EF]" : "bg-[#F5F5F5] text-[#595959]"}`}
					>
						{option.replace("{region}", gisSettings.regionName)}
					</span>
				))}
			</div>
		</button>
	);
}
