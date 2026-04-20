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

"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface D3SvgComponentProps {
	width: number;
	height: number;
	data: any;
}

type ChartData = {
	center: [number, number];
	chartData: { [key: string]: number };
	count: number;
	viewState: any;
}[];

export function SvgChartLayer({ data, viewport, viewState, analysisType }: any) {
	const [zoomLevel, setZoomLevel] = React.useState(viewport.zoom / 30);
	const svgRef = useRef(null);

	useEffect(() => {
		const chartDataArr: ChartData = data.map((el: any, index: number) => ({
			...el,
			center: [viewport.project(el.center)[0] + index * 10, viewport.project(el.center)[1]],
			chartData: transformChartData(el.chartData),
		}));

		const numOfKeys = chartDataArr[0].chartData.length;
		if (numOfKeys === 0) return;

		const svg = d3.select(svgRef.current);

		svg.selectAll("*").remove(); // 기존의 SVG 요소를 제거

		// 수정된 스케일 정의
		const xScale = d3
			.scaleLinear()
			.domain([0, numOfKeys - 1])
			.range([0, 40 * numOfKeys]);

		// 그룹을 join하여 위치를 설정하고 텍스트를 추가
		const chartGroup = svg
			.selectAll(".d3Chart-bubble")
			.data(chartDataArr)
			.join("g") // 그룹 요소를 생성
			.attr("class", "speech-bubble")
			.attr(
				"transform",
				(d) =>
					`scale(${zoomLevel}) translate(${d.center[0] / zoomLevel}, ${d.center[1] / zoomLevel})`,
			);
		// .attr(
		// 	"transform",
		// 	(d) => `translate(${d.center[0] - 100}, ${d.center[1] + 50}) scale(${zoomLevel})`,
		// ); // 위치 설정 및 스케일 조정

		// 첫 번째 사각형 추가
		chartGroup
			.append("rect")
			.attr("transform", "translate(-100, 50)")
			.attr("x", -xScale(0.5)) // 사각형의 x 위치
			.attr("width", xScale(numOfKeys + 0.5)) // 사각형의 너비
			.attr("height", 2) // 사각형의 높이
			.attr("fill", "white"); // 사각형 색상 흰색

		// 두 번째 사각형 추가
		chartGroup
			.append("rect")
			.attr("transform", "translate(-100, 50)")
			.attr("x", -xScale(0.5))
			.attr("y", 5)
			.attr("rx", 5)
			.attr("ry", 5)
			.attr("width", xScale(numOfKeys + 0.5))
			.attr("height", 22)
			.attr("opacity", 0.3);

		chartGroup.each(function (d, i) {
			const group = d3.select(this);
			const chartDataArray: Array<ChartObj> = d.chartData as any;

			// 스케일 정의 (chartData의 값에 따라 다르게 설정 가능)
			const maxValue = d3.max(chartDataArray, (d) => d.total) || 1;
			const localYScale = d3.scaleLinear().domain([0, maxValue]).range([0, 200]);

			group
				.selectAll(".chart-rect") // 클래스 이름 변경
				.data(chartDataArray)
				.join("rect") // 'circle'을 'rect'로 변경
				.attr("class", (d, i) => `chart-rect chart-rect-${i}`)
				.attr("x", (d, i) => xScale(i) - 5) // 사각형의 x 위치 (너비의 절반만큼 이동)
				.attr("width", 34) // 사각형의 너비 (숫자 값으로 수정)
				.attr("y", (d) => -localYScale(d.total) - 4) // 사각형의 y 위치 (높이의 절반만큼 이동)
				.attr("height", (d) => localYScale(d.total) + 4) // 사각형의 높이
				.attr("fill", "white") // 사각형 색상 흰색
				.attr("transform", "translate(-100, 50)");

			group
				.selectAll(".chart-rect_feml") // 클래스 이름 변경
				.data(chartDataArray)
				.join("rect") // 'circle'을 'rect'로 변경
				.attr("class", (d, i) => `chart-rect chart-rect-${i}`)
				.attr("x", (d, i) => xScale(i) - 3) // 사각형의 x 위치 (너비의 절반만큼 이동)
				.attr("width", 30) // 사각형의 너비 (숫자 값으로 수정)
				.attr("y", (d) => -localYScale(d.feml))
				.attr("height", (d) => localYScale(d.feml)) // 사각형의 높이
				.attr("fill", "#ff4d4d")
				.attr("transform", "translate(-100, 50)");

			group
				.selectAll(".chart-rect_male") // 클래스 이름 변경
				.data(chartDataArray)
				.join("rect") // 'circle'을 'rect'로 변경
				.attr("class", (d, i) => `chart-rect chart-rect-${i}`)
				.attr("x", (d, i) => xScale(i) - 3) // 사각형의 x 위치 (너비의 절반만큼 이동)
				.attr("width", 30) // 사각형의 너비 (숫자 값으로 수정)
				.attr("y", (d) => -localYScale(d.feml) - localYScale(d.male) - 2)
				.attr("height", (d) => localYScale(d.male)) // 사각형의 높이
				.attr("fill", "#4a6bf6") //; // 사각형 색상 흰색 사각형 색상 흰색
				.attr("transform", "translate(-100, 50)");

			group
				.selectAll(".chart-label")
				.data(chartDataArray)
				.join("text")
				.attr("class", "chart-label")
				.attr("x", (d) => xScale(d.index) + 12) // x 위치
				.attr("y", (d) => 20) // y 위치 (사각형 위쪽)
				.attr("text-anchor", "middle") // 가운데 정렬
				.attr("fill", "white") // 텍스트 색상
				.attr("font-size", "12px") // 폰트 사이즈 12로 설정
				.text((d) => d.label) // label 텍스트
				.attr("transform", "translate(-100, 50)");
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const chartDataArr = React.useMemo(() => {
		return data?.map((el: any) => ({
			...el,
			center: viewport.project(el.center),
			chartData: transformChartData(el.chartData),
		}));
	}, [data, viewport]);

	React.useEffect(() => {
		const svg = d3.select(svgRef.current);
		// let scaleFactor = +chartDataArr[1].regionCode > 1000 ? 1 / 12000 : 1 / 4000;

		let scaleFactor = 1 / 14000;
		if (analysisType === 3) scaleFactor = 1 / 4000;
		// if (chartDataArr[1].regionCode.toString().startsWith("11")) scaleFactor = 1 / 16000;
		// scaleFactor = 1 / 12000;

		setZoomLevel(Math.pow(viewState.zoom, 3.5) * scaleFactor);
		// console.log(viewState.zoom);
		// 기존 요소 선택 및 데이터 재바인딩
		const chartGroup = svg
			.selectAll(".speech-bubble")
			.data(chartDataArr)
			.join("g")
			.attr("class", "speech-bubble")
			.attr(
				"transform",
				(d: any) =>
					`scale(${zoomLevel}) translate(${d.center[0] / zoomLevel}, ${d.center[1] / zoomLevel})`,
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chartDataArr, viewState]);

	return <svg ref={svgRef} className="h-full w-full"></svg>;
}

type ChartObj = { label: string; total: number; index: number; feml: number; male: number };

const transformChartData = (chartData: { [key: string]: number }) => {
	const transformed: any = {};

	Object.entries(chartData).forEach(([key, value]) => {
		const [gender, ageStr] = key.split("_");
		const age = parseInt(ageStr, 10);
		let ageGroup: string;

		// 나이에 따라 그룹화
		if (age === 0) {
			ageGroup = "10대 미만";
		} else if (age === 80) {
			ageGroup = "80대 이상";
		} else {
			ageGroup = `${Math.floor(age / 10) * 10}대`;
		}

		// gender를 소문자로 변환
		const lowerCaseGender = gender.toLowerCase();

		if (!transformed[ageGroup]) {
			transformed[ageGroup] = { label: ageGroup, total: 0 }; // label 속성으로 변경
		}
		transformed[ageGroup][lowerCaseGender] = value; // 소문자로 변환된 gender 사용
		transformed[ageGroup].total += value; // total에 값 추가
	});

	// label의 숫자 부분을 기준으로 정렬
	const sortedTransformed = Object.values(transformed)
		.sort((a: any, b: any) => {
			const aAge = a.label === "10대 미만" ? 0 : parseInt(a.label);
			const bAge = b.label === "80대 이상" ? 80 : parseInt(b.label);
			return aAge - bAge;
		})
		.map((item: any, index) => ({ ...item, index })); // index 속성 추가

	return sortedTransformed as {
		label: string;
		feml?: number;
		male?: number;
		total: number;
		index: number; // index 속성 추가
	}[];
};
