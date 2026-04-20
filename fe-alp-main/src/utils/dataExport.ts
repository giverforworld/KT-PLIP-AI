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

import html2canvas from "html2canvas";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { getChartTitle } from "./chartUtils";
import { alpChartConfig } from "@/constants/chart/alpChartConfig";
import { mopChartConfig } from "@/constants/chart//mopChartConfig";
import { llpChartConfig } from "@/constants/chart//llpChartConfig";
import { dashboardChartConfig } from "@/constants/chart/dashboardChartConfig";
import { gisAlpConfig, gisChartConfig } from "@/constants/chart/gisChartConfig";
import {
	sankeyTable,
	singleSankeyTable,
	rankingChart,
	heatmapChart,
	mopScatter,
} from "@/constants/chart/chartFilter";
/**
 * 차트 이미지 다운로드
 * @param data export할 chart가 속한 DataContainer
 */

// export const exportChartsToPng = async (data: DataContainer) => {
// 	const chartIds = data.charts.map((item) => item.name);

// 	// 버튼 등 불필요 요소 숨김
// 	const excludedElements = document.querySelectorAll(".exclude");
// 	excludedElements.forEach((el) => el.classList.add("hidden"));

// 	for (const id of chartIds) {
// 		const element = document.getElementById(id);
// 		const chartTitle = getChartTitle(id);

// 		if (element) {
// 			try {
// 				const canvas = await html2canvas(element);
// 				canvas.toBlob((blob) => {
// 					if (blob) {
// 						saveAs(blob, `${chartTitle}.png`);
// 					}
// 				}, "image/png");
// 			} catch (error) {
// 				console.error(error);
// 			}
// 		}
// 	}

// 	excludedElements.forEach((el) => el.classList.remove("hidden"));
// };

export const exportChartsToPng = async (data: DataContainer) => {
	const chartId = data.charts.map((item) => item.name);
	const chartIds = data.charts.map((item) => `${item.name}-${(item as BaseChartData).regionName}`);
	const groupedCharts = data.charts.reduce((acc: any, chart: ChartData) => {
		const groupName = `group-container-${chart.name}`;
		if (!acc[groupName]) {
			acc[groupName] = [];
		}
		acc[groupName].push(chart);
		return acc;
	}, {});
	const groupedChartIds = Object.keys(groupedCharts);

	// 전체 차트 ID 리스트
	const allChartIds = [...chartId, ...chartIds, ...groupedChartIds];

	// 그룹 차트에 속한 개별 차트의 ID를 수집
	const groupedIndividualChartIds = new Set(
		Object.values(groupedCharts)
			.flatMap((charts) => charts as ChartData[]) // 타입 단언을 통해 charts의 타입 명시
			.map((chart: ChartData) => `${chart.name}-${(chart as BaseChartData).regionName}`),
	);

	// 숨김 처리
	const excludedElements = document.querySelectorAll(".exclude");
	excludedElements.forEach((el) => el.classList.add("hidden"));

	for (const id of allChartIds) {
		// 그룹에 속한 개별 차트 ID를 건너뛰기
		if (!id.startsWith("group-container-") && groupedIndividualChartIds.has(id)) {
			continue;
		}

		const element = document.getElementById(id);
		if (!element) {
			console.warn(`Element with ID ${id} not found.`);
			continue;
		}

		// 캡처 전 텍스트 위치 조정
		const textNodes = getTextNodes(element);
		const originalStyles: Map<HTMLElement, string> = new Map();

		textNodes.forEach((textNode) => {
			const parent = textNode.parentElement;
			if (parent) {
				originalStyles.set(parent, parent.style.top || ""); // 기존 스타일 저장
				parent.style.position = "relative";
				parent.style.top = "-10px"; // 텍스트 위치 보정
			}
		});

		// 캡처 대상의 제목 가져오기
		const isGroupChart = id.startsWith("group-container-");
		const adjustedId = isGroupChart ? id.replace("group-container-", "") : id;
		const chartTitle = getChartTitle(adjustedId);

		try {
			const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
			canvas.toBlob((blob) => {
				if (blob) {
					saveAs(blob, `${chartTitle}.png`);
				}
			}, "image/png");
		} catch (error) {
			console.error(`Error capturing chart ${chartTitle}:`, error);
		} finally {
			// 캡처 후 텍스트 위치 복원
			textNodes.forEach((textNode) => {
				const parent = textNode.parentElement;
				if (parent) {
					parent.style.top = originalStyles.get(parent) || "";
				}
			});
		}
	}

	// 숨김 해제
	excludedElements.forEach((el) => el.classList.remove("hidden"));
};

/**
 * 페이지 내 전체 데이터 차트 이미지를 zip파일로 다운로드
 * @param data export할 chart가 속한 DataContainer의 배열
 * @param fileName 페이지 전체 데이터 저장 될 경우, 해당 페이지 이름을 포함하여 파일 저장
 */
export const exportAllChartsToZip = async (data: DataContainer[], fileName: string) => {
	const zip = new JSZip();

	const charts = data.reduce<ChartData[]>((acc, cur) => [...acc, ...cur.charts], []);
	const chartId = charts.map((item) => item.name);
	const chartIds = charts.map((item) => `${item.name}-${(item as BaseChartData).regionName}`);

	const groupedCharts = charts.reduce((acc: any, chart: ChartData) => {
		const groupName = `group-container-${chart.name}`;
		if (!acc[groupName]) {
			acc[groupName] = [];
		}
		acc[groupName].push(chart);
		return acc;
	}, {});
	const groupedChartIds = Object.keys(groupedCharts);

	const allChartIds = [...chartId, ...chartIds, ...groupedChartIds];

	// 버튼 등 불필요 요소 숨김
	const excludedElements = document.querySelectorAll(".exclude");
	excludedElements.forEach((el) => el.classList.add("hidden"));

	const groupedIndividualChartIds = new Set(
		Object.values(groupedCharts)
			.flatMap((charts) => charts as ChartData[])
			.map((chart: ChartData) => `${chart.name}-${(chart as BaseChartData).regionName}`),
	);
	const promises = allChartIds.map(async (id) => {
		if (!id.startsWith("group-container-") && groupedIndividualChartIds.has(id)) {
			return;
		}
		const element = document.getElementById(id);
		const isGroupChart = id.startsWith("group-container-");
		const adjustedId = isGroupChart ? id.replace("group-container-", "") : id;

		const chartTitle = getChartTitle(adjustedId);
		const filename = chartTitle?.replace(/[\/:*?[\]]/g, "_");

		if (element) {
			try {
				const canvas = await html2canvas(element);
				const blob = await new Promise<Blob | null>((resolve) => {
					canvas.toBlob(resolve, "image/png");
				});

				if (blob) {
					zip.file(`${filename}.png`, blob);
				}
			} catch (error) {
				console.error(error);
			}
		}
	});
	await Promise.all(promises);

	// ZIP 파일 생성 및 다운로드
	const content = await zip.generateAsync({ type: "blob" });
	saveAs(content, `${fileName}_차트.zip`);

	excludedElements.forEach((el) => el.classList.remove("hidden"));
};

/**
 * 엑셀 다운로드
 * @param data export할 chart data가 속한 DataContainer객체 혹은 객체의 배열
 * @param reportName
 */
type ChartConfigType = {
	name: string | string[];
	[key: string]: any;
};

export const findChartConfig = (chartName: string): ChartConfigType | undefined => {
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
				Array.isArray(config.name) ? config.name.includes(chartName) : config.name === chartName,
			)
		);
	}, undefined);
};

export const exportAllDataToExcel = (data: DataContainer[], reportName?: string) => {
	const workbook = new ExcelJS.Workbook();

	data.forEach((dataContainer, dataIdx) => {
		const chartData = dataContainer.charts;
		if (!chartData || chartData.length === 0) {
			return;
		}
		const nameCounts = chartData.reduce(
			(acc, currentItem) => {
				const name = (currentItem as BaseChartData).name || "";
				acc[name] = (acc[name] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		chartData.forEach((item, idx) => {
			// 안전한 시트 이름 생성
			let baseSheetName = `${dataIdx + 1}-${idx + 1}-${item.name || "Sheet"}`;
			baseSheetName = baseSheetName.replace(/[\/:*?\[\]]/g, "_").substring(0, 31); // 특수 문자 제거 및 길이 제한

			// 중복 이름 처리
			let sheetName = baseSheetName;
			let sheetCounter = 1;
			while (workbook.getWorksheet(sheetName)) {
				sheetName = `${baseSheetName}_${sheetCounter}`;
				sheetCounter += 1;
			}

			const config = findChartConfig(item.name);
			const sheetname = `${idx + 1}-${item.name || "Sheet"}`;
			let isBasicChartLegend = false;
			let isBasicChart = false;
			let isNestedChart = false;
			let isCompareChart = false;
			let isCompareChartMultiple = false;
			let isCompareChartMultipleLegend = false;
			const isRankingChart = rankingChart.includes(item.name);
			const isSankeyChart = sankeyTable.includes(item.name);
			const isSingleSankeyChart = singleSankeyTable.includes(item.name);
			const isHeatmapChart = heatmapChart.includes(item.name);
			const isMopScatterChart = mopScatter.includes(item.name);

			const transformDataForCharts = (data: ChartData[]): { charts: MergedChartData[] } => {
				const charts = data.reduce((acc: MergedChartData[], item: ChartData) => {
					if (!("indicate" in item) || !("regionName" in item)) {
						return acc;
					}
					const baseItem = item as BaseChartData;
					let chartGroup = acc.find((group: MergedChartData) => group.name === baseItem.name);
					if (!chartGroup) {
						chartGroup = { name: baseItem.name, data: [] };
						acc.push(chartGroup);
					}
					chartGroup.data.push({
						regionName: baseItem.regionName!,
						indicate: baseItem.indicate,
					});
					return acc;
				}, []);
				return { charts };
			};

			const transformedData = transformDataForCharts(chartData);

			if (config?.isSingleTable !== true) {
				if ((item as MergedChartData).data && Array.isArray((item as MergedChartData).data)) {
					isNestedChart = true;
				} else if ((item as BaseChartData).regionName) {
					const isNameDuplicate = nameCounts[(item as BaseChartData).name || ""] > 1;
					const dataKeyCount =
						(item as BaseChartData).indicate?.[0] !== undefined
							? Object.keys((item as BaseChartData).indicate[0]).length
							: 0;
					if (dataKeyCount === 0) {
						return;
					}

					if (dataKeyCount > 2) {
						if (isNameDuplicate) {
							isCompareChartMultipleLegend = true;
						} else {
							isBasicChartLegend = true;
						}
					} else if (isNameDuplicate) {
						isCompareChartMultiple = true;
					} else {
						isBasicChart = true;
					}
				} else if (!(item as BaseChartData).regionName) {
					isCompareChart = true;
				}
			}
			if (isSankeyChart === true) {
				addSankeyChart(workbook, [item as BaseChartData]);
			}

			if (isSingleSankeyChart === true) {
				addSingleSankeyChart(workbook, [item as BaseChartData]);
			}

			if (isHeatmapChart === true) {
				addHeatmapChart(workbook, [item as BaseChartData]);
			}

			if (isMopScatterChart === true) {
				assMopScatterCahrt(workbook, [item as MergedChartData]);
			}

			if (config?.isSingleTable === true) {
				addSingleChart(workbook, [item as BaseChartData]);
			}

			if (isRankingChart) {
				const correspondingChartData: MergedChartData = {
					name: (item as BaseChartData).name,
					data: transformedData.charts
						.filter((chart) => chart.name === (item as BaseChartData).name)
						.flatMap((chart) => chart.data),
				};
				addRankingChart(workbook, [correspondingChartData]);
			}

			if (isNestedChart && !isMopScatterChart) {
				addNestedChart(workbook, [item as MergedChartData]);
			} else if (isBasicChartLegend && !isHeatmapChart && !isSankeyChart && !isSingleSankeyChart) {
				addBasicChartLegend(workbook, [item as BaseChartData]);
			} else if (isBasicChart && !isSankeyChart && !isSingleSankeyChart) {
				addBasicChart(workbook, [item as BaseChartData]);
			} else if (isCompareChart && !isRankingChart) {
				addCompareChart(workbook, [item as BaseChartData]);
			} else if (
				isCompareChartMultiple &&
				!isRankingChart &&
				!isSankeyChart &&
				!isSingleSankeyChart &&
				!isHeatmapChart
			) {
				const correspondingChartData: MergedChartData = {
					name: (item as BaseChartData).name,
					data: transformedData.charts
						.filter((chart) => chart.name === (item as BaseChartData).name)
						.flatMap((chart) => chart.data),
				};
				addCompareChartMultiple(workbook, [correspondingChartData]);
			} else if (
				isCompareChartMultipleLegend &&
				!isSankeyChart &&
				!isSingleSankeyChart &&
				!isRankingChart &&
				!isHeatmapChart
			) {
				const correspondingChartData: MergedChartData = {
					name: (item as BaseChartData).name,
					data: transformedData.charts
						.filter((chart) => chart.name === (item as BaseChartData).name)
						.flatMap((chart) => chart.data),
				};
				addCompareChartMultipleLegend(workbook, [correspondingChartData]);
			}
		});
	});

	workbook.xlsx
		.writeBuffer()
		.then((buffer) => {
			const blob = new Blob([buffer], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = reportName ? `${reportName}.xlsx` : "report.xlsx";
			document.body.appendChild(a);
			a.click();
			a.remove();
		})
		.catch((error) => {
			console.error("Excel 파일 생성 중 오류 발생:", error);
		});
};

export const exportChartDataToExcel = (data: DataContainer, reportName?: string) => {
	const workbook = new ExcelJS.Workbook();
	const chartData = data.charts;

	const nameCounts = chartData.reduce(
		(acc, currentItem) => {
			const name = (currentItem as BaseChartData).name || "";
			acc[name] = (acc[name] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const processedRankingNames = new Set<string>();
	
	chartData.forEach((item, idx) => {
		const config = findChartConfig(item.name);
		const sheetName = `${idx + 1}-${item.name || "Sheet"}`;
		let isBasicChartLegend = false;
		let isBasicChart = false;
		let isNestedChart = false;
		let isCompareChart = false;
		let isCompareChartMultiple = false;
		let isCompareChartMultipleLegend = false;
		const isRankingChart = rankingChart.includes(item.name);
		const isSankeyChart = sankeyTable.includes(item.name);
		const isSingleSankeyChart = singleSankeyTable.includes(item.name);
		const isHeatmapChart = heatmapChart.includes(item.name);
		const isMopScatterChart = mopScatter.includes(item.name);

		const transformDataForCharts = (data: ChartData[]): { charts: MergedChartData[] } => {
			const charts = data.reduce((acc: MergedChartData[], item: ChartData) => {
				if (!("indicate" in item) || !("regionName" in item)) {
					return acc;
				}
				const baseItem = item as BaseChartData;
				let chartGroup = acc.find((group: MergedChartData) => group.name === baseItem.name);
				if (!chartGroup) {
					chartGroup = { name: baseItem.name, data: [] };
					acc.push(chartGroup);
				}
				chartGroup.data.push({
					regionName: baseItem.regionName!,
					indicate: baseItem.indicate,
				});
				return acc;
			}, []);
			return { charts };
		};

		const transformedData = transformDataForCharts(chartData);

		if (config?.isSingleTable !== true) {
			if ((item as MergedChartData).data && Array.isArray((item as MergedChartData).data)) {
				isNestedChart = true;
			} else if ((item as BaseChartData).regionName) {
				const isNameDuplicate = nameCounts[(item as BaseChartData).name || ""] > 1;
				const dataKeyCount =
					(item as BaseChartData).indicate?.[0] !== undefined
						? Object.keys((item as BaseChartData).indicate[0]).length
						: 0;
				if (dataKeyCount === 0) {
					return;
				}

				if (dataKeyCount > 2) {
					if (isNameDuplicate) {
						isCompareChartMultipleLegend = true;
					} else {
						isBasicChartLegend = true;
					}
				} else if (isNameDuplicate) {
					isCompareChartMultiple = true;
				} else {
					isBasicChart = true;
				}
			} else if (!(item as BaseChartData).regionName) {
				isCompareChart = true;
			}
		}

		if (isSankeyChart === true) {
			addSankeyChart(workbook, [item as BaseChartData]);
			// console.log(`생키: ${sheetName}`);
		}

		if (isSingleSankeyChart === true) {
			addSingleSankeyChart(workbook, [item as BaseChartData]);
			// console.log(`생키: ${sheetName}`);
		}

		if (isHeatmapChart === true) {
			addHeatmapChart(workbook, [item as BaseChartData]);
			// console.log(`히트맵: ${sheetName}`);
		}

		if (isMopScatterChart === true) {
			assMopScatterCahrt(workbook, [item as MergedChartData]);
			// console.log(`생활이동스캐터: ${sheetName}`);
		}

		if (config?.isSingleTable === true) {
			addSingleChart(workbook, [item as BaseChartData]);
			// console.log(`각표: ${sheetName}`);
		}

		if (isRankingChart) {
			const chartName = (item as BaseChartData).name || "";

			if (processedRankingNames.has(chartName)) {
				return; // ✅ 중복 실행 방지
			}

			processedRankingNames.add(chartName);

			const correspondingChartData: MergedChartData = {
				name: (item as BaseChartData).name,
				data: transformedData.charts
					.filter((chart) => chart.name === (item as BaseChartData).name)
					.flatMap((chart) => chart.data),
			};
			addRankingChart(workbook, [correspondingChartData]);
			// console.log(`랭킹차트: ${sheetName}`);
		}

		if (isNestedChart && !isMopScatterChart) {
			addNestedChart(workbook, [item as MergedChartData]);
			// console.log(`머지드 차트 추가 성공: ${sheetName}`);
		} else if (isBasicChartLegend && !isHeatmapChart && !isSankeyChart && !isSingleSankeyChart) {
			addBasicChartLegend(workbook, [item as BaseChartData]);
			// console.log(`기본차트 범례 추가 성공: ${sheetName}`);
		} else if (isBasicChart && !isSankeyChart && !isSingleSankeyChart) {
			addBasicChart(workbook, [item as BaseChartData]);
			// console.log(`기본차트 추가 성공: ${sheetName}`);
		} else if (isCompareChart && !isRankingChart) {
			addCompareChart(workbook, [item as BaseChartData]);
			// console.log(`비교화면 기본차트 추가 성공: ${sheetName}`);
		} else if (
			isCompareChartMultiple &&
			!isRankingChart &&
			!isSankeyChart &&
			!isSingleSankeyChart &&
			!isHeatmapChart
		) {
			const correspondingChartData: MergedChartData = {
				name: (item as BaseChartData).name,
				data: transformedData.charts
					.filter((chart) => chart.name === (item as BaseChartData).name)
					.flatMap((chart) => chart.data),
			};
			addCompareChartMultiple(workbook, [correspondingChartData]);
			// console.log(`비교화면 각차트 성공: ${sheetName}`);
		} else if (
			isCompareChartMultipleLegend &&
			!isSankeyChart &&
			!isSingleSankeyChart &&
			!isRankingChart &&
			!isHeatmapChart
		) {
			const correspondingChartData: MergedChartData = {
				name: (item as BaseChartData).name,
				data: transformedData.charts
					.filter((chart) => chart.name === (item as BaseChartData).name)
					.flatMap((chart) => chart.data),
			};
			addCompareChartMultipleLegend(workbook, [correspondingChartData]);
			// console.log(`비교화면 각차트 범례 성공: ${sheetName}`);
		}
	});

	workbook.xlsx
		.writeBuffer()
		.then((buffer) => {
			const blob = new Blob([buffer], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = Array.isArray(data) ? `${reportName}.xlsx` : `${data.title}.xlsx`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		})
		.catch((error) => {
			console.error("Excel 파일 생성 중 오류 발생:", error);
		});
};

const sheetNames: string[] = [];

// 랭킹차트
const addRankingChart = (workbook: ExcelJS.Workbook, data: MergedChartData[]) => {
	const alpRaceData = ["랭킹", "시도", "시군구", "생활인구 수", "전년 동기 대비 증감"];
	const alpRaceTownData = [
		"랭킹",
		"시도",
		"시군구",
		"읍면동",
		"생활인구 수",
		"전년 동기 대비 증감",
	];
	const llpRaceData = ["랭킹", "시도", "시군구", "체류인구 수", "체류인구 배수"];
	const llpRankingeData = ["랭킹", "시군구", "배수", "전년대비 증감"];
	const mopRaceData = ["랭킹", "시도", "시군구", "유입인구 수", "전년 동기 대비 증감"];
	const mopRaceTownData = [
		"랭킹",
		"시도",
		"시군구",
		"읍면동",
		"유입인구 수",
		"전년 동기 대비 증감",
	];

	const sortedRaceData = data[0].data[0].indicate;
	let yData: Record<string, number> = {};
	const chartTitleBase = getChartTitle(data[0].name);
	const suffixMatches = data[0].name.match(/(avg|sum|unique)/gi); // `avg`, `sum`, `unique` 매치
	const suffixTexts = suffixMatches
		? suffixMatches.map((suffix) =>
				suffix.toLowerCase() === "sum"
					? "누적"
					: suffix.toLowerCase() === "avg"
						? "평균"
						: "유니크",
			)
		: []; // 매치된 접미사를 텍스트로 변환


	const chartTitle =
		suffixTexts.length > 0 ? `${chartTitleBase} (${suffixTexts.join(", ")})` : chartTitleBase;

	let baseSheetName = `${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
	let sheetName = baseSheetName;
	// if (sheetNames.includes(sheetName)) {
	// 	return;
	// }

	let counter = 1;
	while (workbook.getWorksheet(sheetName)) {
		sheetName = `${baseSheetName}_${counter}`;
		counter++;
	}

	sheetNames.push(sheetName);

	const worksheet = workbook.addWorksheet(sheetName);
	const firstKey = Object.keys(data[0].data[0].indicate[0])[0];

	// 데이터 처리
	sortedRaceData.forEach((d) => {
		Object.keys(d).forEach((key) => {
			if (key !== firstKey) {
				if (!yData[key]) {
					yData[key] = 0;
				}
				yData[key] += Number(d[key]) || 0;
			}
		});
	});
	const rankedData = Object.keys(yData)
		.map((key) => ({ region: key, sum: yData[key] }))
		.sort((a, b) => b.sum - a.sum)
		.map((item, index) => ({
			rank: index + 1,
			region: item.region,
			sum: item.sum,
		}));
	const dayCount = data[0].data[0].indicate.length || 1; // 생활인구일 경우 일수 평균

	const additionalData = data[0].data[1].indicate;
	const additionalValues = Object.entries(additionalData[0])
		.filter(([key]) => key !== "구분")
		.map(([, value]) => value);

	const mergedTableData = rankedData.map((item, index) => ({
		...item,
		additionalValue: additionalValues[index] ?? "-",
	}));
	// 헤더 생성
	const headerMap: Record<string, string[]> = {
		alpRaceDataAvg: alpRaceData,
		alpRaceDataSum: alpRaceData,
		alpRaceDataGroupAvg: alpRaceData,
		alpRaceDataGroupSum: alpRaceData,
		alpRaceTownDataAvg: alpRaceTownData,
		alpRaceTownDataSum: alpRaceTownData,
		alpRaceTownDataGroupAvg: alpRaceTownData,
		alpRaceTownDataGroupSum: alpRaceTownData,
		llpRaceData: llpRaceData,
		llpRankingeData: llpRankingeData,
		llpRaceDataGroup: llpRaceData,
		llpRankingeDataGroup: llpRankingeData,
		mopRaceData: mopRaceData,
		mopRaceTownData: mopRaceTownData,
		mopRaceDataGroup: mopRaceData,
		mopRaceTownDataGroup: mopRaceTownData,
	};

	// 헤더를 반환하는 함수
	const getHeaders = (chartName: string): string[] => {
		const matchedKey = Object.keys(headerMap).find((key) => chartName.includes(key));
		return matchedKey ? headerMap[matchedKey] : ["랭킹", "시도", "시군구", "인구 수", "전년 대비"];
	};
	const chartName = data[0].name || "";
	const isAlp = chartName.includes("alp");
	const headers = getHeaders(chartName);
	const hasTownColumn = headers.includes("읍면동");
	// 시트에 데이터 삽입
	worksheet.addRow(headers).eachCell((cell) => {
		cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
		cell.alignment = { horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "DDDDDD" },
		};
	});

	// 데이터 추가
	mergedTableData.forEach((item) => {
		const regionParts = item.region.split(" "); // 지역 정보 분리
		const city = regionParts[0] || ""; // 첫 번째 값: 시도

		let district = regionParts[1] || "";
		let town = regionParts[2] || "";

		if (regionParts.length === 3) {
			if (town.endsWith("시") || town.endsWith("구") || town.endsWith("군")) {
				district = district + " " + town;
				town = "";
			}
		} else if (regionParts.length === 4) {
			district = regionParts[1] + " " + regionParts[2];
			town = regionParts[3];
		}

		// ✅ 항상 동일한 컬럼 구조 유지
		const rowData = hasTownColumn
			? [
					item.rank,
					city,
					district,
					town,
					isAlp ? Math.round(item.sum / dayCount) : item.sum,
					item.additionalValue,
				]
			: [
					item.rank,
					city,
					district,
					isAlp ? Math.round(item.sum / dayCount) : item.sum,
					item.additionalValue,
				];

		worksheet.addRow(rowData);
	});
	// 셀 스타일 설정
	worksheet.columns.forEach((column) => {
		column.width = 15;
		column.alignment = { horizontal: "center" };
	});
};

//기본차트
const addBasicChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	data.forEach((item, idx) => {
		const chartTitleBase = getChartTitle(item.name);
		const suffixMatch = item.name.match(/(avg|sum|unique)$/i); // `avg`, `sum`, `unique`가 있으면 매치
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: ""; // 각 조건에 맞는 텍스트로 변환

		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`; // 조건에 맞는 경우만 텍스트 추가

		let baseSheetName = `${idx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		// 중복된 시트 이름이 있을 경우 고유한 이름을 만들기 위해 숫자 추가
		let counter = 1;
		while (sheetNames.includes(sheetName)) {
			sheetName = `${baseSheetName}_${counter}`;
			counter++;
		}

		sheetNames.push(sheetName);
		const worksheet = workbook.addWorksheet(sheetName);

		const firstKey = Object.keys(item.indicate[0])[0];
		const titleRow = worksheet.addRow([chartTitle]);
		const header = [
			firstKey,
			...Array.from({ length: 4 }).map((_, index) =>
				item.regionName && index === 0 ? item.regionName : "-",
			),
		];

		const lastColumn = String.fromCharCode(64 + header.length);
		worksheet.mergeCells(`A1:${lastColumn}1`);

		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		// 지역추가
		const regionNameRowData = [];
		for (let regionIndex = 0; regionIndex < 3; regionIndex++) {
			const region = data[regionIndex];
			regionNameRowData.push(region ? region.regionName || "" : "");
		}
		const regionNameRow = worksheet.addRow(regionNameRowData);
		regionNameRow.eachCell((cell) => {
			cell.font = { size: 10, bold: true };
			cell.alignment = { horizontal: "center" };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EEEEEE" } };
		});

		worksheet.addRow(header);
		header.forEach((_, colIndex) => {
			worksheet.getColumn(colIndex + 1).width = 20;
			const headerCell = worksheet.getCell(2, colIndex + 1);
			headerCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			headerCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			headerCell.alignment = { horizontal: "center" };
		});

		item.indicate.forEach((row) => {
			let rowData = Object.values(row);
			if (rowData.length < 5) {
				rowData = [...rowData, ...Array(5 - rowData.length).fill("-")];
			}
			const newRow = worksheet.addRow(rowData);
			newRow.eachCell((cell) => {
				cell.alignment = { horizontal: "right" };
				cell.font = { size: 10 };
			});
		});
	});
};

// 기본차트 범례有
const addBasicChartLegend = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	data.forEach((item, idx) => {
		const chartTitleBase = getChartTitle(item.name);
		const suffixMatch = item.name.match(/(avg|sum|unique)$/i); // `avg`, `sum`, `unique`가 있으면 매치
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: ""; // 각 조건에 맞는 텍스트로 변환

		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`; // 조건에 맞는 경우만 텍스트 추가

		let baseSheetName = `${idx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		// 중복된 시트 이름이 있을 경우 고유한 이름을 만들기 위해 숫자 추가
		let counter = 1;
		while (sheetNames.includes(sheetName)) {
			sheetName = `${baseSheetName}_${counter}`;
			counter++;
		}

		const worksheet = workbook.addWorksheet(sheetName);
		// 타이틀 행 추가 및 병합
		const titleRow = worksheet.addRow([chartTitle]);
		const lastColumn = String.fromCharCode(64 + 6); // 첫 행의 열 병합을 위해 설정
		worksheet.mergeCells(`A1:${lastColumn}1`);
		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		// 첫 번째 항목의 첫 번째 키를 동적으로 추출하여 첫 열로 설정
		const firstKey = Object.keys(item.indicate[0])[0];
		const header = [
			"firstKey",
			"",
			...Array.from({ length: 4 }).map((_, index) =>
				item.regionName && index === 0 ? item.regionName : "-",
			),
		];
		const headerRow = worksheet.addRow(header);

		// 첫 번째 키의 병합 및 스타일 설정
		worksheet.mergeCells("A2:B2");
		const mergedHeaderCell = worksheet.getCell("A2");
		mergedHeaderCell.value = firstKey;
		mergedHeaderCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
		mergedHeaderCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "DDDDDD" },
		};
		mergedHeaderCell.alignment = { horizontal: "center" };

		// 지역 추가
		const regionNameRowData = [];
		for (let regionIndex = 0; regionIndex < 3; regionIndex++) {
			const region = data[regionIndex];
			regionNameRowData.push(region ? region.regionName || "" : "");
		}
		const regionNameRow = worksheet.addRow(regionNameRowData);
		regionNameRow.eachCell((cell) => {
			cell.font = { size: 10, bold: true };
			cell.alignment = { horizontal: "center" };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EEEEEE" } };
		});

		// 지역 번호 셀 스타일 적용
		header.slice(2).forEach((_, colIndex) => {
			const headerCell = worksheet.getCell(2, colIndex + 3);
			headerCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			headerCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			headerCell.alignment = { horizontal: "center" };
			worksheet.getColumn(colIndex + 3).width = 20;
		});

		// 데이터 행 추가
		item.indicate.forEach((row) => {
			const mainCategory = row[firstKey]; // 첫 번째 키를 기준으로 설정
			const subCategories = Object.keys(row).filter((key) => key !== firstKey);

			// 첫 번째 키에 해당하는 셀 병합
			const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
			const endRow = startRow + subCategories.length - 1;
			worksheet.mergeCells(`A${startRow}:A${endRow}`);
			const categoryCell = worksheet.getCell(`A${startRow}`);
			categoryCell.value = mainCategory;
			categoryCell.alignment = { vertical: "middle", horizontal: "center" };
			categoryCell.font = { size: 10 };

			// 각 서브 카테고리 및 데이터 값 추가
			subCategories.forEach((subCategory, index) => {
				const rowIndex = startRow + index;
				const subCategoryCell = worksheet.getCell(`B${rowIndex}`);
				const dataCell = worksheet.getCell(`C${rowIndex}`);

				subCategoryCell.value = subCategory;
				subCategoryCell.alignment = { horizontal: "center" };
				subCategoryCell.font = { size: 10 };

				dataCell.value = row[subCategory] !== undefined ? row[subCategory] : "-";
				dataCell.alignment = { horizontal: "right" };
				dataCell.font = { size: 10 };
			});
		});
	});
};

//비교
const addCompareChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	data.forEach((item, idx) => {
		const chartTitleBase = getChartTitle(item.name);
		const suffixMatch = item.name.match(/(avg|sum|unique)$/i); // `avg`, `sum`, `unique`가 있으면 매치
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: ""; // 각 조건에 맞는 텍스트로 변환

		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`; // 조건에 맞는 경우만 텍스트 추가

		let baseSheetName = `${idx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		// 중복된 시트 이름이 있을 경우 고유한 이름을 만들기 위해 숫자 추가
		let counter = 1;
		while (sheetNames.includes(sheetName)) {
			sheetName = `${baseSheetName}_${counter}`;
			counter++;
		}
		const worksheet = workbook.addWorksheet(sheetName);

		const titleRow = worksheet.addRow([chartTitle]);
		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };
		const lastColumn = String.fromCharCode(64 + Object.keys(item.indicate[0]).length);
		worksheet.mergeCells(`A1:E1`);

		const firstKey = Object.keys(item.indicate[0])[0];

		// 지역 추가
		const regionNameRowData = [];
		for (let regionIndex = 0; regionIndex < 3; regionIndex++) {
			const region = data[regionIndex];
			regionNameRowData.push(region ? region.regionName || "" : "");
		}
		const regionNameRow = worksheet.addRow(regionNameRowData);
		regionNameRow.eachCell((cell) => {
			cell.font = { size: 10, bold: true };
			cell.alignment = { horizontal: "center" };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EEEEEE" } };
		});

		// 헤더 행 설정: 첫 번째 키와 각 지역별 이름으로 설정
		const headerRow = worksheet.addRow([
			firstKey,
			...Array.from({ length: 4 }).map((_, index) => item.indicate[index]?.[firstKey] || "-"),
		]);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			cell.alignment = { horizontal: "center" };
		});

		// 날짜별 데이터 행 추가
		const dates = Object.keys(item.indicate[0]).filter((key) => key !== firstKey);
		dates.forEach((date) => {
			const rowData = [
				date,
				...Array.from({ length: 4 }).map(
					(_, regionIndex) => item.indicate[regionIndex]?.[date] || "-",
				),
			];

			// 새로운 행 추가 및 스타일 설정
			const newRow = worksheet.addRow(rowData);
			newRow.eachCell((cell) => {
				cell.alignment = { horizontal: "right" };
				cell.font = { size: 10 };
			});
		});

		// 첫 번째 열 너비 설정
		worksheet.getColumn(1).width = 20; // '구분' 컬럼 너비 설정
		worksheet.columns.forEach((col, index) => {
			if (index > 0) col.width = 15; // 비교 지역 컬럼 너비 설정
		});
	});
};

//중첩차트
const addNestedChart = (workbook: ExcelJS.Workbook, data: MergedChartData[]) => {
	data.forEach((chart, chartIdx) => {
		// 접미사를 추출하여 텍스트 변환
		const suffixMatch = chart.name.match(/(avg|sum|unique)$/i);
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: ""; // 접미사가 없는 경우 빈 텍스트

		// 차트 제목 생성
		const chartTitle = `${getChartTitle(chart.name)}${suffixText ? ` (${suffixText})` : ""}`;
		const sheetName = `${chartIdx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		const worksheet = workbook.addWorksheet(sheetName);

		// 타이틀 행 추가 및 병합
		const titleRow = worksheet.addRow([chartTitle]);
		const lastColumn = String.fromCharCode(64 + 6);
		worksheet.mergeCells(`A1:${lastColumn}1`);
		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		const firstKey = Object.keys(chart.data[0].indicate[0])[0];
		const header = [
			firstKey,
			"",
			...Array.from({ length: 5 }).map((_, index) =>
				chart.data[index]?.regionName ? chart.data[index].regionName.toString() : "-",
			),
		];
		const headerRow = worksheet.addRow(header);

		// 첫 번째 키의 병합 및 스타일 설정
		worksheet.mergeCells("A2:B2");
		const mergedHeaderCell = worksheet.getCell("A2");
		mergedHeaderCell.value = firstKey;
		mergedHeaderCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
		mergedHeaderCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "DDDDDD" },
		};
		mergedHeaderCell.alignment = { horizontal: "center" };

		// 지역 번호 셀 스타일 적용
		header.slice(2).forEach((_, colIndex) => {
			const headerCell = worksheet.getCell(2, colIndex + 3);
			headerCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			headerCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			headerCell.alignment = { horizontal: "center" };
			worksheet.getColumn(colIndex + 3).width = 20;
		});

		// 데이터 행 추가
		chart.data[0].indicate.forEach((row) => {
			const mainCategory = row[firstKey];
			const subCategories = Object.keys(row).filter((key) => key !== firstKey);

			// 첫 번째 키에 해당하는 셀 병합
			const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
			const endRow = startRow + subCategories.length - 1;
			worksheet.mergeCells(`A${startRow}:A${endRow}`);
			const categoryCell = worksheet.getCell(`A${startRow}`);
			categoryCell.value = mainCategory;
			categoryCell.alignment = { vertical: "middle", horizontal: "center" };
			categoryCell.font = { size: 10 };

			// 각 서브 카테고리 및 데이터 값 추가
			subCategories.forEach((subCategory, index) => {
				const rowIndex = startRow + index;
				const subCategoryCell = worksheet.getCell(`B${rowIndex}`);
				subCategoryCell.value = subCategory;
				subCategoryCell.alignment = { horizontal: "center" };
				subCategoryCell.font = { size: 10 };

				// 지역별 데이터 값 추가
				Array.from({ length: 4 }).forEach((_, regionIndex) => {
					const dataCell = worksheet.getCell(rowIndex, regionIndex + 3);
					const value = chart.data[regionIndex]?.indicate.find(
						(i) => i[firstKey] === mainCategory,
					)?.[subCategory];
					dataCell.value = value !== undefined ? value : "-";
					dataCell.alignment = { horizontal: "right" };
					dataCell.font = { size: 10 };
				});
			});
		});
	});
};
// 비교화면 각차트 한 테이블 범례有
const addCompareChartMultipleLegend = (workbook: ExcelJS.Workbook, data: MergedChartData[]) => {
	data.forEach((chart, chartIdx) => {
		const chartTitle = getChartTitle(chart.name);
		let baseSheetName = `${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		// 중복된 시트 이름이 있는 경우 추가하지 않고 건너뜀
		if (sheetNames.includes(sheetName)) {
			return; // 이미 존재하는 시트는 추가하지 않음
		}

		// 고유한 시트 이름을 배열에 추가하여 중복 방지
		sheetNames.push(sheetName);

		const worksheet = workbook.addWorksheet(sheetName);

		// 타이틀 행 추가 및 병합
		const titleRow = worksheet.addRow([chartTitle]);
		const lastColumn = String.fromCharCode(64 + 6);
		worksheet.mergeCells(`A1:${lastColumn}1`);
		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		// 첫 번째 항목의 키를 동적으로 추출하여 첫 열로 설정
		const firstKey = Object.keys(chart.data[0].indicate[0])[0];
		const header = [
			firstKey,
			"",
			...Array.from({ length: 4 }).map((_, index) =>
				chart.data[index]?.regionName ? chart.data[index].regionName.toString() : "-",
			),
		];
		const headerRow = worksheet.addRow(header);

		// 첫 번째 키의 병합 및 스타일 설정
		worksheet.mergeCells("A2:B2");
		const mergedHeaderCell = worksheet.getCell("A2");
		mergedHeaderCell.value = firstKey;
		mergedHeaderCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
		mergedHeaderCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "DDDDDD" },
		};
		mergedHeaderCell.alignment = { horizontal: "center" };

		// 지역 번호 셀 스타일 적용
		header.slice(2).forEach((_, colIndex) => {
			const headerCell = worksheet.getCell(2, colIndex + 3);
			headerCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			headerCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			headerCell.alignment = { horizontal: "center" };
			worksheet.getColumn(colIndex + 3).width = 20;
		});

		// 데이터 행 추가
		chart.data[0].indicate.forEach((row) => {
			const mainCategory = row[firstKey];
			const subCategories = Object.keys(row).filter((key) => key !== firstKey);

			// 첫 번째 키에 해당하는 셀 병합
			const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
			const endRow = startRow + subCategories.length - 1;
			worksheet.mergeCells(`A${startRow}:A${endRow}`);
			const categoryCell = worksheet.getCell(`A${startRow}`);
			categoryCell.value = mainCategory;
			categoryCell.alignment = { vertical: "middle", horizontal: "center" };
			categoryCell.font = { size: 10 };

			// 각 서브 카테고리 및 데이터 값 추가
			subCategories.forEach((subCategory, index) => {
				const rowIndex = startRow + index;
				const subCategoryCell = worksheet.getCell(`B${rowIndex}`);
				subCategoryCell.value = subCategory;
				subCategoryCell.alignment = { horizontal: "center" };
				subCategoryCell.font = { size: 10 };

				// 지역별 데이터 값 추가
				Array.from({ length: 4 }).forEach((_, regionIndex) => {
					const dataCell = worksheet.getCell(rowIndex, regionIndex + 3);
					const value = chart.data[regionIndex]?.indicate.find(
						(i) => i[firstKey] === mainCategory,
					)?.[subCategory];
					dataCell.value = value !== undefined ? value : "-";
					dataCell.alignment = { horizontal: "right" };
					dataCell.font = { size: 10 };
				});
			});
		});
	});
};

// 비교화면 각차트
const addCompareChartMultiple = (workbook: ExcelJS.Workbook, data: MergedChartData[]) => {
	data.forEach((chart, chartIdx) => {
		const chartTitle = getChartTitle(chart.name);
		let baseSheetName = `${chartIdx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		// 중복된 시트 이름이 있는 경우 추가하지 않고 건너뜀
		if (sheetNames.includes(sheetName)) {
			return; // 이미 존재하는 시트는 추가하지 않음
		}

		// 고유한 시트 이름을 배열에 추가하여 중복 방지
		sheetNames.push(sheetName);

		const worksheet = workbook.addWorksheet(sheetName);

		// 타이틀 행 추가 및 병합
		const titleRow = worksheet.addRow([chartTitle]);
		const lastColumn = String.fromCharCode(64 + 6);
		worksheet.mergeCells(`A1:${lastColumn}1`);
		titleRow.getCell(1).font = { bold: true, size: 11 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		// 첫 번째 항목의 키를 동적으로 추출하여 첫 열로 설정
		const firstKey = Object.keys(chart.data[0].indicate[0])[0];
		const header = [
			firstKey,
			"",
			...Array.from({ length: 4 }).map((_, index) =>
				chart.data[index]?.regionName ? chart.data[index].regionName.toString() : "-",
			),
		];
		const headerRow = worksheet.addRow(header);

		// 첫 번째 키의 병합 및 스타일 설정
		worksheet.mergeCells("A2:B2");
		const mergedHeaderCell = worksheet.getCell("A2");
		mergedHeaderCell.value = firstKey;
		mergedHeaderCell.font = { bold: true, color: { argb: "333333" }, size: 10 };
		mergedHeaderCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "DDDDDD" },
		};
		mergedHeaderCell.alignment = { horizontal: "center" };

		chart.data[0].indicate.forEach((row) => {
			const mainCategory = row[firstKey];
			const subCategories = Object.keys(row).filter((key) => key !== firstKey);

			// 첫 번째 키에 해당하는 셀 병합
			const startRow = worksheet.lastRow ? worksheet.lastRow.number + 1 : 1;
			const endRow = startRow + subCategories.length - 1;
			worksheet.mergeCells(`A${startRow}:A${endRow}`);
			const categoryCell = worksheet.getCell(`A${startRow}`);
			categoryCell.value = mainCategory;
			categoryCell.alignment = { vertical: "middle", horizontal: "center" };
			categoryCell.font = { size: 10 };

			// 최대 4개의 데이터 값 설정 및 "-"로 채우기
			subCategories.forEach((subCategory, index) => {
				const rowIndex = startRow + index;
				const subCategoryCell = worksheet.getCell(`B${rowIndex}`);
				subCategoryCell.value = subCategory;
				subCategoryCell.alignment = { horizontal: "center" };
				subCategoryCell.font = { size: 10 };

				// 각 지역의 데이터 값 추가
				Array.from({ length: 4 }).forEach((_, regionIndex) => {
					const dataCell = worksheet.getCell(rowIndex, regionIndex + 3);
					const value = chart.data[regionIndex]?.indicate.find(
						(i) => i[firstKey] === mainCategory,
					)?.[subCategory];
					dataCell.value = value !== undefined ? value : "-";
					dataCell.alignment = { horizontal: "right" };
					dataCell.font = { size: 10 };
				});
			});
		});

		// 첫 번째 열 너비 설정
		worksheet.getColumn(1).width = 20; // 첫 번째 열 너비 설정
		worksheet.columns.forEach((col, index) => {
			if (index > 0) col.width = 15; // 비교 지역 열 너비 설정
		});
	});
};

// 각표
const addSingleChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	const groupedData = data.reduce(
		(acc, item) => {
			const key = item.name;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, BaseChartData[]>,
	);

	Object.keys(groupedData).forEach((name, idx) => {
		const items = groupedData[name].map((item) => ({
			...item, // 원본 객체를 복사
			indicate: [...(item.indicate || [])], // indicate 배열 복사
		}));

		if (!items[0]?.indicate || items[0].indicate.length === 0) {
			return;
		}

		const allKeys = new Set<string>();
		items.forEach((item) => {
			item.indicate.forEach((row) => {
				Object.keys(row).forEach((key) => {
					allKeys.add(key);
				});
			});
		});

		items.forEach((item) => {
			item.indicate = item.indicate.map((row) => {
				const adjustedRow: Record<string, any> = {};
				allKeys.forEach((key) => {
					adjustedRow[key] = row[key] !== undefined ? row[key] : "-";
				});
				return adjustedRow;
			});
		});

		const chartTitleBase = getChartTitle(name);
		const suffixMatch = name.match(/(avg|sum|unique)$/i); // `avg`, `sum`, `unique`가 있으면 매치
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: ""; // 각 조건에 맞는 텍스트로 변환
		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`; // 조건에 맞는 경우만 텍스트 추가
		let baseSheetName = `${idx + 1}-${chartTitle.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		let worksheet = workbook.getWorksheet(sheetName);
		let headerKeys: string[] = [];

		if (!worksheet) {
			worksheet = workbook.addWorksheet(sheetName);

			const titleRow = worksheet.addRow([chartTitle]);
			// 헤더를 결정 (indicate[0]이 없으면 첫 번째 데이터의 헤더 사용)
			headerKeys = Object.keys(items[0].indicate[0] ?? items[0]);

			const lastColumn = String.fromCharCode(64 + headerKeys.length);
			worksheet.mergeCells(`A1:${lastColumn}1`);

			titleRow.getCell(1).font = { bold: true, size: 11 };
			titleRow.getCell(1).alignment = { horizontal: "center" };
		} else {
			worksheet.addRow([]);
			worksheet.addRow([]);
			// 헤더를 결정 (indicate[0]이 없으면 첫 번째 데이터의 헤더 사용)
			headerKeys = Object.keys(items[0].indicate[0] ?? items[0]);
		}

		const regionNameRowData = [];
		for (let regionIndex = 0; regionIndex < 3; regionIndex++) {
			const region = data[regionIndex];
			regionNameRowData.push(region ? region.regionName || "" : "");
		}
		const regionNameRow = worksheet.addRow(regionNameRowData);
		regionNameRow.eachCell((cell) => {
			cell.font = { size: 10, bold: true };
			cell.alignment = { horizontal: "center" };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EEEEEE" } };
		});

		const headerRow = worksheet.addRow(headerKeys);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			cell.alignment = { horizontal: "center" };
		});

		items.forEach((item) => {
			const rows = item.indicate.length > 0 ? item.indicate : [item]; // 데이터가 없으면 `item` 자체를 행으로 사용

			rows.forEach((row) => {
				let rowData = Object.values(row);

				if (rowData.length < headerKeys.length) {
					rowData = [...rowData, ...Array(headerKeys.length - rowData.length).fill("-")];
				}

				const newRow = worksheet.addRow(rowData);
				newRow.eachCell((cell) => {
					cell.alignment = { horizontal: "right" };
					cell.font = { size: 10 };
				});
			});
		});

		headerKeys.forEach((_, colIndex) => {
			worksheet.getColumn(colIndex + 1).width = 20;
		});
	});
};

//생활이동 랭킹분석 스캐터차트
const assMopScatterCahrt = (workbook: ExcelJS.Workbook, data: MergedChartData[]) => {
	data.forEach((chart, chartIdx) => {
		const chartTitle = getChartTitle(chart.name);
		const sheetName = `${chartIdx + 1}-${chartTitle?.replace(/[\/:*?[\]]/g, "_")}`;
		const worksheet = workbook.addWorksheet(sheetName);

		// 타이틀 행 생성 및 병합
		const titleRow = worksheet.addRow([chartTitle]);
		worksheet.mergeCells(`A1:${String.fromCharCode(65 + chart.data.length)}1`);
		titleRow.getCell(1).font = { bold: true, size: 12 };
		titleRow.getCell(1).alignment = { horizontal: "center" };

		const allHeaders = chart.data.flatMap((regionData) =>
			regionData.indicate.flatMap((item) => Object.keys(item).filter((key) => key !== "구분")),
		);
		const uniqueHeaders = ["구분"];
		allHeaders.forEach((key) => {
			if (!uniqueHeaders.includes(key)) {
				uniqueHeaders.push(key);
			}
		});

		// 여긴 엑셀로 뽑아봐야알듯?
		const regionNameRowData = [];
		for (let regionIndex = 0; regionIndex < chartIdx; regionIndex++) {
			const region = chart.data[regionIndex];
			const fullRegion = region.regionName.split(" ");
			const city = fullRegion[0];
			const sigugun = fullRegion[1];
			const adm = fullRegion[2];
			regionNameRowData.push(region ? `${city} ${sigugun || ""} ${adm || ""}` || "지역명" : "-");
		}
		const regionNameRow = worksheet.addRow(regionNameRowData);
		regionNameRow.eachCell((cell) => {
			cell.font = { size: 10, bold: true };
			cell.alignment = { horizontal: "center" };
			cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EEEEEE" } };
		});

		const headerRow = worksheet.addRow(uniqueHeaders);
		headerRow.eachCell((cell, colIndex) => {
			cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			cell.alignment = { horizontal: "center" };
			worksheet.getColumn(colIndex).width = 20;
		});

		// 데이터 행 생성
		chart.data.forEach((regionData) => {
			regionData.indicate.forEach((item) => {
				const row = [item["구분"]]; // 첫 번째 열에 '구분' 값
				const rowValues = Object.entries(item)
					.filter(([key]) => key !== "구분") // 구분 제외 나머지 값들
					.map(([, value]) => (value !== undefined ? value : "-"));
				row.push(...rowValues);

				worksheet.addRow(row).eachCell((cell) => {
					cell.alignment = { horizontal: "right" };
					cell.font = { size: 10 };
				});
			});
		});
	});
};

// 히트맵 차트
const addHeatmapChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	const groupedData = data.reduce(
		(acc, item) => {
			const key = item.name;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, BaseChartData[]>,
	);

	Object.keys(groupedData).forEach((name, idx) => {
		const items = groupedData[name];
		if (!items[0]?.indicate || items[0].indicate.length === 0) {
			return; // 데이터가 없는 경우 건너뛰기
		}

		const chartTitleBase = getChartTitle(name);
		const chartTitle = `${chartTitleBase}`;
		let sheetName = `${idx + 1}-${chartTitle.replace(/[\/:*?[\]]/g, "_")}`;

		// 기존 시트를 가져오거나 새로 생성
		let worksheet = workbook.getWorksheet(sheetName);
		if (!worksheet) {
			worksheet = workbook.addWorksheet(sheetName);

			// 제목 행 추가 및 병합
			const titleRow = worksheet.addRow([chartTitle]);
			const lastColumn = String.fromCharCode(64 + 4); // 예: A-D까지
			worksheet.mergeCells(`A1:${lastColumn}1`);

			titleRow.getCell(1).font = { bold: true, size: 11 };
			titleRow.getCell(1).alignment = { horizontal: "center" };
		}

		const heatmapKeys = Object.keys(items[0].indicate[0]) as [string, string, string];
		const regionKey = heatmapKeys[0];
		const timeKey = heatmapKeys[1];
		const heatmapValueKey = heatmapKeys[2];

		items.forEach((item, dataIdx) => {
			worksheet.addRow([]);
			const groupTitleRow = worksheet.addRow([``]);
			groupTitleRow.getCell(1).font = { bold: true, size: 10 };
			groupTitleRow.getCell(1).alignment = { horizontal: "center" };

			const regions = Array.from(
				new Set(item.indicate.map((row) => row[regionKey] as string)),
			).sort();

			const times = Array.from(new Set(item.indicate.map((row) => row[timeKey] as string))).sort(
				(a, b) => parseInt(a) - parseInt(b),
			);

			// 헤더 추가
			const headerRow = worksheet.addRow([regionKey, ...times]);
			headerRow.eachCell((cell) => {
				cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "DDDDDD" },
				};
				cell.alignment = { horizontal: "center" };
			});

			// 각 지역별 데이터 행 추가
			regions.forEach((region) => {
				const rowData = [region];

				times.forEach((time) => {
					const regionData = item.indicate.find(
						(row) => row[regionKey] === region && row[timeKey] === time,
					);
					rowData.push(regionData ? regionData[heatmapValueKey]?.toLocaleString("ko-KR") : "-");
				});

				const newRow = worksheet.addRow(rowData);
				newRow.eachCell((cell) => {
					cell.alignment = { horizontal: "right" };
					cell.font = { size: 10 };
				});
			});
		});

		// 각 열 너비 설정
		worksheet.columns.forEach((column) => {
			column.width = 20;
		});
	});
};

// 생키 양방향 차트
const addSankeyChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	const groupedData = data.reduce(
		(acc, item) => {
			const key = item.name;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, BaseChartData[]>,
	);

	Object.keys(groupedData).forEach((name, idx) => {
		const items = groupedData[name];
		const chartTitleBase = getChartTitle(name);
		const suffixMatch = name.match(/(avg|sum|unique)$/i);
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: "";
		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`;
		let baseSheetName = `${idx + 1}-${chartTitle.replace(/[\/:*?[\]]/g, "_")}`;
		let sheetName = baseSheetName;

		let worksheet = workbook.getWorksheet(sheetName);
		let headerKeys: string[] = [];
		let allKeys: string[] = []; // allKeys 정의 추가

		if (!worksheet) {
			worksheet = workbook.addWorksheet(sheetName);

			const titleRow = worksheet.addRow([chartTitle]);

			// 첫 번째 데이터 항목의 키를 기반으로 헤더를 동적으로 추출하되 두 번째 키를 제외
			allKeys = Object.keys(items[0].indicate[0] ?? {}); // allKeys 설정
			headerKeys = [allKeys[0], ...allKeys.slice(2)]; // 첫 번째와 세 번째 이후의 키들만 사용
			const lastColumn = String.fromCharCode(64 + headerKeys.length);
			worksheet.mergeCells(`A1:${lastColumn}1`);

			titleRow.getCell(1).font = { bold: true, size: 11 };
			titleRow.getCell(1).alignment = { horizontal: "center" };

			const regionInfo = items[0].regionName || "";
			const subTitle = worksheet.addRow([regionInfo]);
			subTitle.getCell(1).font = { bold: true, size: 10 };
			subTitle.getCell(1).alignment = { horizontal: "center" };
			worksheet.mergeCells(`A2:${lastColumn}2`);
		} else {
			worksheet.addRow([]);
			worksheet.addRow([]);
			// 기존 헤더 설정 유지 및 두 번째 키 제외
			allKeys = Object.keys(items[0].indicate[0] ?? {}); // allKeys 설정
			headerKeys = [allKeys[0], ...allKeys.slice(2)]; // 첫 번째와 세 번째 이후의 키들만 사용
		}

		// 헤더 행 추가
		const headerRow = worksheet.addRow(headerKeys);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			cell.alignment = { horizontal: "center" };
		});

		// 데이터 행 추가
		items.forEach((item) => {
			item.indicate.forEach((row) => {
				const firstValue = row[headerKeys[0]]?.toString().replace(/유출|유입/g, "") ?? "-";
				const secondValue = row[allKeys[1]]?.toString().replace(/유출|유입/g, "") ?? "-";
				const combinedValue = `${firstValue} -> ${secondValue}`;

				// 헤더 키에 따라 나머지 값 매핑
				const rowData = [combinedValue, ...headerKeys.slice(1).map((key) => row[key] ?? "-")];

				const newRow = worksheet.addRow(rowData);
				newRow.eachCell((cell) => {
					cell.alignment = { horizontal: "right" };
					cell.font = { size: 10 };
				});
			});
		});

		// 열 너비 설정
		headerKeys.forEach((_, colIndex) => {
			worksheet.getColumn(colIndex + 1).width = 30;
		});
	});
};

// 생키 단방향 차트
const addSingleSankeyChart = (workbook: ExcelJS.Workbook, data: BaseChartData[]) => {
	const isOutflow = data[0].name.toLowerCase().includes("out");
	const groupedData = data.reduce(
		(acc, item) => {
			const key = item.name;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(item);
			return acc;
		},
		{} as Record<string, BaseChartData[]>,
	);

	Object.keys(groupedData).forEach((name) => {
		const items = groupedData[name];
		const chartTitleBase = getChartTitle(name);
		const suffixMatch = name.match(/(avg|sum|unique)$/i);
		const suffixText = suffixMatch
			? suffixMatch[0].toLowerCase() === "sum"
				? "누적"
				: suffixMatch[0].toLowerCase() === "avg"
					? "평균"
					: "유니크"
			: "";
		const chartTitle = `${chartTitleBase}${suffixText ? ` (${suffixText})` : ""}`;
		const sheetName = chartTitle.replace(/[\/:*?[\]]/g, "_"); // `chartTitle`을 시트 이름으로 사용

		// 시트가 이미 존재하는지 확인하고, 없다면 새로 생성
		let worksheet = workbook.getWorksheet(sheetName);
		let headerKeys: string[] = [];

		if (!worksheet) {
			worksheet = workbook.addWorksheet(sheetName);

			const titleRow = worksheet.addRow([chartTitle]);
			headerKeys = Object.keys(items[0].indicate[0] ?? {}); // 사용자의 헤더 설정 방식 유지
			const lastColumn = String.fromCharCode(64 + headerKeys.length);
			worksheet.mergeCells(`A1:${lastColumn}1`);

			titleRow.getCell(1).font = { bold: true, size: 11 };
			titleRow.getCell(1).alignment = { horizontal: "center" };

			const regionInfo = items[0].regionName || "";
			const subTitle = worksheet.addRow([regionInfo]);
			subTitle.getCell(1).font = { bold: true, size: 10 };
			subTitle.getCell(1).alignment = { horizontal: "center" };
			worksheet.mergeCells(`A2:${lastColumn}2`);
		} else {
			// 기존 시트의 경우, 새로운 데이터 그룹을 위한 헤더 추가
			headerKeys = Object.keys(items[0].indicate[0] ?? {});
		}

		// 헤더 추가 (새로운 데이터 그룹마다 추가)
		const headerRow = worksheet.addRow(headerKeys);
		headerRow.eachCell((cell) => {
			cell.font = { bold: true, color: { argb: "333333" }, size: 10 };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "DDDDDD" },
			};
			cell.alignment = { horizontal: "center" };
		});

		// 데이터 행 추가
		items.forEach((item) => {
			const removeEjection = (name?: string) => {
				return typeof name === "string" ? name.replace(/ (유출|유입)$/, "") : "";
			};

			const regionName = removeEjection(item.regionName);

			item.indicate.forEach((row) => {
				const rowData = headerKeys.map((key) => {
					if (key === "구분") {
						// 구분 필드에도 removeEjection 적용
						const cleanedCategory = removeEjection(row["구분"] as string);
						const displayText = isOutflow
							? `${regionName} -> ${cleanedCategory}`
							: `${cleanedCategory} -> ${regionName}`;
						return `${displayText}`;
					}
					return row[key] ?? "-";
				});

				const newRow = worksheet.addRow(rowData);
				newRow.eachCell((cell) => {
					cell.alignment = { horizontal: "right" };
					cell.font = { size: 10 };
				});
			});
		});

		// 열 너비 설정
		headerKeys.forEach((_, colIndex) => {
			worksheet.getColumn(colIndex + 1).width = 20;
		});
	});
};

/**
 * 리포트 발급
 * @param reportName
 */
export const ExportReportToPdf = async (reportName: string) => {
	const reportEl = document.getElementById("report");
	const reportTitleEl = document.getElementById("report-title");
	const reportMap = document.getElementById("deckgl-overlay") as HTMLCanvasElement;
	const reportContentsEls = document.querySelectorAll("#report .report-contents");

	if (!reportEl || !reportTitleEl) return;

	const originalPositions = new Map<Element, string>();

	const textNodes = getTextNodes(reportEl);
	textNodes.forEach((textNode) => {
		const parent = textNode.parentElement;
		if (parent) {
			if (!originalPositions.has(parent)) {
				originalPositions.set(parent, parent.style.position || "");
			}
			parent.style.position = "relative";
			parent.style.top = "0px";
			// (parent.style as CSSStyleDeclaration).position = "relative";
			// parent.style.top = "-10px"; // 텍스트 위치 보정
		}
	});

	const excludedElements = document.querySelectorAll(".exclude");
	excludedElements.forEach((el) => el.classList.add("hidden"));

	const reportTitle = await html2canvas(reportTitleEl, {
		allowTaint: true,
		useCORS: true,
		scale: 2,
	});
	const reportTitleImg = reportTitle.toDataURL("image/png", 1.0);

	const doc = new jsPDF("p", "mm", "a4", true);
	const imgWidth = 210; // A4 width in mm
	const imgHeight = (reportTitle.height * imgWidth) / reportTitle.width;
	const padding = 5;

	doc.addImage(reportTitleImg, "PNG", padding, padding, imgWidth - padding * 2, imgHeight);
	let curHeight = imgHeight + padding * 2;

	if (reportMap) {
		const reportMapImg = reportMap.toDataURL("image/png", 1.0);
		const mapImgHeight = (reportMap.height * imgWidth) / reportMap.width;

		doc.addImage(reportMapImg, "PNG", padding, curHeight, 200, mapImgHeight);
	}

	for (const reportContentsEl of Array.from(reportContentsEls)) {
		const canvas = await html2canvas(reportContentsEl as HTMLElement, {
			allowTaint: true,
			useCORS: true,
			logging: false,
			scale: 2,
			y: window.scrollY,
		});

		const img = canvas.toDataURL("image/png", 1.0);
		const imageHeight = (canvas.height * imgWidth) / canvas.width;

		// 현재 페이지의 높이와 이미지의 높이를 비교하여 페이지를 추가
		if (curHeight + imageHeight > doc.internal.pageSize.height - padding) {
			doc.addPage();
			curHeight = padding;
		}

		doc.addImage(img, "PNG", padding, curHeight, 200, imageHeight);
		curHeight += imageHeight;
	}

	doc.save(`${reportName}.pdf`);

	textNodes.forEach((textNode) => {
		const parent = textNode.parentElement;
		if (parent && originalPositions.has(parent)) {
			parent.style.position = originalPositions.get(parent) || "";
			parent.style.top = "";
		}
		// if (parent) {
		// 	parent.style.top = "";
		// }
	});
	excludedElements.forEach((el) => el.classList.remove("hidden"));
};

// 리포트 요소 내부 텍스트 노드들을 찾는 함수
function getTextNodes(parentElement: HTMLElement): Text[] {
	const textNodes: Text[] = [];

	function findTextNodes(node: Node): void {
		node.childNodes.forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
				textNodes.push(child as Text);
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				findTextNodes(child);
			}
		});
	}

	findTextNodes(parentElement);
	return textNodes;
}

