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

export interface BaseButtonProps {
	title: string;
	type?: "submit" | "reset" | "button";
	size?: "xl" | "lg" | "md" | "sm" | "m";
	color?:
		| "primary"
		| "primary_light"
		| "secondary"
		| "gray"
		| "white"
		| "darkGray"
		| "outlined"
		| "outlined_gray"
		| "disabled"
		| "semiblack"
		| "black";
	fullWidth?: boolean;
	justify?: string;
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
	IconFirst?: boolean;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
	disabled?: boolean;
}

const baseButtonConfig = {
	// Colors
	primary: {
		bgColor: "bg-primary border-primary",
		color: "text-white",
	},
	primary_light: {
		bgColor: "bg-primary-light border-primary-light",
		color: "text-primary",
	},
	secondary: {
		bgColor: "bg-secondary border-secondary",
		color: "text-black",
	},
	gray: {
		bgColor: "bg-buttonGray border-borderGray",
		color: "text-black",
	},
	darkGray: {
		bgColor: "bg-[#666666] border-[##666666]",
		color: "text-white",
	},
	white: {
		bgColor: "bg-white",
		color: "text-black",
	},
	outlined: {
		bgColor: "bg-white border-gray",
		color: "text-black",
	},
	outlined_gray: {
		bgColor: "bg-white border-filterLightGray",
		color: "text-textLightGray",
	},
	disabled: {
		bgColor: "bg-disAbled border-disAbled",
		color: "text-textGray",
	},
	semiblack: {
		bgColor: "bg-filterDarkGray border-filterDarkGray",
		color: "text-white",
	},
	black: {
		bgColor: "bg-black border-black",
		color: "text-white",
	},

	// Sizes
	sm: "px-2 py-1 text-xs",
	md: "px-4 py-2 text-sm",
	lg: "px-5 py-3 text-sm",
	xl: "px-6 py-3 text-md",
	m: "px-4 py-1 text-sm h-10",
};

/**
 * 기본 버튼
 * @param {BaseButtonProps} BaseButtonProps
 * @returns {React.JSX.Element} Component
 */
export default function BaseButton({
	title,
	type = "button",
	size = "md",
	color = "primary",
	fullWidth = false,
	justify = "center",
	Icon,
	IconFirst = true,
	onClick,
	disabled = false,
}: Readonly<BaseButtonProps>) {
	return (
		<button
			type={type}
			onClick={onClick}
			className={`inline-flex items-center justify-${justify} gap-1 break-keep ${justify === "between" ? "rounded-b-md rounded-t-none border-t !p-4" : "border"} ${size === "m" ? "rounded-[4px] hover:!text-[#555]" : "rounded-md"} ${baseButtonConfig[color].bgColor} ${baseButtonConfig[color].color} ${baseButtonConfig[size]} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50" : ""} ${Icon && IconFirst && size === "md" ? "pl-1.5" : ""}`}
			disabled={disabled}
		>
			{Icon && IconFirst && (
				<Icon
					className={`${baseButtonConfig[color].color} ${size === "m" && "hover:!text-[#555]"}`}
				/>
			)}
			{title}
			{Icon && !IconFirst && (
				<Icon
					className={`${baseButtonConfig[color].color} ${size === "m" && "hover:!text-[#555]"}`}
				/>
			)}
		</button>
	);
}
