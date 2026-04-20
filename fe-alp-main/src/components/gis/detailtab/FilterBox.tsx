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
import * as React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type FilterBoxProps = {
	gisSettings: GisSettings;
	filter: Filter;
	disabled: boolean | undefined;
	gisSettingKey: string | undefined;
	isSingleSelect: boolean;
	selectedChips: any;
	handleChipClick: (index: number) => void;
};

export default function FilterBox({
	gisSettings,
	filter,
	disabled,
	gisSettingKey,
	isSingleSelect,
	selectedChips,
	handleChipClick,
}: Readonly<FilterBoxProps>) {
	// 드롭다운 상태 관리
	const [isDropdownOpen, setIsDropdownOpen] = React.useState(!gisSettings.isDual);

	// 전체 옵션이 존재하는지 확인
	const hasAllOption = filter.labels.includes("전체");

	// 드롭다운 열림/닫힘 처리
	const handleDropdownToggle = () => {
		if (!disabled) {
			setIsDropdownOpen((prevState) => !prevState);
		}
	};

	// 드롭다운 닫기
	const handleClose = () => {
		setIsDropdownOpen(false);
	};

	const handleSelectAll = () => {
		if (Array.isArray(selectedChips) && selectedChips.includes(0)) {
			// 전체가 이미 선택된 경우 해제하고 첫 번째 값을 선택
			const firstValueIndex = 1; // "전체" 이후 첫 번째 값의 index는 1
			handleChipClick(firstValueIndex);
		} else {
			// "전체"를 선택
			handleChipClick(0);
		}
	};

	return (
		<div className="relative my-2 w-full">
			{/* 드롭다운 형태 */}
			{hasAllOption ? (
				<>
					{/* 드롭다운 버튼 */}
					{!isDropdownOpen && (
						<button
							onClick={handleDropdownToggle}
							className={`flex w-full items-center justify-between rounded-md ${gisSettings.isDual ? "border border-gray-300 shadow-sm" : ""} bg-white px-4 py-2 text-left text-gray-700 ${
								disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
							}`}
						>
							{filter.labels.length === selectedChips.length ? (
								<>
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											disabled={disabled}
											checked={isSingleSelect ? false : selectedChips.includes(0)}
											onChange={handleSelectAll}
											className="checked:rounded-md checked:accent-primary"
										/>
										<span>전체</span>
									</label>
									<span className="material-icons">
										<FaChevronDown />
									</span>
								</>
							) : (
								<div className="flex w-full flex-col items-start gap-4">
									{filter.labels
										.filter((label, idx) => selectedChips.includes(idx))
										.map((label: any, idx: number) => {
											return (
												<div key={label} className="flex w-full items-center justify-between">
													<label className="flex items-center gap-2">
														<input
															type="checkbox"
															disabled={disabled}
															checked={label === filter.labels[selectedChips[idx]]}
															onChange={handleSelectAll}
															className="checked:rounded-md checked:accent-primary"
														/>
														<span>{label}</span>
													</label>
													{idx === 0 && (
														<span className="material-icons">
															<FaChevronDown />
														</span>
													)}
												</div>
											);
										})}
								</div>
							)}
						</button>
					)}
					{/* 드롭다운 옵션 */}
					{isDropdownOpen && (
						<ul
							className={`mt-2 w-full rounded-md ${gisSettings.isDual ? "w-full border border-gray-300 shadow-lg" : "w-72"} bg-white`}
						>
							{/* "전체" 옵션 */}
							<li className="px-4 py-2">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										disabled={disabled}
										checked={isSingleSelect ? false : selectedChips.includes(0)}
										onChange={handleSelectAll}
										className="checked:rounded-md checked:accent-primary"
									/>
									<span>전체</span>
								</label>
							</li>

							{/* 나머지 옵션 */}
							{filter.labels
								.filter((label) => label !== "전체")
								.map((label, index) => (
									<li key={label} className="px-4 py-2">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												disabled={disabled}
												checked={
													isSingleSelect
														? selectedChips === index + 1
														: Array.isArray(selectedChips) && selectedChips.includes(index + 1)
												}
												onChange={() => {
													handleChipClick(index + 1); // "전체" 이후 인덱스 처리
													if (isSingleSelect) setIsDropdownOpen(false); // 단일 선택일 경우 닫음
												}}
												className="checked:rounded-md checked:accent-primary"
											/>
											<span>{label}</span>
										</label>
									</li>
								))}

							{/* 접기 버튼 */}
							{gisSettings.isDual && (
								<BaseButton
									title={"접기"}
									fullWidth
									justify="between"
									onClick={handleClose}
									color="white"
									Icon={FaChevronUp}
									IconFirst={false}
									// className="w-full rounded bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
								/>
							)}
						</ul>
					)}
				</>
			) : (
				/* 기본 필터 옵션 표시 (전체 값이 없을 때) */
				<ul
					className={`${gisSettings.isDual ? "w-full border border-filterLightGray" : "w-72"} flex flex-col gap-4 rounded-md px-4 py-2`}
				>
					{filter.labels.map((label, index) => (
						<li
							key={label}
							className={`${
								gisSettingKey === "ageGroup" || gisSettingKey?.includes("moving")
									? "min-w-16"
									: "w-full"
							}`}
						>
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									disabled={disabled}
									checked={
										isSingleSelect
											? selectedChips === index
											: Array.isArray(selectedChips) &&
												selectedChips.includes(filter.labels.includes("전체") ? index + 1 : index)
									}
									onChange={() => {
										handleChipClick(filter.labels.includes("전체") ? index + 1 : index);
									}}
									className="checked:rounded-md checked:accent-primary"
								/>
								<span>{label}</span>
							</label>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
