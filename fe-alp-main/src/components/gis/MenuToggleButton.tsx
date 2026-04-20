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

import ModalOpen from "@images/gis/modal_open.svg";
import ModalClose from "@images/gis/modal_close.svg";
import { useEffect } from "react";

interface MenuToggleButtonProps {
	position: "left" | "right";
	gisSettings: GisSettings;
	onClick: () => void;
}

export function MenuToggleButton({
	position,
	onClick,
	gisSettings,
}: Readonly<MenuToggleButtonProps>) {
	// 조건에 따라 아이콘을 변경
	const isMenuOpen = gisSettings.maps[position === "left" ? 0 : 1].isSideBar;
	let renderIcon =
		position === "left" ? (
			isMenuOpen ? (
				<ModalOpen />
			) : (
				<ModalClose />
			)
		) : isMenuOpen ? (
			<ModalClose />
		) : (
			<ModalOpen />
		);

	useEffect(() => {
		renderIcon =
			position === "left" ? (
				isMenuOpen ? (
					<ModalOpen />
				) : (
					<ModalClose />
				)
			) : isMenuOpen ? (
				<ModalClose />
			) : (
				<ModalOpen />
			);
	}, [position]);

	// position에 따라 다른 rounded 클래스 설정
	const roundedClass = position === "left" ? "rounded-br rounded-tr" : "rounded-bl rounded-tl";

	return (
		<button
			onClick={onClick}
			className={`${roundedClass} relative z-50 h-fit border bg-white px-1 py-6`}
		>
			{renderIcon}
		</button>
	);
}
