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

import IconTrangleUp from "@images/triangle_up.svg";
import IconTrangleDown from "@images/triangle_down.svg";
import Spinner from "@/components/loading/Spinner";

interface DashboardCardProps {
	data: DashboardResult | undefined;
	index: number;
	isLoading: boolean;
	selectedSidoCode: string;
	activeTabKey: DashboardMapTabKey;
	selectedDate: string;
}

const cardColors = [
	{ bgColor: "bg-[#418AEC]", borderColor: "border-[#418AEC]" },
	{ bgColor: "bg-[#79C8C4]", borderColor: "border-[#79C8C4]" },
	{ bgColor: "bg-[#5789AF]", borderColor: "border-[#5789AF]" },
	{ bgColor: "bg-[#5789AF]", borderColor: "border-[#5789AF]" },
];

export default function DashboardCard({
	data,
	index,
	isLoading,
	selectedSidoCode,
	activeTabKey,
	selectedDate,
}: DashboardCardProps) {
	if (selectedSidoCode === '51' && Number(selectedDate) < 202307) {
		selectedSidoCode = '42';
	}
	if (selectedSidoCode === '52' && Number(selectedDate) < 202403) {
		selectedSidoCode = '45';
	}
	if (selectedSidoCode === '42' && Number(selectedDate) > 202306) {
		selectedSidoCode = '51';
	}
	if (selectedSidoCode === '45' && Number(selectedDate) > 202402) {
		selectedSidoCode = '52';
	}
	
	const cardData = data?.info;

	const cardList = [
		{ key: "mopInflow", name: "일 평균 유입인구" },
		{ key: "mopOutflow", name: "일 평균 유출인구" },
		{ key: "alp", name: "1시간 평균 생활인구" },
		{ key: "llp", name: "시군구 평균 체류인구" },
	];

	const currentCard = cardList[index];
	const currentCardData = cardData
		?.find((item) => String(item.sidoCode) === selectedSidoCode)
		?.data.find((item) => item.key === currentCard.key);

	return (
		<div
			className={`flex flex-col gap-4 rounded-md border p-4 ${activeTabKey === currentCard.key ? "border-2 border-[#E47B92] bg-primary bg-opacity-5 shadow-active-box-shadow" : "border-borderGray bg-whiteGray"} ${cardColors[index].bgColor} ${cardColors[index].borderColor}`}
		>
			<div className="flex justify-between">
				<h4 className="text-lg font-semibold">{currentCard.name}</h4>
				<span className="text-sm">단위(명)</span>
			</div>

			{isLoading ? (
				<div className="self-center">
					<Spinner />
				</div>
			) : (
				<strong className="self-end text-2xl font-extrabold">
					{currentCardData?.value && typeof currentCardData?.value === "number"
						? Number(currentCardData?.value.toFixed(0)).toLocaleString()
						: "-"}
				</strong>
			)}

			<div className="grid h-full grid-cols-2 rounded-md bg-white">
				{["전월 대비", "전년 대비"].map((label) => (
					<div className="flex flex-col justify-center gap-1 px-4" key={label}>
						<p className="text-sm">{label}</p>
						{currentCardData && (
							<strong
								className={
									Math.sign(
										label === "전월 대비"
											? currentCardData.prevMonthComparison
											: currentCardData.prevYearComparison,
									) === 1
										? "text-primary"
										: "text-blue"
								}
							>
								<span className="inline-flex items-center">
									{label === "전월 대비"
										? currentCardData?.prevMonthComparison.toFixed(1)
										: currentCardData?.prevYearComparison.toFixed(1)}
									%
									{Math.sign(
										label === "전월 대비"
											? currentCardData?.prevMonthComparison
											: currentCardData?.prevYearComparison,
									) === 1 ? (
										<IconTrangleUp />
									) : (
										<IconTrangleDown />
									)}
								</span>
							</strong>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
