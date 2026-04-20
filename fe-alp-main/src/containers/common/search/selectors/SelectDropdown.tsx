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

import React, { forwardRef } from "react";

interface SelectDropdownProps {
	isSelectorOpen: boolean;
	children: React.ReactNode;
	fullWidth?: boolean;
}

const SelectDropdown = forwardRef<HTMLDivElement, SelectDropdownProps>(
	({ isSelectorOpen, children, fullWidth = true }, ref) => {
		return (
			<div
				ref={ref}
				className={`absolute left-0 top-[48px] z-20 rounded-[0.25rem] border border-[shadowBoxGray] bg-white shadow-md dark:border-[#777777] dark:bg-[#121216] dark:text-[#DDDDDD] ${
					isSelectorOpen ? "block" : "hidden"
				} ${fullWidth ? "w-full" : ""}`}
			>
				{/* Dropdown List */}
				<div className="flex h-[250px] gap-4 p-2">{children}</div>
			</div>
		);
	},
);

SelectDropdown.displayName = "SelectDropdown";

export default SelectDropdown;
