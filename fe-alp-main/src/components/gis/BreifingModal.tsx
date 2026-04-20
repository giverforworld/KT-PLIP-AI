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

import { EGender } from "@/constants/gis";
import { formatUnixToString, numberToDate } from "@/libs/gisOptionFunc";
import { filterCountObjAny } from "@/libs/layers/recountFnts";
import { useIsAnalysisStore } from "@/store/gis/isAnalysis";
import { useTimeSeriesStatusStore } from "@/store/gis/timeSeriesStatus";
import { getNumberToFirstDay } from "@/utils/date";
import { endOfMonth, format, startOfMonth } from "date-fns";
import React from "react";

export default function BreifingModal({
	mapIdx,
	serverMapData,
	gisSettings,
	viewState,
}: {
	mapIdx: number;
	serverMapData: any;
	gisSettings: GisSettings;
	viewState: any;
}) {
	const timeData = useTimeSeriesStatusStore(s=>s.timeSeriesStatus);
	const isMapActive = useIsAnalysisStore((s) => s.isAnalysis);
	const { isTimeLine, analysisType, analysisSubType, isGrid } = gisSettings;
	const { startDate, endDate } = gisSettings.maps[mapIdx];
	const { isGridScaleAuto, gridScale } = gisSettings;
	const { inOutFlow } = gisSettings.maps[mapIdx];
	const [count, setCount] = React.useState(0);
	const [date, setDate] = React.useState({
		startDate: "",
		endDate: "",
	});

	const [dateInfo, setDateInfo] = React.useState("");
	const gridScaleValue: number = React.useMemo(() => {
		// return 0.25;
		return !isGridScaleAuto
			? gridScale
			: viewState.zoom >= 12
				? 0.25
				: viewState.zoom > 10 && viewState.zoom < 12
					? 0.5
					: 1;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewState.zoom, isGridScaleAuto, gridScale]);
	React.useEffect(() => {
		if (!serverMapData) return;
		if (isTimeLine) {
			const timeDate = formatUnixToString(Number(timeData?.currentTime), 1) ?? "-";
			const timeValue = timeData?.currentValue ?? 0;
			setDate({
				startDate: timeDate,
				endDate: timeDate,
			});
			setDateInfo(timeDate);
			setCount(timeValue);
		} else if (
			serverMapData?.res &&
			typeof serverMapData.res !== "string"
			// && serverMapData?.res.length > 0
		) {
			// 데이터형식이 레이어마다 다르고, 각 레이어데이터에 대해 상황에 맞는 count를 해서 수치를 표시해 주어야 함.
			let obj;
			if (Array.isArray(serverMapData.res)) {
				if (serverMapData.res.length === 0) return;
				obj = serverMapData.res[0];

				// 격자데이터인 경우
				if (obj.layerData[Object.keys(obj.layerData)[0]][gridScaleValue]?.length) {
					obj = obj.layerData[Object.keys(obj.layerData)[0]][gridScaleValue];
				}
			} else {
				// OD데이터인 경우
				// const flow = inOutFlow ? "inflow" : "outflow";
				const flow = Object.keys(serverMapData.res)[0];
				obj = serverMapData.res[flow][0];
				if (obj.layerData[Object.keys(obj.layerData)[0]][gridScaleValue]?.length) {
					obj = obj.layerData[Object.keys(obj.layerData)[0]][gridScaleValue];
				}
			}
			const fullStartDate = format(
				gisSettings.maps[mapIdx].dateType === 0
					? startOfMonth(numberToDate(getNumberToFirstDay(startDate)))
					: numberToDate(getNumberToFirstDay(startDate)),
				"yyyyMMdd",
			);
			const fullEndDate = format(
				gisSettings.maps[mapIdx].dateType === 0
					? endOfMonth(numberToDate(getNumberToFirstDay(endDate)))
					: numberToDate(getNumberToFirstDay(endDate)),
				"yyyyMMdd",
			);

			const startYear = fullStartDate.toString().slice(0, 4);
			const startMonth = fullStartDate.toString().slice(4, 6);
			const startDay = fullStartDate.toString().slice(6, 8);
			const endMonth = fullEndDate.toString().slice(4, 6);
			const endDay = fullEndDate.toString().slice(6, 8);
			// const endYear = endDate.toString().slice(0, 4);

			setDate({
				startDate: `${startYear}년 ${startMonth}월 ${startDay}일`,
				endDate: `${endMonth}월 ${endDay}일`,
			});
			setDateInfo(`${startYear}년 ${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`);
			let sum = 0;

			// 생활인구 행정구역일 경우 성연령 필터
			if (analysisType === 0 && !isGrid) {
				const layerData = obj?.layerData;
				if (!layerData) return;
				const data: any = Object.values(layerData)[0];
				sum = filterAdmData(data, gisSettings.maps[mapIdx]);
			} else {
				sum = sumCounts(obj);
			}
			// obj가 배열인 경우엔 격자데이터 이므로 바로 카운트
			// 객체인 경우엔 격자데이터가 아닌 서버로 부터 받은 데이터이므로 layerData의 데이터 배열을 찾아 카운트
			const count = Array.isArray(obj)
				? obj.length
				: obj.layerData[Object.keys(obj.layerData)[0]].length || 10;
			// setCount(analysisType / 3 === 0 ? sum / count : sum);

			// 생활인구 격자일 경우
			setCount(analysisType === 0 && isGrid ? sum / count : sum);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverMapData, timeData, inOutFlow, gridScaleValue]);
	// if (!isMapActive) return null;

	if (!serverMapData) return null;
	if (count === 0 || !isMapActive) return null;
	if (analysisType === 2 && analysisSubType === 1) return null;
	return (
		<div className="min-w-76 absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-[50px] border-[3px] bg-white p-3 px-6 pb-1">
			<div className="flex w-full flex-col items-center">
				<p className="text-[14px] font-semibold">{dateInfo}</p>
				<div className="flex w-full items-center justify-center gap-4">
					{!isTimeLine && (
						<p className="text-[14px] font-bold">{analysisType / 3 === 0 ? "평균" : "합계"}</p>
					)}
					<p className="text-[24px] font-bold text-[#D63457]">
						{Math.ceil(count).toLocaleString()} 명
					</p>
				</div>
			</div>
		</div>
	);
}

/**
 * 객체/배열을 순회하며 'count' 키가 있는 경우,
 * 그 값이 숫자면 합산하고, 객체이면 내부 모든 숫자를 합산한다.
 */
function sumCounts(obj: any): number {
	let total = 0;

	if (Array.isArray(obj)) {
		// 배열이면 각 요소를 재귀적으로 확인
		for (const item of obj) {
			total += sumCounts(item);
		}
	} else if (obj !== null && typeof obj === "object") {
		// 객체이면 모든 키를 순회
		for (const key in obj) {
			const value = obj[key];
			if (key === "count") {
				// 'count' 키를 발견한 경우
				if (typeof value === "number") {
					// 숫자면 직접 합산
					total += value;
				} else if (value !== null && typeof value === "object") {
					// 객체라면, 그 안에 있는 모든 숫자를 합산
					total += sumAllNumbers(value);
				}
			} else {
				// 그 외 키들도 중첩된 'count'가 있을 수 있으므로 재귀
				total += sumCounts(value);
			}
		}
	}
	// obj가 null, number, string 등인 경우에는 따로 처리할 필요가 없음
	return total;
}

/**
 * 객체/배열 내부에 있는 '모든 숫자'를 합산한다.
 * 'count' 키 여부와 상관없이 숫자만 골라 더해주는 보조 함수.
 */
function sumAllNumbers(obj: any): number {
	let total = 0;

	if (Array.isArray(obj)) {
		// 배열이면 재귀적으로 요소 순회
		for (const item of obj) {
			total += sumAllNumbers(item);
		}
	} else if (obj !== null && typeof obj === "object") {
		// 객체이면 모든 키 순회
		for (const key in obj) {
			total += sumAllNumbers(obj[key]);
		}
	} else if (typeof obj === "number") {
		// 숫자면 합산
		total += obj;
	}

	return total;
}

/**
 * 객체/배열 내부에 있는 성연령별 필터
 */
function filterAdmData(
	admData: { [key: string]: any }[],
	mapSettings: MapSettings,
	// isMovingPurpose: boolean,
) {
	const { gender, ageGroup } = mapSettings;

	//  필터 만들기
	const GFilter = gender.map((p: number) => EGender[p]);
	const ageFilter = ageGroup.map((el) => el - 1 + "0");

	// 반환값으로 사용될 변수 생성
	let filteredObj: { [key: string]: any }[] = admData.map((el) => el.count);

	if (typeof filteredObj[0] === "object") {
		filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, ageFilter));
		filteredObj = filteredObj.map((el: any) => filterCountObjAny(el, GFilter));
	}
	let total = 0;
	filteredObj.map((el: any, idx: number) => {
		let count = el;
		if (typeof el === "object")
			count = Object.values(el).reduce((acc: any, val) => acc + val, 0) as number;
		return total += count;
	});
	
	return total;
}