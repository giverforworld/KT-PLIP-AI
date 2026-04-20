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

import { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
	id: string;
	label?: string;
	checked?: boolean;
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Checkbox({ id, label, checked, onChange, ...props }: CheckboxProps) {
	return (
		<div className="flex items-center">
			{/* <input
				type="checkbox"
				checked={checked}
				// onChange={onChange}
				id={id}
				className="peer hidden"
				{...props}
			/> */}
			<label htmlFor={id} className="flex cursor-pointer items-center gap-2">
				<div
					className={`flex h-4 w-4 items-center justify-center rounded-sm border-2 ${checked ? "border-primary bg-primary" : "border-gray-300 bg-white"} peer-checked:border-transparent peer-checked:bg-primary`}
				>
					{checked && (
						<svg
							className="h-3 w-3 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={3}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					)}
				</div>
				{label && <span className="text-sm font-semibold">{label}</span>}
			</label>
		</div>
	);
}
