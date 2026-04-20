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

import React, { useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FilterDropdownProps {
	label: string;
	placeholder: string;
	value: string;
	isOpen: DetailOption;
	setIsOpen: React.Dispatch<React.SetStateAction<DetailOption>>;
	filterComponent: React.ReactNode;
	toggleKey: string;
}

export function FilterDropdown({
	label,
	placeholder,
	value,
	isOpen,
	setIsOpen,
	filterComponent,
	toggleKey,
}: Readonly<FilterDropdownProps>) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	// const inputRef = useRef<HTMLInputElement>(null);

	// useEffect(() => {
	// 	if (inputRef.current) {
	// 		const length = value.length || placeholder.length || 1;
	// 		inputRef.current.style.width = `${length + 3}ch`;
	// 	}
	// }, [value, placeholder]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen((prev) => ({ ...prev, [toggleKey]: false }));
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [setIsOpen, toggleKey]);

	return (
		<div className="relative w-[124px]" ref={dropdownRef}>
			<button
				className={`flex w-full cursor-default items-center justify-between rounded-lg border p-2 ${isOpen[toggleKey] ? "border-tableBlue bg-[#418AEC0F]" : ""}`}
				onClick={() => setIsOpen((prev) => ({ ...prev, [toggleKey]: !prev[toggleKey] }))}
			>
				<input
					type="text"
					// ref={inputRef}
					value={value}
					readOnly
					className={`w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent font-semibold outline-none ${isOpen[toggleKey] ? "text-tableBlue" : ""}`}
					placeholder={placeholder}
				/>
				{isOpen[toggleKey] ? (
					<FaChevronUp className="w-9 text-tableBlue" />
				) : (
					<FaChevronDown className="w-9 text-gray-500" />
				)}
			</button>
			{isOpen[toggleKey] && (
				<div className={`absolute left-0 top-full z-50 mt-5 w-max rounded bg-white p-4 pt-0`}>
					{filterComponent}
				</div>
			)}
		</div>
	);
}
