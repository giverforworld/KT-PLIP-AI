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

import React, { Dispatch, SetStateAction } from "react";
import RAAIcon from "@images/RouteAnalysisAdderOff.svg";
import RCAIcon from "@images/RegionComparisonAdderOff.svg";
import RCAPopUp from "@images/RegionComparisonAdderPopUP.svg";
import RAAPopUp from "@images/RouteAnalysisAdderPopUP.svg";
import Line from "@images/line.svg";
import Plus from "@images/plusIcon.svg";
import InputWrapper from "@/components/forms/InputWrapper";

interface MopSelectorContainerProps {
	mopAnalysis: MopAnalysis;
	setMopAnalysis: Dispatch<SetStateAction<MopAnalysis>>;
	// mopAnalysisHelperTooltip: MopAnalysis;
	// setMopAnalysisHelperTooltip: Dispatch<SetStateAction<MopAnalysis>>;
}

// CHECKED_20241112: 해당 컴포넌트 사용하지 않음
export default function MopSelectorContainer({
	mopAnalysis,
	setMopAnalysis,
	// mopAnalysisHelperTooltip,
	// setMopAnalysisHelperTooltip,
}: MopSelectorContainerProps) {
	const onClickTab = (key: keyof typeof mopAnalysis) => {
		setMopAnalysis((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<>
			{mopAnalysis.mopRca || mopAnalysis.mopRaa ? null : (
				<div className="col-span-3 flex gap-4">
					<Line />
					<div className="grow">
						<InputWrapper label="추가 분석하기" name="">
							<div className="flex">
								{/* 지역비교 분석 */}
								<div
									className="group mr-4 flex h-[48px] w-full cursor-pointer items-center justify-between rounded-lg border border-filterLightGray bg-white p-4 hover:border-filterDarkGray hover:bg-gray-100 hover:shadow-md"
									// onMouseEnter={() =>
									// 	setMopAnalysisHelperTooltip((prev) => ({ ...prev, mopRca: true }))
									// }
									// onMouseLeave={() =>
									// 	setMopAnalysisHelperTooltip((prev) => ({ ...prev, mopRca: false }))
									// }
									onClick={() => onClickTab("mopRca")}
								>
									<div className="flex items-center gap-2 text-filterGray">
										<RCAIcon className="fill-current text-filterGray group-hover:text-filterDarkGray" />
										<span className="text-sm font-medium group-hover:text-filterDarkGray">
											지역비교 분석
										</span>
									</div>
									<Plus className="fill-current text-filterGray group-hover:text-filterDarkGray" />
									{/* {mopAnalysisHelperTooltip.mopRca && (
										<RCAPopUp className="absolute right-[25rem] top-[22rem] z-20" />
									)} */}
								</div>

								{/* 출발지&도착지 분석 */}
								<div
									className="group flex h-[48px] w-full cursor-pointer items-center justify-between rounded-lg border border-filterLightGray bg-white p-4 hover:border-filterDarkGray hover:bg-gray-100 hover:shadow-md"
									// onMouseEnter={() =>
									// 	setMopAnalysisHelperTooltip((prev) => ({ ...prev, mopRaa: true }))
									// }
									// onMouseLeave={() =>
									// 	setMopAnalysisHelperTooltip((prev) => ({ ...prev, mopRaa: false }))
									// }
									onClick={() => onClickTab("mopRaa")}
								>
									<div className="flex items-center gap-2 text-filterGray">
										<RAAIcon className="fill-current text-filterGray group-hover:text-filterDarkGray" />
										<span className="text-sm font-medium group-hover:text-filterDarkGray">
											출발지&도착지 분석
										</span>
									</div>
									<Plus className="fill-current text-filterGray group-hover:text-filterDarkGray" />
									{/* {mopAnalysisHelperTooltip.mopRaa && (
										<RAAPopUp className="absolute right-[12rem] top-[22rem] z-20" />
									)} */}
								</div>
							</div>
						</InputWrapper>
					</div>
				</div>
			)}
		</>
	);
}
