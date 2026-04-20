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

import React, { useState, useEffect } from "react";
import AnalysisCard from "./AnalysisCard";

interface AnalysisCardGridProps {
	cardInfo: {
		type: string;
		title: string;
		option: string[];
		image: string;
		settingsOption: GisSettings;
		tooltip?: string;
	}[];
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

function SkeletonCard() {
	return <div className="h-[273px] w-full animate-pulse rounded-md bg-gray-200" />;
}

export default function AnalysisCardGrid({
	cardInfo,
	gisSettings,
	setGisSettings,
}: Readonly<AnalysisCardGridProps>) {
	const [processedCardInfo, setProcessedCardInfo] = useState<typeof cardInfo | null>(null);

	const processTitle = (title: string) => {
		if (gisSettings.analysisType === 0) {
			if (gisSettings.maps[0].inOutFlow) {
				return title
					.replace("{에서/으로}", "에서")
					.replace("{출발/도착}", "출발")
					.replace("{으로/에서}", "으로")
					.replace("{유출/유입}", "유출");
			} else {
				return title
					.replace("{에서/으로}", "으로")
					.replace("{출발/도착}", "도착")
					.replace("{으로/에서}", "에서")
					.replace("{유출/유입}", "유입");
			}
		}
		return title;
	};

	useEffect(() => {
		const timeout = setTimeout(() => {
			const processedData = cardInfo.map((item) => ({
				...item,
				title: processTitle(item.title),
			}));
			setProcessedCardInfo(processedData);
		}, 1000);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cardInfo, gisSettings]);

	if (!processedCardInfo) {
		return (
			<div className="grid grid-cols-4 gap-4 py-2">
				{Array.from({ length: cardInfo?.length }).map((_, index) => (
					<SkeletonCard key={index} />
				))}
			</div>
		);
	}

	// 가공된 데이터 렌더링
	return (
		<div className="grid grid-cols-4 gap-4 py-2">
			{processedCardInfo.map((item) => (
				<AnalysisCard
					key={item.title}
					title={item.title}
					options={item.option}
					image={item.image}
					settingsOption={item.settingsOption}
					{...{ gisSettings, setGisSettings }}
					{...(item.tooltip && { tooltip: item.tooltip })}
				/>
			))}
		</div>
	);
}
