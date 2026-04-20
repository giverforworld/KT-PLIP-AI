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
import ButtonGroup from "@/components/buttons/ButtonGroup";
import * as React from "react";

interface OptionSelectBoxProps<T> {
	mapIdx?: 0 | 1;
	fullWidth?: boolean;
	options: { label: string; value: T }[];
	selectedOption: T;
	setOption: React.Dispatch<React.SetStateAction<T>>;
	disabled?: boolean;
}

export default function OptionSelectBox<T>({
	mapIdx = 0,
	fullWidth = false,
	options,
	selectedOption,
	setOption,
	disabled = false,
}: Readonly<OptionSelectBoxProps<T>>) {
	const handleButtonClick = (value: T) => {
		setOption(value);
	};

	return (
		<ButtonGroup disabled={disabled}>
			{options.map((option) => (
				<BaseButton
					fullWidth={fullWidth}
					key={option.label}
					title={option.label}
					color={selectedOption === option.value ? "primary_light" : "gray"}
					onClick={disabled ? () => {} : () => handleButtonClick(option.value)}
				/>
			))}
		</ButtonGroup>
	);
}
