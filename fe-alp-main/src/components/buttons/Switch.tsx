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

interface SwitchProps {
	isActive: boolean;
	onToggle: (switchKey?: string) => void;
	switchKey?: string;
}

export default function Switch({ isActive, onToggle, switchKey }: Readonly<SwitchProps>) {
	return (
		<button
			className={`flex h-6 w-10 cursor-pointer items-center rounded-full border p-1 ${isActive ? "bg-primary" : "border-borderGray bg-backGray"}`}
			onClick={() => onToggle(switchKey)}
		>
			<div
				className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isActive ? "translate-x-4" : "translate-x-0"}`}
			/>
		</button>
	);
}
