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

interface TabProps {
	children: React.ReactNode;
	type?: "default" | "line";
	size?: "default" | "small";
	disabled?: boolean;
}

export default function SubTab({
	children,
	type = "default",
	size = "default",
	disabled = false,
}: Readonly<TabProps>) {
	return (
		<ul
			className={` ${type === "default" ? "flex justify-center bg-white" : "flex gap-2"} border-b-2 border-[#F7F8F9] ${disabled ? "opacity-50" : ""}`}
		>
			{children}
		</ul>
	);
}
