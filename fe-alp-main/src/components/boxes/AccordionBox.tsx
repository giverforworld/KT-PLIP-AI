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
import RoundedBox, { RoundedBoxProps } from "./RoundedBox";
import IconArrowTop from "@images/arrow.svg";
import AvgSumUniqueTab, { AvgSumUniqueTabProps } from "@/containers/common/data/AvgSumUniqueTab";

interface AccordionBoxProps extends RoundedBoxProps {
	title: string;
	tabState?: AvgSumUniqueTabProps;
	defaultOpen?: boolean;
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * 토글하여 여닫는 박스
 * @param {AccordionBoxProps} AccordionBoxProps
 * @returns {React.JSX.Element} Component
 */
export default function AccordionBox({
	title,
	tabState,
	defaultOpen = true,
	Icon,
	...props
}: AccordionBoxProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<RoundedBox
			bgColor={props.bgColor}
			padding={props.padding}
			border={props.border}
			shadow={props.shadow}
		>
			{/* Accordion Header */}
			<div className="flex justify-between">
				<h3 className="flex items-center gap-2 text-lg font-semibold">
					{Icon && <Icon />}
					<span>{title}</span>
				</h3>
				<div className="flex items-center gap-2">
					{tabState && (
						<AvgSumUniqueTab
							activeTab={tabState.activeTab}
							setActiveTab={tabState.setActiveTab}
							shouldDisplayTab={tabState.shouldDisplayTab}
						/>
					)}
					<button
						className={`transform transition-transform duration-300 ease-in-out ${
							isOpen ? "rotate-0" : "rotate-180"
						}`}
						onClick={() => setIsOpen(!isOpen)}
					>
						<IconArrowTop aria-label="요약 열고 닫기" role="button" />
					</button>
				</div>
			</div>

			{/* Accordion Contents */}
			<div
				className={`transition-max-height overflow-hidden duration-300 ease-in-out ${
					isOpen ? "max-h-full" : "max-h-0"
				}`}
			>
				<div className="mt-0">{props.children}</div>
			</div>
		</RoundedBox>
	);
}
