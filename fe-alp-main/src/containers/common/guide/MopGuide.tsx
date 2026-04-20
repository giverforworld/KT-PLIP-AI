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
import { GuideListWrapper } from "../data/GuideList";
import IconGuideAlpOne from "@images/guide_title_alp_1.svg";
import IconGuideAlpTwo from "@images/guide_title_alp_9.svg";
import IconGuideAlpThree from "@images/guide_title_alp_3.svg";
import IconGuideAlpFour from "@images/guide_title_alp_8.svg";
import IconGuideAlpSix from "@images/guide_title_alp_6.svg";
import IconGuideAlpFive from "@images/guide_title_alp_10.svg";
import IconGuideAlpSeven from "@images/guide_title_alp_11.svg";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";

export default function MopGuide() {
	const [activeTab, setActiveTab] = useState(0);
	const tabList = ["생활이동", "생활이동 데이터", "주요 용어"];

	return (
		<>
			<div className="w-full bg-white p-4">
				<Tab>
					{tabList.map((tab, index) => {
						return (
							<TabItem
								key={index}
								isActive={activeTab === index}
								onClick={(e) => {
									e.preventDefault();
									setActiveTab(index);
								}}
								width="w-auto grow"
							>
								{tab}
							</TabItem>
						);
					})}
				</Tab>
			</div>

			<div className="custom-scrollbar grow overflow-y-auto font-semibold">
				{activeTab === 0 && (
					<ul className="m-4 flex flex-col gap-4">
						<GuideListWrapper title="생활이동 정의" Icon={IconGuideAlpOne}>
							<p className="text-subText">‘특정 기간’동안‘특정 지역’에서 이루어진 모든 ‘이동’</p>
							<ul className="ml-5 list-disc text-subText">
								<li className="mb-1">
									생활이동에서의 유입 : 선택한 기간동안 기준지역으로 오는 모든 이동을 의미
								</li>
								<li className="mb-1">
									생활이동에서의 유출 : 선택한 기간동안 기준지역에서 나가는 모든 이동을 의미
								</li>
							</ul>
							<p className="text-textGray">*출발지/도착지에 기반한 유입/유출을 의미</p>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpTwo} title="추가분석하기">
							<p>추가분석하기 기능을 통해 지역비교 분석과 출/도착지 분석을 할 수 있습니다.</p>
							<p>
								1) 지역비교 분석 : 다양한 행정단위의 비교지역을 추가하여 기준지역과 다른 여러 지역을
								비교 가능
							</p>
							<p>
								2) 출/도착지 분석 : 선택한 지역과 기준지역 간의 이동 흐름을 분석하여 출발지와 도착지
								간의 이동 현황을 파악 가능
							</p>
							<p>*지역비교, 출/도착지 선택을 하지 않은 경우, 전국 단위의 이동 현황 파악 가능</p>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpThree} title="기간 조건 선택">
							<p>
								1) 월별 분석만 가능한 지표의 경우, 일 단위 기간 선택 시 분석 결과가 제공되지
								않습니다.
							</p>
							<p>
								2) <span className="text-subText">요일별</span> 분석과{" "}
								<span className="text-subText">평일/휴일별</span> 분석의 경우 이동의 누적이 아닌{" "}
								<span className="text-subText">평균</span>으로 산출합니다.
							</p>
							<p>
								3) <span className="text-subText">휴일</span>의 경우 주말과 공휴일을 포함하며,{" "}
								<span className="text-subText">평일</span>의 경우 공휴일을 제외하고 산정합니다.
							</p>
						</GuideListWrapper>
						<GuideListWrapper Icon={IconGuideAlpFour} title="동일지역 간 이동 선택">
							<p>
								필터 기능을 통해 ‘특정 기간’동안 ‘특정 지역’에서 이루어진 모든 ‘이동’ 중, 기준지역
								내에서만 오고 가는 이동 포함 여부를 선택하여 다양한 분석이 가능합니다.
							</p>
						</GuideListWrapper>
					</ul>
				)}

				{activeTab === 1 && (
					<ul className="m-4 flex flex-col gap-4">
						<GuideListWrapper title="생활이동 데이터 정의" Icon={IconGuideAlpFive}>
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									생활이동 데이터(OD 데이터) : KT 통신 데이터를 활용해 사람들의 이동을 분석한
									데이터로, 이동 목적(예: 출근, 쇼핑)과 이동 수단(예: 차량, 대중교통)으로 구분하여
									출발지(Origin)와 도착지(Destination)별 이동 인원 수를 가공해 제공하는 데이터
								</li>
								<li className="mb-1">
									생활이동목적 데이터 : 출발/도착지와 시간대, 이동인원, 이동자의 성/연령, 이동목적
									등 정보를 담고 있음.
								</li>
								<li className="mb-1">
									생활이동수단 데이터 : 출발/도착지와 시간대, 이동인원, 이동자의 성/연령, 이동수단
									등 정보를 담고 있음.
								</li>
							</ul>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpSix} title="추진배경">
							<ul className="ml-5 list-disc">
								<li className="mb-1">생활이동 데이터를 활용해 삶의 질을 개선하고자 개발.</li>
								<li className="mb-1">
									교통과 주거 환경 개선을 위한 통신 기반 생활이동 데이터를 바탕으로, 도시계획,
									신도시 수요 예측, 버스 노선 개선, 교통 수요 예측 등 다양한 정책 실현에 필요한 인구
									이동 정보를 제공.
								</li>
								<li className="mb-1">
									이를 통해 보다 효율적인 정책 수립과 시민의 편의 증대를 목표로 함.
								</li>
							</ul>
						</GuideListWrapper>
					</ul>
				)}

				{activeTab === 2 && (
					<ul className="m-4 flex flex-col gap-4">
						<GuideListWrapper Icon={IconGuideAlpSeven} title="주요 용어">
							<p>이동목적 : 귀가/출근/등교/쇼핑/관광/병원/기타 총 7개의 이동목적</p>
							<p>이동수단 : 차량/노선버스/고속버스/기차/항공/지하철/도보/기타 총 8개의 이동수단</p>
							<p>출발지 : 이동의 출발지역</p>
							<p>도착지 : 이동의 도착지역</p>
							<p>출발시간대 : 이동의 출발한 시간대</p>
							<p>도착시간대 : 이동의 도착한 시간대 </p>
						</GuideListWrapper>
					</ul>
				)}
			</div>
		</>
	);
}
