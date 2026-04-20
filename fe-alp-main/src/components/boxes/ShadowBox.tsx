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

interface ShadowBoxProps {
	children: React.ReactNode;
	padding?: string;
}

/**
 * Shadow Box
 * @param {ShadowBoxProps} ShadowBoxProps
 * @returns {React.JSX.Element} Component
 */
export default function ShadowBox({ children, padding = "p-4" }: ShadowBoxProps) {
	return (
		<div
			className={`border-shadowBoxGray shadow-custom-light rounded-md border bg-white ${padding}`}
		>
			{children}
		</div>
	);
}
