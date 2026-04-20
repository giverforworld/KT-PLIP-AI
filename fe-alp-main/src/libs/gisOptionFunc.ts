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

import { format } from "date-fns";

// 지역명 통합 함수
export function getRegionString(tempRegion: RegionInfo) {
	const regionString = tempRegion ?`${tempRegion.sidoName ?? ""} ${tempRegion.sggName ?? ""} ${tempRegion.admName ?? ""}` : "";
	return regionString.trim();
}

// 날짜 표기 방식 변경 함수
export function formatDateRangeOrString(input: Date | string, endDate?: Date) {
	const isTimeMidnight = (date: Date): boolean => {
		return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
	};

	if (typeof input === "string") {
		const year = input.slice(0, 4);
		const month = input.slice(4, 6);
		return `${year}.${month}`;
	} else if (input instanceof Date && endDate instanceof Date) {
		if (input && !isTimeMidnight(input)) {
			return "";
		}

		if (input.getTime() === endDate.getTime()) {
			return format(input, "yyyy년 MM월");
		}

		return `${format(input, "yyyy.MM.dd")} - ${format(endDate, "yyyy.MM.dd")}`;
	}

	return "";
}

// YYYYMMDD > Date
export function numberToDate(dateNumber: number): Date {
	const dateString = dateNumber.toString(); // 숫자를 문자열로 변환
	const year = parseInt(dateString.substring(0, 4)); // 연도 추출
	const month = parseInt(dateString.substring(4, 6)) - 1; // 월은 0부터 시작하므로 1을 뺌
	const day = parseInt(dateString.substring(6, 8)); // 일 추출
	return new Date(year, month, day); // Date 객체 반환
}

// unix > string
export function formatUnixToString(unixTimestamp: number, timeSeriesType?: 0 | 1) {
	if (unixTimestamp.toString().length < 13) {
		unixTimestamp *= 1000; // Convert to milliseconds
	}
	const date = new Date(unixTimestamp);
	if (date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		if (timeSeriesType !== undefined) {
			if (timeSeriesType === 1) {
				const hours = String(date.getHours()).padStart(2, "0");
				const minutes = String(date.getMinutes()).padStart(2, "0");
				return `${year}년 ${month}월 ${day}일 ${hours}시`;
			} else {
				return `${year}/${month}/${day}`;
			}
		} else {
			return `${year}-${month}-${day}`;
		}
	}
	return "";
}

// timestamp > dayofweek
export function getDayOfWeek(timestamp: string): number {
	const days = [7, 1, 2, 3, 4, 5, 6];

	// 유닉스 타임스탬프가 밀리초 단위로 들어오는지 확인
	let date: Date;
	if (timestamp.length === 13) {
		// unixtimestamp (밀리초 단위)
		date = new Date(Number(timestamp));
	} else {
		// 'YYYY-MM-DD' 형태의 날짜 문자열
		date = new Date(timestamp);
	}

	// 한국 시간으로 변환 (UTC와 한국 시간 차이 반영)
	const kstDay = date.getDay();

	// 요일을 1(월요일)부터 7(일요일)까지로 매핑
	return days[kstDay];
}

// 선택 옵션 표시 값 변환 함수
export function filterLabel(selectedValue: number[] | [0 | 1], filter: Filter): string[] {
	let labels: string[] = [];
	if (selectedValue.includes(0) && filter.labels.includes("전체")) {
		return ["전체"];
	}
	selectedValue.map((value) => labels.push(filter.labels[value]));
	return labels;
}
