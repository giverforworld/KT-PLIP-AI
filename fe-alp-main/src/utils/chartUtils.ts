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

import { alpChartConfig } from "@/constants/chart/alpChartConfig";
import { mopChartConfig } from "@/constants/chart/mopChartConfig";
import { llpChartConfig } from "@/constants/chart/llpChartConfig";
import { dashboardChartConfig } from "@/constants/chart/dashboardChartConfig";
import IconChartBar from "@images/chartIcon/dataListBar.svg";
import IconChartHorizontalbar from "@images/chartIcon/dataListHorizontalbar.svg";
import IconCharPie from "@images/chartIcon/dataLIstPie.svg";
import IconChartLine from "@images/chartIcon/dataListLine.svg";
import IconChartHeatmap from "@images/chartIcon/dataLIstHeatmap.svg";
import IconChartRadar from "@images/chartIcon/dataListRadar.svg";
import IconChartSankey from "@images/chartIcon/dataListSankey.svg";
import IconChartScatter from "@images/chartIcon/dataListScatter.svg";
import IconChartMap from "@images/chartIcon/dataListMap.svg";
import IconChartButterfly from "@images/chartIcon/dataListButterfly.svg";
import IconChartFullStack from "@images/chartIcon/dataListFullStack.svg";
import IconChartStack from "@images/chartIcon/dataListStack.svg";
import IconChartTable from "@images/chartIcon/dataListTable.svg";
import IconChartBump from "@images/chartIcon/dataListBump.svg";
import IconChartRace from "@images/chartIcon/dataListRace.svg";

export const getChartTitle = (chartName: string) =>
	alpChartConfig.find((config) =>
		Array.isArray(config.name) ? config.name.includes(chartName) : config.name === chartName,
	)?.title ||
	mopChartConfig.find((config) =>
		Array.isArray(config.name) ? config.name.includes(chartName) : config.name === chartName,
	)?.title ||
	llpChartConfig.find((config) =>
		Array.isArray(config.name) ? config.name.includes(chartName) : config.name === chartName,
	)?.title ||
	dashboardChartConfig.find((config) =>
		Array.isArray(config.name) ? config.name.includes(chartName) : config.name === chartName,
	)?.title;

export const getChartIcon = (chartName: string) => {
	const chartType =
		alpChartConfig.find((config) => config.name === chartName || config.name.includes(chartName))
			?.type[0] ||
		mopChartConfig.find((config) => config.name === chartName || config.name.includes(chartName))
			?.type[0] ||
		llpChartConfig.find((config) => config.name === chartName || config.name.includes(chartName))
			?.type[0] ||
		dashboardChartConfig.find(
			(config) => config.name === chartName || config.name.includes(chartName),
		)?.type[0];

	switch (chartType) {
		case "bar":
			return IconChartBar;
		case "horizontalBar":
			return IconChartHorizontalbar;
		case "pie":
			return IconCharPie;
		case "line":
			return IconChartLine;
		case "dynamic":
			return IconChartLine;
		case "stack":
			return IconChartStack;
		case "fullStack":
			return IconChartFullStack;
		case "heatmap":
			return IconChartHeatmap;
		case "butterfly":
			return IconChartButterfly;
		case "radar":
			return IconChartRadar;
		case "sankey":
			return IconChartSankey;
		case "scatter":
			return IconChartScatter;
		case "race":
			return IconChartRace;
		case "bump":
			return IconChartBump;
		case "table":
			return IconChartTable;
		case "tableGroup":
			return IconChartBar;
		case "custom":
			return IconChartBar;
		case "customStack":
			return IconChartBar;
		case "customFullStack":
			return IconChartBar;
		case "map":
			return IconChartMap;
		default:
			return IconChartBar;
	}
};

// 테이블표에 사용
export const formatDate = (dateString: string): string => {
	if (typeof dateString !== "string") {
		if (dateString == null) return ""; // null, undefined 처리
		dateString = String(dateString); // 숫자, 객체 등을 문자열로 변환
	}
	const trimmedDateString = dateString.trim();

	if (/^\d+$/.test(trimmedDateString)) {
		switch (trimmedDateString.length) {
			case 4: {
				const year = trimmedDateString.slice(0, 4);
				return `${year}년`;
			}
			case 6: {
				const year = trimmedDateString.slice(0, 4);
				const month = parseInt(trimmedDateString.slice(4, 6), 10);
				return `${year}년 ${month}월`;
			}
			case 8: {
				const year = trimmedDateString.slice(0, 4);
				const month = parseInt(trimmedDateString.slice(4, 6), 10);
				const day = parseInt(trimmedDateString.slice(6, 8), 10);
				return `${year}년 ${month}월 ${day}일`;
			}
			default: {
				const hour = parseInt(trimmedDateString, 10);
				return `${hour < 10 ? `0${hour}` : hour}시`;
			}
		}
	}
	// 날짜와 시간이 함께 있는 형식 (MM/dd HH:mm)
	else if (/^\d{1,2}[\/\-]\d{1,2} \d{1,2}:\d{2}$/.test(dateString)) {
		const [datePart, timePart] = dateString.split(" ");
		const [month, day] = datePart.split(/[\/\-]/);
		let [hour, minute] = timePart.split(":");

		// 시간과 분을 두 자리로 맞춤
		hour = hour.padStart(2, "0");
		minute = minute.padStart(2, "0");

		return `${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${hour}:${minute}`;
	}
	// yyyy/MM or yyyy-MM 형식 (연도와 월만)
	else if (/^\d{4}[\/\-]\d{2}$/.test(dateString)) {
		const [year, month] = dateString.split(/[\/\-]/);
		return `${year}년 ${parseInt(month)}월`;
	}
	// MM/dd or MM-dd 형식 (월과 일만)
	else if (/^\d{1,2}[\/\-]\d{1,2}$/.test(dateString)) {
		const [month, day] = dateString.split(/[\/\-]/);
		return `${parseInt(month)}월 ${parseInt(day)}일`;
	}

	return dateString;
};

//차트에 사용
export const formatDateChart = (dateString: string): string => {
	if (typeof dateString !== "string") {
		if (dateString == null) return ""; // null, undefined 처리
		dateString = String(dateString); // 숫자, 객체 등을 문자열로 변환
	}
	const trimmedDateString = dateString.trim();
	if (/^\d+$/.test(trimmedDateString)) {
		switch (trimmedDateString.length) {
			case 4: {
				const year = trimmedDateString.slice(0, 4);
				return `${year}`;
			}
			case 6: {
				const year = trimmedDateString.slice(0, 4);
				const month = parseInt(trimmedDateString.slice(4, 6), 10);
				return `${year}년 ${month}월`;
			}
			case 8: {
				const year = trimmedDateString.slice(0, 4);
				const month = parseInt(trimmedDateString.slice(4, 6), 10);
				const day = parseInt(trimmedDateString.slice(6, 8), 10);
				return `${month}/${day}`;
			}
			default: {
				const hour = parseInt(trimmedDateString, 10);
				return `${hour < 10 ? `0${hour}` : hour}시`;
			}
		}
	}
	// yyyy/MM or yyyy-MM 형식 (연도와 월만)
	else if (/^\d{4}[\/\-]\d{2}$/.test(dateString)) {
		const [year, month] = dateString.split(/[\/\-]/);
		return `${year}년 ${parseInt(month)}월`;
	} else if (/^\d{1,2}[\/\-]\d{1,2} \d{1,2}:\d{2}$/.test(dateString)) {
		const [datePart, timePart] = dateString.split(" ");
		const [month, day] = datePart.split(/[\/\-]/);
		let [hour, minute] = timePart.split(":");

		// 시간과 분을 두 자리로 맞춤
		hour = hour.padStart(2, "0");
		minute = minute.padStart(2, "0");

		return `${parseInt(month, 10)}/${parseInt(day, 10)}\n${hour}:${minute}`;
	}

	return dateString;
};
