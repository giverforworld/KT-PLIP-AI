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

interface ForeignSelectBoxProps {
	selectedOption: boolean;
	setForeignOption: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function ForeignSelectBox({
	selectedOption,
	setForeignOption,
}: Readonly<ForeignSelectBoxProps>) {
	const handleButtonClick = (value: boolean) => {
		setForeignOption((prev) => ({
			...prev,
			isNative: value,
		}));
	};

	return (
		<ButtonGroup>
			<BaseButton
				title="내국인"
				color={selectedOption ? "primary_light" : "gray"}
				fullWidth
				onClick={() => handleButtonClick(true)}
			/>
			<BaseButton
				title="외국인"
				color={!selectedOption ? "primary_light" : "gray"}
				fullWidth
				onClick={() => handleButtonClick(false)}
			/>
		</ButtonGroup>
	);
}
