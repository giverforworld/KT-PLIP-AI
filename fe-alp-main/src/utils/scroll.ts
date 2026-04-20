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

export const scrollToTargetContainer = (
	containerEl: HTMLElement | null,
	targetId: string,
	offset: number,
) => {
	const targetEl = document.getElementById(targetId);

	if (containerEl && targetEl) {
		const containerTop = getAbsolutePositionTop(containerEl);
		const targetTop = getAbsolutePositionTop(targetEl);

		containerEl.scrollTo({
			top: targetTop - containerTop - offset,
			behavior: "smooth",
		});
	}
};

const getAbsolutePositionTop = (element: HTMLElement): number => {
	let positionTop = 0;

	while (element) {
		positionTop += element.offsetTop; // 현재 요소의 offsetTop 값을 더해줌
		element = element.offsetParent as HTMLElement;
	}

	return positionTop;
};
