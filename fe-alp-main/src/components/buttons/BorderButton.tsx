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

interface BorderButtonProps {
	title: string;
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
	onClick?: () => void;
}

/**
 * Border Button
 * @param {BorderButtonProps} BorderButtonProps
 * @returns {React.JSX.Element} Button
 */
export default function BorderButton({ title, Icon, onClick }: Readonly<BorderButtonProps>) {
	return (
		<button
			className="flex items-center gap-1 rounded-md border border-[#e4e4e4] px-3 py-2"
			onClick={onClick}
		>
			<span className="text-sm">{title}</span>
			{Icon && <Icon className="text-black" />}
		</button>
	);
}
