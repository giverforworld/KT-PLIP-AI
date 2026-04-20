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
import IconArrowTop from "@images/arrow.svg";

interface SelectorInputProps {
	type?: string;
	isSelectorOpen?: boolean;
	onClick?: () => void;
	inputText: string;
}

const SelectorInput = forwardRef<HTMLButtonElement, SelectorInputProps>(
	({ type, isSelectorOpen, onClick, inputText }, ref) => {
		return (
			<button
				className={`flex h-full w-full items-center justify-between rounded-lg border bg-white pl-2 pr-1 text-left dark:border-[#777777] dark:bg-darkModeBackGary dark:text-[#DDDDDD] ${type === "DateRangeSelector" ? "text-sm" : "text-md"}`}
				onClick={onClick}
				ref={ref}
			>
				<span
					className={`overflow-hidden whitespace-nowrap ${inputText.length >= 16 ? "text-[13px]" : "text-md"}`}
				>
					{inputText}
				</span>
				{type === "DateRangeSelector" || (
					<span className={isSelectorOpen ? "" : "rotate-180"}>
						<IconArrowTop />
					</span>
				)}
			</button>
		);
	},
);

SelectorInput.displayName = "SelectorInput";

export default SelectorInput;
