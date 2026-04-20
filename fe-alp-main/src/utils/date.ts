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

/**
 * 날짜 변환
 * @param date
 * @param dateFormat 날짜 형식 지정 문자열로, 기본값은 "yyyy-MM-dd"
 * @returns 포맷된 날짜 문자열
 * */
export const dateFormat = (date: Date, dateFormat: string = "yyyy-MM-dd"): string => {
	return format(date, dateFormat);
};

export function changeStrToDate(date: number): Date {
	const dateStr = String(date);

	const year = Number(dateStr.slice(0, 4));
	const month = Number(dateStr.slice(4, 6)) - 1; // 월은 0부터 시작 (0: 1월, 1: 2월, ...)
	const day = Number(dateStr.slice(6, 8));

	// Date 객체 생성
	return new Date(year, month, day);
}

export function changeDateToString(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
	const day = String(date.getDate()).padStart(2, "0");

	// YYYYMMDD 형태의 숫자로 변환
	return Number(`${year}${month}${day}`);
}

export function addDaysToDate(dateNum: number, daysToAdd: number) {
	// 연도, 월, 일 추출
	const year = Math.floor(dateNum / 10000);
	const month = Math.floor((dateNum % 10000) / 100) - 1; // 월은 0부터 시작
	const day = dateNum % 100;

	// Date 객체 생성
	const date = new Date(year, month, day);

	// 지정된 일 수 추가
	date.setDate(date.getDate() + daysToAdd);

	// 연도, 월, 일 추출
	const newYear = date.getFullYear();
	const newMonth = String(date.getMonth() + 1).padStart(2, "0");
	const newDay = String(date.getDate()).padStart(2, "0");

	// 결과를 YYYYMMDD 형태의 숫자로 반환
	return Number(`${newYear}${newMonth}${newDay}`);
}

export function getFirstDayOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getNumberToFirstDay(date: number) {
	return date * 100 + 1;
}

export function getEndDayOfMonth(date: Date) {
	const today = new Date();
	const todayMonth = today.getMonth() + 1;
	const targetYear = date.getFullYear();
	const targetMonth = date.getMonth() + 1;

	if (todayMonth === targetMonth) {
		return setToMidnight(today);
	} else {
		const lastDay = new Date(targetYear, targetMonth, 0);
		return setToMidnight(lastDay);
	}
}

export function getNumberToLastDay(date: number) {
	// YYYYMM에서 연도와 월을 추출
	const year = Math.floor(date / 100);
	const month = date % 100;

	// 한국 시간 기준으로 '연도-다음 월-0일'을 생성 (이번 달의 마지막 날)
	const lastDay = new Date(year, month, 0);

	// YYYYMMDD 형식의 숫자로 반환
	const formatted = lastDay
		.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			timeZone: "Asia/Seoul",
		})
		.replace(/[^0-9]/g, ""); // 숫자만 추출

	return parseInt(formatted, 10);
}

function setToMidnight(date: Date): Date {
	const updatedDate = new Date(date);
	updatedDate.setHours(0, 0, 0, 0);
	return updatedDate;
}
