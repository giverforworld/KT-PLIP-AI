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

import AlpOptionBox from "@/components/gis/menutab/analysisType/AlpOptionBox";
import MopOptionBox from "@/components/gis/menutab/analysisType/MopOptionBox";
import LlpOptionBox from "@/components/gis/menutab/analysisType/LlpOptionBox";
import FlpOptionBox from "@/components/gis/menutab/analysisType/FlpOptionBox";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { initialTempSettings } from "@/constants/gis";
import GisTabMenu from "./GisTabMenu";
import { isEqual } from "lodash";
import { changeDateToString } from "@/utils/date";
import { useTabTypeStore } from "@/store/gis/tabType";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";

interface GisOptionContainerProps {
	mapIdx?: 0 | 1;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	onApplySettings: (next:GisSettings)=>void;
}

const analysisComponents: any = {
	ALP: AlpOptionBox,
	MOP: MopOptionBox,
	LLP: LlpOptionBox,
	FLP: FlpOptionBox,
};

const analysisTypeOrder = ["ALP", "MOP", "LLP", "FLP"];

export default function GisOptionContainer({
	mapIdx = 0,
	gisSettings,
	setGisSettings,
}: Readonly<GisOptionContainerProps>) {
	const tabValue = useTabTypeStore((s) => s.tabType);
	const setTabValue = useTabTypeStore((s) => s.setActiveTab);
	const isSearch = useIsAnalysisStore((s) => s.isAnalysis);
	const setIsSearch = useIsAnalysisStore((s) => s.setIsAnalysis);
	const [tempSettings, setTempSettings] = useState(gisSettings);
	const prevTempSettings = useRef(tempSettings);
	const shouldApplyRef = useRef(false);
	const isEditingRef = useRef(false);

	const endDate = JSON.parse(sessionStorage.getItem("info")!).endDate;

	// 부모 -> temp 동기화
	useEffect(()=>{
		if(isEditingRef.current) return;
		if(!gisSettings.isSelfAnalysis){
			setTempSettings(gisSettings);
			return;
		}
		if(!isEqual(gisSettings, tempSettings)){
			setTempSettings(gisSettings);
		}
	},[gisSettings])
	useEffect(() => {
		if (gisSettings.isSelfAnalysis) {
			if (gisSettings.maps[mapIdx]?.isSideBar) {
				if (tabValue !== gisSettings.analysisType) {
					let newMaps: any = [...initialTempSettings.maps];
					// newMaps[0] = { ...newMaps[0], startDate: Number(endDate), endDate: Number(endDate) };
					// newMaps[1] = { ...newMaps[1], startDate: Number(endDate), endDate: Number(endDate) };
					newMaps[0] = {
						...newMaps[0],
						startDate: Number(endDate.slice(0, 6)),
						endDate: Number(endDate.slice(0, 6)),
						dataType: 0,
					};
					newMaps[1] = {
						...newMaps[1],
						startDate: Number(endDate.slice(0, 6)),
						endDate: Number(endDate.slice(0, 6)),
						dataType: 0,
					};

					setTempSettings({
						...initialTempSettings,
						regionName: gisSettings.regionName,
						regionCode: gisSettings.regionCode,
						regionCodeArr: gisSettings.regionCodeArr,
						regionNameArr: gisSettings.regionNameArr,
						analysisType: tabValue,
						maps: newMaps,
					});
				} else
					setTempSettings((prev) => ({
						...gisSettings,
						analysisType: tabValue,
					}));
			} else {
				setTempSettings((prev) => ({
					...prev,
					analysisType: tabValue,
					isGrid: tabValue === 3,
				}));
			}
		} else {
			setTempSettings(gisSettings);
		}
		// setTempSettings((prev) => ({
		// 	...prev,
		// 	maps: [
		// 		{ ...prev.maps[0], startDate: endDate.slice(0, 6), endDate: endDate.slice(0, 6) },
		// 		{ ...prev.maps[1], startDate: endDate.slice(0, 6), endDate: endDate.slice(0, 6) },
		// 	],
		// }));
	}, [tabValue, gisSettings, mapIdx]);

	useEffect(() => {
		setDate(defaultDate);
	}, [tabValue]);

	useEffect(() => {
		if (!isEqual(prevTempSettings.current, gisSettings)) {
			setTempSettings((prevSettings) => {
				const updatedSettings = {
					...prevSettings,
					maps: prevSettings.maps.map((map, index) =>
						index === mapIdx
							? { ...map, isSearch: false, isSelectNewOption: true }
							: gisSettings.maps[index],
					),
				};

				// 상태가 변경된 경우에만 업데이트
				if (!isEqual(updatedSettings, prevSettings)) {
					prevTempSettings.current = updatedSettings;
					return updatedSettings;
				}
				return prevSettings;
			});
		} else if (!tempSettings.isSelfAnalysis) {
			const updatedSettings = { ...gisSettings, analysisType: tabValue };
			if (!isEqual(prevTempSettings.current, updatedSettings)) {
				prevTempSettings.current = updatedSettings;
				setTempSettings(updatedSettings);
			}
		}
	}, [gisSettings, mapIdx, tabValue]);

	useEffect(() => {
		if (gisSettings.isDual && tempSettings.analysisType === gisSettings.analysisType) {
			setTempSettings((prevSettings) => ({
				...prevSettings,
				maps: prevSettings.maps.map((map, index) =>
					index === mapIdx ? gisSettings.maps[index] : { ...map },
				),
			}));
		}
	}, [gisSettings.isDual, gisSettings.analysisType, tempSettings.analysisType, mapIdx]);
	useEffect(() => {
		if (!shouldApplyRef.current) return;

		shouldApplyRef.current = false;

		if (!isEqual(tempSettings, gisSettings)) {
			setGisSettings(tempSettings);
		}
	}, [tempSettings]);
	const handleSearchClick = () => {
		shouldApplyRef.current = true;

		setTempSettings((prevSettings) => {
			const updatedSettings = {
				...prevSettings,
				maps: prevSettings.maps.map((map, index) =>
					index === mapIdx
						? {
								...map,
								isSearch: true,
								isSelectNewOption: false,
								isVectorAnalysis:
									gisSettings.visualizeOption === 1 && map.isVectorAnalysis !== false
										? false
										: true,
							}
						: { ...map },
				),
				visualizeOption: gisSettings.visualizeOption !== 0 ? 0 : gisSettings.visualizeOption,
				regionCode:
					prevSettings.regionCode.toString().slice(0, 2) === "51" &&
					Number(changeDateToString(date).toString().slice(0, 6)) < 202307
						? Number("42" + prevSettings.regionCode.toString().slice(2))
						: prevSettings.regionCode.toString().slice(0, 2) === "52" &&
							  Number(changeDateToString(date).toString().slice(0, 6)) < 202403
							? Number("45" + prevSettings.regionCode.toString().slice(2))
							: prevSettings.regionCode.toString().slice(0, 2) === "42" &&
								  Number(changeDateToString(date).toString().slice(0, 6)) > 202306
								? Number("51" + prevSettings.regionCode.toString().slice(2))
								: prevSettings.regionCode.toString().slice(0, 2) === "45" &&
									  Number(changeDateToString(date).toString().slice(0, 6)) > 202402
									? Number("52" + prevSettings.regionCode.toString().slice(2))
									: prevSettings.analysisSubType === 1
										? Number(prevSettings.regionCode.toString().slice(0, 2))
										: prevSettings.regionCode,
			};
			// onApplySettings(updatedSettings);

			return updatedSettings;
		});

		setIsSearch(mapIdx, !isSearch[mapIdx]);
	};

	

	const year = endDate.slice(0, 4);
	const month = endDate.slice(4, 6);
	const defaultDate = new Date(`${year}, ${month}, 1`);
	const [date, setDate] = useState(defaultDate);

	const renderOptionComponent = useCallback(() => {
		const Component = analysisComponents[analysisTypeOrder[tabValue]];
		return Component ? (
			<Component
				mapIdx={mapIdx}
				tabValue={tabValue}
				gisSettings={gisSettings}
				setGisSettings={setGisSettings}
				tempSettings={tempSettings}
				setTempSettings={setTempSettings}
				handleSearchClick={handleSearchClick}
				date={date}
				setDate={setDate}
				defaultDate={defaultDate}
			/>
		) : null;
	}, [tabValue, gisSettings, setGisSettings, tempSettings, setTempSettings]);

	return (
		<div
			className={`flex h-full items-center justify-center shadow-gis-custom ${mapIdx === 1 ? "relative top-[66px]" : "top-[38px]"}`}
		>
			{gisSettings.isMenuOpen && (
				<div className="z-50 flex h-full w-[400px] flex-col gap-2 border-r bg-[#F7F8F9]">
					<GisTabMenu
						{...{
							mapIdx,
							setTabValue,
							gisSettings,
							setGisSettings,
							tempSettings,
							setTempSettings,
							initialTempSettings,
						}}
					/>
					{renderOptionComponent()}
				</div>
			)}
		</div>
	);
}
