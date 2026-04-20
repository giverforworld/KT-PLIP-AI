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
	mapIdx?: 0 | 1;
	isAdm?: boolean;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	regionInfo: Record<string, RegionInfo>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function RegionSelectBox({
	mapIdx = 0,
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

	// 체류인구일 때 지역 초기화
	const context = React.useContext(UserContext);
	if (!context) {
		throw new Error("GIScontainer must be used within a UserProderContainer");
	}
	let time = tempSettings?.maps[0].startDate;

	const { user } = context;
	const userRegion = {
		sido: {
			name:
				user!.baseInfo.toString().slice(0, 2) === "51" && time! < 202307
					? "강원도"
					: user!.baseInfo.toString().slice(0, 2) === "52" && time! < 202403
						? "전라북도"
						: user!.baseInfo.toString().slice(0, 2) === "42" && time! > 202306
							? "강원특별자치도"
							: user!.baseInfo.toString().slice(0, 2) === "45" && time! > 202402
								? "전북특별자치도"
								: user!.baseRegion.sido.name,
			code:
				user!.baseInfo.toString().slice(0, 2) === "51" && time! < 202307
					? "42"
					: user!.baseInfo.toString().slice(0, 2) === "52" && time! < 202403
						? "45"
						: user!.baseInfo.toString().slice(0, 2) === "42" && time! > 202306
							? "51"
							: user!.baseInfo.toString().slice(0, 2) === "45" && time! > 202402
								? "52"
								: user!.baseRegion.sido.code,
		},
		sgg: {
			name: user!.baseRegion.sgg.name ?? "",
			code:
				user!.baseRegion.sgg.code.toString().slice(0, 2) === "51" && time! < 202307
					? "42" + user?.baseRegion.sgg.code.toString().slice(2)
					: user!.baseRegion.sgg.code.toString().slice(0, 2) === "52" && time! < 202403
						? "45" + user?.baseRegion.sgg.code.toString().slice(2)
						: user!.baseRegion.sgg.code.toString().slice(0, 2) === "42" && time! > 202306
							? "51" + user?.baseRegion.sgg.code.toString().slice(2)
							: user!.baseRegion.sgg.code.toString().slice(0, 2) === "45" && time! > 202402
								? "52" + user?.baseRegion.sgg.code.toString().slice(2)
								: (user!.baseRegion.sgg.code ?? ""),
		},
	};

	// gisSettings 또는 tempSettings에서 값을 가져오도록 설계
	const [tempRegion, setTempRegion] = React.useState({
		name: gisSettings?.regionName ?? tempSettings?.regionName ?? "",
		code:
			tempSettings?.analysisType === 2
				? (userRegion.sgg.code ?? userRegion.sido.code)
				: gisSettings?.regionCode?.toString().slice(0, 2) === "51" && time! < 202307
					? "42" + gisSettings?.regionCode?.toString().slice(2)
					: gisSettings?.regionCode?.toString().slice(0, 2) === "52" && time! < 202403
						? "45" + gisSettings?.regionCode?.toString().slice(2)
						: gisSettings?.regionCode?.toString().slice(0, 2) === "42" && time! > 202306
							? "51" + gisSettings?.regionCode?.toString().slice(2)
							: gisSettings?.regionCode?.toString().slice(0, 2) === "45" && time! > 202402
								? "52" + gisSettings?.regionCode?.toString().slice(2)
								: (gisSettings?.regionCode?.toString() ??
									tempSettings?.regionCode?.toString() ??
									""),
	});
	React.useEffect(() => {
		setTempRegion({
			name: tempSettings?.analysisType
				? (userRegion.sgg.name ?? userRegion.sido.name)
				: (gisSettings?.regionName ?? tempSettings?.regionName ?? ""),
			code: tempSettings?.analysisType
				? (userRegion.sgg.code ?? userRegion.sido.code)
				: gisSettings?.regionCode?.toString().slice(0, 2) === "42"
					? "51" + gisSettings?.regionCode?.toString().slice(2)
					: gisSettings?.regionCode?.toString().slice(0, 2) === "45"
						? "52" + gisSettings?.regionCode?.toString().slice(2)
						: (gisSettings?.regionCode?.toString() ?? tempSettings?.regionCode?.toString() ?? ""),
		});
	}, [tempSettings?.analysisType]);

	// const [foundRegionInfo, setFoundRegionInfo] = React.useState<any>()
	// React.useEffect(() => {
	let foundRegionInfo =
		regionInfo[
			user?.baseRegion.sgg.code.slice(0, 2) === "51" && time! < 202307
				? "42" + user?.baseRegion.sgg.code.slice(2)
				: user?.baseRegion.sgg.code.slice(0, 2) === "52" && time! < 202403
					? "45" + user?.baseRegion.sgg.code.slice(2)
					: user?.baseRegion.sgg.code.slice(0, 2) === "42" && time! > 202306
						? "51" + user?.baseRegion.sgg.code.slice(2)
						: user?.baseRegion.sgg.code.slice(0, 2) === "45" && time! > 202402
							? "52" + user?.baseRegion.sgg.code.slice(2)
							: // : user?.baseRegion.sgg.code ?? user?.baseRegion.sido.code!
								tempRegion.code
		] ??
		regionInfo[tempSettings?.regionCode!] ??
		regionInfo[gisSettings.regionCode] ??
		regionInfo[userRegion.sgg.code] ??
		regionInfo[userRegion.sido.code]??
		regionInfo[11];
	// if (foundRegionInfo) {
	// setFoundRegionInfo(foundRegionInfo)
	// 		}
	// }, [tempSettings?.analysisType])

	// 모달 외부 클릭 시 닫기
	const handleClickOutside = (event: MouseEvent) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
			// if (gisSettings.analysisType === 1 && tempRegion.code.length === 2) {
			// 	showToast("시군구 또는 읍면동을 선택해주세요.", "info");
			// 	return;
			// } else if (
			// 	(gisSettings.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
			// 	tempRegion.code.length <= 5
			// ) {
			// 	showToast("읍면동을 선택해주세요.", "info");
			// 	return;
			// }
			handleConfirm(); // 선택 내용을 적용
			setShowRegionSelect(false); // 모달 닫기
		}
	};
	React.useEffect(() => {
		if (
			(tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
			tempRegion.code.length <= 5
		) {
			// 읍면동 코드 리스트 필터링
			const eupMyeonDongList = Object.entries(regionInfo).filter(
				([key, _]) => key.length > 5 && key.startsWith(tempRegion.code.slice(0, 5)),
			);

			// 첫 번째 읍면동 자동 선택
			if (eupMyeonDongList.length > 0) {
				const [firstKey, firstValue] = eupMyeonDongList[0];
				setTempRegion({
					name: `${firstValue.sidoName} ${firstValue.sggName} ${firstValue.admName ?? firstValue.name}`,
					code: `${firstKey}`,
				});
			}
		}

		if (setTempSettings && tempSettings?.analysisType === 2) {
			setTempSettings((prev) => ({
				...prev,
				regionName: userRegion.sgg.name ?? userRegion.sido.name,
				regionCode: Number(userRegion.sgg.code) ?? Number(userRegion.sido.code),
				regionCodeArr: [Number(userRegion.sgg.code) ?? Number(userRegion.sido.code)],
				regionNameArr: [userRegion.sgg.name ?? userRegion.sido.name],
			}));
			setTempRegion((prev) => ({
				...prev,
				name: userRegion.sgg.name ?? userRegion.sido.name,
				code: userRegion.sgg.code ?? userRegion.sido.code,
			}));
		}

		// if (setTempSettings && tempSettings?.analysisType === 0) {
		// 	setTempSettings((prev) => ({
		// 		...prev,
		// 		regionCode: Number(userRegion.sgg.code) ?? Number(userRegion.sido.code),
		// 		regionCodeArr: [Number(userRegion.sgg.code) ?? Number(userRegion.sido.code)],
		// 	}))
		// 	setTempRegion((prev) => ({
		// 		...prev,
		// 		code: userRegion.sgg.code ?? userRegion.sido.code,
		// 	}))
		// }
	}, [tempSettings?.gridScale, tempSettings?.analysisType]);

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
		// if (setTempSettings && tempRegion.code.length > 5) {
		if (setTempSettings) {
			setTempSettings((prev: any) => ({
				...prev,
				regionName: tempRegion.name,
				regionCode: tempRegion.code,
				regionCodeArr: [tempRegion.code],
				regionNameArr: [tempRegion.name],
				// isGrid: tempRegion.code.length > 5,
			}));
		}
	}, [tempRegion]); // tempRegion이 변경될 때 tempSettings를 업데이트

	React.useEffect(() => {
		if (
			gisSettings.analysisType === 1 ||
			(tempSettings?.analysisType === 0 && tempRegion.code.length === 2)
		) {
			setTempRegion({
				name: gisSettings?.regionName,
				code:
					tempSettings?.analysisType === 2
						? (userRegion.sgg.code ?? userRegion.sido.code)
						: gisSettings?.regionCode?.toString().slice(0, 2) === "51" && time! < 202307
							? "42" + gisSettings?.regionCode?.toString().slice(2)
							: gisSettings?.regionCode?.toString().slice(0, 2) === "52" && time! < 202403
								? "45" + gisSettings?.regionCode?.toString().slice(2)
								: gisSettings?.regionCode?.toString().slice(0, 2) === "42" && time! > 202306
									? "51" + gisSettings?.regionCode?.toString().slice(2)
									: gisSettings?.regionCode?.toString().slice(0, 2) === "45" && time! > 202402
										? "52" + gisSettings?.regionCode?.toString().slice(2)
										: gisSettings?.regionCode?.toString(),
			});
			setShowRegionSelect(false);
		}
	}, [gisSettings]);

	const handleInputClick = () => {
		// if (
		// 	gisSettings.analysisType === 1 &&
		// 	tempRegion.code.length === 2 // 특정 조건에서 닫히지 않음
		// ) {
		// 	showToast("시군구 또는 읍면동을 선택해주세요.", "info");
		// } else if (
		// 	(gisSettings.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
		// 	tempRegion.code.length <= 5
		// ) {
		// 	showToast("읍면동을 선택해주세요.", "info");
		// } else {
		setShowRegionSelect(!showRegionSelect);
		// }
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
				// ...(tempRegion.code.length > 5 && { isGrid: true }),
				maps: [
					{ ...prev.maps[0], isSearch: false },
					{ ...prev.maps[1], isSearch: false },
				],
			}));
		} else {
			setGisSettings((prev: any) => ({
				...prev,
				regionName: tempRegion.name,
				regionCode: tempRegion.code,
				regionCodeArr: [tempRegion.code],
				regionNameArr: [tempRegion.name],
				...(tempRegion.code.length > 5 && { isGrid: true }),
				maps: [
					{ ...prev.maps[0], isSearch: false },
					{ ...prev.maps[1], isSearch: false },
				],
			}));
		}
		setShowRegionSelect(false);
	};

	const handleRegionChange = (key: any, value: any) => {
		const foundRegionInfo = regionInfo[key];
		if (foundRegionInfo) {
			setTempRegion((prevTempRegion: any) => {
				if (key.length === 2) {					
					// if (tempSettings?.analysisType === 1) {
					// 	showToast("시군구 또는 읍면동을 선택해주세요.", "info");
					// } else if (
					// 	(tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
					// 	tempRegion.code.length <= 5
					// ) {
					// 	showToast("읍면동을 선택해주세요.", "info");
					// }
					return {
						name: foundRegionInfo.sidoName,
						code: key,
					};
				} else if (key.length === 5) {
					// if (
					// 	(tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
					// 	tempRegion.code.length <= 5
					// ) {
					// 	showToast("읍면동을 선택해주세요.", "info");
					// }
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
		<div ref={wrapperRef}>
			<button
				className={`${mapIdx === 1 ? "bg-backGray" : "bg-white"} flex w-full cursor-default items-center justify-between rounded-sm border p-2`}
				onClick={handleInputClick}
				disabled={mapIdx === 1}
			>
				<input
					type="text"
					// value={mapIdx === 1 ? gisSettings.regionName : getRegionString(foundRegionInfo)}
					value={
						mapIdx === 1
							? gisSettings.regionName
							: // : tempSettings?.analysisType === 2
								// ? `${userRegion.sido.name} ${userRegion.sgg.name}`
								getRegionString(foundRegionInfo)
					}
					readOnly
					className={`${mapIdx === 1 ? "text-[#666666]" : ""} w-full cursor-pointer bg-transparent outline-none`}
					placeholder="지역 선택"
				/>
				<FaChevronDown className="w-9 text-gray-500" />
			</button>
			{showRegionSelect && (
				<div
					className={`custom-scrollbar mt-0.5 flex w-inherit flex-col rounded-md border border-[#e5e7eb] bg-white ${!tempSettings ? "absolute z-50 h-80" : ""}`}
				>
					{/* 시도 */}
					<div className="custom-scrollbar flex h-80 w-full bg-white">
						<ul
							className={`${
								tempRegion.name.split(" ")[0]
									? !tempSettings
										? "w-full min-w-40"
										: "w-1/3"
									: "w-1/2"
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
												value={
													tempSettings?.analysisType === 2
														? userRegion.sido.name
														: value.sidoName || value.name
												}
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
									tempRegion?.code.length >= 2
										? !tempSettings
											? "w-full min-w-40"
											: "w-1/3"
										: "w-1/2"
								} custom-scrollbar h-inherit overflow-y-auto border-r border-[#e5e7eb]`}
							>
								{gisSettings.analysisType !== 1 && gisSettings.analysisType !== 2 && (
									<li className="border-b border-[#e5e7eb] p-2 hover:bg-[#F3F3F3]">
										<RadioButton
											id="SGGALL"
											name={`${tempRegion.code.slice(0, 2)}_SGG`}
											label="전체"
											value="전체"
											checked={tempRegion.code.length === 2}
											onChange={() =>
												handleRegionChange(
													tempRegion.code.slice(0, 2),
													regionInfo[tempRegion.code.slice(0, 2)],
												)
											}
											padding="p-2"
										/>
									</li>
								)}
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
													value={
														tempSettings?.analysisType === 2
															? userRegion.sgg.name
															: value.sggName || value.name
													}
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
								className={` ${tempRegion.code.length >= 5 ? (!tempSettings ? "w-full min-w-40" : "w-1/3") : "w-1/2"} custom-scrollbar h-inherit overflow-y-auto`}
							>
								<li className="border-b border-[#e5e7eb] p-2 hover:bg-[#F3F3F3]">
									<RadioButton
										id="ADMALL"
										name={`${tempRegion.code.slice(0, 5)}_adm`}
										label="전체"
										value="전체"
										checked={tempRegion.code.length === 5}
										onChange={() =>
											handleRegionChange(
												tempRegion.code.slice(0, 5),
												regionInfo[tempRegion.code.slice(0, 5)],
											)
										}
										padding="p-2"
									/>
								</li>
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
							// disabled={
							// 	(tempSettings?.analysisType === 1 && tempRegion.code.length === 2) || // analysisType === 1일 때 시도만 선택 불가
							// 	(tempSettings?.analysisType === 2 && tempRegion.code.length === 2) || // analysisType === 2일 때 시도만 선택 불가
							// 	((tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
							// 		tempRegion.code.length <= 5) // gridScale이 0.05이거나 analysisType === 3이면 읍면동 이상 선택 필수
							// }
							className={`rounded bg-[#D63457] px-4 py-1 text-white ${
								(tempSettings?.analysisType === 1 && tempRegion.code.length === 2) ||
								(tempSettings?.analysisType === 2 && tempRegion.code.length === 2) || 
								((tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
									tempRegion.code.length <= 5)
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
