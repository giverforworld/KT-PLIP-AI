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
import IconGuideAlpTwo from "@images/guide_title_alp_2.svg";
import IconGuideAlpThree from "@images/guide_title_alp_3.svg";
import IconGuideAlpFour from "@images/guide_title_alp_4.svg";
import IconGuideAlpFive from "@images/guide_title_alp_5.svg";
import IconGuideAlpSix from "@images/guide_title_alp_6.svg";
import IconGuideAlpSeven from "@images/guide_title_alp_7.svg";
import IconGuideAlpEight from "@images/guide_title_alp_8.svg";
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";

export default function LlpGuide() {
	const [activeTab, setActiveTab] = useState(0);
	const tabList = ["체류인구", "「인구감소지역 지원 특별법」및 동법 시행령에 따른 『생활인구』"];

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
						<GuideListWrapper title="체류인구 정의" Icon={IconGuideAlpOne}>
							<p className="mb-1">
								『인구감소 지역 특별법』 및 동법 시행령에 따른 ‘생활인구’로서, 특정 지역에
								거주하거나 체류하면서 생활을 영위하는 사람으로,
								<br /> 주민등록인구, 외국인등록인구 및 1일 동안 머무른 시간의 총합이 3시간 이상인
								경우가 월 1회 이상인 방문자 (이하 체류인구) 모두를 말함
							</p>
							<p>
								ALP 서비스 내 체류인구의 정의는{" "}
								<span className="text-subText underline">
									『인구감소 지역 특별법』 및 동법 시행령에 따른{" "}
								</span>
								<span className="text-primary underline">생활인구</span>와 동일한 정의로서, 다른 통계의 인구
								정의와 다를 수 있음
							</p>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpTwo} title="체류인구 산정 기준">
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									시군구 단위 지역 선택 시 : 하루 동안 머무른 시간의 총합이{" "}
									<span className="text-textBlue">3시간</span> 이상인 경우가 월 1회 이상인 방문자
									(이하 체류인구)
								</li>
								{/* <li className="mb-1">
									시도 단위 지역 선택 시 : 하위 시군구별 체류인구의
									<span className="text-textBlue"> 총합</span>
								</li> */}
							</ul>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpEight} title="지역 조건 선택">
							<p>동일 지역 계위 간 비교만 가능합니다.</p>
							<p>(시도 ↔ 시도, 시군구 ↔ 시군구)</p>
						</GuideListWrapper>
						<GuideListWrapper Icon={IconGuideAlpThree} title="기간 조건 선택">
							<p>
								월 단위 분석만 가능한 지표의 경우, 일 단위 기간 선택 시 분석 결과가 제공되지
								않습니다.
							</p>
						</GuideListWrapper>
					</ul>
				)}

				{activeTab === 1 && (
					<ul className="m-4 flex flex-col gap-4">
						<GuideListWrapper title="개요" Icon={IconGuideAlpFour}>
							<p className="mb-1">
								행정안전부와 통계청은 2024년부터 89개 인구감소지역을 대상으로 분기별 생활인구 산정
								결과 공표 중
							</p>
							{/* <p className="rounded-md bg-backGray p-2">
								「지방자치분권 및 지역균형발전에 관한 특별법」제2조제12호에 따라 지정된 지역을
								말하며, 2021년 10월에(행안부 고시) 89개 시군구를 인구감소지역으로 지정 (지정 주기:
								5년)
							</p> */}
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpFive} title="인구감소지역이란?">
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									「지방자치분권 및 지역균형발전에 관한 특별법」제2조제12호에 따라 지정된 지역을
									말하며, 2021년 10월에(행안부 고시) 89개 시군구를 인구감소지역으로 지정 (지정 주기:
									5년)
								</li>
							</ul>
						</GuideListWrapper>

						<GuideListWrapper Icon={IconGuideAlpSix} title="추진배경">
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									국가 총인구 감소, 지역 간 인구유치 경쟁 상황 극복을 위해 새로운 인구개념의 도입 및
									정책 활용 필요
								</li>
								<li className="mb-1">
									정주 인구뿐만 아니라 지역에서 체류(통근, 통학, 관광 등)하며 지역의 실질적인 활력을
									높이는 사람까지 인구로 정의하는 ‘생활인구’ 도입
									<br />※ ｢인구감소지역 지원 특별법｣을 통해 법적 근거 마련(’23.1.1. 시행), ｢생활인구
									세부요건 등에 관한 규정｣ 제정·시행(’23.5.18.)
								</li>
							</ul>
						</GuideListWrapper>
						<GuideListWrapper
							Icon={IconGuideAlpSeven}
							title="생활인구 개념(｢인구감소지역법｣ 제2조제2호)"
						>
							<ul className="ml-5 list-disc">
								<li className="mb-1">(주민) ｢주민등록법｣ 제6조제1항에 따라 주민으로 등록한 사람</li>
								<li className="mb-1">
									(체류하는 사람) 통근, 통학, 관광 등의 목적으로 방문하여 체류하는 사람으로서 월
									1회(시행령), 하루 3시간(고시) 이상 머무는 사람
								</li>
								<li className="mb-1">
									(외국인) ｢출입국관리법｣에 따라 등록한 외국인 또는 ｢재외동포법｣에 따라
									국내거소신고를 한 재외동포(시행령 제2조제2항)
								</li>
							</ul>
						</GuideListWrapper>
					</ul>
				)}
			</div>
		</>
	);
}
