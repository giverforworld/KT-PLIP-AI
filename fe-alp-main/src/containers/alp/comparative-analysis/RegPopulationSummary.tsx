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
import Badge from "@/components/chips/Badge";

interface RegPopulationSummary {
	data: { title: string; summary: string[] }[];
}

export default function RegPopulationSummary({ data }: RegPopulationSummary) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{data.map((item) => (
				<RoundedBox key={item.title} bgColor="bg-white">
					<h3 className="font-semibold">{item.title}</h3>
					<ul className="my-1 list-disc pl-4">
						{item.summary.map((summa, index) => (
							<li key={index} className="text-sm leading-6">
								{summa}
							</li>
						))}
					</ul>
				</RoundedBox>
			))}
		</div>
	);
}
