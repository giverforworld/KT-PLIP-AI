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

import { useState, useEffect } from "react";

type StringUnion = string;

interface ToggleButtonProps<T extends StringUnion> {
	labels: T[];
	selected?: T | null;
	onToggle: (e: React.MouseEvent<HTMLElement>, selected: T) => void;
	activeLabel?: T;
}

/**
 * 토글 버튼
 * @param {ToggleButtonProps} ToggleButtonProps
 * @returns {React.JSX.Element} Component
 */
export default function ToggleButton<T extends StringUnion>({
	labels = [],
	selected,
	onToggle,
	activeLabel,
}: ToggleButtonProps<T>) {
	const [selectedLabel, setSelectedLabel] = useState<T | undefined>(activeLabel || labels[0]);

	const handleToggle = (e: React.MouseEvent<HTMLElement>, option: T) => {
		if (selectedLabel !== option) {
			setSelectedLabel(option);
			onToggle(e, option);
		}
	};

	useEffect(() => {
		if (selected) {
			setSelectedLabel(selected);
		}
	}, [selected]);

	return (
		<span className="inline-block rounded-md bg-boxGray">
			{labels.length > 0 &&
				labels.map((label) => (
					<button
						key={label}
						className={`rounded-md px-2 py-0.5 text-[13px] ${
							selectedLabel === label ? "bg-primary text-white" : ""
						}`}
						onClick={(e) => handleToggle(e, label)}
					>
						{label}
					</button>
				))}
		</span>
	);
}
