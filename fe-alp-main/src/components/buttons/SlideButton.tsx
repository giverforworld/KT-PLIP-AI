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

import { useState, useEffect } from "react";
import { useShowToast } from "@/hooks/useToastShow";

interface SlideButtonProps {
	mapIdx?: 0 | 1;
	gridOption?: boolean;
	options: gridOptions;
	initialValue?: 0 | 1 | 2;
	onChange?: (value: 0 | 1 | 2) => void;
	selectedValue: 0 | 1 | 2;
	setOptionState?: React.Dispatch<React.SetStateAction<any>>;
	optionKey?: string;
	disabled?: boolean;
	gisSettings?: GisSettings;
}

export default function SlideButton({
	mapIdx = 0,
	gridOption = false,
	options,
	initialValue,
	onChange,
	selectedValue,
	setOptionState,
	optionKey,
	disabled = false,
	gisSettings,
}: Readonly<SlideButtonProps>) {
	const showToast = useShowToast();

	// mapIdx 별로 상태 관리
	const [selectedState, setSelectedState] = useState<{ [key: number]: 0 | 1 | 2 }>({
		0: initialValue ?? options[0].value,
		1: disabled ? (selectedValue ?? options[1].value) : (initialValue ?? options[1].value), // mapIdx 1은 항상 0으로 고정
	});

	// 선택된 값 (mapIdx별 분리)
	const selected = selectedValue ?? selectedState[mapIdx];

	useEffect(() => {
		if (disabled && !gisSettings?.maps[mapIdx].isSideBar) return; // 사이드바가 열려있을 때는 예외 처리
		setSelectedState((prev) => ({
			...prev,
			[mapIdx]: selectedValue,
		}));
	}, [selectedValue, mapIdx, disabled, gisSettings?.maps]);

	const setSelected = (value: 0 | 1 | 2) => {
		if (disabled) return; // mapIdx 1이면 변경 금지

		setSelectedState((prev) => ({
			...prev,
			[mapIdx]: value,
		}));

		if (setOptionState && optionKey) {
			setOptionState((prev: any) => ({
				...prev,
				[optionKey]: value,
			}));
		}

		if (onChange) {
			onChange(value);
		}
	};

	return (
		<div
			className={`relative ${optionKey ? "top-20 z-50" : "z-10"} ml-4 flex py-1 ${
				gridOption ? "rounded-full bg-[#F2F2F2]" : "rounded-md bg-[#F3F3F3]"
			} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
		>
			{options.map((option) => (
				<div key={option.name} className={`${gridOption ? "min-w-20" : "min-w-[70px]"} flex-1`}>
					<input
						type="radio"
						id={`switch${option.name}-${mapIdx}`} // mapIdx별 ID 분리
						name={`switchPlan-${mapIdx}`} // mapIdx별로 name 분리
						value={option.value}
						onChange={disabled ? undefined : () => setSelected(option.value)}
						className="sr-only"
						disabled={disabled || option.disabled}
						defaultChecked={selected === option.value}
					/>
					<label
						htmlFor={`switch${option.name}-${mapIdx}`}
						className={`block cursor-pointer text-center text-[13px] ${
							selected === option.value ? "text-white" : "text-[#777777]"
						} ${disabled ? "cursor-not-allowed" : ""}`}
					>
						{option.label}
					</label>
				</div>
			))}
			<div
				style={{
					transform: options.length > 2 ? `translateX(${selectedState[mapIdx] * 70}px)` : undefined,
				}}
				className={`absolute ${
					options.length === 2 && selectedState[mapIdx] === 0 ? "translate-x-0" : "translate-x-full"
				} flex w-[70px] items-center justify-center ${
					gridOption ? "inset-[4px] rounded-full bg-white text-[#555555]" : "inset-0 rounded-md"
				} ${optionKey ? "bg-white text-primary" : "bg-primary text-white"} cursor-default text-sm font-medium transition-transform duration-500`}
			>
				{options.find((option) => option.value === selectedState[mapIdx])?.label}
			</div>
		</div>
	);
}
