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

import {
	agePerTenFilter,
	genderFilter,
	pattern2Filter,
	patternFilter,
} from "@/constants/rankFilter";
import { formatUnixToString } from "./gisOptionFunc";
import { movingPurposeFilter, movingVehicleFilter } from "@/utils/filter";

export function filterDataByDateRange(
	chartData: {
		indicate: {
			구분: string;
			생활인구: number;
		}[];
		name: string;
	},
	selectedDateRange: {
		idx: number;
		label: string;
		start: Date;
		end: Date;
	},
) {
	return {
		...chartData,
		indicate: chartData.indicate.filter((entry) => {
			const entryDateObj = new Date(Number(entry["구분"]));
			const entryDate = new Date(
				entryDateObj.getFullYear(),
				entryDateObj.getMonth(),
				entryDateObj.getDate(),
			);

			return entryDate >= selectedDateRange.start && entryDate <= selectedDateRange.end;
		}),
	};
}

// 생활인구 필터링
export function alpOptionFilter(
	chartData: AlpChartData[] | undefined,
	gisSettings: GisSettings,
): AlpChartData[] {
	if (!chartData) return [];
	const { isTotallifestylePattern, lifestylePattern, gender, ageGroup } = gisSettings.maps[0];

	// 라이프스타일 패턴 매핑
	const lifestylePatternMapping = isTotallifestylePattern
		? ["RSDN_WKPLC", "VIST"]
		: ["RSDN", "WKPLC", "VIST"];
	const selectedPatterns = lifestylePattern.map((index: number) => lifestylePatternMapping[index]);

	// 요일 매핑
	const validDays = chartData.map((chart) => ({ ...chart, dowCd: chart.dowCd + 1 }));
	const filteredData = validDays.map((item: any) => {
		const filteredItem: any = {
			timestamp: formatUnixToString(Number(item.timestamp)),
			dowCd: item.dowCd,
			isHoliday: item.isHoliday,
		};

		selectedPatterns.forEach((pattern) => {
			gender.forEach((g: number) => {
				const genderStr = g === 0 ? "MALE" : "FEML";
				ageGroup.forEach((age: number) => {
					const ageStr = age === 1 ? String(age - 1).padStart(2, "0") : (age - 1) * 10;
					const key = `${pattern}_${genderStr}_${ageStr}`;

					let value = 0;

					if (pattern === "RSDN_WKPLC") {
						value =
							(item[`RSDN_${genderStr}_${ageStr}`] || 0) +
							(item[`WKPLC_${genderStr}_${ageStr}`] || 0);
					} else {
						value = item[key] || 0;
					}

					if (value !== 0) {
						filteredItem[key] = (filteredItem[key] || 0) + value;
					}
				});
			});
		});
		return filteredItem;
	});

	return filteredData;
}

export function timeLineChartDataHandler(
	chartData: TlChartData[] | undefined,
	gisSettings: GisSettings,
) {
	const { analysisType, isMovingPurpose, maps } = gisSettings;
	const labels = isMovingPurpose ? movingPurposeFilter.labels : movingVehicleFilter.labels;
	let inOutFlowType: "inflow" | "outflow" = maps[0].inOutFlow ? "inflow" : "outflow";

	if (!chartData) return [];

	switch (analysisType) {
		case 0:
			return chartData.map((item) => ({
				구분: item.timestamp,
				생활인구: item.count,
			}));
		case 1:
			return chartData.map((item) => {
				const flowData = item[inOutFlowType] ? Object.entries(item[inOutFlowType]) : [];
				// Initialize the accumulator with a proper type
				const mappedData: { [key: string]: any } = flowData.reduce(
					(acc, [key, value]) => {
						const index = parseInt(key.replace(isMovingPurpose ? "PRPS" : "WAY", ""), 10) + 1;
						acc[labels[index]] = value;
						return acc;
					},
					{} as { [key: string]: any },
				);

				// Return a flat structure with the 구분 and mapped data
				return {
					구분: item.timestamp,
					// 생활이동: item.count,
					...mappedData,
				};
			});
		default:
			return [];
	}
}
export function timeSeriesChartDataFilter(filteredData: TlChartData[]) {
	return filteredData.map((item) => {
		const { timestamp, count } = item;
		// const sum = Object.values(values)
		// 	.filter((value) => typeof value === "number")
		// 	.reduce((acc, value) => acc + (value as number), 0);
		return { 구분: timestamp, 생활인구: count };
	});
}

export function filterAlpData(chartData: AlpChartData[] | undefined, gisSettings: GisSettings) {
	if (!chartData) return [];

	const { isDual } = gisSettings;
	const mapConfigs = isDual ? [gisSettings.maps[0], gisSettings.maps[1]] : [gisSettings.maps[0]];

	const results = mapConfigs.map((mapConfig) => {
		const { isTotallifestylePattern, lifestylePattern, gender, ageGroup } = mapConfig;

		const result: any = {
			avgData: 0,
			periodData: [],
			lifestylePatternData: [],
			genderData: [],
			ageGroupData: [],
			dayOfWeekData: [],
		};

		const avgPopulation = chartData.reduce((acc: number, item: any) => {
			const sum = Object.entries(item).reduce((sumAcc, [key, value]) => {
				if (
					key !== "timestamp" &&
					key !== "dowCd" &&
					key !== "isHoliday" &&
					typeof value === "number"
				) {
					return sumAcc + value;
				}
				return sumAcc;
			}, 0);

			return acc + sum;
		}, 0);

		result.avgData = chartData.length > 0 ? avgPopulation / chartData.length : 0;

		result.periodData = chartData.map((item: any) => {
			const sum = Object.entries(item).reduce((acc: number, [key, value]) => {
				if (key !== "timestamp" && typeof value === "number") {
					return acc + value;
				}
				return acc;
			}, 0);
			return { 구분: item.timestamp, 생활인구: sum };
		});

		// lifestylePattern 처리
		const lifestylePatternLabels = (isTotallifestylePattern === 0 ? patternFilter : pattern2Filter)
			.labels;
		if (isTotallifestylePattern === 0) {
			result.lifestylePatternData = lifestylePattern.map((pattern) => {
				const value = chartData.reduce((acc: any, item: any) => {
					const patternValue =
						pattern === 0
							? Object.entries(item).reduce(
									(sum, [key, value]) =>
										key.includes("RSDN") && typeof value === "number" ? sum + value : sum,
									0,
								)
							: pattern === 1
								? Object.entries(item).reduce(
										(sum, [key, value]) =>
											key.includes("WKPLC") && typeof value === "number" ? sum + value : sum,
										0,
									)
								: pattern === 2
									? Object.entries(item).reduce(
											(sum, [key, value]) =>
												key.includes("VIST") && typeof value === "number" ? sum + value : sum,
											0,
										)
									: 0;
					return acc + patternValue;
				}, 0);
				return { 구분: lifestylePatternLabels[pattern], 생활인구: value };
			});
		} else {
			result.lifestylePatternData = lifestylePattern.map((pattern) => {
				let sum: any = 0;
				if (pattern === 0) {
					sum = chartData.reduce((acc: any, item: any) => {
						return Object.entries(item).reduce(
							(sum, [key, value]) =>
								key.includes("RSDN") || (key.includes("WKPLC") && typeof value === "number")
									? sum + value
									: sum,
							acc,
						);
					}, 0);
				} else if (pattern === 1) {
					sum = chartData.reduce((acc: any, item: any) => {
						return Object.entries(item).reduce(
							(sum, [key, value]) =>
								key.includes("VIST") && typeof value === "number" ? sum + value : sum,
							acc,
						);
					}, 0);
				}
				return { 구분: lifestylePatternLabels[pattern], 생활인구: sum };
			});
		}

		// 구분이 undefined인 데이터 필터링
		result.lifestylePatternData = result.lifestylePatternData.filter(
			(data: any) => data.구분 !== undefined,
		);

		// gender 처리
		result.genderData = gender
			.map((pattern) => {
				const genderKeyPattern = pattern === 0 ? "MALE" : "FEML";
				const genderSum = chartData.reduce((acc: number, item: any) => {
					const matchingValues = Object.entries(item)
						.filter(([key, value]) => key.includes(genderKeyPattern) && typeof value === "number")
						.map(([_, value]) => value as number);
					return acc + matchingValues.reduce((sum, val) => sum + val, 0);
				}, 0);
				return { 구분: genderFilter.labels[pattern], 생활인구: genderSum };
			})
			.filter((data: any) => data.구분 !== undefined);

		// ageGroup 처리
		const filterAgeGroup = agePerTenFilter.labels.filter((_, index) =>
			ageGroup.includes(index + 1),
		);
		result.ageGroupData = filterAgeGroup
			.map((label, index) => {
				const maleKeyPattern = `MALE_${label === "10대 미만" ? "00" : parseFloat(label)}`;
				const femaleKeyPattern = `FEML_${label === "10대 미만" ? "00" : parseFloat(label)}`;
				const maleSum = chartData.reduce((acc: number, item: any) => {
					const maleValues = Object.entries(item)
						.filter(([key, value]) => key.includes(maleKeyPattern) && typeof value === "number")
						.map(([_, value]) => value as number);
					return acc + maleValues.reduce((sum, val) => sum + val, 0);
				}, 0);

				const femaleSum = chartData.reduce((acc: number, item: any) => {
					const femaleValues = Object.entries(item)
						.filter(([key, value]) => key.includes(femaleKeyPattern) && typeof value === "number")
						.map(([_, value]) => value as number);
					return acc + femaleValues.reduce((sum, val) => sum + val, 0);
				}, 0);

				const combinedTotal = maleSum + femaleSum;

				return { 구분: label, 생활인구: combinedTotal };
			})
			.filter((data: any) => data.구분 !== undefined);

		// 요일 필터링
		const updatedChartData = chartData.map((item) => ({
			...item,
			dowCd: item.dowCd === 0 ? 7 : item.dowCd,
		}));

		return result;
	});

	return results;
}
