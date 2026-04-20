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

import { useEffect } from "react";

interface InteractiveButtonsProps {
	filter: Filter;
	selectedChips: number | number[];
	handleChipClick: (index: number) => void;
}

export function InteractiveButtons({
	filter,
	selectedChips,
	handleChipClick,
}: Readonly<InteractiveButtonsProps>) {
	const labelLength = filter && filter.labels.filter((label) => label !== "전체").length / 3 === 8;

	useEffect(() => {
		const buttons = document.querySelectorAll<HTMLButtonElement>(".btn");

		const mouseMove = (target: HTMLElement, whileMove: (event: MouseEvent) => void) => {
			const endMove = () => {
				window.removeEventListener("mousemove", whileMove);
				window.removeEventListener("mouseup", endMove);
			};

			target.addEventListener("mousedown", (event: MouseEvent) => {
				event.stopPropagation();
				window.addEventListener("mousemove", whileMove);
				window.addEventListener("mouseup", endMove);
			});
		};

		const clickEvent = (event: MouseEvent) => {
			const button = event.target as HTMLButtonElement;
			if (button.style.backgroundColor === "red") {
				button.style.backgroundColor = "gray";
			} else {
				button.style.backgroundColor = "red";
			}
		};

		const onMouseMove = (event: MouseEvent) => {
			if (!(event.target instanceof HTMLButtonElement)) return;
			event.target.style.backgroundColor = "red";
		};

		buttons.forEach((button) => {
			mouseMove(button, onMouseMove);
			button.addEventListener("click", clickEvent);
		});

		return () => {
			buttons.forEach((button) => {
				button.removeEventListener("click", clickEvent);
			});
			window.removeEventListener("mousemove", onMouseMove);
		};
	}, []);

	return (
		<>
			{filter.labels
				.filter((label) => label !== "전체")
				.map((label, index) => {
					const selected = (selectedChips as number[]).includes(index + 1);
					return (
						<button
							key={label}
							className={`btn rounded-md border p-1 text-sm hover:border-filterDarkGray ${selected ? "bg-filterDarkGray text-white" : "bg-tabGray text-textGray"} text-center`}
							onClick={() => handleChipClick(index + 1)}
						>
							{labelLength ? parseFloat(label) : label.replace(" ", " (") + ")"}
						</button>
					);
				})}
		</>
	);
}
