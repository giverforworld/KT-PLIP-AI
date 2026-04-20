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

import { useCallback, useEffect, useRef, useState } from "react";
import { PATHS } from "@/constants/path";
import SelectorInput from "./SelectorInput";
import SelectDropdown from "./SelectDropdown";
import { RadioButton } from "@/components/buttons/RadioButton";
import { isEmptyObject } from "@/utils/validate";

interface RegionSelectorProps {
	id: string;
	region: Region;
	updateRegion: (region: Region) => void;
	isOpen: boolean;
	setOpenSelectorId: (id: string | null) => void;
	regionInfo: Record<string, RegionInfo>;
	pageName?: string;
	isSggRender?: boolean;
	isAdmRender?: boolean;
}

export default function RegionSelector({
	id,
	region,
	updateRegion,
	isOpen,
	setOpenSelectorId,
	regionInfo,
	pageName,
	isSggRender = true,
	isAdmRender = true,
}: Readonly<RegionSelectorProps>) {
	const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(isOpen);
	const selectorInputRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// useEffect(() => {
	// 	if (pageName == "llp") {
	// 		updateRegion({
	// 			// 수정
	// 			...region,
	// 			sido: { name: "서울특별시", code: "11" },
	// 			sgg: { name: "강남구", code: "11680" },
	// 			adm: { name: "", code: "" },
	// 		});
	// 	}
	// }, []);

	const regionFullName = region?.adm?.name ?
	`${region?.sido?.name} ${region?.sgg?.name} ${region?.adm?.name}`
	: `${region?.sido?.name} ${region?.sgg?.name}`;

	const handleSidoChange = (key: string, value: RegionInfo) => {
		updateRegion({
			sido: { name: value.sidoName || value.name, code: key },
			sgg: { name: "", code: "" },
			adm: { name: "", code: "" },
		});
	};

	const handleSggChange = (key: string, value: RegionInfo) => {
		if(key === "ALL") {
			updateRegion({
				...region,
				sgg: {
					name: "",
					code: ""
				},
				adm: { name: "", code: "" },
			});
			setIsSelectorOpen(false);
			setOpenSelectorId(null);
		} else {
			updateRegion({
				...region,
				sgg: {
					name: value.sggName || value.name,
					code: key,
				},
				adm: { name: "", code: "" },
			});
		}
	};

	const handleAdmChange = (key: string, value: RegionInfo) => {
		if(key === "ADMALL") {
			updateRegion({
				...region,
				adm: { 
					name : "", 
					code: ""
				},
			});	
			setIsSelectorOpen(false);
			setOpenSelectorId(null);	
		} else {
			updateRegion({
				...region,
				adm: { name: value.admName || value.name, code: key },
			});
		}
	};

	const handleSelectorInputClick = () => {
		setIsSelectorOpen((prev) => !prev); // 모든 SelectDropdown 닫기
		setOpenSelectorId(isSelectorOpen ? null : id); // 현재 클릭된 Selector ID 업데이트
	};

	const handleClickOutside = useCallback(
		(e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				selectorInputRef.current &&
				!selectorInputRef.current.contains(e.target as Node)
			) {
				setIsSelectorOpen(false);
				setOpenSelectorId(null);
			}
		},
		[setOpenSelectorId],
	);

	useEffect(() => {
		if (isSelectorOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [handleClickOutside, isSelectorOpen]);

	useEffect(() => {
		// 선택 완료시 SelectDropdown 닫기
		if (region && region.sido.name) {
			const shouldCloseSelector =
				!isSggRender ||
				(isSggRender && !isAdmRender && region.sgg.name) ||
				(isSggRender && isAdmRender && region.sgg.name && region.adm.name);

			if (shouldCloseSelector) {
				setIsSelectorOpen(false);
				setOpenSelectorId(null);
			}
		}
	}, [region, pageName]);

	// TO_BE_CHECKED
	// 전국권한: Defualt-접속한 지역의 시도 / 시도 부터 선택 가능 (시도 , 시군구, 읍면동)
	// 시도권한: Defualt-접속한 지역의 시군구 / 권한이 있는 시도에 속한 시군구 부터 선택 가능 (시군구, 읍면동)
	// 시군구권한: Defualt-접속한 지역의 읍면동 / 권한이 있는 시군구에 속한 읍면동 선택 가능 (읍면동)

	return (
		<div className={`relative h-full w-full dark:bg-[#121216] dark:text-[#DDDDDD]`}>
			{/* Input */}
			<SelectorInput
				ref={selectorInputRef}
				isSelectorOpen={isSelectorOpen}
				onClick={handleSelectorInputClick}
				inputText={
					!region || isEmptyObject(region)
						? pageName !== PATHS.MOP
							? "지역을 선택해주세요."
							: "전국"
						: regionFullName
				}
			/>
			{/* Dropdown */}
			<SelectDropdown ref={dropdownRef} isSelectorOpen={isSelectorOpen} fullWidth={false}>
				{/* 시도 */}
				<div className="custom-scrollbar w-[160px] overflow-y-auto pr-2">
					<ul>
						{Object.entries(regionInfo)
							.filter(([key, _]) => key.length === 2)
							.map(([key, value]) => {
								return (
									<li
										key={key}
										className={`${region?.sido.code === key ? "bg-primary-light text-primary hover:bg-primary-light" : "hover:bg-whiteGray dark:hover:bg-[#212124]"}`}
									>
										<RadioButton
											id={`${id}_${key}`}
											name={`${id}_sido`}
											label={value.sidoName || value.name}
											value={value.sidoName || value.name}
											checked={region?.sido.code === key}
											onChange={() => handleSidoChange(key, value)}
											padding="p-2"
										/>
									</li>
								);
							})}
					</ul>
				</div>

				{/* 시군구 */}
				{isSggRender && region && region.sido.name !== "" && (
					<div className="custom-scrollbar w-[160px] overflow-y-auto pr-2">
						<ul>
							{pageName !== "llp" && (
								<li
									key="ALL"
									className={`${region?.sgg.name === "전체" ? "bg-primary-light text-primary hover:bg-primary-light" : "hover:bg-whiteGray"}`}
								>
									<RadioButton
										id={`${id}_ALL`}
										name={`${id}_sgg`}
										label="전체"
										value="전체"
										checked={region.sgg.name === "전체"}
										onChange={() => 
											handleSggChange("ALL", {
												name: "전체",
												sggName: "전체",
												sidoCode: "",
												center: [0,0],
											})
										}
										padding="p-2"
									/>
								</li>
							)}
							{Object.entries(regionInfo)
								.filter(([key, _]) => key.length === 5 && key.startsWith(region.sido.code))
								.sort(([, a], [, b]) =>
									(a.sggName || a.name).localeCompare(b.sggName || b.name, "ko"),
								)
								.map(([key, value]) => {
									return (
										<li
											key={key}
											className={`${region?.sgg.code === key ? "bg-primary-light text-primary hover:bg-primary-light" : "hover:bg-whiteGray"}`}
										>
											<RadioButton
												id={`${id}_${key}`}
												name={`${id}_sgg`}
												label={value.sggName || value.name}
												value={value.sggName || value.name}
												checked={region.sgg.code === key}
												onChange={() => handleSggChange(key, value)}
												padding="p-2"
											/>
										</li>
									);
								})}
						</ul>
					</div>
				)}

				{/* 읍면동 */}
				{isAdmRender &&
					isSggRender &&
					region &&
					region.sido.name !== "" &&
					region.sgg.name !== "" && 
					region.sgg.name !== "전체" && (
						<div className="custom-scrollbar w-[160px] overflow-y-auto pr-2">
							<ul>
								<li
									key="ADMALL"
									className={`${region?.adm.name === "전체" ? "bg-primary-light text-primary hover:bg-primary-light" : "hover:bg-whiteGray"}`}
								>
									<RadioButton
										id={`${id}_ADMALL`}
										name={`${id}_adm`}
										label="전체"
										value="전체"
										checked={region.adm.name === "전체"}
										onChange={() => 
											handleAdmChange("ADMALL", {
												name: "전체",
												sggName: "전체",
												sidoCode: region.sgg.code,
												center: [0,0],
											})
										}
										padding="p-2"
									/>
								</li>
								{Object.entries(regionInfo)
									.filter(([key, _]) => key.length > 5 && key.startsWith(region.sgg.code))
									.sort(([, a], [, b]) =>
										(a.admName || a.name).localeCompare(b.admName || b.name, "ko"),
									)
									.map(([key, value]) => {
										return (
											<li
												key={key}
												className={`${region?.adm.code === key ? "bg-primary-light text-primary hover:bg-primary-light" : "hover:bg-whiteGray"}`}
											>
												<RadioButton
													id={`${id}_${key}`}
													name={`${id}_adm`}
													label={value.admName || value.name}
													value={value.admName || value.name}
													checked={region.adm.code === key}
													onChange={() => handleAdmChange(key, value)}
													padding="p-2"
												/>
											</li>
										);
									})}
							</ul>
						</div>
					)}
			</SelectDropdown>
		</div>
	);
}
