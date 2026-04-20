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
import React, { forwardRef } from "react";

interface TabItemProps {
	children: React.ReactNode;
	isActive: boolean;
	href?: string;
	scroll?: boolean;
	type?: "default" | "line" | "border";
	size?: "default" | "small";
	width?: "w-full" | "w-auto" | "w-auto grow";
	onClick?: (...args: any[]) => void;
	onMouseOver?: React.MouseEventHandler<HTMLAnchorElement>;
	onMouseOut?: React.MouseEventHandler<HTMLAnchorElement>;
}

const TabItem = forwardRef<HTMLLIElement, TabItemProps>(
	(
		{
			isActive,
			href = "",
			scroll = true,
			type = "default",
			size = "default",
			width = "w-full",
			children,
			onClick,
			onMouseOver,
			onMouseOut,
		},
		ref,
	) => {
		switch (type) {
			case "default":
				return (
					<li className={width}>
						<Link
							href={href}
							scroll={scroll}
							className={`flex h-full w-full items-center justify-center gap-1 p-2 ${
								isActive ? "rounded-md bg-white font-bold text-primary" : "text-textGray"
							} ${size === "small" ? "text-sm" : "text-md"}`}
							onClick={onClick || undefined}
						>
							{children}
						</Link>
					</li>
				);
			case "line":
				return (
					<li className={width}>
						<Link
							href={href}
							className={`flex w-full items-center justify-center border-b-2 ${
								isActive ? "border-primary font-semibold text-primary" : ""
							} ${size === "small" ? "py-1 text-sm" : "text-md p-3"}`}
							onClick={onClick || undefined}
						>
							{children}
						</Link>
					</li>
				);
			case "border":
				return (
					<li className={width} ref={ref}>
						<Link
							href={href}
							className={`flex w-full items-center justify-center rounded-t-md border ${
								isActive
									? "border-b-0 border-primary font-semibold text-primary"
									: "border-borderGray text-[#888888]"
							} ${size === "small" ? "p-2 text-sm" : "text-md p-3"}`}
							onClick={onClick || undefined}
							onMouseOver={onMouseOver || undefined}
							onMouseOut={onMouseOut || undefined}
						>
							{children}
						</Link>
					</li>
				);
			default:
				return null;
		}
	},
);

TabItem.displayName = "TabItem";

export default TabItem;
