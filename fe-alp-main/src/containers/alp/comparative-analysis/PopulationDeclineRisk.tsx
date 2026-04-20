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
import { useEffect, useState } from "react";

interface PopulationDeclineRiskProps {
	data: any;
}
export default function PopulationDeclineRisk({data}: PopulationDeclineRiskProps) {
	const [grade, setGrade] = useState<any>();
	useEffect(() => {
		if (data) {
			const extincScore = Number(Array.isArray(data) ? data[0].match(/\d+\.\d{2}/g)[0] : data.match(/\d+\.\d{2}/g)[0]);
			const grade = extincScore >= 1.5 ? "1.5 이상"
						: extincScore >= 1.0 ? "1.0 ~ 1.5 미만"
						: extincScore >= 0.5 ? "0.5 ~ 1.0 미만"
						: extincScore >= 0.2 ? "0.2 ~ 0.5 미만"
						: "0.2 미만";
			setGrade(grade);
		}
	}, [data])
	const riskScores = [
		{ name: "소멸위험 지수 매우 낮음", score: "1.5 이상", color: "bg-sky-500", textColor: "text-sky-800"},
		{ name: "소멸위험 지수 보통", score: "1.0 ~ 1.5 미만", color: "bg-emerald-500", textColor: "text-emerald-800"  },
		{ name: "주의 단계", score: "0.5 ~ 1.0 미만", color: "bg-yellow-200", textColor: "text-yellow-800" },
		{ name: "소멸위험지역-진입단계", score: "0.2 ~ 0.5 미만", color: "bg-orange-200", textColor: "text-orange-800" },
		{ name: "소멸위험지역-고위험단계", score: "0.2 미만", color: "bg-red-200", textColor: "text-red-800" },
	] as const;

	return (
		<div className="col-span-2">
			<h4 className="text-sm font-semibold">소멸 위험지수 지표</h4>
			<span className="text-xs">가임여성인구(20~39세) ÷ 고령인구(65세 이상)</span>
			<div className="mt-2 flex gap-2 text-center text-sm">
				{grade && riskScores.map((risk) => {
					const isActive = risk.score === grade;
					return (
						<RoundedBox
							key={risk.name}
							bgColor={isActive ? risk.color : "bg-whiteGray"}
							padding="p-2"
							border
						>
							<p
								className={`mb-1 font-semibold ${
									isActive ? risk.textColor : ""
								}`}
							>
								{risk.name}
							</p>
							<span className={`${isActive ? risk.textColor : ""}`}>
								{risk.score}
							</span>
						</RoundedBox>
					);
				})}
			</div>
		</div>
	);
}
