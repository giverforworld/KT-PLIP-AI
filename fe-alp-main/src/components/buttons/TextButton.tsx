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

interface TextButtonProps {
	title: string;
	disabled?: boolean;
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
	iconPosition?: "left" | "right";
	onClick?: () => void;
}

/**
 * Text Button
 * @param {TextButtonProps} TextButtonProps
 * @returns {React.JSX.Element} Button
 */
export default function TextButton({
	title,
	disabled,
	Icon,
	onClick,
	iconPosition = "left",
}: Readonly<TextButtonProps>) {
	return (
		<button className="flex items-center" onClick={disabled ? () => {} : onClick}>
			{iconPosition === "left" && Icon && <Icon className="text-black" />}
			<span
				className={`text-sm ${title === "전체선택" ? "underline" : ""} ${disabled ? "text-[#DDDDDD]" : ""}`}
			>
				{title}
			</span>
			{iconPosition === "right" && Icon && <Icon className="text-black" />}
		</button>
	);
}
