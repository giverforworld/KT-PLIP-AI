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
	convertedToPieChartData,
	convertedToReportPieChartData,
	convertedToStackChartData,
	percentValueChart,
	scatterGraphic,
} from "@/constants/chart/chartFilter";
import { formatDateChart } from "@/utils/chartUtils";

type Datatype = {
	x: string[];
	y: {
		[key: string]: number[];
	};
};

// ECharts에서 params의 타입 정의
type TooltipParams = {
	seriesIndex: number;
	dataIndex: number;
	data: any;
};

type IndicateA = { [key: string]: string | number }[];
type IndicateB = { [key: string]: string | number };

// 파이차트로 변환하기 위해 데이터 구조 변경
function convertBtoA(convertedData: IndicateB, categoryField: string): IndicateA {
	const indicateA: IndicateA = [];

	Object.keys(convertedData).forEach((key) => {
		if (key !== categoryField) {
			indicateA.push({
				[categoryField]: key,
				[convertedData[categoryField] as string]: convertedData[key],
			});
		}
	});

	return indicateA;
}

// 스택차트로 변환하기 위해 데이터 구조 변경
function convertAtoB(indicateA: IndicateA, categoryField: string, valueField: string): IndicateB {
	const indicateB: IndicateB = {
		[categoryField]: valueField,
	};

	indicateA.forEach((item) => {
		const key = item[categoryField] as string;
		const value = item[valueField];
		indicateB[key] = value;
	});

	return indicateB;
}

// 리턴값 에러 방지
function isValidChartData(data: MergedChartData | BaseChartData | undefined): boolean {
	if (!data) return false;

	if ("data" in data && Array.isArray(data.data) && data.data.length > 0) {
		return true;
	}

	if ("indicate" in data && Array.isArray(data.indicate) && data.indicate.length > 0) {
		return true;
	}

	return false;
}

export function ChartOption({
	//bar, stack, line, horizontal chart option
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};
	let indicate = (data as BaseChartData)?.indicate;

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const converted = convertedToStackChartData.includes(data.name);
	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : null;
	const perUnit = chartUnit === "%";
	const percentTotal = percentValueChart.includes(data.name);

	if (converted) {
		const valueField = Object.keys(indicate[0]).find((key) => key !== xlabel);
		if (valueField) {
			indicate = [convertAtoB(indicate, xlabel, valueField)];
		}
	}
	const allKeys = new Set<string>();
	indicate?.forEach((d) => {
		Object.keys(d).forEach((key) => {
			allKeys.add(key); // 전체 키 모으기
		});
	});

	indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);

		allKeys.forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				// 누락된 키는 undefined로 채움
				yData[key].push(d[key] !== undefined ? d[key] : undefined);
			}
		});
	});

	const totalData: number[] = [];
	let totalValue: number = 0;
	for (let i = 0; i < xData.length; i++) {
		let sum = 0;
		Object.keys(yData).forEach((key) => {
			sum += yData[key][i];
		});
		totalData.push(sum);
		totalValue += sum;
	}

	if (perUnit && !isExceptionalChart) {
		Object.keys(yData).forEach((key) => {
			yData[key] = yData[key].map((value, index) => {
				const total = percentTotal ? totalValue : totalData[index];
				// 값이 합계 대비 몇 퍼센트인지 계산
				return total ? (value / total) * 100 : 0;
			});
		});
	}
	Object.keys(yData).forEach((item) => {
		const isStackChart = type === "stack";
		const serieLength = yData[item].length; // 라인 차트일때 값 1개일 경우 예외 처리
		const serie: Series = {
			name: item,
			type: type === "stack" ? "bar" : type,
			data: yData[item],
			stack: type === "stack" ? "total" : "",
			label: {
				// show: isStackChart ? true : Boolean(chartLabelShow),
				show: chartLabelShow ? true : false,
				position: isStackChart ? "inside" : "top",
				color: "#333333",
				fontWeight: "500",
				fontSize: 12,
				formatter: (params: any) => {
					const value = Array.isArray(params.value) ? params.value[0] : params.value;
					if (isExceptionalChart) {
						const total = totalData[params.dataIndex];
						if (typeof value === "number") {
							if (perUnit) {
								const percentage = total ? (value / total) * 100 : 0;
								return percentage % 1 === 0
									? `${Math.floor(percentage).toLocaleString()}%`
									: `${percentage.toFixed(1)}%`;
							}
							return value.toLocaleString();
						}
						return value;
					}
					if (perUnit) {
						const formattedValue =
							value % 1 === 0 ? Math.floor(value).toLocaleString() : value.toFixed(1);
						return `${formattedValue}%`;
					}

					if (typeof value === "number") {
						return value < 1 && value !== 0 ? value.toFixed(1) : Math.floor(value).toLocaleString();
					}

					return value;
				},
			},
			labelLayout: {
				hideOverlap: true,
			},

			barWidth: "",
			...(type === "line" && {
				symbol: "circle",
				symbolSize: chartLabelShow || serieLength === 1 ? 5 : 0,
				showSymbol: chartLabelShow || serieLength === 1 ? true : false,
			}),
		};

		if (converted) {
			serie.itemStyle = {
				color: (params: any) => {
					return color[params.seriesIndex % color.length];
				},
			};
		}
		series.push(serie);
	});

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 0, 5],
			itemGap: 7,
		},
		x: xData,
		series: series,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				if (typeof value !== "number") {
					return `${value}`;
				}

				if (isExceptionalChart) {
					return Math.floor(value).toLocaleString();
				}
				// 다른곳 더 확인해봐야함

				if (perUnit) {
					const formattedValue =
						value % 1 === 0 ? Math.floor(value).toLocaleString() : value.toFixed(1);
					return `${formattedValue}%`;
				}

				return Math.floor(value).toLocaleString();
			},
		},
		grid: {},
		color: color,
		dataZoom: {},
		dataSwipe: dataSwipe,
		dataBox: data,
		isExceptionalChart: isExceptionalChart,
		chartUnit: chartUnit,
	};
}

export function DynamicOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	chartLabelShow,
	labels,
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: { [key: string]: number[] } = {};
	let indicate = (data as BaseChartData)?.indicate;

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const converted = convertedToStackChartData.includes(data.name);
	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : null;
	indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);
		labels?.forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				if (key in d) {
					yData[key].push(d[key]);
				}
			}
		});
	});
	Object.keys(yData).forEach((item) => {
		const serie: Series = {
			name: item,
			type: type,
			data: yData[item],
			stack: "",
			label: {
				show: Boolean(chartLabelShow),
				position: "top",
				color: "#333333",
				fontWeight: "500", // 라벨 폰트 굵기
				fontSize: 12,
				formatter: (params: any) => {
					const value = params.value;
					if (value === null || value === undefined) return "";
					if (value < 1 && value !== 0) return value.toFixed(3);
					return Math.floor(value).toLocaleString();
				},
			},
			labelLayout: {
				hideOverlap: true,
			},

			barWidth: "",
			...(type === "line" && {
				symbol: "circle",
				symbolSize: chartLabelShow ? 5 : 0,
				showSymbol: !!chartLabelShow,
			}),
		};

		if (converted) {
			serie.itemStyle = {
				color: (params: any) => {
					// converted된 데이터에도 색상 적용
					return color[params.seriesIndex % color.length];
				},
			};
		}

		series.push(serie);
	});

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 0, 5],
			itemGap: 7,
		},
		x: xData,
		series: series,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: (params: any) => {
				// params는 각 시리즈 데이터의 배열
				const tooltipContent = params
					.filter((item: any) => item.value !== null && item.value !== undefined) // null, undefined 값 제거
					.map((item: any) => {
						const value =
							item.value < 1 && item.value !== 0
								? item.value.toFixed(3)
								: Math.floor(item.value).toLocaleString();
						return `${item.marker} ${item.seriesName}: ${value}`;
					})
					.join("<br/>");
				return tooltipContent || ""; // 모든 값이 null일 경우 빈 문자열 반환
			},
		},
		grid: {},
		color: color,
		dataZoom: {},
		dataSwipe: dataSwipe,
		dataBox: data,
	};
}

export function HorizontalOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	isExceptionalChart,
	chartLabelShow,
	chartHeight,
	chartUnit,
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : "";
	const perUnit = chartUnit === "%";

	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);
		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				yData[key].push(d[key]);
			}
		});
	});

	const totalSum = Object.values(yData)
		.flat()
		.reduce((sum, val) => sum + val, 0);

	Object.keys(yData).forEach((item) => {
		series.push({
			name: item,
			type: type === "horizontalBar" || type === "stack" ? "bar" : type,
			data: yData[item],
			label: {
				show: Boolean(chartLabelShow),
				position: "right",
				color: "#333333",
				fontWeight: "500",
				fontSize: 12,
				fontFamily: "Pretendard",
				formatter: (params: any) => {
					const value = Array.isArray(params.value) ? params.value[0] : params.value;

					// 전체 합계에서 백분율 계산
					if (isExceptionalChart) {
						if (typeof value === "number" && totalSum > 0) {
							const percentage = (value / totalSum) * 100;
							return percentage % 1 === 0
								? `${Math.floor(percentage).toLocaleString()}%`
								: `${percentage.toFixed(1)}%`;
						}
						return value;
					}

					if (perUnit) {
						const total = totalSum;
						if (typeof value === "number" && total > 0) {
							const percentage = (value / total) * 100;
							return percentage % 1 === 0
								? `${Math.floor(percentage).toLocaleString()}%`
								: `${percentage.toFixed(1)}%`;
						}
						return value;
					}

					if (typeof value === "number") {
						return value < 1 && value !== 0 ? value.toFixed(3) : Math.floor(value).toLocaleString();
					}

					return value;
				},
			},
			barWidth: "",
			labelLayout: {
				hideOverlap: true,
			},
		});
	});

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		x: xData,
		series: series,
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				return Math.floor(value).toLocaleString();
			},
		},
		color: color,
		grid: {},
		dataZoom: {},
		dataSwipe: dataSwipe,
		dataBox: data,
		chartHeight: chartHeight,
	};
}

export function FullStackOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
	// isTowDecimal & {isTowDecimal?: boolean}
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	let indicate = (data as BaseChartData)?.indicate;
	const converted = convertedToStackChartData.includes(data.name);
	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : "";

	// 데이터 구조 확인 및 변환 - 두 가지 형태 구분
	if (converted) {
		// 첫 번째 항목의 다른 필드명을 찾아서 valueField로 사용
		const valueField = Object.keys(indicate[0]).find((key) => key !== xlabel);
		if (valueField) {
			indicate = [convertAtoB(indicate, xlabel, valueField)];
		}
	}

	// x축과 y축 데이터 생성
	indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);
		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				yData[key].push(d[key]);
			}
		});
	});

	// 카테고리별 합계 계산
	const totalData: number[] = [];
	for (let i = 0; i < xData.length; i++) {
		let sum = 0;
		Object.keys(yData).forEach((key) => {
			sum += yData[key][i];
		});
		totalData.push(sum);
	}

	// 바 차트 소수점 2번째자리까지로 수정함
	Object.keys(yData).forEach((item) => {
		series.push({
			name: item,
			type: "bar",
			stack: "total",
			barWidth: "50%",
			label: {
				show: Boolean(chartLabelShow),
				position: "inside",
				color: "#333333",
				fontWeight: "500",
				fontSize: 12,
				formatter: (params: any) => {
					return `${(params.value * 100).toFixed(1)}%`;
				},
			},
			labelLayout: {
				hideOverlap: true,
			},
			data: yData[item].map((d, i) => (totalData[i] <= 0 ? 0 : d / totalData[i])),
		});
	});

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		xAxis: {
			type: "category",
			data: xData, // x축 데이터 설정
			axisTick: { show: false }, // 가로축 간격 표시
			axisLine: { show: false }, // 가로축 선 표시
			axisLabel: {
				show: true, // 라벨 표시
				interval: 0,
				hideOverlap: true,
				fontFamily: "Pretendard",
				color: "#75777F",
				formatter: (value: string) => {
					if (xData.length > 10) {
						const parts = formatDateChart(value).split(" ");
						return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
					}
					return formatDateChart(value);
				},
			},
		},
		yAxis: {
			type: "value",
			boundaryGap: [0, 0], // Y축 상하 여백 제거
			max: 1, // Y축 최대값을 1로 설정하여 100% 기준으로 표시
			axisLabel: {
				formatter: (value: number) => {
					let val: any = Math.abs(value);
					return val * 100 + "%"; // 퍼센트로 표시
				},
				show: true,
				fontFamily: "Pretendard",
				color: "#75777F",
			},
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: (params: any) => {
				let tooltipContent = `${params[0].name}<br/>`;
				params.forEach((param: any) => {
					const percentage = param.value * 100;
					tooltipContent += `${param.marker} ${param.seriesName}: ${percentage.toFixed(1)}`;
					// 툴팁도 2자리로 변경해야하는데... 이부분임.
					// tooltipContent += isTowDecimal
					// ?	tooltipContent += `${param.marker} ${param.seriesName}:${percentage.toFixed(2)}%<br/>`
					// :	tooltipContent += `${param.marker} ${param.seriesName}:${percentage.toFixed(1)}%<br/>`;
				});
				return tooltipContent;
			},
		},
		series: series,
		legend: {
			type: "scroll",
			icon: "circle",
			orient: "horizontal",
			bottom: 0,
			pageIconColor: "#009fe3",
			pageIconInactiveColor: "#e5e7eb",
			pageIconSize: [10, 10],
			pageTextStyle: {
				color: "#FFFFFF",
			},
		},
		grid: {
			top: regionName ? "10%" : "5%",
			bottom: "10%",
			left: "1%",
			right: "1%",
			containLabel: true,
		},
		color: color,
		dataZoom: {},
		dataSwipe: dataSwipe,
	};
}

export function PieOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
	isReport,
}: Readonly<ChartContext>) {
	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	let indicate = (data as BaseChartData)?.indicate;
	const converted = isReport
		? convertedToReportPieChartData.includes(data.name)
		: convertedToPieChartData.includes(data.name);

	// 데이터 구조 확인 및 변환 - 두 가지 형태 구분
	if (converted) {
		indicate = convertBtoA(indicate[0] as IndicateB, xlabel);
	}

	const valueKey = Object.keys(indicate[0]).find((key) => key !== xlabel);
	const pieSeries = indicate.map((d: any) => ({
		name: d[xlabel],
		value: d[valueKey as string],
	}));

	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : "";

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		tooltip: {
			trigger: "item",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: function (params: any) {
				const total = pieSeries.reduce((sum, item) => sum + item.value, 0);
				const percentage = ((params.value / total) * 100).toFixed(1);
				const formattedValue =
					params.value < 1 && params.value !== 0
						? params.value.toFixed(1)
						: Math.floor(params.value).toLocaleString("en-US");
				return `${params.marker} ${params.name}: ${formattedValue} (${percentage}%)`;
			},
		},
		series: [
			{
				name: title,
				type: "pie",
				radius: ["40%", "70%"],
				center: ["50%", "50%"],
				data: pieSeries,
				label: {
					color: "#333333",
					fontWeight: "500",
					fontSize: 12,
					show: Boolean(chartLabelShow),
					formatter: (params: any) => {
						const percentage = params.percent.toFixed(1);
						return `${percentage}%`;
					},
					position: "outside",
					distance: 1,
				},
				labelLayout: {
					hideOverlap: false, // 겹치는 라벨을 숨기지 않음
				},
				labelLine: {
					show: true, // 라벨 선 활성화
					length: 0, // 라벨 선 길이 0으로 설정
					length2: 5, // 라벨 선 끝에서 라벨까지의 거리
					lineStyle: {
						color: "transparent", // 라벨 선을 투명하게 설정
					},
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: "rgba(0, 0, 0, 0.5)",
					},
				},
			},
		],
		legend: {
			data: pieSeries.map((item: any) => item.name),
			bottom: "0%",
			width: "100%",
			icon: "circle",
			itemGap: 10,
			type: "scroll",
			orient: "horizontal",
			pageIconColor: "#009fe3",
			pageIconInactiveColor: "#e5e7eb",
			pageIconSize: [10, 10],
			pageTextStyle: {
				color: "#FFFFFF",
			},
		},
		color: color,
		dataBox: data,
	};
}

export function CustomPieOption({ data, color, summary }: Readonly<ChartContext>) {
	// 현재 사용하지않음
	function transformData(indicate: any, fieldKeys: { nameKey: string; valueKey: string }) {
		return indicate.map(function (item: any) {
			return {
				name: item[fieldKeys.nameKey],
				value: item[fieldKeys.valueKey],
			};
		});
	}

	// 필드명을 자동으로 추출하는 함수 (첫 번째 항목을 기준으로 분석)
	function getFieldKeys(data: any): { nameKey: string; valueKey: string } {
		const firstItem = data[0]; // 첫 번째 항목을 분석
		const keys = Object.keys(firstItem); // 모든 필드명 가져오기
		if (keys.length < 1) {
			throw new Error("데이터에 필요한 필드가 부족합니다.");
		}
		return {
			nameKey: keys[0], // 첫 번째 필드를 name으로 사용
			valueKey: keys[1], // 두 번째 필드를 value로 사용
		};
	}

	const datas = (data as MergedChartData).data.map(function (chart: any) {
		const fieldKeys = getFieldKeys(chart.indicate); // 필드명 자동 추출
		return transformData(chart.indicate, fieldKeys);
	});

	const dataLength = datas.length;

	return {
		title: {
			text: "",
			subtext: summary,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
		},
		series: datas.map(function (data: any, idx: number) {
			const width = 100 / dataLength + "%"; // 차트 너비를 데이터 개수에 따라 조정
			const left = idx * (100 / dataLength) + "%"; // 각 차트를 균등하게 배치

			return {
				type: "pie",
				top: "10%", // 1행 고정
				left: left,
				width: width, // 차트 너비
				height: "80%", // 높이 고정
				radius: "50%", // 파이 차트의 크기 설정
				itemStyle: {
					borderColor: "#fff",
					borderWidth: 1,
				},
				label: {
					show: true,
					position: "outside",
					formatter: "{b} {d}%",
					fontSize: 12,
					overflow: "break", // 텍스트가 축약되지 않도록 설정
					labelLayout: {
						hideOverlap: false, // 겹치는 라벨을 숨기지 않도록 설정
					},
					rich: {
						a: {
							color: function (params: any) {
								return params.color;
							},
						},
					},
				},
				labelLine: {
					show: true, // 라벨 라인 활성화
					length: 15, // 라벨 라인의 첫 번째 부분 길이
					length2: 10, // 라벨 라인의 두 번째 부분 길이
				},
				emphasis: {
					label: {
						show: true,
						color: function (params: any) {
							return params.color;
						},
					},
				},
				data: data,
			};
		}),
		grid: {
			top: 0,
			bottom: 0,
			left: 10,
			right: 10,
			containLabel: true,
		},
		color: color,
	};
}

export function HeatmapOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const heatmapkeys = Object.keys((data as BaseChartData)?.indicate[0]) as [string, string, string];
	const regionKey = heatmapkeys[0]; // 행정구역별
	const timeKey = heatmapkeys[1]; // 시간
	const heatmapValueKey = heatmapkeys[2]; // 생활인구
	const regions = Array.from(
		new Set((data as BaseChartData)?.indicate.map((item: any) => item[regionKey] as string)),
	).sort();
	const times = Array.from(
		new Set((data as BaseChartData)?.indicate.map((item: any) => item[timeKey] as string)),
	).sort((a, b) => {
		const hourA = parseInt(a.replace("시", ""), 10); // "1시" -> 1
		const hourB = parseInt(b.replace("시", ""), 10); // "2시" -> 2
		return hourA - hourB;
	});
	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : "";
	const dataMap: DataMap = {};
	regions.forEach((region) => {
		dataMap[region] = {};
		times.forEach((time) => {
			dataMap[region][time] = 0;
		});
	});

	(data as BaseChartData)?.indicate?.forEach((item: any) => {
		const region = item[regionKey] as string;
		const time = item[timeKey] as string;
		const value = item[heatmapValueKey] as number;
		dataMap[region][time] = value;
	});

	const heatmapData: [number, number, number][] = [];
	regions.forEach((region, i) => {
		times.forEach((time, j) => {
			heatmapData.push([j, i, dataMap[region][time]]);
		});
	});

	const values: number[] = heatmapData.map((item) => item[2]);
	const maxValue = Math.max(...values);
	const minValue = Math.min(...values);

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		xAxis: {
			type: "category",
			data: times,
			axisTick: { show: false },
			splitArea: {
				show: true,
			},
			axisLabel: {
				show: true,
				fontSize: 12,
				fontFamily: "Pretendard",
				hideOverlap: true,
				formatter: (value: string) => {
					return formatDateChart(value);
				},
				color: "#75777F",
			},
		},
		yAxis: {
			type: "category",
			data: regions,
			axisTick: { show: false },
			splitArea: {
				show: true,
			},
			axisLabel: {
				show: true,
				fontSize: 12,
				fontFamily: "Pretendard",
				color: "#75777F",
			},
		},
		visualMap: {
			min: minValue,
			max: maxValue,
			calculable: true,
			formatter: function (value: number) {
				return ""; // 숫자 레이블을 빈 값으로 설정하여 숨김
			},
			orient: "horizontal",
			left: "center",
			bottom: "0",
			itemWidth: 10,
			itemHeight: 500,
			inRange: {
				color: color,
			},
		},
		tooltip: {
			trigger: "item",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: (params: any) => {
				const { data } = params;
				const xIndex = data[0]; // x축 인덱스
				const yIndex = data[1]; // y축 인덱스
				const value = data[2]; // 히트맵 값

				// 실제 라벨 가져오기
				const xLabel = times[xIndex];
				const yLabel = regions[yIndex];

				const formattedValue =
					value < 1 && value !== 0 ? value.toFixed(3) : Math.floor(value).toLocaleString();

				return `
             ${yLabel}  ${formatDateChart(xLabel)}<br/>
            인구: ${formattedValue}
        `;
			},
		},
		series: [
			{
				name: heatmapValueKey,
				type: "heatmap",
				data: heatmapData,
				label: {
					show: false,
				},
				itemStyle: {
					borderColor: "#fff",
					borderWidth: 2, // 경계선 두께 설정
				},
			},
		],
		grid: {
			top: regionName ? "10%" : "5%",
			bottom: "10%",
			left: "1%",
			right: "1%",
			containLabel: true,
		},
	};
}

export function ButterflyOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const regionName = (data as BaseChartData).regionName || "";

	// 데이터 전처리: xData와 yData 생성
	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		xData.push(d[xlabel]); // y축 데이터 추가 (예: 연령대)

		// xlabel 외의 모든 키를 동적으로 처리
		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				yData[key].push(d[key]); // 값 추가
			}
		});
	});

	// yData의 각 키별로 시리즈 생성
	Object.keys(yData).forEach((key, index) => {
		series.push({
			name: key,
			type: "bar",
			data: index === 0 ? yData[key].map((value) => -value) : yData[key],
			barWidth: "",
			label: {
				show: !!chartLabelShow,
				position: index === 0 ? "insideLeft" : "insideRight",
				formatter: (value: any) => Math.abs(value.data).toLocaleString(),
				color: "#333333",
				fontWeight: "500",
				fontSize: 12,
			},
		});
	});

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		xAxis: {
			type: "value",
			axisLine: {
				show: false,
			},
			axisLabel: {
				fontFamily: "Pretendard",

				formatter: (value: number) => {
					const absValue = Math.abs(value);

					let formattedValue: string;
					if (absValue >= 10 ** 3) {
						formattedValue = Math.floor(absValue / 1000).toLocaleString("en-US") + "k";
					} else {
						formattedValue = absValue.toLocaleString();
					}
					return formattedValue;
				},
				show: true,
				interval: 0,
				color: "#75777F",
			},
		},
		yAxis: {
			type: "category",
			data: xData,
			splitLine: { show: false },
			axisTick: { show: false },
			formatter: (value: string) => {
				if (xData.length > 10) {
					const parts = formatDateChart(value).split(" ");
					return parts.length > 1 ? parts[0] + "\n" + parts[1] : parts[0];
				}
				return formatDateChart(value);
			},
			color: "#75777F",
			inverse: true, // y축 데이터 반전
		},
		tooltip: {
			trigger: "item",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				return Math.abs(Math.floor(value)).toLocaleString();
			},
		},
		series: series,
		legend: {
			bottom: "0",
			icon: "circle",
		},
		grid: {
			top: regionName ? "10%" : "5%",
			bottom: "10%",
			left: "1%",
			right: "1%",
			containLabel: true,
		},
		color: color,
		dataZoom: {}, // 데이터 줌 기능 (필요 시 추가)
		dataSwipe: dataSwipe,
	};
}

export function RadarOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	const xData: string[] = [];
	const yData: {
		[key: string]: number[];
	} = {};

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const regionName = (data as BaseChartData).regionName ? (data as BaseChartData).regionName : "";
	const perUnit = chartUnit === "%";

	// x축과 y축 데이터 생성
	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		const xLabelValue = d[xlabel];
		if (xLabelValue) {
			xData.push(xLabelValue);
		}

		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				yData[key].push(d[key]);
			}
		});
	});

	const radarIndicators = Object.keys(yData).map((key) => ({
		name: key,
		min: 0, // 기본 최소값
		max: Math.max(10, Math.ceil(Math.max(...yData[key]))),
	}));

	const formattedXData = xData.map((name) => formatDateChart(name));

	const seriesData = xData.map((name, index) => ({
		value: Object.keys(yData).map((key) => yData[key][index]),
		name: formattedXData[index], // 문자열이어야 함
	}));

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		radar: {
			indicator: radarIndicators,
			splitNumber: 5,
			min: 0,
			max: 100,
			radius: "65%",
			axisName: {
				color: "#333333",
				fontSize: 12,
				fontFamily: "Pretendard",
			},
			name: {
				color: "#333333",
				fontSize: 12,
				fontFamily: "Pretendard",
			},
			splitLine: {
				lineStyle: {
					color: "#BDBDBD",
					width: 1,
				},
			},
			axisLabel: {
				show: false,
				formatter: function (value: number, index: number) {
					return index === 0 ? value : "";
				},
				color: "#BDBDBD",
				fontSize: 12,
			},
		},
		tooltip: {
			trigger: "item",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				if (perUnit) return Math.floor(value).toLocaleString() + "%";
				return Math.floor(value).toLocaleString();
			},
		},
		series: {
			name: title,
			type: "radar",
			symbol: "none",
			lineStyle: {
				width: 2,
				color: color[0],
			},
			areaStyle: {
				color: color[0],
				opacity: 0.4,
				borderColor: "#333333",
				borderWidth: 2,
			},
			data: seriesData,
		},
		legend: {
			data: formattedXData,
			bottom: "0",
			icon: "circle",
		},
		grid: {
			top: regionName ? "15%" : "5%",
			bottom: "20%",
			left: "1%",
			right: "0%",
			containLabel: true,
		},
		color: color,
	};
}

export function SankeyOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const dataKey = Object.keys((data as BaseChartData).indicate[0]).filter((key) => key !== xlabel);
	const nodesArray: string[] = [];
	const nodes: {
		name: string;
		itemStyle?: { color: string; borderRadius?: number[]; opacity?: number };
		draggable?: boolean;
		label?: {};
		value?: number;
	}[] = [];
	const links: { source: string; target: string; value: number; lineStyle?: { color: string } }[] =
		[];
	const dataLength = (data as BaseChartData).indicate.length;

	// TO_BE_CHECKED: sido data regionName첫번째값
	const regionName = (data as BaseChartData).regionName || "";
	const regions = regionName + " ";
	const removeEjection = (name: string) => {
		return name.replace(/ (유출|유입)$/, "");
	};

	const sankeyLabel = {
		show: true,
		color: "#333",
		fontFamily: "Pretendard",
		formatter: function (params: any) {
			return `{style|${removeEjection(params.name)}: ${params.value.toLocaleString()}}`;
		},
	};
	if (dataKey.length > 1) {
		const addNode = (name: string, value: number, index: number, dataFlow: any) => {
			if (!nodesArray.includes(name)) {
				nodesArray.push(name);

				const isRegionNode =
					!name.includes("유입") && !name.includes("유출") && name.includes(regionName);

				const position = (() => {
					switch (dataLength) {
						case 10:
							return isRegionNode ? "inside" : index < 5 ? "right" : "left";
						case 20:
							return isRegionNode ? "inside" : index < 10 ? "right" : "left";
						case 1:
						case 2:
						case 3:
						case 4:
						case 5:
							return isRegionNode ? "inside" : dataFlow ? "left" : "right";
						default:
							return "inside"; // 기본값
					}
				})();
				nodes.push({
					name,
					value,
					itemStyle: {
						color: isRegionNode ? "#FFF" : color[index % color.length],
					},
					draggable: false,
					label: {
						show: true,
						color: "#333",
						fontFamily: "Pretendard",
						position: position,
						fontSize: isRegionNode ? 16 : 13,
						fontWeight: isRegionNode ? 700 : 500,
						backgroundColor: isRegionNode ? "#FFF" : "",
						formatter: isRegionNode
							? `{inflow|유입 ->} {style|${removeEjection(name)}}{outflow|-> 유출}`
							: `{style|${removeEjection(name)}: ${value.toLocaleString()}}`,
						rich: {
							inflow: {
								fontFamily: "Pretendard",
								color: "#CD1103", // 유입에 빨간색 적용
								fontWeight: "bold",
								padding: [0, 0, 0, 15],
							},
							style: {
								fontSize: isRegionNode ? 14 : 13,
								fontWeight: isRegionNode ? 600 : 500,
								fontFamily: "Pretendard",
								padding: (() => {
									if (isRegionNode) {
										if (dataLength <= 5) {
											return dataFlow ? [120, 5, 120, 100] : [120, 100, 120, 5];
										}
										return [240, 25];
									}
									return [6, 4];
								})(),
								borderRadius: isRegionNode ? 10 : 8,
								width: "auto", // 텍스트의 폭을 자동으로 맞춤
								overflow: "break", // 텍스트가 잘리지 않게 설정
								whiteSpace: "normal", // 텍스트 줄바꿈 가능하게 설
							},
							outflow: {
								fontFamily: "Pretendard",
								color: "#3473E7", // 유출에 파란색 적용
								fontWeight: "bold",
								padding: [0, 15, 0, 0],
							},
						},
					},
				});
			}
		};
		(data as BaseChartData)?.indicate?.forEach((item: any, index: number) => {
			const keys = Object.keys(item);
			const regionFrom = item["구분"] as string;
			const regionTo = item["지역"] as string;
			const populationValue = item[
				keys.find((key) => key.includes("인구")) || "생활인구"
			] as number;
			const dataFlow = regionTo.includes("유출") || data.name.toLowerCase().includes("out");

			addNode(regionFrom, populationValue, index, dataFlow);
			addNode(regionTo, populationValue, index, dataFlow);

			const linkColor = color[index % color.length];

			links.push({
				source: regionFrom,
				target: regionTo,
				value: populationValue,
				lineStyle: {
					color: linkColor,
				},
			});
		});
	} else {
		// 단방향
		(data as BaseChartData)?.indicate?.forEach((item: any, index: number) => {
			const keys = Object.keys(item);
			const regionFrom = item["구분"] as string; // 출발 지역 (각 구분 값)
			const populationValue = item[
				keys.find((key) => key.includes("인구")) || "생활인구"
			] as number; // 인구 수
			const linkColor = color[index % color.length];
			const dataFlow = ["유출"].includes(regionFrom) || data.name.toLowerCase().includes("out");
			const addLink = (source: string, target: string, value: number, color: string) => {
				const isDuplicate = links.some((link) => link.source === source && link.target === target);
				if (!isDuplicate) {
					links.push({
						source,
						target,
						value,
						lineStyle: { color: linkColor },
					});
				}
			};
			if (dataFlow) {
				addLink(regions, regionFrom, populationValue, linkColor);
			} else {
				addLink(regionFrom.replace(/ (유출|유입)$/, ""), regions, populationValue, linkColor);
			}

			//기준지역
			if (!nodesArray.includes(regions)) {
				nodesArray.push(regions);
				nodes.push({
					name: regions,
					label: {
						show: true,
						position: dataFlow ? "inside" : "left",
						align: dataFlow ? "inside" : "right",
						fontSize: 14,
						backgroundColor: "#fff",
						padding: [120, 60],
						formatter: dataFlow
							? `{style|${regions}}{outflow|-> 유출}`
							: `{inflow|유입 ->}{style|${regions}}`, // 여기에 들어오는 노드값에 유출이 있으면 유출 ->
						rich: {
							inflow: {
								fontFamily: "Pretendard",
								color: "#CD1103", // 유입에 빨간색 적용
								fontWeight: "bold",
								padding: [0, 3],
							},
							outflow: {
								fontFamily: "Pretendard",
								color: "#3473E7", // 유출에 파란색 적용
								fontWeight: "bold",
								padding: [0, 3],
							},
							style: {
								color: "#000000",
								fontSize: 14,
								fontWeight: 600,
								fontFamily: "Pretendard",
								width: "auto",
								overflow: "break",
								whiteSpace: "normal",
							},
						},
					},
					draggable: false,
				});
			}
			// 출발 지역 노드 추가
			if (!nodesArray.includes(regionFrom)) {
				nodesArray.push(regionFrom);
				nodes.push({
					name: regionFrom,
					value: populationValue,
					itemStyle: {
						color: color[(index + 1) % color.length],
						opacity: 1,
					},
					draggable: false,
					label: {
						...sankeyLabel,
						position: dataFlow ? "left" : "inside",
						align: dataFlow ? "right" : "inside",
						fontSize: 14,
						rich: {
							style: {
								fontSize: 13,
								fontWeight: 400,
								padding: [6, 4],
								borderRadius: 8,
								width: "auto",
								overflow: "break",
								whiteSpace: "normal",
							},
						},
					},
				});
			}
		});
	}

	return {
		title: {
			text: regionName,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		series: [
			{
				type: "sankey",
				layout: "none",
				nodeWidth: 20,
				nodeGap: 20,
				nodeDraggable: false,
				left: "2%",
				right: "2%",
				top: "15%",
				bottom: "10%",
				nodeAlign: "justify",
				layoutIterations: 32,
				data: nodes,
				links: links,
				lineStyle: {
					curveness: 0.3,
					color: (param: any) => color[param.dataIndex % color.length],
					opacity: 0.5,
				},
				emphasis: {
					focus: "adjacency",
				},
				colorMappingBy: "target",
			},
		],

		tooltip: {
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: function (params: any) {
				const formatNumber = (value: number) => {
					return Math.floor(value).toLocaleString();
				};

				if (params.dataType === "node") {
					return removeEjection(params.name);
				} else if (params.dataType === "edge") {
					const sourceName = removeEjection(params.data.source);
					const targetName = removeEjection(params.data.target);
					return `${sourceName} → ${targetName}<br/>인구 수: ${formatNumber(params.data.value)}`;
				}
			},
		},
		color: color,
	};
}

export function RaceOption({ title, data, type, xlabel, color, summary }: Readonly<ChartContext>) {
	// 현재 사용안함 RaceChart component 따로 사용
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};
	// x축과 y축

	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);
		Object.keys(d).forEach((key) => {
			// xlabel과 일치하지 않는 키들을 yData로 처리
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = []; // 처음 만난 키에 대해 배열 초기화
				}
				yData[key].push(d[key]);
			}
		});
	});

	// // yData 값들을 내림차순 정렬 후 상위 10개만 유지
	// Object.keys(yData).forEach((key) => {
	// 	yData[key] = yData[key]
	// 		.sort((a, b) => b - a) // 내림차순으로 정렬
	// 		.slice(0, 10); // 상위 10개의 값만 선택
	// });

	// 시리즈 = 차트 데이터 부분
	Object.keys(yData).forEach((item) => {
		series.push({
			name: item,
			type: type === "race" ? "bar" : type,
			data: yData[item], // yData의 각 항목 데이터 추가
			label: {
				show: true,
				position: "insideRight",
				color: "#fff",
				fontFamily: "Pretendard",
			},
			barWidth: "40", // 필요시 바 너비 조정
			itemStyle: {
				borderRadius: [0, 50, 50, 0],
			},
			barCategoryGap: 5,
		});
	});

	return {
		title: {
			text: title,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			subtextStyle: {
				fontSize: 12,
				lineHeight: 14,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		xAxis: {
			type: "value",
			splitNumber: 3,
			splitLine: {
				show: true,
			},
			axisLabel: {
				formatter: (value: number) => {
					let val: any = Math.abs(value);
					if (val >= 10 ** 4) {
						val = Number((val / 10000).toFixed(0)).toLocaleString() + " 만";
					} else {
						val = Number(val).toLocaleString();
					}
					if (value < 0) return "-" + val;
					else return val;
				},
			},
		},
		yAxis: {
			type: "category",
			data: xData,
			show: false,
			inverse: true,
			axisLabel: {
				interval: 0,
				color: "",
				fontSize: 10,
				fontWeight: "semibold",
			},
			axisLine: {
				show: false,
			},
			axisTick: {
				show: false,
			},
			z: 2,
		},
		grid: {
			left: "0",
			right: "0",
			top: "0",
			bottom: "0",
			containLabel: false,
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				if (value < 1 && value !== 0) return value.toFixed(3);
				else return Math.floor(value).toLocaleString();
			},
		},
		series: series,
		color: color,
	};
}

export function ScatterOption({
	title,
	data,
	type,
	xlabel,
	color,
	dataSwipe,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	if ((data as MergedChartData)?.data) {
		const scatterGroups = (data as MergedChartData).data;

		// xField와 yField 동적 결정
		const firstIndicate = scatterGroups[0]?.indicate[0] || {};
		const numericFields = Object.keys(firstIndicate).filter(
			(key) => typeof firstIndicate[key] === "number",
		);

		const xFieldName = numericFields.includes(xlabel) ? xlabel : numericFields[0];
		const yFieldName = numericFields.find((key) => key !== xFieldName) || numericFields[1];

		// scatterData 생성
		const scatterData: [number, number][] = scatterGroups.flatMap(
			(group) =>
				group.indicate
					.map((item) => {
						const xValue = item[xFieldName];
						const yValue = item[yFieldName];
						if (typeof xValue === "number" && typeof yValue === "number") {
							return [xValue, yValue];
						}
						return null; // 숫자가 아닌 값은 제외
					})
					.filter((point): point is [number, number] => point !== null), // null 값 제거
		);

		const xValues = scatterData.map(([x]) => x);
		const yValues = scatterData.map(([, y]) => y);

		// x축 범위 계산
		const xMaxData = Math.max(...xValues); // 데이터의 최대값
		const xMinData = Math.min(...xValues); // 데이터의 최소값
		const xMaxValue = Math.ceil(Math.max(Math.abs(xMaxData), Math.abs(xMinData)) / 10) * 10; // 절대값 기준으로 가장 큰 값을 사용
		const xMax = xMaxValue === 0 ? 1 : xMaxValue;
		const xAxisMin = -xMax; // 대칭적으로 설정
		const xAxisMax = xMax;

		// y축 범위 계산
		const yMaxData = Math.max(...yValues); // 데이터의 최대값
		const yMinData = Math.min(...yValues); // 데이터의 최소값
		const yMaxValue = Math.ceil(Math.max(Math.abs(yMaxData), Math.abs(yMinData)) / 10) * 10; // 절대값 기준으로 가장 큰 값을 사용
		const yMax = yMaxValue === 0 ? 1 : yMaxValue;
		const yAxisMin = -yMax; // 대칭적으로 설정
		const yAxisMax = yMax;

		// 시리즈 생성
		const series = scatterGroups.map((group, index) => {
			const groupScatterData: [number, number][] = group.indicate
				.map((item) => {
					const xValue = item[xFieldName];
					const yValue = item[yFieldName];
					if (typeof xValue === "number" && typeof yValue === "number") {
						return [xValue, yValue];
					}
					return null;
				})
				.filter((point): point is [number, number] => point !== null);

			return {
				name: group.regionName,
				type: "scatter",
				data: groupScatterData,
				symbolSize: 25,
				encode: {
					x: 0, // 시리즈에서 첫 번째 값이 x축 값임을 지정
					y: 1, // 시리즈에서 두 번째 값이 y축 값임을 지정
				},
				markLine: {
					data: [
						{ xAxis: 0 }, // x축 중심선 (X축에서 0에 해당하는 선)
						{ yAxis: 0 }, // y축 중심선 (Y축에서 0에 해당하는 선)
					],
					symbolSize: 4,
					lineStyle: {
						type: "solid",
						color: "#333",
						width: 1,
					},
					emphasis: {
						lineStyle: {
							width: 1,
						},
					},
					tooltip: {
						show: false,
					},
				},
				itemStyle: {
					color: color[index % color.length],
				},
				label: {
					show: Boolean(chartLabelShow),
					position: "left",
					color: "#333333",
					fontWeight: "500",
					fontSize: 12,
				},
			};
		});

		return {
			// title: {
			// 	text: title,
			// 	textStyle: {
			// 		fontSize: 16,
			// 		fontFamily: "Pretendard",
			// 	},
			// 	padding: [0, 0, 5, 5],
			// 	itemGap: 7,
			// },
			legend: {
				bottom: 5,
				data: scatterGroups.map((group) => group.regionName),
				textStyle: {
					fontSize: 12,
					fontFamily: "Pretendard",
				},
			},
			xAxis: {
				name: xFieldName,
				nameLocation: "middle", // x축 이름을 중간에 위치
				nameGap: 40,
				nameTextStyle: {
					fontFamily: "Pretendard",
					backgroundColor: "#F9F9F9",
					padding: [6, 445, 6, 445],
				},
				type: "value", // 숫자형 축
				axisTick: { show: true }, // 눈금 간격 표시
				axisLine: { show: true, onZero: true }, // 가로축 선 표시
				axisLabel: {
					show: true,
					margin: 10.5,
				}, // 라벨 표시
				min: xAxisMin, // 동적으로 계산된 min
				max: xAxisMax, // 동적으로 계산된 max
			},
			yAxis: {
				name: yFieldName,
				nameLocation: "middle", // y축 이름을 중간에 위치
				nameRotate: 90, // y축 이름을 90도 회전해서 세로로 표시
				nameGap: 50,
				nameTextStyle: {
					fontFamily: "Pretendard",
					backgroundColor: "#F9F9F9",
					padding: [6, 100, 6, 100],
				},
				type: "value", // 숫자형 축
				axisTick: { show: true }, // 눈금 간격 표시
				axisLine: { show: true, onZero: true }, // 세로축 선 표시
				axisLabel: {
					show: true,
					margin: 20.5,
				}, // 라벨 표시
				min: yAxisMin, // 동적으로 계산된 min
				max: yAxisMax, // 동적으로 계산된 max
			},
			tooltip: {
				trigger: "item",
				borderColor: "rgb(247, 247, 247,0.2)",
				backgroundColor: "#131722",
				textStyle: {
					color: "#ffffff",
					fontSize: 12,
					fontWeight: "bold",
				},
				formatter: (params: any) => {
					// scatterData와 연결된 원본 데이터의 index 가져오기
					const groupIndex = scatterGroups.findIndex(
						(group) => group.regionName === params.seriesName,
					);

					const dataIndex = params.dataIndex;
					const originalItem = scatterGroups[groupIndex]?.indicate[dataIndex];

					if (!originalItem) {
						return ""; // 데이터가 없는 경우 빈 문자열 반환
					}

					// `originalItem`의 데이터를 동적으로 포맷팅
					const formattedContent = Object.entries(originalItem)
						.map(([key, value]) => `${key}: ${value}`)
						.join("<br>");

					return `${formattedContent}`;
				},
			},
			series,
			color: color,
			grid: {
				show: false,
				left: "5%", // 중앙을 잘 맞추기 위해 여유를 줌
				right: "5%",
				top: "15%",
				bottom: "15%",
				containLabel: true,
			},
			graphic: [
				{
					type: "text",
					left: "24%", // 왼쪽 상단 사분면
					top: "19%",
					style: {
						text: "유입인구 ↓\n유출인구 ↑",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "67%", // 오른쪽 상단 사분면
					top: "19%",
					style: {
						text: "유입인구 ↑\n유출인구 ↑",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "24%", // 왼쪽 하단 사분면
					top: "57%",
					style: {
						text: "유입인구 ↓\n유출인구 ↓",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "67%", // 오른쪽 하단 사분면
					top: "57%",
					style: {
						text: "유입인구 ↑\n유출인구 ↓",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
			],
		};
	} else {
		const dashbaord = scatterGraphic.includes(data.name);
		// 데이터의 첫 번째 항목에서 동적으로 필드명을 가져옴
		const keys = Object.keys((data as BaseChartData)?.indicate[0]);

		// 숫자 필드만 찾기
		const numericFields: string[] = keys.filter(
			(key) => typeof (data as BaseChartData)?.indicate[0][key] === "number",
		);

		// xField는 명시적으로 전달된 xlabel이 숫자 필드여야 함
		const xField: string = numericFields.includes(xlabel as string)
			? (xlabel as string)
			: numericFields[0];

		const yField: string = numericFields.find((key) => key !== xField) || numericFields[1];

		// 데이터를 2차원 배열로 변환 [xField 값, yField 값] 형식으로
		const scatterData: [number, number][] = (data as BaseChartData)?.indicate.map((item: any) => [
			item[xField] as number,
			item[yField] as number,
		]);
		const regionName = (data as BaseChartData).regionName
			? (data as BaseChartData).regionName
			: null;

		const xValues = scatterData.map(([x]) => x);
		const yValues = scatterData.map(([, y]) => y);

		const xMaxValue = Math.ceil(Math.max(...xValues) / 10) * 10;
		const xMax = xMaxValue === 0 ? 1 : xMaxValue;
		const xAxisMin = -xMax;
		const xAxisMax = xMax;

		const yMaxValue = Math.ceil(Math.max(...yValues) / 10) * 10;
		const yMax = yMaxValue === 0 ? 1 : yMaxValue;
		const yAxisMin = -yMax;
		const yAxisMax = yMax;
		return {
			title: {
				text: regionName,
				textStyle: {
					fontSize: 16,
					fontFamily: "Pretendard",
				},
				padding: [0, 0, 5, 5],
				itemGap: 7,
			},
			xAxis: {
				name: xField,
				nameLocation: "middle", // x축 이름을 중간에 위치
				nameGap: 40,
				nameTextStyle: {
					fontFamily: "Pretendard",
					backgroundColor: "#F9F9F9",
					padding: [6, 445, 6, 445],
				},
				type: "value", // 숫자형 축
				axisTick: { show: true }, // 눈금 간격 표시
				axisLine: { show: true, onZero: true }, // 가로축 선 표시
				axisLabel: {
					show: true,
					margin: 10.5,
				}, // 라벨 표시
				min: xAxisMin,
				max: xAxisMax,
			},
			yAxis: {
				name: yField,
				nameLocation: "middle", // y축 이름을 중간에 위치
				nameRotate: 90, // y축 이름을 90도 회전해서 세로로 표시
				nameGap: 50,
				nameTextStyle: {
					fontFamily: "Pretendard",
					backgroundColor: "#F9F9F9",
					padding: [6, 100, 6, 100],
				},
				type: "value", // 숫자형 축
				axisTick: { show: true }, // 눈금 간격 표시
				axisLine: { show: true, onZero: true }, // 세로축 선 표시
				axisLabel: {
					show: true,
					margin: 20.5,
				}, // 라벨 표시
				min: yAxisMin,
				max: yAxisMax,
			},
			tooltip: {
				trigger: "item",
				borderColor: "rgb(247, 247, 247,0.2)",
				backgroundColor: "#131722",
				textStyle: {
					color: "#ffffff",
					fontSize: 12,
					fontWeight: "bold",
				},
				formatter: (params: TooltipParams) => {
					const item = (data as BaseChartData)?.indicate[params.dataIndex];
					// item이 undefined 또는 null인 경우 빈 문자열을 반환하여 에러 방지
					if (!item) {
						return "";
					}
					// item이 존재하면 데이터를 반환
					return `${Object.keys(item)
						.map((key) => {
							const value = item[key];
							return `${key}: ${typeof value === "number" ? `${value}%` : value}`;
						})
						.join("<br />")}`;
				},
			},
			series: [
				{
					name: title,
					type: "scatter",
					data: scatterData, // 2차원 배열로 변환된 데이터
					symbolSize: 25,
					encode: {
						x: 0, // 시리즈에서 첫 번째 값이 x축 값임을 지정
						y: 1, // 시리즈에서 두 번째 값이 y축 값임을 지정
					},
					markLine: {
						data: [
							{ xAxis: 0 }, // x축 중심선 (X축에서 0에 해당하는 선)
							{ yAxis: 0 }, // y축 중심선 (Y축에서 0에 해당하는 선)
						],
						symbolSize: 4,
						lineStyle: {
							type: "solid",
							color: "#333",
							width: 1,
						},
						emphasis: {
							lineStyle: {
								width: 1,
							},
						},
						tooltip: {
							show: false,
						},
					},
					label: {
						show: Boolean(chartLabelShow),
						position: "left",
						color: "#333333",
						fontWeight: "500", // 라벨 폰트 굵기
						fontSize: 12,
					},
					labelLayout: {
						hideOverlap: true,
					},
				},
			],
			color: color,
			grid: {
				show: false,
				left: "5%", // 중앙을 잘 맞추기 위해 여유를 줌
				right: "5%",
				top: regionName ? "15%" : "5%",
				bottom: "15%",
				containLabel: true,
			},

			graphic: [
				{
					type: "text",
					left: "24%", // 왼쪽 상단 사분면
					top: "19%",
					style: {
						text: "유입인구 ↓\n유출인구 ↑",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "67%", // 오른쪽 상단 사분면
					top: "19%",
					style: {
						text: "유입인구 ↑\n유출인구 ↑",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "24%", // 왼쪽 하단 사분면
					top: "57%",
					style: {
						text: "유입인구 ↓\n유출인구 ↓",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
				{
					type: "text",
					left: "67%", // 오른쪽 하단 사분면
					top: "57%",
					style: {
						text: "유입인구 ↑\n유출인구 ↓",
						fontSize: 35,
						fontWeight: "bold",
						fill: "rgba(217, 217, 217, 1)",
						textAlign: "center",
						textVerticalAlign: "middle",
					},
				},
			],
		};
	}
}

export function BumpOption({ title, data, type, xlabel, color }: Readonly<ChartContext>) {
	// 현재 사용안함 bumpChart component 따로 사용
	const xData: string[] = [];
	const series: Series[] = [];
	const yData: {
		[key: string]: number[];
	} = {};

	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		xData.push(d[xlabel]);
		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = [];
				}
				yData[key].push(d[key]);
			}
		});
	});

	// 순위 데이터를 생성하는 함수
	const generateRankingData = (): Map<string, number[]> => {
		const map: Map<string, number[]> = new Map();
		const defaultRanking = Array.from({ length: Object.keys(yData).length }, (_, i) => i + 1);

		xData.forEach((_, idx) => {
			// 해당 시점의 데이터 기준으로 정렬하여 순위를 계산
			const sortedRegions = Object.keys(yData).sort((a, b) => yData[b][idx] - yData[a][idx]);
			sortedRegions.forEach((region, rank) => {
				if (!map.has(region)) {
					map.set(region, []);
				}
				map.get(region)?.push(rank + 1); // 순위는 1부터 시작
			});
		});

		return map;
	};

	// 시리즈 리스트 생성
	const generateSeriesList = () => {
		const rankingMap = generateRankingData();

		rankingMap.forEach((rankings, region) => {
			series.push({
				name: region,
				symbolSize: 20,
				type: "line",

				data: rankings, // 순위 데이터를 사용
			});
		});

		return series;
	};

	return {
		title: {
			text: title,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			subtextStyle: {
				fontSize: 12,
				lineHeight: 14,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
			itemGap: 7,
		},
		tooltip: {
			trigger: "item",
		},
		grid: {
			left: 30,
			right: 110,
			bottom: 30,
			containLabel: true,
		},
		xAxis: {
			type: "category",
			splitLine: {
				show: true,
			},
			axisLabel: {
				margin: 30,
				fontSize: 16,
			},
			boundaryGap: false,
			data: xData,
		},
		yAxis: {
			type: "value",
			axisLabel: {
				margin: 30,
				fontSize: 16,
				formatter: "#{value}",
			},
			inverse: true, // 순위는 값이 클수록 낮은 순위를 의미하므로 역방향으로 설정
			interval: 1,
			min: 1,
			max: Object.keys(yData).length, // 최대 순위는 yData 필드 개수
		},
		series: generateSeriesList(),
		color: color,
	};
}

export function CustomOption({
	title,
	data,
	type,
	xlabel,
	color,
	summary,
	chartLabelShow,
	isExceptionalChart,
	chartUnit,
}: Readonly<ChartContext>) {
	const xAxisData: string[] = [];
	const regions: string[] = [];
	const seriesData: { [key: string]: number[] } = {};
	let categoryField = "";
	const perUnit = chartUnit === "%";

	//TO_BE_CHECKED 리턴값 에러
	if (!isValidChartData(data)) {
		return {};
	}

	const firstIndicate =
		((data as MergedChartData)?.data?.[0]?.indicate?.[0] as Record<string, any>) ||
		((data as BaseChartData)?.indicate?.[0] as Record<string, any>) ||
		null;

	if (!firstIndicate) {
		console.warn("firstIndicate is null or undefined. Returning empty chart configuration.");
		return {}; // 빈 값 반환
	}
	// firstIndicate 처리
	Object.keys(firstIndicate).forEach((key) => {
		if (typeof firstIndicate[key] === "string") {
			categoryField = key;
		} else {
			seriesData[key] = [];
		}
	});

	(data as MergedChartData)?.data?.forEach((chart) => {
		const regionLabel = String(chart.regionName);
		chart.indicate.forEach((data) => {
			if (categoryField in data) {
				xAxisData.push(data[categoryField] as string);
			}
			if (!regions.includes(regionLabel)) {
				regions.push(regionLabel);
			}

			Object.keys(data).forEach((key) => {
				if (key !== categoryField) {
					const value = data[key];
					if (typeof value === "number") {
						seriesData[key].push(value);
					}
				}
			});
		});
	});

	let totalData: number[] = [];
	if (type === "customFullStack" || isExceptionalChart) {
		totalData = xAxisData.map((_, i) =>
			Object.keys(seriesData).reduce((sum, key) => {
				const value = seriesData[key][i] ?? 0; // undefined/null 방지
				return sum + value;
			}, 0),
		);
	}

	if (perUnit && !isExceptionalChart) {
		// totalData 계산: x축 데이터별 총합
		totalData = xAxisData.map((_, index) =>
			Object.keys(seriesData).reduce((sum, key) => {
				const value = seriesData[key][index] ?? 0; // 값이 없으면 기본값 0
				return sum + value;
			}, 0),
		);

		// seriesData를 퍼센트 값으로 변환
		Object.keys(seriesData).forEach((key) => {
			seriesData[key] = seriesData[key].map((value, index) => {
				const total = totalData[index] || 0;
				return total > 0 ? (value / total) * 100 : 0;
			});
		});
	}
	const seriesArray = Object.keys(seriesData).map((key) => {
		const isStackChart = ["customStack", "customFullStack"].includes(type);
		return {
			name: key,
			type: "bar",
			stack: isStackChart ? "total" : undefined,
			barWidth: "",
			label: {
				// show: isStackChart ? true : Boolean(chartLabelShow),
				show: chartLabelShow ? true : false,
				position: isStackChart ? "inside" : "top",
				color: "#333333",
				fontWeight: "500",
				fontSize: 12,
				formatter: (params: any) => {
					if (type === "customFullStack") {
						const value = params.value.toFixed(1);
						const formattedValue = value.endsWith(".0")
							? Math.floor(params.value).toLocaleString()
							: Number(value).toFixed(1);
						return `${formattedValue}%`;
					}
					if (perUnit) {
						const total = totalData[params.dataIndex] || 1;
						const value = total <= 0 ? 0 : params.value; // (params.value / total) * 100;
						const formattedValue = value.toFixed(1).endsWith(".0")
							? Math.floor(value).toLocaleString()
							: Number(value).toFixed(1);
						return `${formattedValue}%`;
					}
					if (isExceptionalChart) {
						const total = totalData[params.dataIndex] || 1;
						const value = total <= 0 ? 0 : (params.value / total) * 100;
						const formattedValue = value.toFixed(1).endsWith(".0")
							? Math.floor(value).toLocaleString()
							: Number(value).toFixed(1);
						return `${formattedValue}%`;
					} else {
						return Math.floor(params.value).toLocaleString();
					}
				},
			},
			labelLayout: {
				hideOverlap: true,
			},
			data:
				type === "customFullStack"
					? seriesData[key].map((val, i) => (totalData[i] <= 0 ? 0 : (val / totalData[i]) * 100))
					: seriesData[key],
		};
	});

	return {
		title: {
			text: title,
			textStyle: {
				fontSize: 16,
				fontFamily: "Pretendard",
			},
			padding: [0, 0, 5, 5],
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			borderColor: "rgb(247, 247, 247,0.2)",
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			formatter: function (params: any) {
				return params
					.map((item: any) => {
						const value = item.value;
						if (typeof value === "number") {
							if (isExceptionalChart) {
								return `${item.marker} ${item.seriesName}: ${Math.floor(value).toLocaleString()}`;
							}
							if (perUnit) {
								const formattedValue =
									value % 1 === 0 ? Math.floor(value).toLocaleString() : value.toFixed(1) + "%";
								return `${item.marker} ${item.seriesName}: ${formattedValue}`;
							}
							return `${item.marker} ${item.seriesName}: ${Math.floor(value).toLocaleString()}`;
						}
						return `${item.marker} ${item.seriesName}: ${value}`;
					})
					.join("<br />");
			},
		},
		grid: {
			top: "5%",
			bottom: "10%",
			left: "2%",
			right: "1%",
			containLabel: true,
		},
		legend: {
			data: Object.keys(seriesData),
			bottom: "0%",
			icon: "circle",
		},
		xAxis: [
			{
				type: "category",
				data: xAxisData,
				axisTick: { show: false },
				axisLine: { show: false },
				axisLabel: {
					show: true,
					interval: 0,
					hideOverlap: true,
					formatter: function (value: string) {
						return formatDateChart(value);
					},
					color: "#75777F",
				},
				position: "bottom",
			},
			{
				type: "category",
				data: regions,
				axisTick: { show: false },
				axisLine: { show: false },
				axisLabel: {
					formatter: function (value: string) {
						return formatDateChart(value);
					},
					color: "#75777F",
				},
				position: "bottom",
				offset: 20,
			},
		],
		yAxis: {
			type: "value",
			max: isExceptionalChart ? undefined : perUnit ? 100 : undefined,
			axisLabel: {
				formatter: (value: number) => {
					if (isExceptionalChart) {
						return value >= 1000
							? `${Math.floor(value / 1000).toLocaleString("en-US")}k`
							: value.toLocaleString("en-US");
					}
					if (perUnit) {
						return `${Math.abs(value).toLocaleString("en-US")}%`;
					}
					return value >= 1000
						? `${Math.floor(value / 1000).toLocaleString("en-US")}k`
						: value.toLocaleString("en-US");
				},
				color: "#75777F",
				show: true,
				fontFamily: "Pretendard",
			},
		},
		series: seriesArray,
		color: color,
	};
}
