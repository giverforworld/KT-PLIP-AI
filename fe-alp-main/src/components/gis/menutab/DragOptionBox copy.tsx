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
	const [start, setStart] = React.useState<number | null>(null); // mousedown 발생한 값
	const [end, setEnd] = React.useState<number | null>(null); // mouseup 발생한 값
	const [dragging, setDragging] = React.useState(false); // 드래깅 상태

	// 범위 선택 후 처리
	const handleRangeSelection = () => {
		if (start !== null && end !== null) {
			const rangeStart = Math.min(start, end);
			const rangeEnd = Math.max(start, end);
			const rangeValues = Array.from(
				{ length: rangeEnd - rangeStart + 1 },
				(_, i) => rangeStart + i,
			);
			const updateChips = rangeValues.length === 24 ? [...rangeValues, 0] : rangeValues;
			return setSelectedChips(updateChips.toSorted((a, b) => a - b)); // 선택된 범위 업데이트
		}
	};

	// 마우스 다운 시
	const handleMouseDown = (idx: number) => {
		setStart(idx); // mousedown한 값 기록
		setEnd(null); // mouseup을 위한 초기화
		setDragging(true); // 드래그 상태 활성화
	};

	// 마우스 업 시
	const handleMouseUp = () => {
		setDragging(false);
		if (start !== null && end !== null && start !== end) {
			// 범위 선택으로 처리 (start와 end가 다를 때)
			handleRangeSelection();
		}
		setStart(null); // 상태 초기화
		setEnd(null);
	};

	// 마우스 이동 시 범위 추적
	const handleMouseEnter = (idx: number) => {
		if (dragging && start !== null) {
			setEnd(idx); // 마우스 드래그 중 끝값 설정
		}
	};

	// 연속된 숫자들인지를 확인
	const isContinuous = (arr: number[]) => {
		const sorted = arr.slice().sort((a, b) => a - b);
		for (let i = 0; i < sorted.length - 1; i++) {
			if (sorted[i] + 1 !== sorted[i + 1]) {
				return false;
			}
		}
		return true;
	};

	// 선택된 값의 스타일링 처리
	const getButtonStyle = (currentIndex: number) => {
		const selectedArray = Array.isArray(selectedChips) ? selectedChips : [];

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
				className={`grid w-full gap-y-1 ${filter?.labels?.length ? "mt-2 grid-cols-12 grid-rows-2" : "grid-cols-2 grid-rows-2"}`}
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
								onMouseDown={() => handleMouseDown(currentIndex)}
								onMouseEnter={() => handleMouseEnter(currentIndex)}
								onMouseUp={handleMouseUp}
							>
								{filter?.labels?.length ? parseFloat(label) : label.replace(" ", " (") + ")"}
							</button>
						);
					})}
			</div>
		</div>
	);
}
