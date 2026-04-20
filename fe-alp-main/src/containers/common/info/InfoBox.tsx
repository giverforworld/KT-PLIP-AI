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
import AccordionBox from "@/components/boxes/AccordionBox";

interface InfoBoxProps {
	name:
		| "llpCommonInfo"
		| "llpStatusInfo"
		| "llpTraitsInfo"
		| "llpRankIngo"
		| "alpStatusInfo"
		| "alpPatternInfo"
		| "alpComparativeInfo"
		| "mopStatusInfo"
		| "mopPurposeInfo"
		| "mopTransInfo";
}

export default function InfoBox({ name }: InfoBoxProps) {
	return (
		<AccordionBox title="도움말" bgColor="bg-lightGray" border={false} defaultOpen={false}>
			<RoundedBox bgColor="bg-lightGray" padding="p-4">
				<div className="text-subText">{name === "llpCommonInfo" && <LlpCommonInfo />}</div>
				<div className="text-subText">{name === "llpStatusInfo" && <LlpStatusInfo />}</div>
				<div className="text-subText">{name === "llpTraitsInfo" && <LlpTraitsInfo />}</div>
				<div className="text-subText">{name === "llpRankIngo" && <LlpRankInfo />}</div>
				<div className="text-subText">{name === "alpStatusInfo" && <AlpStatusInfo />}</div>
				<div className="text-subText">{name === "alpPatternInfo" && <AlpPatternInfo />}</div>
				<div className="text-subText">
					{name === "alpComparativeInfo" && <AlpComparativeInfo />}
				</div>
				<div className="text-subText">{name === "mopStatusInfo" && <MopStatusInfo />}</div>
				<div className="text-subText">{name === "mopPurposeInfo" && <MopPurposeInfo />}</div>
				<div className="text-subText">{name === "mopTransInfo" && <MopTransInfo />}</div>
			</RoundedBox>
		</AccordionBox>
	);
}

function MopStatusInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold text-black">
				&apos;특정 기간&apos;동안 &apos;특정 지역&apos;에서 이루어진 모든 &apos;이동&apos;
			</div>
			<ul className="mb-2 flex flex-col gap-1 text-black">
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유입:선택한 기간동안 기준지역으로 오는 모든 이동을 의미
				</li>
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유출:선택한 기간동안 기준지역에서 나가는 모든 이동을 의미
				</li>
			</ul>
			<div className="text-sm font-semibold">*출발지/도착지에 기반한 유입/유출을 의미</div>
		</>
	);
}

function MopPurposeInfo() {
	return (
		<>
			{/* <ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">기준지역에 대한 이동목적 분석 가능</li>
				<li className="ml-8 list-disc text-sm"> */}{" "}
			{/* 들여쓰기 추가 */}
			{/* <span className="font-semibold text-textBlue">귀가/출근/등교/쇼핑/관광/병원/기타</span>
					&nbsp;총 7개의 이동목적 항목선택으로 다양한 이동목적 분석 제공
				</li>
				<li className="ml-4 list-disc text-sm">
					&apos;기타&apos;항목의 분포가 가장 클 경우, 문구는 차순위의 항목 표출
				</li>
			</ul> */}
			<div className="mb-2 text-sm font-semibold text-black">
				&apos;특정 기간&apos;동안 &apos;특정 지역&apos;에서 이루어진 모든 &apos;이동&apos;
			</div>
			<ul className="mb-2 flex flex-col gap-1 text-black">
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유입:선택한 기간동안 기준지역으로 오는 모든 이동을 의미
				</li>
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유출:선택한 기간동안 기준지역에서 나가는 모든 이동을 의미
				</li>
			</ul>
			<div className="text-sm font-semibold">*출발지/도착지에 기반한 유입/유출을 의미</div>
		</>
	);
}

function MopTransInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold text-black">
				&apos;특정 기간&apos;동안 &apos;특정 지역&apos;에서 이루어진 모든 &apos;이동&apos;
			</div>
			<ul className="mb-2 flex flex-col gap-1 text-black">
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유입:선택한 기간동안 기준지역으로 오는 모든 이동을 의미
				</li>
				<li className="ml-4 list-disc text-sm font-semibold">
					생활이동에서의 유출:선택한 기간동안 기준지역에서 나가는 모든 이동을 의미
				</li>
			</ul>
			<div className="text-sm font-semibold">*출발지/도착지에 기반한 유입/유출을 의미</div>
		</>
	);
}

function AlpStatusInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">집계방법</div>
			<ul className="flex flex-col gap-1">
				<p className="border-t pt-3 text-sm">
					<span className="font-semibold text-textBlue">평균 </span>: 선택한 기간, 선택한 지역에
					따른 시간대별 생활인구의 평균
				</p>
				<p className="text-sm">
					<span className="font-semibold text-textBlue"> 유니크 </span> : 언제(일자·시각),
					어디(소영역)에 어떤(거주, 근무, 방문) 유형의 사람이 있었는지를 중복없이 신뢰성있게 측정한
					Unique 인구, 각 지표마다 선택한 기간에 따라 유니크 선택 가능 여부가 달라짐
				</p>
				<li className="ml-6 list-disc pt-3 text-sm">
					지표는 평균 값을 기본으로 <span className="font-semibold">평균 생활인구 수</span>를
					표출하며, 유니크를 선택하면 <span className="font-semibold">유니크 생활인구 수</span>를
					확인할 수 있음
				</li>
				<li className="ml-6 list-disc text-sm">유니크 선택은 일부 지표에서만 가능함</li>
			</ul>
		</>
	);
}

function AlpPatternInfo() {
	return (
		<>
			<div className="mb-2 mt-3 text-sm font-semibold">생활패턴별 인구</div>
			<ul className="flex flex-col gap-1">
				<p className="text-sm">
					<span className="font-semibold text-textBlue">거주인구 </span> : 오후 7시 ~ 오전 8시 59분
					사이에 가장 많이 체류한 지역을 거주지로 하여, 해당 시간 및 해당 지역에 존재하는 인구
				</p>
				<p className="text-sm">
					<span className="font-semibold text-textBlue">직장인구 </span> : 20세 ~ 64세 인구 중 오전
					9시 ~ 오후 6시 59분 사이에 가장 많이 체류하는 지역을 근무지로 하여, 해당 시간 및 해당
					지역에 존재하는 인구
				</p>
				<p className="text-sm">
					<span className="font-semibold text-textBlue">방문인구 </span> : 거주지나 근무지가 아닌
					지역에 머무르는 인구
				</p>
				<p className="border-b pb-3 text-sm">생활패턴별 인구는 내국인 생활인구에 한하여 제공</p>
			</ul>
			<div className="mb-2 pt-3 text-sm font-semibold"> 집계 방법</div>
			<ul className="flex flex-col gap-1">
				<p className="text-sm">
					<span className="font-semibold text-textBlue">평균 </span>: 선택한 기간, 선택한 지역에
					따른 시간대별 생활인구의 평균
				</p>
				<p className="text-sm">
					<span className="font-semibold text-textBlue"> 유니크 </span> : 언제(일자·시각),
					어디(소영역)에 어떤(거주, 근무, 방문) 유형의 사람이 있었는지를 중복없이 신뢰성있게 측정한
					Unique 인구, 각 지표마다 선택한 기간에 따라 유니크 선택 가능 여부가 달라짐
				</p>
				<li className="ml-6 list-disc pt-3 text-sm">
					지표는 평균 값을 기본으로 <span className="font-semibold">평균 생활인구 수</span>를
					표출하며, 유니크를 선택하면 <span className="font-semibold">유니크 생활인구 수</span>를
					확인할 수 있음
				</li>
				<li className="ml-6 list-disc text-sm">유니크 선택은 일부 지표에서만 가능함</li>
			</ul>
		</>
	);
}

function AlpComparativeInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">주민등록인구와 거주인구</div>
			<ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">
					거주인구와 주민등록인구는 한 지역에 실질적으로 거주하는 인구와 법적으로 등록된 인구를
					비교하기에 적합한 지표
				</li>
				<li className="ml-4 list-disc text-sm">
					거주인구 : 오후 7시 ~ 오전 8시 59분 사이에 가장 많이 체류한 지역을 거주지로 하여, 해당
					기간(월) 및 해당 지역에 실질적으로 거주하는 인구이며, 월별로 중복없이 신뢰성있게 측정한
					Unique 인구 (내국인 생활인구에 한하여 제공)
				</li>
				<li className="ml-4 list-disc text-sm">
					주민등록인구 데이터가 월별 제공됨에 따라 기간은 월별만 선택 가능
				</li>
				<li className="ml-4 list-disc text-sm">주민등록인구 상세보기는 시군구 단위까지만 표출</li>
			</ul>
		</>
	);
}

function LlpTraitsInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">체류인구 산정 기준</div>
			<ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">
					시군구 단위 지역 선택 시 : 하루동안 머무른 시간의 총합이{" "}
					<span className="font-semibold text-textBlue">3시간</span>이상인 경우가 월 1회 이상인
					방문자 (이하 체류인구)
				</li>
				{/* <li className="ml-4 list-disc text-sm">
					시도 지역 단위 선택 시 : 하위 시군구별 체류인구의{" "}
					<span className="font-semibold text-textBlue">총합</span>
				</li> */}
			</ul>
			<p className="mt-3 border-t pt-3 text-sm">
				* 체류인구 특성 탭에서는 체류인구 중{" "}
				<span className="font-semibold text-textBlue">외지인</span>에 대해서만 분석 진행
			</p>
			<p className="text-sm">* 숙박인구의 경우 kt의 관광객 데이터 활용</p>
			<p className="text-sm">
				* 일 단위 기간 선택 시, 체류일수별 분석 및 숙박일수별 분석 결과 제공 불가
			</p>
		</>
	);
}

function LlpCommonInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">체류시간 정의</div>
			<ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">
					체류인구: 월<span className="font-semibold text-textBlue"> 3시간 이상 </span> 체류인구
				</li>
				<p className="mt-2 list-disc border-t pt-3 text-sm">
					* 일 단위 기간 선택 시, <span className="font-semibold">체류일수별 분석</span>및{" "}
					<span className="font-semibold">숙박일수별 분석</span>
					결과 제공 불가
				</p>
			</ul>
		</>
	);
}

function LlpStatusInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">체류인구 산정 기준</div>
			<ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">
					시군구 단위 지역 선택 시 : 하루동안 머무른 시간의 총합이{" "}
					<span className="font-semibold text-textBlue">3시간</span>이상인 경우가 월 1회 이상인
					방문자 (이하 체류인구)
				</li>
				{/* <li className="ml-4 list-disc text-sm">
					시도 지역 단위 선택 시 : 하위 시군구별 체류인구의{" "}
					<span className="font-semibold text-textBlue">총합</span>
				</li> */}
			</ul>
		</>
	);
}

function LlpRankInfo() {
	return (
		<>
			<div className="mb-2 text-sm font-semibold">체류인구 산정 기준</div>
			<ul className="flex flex-col gap-1">
				<li className="ml-4 list-disc text-sm">
					시군구 단위 지역 선택 시 : 하루동안 머무른 시간의 총합이{" "}
					<span className="font-semibold text-textBlue">3시간</span>이상인 경우가 월 1회 이상인
					방문자 (이하 체류인구)
				</li>
				{/* <li className="ml-4 list-disc text-sm">
					시도 지역 단위 선택 시 : 하위 시군구별 체류인구의{" "}
					<span className="font-semibold text-textBlue">총합</span>
				</li> */}
			</ul>
			<p className="mt-2 list-disc border-t pt-3 text-sm">
				* 일 단위 기간 선택 시, <span className="font-semibold">체류일수별 분석</span>및{" "}
				<span className="font-semibold">숙박일수별 분석</span>
				결과 제공 불가
			</p>
		</>
	);
}
