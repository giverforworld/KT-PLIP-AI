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

interface StartTimeIntervalOptions {
	from: number; // 시작 시간 (UNIX timestamp)
	to: number; // 종료 시간 (UNIX timestamp)
	playStatus: number; // 재생 상태: 0=일시정지, 1=1배속, 2=2배속, 3=3배속
	timeSeriesType: number; // 시계열 타입: 0=일별, 1=시간별
	setter: (timestamp: number) => void; // currentTime을 업데이트하는 함수
}
export function startTimeInterval({
	from,
	to,
	playStatus,
	timeSeriesType,
	setter,
}: StartTimeIntervalOptions): NodeJS.Timeout | null {
	// playStatus가 0일 경우, 함수 종료
	if (playStatus === 0) return null;

	// 시계열 타입에 따른 시간 단위 설정 (일별: 하루=86400초, 시간별: 1시간=3600초)
	const timeIncrement = timeSeriesType === 0 ? 3600 : 86400;

	// intervalDelay 계산 (playStatus에 따른 재생 속도 조정)
	const intervalDelay = 1000 / playStatus;

	// 현재 시간을 설정하고 타이머를 시작
	let currentTime = from;
	setter(currentTime);

	const intervalId = setInterval(() => {
		currentTime += timeIncrement;
		setter(currentTime);

		// 종료 조건: to에 도달하면 interval 종료
		if (currentTime >= to) {
			clearInterval(intervalId);
		}
	}, intervalDelay);

	return intervalId;
}
