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

import { useState } from "react";
import { FieldErrors, FieldValues, Path, UseFormRegister, UseFormTrigger } from "react-hook-form";

interface BaseInputProps<T extends FieldValues> {
	type: string;
	placeholder: string;
	name: Path<T>;
	label: string;
	register: UseFormRegister<T>;
	errors: FieldErrors<T>;
	trigger: UseFormTrigger<T>;
}

export default function BaseInput<T extends Record<string, any>>({
	type,
	placeholder,
	name,
	label,
	register,
	errors,
	trigger,
}: BaseInputProps<T>) {
	const [isTouched, setIsTouched] = useState(false);

	const handleBlur = () => {
		setIsTouched(true);
		trigger(name);
	};

	return (
		<div className="mb-4">
			<label htmlFor={name} className="mb-1 block font-semibold">
				{label}
			</label>
			<input
				className={`h-full w-full rounded-md border bg-[#fbfbfb] p-2 text-sm placeholder:text-sm ${
					errors[name] ? "border-error" : ""
				}`}
				id={name}
				type={type}
				placeholder={placeholder}
				{...register(name, {
					onBlur: handleBlur,
					onChange: () => {
						if (isTouched) {
							trigger(name);
						}
					},
				})}
			/>
			{errors[name] && (
				<p className="ml-1 mt-1 text-sm text-error">{errors[name]?.message?.toString()}</p>
			)}
		</div>
	);
}
