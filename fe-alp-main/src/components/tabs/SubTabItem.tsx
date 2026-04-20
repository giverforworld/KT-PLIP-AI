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

import Link from "next/link";

interface SubTabItemProps {
	children: React.ReactNode;
	isActive: boolean;
	href?: string;
	scroll?: boolean;
	type?: "default" | "line";
	size?: "default" | "small";
	onClick?: (...args: any[]) => void;
}

export default function SubTabItem({
	isActive,
	href = "",
	scroll = true,
	type = "default",
	size = "default",
	children,
	onClick,
}: Readonly<SubTabItemProps>) {
	if (type === "default") {
		return (
			<li className="w-full px-4">
				<Link
					href={href}
					scroll={scroll}
					className={`flex h-full w-full items-center justify-center gap-1 ${
						isActive ? "border-b border-primary py-3 font-bold text-primary" : "text-textGray"
					} ${size === "small" ? "text-sm" : "text-md"} `}
					onClick={onClick || undefined}
				>
					{children}
				</Link>
			</li>
		);
	} else {
		return (
			<li>
				<Link
					href={href}
					className={`flex items-center ${isActive ? "border-primary font-semibold text-primary" : ""} ${size === "small" ? "text-sm" : "text-md"} `}
					onClick={onClick || undefined}
				>
					{children}
				</Link>
			</li>
		);
	}
}
