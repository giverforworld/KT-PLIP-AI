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
import IconClose from "@images/close_md.svg";

interface TooltipProps {
	children: React.ReactNode;
	setOpenTooltip: Dispatch<SetStateAction<boolean>>;
	buttonPosition: { left: number; top: number };
}

/**
 * 툴팁
 * 부모 태그에 ref={containerRef} className="relative"
 * @param {TooltipProps} TooltipProps
 * @returns {React.JSX.Element} div
 */
export default function Tooltip({ children, setOpenTooltip, buttonPosition }: TooltipProps) {
	const triangleHeight = 15;
	const triangleWidth = 12;

	return (
		<div
			className="absolute z-10 flex min-w-[270px] max-w-[500px] items-start justify-between gap-4 rounded-md bg-[#949494] bg-opacity-90 p-3 pl-5"
			style={{
				left: buttonPosition.left + triangleWidth - 3,
				top: buttonPosition.top - triangleHeight,
				transform: "translateX(-50%) translateY(-100%)",
			}}
		>
			<div className="text-sm text-white">{children}</div>
			<button onClick={() => setOpenTooltip(false)}>
				<IconClose className="text-white" />
			</button>
			<div
				className="absolute border-opacity-90"
				style={{
					bottom: `-${triangleHeight - 1}px`,
					left: `calc(50% - ${triangleWidth}px)`,
					height: 0,
					width: 0,
					borderLeft: `${triangleWidth}px solid transparent`,
					borderRight: `${triangleWidth}px solid transparent`,
					borderTop: `${triangleHeight}px solid #949494`,
				}}
			/>
		</div>
	);
}
