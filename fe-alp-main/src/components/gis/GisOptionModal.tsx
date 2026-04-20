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

import * as React from "react";

interface GisOptionsModalProps {
	isTimeSeries?: boolean;
	children: React.ReactNode;
}

export default function GisOptionsModal({
	isTimeSeries,
	children,
}: Readonly<GisOptionsModalProps>) {
	const modalRef = React.useRef<HTMLDivElement>(null);

	return (
		<div
			ref={modalRef}
			className={`${isTimeSeries ? "z-10 min-w-[38em] items-end" : "z-30 min-w-80"} mx-2 h-fit rounded-md bg-white p-4`}
		>
			<div className={`${!isTimeSeries ? "mt-2" : "h-full"}`}>{children}</div>
		</div>
	);
}
