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

export const initialViewState = {
	latitude: 37.27274878459836,
	longitude: 127.05960974187083,
	zoom: 12,
};

export const tempOptions: TempSettings = {
	analysisSubType: 0, //기본값:유입분석(0)

	dateType: 0,
	startDate: 202408,
	endDate: 202408,

	regionCode: 0,
	regionName: "",
	regionCodeArr: [0],
	regionNameArr: [""],

	isGrid: false, // 격자(true),행정구역(false)
	isGridScaleAuto: true, // 자동(true), 고정(false)
	gridScale: 0.25, // 격자 크기(0.05, 0.25)

	inOutFlow: true, // 유입(true), 유출(false)
	isNative: true, //내국인/외국인
	localGroup: [1], //내지인(0)/외지인(1)

	isMovingPurpose: true, // 이동목적(true), 이동수단(false)
	// 생활패턴
	isTotallifestylePattern: 0, // 전체(0) or 상주/비상주(1)
	lifestylePattern: [0, 1, 2], // 기본값: 거주인구 (0)
	// 시간대
	isSelectTime: 1,
	timeSlot: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
	],
	// 요일
	isSelectDay: 0,
	dayOfWeek: [0, 1, 2, 3, 4, 5, 6, 7], // 기본값: 전체
	gender: [0, 1],
	ageGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 기본값: 전체
	analyzeOption: null,
};

export const tempMapSettings: MapSettings = {
	// 날짜
	dateType: 0, // 기본값: 월별 (0)
	startDate: 202408, // 기본값: 2024년 3월 1일
	endDate: 202408, // 기본값: 2024년 3월 1일

	isSideBar: true, // 열림(true)(default), 닫힘(false)
	isdarkMode: true, // 기본값: 기본
	isVectorAnalysis: true, // 공간백터/지역상세이동

	// 생활패턴별 인구
	isTotallifestylePattern: 0, // 전체(0) or 상주/비상주(1)
	lifestylePattern: [0, 1, 2], // 기본값: 거주인구 (0)
	analyzeOption: null,

	// 성별
	gender: [0, 1], // 기본값: 남자 (0)

	// 연령
	// isPerAge: 0, // 5세단위(0), 10세단위(1)
	ageGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 기본값: 전체

	//내·외국인
	domesticGroup: [0], //기본값: 내국인(0), 외국인(1)
	//내·외지인
	localGroup: [1], //내지인(0)/외지인(1)

	// 이동목적
	movingPurposeGroup: [0, 1, 2, 3, 4, 5, 6, 7], // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8], //0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타

	// 시간대
	isSelectTime: 1,
	timeSlot: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
	], // 기본값: 전체
	// 유입/유출
	inOutFlow: true,

	// 지역비교
	regionAnalysisType: 0, //공간벡터분석(0),지역비교(1)
	regionAnalysisDistrict: 0, //시도,같은 시도 내 지역비교(0),시군구, 인구감소지역비교(1),읍면동(2)
	isRegionDetailAnalysis: false,

	// isGrid: false, // 격자(true),행정구역(false)
	// isGridScaleAuto: true,
	// gridScale: 0.25, // 격자 크기(0.05, 0.25)
};

export const tempGisOptions: GisSettings = {
	analysisType: 1,
	analysisSubType: 0, //기본값:유입분석(0)

	// 지역
	regionCode: 0,
	regionName: "",
	regionCodeArr: [0],
	regionNameArr: [""],

	// 행정구역/격자
	isGrid: false, // 격자(true),행정구역(false)
	isGridScaleAuto: true,
	gridScale: 0.25, // 격자 크기(0.05, 0.25)

	// 맵 시각화 옵션
	visualizeOption: 0, //0:히트맵, 1:공간벡터, 2:버블차트, 3:차트맵

	isDual: false,

	isMovingPurpose: false, // 이동목적(true), 이동수단(false)

	isNative: true, //내국인/외국인
	localGroup: [1], //내지인(0)/외지인(1),
	maps: [tempMapSettings, tempMapSettings],
	isMainModalOpen: false,
	isMenuOpen: false,
	// isDualModalOpen: false,
	// isChartSummaryOpen: false,
	isSelfAnalysis: false,
	selectedDualOptions: [],
	isAnalysisRange: false,
	isTimeLine: false,
	isOptionDisabled: false,

	timeLine: 0,
	// 이동목적
	movingPurposeGroup: [0, 1, 2, 3, 4, 5, 6, 7], // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8], //0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
};

// MapSettings 초기값
export const initialMapSettings: MapSettings = {
	isSearch: false,
	isSelectNewOption: true,

	isSideBar: true, // 열림(true)(default), 닫힘(false)

	// 날짜
	dateType: 0, // 기본값: 월별 (0)
	startDate: 202408, // 기본값: 2024년 3월 1일
	endDate: 202408, // 기본값: 2024년 3월 1일

	inOutFlow: true,

	isdarkMode: true, // 기본값: 기본
	isVectorAnalysis: true, // 공간백터/지역상세이동

	// 생활패턴별 인구
	isTotallifestylePattern: 0, // 전체(0) or 상주/비상주(1)
	lifestylePattern: [0, 1, 2], // 기본값: 거주인구 (0), 직장인구(1), 방문인구(2)
	analyzeOption: null,

	// 성별
	gender: [0, 1], // 기본값: 남자 (0)

	// 연령
	// isPerAge: 0, // 5세단위(0), 10세단위(1)
	ageGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 기본값: 전체

	//내·외국인
	domesticGroup: [0], //기본값: 내국인(0), 외국인(1)

	//내·외지인
	localGroup: [1], //내지인(0)/외지인(1)

	// 이동목적
	movingPurposeGroup: [0, 1, 2, 3, 4, 5, 6, 7], // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8], //0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타

	// 시간대
	isSelectTime: 1,
	timeSlot: [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
	], // 기본값: 전체
	// 유입/유출

	// 그리드 스케일
	// isGrid: false, // 격자(true),행정구역(false)
	// isGridScaleAuto: true,
	// gridScale: 0.25,

	// 지역비교
	regionAnalysisType: 0, //공간벡터분석(0),지역비교(1)
	regionAnalysisDistrict: 0, //시도,같은 시도 내 지역비교(0),시군구, 인구감소지역비교(1),읍면동(2)
	isRegionDetailAnalysis: false,
};

// TempSettings 초기값
export const initialTempSettings: GisSettings = {
	// 공통 옵션
	analysisType: 1, // 기본값: 생활인구 (0)
	analysisSubType: 0, //기본값:유입분석(0)

	// 지역
	regionName: "경기도 수원시 영통구", // 기본값: 지역명 없음
	regionCode: 41117, // 기본값: 지역코드 없음
	regionNameArr: ["경기도 수원시 영통구"], // 기본값: 지역명 없음
	regionCodeArr: [41117], // 기본값: 지역코드 없음

	// 행정구역/격자
	isGrid: false, // 격자(true),행정구역(false)
	isGridScaleAuto: true,
	gridScale: 0.25, // 격자 크기(0.05, 0.25)

	// 맵 시각화 옵션
	visualizeOption: 0, //0:히트맵, 1:공간벡터, 2:버블차트, 3:차트맵

	// // 듀얼 분석
	isDual: false, // 기본값: 듀얼 맵 비활성화

	isMainModalOpen: false,
	isMenuOpen: true,
	isChartSummaryOpen: false,
	isSelfAnalysis: true,

	selectedDualOptions: ["기간"], // 기본값 : 기간
	isAnalysisRange: false, // 기본값: 분석범위 비활성화
	isTimeLine: false, // 기본값: 시계열 차트 비활성화
	isOptionDisabled: false,

	isNative: true, // 내국인(true) / 외국인(false)
	// localGroup: [0, 1], // 내지인(0), 외지인(1)
	isMovingPurpose: true, // 이동목적(true), 이동수단(false)
	// 이동목적
	movingPurposeGroup: [0, 1, 2, 3, 4, 5, 6, 7], // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8], //0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	timeLine: 0, // 시간대
	// MapSettings 초기값을 가진 단일 맵 (또는 듀얼일 경우 두 개 이상의 맵)
	maps: [initialMapSettings, initialMapSettings], // 기본값: 한 개의 맵 설정으로 시작

	// 내지인/외지인 (jjh 임시 추가)
	localGroup: [1], // 내지인(0), 외지인(1)
};

// GisSettings 초기값
export const initialGisSettings: GisSettings = {
	// 공통 옵션
	analysisType: 1, // 기본값: 생활인구 (0)
	analysisSubType: 0, //기본값:유입분석(0)

	// 지역
	regionName: "경기도 수원시 영통구", // 기본값: 지역명 없음
	regionCode: 41117, // 기본값: 지역코드 없음
	regionNameArr: ["경기도 수원시 영통구"], // 기본값: 지역명 없음
	regionCodeArr: [41117], // 기본값: 지역코드 없음

	// 행정구역/격자
	isGrid: false, // 격자(true),행정구역(false)
	isGridScaleAuto: true,
	gridScale: 0.25, // 격자 크기(0.05, 0.25)

	// 맵 시각화 옵션
	visualizeOption: 0, //0:히트맵, 1:공간벡터, 2:버블차트, 3:차트맵

	// 듀얼 분석
	isDual: false, // 기본값: 듀얼 맵 비활성화

	isMenuOpen: true, // 왼쪽 분석옵션 열림(true), 닫힘(false)

	isMainModalOpen: false,
	isChartSummaryOpen: false,
	isSelfAnalysis: true,

	selectedDualOptions: ["기간"], // 기본값 : 기간
	isAnalysisRange: false, // 기본값: 분석범위 비활성화
	isTimeLine: false, // 기본값: 시계열 차트 비활성화
	isOptionDisabled: false,

	isNative: true, // 내국인(true) / 외국인(false)
	// localGroup: [0, 1], // 내지인(0), 외지인(1)
	isMovingPurpose: true, // 이동목적(true), 이동수단(false)
	// 이동목적
	movingPurposeGroup: [0, 1, 2, 3, 4, 5, 6, 7], // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8], //0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	timeLine: 0, // 시간대
	// MapSettings 초기값을 가진 단일 맵 (또는 듀얼일 경우 두 개 이상의 맵)
	maps: [initialMapSettings, initialMapSettings], // 기본값: 한 개의 맵 설정으로 시작

	// 내지인/외지인 (jjh 임시 추가)
	localGroup: [1], // 내지인(0), 외지인(1)
};

export enum EAnalysisType {
	alp = 0, // 생활인구
	mop = 1, // 생활이동
	llp = 2, // 체류인구
	flp = 3, // 유동인구
}

export enum ELifestylePattern {
	RSDN = 0, // 거주자
	WKPLC = 1, // 직장인
	VIST = 2, // 방문자
}
// 성별
export enum EGender {
	MALE = 0, // 남성
	FEML = 1, // 여성
}
// 성별
export enum EDomesticGroup {
	DMST = 0, // 내국인
	FORE = 1, // 외국인
}

export const prpsColor: any = {
	PRPS0: [65, 138, 236],
	PRPS1: [87, 137, 175],
	PRPS2: [121, 200, 196],
	PRPS3: [104, 77, 235],
	PRPS4: [249, 199, 79],
	PRPS5: [214, 52, 87],
	PRPS6: [216, 216, 216],
};

export const lifestylePatternColor: any = {
	WKPLC: [132, 114, 240],
	VIST: [121, 200, 196],
	RSDN: [65, 138, 236],
	0: [255, 255, 255, 0],
};

export const ageGroupColor: any = {
	0: [255, 255, 255, 0],
	10: [65, 138, 236],
	20: [87, 137, 175],
	30: [121, 200, 196],
	40: [104, 77, 235],
	50: [249, 199, 79],
	60: [214, 52, 87],
	70: [216, 216, 216],
	80: [87, 137, 175],
};

export const detailOption = {
	gender: false,
	ageGroup: false,
};
