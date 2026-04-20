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

import React from "react";
import { MdTune } from "react-icons/md";

interface GISLegendProps {
	colors: string[];
	labels: string[];
	legendLabel: string;
	mapIdx: number;
}

export default function GISLegend({
	colors,
	labels,
	legendLabel,
	mapIdx,
}: Readonly<GISLegendProps>) {
	if (!labels?.length || !colors?.length) return;

	return (
		<div className={`absolute bottom-4 ${mapIdx === 1 ? "left-0" : "right-0"} z-10 w-52 p-4`}>
			{/* <div className={`z-10 w-56 p-4`}> */}
			<div className="relative z-20 flex flex-col items-start rounded-lg bg-white p-2">
				{colors.map((color, index) => (
					<div
						key={index}
						className={`relative flex h-6 w-full items-center justify-end px-2 ${
							index === 0 ? "rounded-t-lg" : ""
						} ${index === colors.length - 1 ? "rounded-b-lg" : ""}`}
						style={{ backgroundColor: color }}
					>
						<span className="absolute right-2 text-xs font-medium text-white">{labels[index]}</span>
					</div>
				))}
				<div className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#EDEDED] p-1">
					<MdTune />
					<span>{`범례 : ${legendLabel}`}</span>
				</div>
			</div>
		</div>
	);
}
