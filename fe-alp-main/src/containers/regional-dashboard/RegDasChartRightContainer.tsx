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

import { useRef, useEffect } from "react";
import { regionalDashboardConfig } from "@/constants/chart/regionalDashboardConfig";
import ContentHeader from "@/components/text/ContentHeader";
import RoundedBox from "@/components/boxes/RoundedBox";
import Summary from "./RegDasSummary";
import ChartContext from "@/containers/common/chart/ChartContext";
import Spinner from "@/components/loading/Spinner";
import { useThemeStore } from "@/store/theme";
interface RegDasChartContainerProps {
	data: any; // TO_BE_CHECKED
	selectedRegion: { regionname: string; regioncode: string; sggName: string };
}

export default function RegDasChartRightContainer({
	data,
	selectedRegion: region,
}: RegDasChartContainerProps) {
	const theme = useThemeStore((s)=> s.theme);
	const previousData = useRef<any | null>(null);
	useEffect(() => {
		if (data) {
			previousData.current = data;
		}
	}, [data]);
	const regData = data || previousData.current;

	if (!regData) {
		return;
	}
	return (
		<div className="flex flex-col gap-4">
			<ContentHeader title={`${region.regionname} 생활이동`} textAlign="text-center" />
			<div className="flex gap-4">
				{regData?.summary
					?.filter((item: any) => item.key === "mop")
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
			</div>

			<div className="flex flex-col gap-3 dark:text-white">
				{regData?.mop?.map((chart: any, index: any) => {
					const config = regionalDashboardConfig.find((item) => chart.name === item.name);
					if (!config) {
						return null;
					}

					const chartType = Array.isArray(config.type) ? config.type[0] : config.type;

					// 마지막 두 개의 차트를 별도로 처리
					if (index === regData?.mop?.length - 2) {
						return (
							<div className="flex gap-3" key="last-two-charts">
								{regData.mop.slice(-2).map((lastChart: any, lastIndex: number) => {
									const lastConfig = regionalDashboardConfig.find(
										(item) => lastChart.name === item.name,
									);
									if (!lastConfig) return null;

									const lastChartType = Array.isArray(lastConfig.type)
										? lastConfig.type[0]
										: lastConfig.type;

									return (
										<div className="flex-1" key={`last-${lastIndex}`}>
											<RoundedBox
												bgColor="bg-white"
												border
												darkMode={theme === "dark"}
												darkBgColor="bg-darkModeBoxGray"
											>
												<div className="flex justify-between">
													<div className="text-base font-semibold text-subText dark:text-white">
														{lastConfig.title}
													</div>
													<div className="mt-1 text-right text-xs font-normal dark:text-[#9B9B9C]">
														단위({config.chartUnit})
													</div>
												</div>
												<ChartContext
													data={lastChart}
													title={lastConfig.title}
													type={lastChartType}
													xlabel={lastConfig.xlabel}
													color={lastConfig.color}
													chartHeight={200}
												/>
											</RoundedBox>
										</div>
									);
								})}
							</div>
						);
					}

					// 마지막 두 개 차트를 이미 처리했으므로 index === data.mop.length - 1은 건너뛰기
					if (index === regData.mop.length - 1) {
						return null;
					}

					// 일반 렌더링
					return (
						<RoundedBox
							bgColor="bg-white"
							border
							darkMode={theme === "dark"}
							darkBgColor="bg-darkModeBoxGray"
							key={index}
						>
							<div className="flex justify-between">
								<div className="text-base font-semibold text-subText dark:text-white">
									{config.title}
								</div>
								<div className="mt-1 text-right text-xs font-normal dark:text-[#9B9B9C]"> 단위({config.chartUnit})</div>
							</div>
							<ChartContext
								data={chart}
								title={config.title}
								type={chartType}
								xlabel={config.xlabel}
								color={config.color}
								chartHeight={200}
								chartUnit={config.chartUnit}
							/>
						</RoundedBox>
					);
				})}
			</div>
		</div>
	);
}
