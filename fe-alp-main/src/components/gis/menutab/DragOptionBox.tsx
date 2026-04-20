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

interface DragOptionBoxProps {
	filter?: Filter;
	selectedChips: number | number[];
	setSelectedChips: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function DragOptionBox({
	filter,
	selectedChips,
	setSelectedChips,
}: Readonly<DragOptionBoxProps>) {
	const [startValue, setStartValue] = React.useState<number | null>(null); // 시작값
	const [selectionMode, setSelectionMode] = React.useState<"start" | "end" | null>(null); // 현재 선택 모드
	const [hoverIndex, setHoverIndex] = React.useState<number | null>(null); // 마우스 hover 값

	// 범위 선택 처리
	const handleRangeSelection = (start: number, end: number) => {
		const rangeStart = Math.min(start, end);
		const rangeEnd = Math.max(start, end);

		const rangeValues = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);

		// 24시간 전체 선택 시 0(전체)도 포함
		const updateChips = rangeValues.length === 24 ? [...rangeValues, 0] : rangeValues;
		setSelectedChips(updateChips.toSorted((a, b) => a - b)); // 선택된 범위 업데이트
	};

	// 버튼 클릭 처리
	const handleButtonClick = (idx: number) => {
		if (selectionMode === null || selectionMode === "end") {
			// 기존 선택값 초기화 후 새 값 선택
			setSelectedChips([idx]);
			setStartValue(idx);
			setSelectionMode("start");
		} else if (selectionMode === "start" && startValue !== null) {
			// 범위 선택 모드
			handleRangeSelection(startValue, idx);
			setSelectionMode("end");
		}
	};

	// 연속된 숫자들인지 확인
	const isContinuous = (arr: number[]) => {
		const sorted = arr.slice().sort((a, b) => a - b);
		for (let i = 0; i < sorted.length - 1; i++) {
			if (sorted[i] + 1 !== sorted[i + 1]) {
				return false;
			}
		}
		return true;
	};

	// 선택된 값 또는 hover된 값의 스타일링 처리
	const getButtonStyle = (currentIndex: number) => {
		const selectedArray = Array.isArray(selectedChips) ? selectedChips : [];

		// 시작값 선택 모드일 때 시작값 강조
		if (selectionMode === "start" && currentIndex === startValue) {
			return "rounded-md border border-filterDarkGray bg-filterDarkGray text-white";
		}

		// hover 상태에서 hoverIndex가 있고, startValue가 있을 경우 범위 스타일 적용
		if (selectionMode === "start" && startValue !== null && hoverIndex !== null) {
			const hoverStart = Math.min(startValue, hoverIndex);
			const hoverEnd = Math.max(startValue, hoverIndex);
			if (currentIndex >= hoverStart && currentIndex <= hoverEnd) {
				return "border border-shadowBoxGray bg-shadowBoxGray text-textGray";
			}
		}

		// 연속된 숫자인지 확인
		const continuous = isContinuous(selectedArray);
		if (continuous) {
			const first =
				Math.min(...selectedArray) === 0
					? Math.min(...selectedArray) + 1
					: Math.min(...selectedArray);
			const last = Math.max(...selectedArray);

			if (currentIndex === first || currentIndex === last) {
				// 첫 번째와 마지막 값은 "전체 범위" 스타일
				return "rounded-md border border-filterDarkGray bg-filterDarkGray text-white";
			} else if (currentIndex > first && currentIndex < last) {
				// 사이에 있는 값은 "중간 범위" 스타일
				return "border border-shadowBoxGray bg-shadowBoxGray text-textGray";
			} else {
				return "border border-transparent bg-transparent text-textGray";
			}
		} else {
			// 개별 선택은 기본 스타일
			return selectedArray.includes(currentIndex)
				? "border border-filterDarkGray bg-filterDarkGray text-white"
				: "border border-white bg-white text-textGray";
		}
	};

	return (
		<div className="my-2 flex flex-col gap-2">
			<div
				className={`grid w-full gap-y-1 ${
					filter?.labels?.length ? "mt-2 grid-cols-12 grid-rows-2" : "grid-cols-2 grid-rows-2"
				}`}
			>
				{filter?.labels
					.filter((label) => label !== "전체")
					.map((label, index) => {
						const currentIndex = index + 1; // 인덱스 값으로 1-based 값 생성
						const buttonStyle = getButtonStyle(currentIndex);
						return (
							<button
								key={label}
								className={`p-1 text-sm font-semibold hover:rounded-sm hover:border-[#BEBEBE] hover:bg-[#FAFAFA] hover:text-textGray ${buttonStyle} text-center`}
								onClick={() => handleButtonClick(currentIndex)}
								onMouseEnter={() => setHoverIndex(currentIndex)} // hover 이벤트 추가
								onMouseLeave={() => setHoverIndex(null)} // hover 해제 시 초기화
							>
								{filter?.labels?.length ? parseFloat(label) : label.replace(" ", " (") + ")"}
							</button>
						);
					})}
			</div>
		</div>
	);
}
