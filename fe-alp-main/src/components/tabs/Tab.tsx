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
	type?: "default" | "line" | "border";
	size?: "default" | "small";
	width?: string;
	disabled?: boolean;
}

export default function Tab({
	children,
	type = "default",
	size = "default",
	width = "w-full",
	disabled = false,
}: Readonly<TabProps>) {
	let className;

	switch (type) {
		case "default":
			className = `${width} ${size === "small" ? "p-1" : "p-2"} flex justify-center rounded-md bg-tabGray`;
			break;
		case "line":
			className = `${width} flex p-0`;
			break;
		case "border":
			className = `${width} flex p-0 gap-1`;
			break;
		default:
			break;
	}

	return <ul className={`${className} ${disabled ? "opacity-50" : ""}`}>{children}</ul>;
}
