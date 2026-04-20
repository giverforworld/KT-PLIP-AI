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

import { useState } from "react";
import RoundedBox from "@/components/boxes/RoundedBox";
import TextButton from "@/components/buttons/TextButton";
import BaseModal from "@/components/modals/BaseModal";
import RegPopulationDetail from "./RegPopulationDetail";
import RegPopulationSummary from "./RegPopulationSummary";
import IconArrowRight from "@images/arrow_right.svg";

interface RegPopulationProps {
	data: any;
}

export default function RegPopulation({data}: RegPopulationProps) {
	// 주민등록인구
	const RegPopSummary = data[0].summary;
	const regionName = RegPopSummary.split('\n')[0].replace('{', '').replace('}', '');
	const summary1 = RegPopSummary.split('\n')[1].slice(0, -1);
	const summary2 = RegPopSummary.split('\n')[2].slice(0, -5);

	// 성연령별
	const genderSummary = data[3].summary[1];
	const ageSummary = data[4].summary[1];

	// 지방소멸위험
	const extincSummary = data[2].summary[1].replace('{', '').replace('}', '');

	const [openModal, setOpenModal] = useState(false);

	const textData = [
		{
			title: "주민등록인구",
			summary: [
				`${regionName}의 ${summary1}`,
				`${summary2}`,
			],
		},
		{
			title: "성/연령별",
			summary: [
				`${genderSummary}`,
				`${ageSummary}`,
			],
			// summary: genderSummary
		},
		{
			title: "소멸위험지수",
			summary: [
				`지방소멸위험지수 : 가임여성인구(20~39세) ÷ 고령인구(65세 이상)`,
				`${extincSummary}`
			],
		},
	];

	return (
		<>
			<RoundedBox border>
				<div className="mb-2 flex items-center justify-between">
					<h3 className="mb-2 font-semibold">주민등록인구</h3>
					<TextButton
						title="주민등록인구 상세보기"
						Icon={IconArrowRight}
						iconPosition="right"
						onClick={() => setOpenModal(true)}
					/>
				</div>
				<RegPopulationSummary data={textData} />
			</RoundedBox>
			<BaseModal
				open={openModal}
				setOpen={setOpenModal}
				title="주민등록인구 상세분석"
				width="w-8/12"
			>
				<RegPopulationDetail data={data} textData={textData} />
			</BaseModal>
		</>
	);
}
