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

"use client";

import { useEffect } from "react";
import IconClose from "@images/close_md.svg";
import IconCircleSuccess from "@images/circle-success.svg";
import IconCircleError from "@images/circle-error.svg";
import IconCircleWarn from "@images/circle-warn.svg";
import IconCircleInfo from "@images/circle-info.svg";
import { useToastStore } from "@/store/toast";

export default function Toast() {

	const toasts = useToastStore((s)=> s.toasts);
	const removeToast = useToastStore((s) => s.removeToast);
	useEffect(() => {
		const timers = toasts.map((toast) =>
			setTimeout(() => {
				removeToast(toast.id)
			}, 3000),
		);

		return () => {
			timers.forEach((timer) => clearTimeout(timer));
		};
	}, [toasts, removeToast]);

	if (toasts.length === 0) return null;

	const getTypeIcon = (type: ToastType) => {
		switch (type) {
			case "success":
				return <IconCircleSuccess />;
			case "error":
				return <IconCircleError />;
			case "warning":
				return <IconCircleWarn />;
			case "info":
				return <IconCircleInfo />;
			default:
				return <IconCircleSuccess />;
		}
	};

	const getPosition = (position: ToastPosition) => {
		switch (position) {
			case "right":
				return "top-4 right-4";
			case "middle":
				return "top-10 left-1/2 -translate-x-1/2";
			default:
				return "";
		}
	};
	return (
		<div className="pointer-events-none fixed z-50">
			{toasts.map((toast, index) => (
				<div
					key={toast.id}
					className={`pointer-events-auto fixed flex min-w-[350px] animate-slide-down items-center justify-between gap-4 rounded-lg bg-black bg-opacity-95 p-4 text-white shadow-lg ${getPosition(toast.position)}`}
					style={{ marginTop: `${index * 70}px` }}
				>
					<span>{getTypeIcon(toast.type)}</span>
					<div className="flex w-full items-center justify-between">
						{toast.message}
						{toast.callback && (
							<button className="text-sm text-[#FFC804] underline" onClick={toast.callback}>
								변경
							</button>
						)}
					</div>
					<button
						onClick={() =>
							removeToast(toast.id)
						}
					>
						<IconClose />
					</button>
				</div>
			))}
		</div>
	);
}
