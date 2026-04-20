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

import { groupedSgg } from "@/containers/regional-dashboard/proto/constants/groupedRegions";
export function addSggRegionInfo(
	regionInfo: Record<string, RegionInfo>,
	baseInfo: number,
): number[] {
	return Object.keys(regionInfo)
		.filter((item) => item.length === 5 && item.startsWith(baseInfo.toString()))
		.map((item: string) => Number(item));
}
export function filterRegionInfo(
	regionInfo: Record<string, RegionInfo>,
	baseInfo: number,
	apdInfo: number[],
): Record<string, RegionInfo> {
	// Combine baseInfo and apdInfo into a single array for unified processing
	//대표 지역이 시도이면 해당 하위 시군구 코드 추가
	let parseApdInfo = [];

	// 통합시군구
	if (baseInfo < 100) parseApdInfo = [...addSggRegionInfo(regionInfo, baseInfo)];
	else parseApdInfo = [baseInfo];
	// 통합시군구 추가
	let allInfo = addGroupedSgg([...parseApdInfo, ...apdInfo]);

	// 통합시군구 제외
	// let allInfo = deleteGroupedSgg([...parseApdInfo, ...apdInfo]);
	// const allInfo = [...parseApdInfo, ...apdInfo];

	// Filter regionInfo keys based on matching conditions
	return Object.keys(regionInfo).reduce(
		(filtered, key) => {
			const matches = allInfo.some((info) => {
				const regionCode = info.toString();
				if (key.length === 2) {
					return key.startsWith(regionCode.slice(0, 2)); // Match first 2 characters
				} else if (key.length === 5) {
					return key === regionCode; // Exact 5-character match
				} else if (key.length === 8) {
					return key.startsWith(regionCode.slice(0, 5)); // Match first 5 characters
				}
				return false;
			});

			// Add to filtered result if any condition is true
			if (matches) {
				filtered[key] = regionInfo[key];
			}

			return filtered;
		},
		{} as Record<string, RegionInfo>,
	);
}
export function filterGisRegionInfo(
	regionInfo: any,
	baseInfo: number,
	apdInfo: number[],
): Record<string, RegionInfo> {
	// Combine baseInfo and apdInfo into a single array for unified processing
	//대표 지역이 시도이면 해당 하위 시군구 코드 추가
	// let parseApdInfo = [];

	// // 통합시군구
	// if (baseInfo < 100) parseApdInfo = [...addSggRegionInfo(regionInfo, baseInfo)];
	// else parseApdInfo = [baseInfo];
	// // 통합시군구 추가
	// let allInfo = addGroupedSgg([...parseApdInfo, ...apdInfo]);
	let allInfo = [baseInfo, ...apdInfo];
	// 통합시군구 제외
	// let allInfo = deleteGroupedSgg([...parseApdInfo, ...apdInfo]);
	// const allInfo = [...parseApdInfo, ...apdInfo];

	// Filter regionInfo keys based on matching conditions
	return Object.keys(regionInfo).reduce(
		(filtered, key) => {
			const matches = allInfo.some((info) => {
				const regionCode = info.toString();
				if (key.length === 2) {
					return key.startsWith(regionCode.slice(0, 2)); // Match first 2 characters
				} else if (key.length === 5) {
					return key.startsWith(regionCode.slice(0, 5)); // Exact 5-character match
				} else if (key.length === 8) {
					return key.startsWith(regionCode.slice(0, 5)); // Match first 5 characters
				}
				return false;
			});

			// Add to filtered result if any condition is true
			if (matches) {
				filtered[key] = regionInfo[key];
			}

			return filtered;
		},
		{} as Record<string, RegionInfo>,
	);
}
export function checkIncludesUserRegion(
	regionCode: string,
	baseInfo: number,
	apdInfo: number[],
): boolean {
	// Combine baseInfo and apdInfo into a single array for unified processing
	const allInfo = [baseInfo, ...apdInfo];

	return allInfo.some((info) => {
		const infoCode = info.toString();
		if (regionCode.length === 2) {
			return infoCode.startsWith(regionCode); // Match first 2 characters
		} else if (regionCode.length === 5) {
			return regionCode.startsWith(infoCode); // Exact 5-character match
		} else if (regionCode.length === 8) {
			return regionCode.startsWith(infoCode); // Match first 5 characters
		}
		return false;
	});
}

// 통합 시군구 추가
function addGroupedSgg(allInfo: number[]) {
	const updateRegionCodes = new Set(allInfo.map(Number));

	Object.entries(groupedSgg).forEach(([regionKey, { codes }]) => {
		if (codes.some((code) => updateRegionCodes.has(code))) {
			updateRegionCodes.add(Number(regionKey));
		}
	});
	const regionCodes = Array.from(updateRegionCodes).map(String);
	return regionCodes;
}
// 통합 시군구 제외
export function deleteGroupedSgg(allInfo: number[]) {
	const updateRegionCodes = new Set(allInfo.map(Number));

	Object.entries(groupedSgg).forEach(([regionKey, { codes }]) => {
		if (codes.some((code) => updateRegionCodes.has(code))) {
			updateRegionCodes.delete(Number(regionKey));
		}
	});
	const regionCodes = Array.from(updateRegionCodes).map(String);
	return regionCodes;
}
