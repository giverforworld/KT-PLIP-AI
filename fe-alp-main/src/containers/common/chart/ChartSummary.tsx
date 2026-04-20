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

import RoundedBox from "@/components/boxes/RoundedBox";
// import Chip from "@/components/chips/Chip";
// import ArrowCircle from "@images/arrow_circle.svg";
import ArrowUp from "@images/arrow_up.svg";
import ArrowDown from "@images/arrow_down.svg";

interface ChartSummaryProps {
	// data:
}

export default function ChartSummary({}: ChartSummaryProps) {
	return (
		<RoundedBox>
			<div className="flex gap-4">
				<RoundedBox bgColor="bg-white" border>
					<div className="flex flex-col justify-center items-center gap-2">
						<h4 className="font-semibold text-sm">title</h4>
						<span className="text-sm text-primary">3.5 %</span>
						<ArrowUp />
					</div>
				</RoundedBox>
				<RoundedBox bgColor="bg-white" border>
					<div className="flex flex-col justify-center items-center gap-2">
						<h4 className="font-semibold text-sm">title</h4>
						<span className="text-sm text-blue">3.5 %</span>
						<ArrowDown />
					</div>
				</RoundedBox>
			</div>

			{/* <div>
				<Chip label="유입" variant="contained" color="focus" Icon={ArrowCircle} />
				<Chip label="유출" variant="contained" color="primary" Icon={ArrowCircle} />
			</div> */}
		</RoundedBox>
	);
}
