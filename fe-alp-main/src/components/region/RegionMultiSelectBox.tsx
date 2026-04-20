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

interface RegionMultiSelectBoxProps {
	isAdm?: boolean;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	regionInfo: Record<string, RegionInfo>;
	tempSettings?: TempSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<TempSettings>>;
}

export default function RegionMultiSelectBox({
	isAdm,
	gisSettings,
	setGisSettings,
	regionInfo,
	tempSettings,
	setTempSettings,
}: Readonly<RegionMultiSelectBoxProps>) {
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

	// 모달 외부 클릭 시 닫기
	const handleClickOutside = (event: MouseEvent) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
			setShowRegionSelect(false);
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

	const handleInputClick = () => {
		if (tempSettings?.regionNameArr && tempSettings.regionNameArr.length >= 4) {
			alert("최대 4개의 지역만 선택할 수 있습니다.");
			return;
		}
		setShowRegionSelect(!showRegionSelect);
	};

	const handleConfirm = () => {
		if (setTempSettings) {
			setTempSettings((prev: TempSettings) => ({
				...prev,
				regionNameArr: [...prev.regionNameArr, tempRegion.name],
				regionCodeArr: [...prev.regionCodeArr, Number(tempRegion.code)],
			}));
		} else {
			setGisSettings((prev: GisSettings) => ({
				...prev,
				regionNameArr: [...prev.regionNameArr, tempRegion.name],
				regionCodeArr: [...prev.regionCodeArr, Number(tempRegion.code)],
			}));
		}

		setShowRegionSelect(false);
	};

	const handleRegionChange = (key: string) => {
		const foundRegionInfo = regionInfo[key];
		if (foundRegionInfo) {
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
		<div ref={wrapperRef} className="relative w-fit min-w-[367px]">
			<button
				className="flex w-full cursor-default items-center justify-between rounded-sm border p-2"
				onClick={handleInputClick}
			>
				<input
					type="text"
					value={getRegionString(foundRegionInfo)}
					readOnly
					className="w-full cursor-pointer outline-none"
					placeholder="지역 선택"
				/>
				<FaChevronDown className="w-9 text-gray-500" />
			</button>
			{showRegionSelect && (
				<div className="custom-scrollbar absolute left-0 top-full z-50 mt-0.5 flex h-80 w-full flex-col rounded-md border border-[#e5e7eb] bg-white">
					{/* 시도 */}
					<div className="custom-scrollbar flex h-80 w-full overflow-y-auto bg-white">
						<ul
							className={`${
								tempRegion.name.split(" ")[0] !== "" ? "w-1/2" : "w-full"
							} custom-scrollbar h-inherit overflow-y-auto`}
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
											} p-2 hover:bg-[#F3F3F3]`}
										>
											<RadioButton
												id={key}
												name={key}
												label={value.name}
												value={key}
												checked={tempRegion.code.slice(0, 2) === key}
												onChange={() => handleRegionChange(key)}
												ref={key === tempRegion.code.slice(0, 2) ? selectedSidoRadioRef : null}
											/>
										</li>
									);
								})}
						</ul>
						{/* 시군구 */}
						{tempRegion && tempRegion.name.split(" ")[0] !== "" && (
							<ul
								className={`${
									tempRegion.name.split(" ")[0] !== "" ? "w-1/2" : "w-full"
								} custom-scrollbar h-inherit overflow-y-auto`}
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
												} p-2 hover:bg-[#F3F3F3]`}
											>
												<RadioButton
													id={key}
													name={key}
													label={value.sggName ?? ""}
													value={value.sggName ?? ""}
													checked={tempRegion.code.slice(0, 5) === key}
													onChange={() => handleRegionChange(key)}
													ref={key === tempRegion.code.slice(0, 5) ? selectedSggRadioRef : null}
												/>
											</li>
										);
									})}
							</ul>
						)}
						{/* 읍면동 */}
						{!isAdm &&
							tempRegion &&
							tempRegion.name.split(" ")[0] !== "" &&
							tempRegion.name.split(" ")[1] !== "" && (
								<ul
									className={`${
										tempRegion.name.split(" ")[1] !== "" ? "w-1/2" : "w-full"
									} custom-scrollbar h-inherit overflow-y-auto`}
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
													} p-2 hover:bg-[#F3F3F3]`}
												>
													<RadioButton
														id={key}
														name={key}
														label={value.admName ?? ""}
														value={value.admName ?? ""}
														checked={tempRegion.code === key}
														onChange={() => handleRegionChange(key)}
														ref={key === tempRegion.code ? selectedAdmRadioRef : null}
													/>
												</li>
											);
										})}
								</ul>
							)}
					</div>
					<div className="flex justify-end border-t border-[#e5e7eb] p-2">
						<button
							onClick={handleConfirm}
							className="bg-blue-500 rounded bg-[#D63457] px-4 py-1 text-white"
						>
							확인
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
