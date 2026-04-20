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

interface BadgeProps {
	title: string;
	fullWidth?: boolean;
	isOption?: boolean;
}

export default function Badge({
	title,
	fullWidth = false,
	isOption = false,
}: Readonly<BadgeProps>) {
	const color = isOption
		? "text-textGray bg-tabGray rounded-md px-2 text-semibold gap-1"
		: "bg-primary-light text-primary text-xs";

	const formatTitle = (text: string) => {
		return text.split(/(유입|유출)/).map((part, index) =>
			part === "유입" || part === "유출" ? (
				<span key={index} className="font-semibold">
					{part}
				</span>
			) : (
				part
			),
		);
	};

	return (
		<div
			className={`${color} flex cursor-default items-center justify-center break-keep p-1 text-center ${fullWidth ? "w-full" : ""}`}
		>
			{formatTitle(title)}
		</div>
	);
}
