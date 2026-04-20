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

export interface RoundedBoxProps {
	children: React.ReactNode;
	bgColor?: "bg-white" | "bg-whiteGray" | "bg-lightGray" | "bg-backGray" | "bg-primary-light" | "bg-sky-500" | "bg-emerald-500" | "bg-yellow-200" | "bg-orange-200" | "bg-red-200";
	darkBgColor?: "bg-darkModeBackGary" | "bg-darkModeBoxGray" | "bg-darkModeMapBackGray";
	border?: boolean;
	padding?: string;
	fullHeight?: boolean;
	shadow?: boolean;
	height?: string;
	darkMode?: boolean;
}

/**
 * 기본 Rounded Box
 * @param {RoundedBoxProps} RoundedBoxProps
 * @returns {React.JSX.Element} Component
 */
export default function RoundedBox({
	children,
	bgColor = "bg-whiteGray",
	darkBgColor = "bg-darkModeBackGary",
	padding = "p-4",
	border = false,
	fullHeight = false,
	shadow = false,
	height = "",
	darkMode = false,
}: RoundedBoxProps) {
	const baseClasses = [
		"w-full",
		"rounded-md",
		padding,
		fullHeight ? "h-full" : "",
		shadow ? "shadow-md" : "",
		height,
	];

	const themeClasses = darkMode
		? `${darkBgColor} border ${darkBgColor === "bg-darkModeBackGary" ? "border-[#555555]" : "border-[#333333]"}`
		: `${bgColor} ${border ? "border border-stroke" : ""}`;
	return <div className={`${baseClasses.join(" ")} ${themeClasses}`}>{children}</div>;
}
