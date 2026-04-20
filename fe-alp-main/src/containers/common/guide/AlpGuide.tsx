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
import Tab from "@/components/tabs/Tab";
import TabItem from "@/components/tabs/TabItem";

export default function AlpGuide() {
	const [activeTab, setActiveTab] = useState(0);
	const tabList = ["생활인구", "「인구감소지역 지원 특별법」및 동법 시행령에 따른 『생활인구』"];

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
						<GuideListWrapper title="생활인구 정의" Icon={IconGuideAlpOne}>
							<p>
								<span className="text-subText">‘특정 시점‘</span>,{" "}
								<span className="text-subText">‘특정 지역’</span>에 ‘존재’하는 모든 인구
							</p>
							<ol>
								<li className="flex gap-2">
									<span>1.</span>
									<p>
										해당 지역에 거주하거나 업무, 관광, 쇼핑 등 일시적으로 지역을 찾아 행정수요를
										유발하는 인구
									</p>
								</li>
								<li className="flex gap-2">
									<span>2.</span>
									<p>
										주민등록인구와 달리 시각마다{" "}
										<span className="text-subText">실제 생활하는 사람들의 위치/밀집도를 확인</span>{" "}
										할 수 있는 데이터
									</p>
								</li>
								<li className="flex gap-2">
									<span>3.</span>
									<p>
										<span className="text-subText">
											언제(일자·시각), 어디(소영역)에 어떤(거주, 근무 등) 사람이 있었는지를 1시간
											단위로 신뢰성있게 측정한 Unique 인구
										</span>
									</p>
								</li>
								<li className="flex gap-2">
									<span>4.</span>
									<p>
										생활인구에서의 이동은{" "}
										<span className="text-subText">거주지/존재지에 기반한 유입/유출을 의미</span>
									</p>
								</li>
							</ol>
						</GuideListWrapper>

						<GuideListWrapper title="생활패턴별 인구 정의" Icon={IconGuideAlpTwo}>
							<ol>
								<li className="flex gap-2">
									<span>1.</span>
									<p>
										거주인구 : 오후 7시 ~ 오전 8시 59분 사이에 가장 많이 체류한 지역을 거주지로
										하여, 해당 시간 및 해당 지역에 존재하는 인구
									</p>
								</li>
								<li className="flex gap-2">
									<span>2.</span>
									<p>
										직장인구 : 20세 ~ 64세 인구 중 오전 9시 ~ 오후 6시 59분 사이에 가장 많이
										체류하는 지역을 근무지로 하여, 해당 시간 및 해당 지역에 존재하는 인구
									</p>
								</li>
								<li className="flex gap-2">
									<span>3.</span>
									<p>방문인구 : 거주지나 근무지가 아닌 지역에 머무르는 인구</p>
								</li>
							</ol>
						</GuideListWrapper>

						<GuideListWrapper title="기간 조건 선택" Icon={IconGuideAlpThree}>
							<ol>
								<li className="flex gap-2">
									<span>1.</span>
									<p>
										월별 분석만 가능한 지표의 경우, 일 단위 기간 선택 시 분석 결과가 제공되지
										않습니다.
									</p>
								</li>
								<li className="flex gap-2">
									<span>2.</span>
									<p>
										<span className="text-subText">휴일</span>의 경우 주말과 공휴일을 포함하며,
										평일의 경우 공휴일을 제외하고 산정합니다.
									</p>
								</li>
							</ol>
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
							<p className="rounded-md bg-backGray p-2">
								「지방자치분권 및 지역균형발전에 관한 특별법」제2조제12호에 따라 지정된 지역을
								말하며, 2021년 10월에(행안부 고시) 89개 시군구를 인구감소지역으로 지정 (지정 주기:
								5년)
							</p>
						</GuideListWrapper>
						<GuideListWrapper title="인구감소지역이란?" Icon={IconGuideAlpFive}>
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									「지방자치분권 및 지역균형발전에 관한 특별법」제2조제12호에 따라 지정된 지역을
									말하며, 2021년 10월에(행안부 고시) 89개 시군구를 인구감소지역으로 지정 (지정 주기:
									5년)
								</li>
							</ul>
						</GuideListWrapper>
						<GuideListWrapper title="추진배경" Icon={IconGuideAlpSix}>
							<ul className="ml-5 list-disc">
								<li className="mb-1">
									국가 총인구 감소, 지역 간 인구유치 경쟁 상황 극복을 위해 새로운 인구개념의 도입 및
									정책 활용 필요
								</li>
								<li className="mb-1">
									정주 인구뿐만 아니라 지역에서 체류(통근, 통학, 관광 등)하며 지역의 실질적인 활력을
									높이는 사람까지 인구로 정의하는 ‘생활인구’ 도입 <br />※ ｢인구감소지역 지원
									특별법｣을 통해 법적 근거 마련(’23.1.1. 시행), ｢생활인구 세부요건 등에 관한 규정｣
									제정·시행(’23.5.18.)
								</li>
							</ul>
						</GuideListWrapper>
						<GuideListWrapper
							title="생활인구 개념(｢인구감소지역법｣ 제2조제2호)"
							Icon={IconGuideAlpSeven}
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
