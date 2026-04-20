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

export function getRandomDate(start: Date, end: Date) {
	const startDate = start.getTime();
	const endDate = end.getTime();
	const randomDate = new Date(startDate + Math.random() * (endDate - startDate));
	return randomDate.getFullYear() + "년 " + (randomDate.getMonth() + 1) + "월";
}

export function getSelectRegion(region: Region) {
	const selectRegion = region.adm.name
		? region.sido.name + " " + region.sgg.name + " " + region.adm.name
		: region.sgg.name
		? region.sido.name + " " + region.sgg.name
		: region.sido.name;
	return selectRegion;
}

export function getRandomPercentage() {
	return (Math.random() * 100).toFixed(0);
}

export function getRandomValue() {
	return Number(Math.floor(Math.random() * 1000000).toFixed(0)).toLocaleString();
}
