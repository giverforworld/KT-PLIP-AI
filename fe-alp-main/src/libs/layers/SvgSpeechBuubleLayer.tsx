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

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export function SvgSpeechBubbleLayer({ data, viewport }: any) {
	const svgRef = useRef(null);

	useEffect(() => {
		const bubbleData = data.map((el: any) => ({
			...el,
			center: viewport.project(el.center),
		}));

		const svg = d3.select(svgRef.current);

		svg.selectAll("*").remove(); // 기존 SVG 요소 제거

		// 1. defs 영역에 filter 정의
		const defs = svg.append("defs");
		const filter = defs
			.append("filter")
			.attr("id", "dropShadow")
			.attr("width", "130%")
			.attr("height", "130%");

		filter
			.append("feGaussianBlur")
			.attr("in", "SourceAlpha")
			.attr("stdDeviation", 1) //그림자 세기 조정
			.attr("result", "blur");

		filter
			.append("feOffset")
			.attr("in", "blur")
			.attr("dx", 2)
			.attr("dy", 2)
			.attr("result", "offsetBlur");

		const feMerge = filter.append("feMerge");
		feMerge.append("feMergeNode").attr("in", "offsetBlur");
		feMerge.append("feMergeNode").attr("in", "SourceGraphic");

		// 2. 그룹(join) 및 위치 설정
		const bubbles = svg
			.selectAll(".speech-bubble")
			.data(bubbleData)
			.join("g")
			.attr("class", "speech-bubble")
			.attr("transform", (d: any) => `translate(${d.center[0]}, ${d.center[1]})`);
		// 여기에서 필터 적용 (dropShadow 추가, 성능 저하 이슈가 있는 듯 현재는 비활성화)
		// .attr("filter", "url(#dropShadow)");

		// 역삼각형 추가
		bubbles
			.append("path")
			.attr("d", (d) => {
				const size = 10;
				return `M 0 ${size} L -${size} -${size} L ${size} -${size} Z`;
			})
			.attr("fill", "#202020");

		// 텍스트 추가
		const text = bubbles
			.append("text")
			.attr("class", "bubble-text")
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("y", -20)
			.attr("fill", "white")
			.text((d: any) => {
				if (d.total) return Math.floor(d.total).toLocaleString() + " 명";
				//total이 있으면 total이 조건에 맞는 합산
				//count는 chartData의 모든 합이 됨
				return Math.floor(d.count).toLocaleString() + " 명";
			});

		const bbox = text.node()?.getBBox();
		const padding = 10;
		if (!bbox) return;
		const rectWidth = bbox.width + padding * 2;
		const rectHeight = bbox.height + padding;

		// 사각형 추가 (말풍선 배경)
		bubbles
			.insert("rect", "text")
			.attr("x", -rectWidth / 2)
			.attr("y", -42)
			.attr("rx", 5)
			.attr("ry", 5)
			.attr("width", rectWidth)
			.attr("height", 36)
			.attr("fill", "#202020");
	}, [data, viewport]);

	useEffect(() => {
		const svg = d3.select(svgRef.current);
		const bubbleData = data.map((el: any) => ({
			...el,
			center: viewport.project(el.center),
		}));

		svg
			.selectAll(".speech-bubble")
			.data(bubbleData)
			.join("g")
			.attr("class", "speech-bubble")
			.attr("transform", (d: any) => `translate(${d.center[0]}, ${d.center[1]})`);
	}, [viewport, data]);

	return <svg ref={svgRef} className="h-full w-full"></svg>;
}
