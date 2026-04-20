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

import { alpChartConfig } from "../../../constants/chart/alpChartConfig";
import { mopChartConfig } from "../../../constants/chart/mopChartConfig";
import { llpChartConfig } from "../../../constants/chart/llpChartConfig";
import { dashboardChartConfig } from "../../../constants/chart/dashboardChartConfig";
import { gisAlpConfig, gisChartConfig } from "@/constants/chart/gisChartConfig";
import { useState, useEffect } from "react";
import ChartContext from "./ChartContext";
import ChartButton from "./ChartButton";
import Swipe from "@images/chartIcon/swipe.svg";
import ToggleButton from "@/components/buttons/ToggleButton";
import { ageConditionChartData, ageConditionKeyData } from "@/constants/chart/chartFilter";
import { isDataSummary, isDataSummaryArray, isStringArray } from "../data/DataSummary";
import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import { useActiveTabStore } from "@/store/activeTab";
import { useSearchFilterStore } from "@/store/searchFilter";
import { useChartLabelStore } from "@/store/chartLabel";

type ChartConfigType = {
	name: string | string[];
	[key: string]: any;
};

const findChartConfig = (chartName: string): ChartConfigType | undefined => {
	const chartConfigs: ChartConfigType[][] = [
		alpChartConfig,
		mopChartConfig,
		llpChartConfig,
		dashboardChartConfig,
		gisChartConfig,
		gisAlpConfig,
	];

	return chartConfigs.reduce<ChartConfigType | undefined>((foundConfig, configArray) => {
		return (
			foundConfig ||
			configArray.find((config) =>
				Array.isArray(config.name) ? config.name[0] === chartName : config.name === chartName,
			)
		);
	}, undefined);
};

export const DATE_TYPES = ["10세 단위", "5세 단위"] as const;
export type DateType = (typeof DATE_TYPES)[number];
interface ChartContainerProps {
	data: DataContainer;
	isReport?: boolean;
	chartHeight?: number;
	regionInfo?: Record<string, RegionInfo>;
}

export default function ChartDataType({
	data,
	isReport,
	chartHeight,
	regionInfo,
}: Readonly<ChartContainerProps>) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/").pop();
	const activeTab = useActiveTabStore(s=>s.activeTabs[data.title]?.tab ?? "평균");
	const setActiveTab = useActiveTabStore(s=>s.setActiveTab);
	const [dataSwipes, setDataSwipes] = useState<boolean[]>(Array(data.charts.length).fill(false));
	const searchFilter = useSearchFilterStore((s)=>s.filter);
	
	const chartLabelShow = useChartLabelStore(s=>s.chartLabel);
	const setChartLabelShow = useChartLabelStore((s) => s.setChartLabel);
	const [ageToggleStates, setAgeToggleStates] = useState<boolean[]>(
		Array(data.charts.length).fill(false),
	);
	useEffect(() => {
		setActiveTab(data.title, "평균");
	}, [data.title, setActiveTab]);

	useEffect(() => {
		if (isReport) {
			setChartLabelShow(true);
			return () => {
				setChartLabelShow(false);
			};
		}
		if (rootRoute === PATHS.DAS) {
			setChartLabelShow(false);
		}
	}, [isReport, setChartLabelShow, rootRoute]);

	const [chartTypes, setChartTypes] = useState(
		data.charts.reduce(
			(acc, chart) => {
				const config = findChartConfig(chart.name);
				if (config) {
					const availableTypes = Array.isArray(config.type) ? config.type : [config.type];
					acc[chart.name] = availableTypes[0];
					// console.log("acc[chart.name] : ",acc[chart.name]);
				}
				return acc;
			},
			{} as { [key: string]: string },
		),
	);

	// 탭에 따라 차트 이름을 얻는 함수
	const getChartNameByTab = (config: ChartConfigType, activeTab: string) => {
		const tabList = ["평균", "유니크"];
		const index = tabList.indexOf(activeTab);

		if (index === -1) {
			return config.name[0];
		}

		if (Array.isArray(config.name)) {
			if (!config.name[index]) {
				return undefined; // 또는 null
			}

			return config.name[index];
		}

		return config.name;
	};

	useEffect(() => {
		const updatedChartTypes = data.charts.reduce(
			(acc, chart) => {
				const config = findChartConfig(chart.name);
				if (!config) return acc;

				const chartName = getChartNameByTab(config, activeTab);

				if (!chartName) return acc;

				const availableTypes = Array.isArray(config.type) ? config.type : [config.type];

				acc[chartName] = chartTypes[chartName] || availableTypes[0];
				return acc;
			},
			{} as Record<string, string>,
		);

		setChartTypes((prevChartTypes) => {
			if (JSON.stringify(prevChartTypes) === JSON.stringify(updatedChartTypes)) {
				return prevChartTypes;
			}
			setTimeout(() => {}, 0);
			return updatedChartTypes;
		});
	}, [activeTab, data.charts]);

	// 차트 타입 변경 함수
	const handleTypeChange = (chartName: string, newType: string) => {
		setChartTypes((prevTypes) => ({
			...prevTypes,
			[chartName]: newType,
		}));
	};

	useEffect(() => {
		Object.entries(chartTypes).forEach(([chartName, chartType]) => {});
	}, [chartTypes]);

	// 스와이프 상태 관리
	const handleDataSwipe = (index: number) => {
		setDataSwipes((prevSwipes) => prevSwipes.map((swipe, i) => (i === index ? !swipe : swipe)));
	};

	// 나이 토글
	function convertToAgeGroupFormat(data: any) {
		// key 사용
		if (!data || !Array.isArray(data.indicate)) {
			console.error("Invalid data structure or missing 'indicate' array.");
			return data;
		}

		const ageGroups = [
			{ group: "10대미만", ages: ["10세 이하"] },
			{ group: "10대", ages: ["15세"] },
			{ group: "20대", ages: ["20세", "25세"] },
			{ group: "30대", ages: ["30세", "35세"] },
			{ group: "40대", ages: ["40세", "45세"] },
			{ group: "50대", ages: ["50세", "55세"] },
			{ group: "60대", ages: ["60세", "65세"] },
			{ group: "70대", ages: ["70세", "75세"] },
			{ group: "80대이상", ages: ["80세 이상"] },
		];

		const transformedIndicate = data.indicate.map((entry: any) => {
			if (typeof entry !== "object" || entry === null) {
				console.error("Invalid entry in 'indicate':", entry);
				return {};
			}

			const { 구분, ...ageValues } = entry;
			const result: { [key: string]: any } = { 구분: 구분 ?? "Unknown" };

			ageGroups.forEach((group) => {
				const groupSum = group.ages.reduce((sum, age) => {
					const value = ageValues[age] ?? 0;
					if (typeof value !== "number") {
						console.warn(`Non-numeric value for age "${age}":`, value);
						return sum;
					}
					return sum + value;
				}, 0);

				result[group.group] = groupSum;
			});

			return result;
		});

		return {
			...data,
			indicate: transformedIndicate,
		};
	}

	function convertToAgeGroupFormatllp(data: any) {
		// key 사용
		if (!data || !Array.isArray(data.indicate)) {
			console.error("Invalid data structure or missing 'indicate' array.");
			return data;
		}

		const ageGroups = [
			{ group: "10대미만", ages: ["10세 미만"] },
			{ group: "10대", ages: ["10~14세", "15~19세"] },
			{ group: "20대", ages: ["20~24세", "25~29세"] },
			{ group: "30대", ages: ["30~34세", "35~39세"] },
			{ group: "40대", ages: ["40~44세", "45~49세"] },
			{ group: "50대", ages: ["50~54세", "55~59세"] },
			{ group: "60대", ages: ["60~64세", "65~69세"] },
			{ group: "70대", ages: ["70~74세", "75~79세"] },
			{ group: "80대이상", ages: ["80세 이상"] },
		];

		const transformedIndicate = data.indicate.map((entry: any) => {
			if (typeof entry !== "object" || entry === null) {
				console.error("Invalid entry in 'indicate':", entry);
				return {};
			}

			const { 구분, ...ageValues } = entry;
			const result: { [key: string]: any } = { 구분: 구분 ?? "Unknown" };

			ageGroups.forEach((group) => {
				const groupSum = group.ages.reduce((sum, age) => {
					const value = ageValues[age] ?? 0;
					if (typeof value !== "number") {
						console.warn(`Non-numeric value for age "${age}":`, value);
						return sum;
					}
					return sum + value;
				}, 0);

				result[group.group] = groupSum;
			});

			return result;
		});

		return {
			...data,
			indicate: transformedIndicate,
		};
	}

	function convertToFirstIndicateFormat(data: any) {
		// value 사용
		const firstIndicateFormat = [
			{ 구분: "10대 미만" }, // 10세 이하
			{ 구분: "10대" }, // 10-14, 15-19
			{ 구분: "20대" }, // 20-24, 25-29
			{ 구분: "30대" }, // 30-34, 35-39
			{ 구분: "40대" }, // 40-44, 45-49
			{ 구분: "50대" }, // 50-54, 55-59
			{ 구분: "60대" }, // 60-64, 65-69
			{ 구분: "70대" }, // 70-74, 75-79
			{ 구분: "80대 이상" }, // 80세 이상
		];
		const result: Array<Record<string, any>> = firstIndicateFormat.map((item) => ({ ...item }));
		data.indicate.forEach((item: any) => {
			const { 구분, ...values } = item;
			let targetIndex;

			// 데이터 구조에 따른 처리
			if (typeof 구분 === "string") {
				// 첫 번째 데이터 구조 (범위 또는 단일 값)
				if (구분.includes("~")) {
					// 범위 처리 (e.g., "10~14세")
					if (구분.includes("10~14")) targetIndex = 1;
					else if (구분.includes("15~19")) targetIndex = 1;
					else if (구분.includes("20~24")) targetIndex = 2;
					else if (구분.includes("25~29")) targetIndex = 2;
					else if (구분.includes("30~34")) targetIndex = 3;
					else if (구분.includes("35~39")) targetIndex = 3;
					else if (구분.includes("40~44")) targetIndex = 4;
					else if (구분.includes("45~49")) targetIndex = 4;
					else if (구분.includes("50~54")) targetIndex = 5;
					else if (구분.includes("55~59")) targetIndex = 5;
					else if (구분.includes("60~64")) targetIndex = 6;
					else if (구분.includes("65~69")) targetIndex = 6;
					else if (구분.includes("70~74")) targetIndex = 7;
					else if (구분.includes("75~79")) targetIndex = 7;
					else if (구분.includes("80세 이상")) targetIndex = 8;
				} else {
					// 단일 값 처리 (e.g., "10세", "15세")
					if (구분?.includes("10세")) targetIndex = 0;
					else if (["15세", "20세"].includes(구분)) targetIndex = 1;
					else if (["25세", "30세"].includes(구분)) targetIndex = 2;
					else if (["35세", "40세"].includes(구분)) targetIndex = 3;
					else if (["45세", "50세"].includes(구분)) targetIndex = 4;
					else if (["55세", "60세"].includes(구분)) targetIndex = 5;
					else if (["65세", "70세"].includes(구분)) targetIndex = 6;
					else if (구분 === "75세") targetIndex = 7;
					else if (구분?.includes("80세")) targetIndex = 8;
				}
			}
			// 값 누적 처리
			if (targetIndex !== undefined) {
				for (const key in values) {
					result[targetIndex][key] = (result[targetIndex][key] ?? 0) + (values[key] ?? 0);
				}
			}
		});

		return {
			...data,
			indicate: result.filter((item) => Object.keys(item).some((key) => key !== "구분")),
		};
	}

	const filteredCharts = data.charts.filter((chart) => {
		const config = findChartConfig(chart.name);
		if (!config) return false;

		const chartName = getChartNameByTab(config, activeTab);
		const targetChart = data.charts.find((c) => c.name === chartName);

		// targetChart가 존재하지 않을 경우 false 반환
		if (!targetChart) {
			console.warn(`Target chart not found for chartName: ${chartName}`);
			return false;
		}

		// `indicate`가 빈 배열이면 제외
		if ("indicate" in targetChart && Array.isArray(targetChart.indicate)) {
			return targetChart.indicate.length > 0;
		}

		// MergedChartData 타입의 조건
		if (
			"data" in targetChart &&
			Array.isArray(targetChart.data) &&
			targetChart.data.some(
				(dataItem) => Array.isArray(dataItem.indicate) && dataItem.indicate.length > 0,
			)
		) {
			return true;
		}

		return false;
	});
	return (
		<>
			{filteredCharts.map((chart, index) => {
				const config = findChartConfig(chart.name);
				if (!config) return null;

				const chartName = getChartNameByTab(config, activeTab);
				const updatedChart = data.charts.find((c) => c.name === chartName);

				if (!chartName || !updatedChart) {
					return null;
				}

				const availableTypes = Array.isArray(config.type) ? config.type : [config.type];
				const currentType = chartTypes[updatedChart ? updatedChart.name : chart.name];
				const dataSwipe = dataSwipes[index];
				const age =
					ageConditionChartData.includes(chart.name) || ageConditionKeyData.includes(chart.name);
				const chartData = data.charts.map((chart, index) => {
					const isAgeToggleActive = ageToggleStates[index];
					if (isAgeToggleActive) {
						if (ageConditionChartData.includes(chart.name)) {
							return convertToFirstIndicateFormat(updatedChart);
						} else if (ageConditionKeyData.includes(chart.name)) {
							return convertToAgeGroupFormat(updatedChart);
						}
					}
					if (chart.name === "llpMonthGenderData") {
						return convertToAgeGroupFormatllp(updatedChart);
					}
					return updatedChart;
				});

				// TO_BE_CHECKED: 지표별 레이아웃 처리
				const regionLength = isReport
					? 1 // reportFilter 상태에 따른 변경 처리하기
					: rootRoute === PATHS.BOOKMARK
						? new Set(
								"data" in data.charts[0]
									? (data.charts as MergedChartData[])[0].data.map((chart) => chart.regionName)
									: (data.charts as BaseChartData[]).map((chart) => chart.regionName),
							).size
						: rootRoute === PATHS.MOP && searchFilter.isFlow
							? searchFilter.flowRegions.length
							: searchFilter.regions.length;
				const tabLength =
					isDataSummary(data.summary) || isDataSummaryArray(data.summary)
						? Object.keys(data.summary).length
						: 1;
				const displayChartLength = data.charts.length / tabLength || data.charts.length;
				const hasOrder =
					isStringArray(data.summary) ||
					(isDataSummaryArray(data.summary) &&
						data.summary.Avg.length > regionLength &&
						!(regionLength === 1 && displayChartLength === 2));
				let initailOrderNum = 2;
				const order = initailOrderNum + index * 2;

				const handleDateToggle = (index: number) => {
					setAgeToggleStates((prevStates) => {
						const updatedStates = [...prevStates];
						updatedStates[index] = !updatedStates[index]; // 해당 인덱스만 상태 변경
						return updatedStates;
					});
				};

				// 차트 출력
				return (
					<div
						key={chart.name}
						className={`chart-container ${getColSpanClass(displayChartLength, regionLength)} ${(endRoute === PATHS.RANK_ANALYSIS || (rootRoute === PATHS.BOOKMARK && (chart.name.includes("llpPreYearData") || chart.name.includes("llpFlowData")))) && "col-span-2"}`}
						style={{
							order: hasOrder ? order : "",
						}}
					>
						<div
							id={chart.name}
							className={`relative flex flex-col gap-4 overflow-visible p-4 pt-6 ${!chart.name.includes("gis") ? "h-fit" : "h-inherit"}`}
						>
							<div className="flex flex-col justify-start font-pretendard">
								<div className="text-base font-semibold text-subText">{config.title}</div>
								{config.summary && (
									<div className="pr-20 text-xs font-normal">{config.summary}</div>
								)}
							</div>
							<div className="absolute right-3 top-4 z-10 mt-1.5">
								<div className="exclude flex items-center justify-end">
									{!isReport && age && (
										<div className="pr-1">
											<ToggleButton
												labels={["5세 단위", "10세 단위"]}
												onToggle={() => handleDateToggle(index)}
												activeLabel={ageToggleStates[index] ? "10세 단위" : "5세 단위"}
											/>
										</div>
									)}
									{(chart as BaseChartData).indicate?.length > 20 && currentType === "line" && (
										<Swipe
											className={`cursor-pointer pl-1 ${dataSwipes[index] ? "text-primary" : ""}`}
											onClick={() => handleDataSwipe(index)}
										/>
									)}
									<ChartButton
										currentType={currentType}
										availableTypes={availableTypes}
										onChangeType={(newType) =>
											handleTypeChange(updatedChart ? updatedChart.name : chart.name, newType)
										}
										isReport={isReport}
									/>
								</div>
								<div className="mt-1 text-right text-xs font-normal">
									{currentType === "table" || currentType === "tableGroup"
										? "단위(명)"
										: `단위(${config.chartUnit})`}
								</div>
							</div>

							<ChartContext
								data={chartData[index]}
								title={config.title}
								summary={config.summary || ""}
								type={currentType}
								xlabel={config.xlabel}
								color={config.color}
								dataSwipe={dataSwipe}
								chartLabelShow={chartLabelShow}
								{...{ chartHeight }}
								isSingleTable={config.isSingleTable || ""}
								isExceptionalChart={config.isExceptionalChart || ""}
								chartUnit={config.chartUnit}
								regionInfo={regionInfo}
								isReport={isReport}
							/>
						</div>
					</div>
				);
			})}
		</>
	);
}

const getColSpanClass = (displayChartLength: number, regionLength: number) => {
	// 단일지역
	if (regionLength === 1 && displayChartLength === 2) return "col-span-1";
	// 비교지역
	else if (regionLength > 1) return "col-span-2";

	//
	return "col-span-2";
};
