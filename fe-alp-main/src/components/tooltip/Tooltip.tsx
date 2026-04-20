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
import Info from "@images/info.svg";
import * as React from "react";

interface TooltipProps {
	position?: string;
	message: string;
	aod?: boolean;
	bgcolor?: boolean;
	closeButton?: boolean;
	left?: boolean;
	bottom?: boolean;
}

export default function Tooltip({
	position,
	message,
	aod,
	bgcolor,
	closeButton,
	left,
	bottom,
}: Readonly<TooltipProps>) {
	const [hovered, setHovered] = React.useState(false);
	const [closed, setClosed] = React.useState(true); // 닫기 버튼을 눌렀는지 여부
	const tooltipRef = React.useRef<HTMLDivElement>(null);

	const handleClose = () => {
		setClosed(true); // 닫기 버튼이 눌리면 툴팁을 숨김
	};

	const handleToggle = () => {
		if (closed) {
			setClosed(false);
			setHovered(true);
		} else {
			setHovered((prev) => !prev);
		}
	};

	// 외부 클릭 감지
	React.useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			// 툴팁과 버튼 외부 클릭 시 닫기
			if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
				setClosed(true);
				setHovered(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const shouldDisplayTooltip = aod || hovered;
	const align = bottom ? "ballon-b" : left ? "ballon-l -left-5" : "ballon-r -right-[0.4em]";
	return (
		<div className={`${position ?? "relative"} inline-flex items-center`}>
			<button
				className={`group relative inline-flex flex-row items-center px-1`}
				onClick={handleToggle}
				onMouseEnter={closeButton ? () => {} : () => setHovered(true)}
				onMouseLeave={closeButton ? () => {} : () => setHovered(false)}
			>
				<Info />
			</button>

			{!closed && (
				<div
					ref={tooltipRef} // ref를 툴팁에 적용
					className={`${
						bgcolor ? "bg-bgGrey text-white" : "bg-transparent text-[#8C8C8C]"
					} ${bottom && "!top-8 -left-3"} ${
						closeButton ? `${align} absolute top-[-65px] p-2` : "relative"
					} flex w-max transform items-center justify-center whitespace-pre-line rounded text-start text-sm`}
				>
					{message}
					{closeButton && (
						<div className="right-[-10px] top-[-10px]">
							<button onClick={handleClose} className="rounded-full px-2 py-1 text-lg">
								×
							</button>
						</div>
					)}
					<div className="border-0 border-solid border-[#eef3fd]"></div>
				</div>
			)}
		</div>
	);
}
