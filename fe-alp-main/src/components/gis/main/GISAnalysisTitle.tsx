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
import Tooltip from "@/components/tooltip/Tooltip";
import * as React from "react";

interface GISAnalysisTitleProps {
	title: string;
	tooltip?: string;
}

export default function GISAnalysisTitle({ title, tooltip }: Readonly<GISAnalysisTitleProps>) {
	return (
		<div className="flex">
			<h3 className="font-semibold text-black">{title}</h3>
			{tooltip && <Tooltip aod message={tooltip} />}
		</div>
	);
}
