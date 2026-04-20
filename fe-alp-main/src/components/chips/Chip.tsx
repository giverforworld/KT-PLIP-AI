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

export interface ChipProps {
	label: string;
	variant?: "contained" | "outlined";
	color?: "primary" | "focus" | "none";
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
	size?: "default" | "lg";
	fullWidth?: boolean;
}

const chipConfig = {
	contained: {
		primary: {
			bgColor: "bg-primary border-primary",
			color: "text-white",
		},
		focus: {
			bgColor: "bg-focus border-focus",
			color: "text-white",
		},
		none: {
			bgColor: "bg-white border-stroke",
			color: "text-textGray",
		},
	},
	outlined: {
		primary: {
			bgColor: "bg-primary-light border-primary",
			color: "text-primary",
		},
		focus: {
			bgColor: "bg-white border-focus",
			color: "text-focus",
		},
		none: {
			bgColor: "border-stroke",
			color: "text-textGray",
		},
	},
};

/**
 * 기본 Chip
 * @param {ChipProps} ChipProps
 * @returns {React.JSX.Element} Component
 */
export default function Chip({
	label,
	variant = "outlined",
	color = "none",
	Icon,
	size = "default",
	fullWidth = false,
}: Readonly<ChipProps>): React.JSX.Element {
	return (
		<span
			className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-2xl border py-1 text-sm ${chipConfig[variant][color].bgColor} ${chipConfig[variant][color].color} ${fullWidth ? "w-full" : ""} ${size === "default" ? "px-2" : "px-5"}`}
		>
			{label}
			{Icon && <Icon />}
		</span>
	);
}
