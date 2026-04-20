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
import BaseButton from "@/components/buttons/BaseButton";
import SlideButton from "@/components/buttons/SlideButton";
import * as React from "react";

type RegionAnalysisProps = {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	mapIdx: number;
	handleModalClose: (modalName: ModalOrButtonKey) => void;
};

export default function RegionAnalysis({
	gisSettings,
	setGisSettings,
	mapIdx,
	handleModalClose,
}: Readonly<RegionAnalysisProps>) {
	const filter0: Array<{ name: string; regionAnalysisDistrict: 0 | 1 | 2 }> = [
		{ name: "시도", regionAnalysisDistrict: 0 },
		{ name: "시군구", regionAnalysisDistrict: 1 },
		{ name: "읍면동", regionAnalysisDistrict: 2 },
	];
	const filter1: Array<{ name: string; regionAnalysisDistrict: 0 | 1 | 2 }> = [
		{ name: "같은 시도 내 지역 비교", regionAnalysisDistrict: 0 },
		{ name: "인구감소지역 비교", regionAnalysisDistrict: 1 },
	];
	const filter = gisSettings.maps[0].regionAnalysisType === 0 ? filter0 : filter1;
	const [selectedButton, setSelectedButton] = React.useState<number | null>(0);

	const handleTypeChange = (value: 0 | 1 | 2) => {
		setSelectedButton(0);
		setGisSettings((prev) => ({
			...prev,
			maps: prev.maps.map((map) => ({
				...map,
				regionAnalysisType: value === 2 ? 1 : value,
				regionAnalysisDistrict: 0,
			})),
		}));
	};
	const handleButtonClick = (index: number) => {
		setSelectedButton(index);
		setGisSettings((prev) => ({
			...prev,
			maps: prev.maps.map((map) => ({
				...map,
				regionAnalysisDistrict: filter[index].regionAnalysisDistrict,
			})),
		}));
	};

	return (
		<div className="flex max-w-72 flex-col">
			<div className="flex min-w-72 items-center justify-between pb-2">
				<h3 className="font-semibold">지역 비교</h3>
				<SlideButton
					options={[
						{
							value: 0,
							label: "공간벡터분석",
							name: "SpaceVectorAnalysis",
						},
						{
							value: 1,
							label: "지역비교",
							name: "RegionComparison",
						},
					]}
					initialValue={gisSettings.maps[0].regionAnalysisType}
					selectedValue={gisSettings.maps[0].regionAnalysisType}
					onChange={(value: 0 | 1 | 2) => handleTypeChange(value)}
				/>
			</div>
			<p className="rounded-lg py-2 text-sm text-black">
				지역 비교를 활성화하면 공간벡터분석은 해제되고, 지역 간 비교기능이 활성화됩니다.
			</p>

			{gisSettings.maps[0].regionAnalysisType === 0 && (
				<h3 className="font-semibold">행정구역 크기</h3>
			)}
			<ul className="my-2 flex w-full gap-2">
				{filter.map((label, index) => (
					<BaseButton
						key={label.name}
						title={label.name}
						color={selectedButton === index ? "primary_light" : "gray"}
						fullWidth
						onClick={() => handleButtonClick(index)}
					/>
				))}
			</ul>
			<BaseButton
				title="닫기"
				fullWidth
				color={"outlined"}
				onClick={() => handleModalClose("regionAnalysis")}
			/>
		</div>
	);
}
