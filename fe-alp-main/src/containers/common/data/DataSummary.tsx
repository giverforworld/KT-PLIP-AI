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

import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import RoundedBox from "@/components/boxes/RoundedBox";
import { formatStatSummaryString } from "@/containers/common/data/StatSummary";
import { useActiveTabStore } from "@/store/activeTab";
import { useSearchFilterStore } from "@/store/searchFilter";

interface DataSummaryProps {
	data: DataContainer;
	isReport?: boolean;
}

export default function DataSummary({ data, isReport }: DataSummaryProps) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/").pop();

	const summary = data.summary;

	const activeTab = useActiveTabStore(s=>s.activeTabs[data.title]?.tab ?? "평균");
	const searchFilter = useSearchFilterStore((s)=>s.filter);
	
	const regionLength =
		rootRoute === PATHS.BOOKMARK
			? new Set(
					"data" in data.charts[0]
						? (data.charts as MergedChartData[])[0].data.map((chart) => chart.regionName)
						: (data.charts as BaseChartData[]).map((chart) => chart.regionName),
				).size
			: rootRoute === PATHS.MOP && searchFilter.isFlow
				? searchFilter.flowRegions.length
				: searchFilter.regions.length;
	const tabLength =
		isDataSummary(data.summary) || isDataSummaryArray(data.summary)
			? Object.keys(data.summary).length
			: 1;
	const displayChartLength = data?.charts?.length / tabLength || data?.charts?.length;

	return renderSummary(summary, activeTab, isReport, displayChartLength, regionLength);
}

const renderSummary = (
	summary: DataContainer["summary"],
	activeTab: string,
	isReport: boolean | undefined,
	displayChartLength?: number,
	regionLength?: number,
) => {
	// 단일지역만
	if (typeof summary === "string") {
		return (
			<div className="data-summary col-span-2">
				{isReport ? (
					<RoundedBox bgColor="bg-backGray">
						<p>{formatStatSummaryString(summary)}</p>
					</RoundedBox>
				) : (
					<RoundedBox bgColor="bg-backGray">
						<p>{formatDataSummaryString(summary, isReport)}</p>
					</RoundedBox>
				)}
			</div>
		);
	}

	// 비교지역 있을 시 or summaryBox가 여러 개일 경우
	if (isStringArray(summary)) {
		summary = summary.filter((item:any) => !item.endsWith('}'));
		let summaryGroups; // 각 차트, 각 지역 summary를 모은 이차원 배열
		if (summary) summaryGroups = groupByLocationAndIndex(summary);
		return summaryGroups?.map((group, index) => {
			let initailOrderNum = 1;
			const order = initailOrderNum + index * 2;

			return (
				<div
					key={index}
					className={`data-summary ${regionLength === 1 && displayChartLength === 2 ? "col-span-1" : "col-span-2"}`}
					style={{
						order: regionLength !== 1 && summaryGroups.length > 1 ? order : "",
					}}
				>
					<RoundedBox bgColor="bg-backGray">
						{regionLength === 1 ? (
							<p key={index}>{formatDataSummaryString(group[0], isReport)}</p>
						) : (
							<div className="grid grid-cols-4 gap-4">
								{Array.from({ length: 4 }).map((_, index) => {
									return group[index] ? (
										<p key={index}>{formatDataSummaryString(group[index], isReport)}</p>
									) : (
										<p key={index} className="text-center">
											-
										</p>
									);
								})}
							</div>
						)}
					</RoundedBox>
				</div>
			);
		});
	}

	// 단일지역만 (평균,누적,유니크)
	if (isDataSummary(summary)) {
		return renderDataSummary(summary, activeTab, isReport);
	}

	// 비교지역 있을시 (평균,누적,유니크) or summaryBox가 여러 개일 경우
	if (isDataSummaryArray(summary)) {
		return renderDataSummaryArray(summary, activeTab, isReport, displayChartLength!, regionLength!);
	}

	return null;
};

const renderDataSummary = (
	summary: DataSummary,
	activeTab: string,
	isReport: boolean | undefined,
) => {
	const summaryMap: Record<string, string | undefined> = {
		평균: summary.Avg,
		// 누적: summary.Sum,
		유니크: summary.Unique,
	};

	return summaryMap[activeTab] ? (
		<div className="data-summary col-span-2">
			<RoundedBox bgColor="bg-backGray">
				<p>{formatDataSummaryString(summaryMap[activeTab], isReport)}</p>
			</RoundedBox>
		</div>
	) : null;
};

const renderDataSummaryArray = (
	summary: DataSummaryArray,
	activeTab: string,
	isReport: boolean | undefined,
	displayChartLength: number,
	regionLength: number,
) => {
	const summaryMap: Record<string, string[] | undefined> = {
		평균: summary.Avg,
		유니크: summary.Unique,
	};

	const summaryValue = summaryMap[activeTab]; // 평균,누적,유니크별 string[]

	let summaryGroups; // 각 차트, 각 지역 summary를 모은 이차원 배열
	if (summaryValue) summaryGroups = groupByLocationAndIndex(summaryValue);

	return summaryGroups?.map((group, index) => {
		let initailOrderNum = 1;
		const order = initailOrderNum + index * 2;
		return (
			<div
				key={index}
				className={`data-summary ${regionLength === 1 && displayChartLength === 2 ? "col-span-1" : "col-span-2"}`}
				style={{
					order: regionLength !== 1 && summaryGroups.length > 1 ? order : "",
				}}
			>
				<RoundedBox bgColor="bg-backGray">
					{regionLength === 1 ? (
						<p key={index}>{formatDataSummaryString(group[0], isReport)}</p>
					) : (
						<div className="grid grid-cols-4 gap-4">
							{Array.from({ length: 4 }).map((_, index) => {
								return group[index] ? (
									<p key={index}>{formatDataSummaryString(group[index], isReport)}</p>
								) : (
									<p key={index} className="text-center">
										-
									</p>
								);
							})}
						</div>
					)}
				</RoundedBox>
			</div>
		);
	});
};

// 타입 체크
export function isStringArray(data: any): data is string[] {
	return Array.isArray(data) && data.every((item) => typeof item === "string");
}
export function isDataSummary(data: any): data is DataSummary {
	return (
		typeof data === "object" &&
		data !== null &&
		typeof data.Avg === "string" &&
		(data.Unique === undefined || typeof data.Unique === "string")
	);
}
export function isDataSummaryArray(data: any): data is DataSummaryArray {
	return (
		typeof data === "object" &&
		data !== null &&
		isStringArray(data.Avg) &&
		(data.Unique === undefined || isStringArray(data.Unique))
	);
}

const formatDataSummaryString = (text: string | undefined, isReport = false) => {
	if (typeof text !== "string") {
		// console.error("Expected a string, but received:", typeof text);
		return null;
	}

	return text.split("\n").map((line, lineIndex) => (
		<span key={lineIndex} className="block">
			{line.split(/({[^}]+})/g).map((part, partIndex) => {
				// { } 내부 문자열에만 스타일 추가
				const isHighlighted =
					!isReport &&
					// lineIndex === 0 &&
					// partIndex === 1 &&
					part.startsWith("{") &&
					part.endsWith("}");
				const content = part.startsWith("{") && part.endsWith("}") ? part.slice(1, -1) : part;

				return (
					<span
						key={partIndex}
						className={
							isHighlighted
								? lineIndex === 0 && partIndex == 1
									? "font-semibold text-textBlue"
									: // : "font-semibold"
										"font-normal"
								: "font-normal"
						}
					>
						{content}
					</span>
				);
			})}
		</span>
	));
};

/**
 * `{}` 내의 지역명에 따라 그룹화하고, 각 그룹의 동일한 인덱스의 항목들을 결합하여
 * 2차원 배열로 반환하는 함수
 * @param arr API response로 받은 지역명과 요약이 포함된 문자열 배열
 * @returns 2차원 배열, 같은 위치에 해당하는 문자열들을 같은 배열에 묶어 반환
 */
const groupByLocationAndIndex = (arr: string[]): string[][] => {
	// 1. 문자열 배열을 {영덕군}, {남구} 등 위치별로 그룹화
	const grouped = arr.reduce((acc: { [key: string]: string[] }, text) => {
		const match = text.match(/\{(.*?)\}/); // 각 문자열에서 `{}` 내부의 지역명을 추출

		if (match) {
			const location = match[1]; // 지역명
			acc[location] = acc[location] || [];
			acc[location].push(text);
		}
		return acc;
	}, {});

	const result: string[][] = [];
	const maxLength = Math.max(...Object.values(grouped).map((arr) => arr.length)); // 그룹화된 데이터 중 가장 긴 배열의 길이

	// 2. 가장 긴 배열의 길이만큼 반복하여 각 인덱스별로 요소를 결합
	for (let i = 0; i < maxLength; i++) {
		result.push(Object.values(grouped).map((group) => group[i] || ""));
	}

	return result;
};

/**
 * 북마크일때 regionLength 구하기
 */
const getRegionLength = () => {};
