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

import { Dispatch, SetStateAction } from "react";
import { FilterType } from "@/constants/filter";
import IconClose from "@images/close_sm.svg";
import _ from "lodash";

interface FilterChipButtonProps {
	filter: FilterType;
	displayFilters: { [key: string]: number[] };
	setDisplayFilters: Dispatch<SetStateAction<{ [key: string]: number[] }>>;
}

export default function FilterChipButton({
	filter,
	displayFilters,
	setDisplayFilters,
}: FilterChipButtonProps) {
	const handleClose = () => {
		const newDisplayFilter = _.omit(displayFilters, filter.key!);
		setDisplayFilters(newDisplayFilter);
	};

	return (
		<>
			{!displayFilters[filter.key!] || displayFilters[filter.key!]?.length === 0 ? (
				""
			) : (
				<div className="flex items-center gap-1 rounded-md border-2 border-[#D6345740] bg-white px-1 text-sm">
					<span className="font-semibold text-primary">
						{`+${displayFilters[filter.key!]?.length}`}
					</span>
					<button onClick={handleClose}>
						<IconClose className="text-filterDarkGray" />
					</button>
				</div>
			)}
		</>
	);
}
