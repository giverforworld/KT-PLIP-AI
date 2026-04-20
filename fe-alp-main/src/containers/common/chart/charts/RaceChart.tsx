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

import ReactECharts from "echarts-for-react";
import { useEffect, useRef, useState, useMemo } from "react";
import Pre from "@images/chartIcon/pre.svg";
import Next from "@images/chartIcon/next.svg";

export default function RaceChart({
	title,
	data,
	type,
	xlabel,
	color,
	summary,
}: Readonly<ChartContext>) {
	const [count, setCount] = useState(10); // 페이지당 항목 수 (10개 또는 30개)
	const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
	const [startIndex, setStartIndex] = useState(0); // 날짜 인덱스
	const intervalRef = useRef<number | null>(null);

	// 날짜 필드 고정
	const dateField = "구분";

	// 지역명(필드) 목록 추출 (날짜 필드 제외)
	const regionFields = Object.keys((data as BaseChartData)?.indicate[0]).filter(
		(key) => key !== dateField,
	);

	// 날짜 리스트 추출
	const dates = useMemo(() => {
		return Array.from(new Set((data as BaseChartData)?.indicate.map((d: any) => d[dateField])));
	}, [data]);

	// 5초마다 날짜 변경 및 데이터 업데이트
	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current); // 기존 타이머 제거
		}

		intervalRef.current = window.setInterval(() => {
			setStartIndex((prevIndex) => (prevIndex + 1) % dates.length); // 날짜 인덱스 순환
		}, 5000); // 5초마다 업데이트

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current); // 컴포넌트 언마운트 시 타이머 제거
			}
		};
	}, [dates.length]);

	// 현재 날짜에 해당하는 데이터 필터링
	const filteredData = (data as BaseChartData)?.indicate?.find(
		(d: any) => d[dateField] === dates[startIndex],
	);

	// filteredData가 없는 경우 기본 값 설정
	if (!filteredData) return null;

	// 페이지네이션에 맞춰 데이터 슬라이싱
	const startPageIndex = (currentPage - 1) * count;
	const paginatedRegions = regionFields.slice(startPageIndex, startPageIndex + count);

	// xData: 지역명, yData: 해당 지역의 값
	const xData: string[] = paginatedRegions; // 지역 이름을 y축에 표시
	const yData: number[] = paginatedRegions
		.map((region) => filteredData[region]) // filteredData[region]의 값을 가져옴
		.filter((value): value is number => typeof value === "number"); // 값이 숫자인 경우만 필터링

	// yData에 따라 순위 계산하여 색상 변경
	const sortedIndices = yData
		.map((value, index) => ({ value, index })) // 값과 인덱스를 함께 저장
		.sort((a, b) => b.value - a.value) // 값에 따라 내림차순 정렬
		.map((item) => item.index); // 정렬된 인덱스 반환

	// 상위 3개 항목에 대해 다른 색상을 지정
	const getBarColor = (index: number) => {
		const rank = sortedIndices.indexOf(index); // 정렬된 값에서 현재 항목의 순위 확인
		// 상위 3개 항목에 대해 동일한 색상 적용
		if (rank < 3) return color[0];
		return color[1]; // 나머지는 기본 색상
	};

	// 시리즈 설정
	const series = [
		{
			name: "value",
			type: "bar",
			realtimeSort: true, // 실시간으로 데이터를 정렬
			data: yData.map((value, index) => ({
				value,
				itemStyle: {
					color: getBarColor(index), // 상위 3개에 대해 다른 색상 적용
				},
			})),
			label: {
				show: true,
				overflow: "truncate",
				position: "insideRight",
				color: "#fff",
				fontFamily: "Pretendard",
			},
			barWidth: "25",
			itemStyle: {
				borderRadius: [0, 50, 50, 0],
			},
			barCategoryGap: 3,
		},
	];

	const option = {
		// title: {
		// 	text: `${title} (${dates[startIndex]})`,
		// 	subtext: summary,
		// 	textStyle: {
		// 		fontSize: 14,
		// 		fontFamily: "Pretendard",
		// 	},
		// 	padding: [0, 0, 5, 5],
		// },
		xAxis: {
			max: "dataMax",
			type: "value",
			splitLine: {
				show: false,
			},
			axisLabel: {
				formatter: (value: number) => {
					let val: any = Math.abs(value);
					if (val >= 10 ** 4) {
						val = Number((val / 10000).toFixed(0)).toLocaleString() + " 만";
					} else {
						val = Number(val).toLocaleString();
					}
					return value < 0 ? "-" + val : val;
				},
				color: "#75777F",
			},
		},
		yAxis: {
			type: "category",
			data: xData,
			inverse: true,
			axisLabel: {
				show: true,
				fontSize: 12,
				fontFamily: "Pretendard",
				color: "#75777F",
			},
			axisLine: {
				show: false,
			},
			axisTick: {
				show: false,
			},
			max: Math.min(count, regionFields.length),
		},
		grid: {
			left: "0",
			right: "10%",
			top: "5%",
			bottom: "0",
			containLabel: true,
		},
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "shadow",
			},
			backgroundColor: "#131722",
			textStyle: {
				color: "#ffffff",
				fontSize: 12,
				fontWeight: "bold",
			},
			valueFormatter: function (value: number) {
				return value < 1 && value !== 0 ? value.toFixed(3) : Math.floor(value).toLocaleString();
			},
		},
		series: series,
		color: color,
		animationDurationUpdate: 3000, // 데이터 업데이트 시 애니메이션 지속 시간
		animationEasingUpdate: "linear", // 데이터 업데이트 애니메이션 유형
		graphic: {
			elements: [
				{
					type: "text",
					right: 50,
					bottom: 60,
					style: {
						text: dates[startIndex], // 현재 날짜를 표시
						font: "60px Pretendard", // 텍스트 스타일
						fill: "rgba(100, 100, 100, 0.25)", // 텍스트 색상 및 투명도 설정
					},
					z: 100, // 그래픽 요소의 z-index 설정
				},
			],
		},
	};

	// totalPages 계산 시, 0으로 나누는 것을 방지
	const totalPages = regionFields.length > 0 ? Math.ceil(regionFields.length / count) : 1;

	return (
		<div>
			<ReactECharts
				notMerge={true}
				option={option}
				style={{
					height: count === 30 ? "800px" : "400px",
					overflowY: count === 30 ? "scroll" : "hidden",
				}}
			/>

			{/* <div className="mt-4 flex items-center justify-end">
				<div className="flex items-center">
					<label htmlFor="dataCount" className="mr-2 text-textGray">
						Rows per page:
					</label>
					<select
						id="dataCount"
						className="rounded border px-2 py-1"
						value={count}
						onChange={(e) => {
							setCount(Number(e.target.value)); // 페이지 당 항목 수 설정
							setCurrentPage(1); // 선택 시 첫 페이지로 이동
						}}
					>
						<option value={10}>10</option>
						<option value={30}>30</option>
					</select>
				</div>

				<div className="flex items-center">
					<button
						className="p-2"
						disabled={currentPage === 1}
						onClick={() => setCurrentPage(currentPage - 1)}
					>
						<Pre />
					</button>
					<span className="mx-1">
						{currentPage} of {totalPages}
					</span>
					<button
						className="p-2"
						disabled={currentPage === totalPages}
						onClick={() => setCurrentPage(currentPage + 1)}
					>
						<Next />
					</button>
				</div>
			</div> */}
		</div>
	);
}
