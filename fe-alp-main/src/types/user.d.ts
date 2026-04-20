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

type User = {
	userId: string;
	alpAuthCd: AlpAuthCd; // 회원 등급
	baseInfo: number; // 대표 계약 지역 코드
	apdInfo: number[]; // 게약 지역 코드
	baseRegion: Region;
};

type AlpAuthCd = "2" | "3" | "4"; //2:프리미엄, 3:스탠다드, 4:준회원
