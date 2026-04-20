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

import ToggleButton from "../buttons/ToggleButton";
import Tooltip from "../tooltip/Tooltip";

interface InputWrapperProps {
	label: string;
	name: string;
	children: React.ReactNode; // input, selectbox
	toggleLabels?: string[];
	onToggle?: (e: React.MouseEvent<HTMLElement>, selected: string) => void; // 토글 버튼 클릭 시 호출되는 콜백 함수
	labelColor?: String;
	hasInfo?: boolean;
	message?: string;
	errorMessage?: string;
	dateSelector?: DateSelectorType;
}

/**
 * Layout 유지를 위해 모든 Input 요소를 감싸는 Wrapper
 * @param {InputWrapperProps} InputWrapperProps
 * @returns {React.JSX.Element} Component
 */
export default function InputWrapper({
	label,
	name,
	toggleLabels,
	onToggle,
	children,
	labelColor = "text-black",
	hasInfo = false,
	message = "",
	errorMessage,
	dateSelector,
}: Readonly<InputWrapperProps>) {
	return (
		<div className="w-full">
			<div className="flex h-[40px] items-center justify-between">
				<span className={`inline-flex items-center`}>
					<span className={`${labelColor} font-semibold`}>{label}</span>
					{hasInfo && (
						<div className="relative flex items-center text-[#BBBBBB]">
							<Tooltip message={message} aod={false} closeButton bgcolor left />
						</div>
					)}
				</span>
				{toggleLabels && onToggle && (
					<ToggleButton
						labels={toggleLabels}
						selected={dateSelector ? dateSelector : undefined}
						onToggle={onToggle}
					/>
				)}
			</div>
			<div className="h-[48px]">{children}</div>
			{errorMessage && <p className="p-1 text-xs text-red-500">{errorMessage}</p>}
		</div>
	);
}
