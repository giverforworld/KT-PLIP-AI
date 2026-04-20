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

import { forwardRef } from "react";

interface RadioButtonProps {
	id: string;
	name: string;
	label: string;
	value: string;
	checked: boolean;
	disabled?: boolean;
	onChange: () => void;
	padding?: "py-1" | "p-2";
}

// eslint-disable-next-line react/display-name
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
	({ id, name, label, value, checked, disabled, onChange, padding = "py-1" }, ref) => {
		return (
			<label htmlFor={id} className={`flex cursor-pointer items-center justify-between ${padding}`}>
				<span className={`mr-1 text-sm ${disabled ? "text-gray-300" : ""}`}>{label}</span>
				<div className="relative">
					<input
						type="radio"
						id={id}
						name={name}
						value={value}
						checked={checked}
						onChange={onChange}
						className="peer sr-only"
						disabled={disabled}
						ref={ref}
					/>
					<div
						className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked && !disabled ? "border-primary" : "border-gray-300"}`}
					>
						{checked && !disabled && <div className="h-1 w-1 rounded-full bg-primary"></div>}
					</div>
				</div>
			</label>
		);
	},
);
