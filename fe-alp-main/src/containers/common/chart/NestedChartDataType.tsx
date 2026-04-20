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

// 비교화면 각차트 , 테이블차트 = 머지드 데이터
import { alpChartConfig } from "../../../constants/chart/alpChartConfig";
import { mopChartConfig } from "../../../constants/chart/mopChartConfig";
import { llpChartConfig } from "../../../constants/chart/llpChartConfig";
import { dashboardChartConfig } from "../../../constants/chart/dashboardChartConfig";
import { useState, useEffect } from "react";
import ChartContext from "./ChartContext";
import ChartButton from "./ChartButton";
import Swipe from "@images/chartIcon/swipe.svg";
import TableGroupChart from "./charts/TableGroupChart";
import ToggleButton from "@/components/buttons/ToggleButton";
import {
	ageConditionChartData,
	ageConditionKeyData,
	rankingChart,
	colspanOneChart,
	rowSpanChart,
} from "@/constants/chart/chartFilter";
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

interface ChartContainerProps {
	data: DataContainer;
	isReport?: boolean;
}
export const DATE_TYPES = ["10세 단위", "5세 단위"] as const;
export type DateType = (typeof DATE_TYPES)[number];

export default function NestedChartDataType({ data, isReport }: ChartContainerProps) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/").pop();

	const searchFilter = useSearchFilterStore((s)=>s.filter);
	const chartLabelShow = useChartLabelStore(s=>s.chartLabel);
	const setChartLabelShow = useChartLabelStore((s) => s.setChartLabel);
	const activeTab = useActiveTabStore(s=>s.activeTabs[data.title]?.tab ?? "평균");
	const setActiveTab = useActiveTabStore(s=>s.setActiveTab);
	
	const [dataSwipes, setDataSwipes] = useState<boolean[]>(Array(data.charts.length).fill(false));
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
	}, [isReport, setChartLabelShow]);

	// 비교화면 차트 그룹명끼리 차트 묶음
	const groupedCharts = data.charts.reduce((acc: any, chart) => {
		const groupName = Array.isArray(chart.name) ? chart.name[0] : chart.name; // 배열이면 첫 번째 이름 사용
		if (!acc[groupName]) {
			acc[groupName] = [];
		}
		acc[groupName].push(chart);
		return acc;
	}, {});

	// 차트 타입
	const [chartTypes, setChartTypes] = useState(() =>
		data.charts.reduce(
			(acc, chart) => {
				const config = findChartConfig(chart.name);

				if (config) {
					const availableTypes = Array.isArray(config.type) ? config.type : ["defaultType"];

					if (Array.isArray(chart.name)) {
						// 배열의 모든 값을 키로 추가
						chart.name.forEach((name) => {
							acc[name] = availableTypes[0]; // 기본 타입 설정
						});
					} else {
						acc[chart.name] = availableTypes[0]; // 단일 이름 처리
					}
				}

				return acc;
			},
			{} as { [key: string]: string },
		),
	);

	// 차트 타입 변경 함수
	const handleTypeChange = (chartName: string | string[], newType: string) => {
		setChartTypes((prevTypes) => {
			const updatedTypes = { ...prevTypes };

			if (Array.isArray(chartName)) {
				chartName.forEach((name) => {
					updatedTypes[name] = newType;
				});
			} else {
				updatedTypes[chartName] = newType;
			}

			return updatedTypes;
		});
	};

	// 평균누적유니크 탭
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

	// 개별 차트의 dataSwipe 상태를 토글하는 함수
	const handleDataSwipe = (index: number) => {
		setDataSwipes(
			(prevSwipes) => prevSwipes.map((swipe, i) => (i === index ? !swipe : swipe)), // 해당 차트의 dataSwipe만 토글
		);
	};

	// 연령 전환
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
			{ 구분: "10세 미만" },
			{ 구분: "10대" },
			{ 구분: "20대" },
			{ 구분: "30대" },
			{ 구분: "40대" },
			{ 구분: "50대" },
			{ 구분: "60대" },
			{ 구분: "70대" },
			{ 구분: "80세 이상" },
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
			indicate: result,
		};
	}

	const handleDateToggle = (groupIndex: number) => {
		setAgeToggleStates((prevStates) => {
			const updatedStates = [...prevStates];
			updatedStates[groupIndex] = !updatedStates[groupIndex]; // 해당 그룹의 토글 상태 변경
			return updatedStates;
		});
	};

	const groupedChartLength = Object.keys(groupedCharts).length;

	if (!data?.charts || data.charts.length === 0) {
		return <div className="col-span-2 text-center">데이터가 존재하지 않습니다.</div>;
	}

	const isValidGroupData = Object.values(groupedCharts as { [key: string]: ChartData[] }).some(
		(group) => {
			return group.some((chart) => {
				// BaseChartData 타입 조건
				if (Array.isArray((chart as BaseChartData).indicate)) {
					return (chart as BaseChartData).indicate.length > 0;
				}

				// MergedChartData 타입 조건
				if (
					"data" in chart &&
					Array.isArray((chart as MergedChartData).data) &&
					(chart as MergedChartData).data.some(
						(dataItem) => Array.isArray(dataItem.indicate) && dataItem.indicate.length > 0,
					)
				) {
					return true;
				}

				return false;
			});
		},
	);

	if (!isValidGroupData) {
		return <div className="col-span-2 text-center">데이터가 존재하지 않습니다.</div>;
	}

	return (
		<>
			{Object.keys(groupedCharts).map((groupName, groupIndex) => {
				const chartGroup = groupedCharts[groupName];
				const config = findChartConfig(chartGroup[0].name);
				if (!config) return null;
				const chartName = getChartNameByTab(config, activeTab);
				const updatedChart = data.charts.filter((c) => c.name === chartName);

				if (!chartName || !updatedChart) {
					return null;
				}

				const availableTypes = Array.isArray(config.type) ? config.type : [config.type];
				const currentType =
					updatedChart.length > 0
						? chartTypes[updatedChart[0].name]
						: chartTypes[chartGroup[0]?.name];
				const dataSwipe = dataSwipes[groupIndex];
				const groupContainerId = `group-container-${groupName}`;

				// 그룹 차트와 개별 차트를 위한 데이터 변환 로직
				const age =
					ageConditionChartData.includes(groupName) || ageConditionKeyData.includes(groupName);
				const ageToggle = ageToggleStates[groupIndex];
				const chartData = updatedChart.map((chart) => {
					if (age && ageToggle) {
						if (ageConditionChartData.includes(chart.name)) {
							return convertToFirstIndicateFormat(chart);
						} else if (ageConditionKeyData.includes(chart.name)) {
							return convertToAgeGroupFormat(chart);
						}
					}
					if(chart.name === "llpMonthGenderDataGroup") {
						return convertToAgeGroupFormatllp(chart);
					}
					return chart;
				});

				const filteredChartGroup =
					rankingChart.includes(chartGroup[0].name) && currentType !== "tableGroup"
						? [chartData[0]].filter((chart: BaseChartData) => {
								// custom, customFullStack, customStack 타입은 항상 포함
								return (
									["custom", "customFullStack", "customStack"].includes(currentType) ||
									(Array.isArray(chart.indicate) && chart.indicate.length > 0)
								);
							})
						: chartData.filter((chart: BaseChartData) => {
								// custom, customFullStack, customStack 타입은 항상 포함
								return (
									["custom", "customFullStack", "customStack", "table", "tableGroup"].includes(
										currentType,
									) ||
									(Array.isArray(chart.indicate) && chart.indicate.length > 0)
								);
							});

				if (filteredChartGroup.length === 0) {
					return null;
				}

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
				const order = initailOrderNum + groupIndex * 2;

				const colone = colspanOneChart.some((layout) =>
					chartGroup.some((chart: any) => chart.name === layout),
				);

				const row =
					rowSpanChart.some((layout) => chartGroup.some((chart: any) => chart.name === layout)) &&
					currentType !== "table" &&
					currentType !== "tableGroup";

				const isRank = rankingChart.includes(chartGroup[0].name);

				const unitLabel = isRank
					? ""
					: currentType === "table" || currentType === "tableGroup"
						? "단위(명)"
						: `단위(${config.chartUnit})`;
				// 테이블 그룹 타입일 경우 하나의 테이블만 출력
				if (currentType === "tableGroup") {
					return (
						<div
							key={groupIndex}
							id={groupContainerId}
							className={`chart-container ${getColSpanClass(displayChartLength, regionLength, groupedChartLength)} `}
							style={{
								order: hasOrder ? order : "",
							}}
						>
							<div className="col-span-2 mb-4 flex items-center justify-between">
								<div className="flex flex-col justify-start font-pretendard">
									<div className="text-base font-semibold text-subText">{config.title}</div>
									{config.summary ? (
										<div className="text-xs font-normal">{config.summary}</div>
									) : null}
								</div>
								<div className="z-10 mt-1.5">
									<div className="exclude flex items-center justify-end">
										<ChartButton
											currentType={currentType}
											availableTypes={availableTypes}
											onChangeType={(newType) =>
												handleTypeChange(
													updatedChart.length > 0 ? updatedChart[0].name : chartGroup[0]?.name, // 첫 번째 차트 사용
													newType,
												)
											}
											isReport={isReport}
										/>
									</div>
									<div className="mt-1 text-right text-xs font-normal">{unitLabel}</div>
								</div>
							</div>

							{/* 하나의 테이블만 출력 */}
							<div className={`relative col-span-2 flex flex-col p-4 ${isRank ? "pt-0" : "pt-2"}`}>
								<TableGroupChart
									data={chartData as any}
									title={config.title}
									summary={config.summary ? config.summary : ""}
									type={currentType}
									xlabel={config.xlabel}
									color={config.color}
									dataSwipe={dataSwipe}
									chartLabelShow={chartLabelShow}
									chartUnit={config.chartUnit}
								/>
							</div>
						</div>
					);
				}

				// 비교화면 각차트 출력
				return (
					<div
						key={groupIndex}
						id={groupContainerId}
						className={`chart-container ${colone ? "col-span-1" : ""}${getColSpanClass(displayChartLength, regionLength, groupedChartLength)} ${endRoute === PATHS.RANK_ANALYSIS && "col-span-2"} `}
						style={{
							order: hasOrder ? order : "",
						}}
					>
						<div className="mb-4 flex items-center justify-between">
							<div className="flex flex-col justify-start font-pretendard">
								<div className="text-base font-semibold text-subText">{config.title}</div>
								{config.summary ? (
									<div className="text-xs font-normal">{config.summary}</div>
								) : null}
							</div>
							<div className="z-10 mt-1.5">
								<div className="exclude flex items-center justify-end">
									{!isReport && age ? (
										<div className="pr-1">
											<ToggleButton
												labels={["5세 단위", "10세 단위"]}
												onToggle={() => handleDateToggle(groupIndex)}
												selected={ageToggle ? "10세 단위" : "5세 단위"}
											/>
										</div>
									) : null}
									{chartGroup[0].indicate?.length > 20 && currentType === "line" ? (
										<Swipe
											className={`cursor-pointer pl-1 ${dataSwipes[groupIndex] ? "text-primary" : ""}`}
											onClick={() => handleDataSwipe(groupIndex)}
										/>
									) : null}
									<ChartButton
										currentType={currentType}
										availableTypes={availableTypes}
										onChangeType={(newType) =>
											handleTypeChange(
												updatedChart.length > 0 ? updatedChart[0].name : chartGroup[0]?.name, // 첫 번째 차트 사용
												newType,
											)
										}
										isReport={isReport}
									/>
								</div>
								<div className="mt-1 text-right text-xs font-normal">{unitLabel}</div>
							</div>
						</div>

						{/* pie 조건 */}
						<div className={`${row ? "flex flex-row items-center justify-evenly" : ""}`}>
							{filteredChartGroup.map((chart: BaseChartData, index: number) => (
								<div
									key={index}
									id={`${chart.name}-${chart.regionName}`}
									className={`relative flex flex-col ${row ? "p-1" : "p-4"} ${isRank ? "pt-0" : "pt-6"}`}
								>
									<ChartContext
										data={chart}
										title={config.title}
										summary={config.summary ? config.summary : ""}
										type={currentType}
										xlabel={config.xlabel}
										color={config.color}
										dataSwipe={dataSwipe}
										chartLabelShow={chartLabelShow}
										isSingleTable={config.isSingleTable || ""}
										isExceptionalChart={config.isExceptionalChart || ""}
										chartUnit={config.chartUnit}
									/>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</>
	);
}

const getColSpanClass = (
	displayChartLength: number,
	regionLength: number,
	groupedChartLength: number,
) => {
	// 단일지역
	if (regionLength === 1 && displayChartLength === 2) return "col-span-1";
	// 비교지역
	else if (regionLength > 1) return "col-span-2";

	//
	return "col-span-2";
};
