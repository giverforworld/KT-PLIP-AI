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

import Dimmed from "./Dimmed";
import IconClose from "@images/close.svg";
import BaseButton, { BaseButtonProps } from "../buttons/BaseButton";
import ButtonGroup from "../buttons/ButtonGroup";

interface BaseModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	title: string;
	subtitle?: string;
	info?: string;
	children: React.ReactNode;
	width?: string;
	padding?: string;
	scroll?: boolean;
	buttons?: BaseButtonProps[];
}

/**
 * 기본 모달
 * @param {BaseModalProps} BaseModalProps
 * @returns {React.JSX.Element} div
 */

export default function BaseModal({
	open,
	setOpen,
	title,
	subtitle,
	info,
	children,
	width = "w-1/2",
	padding = "p-5",
	scroll = true,
	buttons,
}: Readonly<BaseModalProps>) {
	if (!open) return null;

	return (
		<Dimmed>
			<div
				className={`${width} rounded-lg bg-white ${padding} ${title === "시각화 프리셋" ? "min-w-[68%]" : ""}`}
			>
				<div className="flex items-center justify-between">
					<h3
						className={`${subtitle ? "text-3xl font-bold text-primary" : "text-xl font-semibold"}`}
					>
						{title}
					</h3>
					<div className="flex items-center gap-4">
						{buttons && (
							<ButtonGroup>
								{buttons.map((button, index) => (
									<BaseButton key={index} {...button} />
								))}
							</ButtonGroup>
						)}
						<button
							onClick={() => setOpen(false)}
							className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-filterLightGray text-gray-700 hover:text-gray-900 focus:outline-none"
						>
							<IconClose />
						</button>
					</div>
				</div>
				{subtitle && <p className="text-lg font-medium">{subtitle}</p>}
				{info && <p className="text-sm font-normal text-[#999999]">{info}</p>}
				{scroll ? (
					<div className="custom-scrollbar mt-6 max-h-[75vh] overflow-y-auto">{children}</div>
				) : (
					<div className="mt-6">{children}</div>
				)}
			</div>
		</Dimmed>
	);
}
