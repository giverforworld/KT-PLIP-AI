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

import Chip, { ChipProps } from "./Chip";

interface FilterChipProps extends ChipProps {
	selected?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}

/**
 * Filter 용도로 사용하는 Chip
 * @param {FilterChipProps} FilterChipProps
 * @returns {React.JSX.Element} Component
 */
export default function FilterChip({
	selected,
	disabled,
	onClick,
	...props
}: Readonly<FilterChipProps>) {
	return (
		<button onClick={disabled ? () => {} : onClick} className={`${props.fullWidth && "w-full"}`}>
			<Chip
				label={props.label}
				variant="outlined"
				color={selected ? "primary" : "none"}
				Icon={props.Icon}
				size={props.size}
				fullWidth={props.fullWidth}
			/>
		</button>
	);
}
