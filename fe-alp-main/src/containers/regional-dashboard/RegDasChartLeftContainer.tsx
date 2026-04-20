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

import { useState, useRef, useEffect } from "react";
import { regionalDashboardConfig } from "@/constants/chart/regionalDashboardConfig";
import ContentHeader from "@/components/text/ContentHeader";
import RoundedBox from "@/components/boxes/RoundedBox";
import Summary from "./RegDasSummary";
import ChartContext from "@/containers/common/chart/ChartContext";
import Swipe from "@images/chartIcon/swipe.svg";
import Spinner from "@/components/loading/Spinner";
import LlpIcon from "@images/chartIcon/llpNoneIcon.svg";
import Tooltip from "@/components/tooltipv2/Tooltipv2";
import IconInfo from "@images/info.svg";
import { useThemeStore } from "@/store/theme";
interface RegDasChartContainerProps {
	data: any; // TO_BE_CHECKED
	selectedRegion: { regionname: string; regioncode: string; sggName: string };
}

export default function RegDasChartLeftContainer({
	data,
	selectedRegion: region,
}: RegDasChartContainerProps) {
	const theme = useThemeStore((s)=> s.theme);
	const [dataSwipes, setDataSwipes] = useState<Record<number, boolean>>({}); // 각 차트별 스와이프 상태 관리
	const previousData = useRef<any | null>(null);
	const [tooltipStates, setTooltipStates] = useState<
		Record<number, { open: boolean; position: { left: number; top: number } }>
	>({});
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const containerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (data) {
			previousData.current = data;
		}
	}, [data]);
	const handleDataSwipe = (chartIndex: number) => {
		setDataSwipes((prevSwipes) => ({
			...prevSwipes,
			[chartIndex]: !prevSwipes[chartIndex],
		}));
	};
	const regData = data || previousData.current;
	const handleTooltipToggle = (index: number) => {
		const buttonRef = buttonRefs.current[index];
		const containerRef = buttonRef?.parentElement; // 버튼의 부모 컨테이너
		if (buttonRef && containerRef) {
			const buttonRect = buttonRef.getBoundingClientRect();
			const containerRect = containerRef.getBoundingClientRect();

			setTooltipStates((prev) => ({
				...prev,
				[index]: {
					open: !(prev[index]?.open || false),
					position: {
						left: buttonRect.left - containerRect.left + buttonRect.width / 2, // 버튼의 중앙
						top: buttonRect.top - containerRect.top, // 버튼의 위쪽
					},
				},
			}));
		}
	};

	if (!regData) {
		return;
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-3">
				<ContentHeader title={`${region.regionname} 생활인구`} textAlign="text-center" />
				{regData?.summary
					?.filter((item: any) => item.key === "alp") // 조건에 맞는 항목만 필터링
					.map((item: any, index: number) => {
						return (
							<RoundedBox bgColor="bg-white" border darkMode={theme === "dark"} key={index}>
								<Summary
									title={item.title}
									totalPopul={item.value}
									prevMonthChange={item.prevMonthComparison}
									prevYearChange={item.prevYearComparison}
								/>
							</RoundedBox>
						);
					})}

				{regData?.alp?.map((chart: any, index: any) => {
					const config = regionalDashboardConfig.find((item) => chart.name === item.name);
					if (!config) return null;

					const chartType = Array.isArray(config.type) ? config.type[0] : config.type;
					const dataSwipe = dataSwipes[index] || false;

					return (
						<RoundedBox
							bgColor="bg-white"
							border
							darkMode={theme === "dark"}
							darkBgColor="bg-darkModeBoxGray"
							key={index}
						>
							<div className="flex justify-between dark:text-white">
								<div className="text-base font-semibold text-subText dark:text-white">
									{config.title}
								</div>
								<div className="flex justify-end">
									<div className="mt-1 text-right text-xs font-normal dark:text-[#9B9B9C]">
										단위({config.chartUnit})
									</div>
									{chart.indicate?.length > 24 && (
										<Swipe
											className={`ml-1 cursor-pointer ${dataSwipes[index] ? "text-primary" : ""}`}
											onClick={() => handleDataSwipe(index)}
										/>
									)}
								</div>
							</div>

							<ChartContext
								data={chart}
								title={config.title}
								type={chartType}
								xlabel={config.xlabel}
								color={config.color}
								dataSwipe={dataSwipe}
								chartHeight={200}
								chartUnit={config.chartUnit}
							/>
						</RoundedBox>
					);
				})}
			</div>

			<div className="flex flex-col gap-3">
				<ContentHeader
					title={`${region.regioncode.length > 5 ? region.sggName : region.regionname} 체류인구`}
					textAlign="text-center"
				/>
				{region.regioncode.length > 5 ? (
					<div className="relative">
						<div className="h-[200px] rounded-lg bg-gray-200 opacity-50" />

						<div
							className={`absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center text-base font-semibold ${theme === "dark" ? "text-white" : "text-filterDarkGray"}`}
						>
							<LlpIcon className={`${theme === "dark" ? "white" : "filterDarkGray"}`} />
							<p className="mt-2">체류인구는 읍면동 데이터를</p>
							<p>제공하지 않습니다.</p>
						</div>
					</div>
				) : (
					<>
						{regData?.summary
							?.filter((item: any) => item.key === "llp")
							.map((item: any, index: number) => {
								return (
									<RoundedBox bgColor="bg-white" border darkMode={theme === "dark"} key={index}>
										<Summary
											title={item.title}
											totalPopul={item.value}
											prevMonthChange={item.prevMonthComparison}
											prevYearChange={item.prevYearComparison}
										/>
									</RoundedBox>
								);
							})}

						{regData?.llp?.map((chart: any, index: any) => {
							const config = regionalDashboardConfig.find((item) => chart.name === item.name);
							if (!config) return null;
							const chartType = Array.isArray(config.type) ? config.type[0] : config.type;
							return (
								<RoundedBox
									bgColor="bg-white"
									border
									darkMode={theme === "dark"}
									darkBgColor="bg-darkModeBoxGray"
									key={index}
								>
									<div
										ref={containerRef}
										key={index}
										className="relative flex justify-between dark:text-white"
									>
										<div className="flex items-center text-base font-semibold text-subText dark:text-white">
											{config.title}
											<button
												ref={(el) => {
													buttonRefs.current[index] = el;
												}}
												onClick={() => handleTooltipToggle(index)}
											>
												<IconInfo className="text-textLightGray" />
											</button>
											{tooltipStates[index]?.open && (
												<Tooltip
													setOpenTooltip={() =>
														setTooltipStates((prev) => ({
															...prev,
															[index]: { ...prev[index], open: false },
														}))
													}
													buttonPosition={tooltipStates[index].position}
												>
													<p className="w-full">체류인구중 외지인에 한해서 분석</p>
												</Tooltip>
											)}
										</div>

										<div className="mt-1 text-right text-xs font-normal dark:text-[#9B9B9C]">
											단위({config.chartUnit})
										</div>
									</div>
									<ChartContext
										data={chart}
										title={config.title}
										type={chartType}
										xlabel={config.xlabel}
										color={config.color}
										chartHeight={200}
									/>
								</RoundedBox>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
