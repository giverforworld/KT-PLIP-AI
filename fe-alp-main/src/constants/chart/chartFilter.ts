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

export const otherColorChart = [
	//alp
	"lastyearDataAvg",
	"lastyearDataSum",
	"lastyearDataUnique",
	"preMonthDataAvg",
	"preMonthDataSum",
	"preMonthDataUnique",
	"ageDataAvg",
	"ageDataSum",
	"ageDataUnique",
	"genderDataAvg",
	"genderDataSum",
	"genderDataUnique",
	"weekData",
	"weekDataAvg",
	"weekDataSum",
	"weekDataUnique",
	"weekedData",
	"weekedDataAvg",
	"weekedDataSum",
	"weekedDataUnique",
	"foreignerLastyearData",
	"foreignerPreMonthData",
	"foreignerWeekData",
	"foreignerData",
	"foreignerDataGroup",
	"pCurrentDataAvg",
	"pCurrentDataSum",
	"pCurrentDataUnique",
	"currentData",
	"modalGenderData",
	"modalAgeData",
	"inflowData",
	"outflowData",
	"weekendInflowData",
	"weekendOutflowData",
	"inflowDataGroup",
	"outflowDataGroup",
	"weekendInflowDataGroup",
	"weekendOutflowDataGroup",

	//llp
	"llpPreYMonthData",
	"llpPremonthData",
	"llpAvgDaysOfStayData",
	"llpAverageStayOverDaysData",
	"llpAvgStayTimeData",
	"llpHourWeekData",
	"llpStayDaysPeopleData",
	"llpTop10InboundAreasData",
	"llpTop10InboundAreasDataGroup",
	"llpHourGenderData",
	"llpAverageStayDaysPerRegionData",

	//mop
	"oddLastyearData",
	"oddPreMonthData",
	"oddGenderData",
	"oddAgeData",
	"oddGenderMoveData",
	"oddAgeDataGroup",
	"oddFlowDataGroup",
	"oddWeekPopData",
	"oddWeekPopDataGroup",
	"oddAgeMoveDataGroup",
	"oddPurposeDataGroup",
	"oddTransDataGroup",
	//
	"dashboardSidoAlp",
	"dashboardSidoLlp",
	"regTop5InboundAreasData",
	"regTop5OutboundAreasData",
];

// 양방향 생키 테이블표
export const sankeyTable = [
	"flowDataAvg",
	"flowDataSum",
	"flowDataGroupAvg",
	"flowDataGroupSum",
	"mopFlowData",
	"oddFlowData",
	"mopFlowDataGroup",
	"oddFlowDataGroup",
	"llpFlowData",
	"llpFlowDataGroup",
];

// 단방향 생키 테이블표
export const singleSankeyTable = [
	"inflowData",
	"weekendInflowData",
	"outflowData",
	"weekendOutflowData",
	"inflowDataGroup",
	"outflowDataGroup",
	"weekendInflowDataGroup",
	"weekendOutflowDataGroup",
];

// 비교화면 일렬 좌우정렬
export const rowSpanChart = [
	//alp
	"foreignerDataGroup",
	//llp
	"llpCurrentDataGroup",
	//mop
	"oddWeekdayHolidayMoveDataGroup",
	"oddPurposeDataGroup",
	"oddTransDataGroup",
	"purposeMoveInflowRatioDataGroup",
	"purposeMoveOutflowRatioDataGroup",
	"oddPurMoveInflowRatioDataGroup",
	"oddPurMoveOutflowRatioDataGroup",
	"transMoveInflowRatioDataGroup",
	"transMoveOutflowRatioDataGroup",
	"oddTraMoveInflowRatioDataGroup",
	"oddTraMoveOutflowRatioDataGroup",
];

//비교화면시에도 col-span-1유지하는 차트
export const colspanOneChart = [
	"inflowDataGroup",
	"outflowDataGroup",
	"weekendInflowDataGroup",
	"weekendOutflowDataGroup",
];

//지방 소멸 지수 바차트
export const popUp = ["extinctionData", "extinctionDataGroup"];

export const barGradientChart = ["dashboardSidoMop"];

//llp 평균 체류일수, 숙박일수, 체류시간 비교화면
export const markLineChart = [
	"llpAvgDaysOfStayDataGroup",
	"llpAverageStayOverDaysDataGroup",
	"llpAvgStayTimeDataGroup",
];

//체류인구 조건 차트
export const averageValuechart = ["llpStayTimeCompareData", "llpStayTimeCompareDataGroup"];
//체류인구 연령대별 주민등록인구 비교 비율 수치가 총 합이 100%
export const percentValueChart = ["llpHourMonthAgeData", "llpHourMonthAgeDataGroup"];
//체류인구 주민등록인구 대비 체류인구 현황 차트
export const maxMinChart = ["llpCurrentData", "llpCurrentDataGroup"];

//히트맵
export const heatmapChart = ["districtData", "districtDataGroup", "yearMoveData"];

// mop 스캐터 차트
export const mopScatter = ["scatterData", "scatterDataGroup"];

//읍면동 지역랭킹
export const rankChartHeader = [
	"alpRaceTownDataAvg",
	"alpRaceTownDataSum",
	"mopRaceTownData",
	"alpRaceTownDataGroupAvg",
	"alpRaceTownDataGroupSum",
	"mopRaceTownDataGroup",
];
// 지역랭킹 랭킹 차트
export const rankingChart = [
	//alp
	"alpRaceDataAvg",
	"alpRaceDataSum",
	"alpRaceDataGroupAvg",
	"alpRaceDataGroupSum",

	"alpRaceTownDataAvg",
	"alpRaceTownDataSum",
	"alpRaceTownDataGroupAvg",
	"alpRaceTownDataGroupSum",
	//llp
	"llpRaceData",
	"llpRaceDataGroup",
	//mop
	"mopRaceData",
	"mopRaceTownData",
	"mopRaceDataGroup",
	"mopRaceTownDataGroup",
];

// 레포트 파이차트 변환
export const convertedToReportPieChartData = [
	//alp
	//llp
	"llpExternalResidentStayRatioData",

	//mop
	"llpStayOverRatioData",
	// "llpStayOverRatioDataGroup",
	"llpHourWeekPerData",

	
];
export const convertedToPieChartData = [
	//alp
	//llp
	// 체류인구 현황
	"llpHourWeekPerData",
	//체류인구 특성
	"llpExternalResidentStayRatioData",
	// "llpStayOverRatioDataGroup",
	// "llpStayOverRatioData",

	// mop 생활이동현황 지역 출도착지 분석  ODD Origin-Destination
	"oddWeekdayHolidayMoveData",
	"oddWeekdayHolidayMoveDataGroup",
];
// 스택차트 변환
export const convertedToStackChartData = [
	//alp

	//llp
	"llpStayDaysRatioData",
	"llpStayOverRatioData",
	"llpShortStayRatioData",

	//mop
	"mopPurposeInflowData",
	"mopPurposeOutflowData",
	"mopTransportInflowData",
	"mopTransportOutflowData",
	"purposeMoveOutflowData",
	"purposeMoveInflowData",
	"purposeMoveInflowRatioData",
	"transMoveInflowData",
	"transMoveInflowRatioData",
	"transMoveOutflowData",
	"oddPurposeData",
	"oddTransData",
	"oddPurMoveOutflowData",
	"oddPurMoveInflowData",
	"oddTraMoveOutflowData",
	"oddTraMoveInflowData",
];

//10세, 5세 단위 밸류 사용
export const ageConditionChartData = [
	//alp
	"genderageDataAvg",
	"genderageDataSum",
	"genderageDataUnique",
	"pAgeDataAvg",
	"pAgeDataSum",
	"pAgeDataUnique",
	"pGenderAgeResidenceDataAvg",
	"pGenderAgeResidenceDataSum",
	"pGenderAgeResidenceDataUnique",
	"pGenderAgeWorkerData",
	"pGenderAgeVisitorData",
	"cGenderAgeResidenceData",
	"cGenderAgeRegisteredData",
	"genderageDataGroupAvg",
	"genderageDataGroupSum",
	"genderageDataGroupUnique",
	"pGenderAgeResidenceDataGroup",
	"pGenderAgeWorkerDataAvg",
	"pGenderAgeWorkerDataSum",
	"pGenderAgeWorkerDataUnique",
	"pGenderAgeVisitorDataAvg",
	"pGenderAgeVisitorDataSum",
	"pGenderAgeVisitorDataUnique",
	"pGenderAgeWorkerDataGroup",
	"pGenderAgeVisitorDataGroup",
	"cAgeData",
	"cGenderAgeResidenceDataGroup",
	"cGenderAgeRegisteredDataGroup",

	//llp
	"llpGenderAgeData",
	"llpHourMonthAgeData",
	"llpHourMonthAgeDataGroup",
	"llpAgeGroupStayData",
	"llpAgeGroupStayDataGroup",
	// "llpAgeGroupStayOverData",
	"llpAgeGroupStayOverDataGroup",

	//mop
	"mopAgeData",
	"oddAgeData",
	"mopGenderAgeInflowData",
	"mopGenderAgeOutflowData",
	"oddGenderAgeInflowData",
	"oddGenderAgeOutflowData",

	"mopAgeDataGroup",
	"oddAgeDataGroup",
	"mopGenderAgeInflowDataGroup",
	"mopGenderAgeOutflowDataGroup",
	"oddGenderAgeInflowDataGroup",
	"oddGenderAgeOutflowDataGroup",
	"oddPurAgeMoveInflowDataGroup",
	"oddPurAgeMoveOutflowDataGroup",
	"purposeAgeMoveInflowDataGroup",
	"purposeAgeMoveOutflowDataGroup",
	"purposeAgeMoveInflowData",
	"purposeAgeMoveOutflowData",
	"transAgeMoveInflowData",
	"mopGenderAgeMoveDataGroup",
	"oddTraAgeMoveInflowDataGroup",
	"oddTraAgeMoveOutflowDataGroup",
	"transAgeMoveInflowDataGroup",
	"transAgeMoveOutflowDataGroup",
	"purposeAgeMoveInflowDataGroup",
];

//10세, 5세 단위 키 사용
export const ageConditionKeyData = [
	// 현재 사용중인 차트 없음
	"data",
];

// 스캐터 차트 배경 텍스트
export const scatterGraphic = ["dashboardSidoScatterData"];

export const AlpTableChart = ["랭킹", "시도", "시군구", "생활인구 수", "전년 동기 대비 증감"];
export const LlpTableChart = ["랭킹", "시도", "시군구", "체류인구 수", "체류인구 배수"];
export const mopTableChart = ["랭킹", "시도", "시군구", "유입인구 수", "전년 동기 대비 증감"];
export const AlpTableCharts = [
	"랭킹",
	"시도",
	"시군구",
	"읍면동",
	"생활인구 수",
	"전년 동기 대비 증감",
];
export const LlpTableCharts = ["랭킹", "시도", "시군구", "읍면동", "체류인구 수", "체류인구 배수"];
export const LlpRankingChart = ["랭킹", "시군구", "배수", "전년 동기 대비 증감 "];
export const mopTableCharts = [
	"랭킹",
	"시도",
	"시군구",
	"읍면동",
	"유입인구 수",
	"전년 동기 대비 증감",
];
