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

import React, { useRef } from "react";
import * as d3 from "d3";
import { WebMercatorViewport } from "deck.gl";
import { MapViewState } from "@deck.gl/core";

export default function SvgMoveIndicator({
	centerEmd,
	viewState,
	emdMap,
	emdMapPropName,
	// centerMap,
	moveMap_oriBased,
	top10Ref,
	isDarkMode,
	layerType,
	inOutFlow,
}: {
	centerEmd: number;
	//emdMap에는 centerEmd 기준으로 이동량 Top10을 찾아서
	//.top10=true / .top10=false로 쓰는 과정이 포함되어 있다.
	viewState: MapViewState;
	emdMap: React.RefObject<any>;
	emdMapPropName: string; //emdcd 가 들어있는 프로퍼티 이름
	// centerMap: React.RefObject<any>; // Read-only
	moveMap_oriBased: React.RefObject<any>; // Read-only
	top10Ref: any;
	isDarkMode: boolean;
	layerType: string;
	inOutFlow: boolean;
}) {
	const svgRef = useRef<SVGSVGElement>(null);
	const centerEmdRef = useRef<number>(0);
	if (!emdMap || !moveMap_oriBased) return;
	// const top10Ref = useRef<any>(null);

	const redrawAll = () => {
		const { width, height } = svgRef.current?.getBoundingClientRect() || {
			width: 0,
			height: 0,
		};
		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove(); // 기존의 SVG 요소를 제거

		// 유출 화살표
		// svg
		// 	.append("defs")
		// 	.append("marker")
		// 	.attr("id", "arrow")
		// 	.attr("viewBox", "0 0 10 10")
		// 	.attr("refX", 5)
		// 	.attr("refY", 5)
		// 	.attr("markerWidth", 6)
		// 	.attr("markerHeight", 6)
		// 	.attr("orient", "auto-start-reverse")
		// 	.append("path")
		// 	.attr("d", "M 0 0 L 10 5 L 0 10 z")
		// 	.attr("fill", isDarkMode ? "white" : "white");

		if (
			centerEmd !== 0 &&
			// centerMap.current &&
			moveMap_oriBased &&
			viewState &&
			top10Ref.current
		) {
			drawInfoCircle(
				width,
				height,
				viewState,
				top10Ref.current,
				// centerMap.current,
				svgRef,
				isDarkMode,
				layerType,
				inOutFlow,
			);
		}
	};

	if (
		// centerEmd !== 0 &&
		// centerEmdRef.current !== centerEmd &&
		// centerMap.current &&
		moveMap_oriBased &&
		viewState
	) {
		reCalculateRank(centerEmd, top10Ref, moveMap_oriBased, emdMap, emdMapPropName, layerType);
		centerEmdRef.current = centerEmd;
	}

	redrawAll();

	return (
		<div className="canvasMove pointer-events-none absolute right-0 top-0 z-[300] h-full w-full">
			<svg className="z-[300] h-full w-full cursor-pointer" id="moveRank" ref={svgRef} />
		</div>
	);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export function reCalculateRank(
	centerEmd: number,
	top10Ref: any,
	moveMap_oriBasedRef: any,
	emdMapRef: any,
	emdMapPropName: string,
	layerType: string,
) {
	const oricd = centerEmd;
	const value = moveMap_oriBasedRef[oricd];
	if (!value) return;
	const orinm = value.orinm;
	const orixy = value.orixy;
	const desArr = value.desArr;

	//desArr 중 ori와 des가 같은 경우는 제외한다.
	if (!desArr) return;
	const filteredDesArr = desArr.filter((d: any) => oricd !== d.descd);

	//desArr을 popu 기준으로 내림차순 정렬후 10개만 추출
	const sortedDesArr = filteredDesArr.sort((a: any, b: any) => b.popu - a.popu);
	let top10: any = [];
	if (layerType === "llpInflow") {
		top10 = sortedDesArr.slice(0, sortedDesArr.length + 1);
	} else {
		top10 = sortedDesArr.slice(0, 12);
	}
	// const top10 = sortedDesArr.slice(0, 12);

	//desArr의 popu 합계를 구한다.
	//ori와 des가 같은 경우에는 제외한다.
	const totalPopu = filteredDesArr.reduce((acc: number, cur: any) => {
		return acc + cur.popu;
	}, 0);

	//top10의 popu 비율을 구해서 top10의 요소로 추가한다.
	top10.forEach((d: any) => {
		d.ratio = d.popu / totalPopu;
	});

	//top10의 descd를 set에 저장한다.
	const descdSet = new Set();
	top10.forEach((d: any) => {
		descdSet.add(d.descd);
	});

	//emdMapRef.current를 순회하면서 요소들 중 properties.adm_cd2가 descdSet에 포함되는 경우,
	//properties.isTop10 = true로 설정한다.
	//아닌 경우는 properties.isTop10 = false로 설정한다.
	emdMapRef.current.features.forEach((d: any) => {
		if (descdSet.has(Number(d.properties[emdMapPropName]))) {
			d.properties.isTop10 = true;
		} else {
			d.properties.isTop10 = false;
		}
	});

	//console.log("top10:", top10);

	const result = {
		oricd,
		orinm,
		orixy,
		top10,
	};
	top10Ref.current = result;
}

function getNormalVector(
	origin: { x: number; y: number },
	destination: { x: number; y: number },
): { x: number; y: number } {
	const normal = {
		x:
			(destination.x - origin.x) /
			Math.sqrt((destination.x - origin.x) ** 2 + (destination.y - origin.y) ** 2),
		y:
			(destination.y - origin.y) /
			Math.sqrt((destination.x - origin.x) ** 2 + (destination.y - origin.y) ** 2),
	};

	return normal;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

function drawInfoCircle(
	width: number,
	height: number,
	viewState: MapViewState,
	top10Ref: any,
	// centerMapRef: any,
	svgRef: React.RefObject<SVGSVGElement | null>,
	isDarkMode: boolean,
	layerType: string,
	inOutFlow: boolean,
) {
	// Define the arrow marker

	const orixy = top10Ref.orixy;
	//const orixy_scr = mapRef.project(new mapboxgl.LngLat(orixy[0], orixy[1]));
	const orixy_scr = { x: 0, y: 0 };
	const viewport = new WebMercatorViewport(viewState);
	[orixy_scr.x, orixy_scr.y] = viewport.project([orixy[0], orixy[1]]);

	//top10을 순회하면서 orixy와 desxy를 연결하는 선을 그린다.
	const top10 = top10Ref.top10.map((d: any) => {
		return {
			descd: d.descd,
			desnm: d.desnm,
			desxy: d.desxy,
			popu: Math.ceil(d.popu),
			ratio: d.ratio,
		};
	});

	const outerRadius = Math.min(width, height) * 0.2;
	const innerRadius = outerRadius - 20;
	const dimLineRadius = outerRadius + 10;
	const dimLineOffset = 20;

	//읍면동 중심점 구하기
	top10.forEach((d: any) => {
		// const desxy = centerMapRef.get(d.descd).center;
		//d.desxy_scr = mapRef.project(new mapboxgl.LngLat(d.desxy[0], d.desxy[1]));
		d.desxy_scr = { x: 0, y: 0 };
		[d.desxy_scr.x, d.desxy_scr.y] = viewport.project([d.desxy[0], d.desxy[1]]);
		//console.log("d.desxy_scr:", d.desxy_scr);
	});

	//읍면동 중심점까지의 노말 벡터
	top10.forEach((d: any) => {
		d.normal = getNormalVector(orixy_scr, d.desxy_scr);
	});

	//읍면동 중심점을 연장해서 원과 맞닿는 점을 구한다.
	top10.forEach((d: any) => {
		d.desxy_scr_outer = {
			x: orixy_scr.x + d.normal.x * outerRadius,
			y: orixy_scr.y + d.normal.y * outerRadius,
		};
	});

	adjustRatioBarLocation(orixy_scr, top10, outerRadius);

	const svg = d3.select(svgRef.current);

	drawOriToDesLine(svg, orixy_scr, top10, outerRadius, isDarkMode);

	//drawDesToCircle(svg, top10, orixy_scr, "desxy_scr_outer", "red");
	//drawDesToCircle(svg, top10, "adjustedOuter", "white");

	//drawDesNm(svg, orixy_scr, top10, outerRadius);

	drawOriNm(svg, orixy_scr, outerRadius, top10Ref.orinm, isDarkMode, layerType, inOutFlow);

	//drawOuterCircle(svg, orixy_scr, innerRadius, outerRadius);

	drawPieChart(svg, orixy_scr, top10, outerRadius, isDarkMode);

	drawDimLine(svg, orixy_scr, top10, outerRadius, dimLineRadius, dimLineOffset, isDarkMode);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function drawOriNm(
	svg: any,
	orixy_scr: any,
	outerRadius: number,
	orinm: string,
	isDarkMode: boolean,
	layerType: string,
	inOutFlow: boolean,
) {
	//원점에서 위쪽으로 outerRadius+100만큼 떨어진 곳에 텍스트를 표시한다.

	svg
		.append("rect")
		.attr("x", orixy_scr.x - 120)
		.attr("y", orixy_scr.y - outerRadius - 135)
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("width", 240)
		.attr("height", 80)
		.attr("fill", "black")
		.attr("opacity", 0.2);
	svg
		.append("text")
		.attr("x", orixy_scr.x)
		.attr("y", orixy_scr.y - outerRadius - 100)
		.text(orinm)
		.attr("fill", isDarkMode ? "white" : "white")
		.attr("font-size", "1.5em")
		.attr("text-anchor", "middle");

	svg
		.append("text")
		.attr("x", orixy_scr.x)
		.attr("y", orixy_scr.y - outerRadius - 70)
		.text(
			layerType === "llpInflow"
				? "유입 인구 순위"
				: inOutFlow
					? "전입 인구 순위"
					: "전출 인구 순위",
		)
		.attr("fill", isDarkMode ? "white" : "white")
		// .attr("fill", "white")
		.attr("font-size", "1.5em")
		.attr("text-anchor", "middle");
}

function drawOriToDesLine(
	svg: any,
	orixy_scr: any,
	top10: any,
	outerRadius: number,
	isDarkMode: boolean,
	color: string = "white",
) {
	//원점에서 desxy로 가는 화살표를 그린다.
	for (let i = 0; i < top10.length; i++) {
		//des 중심이 info 원 안에 있는지 밖에 있는지 확인한다.
		//그에 따라 점선 실선 표시 위치가 달라진다.
		const distToDesxy = Math.sqrt(
			(orixy_scr.x - top10[i].desxy_scr.x) ** 2 + (orixy_scr.y - top10[i].desxy_scr.y) ** 2,
		);

		let ctnLineOri, ctnLineDes;
		let dshLineOri, dshLineDes;

		if (distToDesxy <= outerRadius) {
			ctnLineOri = orixy_scr;
			ctnLineDes = top10[i].desxy_scr;
			dshLineOri = top10[i].desxy_scr;
			dshLineDes = top10[i].adjustedOuter;
		} else {
			ctnLineOri = top10[i].adjustedOuter;
			ctnLineDes = top10[i].desxy_scr;
			dshLineOri = orixy_scr;
			dshLineDes = top10[i].adjustedOuter;
		}

		//실선을 그린다.
		//화살표를 선 중간에 그린다.

		// 중간 지점 계산
		const midPoint = {
			x: (ctnLineOri.x + ctnLineDes.x) / 2,
			y: (ctnLineOri.y + ctnLineDes.y) / 2,
		};

		// 원점에서 중간까지 선 그리기
		const firstHalf = d3.line()([
			[ctnLineOri.x, ctnLineOri.y],
			[midPoint.x, midPoint.y],
		]);

		svg
			.append("path")
			.attr("d", firstHalf)
			.attr("fill", "none")
			.attr("stroke", isDarkMode ? "white" : "white")
			.attr("stroke-width", 2)
			.attr("marker-end", "url(#arrow)");

		// 중간에서 끝까지 선 그리기
		const secondHalf = d3.line()([
			[midPoint.x, midPoint.y],
			[ctnLineDes.x, ctnLineDes.y],
		]);

		svg
			.append("path")
			.attr("d", secondHalf)
			.attr("fill", "none")
			// .attr("stroke", "white")
			.attr("stroke", isDarkMode ? "white" : "white")
			.attr("stroke-width", 2);

		// 끝점에 원 그리기
		svg
			.append("circle")
			.attr("cx", ctnLineDes.x)
			.attr("cy", ctnLineDes.y)
			.attr("r", 3)
			// .attr("fill", "white")
			.attr("fill", isDarkMode ? "white" : "white");

		//점선을 그린다.
		svg
			.append("line")
			.attr("x1", dshLineOri.x)
			.attr("y1", dshLineOri.y)
			.attr("x2", dshLineDes.x)
			.attr("y2", dshLineDes.y)
			// .attr("stroke", color)
			.attr("stroke", isDarkMode ? "white" : "white")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "5,5");
	}
}

function drawDesToCircle(
	svg: any,
	top10: any,
	orixy_scr: any,
	drawField: string,
	isDarkMode: boolean,
	color: string = "white",
) {
	//원점에서 desxy로 가는 화살표를 그린다.
	for (let i = 0; i < top10.length; i++) {
		const desxy_scr = orixy_scr;
		const desxy_scr_outer = top10[i][drawField];
		svg
			.append("line")
			.attr("x1", desxy_scr.x)
			.attr("y1", desxy_scr.y)
			.attr("x2", desxy_scr_outer.x)
			.attr("y2", desxy_scr_outer.y)
			// .attr("stroke", color)
			.attr("stroke", isDarkMode ? "white" : "white")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "5,5");
	}
}

function drawDesNm(svg: any, orixy_scr: any, top10: any, outerRadius: number) {
	//원점에서 desxy로 가는 화살표를 그린다.
	for (let i = 0; i < top10.length; i++) {
		const desxy_scr_outer = top10[i].adjustedOuter;
		const desnm = `${top10[i].desnm} ${top10[i].rank + 1}위`;
		svg
			.append("text")
			.attr("x", desxy_scr_outer.x)
			.attr("y", desxy_scr_outer.y)
			.text(desnm)
			.attr("fill", "white")
			.attr("font-size", "10px");
	}
}

function drawOuterCircle(svg: any, orixy_scr: any, innerRadius: number, outerRadius: number) {
	svg
		.append("circle")
		.attr("cx", orixy_scr.x)
		.attr("cy", orixy_scr.y)
		.attr("r", innerRadius)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-width", 1);

	svg
		.append("circle")
		.attr("cx", orixy_scr.x)
		.attr("cy", orixy_scr.y)
		.attr("r", outerRadius)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-width", 1);
}

function drawPieChart(
	svg: any,
	orixy_scr: any,
	top10: any,
	outerRadius: number,
	isDarkMode: boolean,
) {
	const mapColor = d3.scaleSequential(d3.interpolateReds).domain([0, top10.length - 1]);

	// 원점에서 desxy로 가는 화살표를 그린다.
	for (let i = 0; i < top10.length; i++) {
		//const normal = getNormalVector(orixy_scr, top10[i].adjustedOuter);

		// unitVector의 각도를 구한다.
		const angle = Math.atan2(
			top10[i].adjustedOuter.y - orixy_scr.y,
			top10[i].adjustedOuter.x - orixy_scr.x,
		);

		const ratio = top10[i].ratio;
		const startAngle = -1 * Math.PI * ratio;
		const endAngle = 1 * Math.PI * ratio;
		const arc = d3.arc()({
			innerRadius: outerRadius - 20,
			outerRadius: outerRadius,
			startAngle: startAngle,
			endAngle: endAngle,
		});

		let color = d3.color(mapColor(top10[i].rank)) as d3.RGBColor;

		svg
			.append("path")
			.attr("d", arc)
			//.attr("fill", `rgb(${color.r}, ${color.g}, ${color.b}, ${1.0})`)
			.attr("fill", `rgb(255, 60, 30, ${1.0})`)
			.attr(
				"transform",
				`translate(${orixy_scr.x}, ${orixy_scr.y}) rotate(${(angle + 0) * (180 / Math.PI) + 90})`,
			);
	}
}

function drawDimLine(
	svg: any,
	orixy_scr: any,
	top10: any,
	outerRadius: number,
	dimLineRadius: number,
	dimLineOffset: number,
	isDarkMode: boolean,
) {
	const upperLeftDim = new Array();
	const upperRightDim = new Array();
	const lowerLeftDim = new Array();
	const lowerRightDim = new Array();

	//원점에서 desxy로 가는 화살표를 그린다.
	for (let i = 0; i < top10.length; i++) {
		const desxy_scr_outer = top10[i].adjustedOuter;

		//일단 1차 지시선은 직접 그리고
		const normal = getNormalVector(orixy_scr, desxy_scr_outer);
		const dimLineOri = {
			x: desxy_scr_outer.x,
			y: desxy_scr_outer.y,
		};

		const dimLineDes = {
			x: desxy_scr_outer.x + normal.x * dimLineOffset,
			y: desxy_scr_outer.y + normal.y * dimLineOffset,
		};
		svg
			.append("line")
			.attr("x1", dimLineOri.x)
			.attr("y1", dimLineOri.y)
			.attr("x2", dimLineDes.x)
			.attr("y2", dimLineDes.y)
			// .attr("stroke", "#cccccc")
			.attr("stroke", isDarkMode ? "#cccccc" : "white")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "2,4");

		svg
			.append("circle")
			.attr("cx", dimLineOri.x)
			.attr("cy", dimLineOri.y)
			.attr("r", Math.max(2, 10 - 2 * top10[i].rank))
			.attr("fill", isDarkMode ? "white" : "white")
			// .attr("stroke", isDarkMode ? "white" : "white")
			.attr("stroke", "white")
			.attr("stroke-width", 1);
		//2차 지시선과 텍스트는 전체 텍스트를 사분면씩 4분할 한 후
		//각 사분면에 대해 y=0 부근을 중심으로 정렬을 한다.
		//텍스트 상하 겹침을 방지하기 위해 각각의 기준점부터
		//위 혹은 아래로 진행하면서 텍스트 높이를 순차적으로 확보해간다.
		if (dimLineDes.x < orixy_scr.x) {
			if (dimLineDes.y < orixy_scr.y) {
				upperLeftDim.push({ index: i, dimLineDes });
			} else {
				lowerLeftDim.push({ index: i, dimLineDes });
			}
		}
		if (dimLineDes.x > orixy_scr.x) {
			if (dimLineDes.y < orixy_scr.y) {
				upperRightDim.push({ index: i, dimLineDes });
			} else {
				lowerRightDim.push({ index: i, dimLineDes });
			}
		}
	}

	upperLeftDim.sort((a: any, b: any) => b.dimLineDes.y - a.dimLineDes.y);
	upperRightDim.sort((a: any, b: any) => b.dimLineDes.y - a.dimLineDes.y);

	lowerLeftDim.sort((a: any, b: any) => a.dimLineDes.y - b.dimLineDes.y);
	lowerRightDim.sort((a: any, b: any) => a.dimLineDes.y - b.dimLineDes.y);

	//upperLeftDim, uppdrRightDim, lowerLeftDim, lowerRightDim을 순회하면서
	//텍스트를 표시한다.
	const textGap = 30;
	let prev_y = 0;
	//y좌표 점점 작아짐
	upperLeftDim.forEach((d: any, i: number) => {
		const textLoc = {
			x: orixy_scr.x - dimLineRadius - dimLineOffset * 2,
			y: d.dimLineDes.y,
		};
		if (i == 0) {
			prev_y = textLoc.y;
		} else {
			if (prev_y - textLoc.y < textGap) {
				textLoc.y = Math.min(textLoc.y, prev_y - textGap);
			}
			prev_y = textLoc.y;
		}
		drawLineAndText(svg, d.dimLineDes, textLoc, "end", top10, d.index, isDarkMode);
	});

	upperRightDim.forEach((d: any, i: number) => {
		const textLoc = {
			x: orixy_scr.x + dimLineRadius + dimLineOffset * 2,
			y: d.dimLineDes.y,
		};
		if (i == 0) {
			prev_y = textLoc.y;
		} else {
			if (prev_y - textLoc.y < textGap) {
				textLoc.y = Math.min(textLoc.y, prev_y - textGap);
			}
			prev_y = textLoc.y;
		}
		drawLineAndText(svg, d.dimLineDes, textLoc, "start", top10, d.index, isDarkMode);
	});

	//y좌표 점점 커짐

	lowerLeftDim.forEach((d: any, i: number) => {
		const textLoc = {
			x: orixy_scr.x - dimLineRadius - dimLineOffset * 2,
			y: d.dimLineDes.y,
		};
		if (i == 0) {
			prev_y = textLoc.y;
		} else {
			if (textLoc.y - prev_y < textGap) {
				textLoc.y = Math.max(textLoc.y, prev_y + textGap);
			}
			prev_y = textLoc.y;
		}
		drawLineAndText(svg, d.dimLineDes, textLoc, "end", top10, d.index, isDarkMode);
	});

	lowerRightDim.forEach((d: any, i: number) => {
		const textLoc = {
			x: orixy_scr.x + dimLineRadius + dimLineOffset * 2,
			y: d.dimLineDes.y,
		};
		if (i == 0) {
			prev_y = textLoc.y;
		} else {
			if (textLoc.y - prev_y < textGap) {
				textLoc.y = Math.max(textLoc.y, prev_y + textGap);
			}
			prev_y = textLoc.y;
		}
		drawLineAndText(svg, d.dimLineDes, textLoc, "start", top10, d.index, isDarkMode);
	});

	return;

	/////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////
	function drawLineAndText(
		svg: any,
		ori: { x: number; y: number },
		des: { x: number; y: number },
		anchor: string,
		top10: any,
		index: number,
		isDarkMode: boolean,
	) {
		const desnm = `${top10[index].rank + 1}위 ${top10[index].desnm} ${top10[index].popu.toLocaleString()}명`;

		// 그룹(g) 요소 생성하여 선, 텍스트, 사각형을 포함
		const group = svg.append("g");

		// 1. 선(line) 추가
		group
			.append("line")
			.attr("x1", ori.x)
			.attr("y1", ori.y)
			.attr("x2", des.x)
			.attr("y2", des.y)
			.attr("stroke", "#cccccc")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "2,4");

		// 2. 텍스트(text) 추가
		const text = group
			.append("text")
			.attr("x", des.x)
			.attr("y", des.y)
			.text(desnm)
			.attr("fill", "white")
			// .attr("fill", isDarkMode ? "white" : "#333333")
			.attr("font-size", "1.0em")
			.attr("text-anchor", anchor) // "start", "middle", "end"
			.attr("dominant-baseline", "middle"); // 수직 중앙 정렬

		// 3. 텍스트의 바운딩 박스(bbox) 측정
		const bbox = text.node().getBBox();
		const padding = 10; // 사각형과 텍스트 사이의 여백

		// 4. 사각형(rect)의 위치와 크기 계산
		let rectX;
		if (anchor === "start") {
			rectX = des.x - padding;
		} else if (anchor === "middle") {
			rectX = des.x - bbox.width / 2 - padding;
		} else if (anchor === "end") {
			rectX = des.x - bbox.width - padding;
		} else {
			rectX = des.x - padding; // 기본값
		}

		const rectY = des.y - bbox.height / 2 - padding / 2 - 2;
		const rectWidth = bbox.width + padding * 2;
		const rectHeight = bbox.height + padding;

		// 5. 사각형(rect) 추가 (텍스트 앞에 삽입하여 뒤로 배치)
		group
			.insert("rect", "text")
			.attr("x", rectX)
			.attr("y", rectY)
			.attr("rx", 5)
			.attr("ry", 5)
			.attr("width", rectWidth)
			.attr("height", rectHeight)
			.attr("fill", "black")
			.attr("opacity", 0.2);
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//겹친 위치들을 적절히 조정한다.
function adjustRatioBarLocation(orixy_scr: any, top10: any, outerRadius: number) {
	//console.log("top10:", top10);
	//데이터 준비
	prepareData();

	//겹치는 요소들을 펼치면서 조정한다.
	rearrangeOverlap();

	//교차하는 선들을 스왑 형식으로 순차적으로 풀어낸다.
	unravelLines();

	return;
	//////////////////////////////////////////////////////
	////////////////////////////////////////////////////////

	function prepareData() {
		//top10의 순서대로 인덱스를 부여한다.
		top10.forEach((d: any, i: number) => {
			d.rank = i;
		});

		top10.forEach((d: any, i: number) => {
			const distToDesxy = Math.sqrt(
				(orixy_scr.x - d.desxy_scr.x) ** 2 + (orixy_scr.y - d.desxy_scr.y) ** 2,
			);

			if (distToDesxy <= outerRadius) {
				d.isInner = true;
			} else {
				d.isInner = false;
			}
		});

		//top에 desExtendedArr와 normalVector 각도를 추가한다.
		top10.forEach((d: any, i: number) => {
			d.angle = Math.atan2(d.desxy_scr_outer.y - orixy_scr.y, d.desxy_scr_outer.x - orixy_scr.x);
		});
	}

	function rearrangeOverlap() {
		//top을 angle로 정렬한다.
		top10.sort((a: any, b: any) => a.angle - b.angle);
		const buffer = 0.03;
		const moveLimit = 0.03;
		//top을 순회하면서 이전, 이후 요소와의 각도 차이를 구한다.
		//ratioBar의 폭을 구한다. 폭은 angle 끝점에서 양쪽으로 360도 중 차지하는 비율의 절반만큼씩이다.
		//ratioBar가 이전, 이후 요소와 겹치지 않도록 조정한다.
		//이전 요소와 겹치면 이전 요소와 지금 요소가 서로 반대 방향으로 조금씩 이동한다.
		//이후 요소와 겹치면 이후 요소와 지금 요소가 서로 반대 방향으로 조금씩 이동한다.
		//이동하는 정도는 ratio에 반비례한다. 즉, ratio가 클수록 조금 이동하고 작을수록 많이 이동한다.
		//겹치는 만큼 모두 이동하지 말고, 이동은 1도 이하로 제한한다.
		//마지막 요소의 경우에는 처음 요소와도 비교한다. 원으로 상정하고 있기 때문이다.
		//이 비교를 20회 반복한다.

		for (let i = 0; i < 800; i++) {
			let moveCnt = 0;
			for (let prev = 0; prev < top10.length; prev++) {
				for (let next = prev + 1; next < top10.length; next++) {
					const angleDiff = angleDifference(top10[prev].angle, top10[next].angle);

					const prevRatio = top10[prev].ratio;
					const nextRatio = top10[next].ratio;

					//두 각 중 180도 이내의 각도 차이 기준으로 prevAngle이 시계방향쪽에 있는지 확인한다.
					let moveDirection = 1;
					const isPrevCW = Math.abs(top10[prev].angle - top10[next].angle) < Math.PI;
					if (isPrevCW) moveDirection = -1;

					const prevWidthHalf = prevRatio * Math.PI;
					const nextWidthHalf = nextRatio * Math.PI;

					const overlap = prevWidthHalf + nextWidthHalf + buffer - Math.abs(angleDiff);

					if (overlap > 0) {
						let move = Math.min(moveLimit, Math.abs(overlap));
						let weight_next = top10[prev].ratio / (top10[prev].ratio + top10[next].ratio);
						let weight_prev = top10[next].ratio / (top10[prev].ratio + top10[next].ratio);

						top10[prev].angle += moveDirection * move * weight_prev;
						top10[next].angle -= moveDirection * move * weight_next;
						if (move > 0.001) moveCnt++;
						//console.log("weight_prev+weight_this:", weight_prev, weight_this);
					}
				}
			}
			if (moveCnt === 0) {
				//console.log("loop:", i);
				break;
			}
		}

		//각 요소의 최종 위치를 계산하여 업데이트합니다.
		top10.forEach((d: any) => {
			d.adjustedOuter = {
				x: orixy_scr.x + outerRadius * Math.cos(d.angle),
				y: orixy_scr.y + outerRadius * Math.sin(d.angle),
			};
		});
	}

	function unravelLines() {
		top10.sort((a: any, b: any) => a.angle - b.angle);
		//console.log("top10:", top10);
		let crossCnt = 1;
		//점선이 교차하는지 검증해서 교차하면 서로 스왑한다.
		while (crossCnt > 0) {
			//console.log("crossCnt:", crossCnt);
			crossCnt = 0;
			for (let j = 0; j < top10.length; j++) {
				const p0 = top10[j];
				const p1 = j == top10.length - 1 ? top10[0] : top10[j + 1];

				const line0_ori = p0.isInner ? p0.desxy_scr : orixy_scr;
				const line0_des = p0.adjustedOuter;

				const line1_ori = p1.isInner ? p1.desxy_scr : orixy_scr;
				const line1_des = p1.adjustedOuter;

				//line0과 line1 선분이 교차하는지 검증한다.
				const isCross = checkLineCross(line0_ori, line0_des, line1_ori, line1_des);
				//console.log("i,j:", p0.index, p1.index, isCross);
				if (isCross) {
					//console.log("cross:", p0.index, p1.index);
					//교차하면 서로 스왑한다.
					swapAngle(p0, p1);
					crossCnt++;
					p0.adjustedOuter = {
						x: orixy_scr.x + outerRadius * Math.cos(p0.angle),
						y: orixy_scr.y + outerRadius * Math.sin(p0.angle),
					};
					p1.adjustedOuter = {
						x: orixy_scr.x + outerRadius * Math.cos(p1.angle),
						y: orixy_scr.y + outerRadius * Math.sin(p1.angle),
					};
					//매번 정렬하지 않으면 어디선가 꼬인다.
					top10.sort((a: any, b: any) => a.angle - b.angle);
				}
			}
		}
	}

	function angleDifference(angle1: number, angle2: number) {
		let diff = angle2 - angle1;
		while (diff > Math.PI) {
			diff -= 2 * Math.PI;
		}
		while (diff < -Math.PI) {
			diff += 2 * Math.PI;
		}
		return diff;
	}

	function isAngle0CWFunc(angle0: number, angle1: number) {
		// 두 각도의 차이를 구합니다.
		let diff = angle1 - angle0;

		// 차이를 -π와 π 사이의 값으로 만듭니다.
		while (diff > Math.PI) {
			diff -= 2 * Math.PI;
		}
		while (diff < -Math.PI) {
			diff += 2 * Math.PI;
		}

		return diff > 0 ? false : true;
	}

	//각 요소의 angle위치에서 ratio의 절반만큼 angle 바깥쪽으로 offset한다.
	//각각 바깥쪽으로 offset한 두 angle의 중점을 구한다.
	//그 중점을 기준으로 angle을 점대칭해서 바꾼다.
	function swapAngle(p0: any, p1: any) {
		const angle0 = p0.angle;
		const angle1 = p1.angle;
		const ratio0 = p0.ratio;
		const ratio1 = p1.ratio;

		const offset0 = ratio0 * Math.PI;
		const offset1 = ratio1 * Math.PI;

		//angle0이 angle1보다 시계방향에 있으면 angle0에서는 offset을 더하고,
		//angle1에서는 offset을 뺀다.
		const isAngle0CW = isAngle0CWFunc(angle0, angle1);
		const angle0_outer = isAngle0CW ? angle0 + offset0 : angle0 - offset0;
		const angle1_outer = isAngle0CW ? angle1 - offset1 : angle1 + offset1;
		// if (isAngle0CW) console.log("isAngle0CW:", angle0, angle1);

		const angle1_new = isAngle0CW ? angle0_outer - offset1 : angle0_outer + offset1;
		const angle0_new = isAngle0CW ? angle1_outer + offset0 : angle1_outer - offset0;

		p0.angle = angle0_new;
		p1.angle = angle1_new;
	}

	function checkLineCross(p0: any, p1: any, p2: any, p3: any) {
		const ccw = (p0: any, p1: any, p2: any) => {
			return (p2.y - p0.y) * (p1.x - p0.x) > (p1.y - p0.y) * (p2.x - p0.x);
		};
		return ccw(p0, p2, p3) !== ccw(p1, p2, p3) && ccw(p0, p1, p2) !== ccw(p0, p1, p3);
	}
}
