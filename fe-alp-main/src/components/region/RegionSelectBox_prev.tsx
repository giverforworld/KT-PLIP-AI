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

import * as React from "react";
import { FaChevronDown } from "react-icons/fa";
import { RadioButton } from "../buttons/RadioButton";
import { getRegionString } from "@/libs/gisOptionFunc";
import { useShowToast } from "@/hooks/useToastShow";
import { UserContext } from "@/context/UserProviderContainer";

interface RegionSelectBoxProps {
	isAdm?: boolean;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	regionInfo: Record<string, RegionInfo>;
	tempSettings?: TempSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<TempSettings>>;
}

export default function RegionSelectBox({
	isAdm,
	gisSettings,
	setGisSettings,
	regionInfo,
	tempSettings,
	setTempSettings,
}: Readonly<RegionSelectBoxProps>) {
	const showToast = useShowToast();

	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const [showRegionSelect, setShowRegionSelect] = React.useState(false);
	const selectedSidoRadioRef = React.useRef<HTMLInputElement | null>(null);
	const selectedSggRadioRef = React.useRef<HTMLInputElement | null>(null);
	const selectedAdmRadioRef = React.useRef<HTMLInputElement | null>(null);

	// gisSettings 또는 tempSettings에서 값을 가져오도록 설계
	const [tempRegion, setTempRegion] = React.useState({
		name: gisSettings?.regionName ?? tempSettings?.regionName ?? "",
		code: gisSettings?.regionCode?.toString() ?? tempSettings?.regionCode?.toString() ?? "",
	});

	let foundRegionInfo = regionInfo[tempRegion.code] ?? regionInfo[gisSettings?.regionCode];
	// const context = React.useContext(UserContext);
	// if (!context) {
	// 	throw new Error("GIScontainer must be used within a UserProderContainer");
	// }
	// let time = tempSettings?.startDate;
	
	// const { user } = context;
	// let foundRegionInfo = regionInfo[user?.baseRegion.sgg.code.slice(0,2) === '51' && time! < 202307 
	// 	? '42'+user?.baseRegion.sgg.code.slice(2)
	// 	: user?.baseRegion.sgg.code.slice(0,2) === '52' && time! < 202403 
	// 	? '45'+user?.baseRegion.sgg.code.slice(2)
	// 	: user?.baseRegion.sgg.code.slice(0,2) === '42' && time! > 202306 
	// 	? '51'+user?.baseRegion.sgg.code.slice(2)
	// 	: user?.baseRegion.sgg.code.slice(0,2) === '45' && time! > 202402 
	// 	? '52'+user?.baseRegion.sgg.code.slice(2)
	// 	: user?.baseRegion.sgg.code ?? user?.baseRegion.sido.code!
	// 	] 
	// 	?? regionInfo[tempSettings?.regionCode!]
	// 	?? regionInfo[gisSettings.regionCode];

	// 모달 외부 클릭 시 닫기
	const handleClickOutside = (event: MouseEvent) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
			if (gisSettings.analysisType === 1 && tempRegion.code.length === 2) {
				showToast("시군구 또는 읍면동을 선택해주세요.", "info");
				return;
			}
			handleConfirm(); // 선택 내용을 적용
			setShowRegionSelect(false); // 모달 닫기
		}
	};
	React.useEffect(() => {
		if (showRegionSelect) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [foundRegionInfo, showRegionSelect]);

	React.useEffect(() => {
		if (gisSettings.analysisType === 1 && tempRegion.code.length === 2) {
			setTempRegion({
				name: gisSettings?.regionName,
				code: gisSettings?.regionCode?.toString(),
			});
			setShowRegionSelect(false);
		}
	}, [gisSettings]);

	const handleInputClick = () => {
		if (
			gisSettings.analysisType === 1 &&
			tempRegion.code.length === 2 // 특정 조건에서 닫히지 않음
		) {
			showToast("시군구 또는 읍면동을 선택해주세요.", "info");
		} else {
			setShowRegionSelect(!showRegionSelect);
		}
	};

	const handleConfirm = () => {
		// setGisSettings가 존재할 경우 gisSettings에 반영
		if (setTempSettings) {
			setTempSettings((prev: any) => ({
				...prev,
				regionName: tempRegion.name,
				regionCode: tempRegion.code,
				regionCodeArr: [tempRegion.code],
				regionNameArr: [tempRegion.name],
				...(tempRegion.code.length > 5 && { isGrid: true }),
			}));
		} else {
			setGisSettings((prev: any) => ({
				...prev,
				regionName: tempRegion.name,
				regionCode: tempRegion.code,
				regionCodeArr: [tempRegion.code],
				regionNameArr: [tempRegion.name],
			}));
		}

		setShowRegionSelect(false);
	};

	const handleRegionChange = (key: any, value: any) => {
		const foundRegionInfo = regionInfo[key];
		if (foundRegionInfo) {
			if (key.length === 2 && gisSettings.analysisType === 1) {
				showToast("시군구 또는 읍면동을 선택해주세요.", "info");
			} 
			setTempRegion((prevTempRegion: any) => {
				if (key.length === 2) {
					return {
						name: foundRegionInfo.sidoName,
						code: key,
					};
				} else if (key.length === 5) {
					return {
						name: `${foundRegionInfo.sidoName} ${foundRegionInfo.sggName}`,
						code: key,
					};
				} else if (key.length > 5) {
					return {
						name: `${foundRegionInfo.sidoName} ${foundRegionInfo.sggName} ${foundRegionInfo.admName}`,
						code: key,
					};
				}
				return prevTempRegion;
			});
		} else {
			console.error(`No region info found for code: ${key}`);
		}
	};

	return (
		<div ref={wrapperRef} className={`${!tempSettings ? "w-3/5" : ""}`}>
			<button
				className="flex w-full cursor-default items-center justify-between rounded-sm border bg-white p-2"
				onClick={handleInputClick}
			>
				<input
					type="text"
					value={getRegionString(foundRegionInfo)}
					readOnly
					className="w-inherit cursor-pointer outline-none"
					placeholder="지역 선택"
				/>
				<FaChevronDown className="w-9 text-gray-500" />
			</button>
			{showRegionSelect && (
				<div
					className={`custom-scrollbar mt-0.5 flex w-[370px] flex-col rounded-md border border-[#e5e7eb] bg-white ${!tempSettings ? "absolute z-50 h-80" : ""}`}
				>
					{/* 시도 */}
					<div className="custom-scrollbar flex h-80 w-full bg-white">
						<ul
							className={`${
								tempRegion.name.split(" ")[0] ? "w-1/3" : "w-1/2"
							} custom-scrollbar h-inherit overflow-y-auto border-r border-[#e5e7eb]`}
						>
							{Object.entries(regionInfo)
								.filter(([key, _]) => key.length === 2)
								.map(([key, value], index, array) => {
									const isLastItem = index === array.length - 1;
									return (
										<li
											key={key}
											className={`${
												!isLastItem ? "border-b border-[#e5e7eb]" : ""
											} break-keep p-2 hover:bg-[#F3F3F3]`}
										>
											<RadioButton
												id={key}
												name={key}
												label={value.sidoName || value.name}
												value={value.sidoName || value.name}
												checked={tempRegion.code.slice(0, 2) === key}
												onChange={() => handleRegionChange(key, value)}
												ref={key === tempRegion.code.slice(0, 2) ? selectedSidoRadioRef : null}
											/>
										</li>
									);
								})}
						</ul>
						{/* 시군구 */}
						{tempRegion?.code.length >= 2 && (
							<ul
								className={`${
									tempRegion?.code.length >= 2 ? "w-1/3" : "w-1/2"
								} custom-scrollbar h-inherit overflow-y-auto border-r border-[#e5e7eb]`}
							>
								{Object.entries(regionInfo)
									.filter(
										([key, _]) => key.length === 5 && key.startsWith(tempRegion.code.slice(0, 2)),
									)
									.map(([key, value], index, array) => {
										const isLastItem = index === array.length - 1;
										return (
											<li
												key={key}
												className={`${
													!isLastItem ? "border-b border-[#e5e7eb]" : ""
												} break-keep p-2 hover:bg-[#F3F3F3]`}
											>
												<RadioButton
													id={key}
													name={key}
													label={value.sggName || value.name}
													value={value.sggName || value.name}
													checked={tempRegion.code.slice(0, 5) === key}
													onChange={() => handleRegionChange(key, value)}
													ref={key === tempRegion.code.slice(0, 5) ? selectedSggRadioRef : null}
												/>
											</li>
										);
									})}
							</ul>
						)}
						{/* 읍면동 */}
						{!isAdm && tempRegion?.code.length >= 5 && (
							<ul
								className={` ${tempRegion.code.length >= 5 ? "w-1/3" : "w-1/2"} custom-scrollbar h-inherit overflow-y-auto`}
							>
								{Object.entries(regionInfo)
									.filter(
										([key, _]) => key.length > 5 && key.startsWith(tempRegion.code.slice(0, 5)),
									)
									.map(([key, value], index, array) => {
										const isLastItem = index === array.length - 1;
										return (
											<li
												key={key}
												className={`${
													!isLastItem ? "border-b border-[#e5e7eb]" : ""
												} break-keep p-2 hover:bg-[#F3F3F3]`}
											>
												<RadioButton
													id={key}
													name={key}
													label={value.admName ?? value.name}
													value={value.admName ?? value.name}
													checked={tempRegion.code === key}
													onChange={() => handleRegionChange(key, value)}
													ref={key === tempRegion.code ? selectedAdmRadioRef : null}
												/>
											</li>
										);
									})}
							</ul>
						)}
					</div>
					<div
						className={`flex justify-end ${!tempSettings ? "border" : "border-t"} border-[#e5e7eb] bg-white p-2`}
					>
						<button
							onClick={handleConfirm}
							disabled={
								gisSettings.analysisType === 1 && tempRegion.code.length === 2 // analysisType === 1일 때만 시도 단독 선택 불가
							}
							className={`rounded bg-[#D63457] px-4 py-1 text-white ${
								gisSettings.analysisType === 1 && tempRegion.code.length === 2
									? "cursor-not-allowed opacity-50"
									: ""
							}`}
						>
							확인
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
