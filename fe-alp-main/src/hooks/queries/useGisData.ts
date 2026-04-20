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

import { basePath, serverUrl } from "@/constants/path";
import { topoJsonToGeoJson } from "@/libs/dev/topoJsonHandler";
import { getGisChartData } from "@/services/getGisChartData";
import { getGisTimeLineChartData } from "@/services/getGisTimeLineChartData";
import { getAges, getDayofWeek } from "@/utils/query";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Feature, FeatureCollection } from "geojson";
import React from "react";

export default function useGisData() {
	const queryClient = useQueryClient();

	const useGisChartQuery = (
		isNative: boolean,
		start: number,
		end: number,
		regions: number[],
		isSelectTime: 0 | 1,
		timezn: number[],
	) => {
		return useQuery({
			queryKey: ["gisChart", isNative, start, end, regions, isSelectTime, timezn],
			queryFn: () => getGisChartData(isNative, start, end, regions, isSelectTime, timezn),
		});
	};

	const useGisTimeLineChartQuery = (gisSettings: GisSettings) => {
		const { analysisType, regionCode, maps, isGrid, isTimeLine, isMovingPurpose, isNative } =
			gisSettings;
		const { inOutFlow, startDate, endDate } = gisSettings.maps[0];
		return useQuery({
			queryKey: [
				"gisChart",
				analysisType,
				isGrid,
				regionCode,
				startDate,
				endDate,
				maps[0].isSelectTime,
				maps[0].timeSlot,
				maps[0].lifestylePattern,
				isMovingPurpose,
				maps[0].gender,
				maps[0].ageGroup,
				isNative,
			],
			queryFn: () =>
				getGisTimeLineChartData(
					analysisType,
					isGrid,
					regionCode,
					startDate,
					endDate,
					maps[0].isSelectTime,
					maps[0].timeSlot,
					maps[0].lifestylePattern,
					isMovingPurpose,
					maps[0].gender,
					maps[0].ageGroup,
					isNative,
					inOutFlow,
				),
			enabled: isTimeLine,
		});
	};

	/**
	 * useGeometry 훅
	 * @param {string} version - topojson 버전, cache key로 사용됨
	 * @param {string} scale- 변환에 사용할 이름
	 * @param {number} region - 변환에 사용할 지역 코드
	 * @returns {object} { data, isLoading, error }
	 */
	const useGeometry = (version: string, scale: string, region?: number) => {
		// topoJson을 캐시
		const {
			data: topoJson,
			isLoading,
			error,
		} = useQuery({
			queryKey: ["geometry", version],
			queryFn: () =>
				fetch(`${basePath}/api/gis/map?name=${version}`)
				// fetch(`${serverUrl}/gis/topojson?date=${version}`)
					.then((res) => res.json())
					.then((json) => {
						return json.result;
					}),
		});

		// geoJson으로 변환, geoJson은 캐싱하지 않음
		const data: FeatureCollection | null | undefined = React.useMemo(() => {
			return topoJson ? topoJsonToGeoJson(topoJson, scale, region) : null;
		}, [topoJson, scale, region]);
		return { data, isLoading, error };
	};

	const useDashboardGeometry = (version: string, scale: string) => {
		return useQuery({
			queryKey: ["geometry", version],
			queryFn: () =>
				fetch(`${basePath}/api/gis/map?name=${version}`)
					.then((res) => res.json())
					.then((json) => {
						return json.result;
					}),
		});
	};

	const useGrid50Data = (
		gisSettings: GisSettings,
		isFristRender: React.MutableRefObject<boolean>,
	) => {
		const {
			analysisType,
			regionCode,
			isGrid,
			gridScale,
			maps: { [0]: mapSettings },
		} = gisSettings;
		const {
			isSearch,
			startDate: from,
			endDate: to,
			gender,
			ageGroup: ages,
			timeSlot,
			isSelectTime,
		} = mapSettings;
		const ageGroup = covertAges(ages);
		// const dayOfWeek = getDayofWeek(isSelectDay, days);
		const timeCodes = convertTimeSlots(isSelectTime, timeSlot);
		let queryKey: any[] = ["false"];
		let layerType = "50cell";

		if (analysisType === 3) layerType = "fpop";
		if (analysisType === 0 && isGrid && gridScale === 0.05) layerType = "alpGrid50";
		queryKey = [layerType, regionCode, from, to, gender, ageGroup, timeCodes];

		const params = buildApiParams({
			layerType,
			regions: regionCode,
			from,
			to,
			gender,
			ageGroup,
			timeCodes,
		});

		return useQuery({
			queryKey: queryKey,
			queryFn: () =>
				isFristRender.current
					? { dataType: "none", res: null }
					: fetch(`${basePath}/api/gis/map/data/grid50?${params}`)
							.then((res) => res.json())
							.then((json) => {
								if (json.res.length === 0) return { dataType: "none", res: null };
								if (json.res.message === 'Grid-error1') return { dataType: "none", res: 1 };
								if (json.res.message === 'Flp-error1') return { dataType: "none", res: 2 };
								return { dataType: layerType, res: json.res };
							}),
		});
	};

	const useMapData = (
		gisSettings: GisSettings,
		mapIdx: number,
		isFristRender: React.MutableRefObject<boolean>,
	) => {
		const {
			// isDual,
			analysisType,
			regionCode,
			maps,
			isNative,
			isMovingPurpose,
			isTimeLine,
			visualizeOption,
			// localGroup,
			analysisSubType,
			isGrid,
			gridScale
		} = gisSettings;
		const mapSettings = maps[mapIdx];
		const {
			isSearch,
			inOutFlow,
			startDate: from,
			endDate: to,
			lifestylePattern,
			domesticGroup,
			movingPurposeGroup,
			movingVehicleGroup,
			gender,
			ageGroup: ages,
			localGroup
		} = mapSettings;

		const ageGroup = covertAges(ages);
		// const dayOfWeek = getDayofWeek(isSelectDay, days);

		// 시간대 옵션 넣기
		const { timeSlot, isSelectTime } = mapSettings;

		const timeCodes = convertTimeSlots(isSelectTime, timeSlot);
		// const timeCodes = timeSlot.flatMap((num) => {
		// 	if (num === 0) return []; // 0일 때는 빈 배열 반환
		// 	const start = (num - 1) * 3; // 시작 값 계산
		// 	return [start, start + 1, start + 2].map((n) => n.toString().padStart(2, "0"));
		// });

		let layerType = "notGrid";

		let queryKey: any[] = [layerType];
		if (analysisType === 0 && isGrid && (gridScale === 0.25 || gridScale === 0.5 || gridScale === 1)) {
		// if (analysisType === 0 && isGrid) {
			layerType = "gridLP";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				gender,
				ageGroup,
				lifestylePattern,
				domesticGroup,
				isTimeLine,
			];
		} else if (analysisType === 0 && !isGrid) {
			layerType = "adm";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				gender,
				ageGroup,
				lifestylePattern,
				domesticGroup,
				isTimeLine,
				isNative,
			];
		} else if (analysisType === 1 && isGrid) {
			layerType = "gridLM";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 0) {
			layerType = "trip";
			queryKey = [
				layerType,
				regionCode,
				from,
				to,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 1) {
			layerType = "vector";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 2) {
			layerType = "trip";
			queryKey = [
				layerType,
				regionCode,
				from,
				to,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
			// } else if (analysisType === 2 && analysisSubType === 0 && visualizeOption === 0) {
			// 	layerType = "admLlp";
			// 	queryKey = [layerType, from, to, regionCode, dayOfWeek, localGroup];
		} else if (analysisType === 2 && analysisSubType === 0) {
			layerType = "llpInflow";
			queryKey = [layerType, from, to, regionCode, gender, ageGroup, localGroup];
		} else if (analysisType === 2 && analysisSubType === 1) {
			layerType = "depopul";
			queryKey = [layerType, from, to, gender, ageGroup, localGroup];
		}

		const params = buildApiParams({
			layerType,
			from,
			to,
			isNative,
			isTimeLine,
			regions: regionCode,
			timeCodes,
			inOutFlow,
			isMovingPurpose,
			lifestylePattern,
			domesticGroup,
			movingPurposeGroup,
			movingVehicleGroup,
			gender,
			ageGroup,
			localGroup: localGroup.length > 1 ? '2' : `${localGroup[0]}`,
		});
		return useQuery({
			queryKey: queryKey,
			queryFn: () =>
				// isFristRender.current
				// 	? { dataType: "none", res: null }
				// 	:
				fetch(`${basePath}/api/gis/map/data?${params}`)
					.then((res) => res.json())
					.then((json) => {
						if (json.res.length === 0) return { dataType: "none", res: null };
						// if (json.res.message === 'Grid-error1') return { dataType: "none", res: 1 };
						else if (json.res.message === "Flp-error1") return { dataType: "none", res: 2 };
						else if (json.res.message === "Llp-error1") return { dataType: "llpInflow", res:json.res };
						return { dataType: layerType, res: json.res };
					}),
			enabled: isSearch,
		});
	};

	const useGisMapData = (
		gisSettings: GisSettings,
		mapIdx: number,
		isFristRender: React.MutableRefObject<boolean>,
	) => {
		const {
			// isDual,
			analysisType,
			regionCode,
			maps,
			isNative,
			isMovingPurpose,
			isTimeLine,
			visualizeOption,
			localGroup,
			analysisSubType,
			isGrid,
			gridScale
		} = gisSettings;
		const mapSettings = maps[mapIdx];
		const {
			isSearch,
			inOutFlow,
			startDate: from,
			endDate: to,
			lifestylePattern,
			domesticGroup,
			movingPurposeGroup,
			movingVehicleGroup,
			gender,
			ageGroup: ages,
		} = mapSettings;

		const ageGroup = covertAges(ages);
		// const dayOfWeek = getDayofWeek(isSelectDay, days);

		// 시간대 옵션 넣기
		const { timeSlot, isSelectTime } = mapSettings;

		const timeCodes = convertTimeSlots(isSelectTime, timeSlot);
		// const timeCodes = timeSlot.flatMap((num) => {
		// 	if (num === 0) return []; // 0일 때는 빈 배열 반환
		// 	const start = (num - 1) * 3; // 시작 값 계산
		// 	return [start, start + 1, start + 2].map((n) => n.toString().padStart(2, "0"));
		// });

		let layerType = "notGrid";

		let queryKey: any[] = [layerType];
		if (analysisType === 0 && isGrid && (gridScale === 0.25 || gridScale === 0.5 || gridScale === 1)) {
		// if (analysisType === 0 && isGrid) {
			layerType = "gridLP";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				lifestylePattern,
				domesticGroup,
				isTimeLine,
			];
		} else if (analysisType === 0 && !isGrid) {
			layerType = "adm";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				gender,
				ageGroup,
				lifestylePattern,
				domesticGroup,
				isTimeLine,
				isNative,
			];
		} else if (analysisType === 1 && isGrid) {
			layerType = "gridLM";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 0) {
			layerType = "trip";
			queryKey = [
				layerType,
				regionCode,
				from,
				to,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 1) {
			layerType = "vector";
			queryKey = [
				layerType,
				from,
				to,
				regionCode,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				inOutFlow,
			];
		} else if (analysisType === 1 && !isGrid && visualizeOption === 2) {
			layerType = "trip";
			queryKey = [
				layerType,
				regionCode,
				from,
				to,
				timeCodes,
				isMovingPurpose,
				gender,
				ageGroup,
				isNative,
				isTimeLine,
				inOutFlow,
			];
			// } else if (analysisType === 2 && analysisSubType === 0 && visualizeOption === 0) {
			// 	layerType = "admLlp";
			// 	queryKey = [layerType, from, to, regionCode, dayOfWeek, localGroup];
		} else if (analysisType === 2 && analysisSubType === 0) {
			layerType = "llpInflow";
			queryKey = [layerType, from, to, regionCode, gender, ageGroup, localGroup];
		} else if (analysisType === 2 && analysisSubType === 1) {
			layerType = "depopul";
			queryKey = [layerType, from, to, gender, ageGroup, localGroup];
		}

		const params = buildApiParams({
			spaceType: layerType,
			start: from,
			end: to,
			// isNative,
			// isTimeLine,
			regions: regionCode,
			timezn: timeCodes,
			isInflow: inOutFlow,
			isPurpose: isMovingPurpose,
			// lifestylePattern,
			// domesticGroup,
			// movingPurposeGroup,
			// movingVehicleGroup,
			// gender: gender.length === 1 ? gender : [2],
			gender: gender,
			age: ageGroup,
			// localGroup,
		});
		return useQuery({
			queryKey: queryKey,
			queryFn: () =>
				// isFristRender.current
				// 	? { dataType: "none", res: null }
				// 	:
				fetch(`${serverUrl}/gis/mop?${params}`)
					.then((res) => res.json())
					.then((json) => {						
						if (json.res.length === 0) return { dataType: "none", res: null };
						if (json.res.message === 'Grid-error1') return { dataType: "none", res: 1 };
						else if (json.res.message === 'Flp-error1') return { dataType: "none", res: 2 };
						return { dataType: layerType, res: json };
					}),
			enabled: isSearch,
		});
	};

	return {
		useGisChartQuery,
		useGisTimeLineChartQuery,
		useGeometry,
		useMapData,
		useGisMapData,
		useGrid50Data,
		useDashboardGeometry,
	};
}

const buildApiParams = (queryParameters: { [key: string]: any }) => {
	const params = new URLSearchParams();

	Object.entries(queryParameters).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			params.append(key, value.join(","));
		} else if (value !== undefined && value !== null) {
			params.append(key, value.toString());
		}
	});

	return params.toString();
};

/**
 * 시간을 "00", "01", ..., "23" 형태의 스트링으로 변환하는 함수
 * @param isSelectTime - 0 또는 1
 * @param timeSlot - 숫자 배열
 * @returns 시간 스트링 배열
 */
function convertTimeSlots(isSelectTime: 0 | 1, timeSlot: number[]): string[] {
	const times: Set<string> = new Set();

	if (isSelectTime === 0) {
		// isSelectTime이 0일 때: 1-8 => 00-02, 03-05, ..., 21-23
		timeSlot.forEach((slot) => {
			if (slot === 0) return; // 0은 무시
			const startHour = (slot - 1) * 3;
			for (let i = 0; i < 3; i++) {
				const hour = startHour + i;
				if (hour >= 0 && hour < 24) {
					times.add(hour.toString().padStart(2, "0"));
				}
			}
		});
	} else if (isSelectTime === 1) {
		// isSelectTime이 1일 때: 1-24 => 00-23
		timeSlot.forEach((slot) => {
			if (slot === 0) return; // 0은 무시
			const hour = slot - 1;
			if (hour >= 0 && hour < 24) {
				times.add(hour.toString().padStart(2, "0"));
			}
		});
	}

	// 결과를 정렬된 배열로 반환
	return Array.from(times).sort();
}

function covertAges(age: number[]) {
	// 전체 선택 (0이 포함된 경우)
	if (age.includes(0)) {
		return ["0", "10", "20", "30", "40", "50", "60", "70", "80"];
	}

	// age 값들을 10의 배수 문자열로 변환
	return age.map((a) => ((a - 1) * 10).toString()).sort();
}
