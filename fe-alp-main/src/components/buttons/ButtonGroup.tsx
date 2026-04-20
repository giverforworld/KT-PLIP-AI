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

interface ButtonGroupProps {
	children: React.ReactNode;
	justify?: "justify-start" | "justify-center" | "justify-end";
	gap?: "gap-1" | "gap-2" | "gap-3" | "gap-4";
	disabled?: boolean;
}

/**
 * 버튼을 그룹화하여 정렬
 * @param {ButtonGroupProps} ButtonGroupProps
 * @returns {React.JSX.Element} div
 */
export default function ButtonGroup({
	children,
	justify = "justify-center",
	gap = "gap-2",
	disabled,
}: ButtonGroupProps) {
	return (
		<div className={`flex items-center ${justify} ${gap} ${disabled ? "opacity-50" : ""}`}>
			{children}
		</div>
	);
}
