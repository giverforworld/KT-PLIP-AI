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

import { useCallback, useEffect, useState } from "react";
import FilterChip from "@/components/chips/FilterChip";
import { debounce } from "lodash";
import TextButton from "@/components/buttons/TextButton";
import DragOptionBox from "../DragOptionBox";

interface GisFilterProps {
	disabled?: boolean;
	mapIdx?: number;
	filter?: Filter;
	isFirst?: boolean;
	closeBtn?: boolean;
	isSingleSelect?: boolean;
	children?: React.ReactNode;
	gisSettings: GisSettings;
	setGisSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
	gisSettingKey?: keyof MapSettings | keyof GisSettings;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function GisFilter({
	disabled,
	mapIdx = 0,
	filter,
	closeBtn = false,
	isSingleSelect = false,
	children,
	gisSettings,
	setGisSettings,
	gisSettingKey,
	tempSettings,
	setTempSettings,
}: Readonly<GisFilterProps>) {
	const [selectedChips, setSelectedChips] = useState<number[]>(() => {
		if (gisSettingKey) {
			// const mapSettings = tempSettings?.maps?.[mapIdx] ?? gisSettings.maps?.[mapIdx];
			const mapSettings = gisSettings.isSelfAnalysis
				? (tempSettings?.maps?.[mapIdx] ?? gisSettings.maps?.[mapIdx])
				: gisSettings.maps?.[mapIdx];

			return isSingleSelect
				? (mapSettings as any)?.[gisSettingKey]
					? [0]
					: [1]
				: (mapSettings as any)?.[gisSettingKey] || [];
		}
		return [];
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSetTempSettings = useCallback(
		debounce((updatedChips) => {
			if (setTempSettings && gisSettingKey) {
				setTempSettings((prevSettings) => ({
					...prevSettings,
					isSelfAnalysis: true,
					maps: prevSettings.maps.map((map, index) =>
						index === mapIdx
							? { ...map, [gisSettingKey]: updatedChips, updateKey: gisSettingKey , isSelectNewOption:true}
							: map,
					),
				}));
			} else if (setGisSettings && gisSettingKey?.includes("moving")) {
				setGisSettings((prevSettings) => ({
					...prevSettings,
					[gisSettingKey]: updatedChips,
				}));
			}
		}, 300), // 300ms 지연시간 (필요에 따라 조정 가능)
		[gisSettingKey, setGisSettings, mapIdx],
	);

	useEffect(() => {
		debouncedSetTempSettings(selectedChips);
	}, [selectedChips, debouncedSetTempSettings]);

	const handleChipClick = (index: number) => {
		if (!filter || disabled) return;

		const hasAllOption = filter.labels.includes("전체");

		setSelectedChips((prev) => {
			let updatedSelectedChips = Array.isArray(prev) ? [...prev] : [prev];

			if (hasAllOption) {
				if (index === 0) {
					return updatedSelectedChips.includes(0) ? [1] : filter.labels.map((_, idx) => idx);
				} else {
					if (updatedSelectedChips.includes(0)) {
						updatedSelectedChips = [index];
					} else {
						updatedSelectedChips = updatedSelectedChips.includes(index)
							? updatedSelectedChips.filter((chip) => chip !== index)
							: [...updatedSelectedChips, index];
					}
				}
			} else {
				if (isSingleSelect) {
					updatedSelectedChips = [index];
				} else {
					updatedSelectedChips = updatedSelectedChips.includes(index)
						? updatedSelectedChips.filter((chip) => chip !== index)
						: [...updatedSelectedChips, index];
				}
			}

			return updatedSelectedChips.length === 0 ? [index] : updatedSelectedChips;
		});
	};
	const handleLocalChipClick = (index: number) => {
		if (!filter || disabled) return;
		setSelectedChips([index]);
	};

	return (
		<div
			className={`w-full flex-col items-start ${!tempSettings ? "px-4" : "border-t border-[#F7F8F9] bg-white p-4"}`}
		>
			{!closeBtn && (
				<>
					{filter && gisSettingKey === "timeSlot" ? (
						<div className="flex justify-between">
							{children}
							<TextButton
								title={"전체선택"}
								disabled={
									(Array.isArray(selectedChips) ? selectedChips : [selectedChips]).length ===
									filter?.labels.length
								}
								onClick={() => {
									setSelectedChips(
										Array.from({ length: filter?.labels.length }, (_, i) => length + i),
									);
								}}
							/>
						</div>
					) : (
						<> {children}</>
					)}
				</>
			)}
			{filter && gisSettingKey === "timeSlot" && (
				<DragOptionBox {...{ selectedChips, setSelectedChips, filter }} />
			)}
			{filter && gisSettingKey !== "timeSlot" && (
				<ul
					className={`${tempSettings && gisSettingKey !== "gender" ? "my-3" : gisSettingKey === "ageGroup" ? "" : "mt-2"} flex gap-2 ${disabled ? "cursor-not-allowed" : ""} w-full ${
						(gisSettingKey === "ageGroup" || gisSettingKey?.includes("moving")) &&
						(tempSettings || gisSettings.isDual)
							? "grid grid-cols-5 gap-2"
							: "custom-scrollbar overflow-x-auto pb-1"
					}`}
				>
					{filter.labels
						.filter((label) =>
							gisSettingKey === "ageGroup" || gisSettingKey?.includes("moving")
								? true
								: label !== "전체",
						)
						.map((label, index) => {
							return (
								<li
									key={label}
									className={`${gisSettingKey === "ageGroup" || gisSettingKey?.includes("moving") ? "min-w-16" : "w-full"}`}
								>
									<FilterChip
										label={label}
										// disabled={label === "전체" && (selectedChips as number[]).includes(index)}
										selected={Array.isArray(selectedChips) && selectedChips.includes(index)}
										onClick={() => {
											label === '외지인' || label === '내지인' ? handleLocalChipClick(index) : handleChipClick(index);
										}}
										fullWidth
									/>
								</li>
							);
						})}
				</ul>
			)}
		</div>
	);
}
