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

import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import Pre from "@images/chartIcon/pre.svg";
import Next from "@images/chartIcon/next.svg";

export default function BumpChart({ title, data, xlabel, color, summary }: Readonly<ChartContext>) {
	const [count, setCount] = useState<number>(10); // 한 페이지에 보여줄 지역 수
	const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지

	// xData: 날짜 기준으로
	const xData: string[] = (data as BaseChartData)?.indicate?.map((d: any) => d[xlabel]); // 날짜를 x축으로 사용

	// 각 지역별 데이터 추출
	const yData: { [key: string]: number[] } = {};
	const series: Series[] = [];

	(data as BaseChartData)?.indicate?.forEach((d: any) => {
		Object.keys(d).forEach((key) => {
			if (key !== xlabel) {
				if (!yData[key]) {
					yData[key] = []; // 처음 만난 키에 대해 배열 초기화
				}
				yData[key].push(d[key]);
			}
		});
	});

	const totalRegions = Object.keys(yData).length; // 총 지역의 수

	// 전체 데이터를 기준으로 순위를 매기는 함수
	const generateOverallRankingData = (): [string, number][] => {
		const overallRankingData = Object.keys(yData).map((region) => {
			const totalSum = yData[region].reduce((acc, val) => acc + val, 0); // 각 지역의 총합 계산
			return [region, totalSum] as [string, number]; // 지역 이름과 총합을 배열로 반환
		});

		overallRankingData.sort((a, b) => b[1] - a[1]); // 총합을 기준으로 내림차순 정렬
		return overallRankingData;
	};

	// 페이지네이션을 적용한 순위 데이터를 반환하는 함수
	const generatePaginatedRankingData = (startIdx: number, endIdx: number): [string, number[]][] => {
		const rankingData: [string, number[]][] = [];

		// 전체 순위 데이터를 가져오기
		const overallRankingData = generateOverallRankingData();

		// 전체 순위에서 페이지네이션에 맞는 데이터만 가져오기
		const paginatedRanking = overallRankingData.slice(startIdx, endIdx);

		// xData에 맞춰 각 날짜마다 지역별 순위를 계산
		xData.forEach((_, idx) => {
			const sortedRegions = paginatedRanking
				.map(([region]) => region)
				.sort((a, b) => yData[b][idx] - yData[a][idx]);

			sortedRegions.forEach((region, rank) => {
				if (!rankingData.find((d) => d[0] === region)) {
					rankingData.push([region, []]);
				}
				rankingData.find((d) => d[0] === region)?.[1].push(rank + 1); // 페이지 내에서 다시 1위부터 시작
			});
		});

		return rankingData;
	};

	// 시리즈 리스트 생성 함수
	const generateSeriesList = () => {
		const startIdx = (currentPage - 1) * count; // 현재 페이지의 시작 인덱스
		const endIdx = Math.min(currentPage * count, totalRegions); // 페이지의 끝 범위 계산 (총 지역 수를 넘지 않도록)
		const rankingData = generatePaginatedRankingData(startIdx, endIdx); // 페이지별 순위 데이터 생성
		const series: any[] = []; // 시리즈 배열 초기화

		rankingData.forEach(([region, regionData]) => {
			series.push({
				name: region,
				symbolSize: 12,
				type: "line",
				smooth: true,
				emphasis: {
					focus: "series",
				},
				endLabel: {
					show: true,
					formatter: (params: any) => params.seriesName,
					distance: 20,
				},
				lineStyle: {
					width: 1,
				},

				data: regionData, // 날짜별 순위를 시리즈에 추가
			});
		});

		return series; // 시리즈 배열 반환
	};

	// 옵션 생성
	const option = {
		// title: {
		// 	text: title,
		// 	subtext: summary,
		// 	textStyle: {
		// 		fontSize: 16,
		// 		fontFamily: "Pretendard",
		// 	},
		// 	padding: [0, 0, 5, 5],
		// 	itemGap: 7,
		// },
		tooltip: {
			trigger: "item",
		},
		grid: {
			top: "5%",
			left: 0,
			right: "18%",
			bottom: 10,
			containLabel: true,
		},
		xAxis: {
			type: "category",
			splitLine: {
				show: true,
			},
			axisLabel: {
				margin: 30,
				fontSize: 12,
				fontFamily: "Pretendard",
				color: "#75777F",
			},
			boundaryGap: false,
			data: xData, // 날짜를 x축에 표시
		},
		yAxis: {
			type: "value",
			axisLabel: {
				margin: 30,
				fontSize: 12,
				formatter: "#{value}",
				fontFamily: "Pretendard",
			},
			inverse: true, // 순위는 값이 클수록 낮은 순위를 의미하므로 역방향으로 설정
			interval: 1,
			min: 1,
			max: Math.min(count, totalRegions - (currentPage - 1) * count), // 표시할 최대 지역 수
		},
		series: generateSeriesList(), // 생성된 시리즈 배열 적용
		color: color,
		animationDuration: 3000,
		animationDurationUpdate: 1000,
	};

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

			<div className="mt-4 flex items-center justify-end">
				<div className="flex items-center">
					<label htmlFor="dataCount" className="mr-2 text-textGray">
						Rows per page:
					</label>
					<select
						id="dataCount"
						className="rounded border px-2 py-1"
						value={count}
						onChange={(e) => {
							setCount(Number(e.target.value)); // 페이지 당 지역 수 설정
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
						{currentPage} of {Math.ceil(totalRegions / count)}
					</span>
					<button
						className="p-2"
						disabled={currentPage === Math.ceil(totalRegions / count)}
						onClick={() => setCurrentPage(currentPage + 1)}
					>
						<Next />
					</button>
				</div>
			</div>
		</div>
	);
}
