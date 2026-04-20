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
import BaseButton from "../buttons/BaseButton";
import ButtonGroup from "../buttons/ButtonGroup";
import IconClose from "@images/close.svg";

interface DialogProps {
	type: "alert" | "confirm";
	open: boolean;
	setOpen: (value: boolean) => void;
	title: string;
	text: string;
	subText?: string;
	icon?: React.ReactNode;
	onYes?: () => void;
	onNo?: () => void;
}

/**
 * "alert" : Alert 문구를 확인하고 닫는 모달
 * "confirm" : "확인", "취소"를 선택할 수 있는 모달로 onYes에 yes시 핸들링 로직을, onNo에 취소시 핸들링 로직을 넣어주면 됨
 * @param {DialogProps} DialogProps
 * @returns {React.JSX.Element} div
 */

export default function Dialog({
	type = "alert",
	open,
	setOpen,
	title,
	text,
	subText,
	icon,
	onYes = () => setOpen(false),
	onNo = () => setOpen(false),
}: DialogProps) {
	if (!open) return null;

	return (
		<Dimmed>
			<div className="w-full max-w-md rounded-lg bg-white px-4 py-5">
				<div className="flex items-center justify-between">
					<h3 className="text-xl font-semibold">{title}</h3>
					<button
						onClick={() => setOpen(false)}
						className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-filterLightGray text-gray-700 hover:text-gray-900 focus:outline-none"
					>
						<IconClose />
					</button>
				</div>
				<div className="mb-10 mt-6 flex flex-col items-center justify-center gap-4">
					{icon}
					<div className="flex flex-col items-center justify-center gap-1">
						<p className="font-semibold">{text}</p>
						<p className="text-sm">{subText}</p>
					</div>
				</div>
				<ButtonGroup>
					{type === "alert" ? (
						<BaseButton title="확인" onClick={() => setOpen(false)} />
					) : (
						<>
							<BaseButton title="취소" onClick={onNo} color="outlined" fullWidth />

							<BaseButton title="확인" onClick={onYes} fullWidth />
						</>
					)}
				</ButtonGroup>
			</div>
		</Dimmed>
	);
}
