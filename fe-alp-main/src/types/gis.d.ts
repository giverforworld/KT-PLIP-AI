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

interface GisSettings {
	// 공통 옵션
	analysisType: 0 | 1 | 2 | 3; // 0: 생활인구, 1: 생활이동, 2: 체류인구, 3: 유동인구
	analysisSubType: 0 | 1; //0:유입분석, 1:인구감소지역 비교

	// 지역
	regionName: string; // 지역 예: "서울시 강남구"
	regionCode: number;
	regionNameArr: string[];
	regionCodeArr: number[];

	// 행정구역/격자
	isGrid: boolean;
	isGridScaleAuto: boolean;
	gridScale: number;

	// 맵 시각화 옵션
	visualizeOption: 0 | 1 | 2 | 3; //0:히트맵, 1:공간벡터, 2:버블차트, 3:차트맵

	// 듀얼 분석
	isDual?: boolean;

	// 이동목적/수단
	isMovingPurpose: boolean; // 이동목적(true), 이동수단(false)

	// 이동목적
	movingPurposeGroup: number[]; // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: number[]; // 0:전체,1:차량, 2:노선버스, 3:지하철, 4:도보,5:고속버스,6:기차,7:항공, 8:기타

	isMainModalOpen: boolean;
	isMenuOpen: boolean;
	isChartSummaryOpen?: boolean;
	isSelfAnalysis: boolean;

	selectedDualOptions: string[];
	isAnalysisRange: boolean;
	isTimeLine: boolean;
	isOptionDisabled: boolean;

	isNative: boolean; // 내국인(true) / 외국인(false)
	// localGroup: number[]; // 내지인(0)/외지인(1)
	timeLine: number; // 시간대
	maps: Array<MapSettings>;

	// 내지인/외지인 (jjh 임시 추가)
	localGroup: number[];
}

// 분석 옵션
interface MapSettings {
	isSearch?: boolean;
	isSelectNewOption?: boolean;
	isSideBar: boolean; // 사이드 메뉴

	// 날짜
	dateType: 0 | 1; // 0: 월별, 1: 기간별
	startDate: number; // 예: 20240301
	endDate: number; // 예: 20240331

	inOutFlow: boolean; // 유입(true),유출(false)

	isdarkMode: boolean; // 기본/흑백 여부
	isVectorAnalysis: boolean; // 생활이동 공간백터/지역상세이동

	// 생활패턴별 인구
	isTotallifestylePattern: 0 | 1; // 전체(0) or 상주/비상주(1)
	lifestylePattern: number[]; // 0: 거주인구, 1: 직장인구, 2: 방문인구
	analyzeOption: string | null;

	// 성별
	gender: number[]; // 0: 남자, 1: 여자
	// 연령
	// isPerAge: 0 | 1;
	ageGroup: number[]; // 0: 전체, 10: 10대 이하, 20: 20대, ..., 70: 70대 이상
	//내·외국인
	domesticGroup: number[]; // 기본값: 내국인 (0)
	// 내·외지인
	localGroup: number[]; // 내지인(0)/외지인(1)

	// 이동목적
	movingPurposeGroup: number[]; // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타
	// 이동수단
	movingVehicleGroup: number[]; // 0:전체,1:귀가, 2:업무, 3:학교, 4:쇼핑(레저),5:관광,6:병원,7:기타

	// 시간대
	isSelectTime: 0 | 1;
	timeSlot: number[]; // 0(시) ~ 23(시)

	// // 그리드 스케일
	// isGrid: boolean;
	// isGridScaleAuto: boolean;
	// gridScale: number;

	// 지역비교
	regionAnalysisType: 0 | 1; //공간벡터분석(0),지역비교(1)
	regionAnalysisDistrict: 0 | 1 | 2; //시도,같은 시도 내 지역비교(0),시군구, 인구감소지역비교(1),읍면동(2)
	isRegionDetailAnalysis: boolean;
}

type TimeSeriesStatus = {
	// 시계열 재생
	timeSeriesType: 0 | 1;
	playStatus: 0 | 1 | 2 | 3; //  0:정지, 1:재생, 2:2배속재생, 3:3배속 재생
	currentTime: number; // 재생중인 현재 시간(unixtimestamp),
	currentValue: number; // 재생중인 현재 값
	isData: boolean;
};

type TempSettings = {
	analysisSubType: 0 | 1; //기본값:유입분석(0)

	dateType: 0 | 1;
	startDate: number;
	endDate: number;

	regionName: string;
	regionCode: number;
	regionNameArr: string[];
	regionCodeArr: number[];

	inOutFlow: boolean;
	isNative: boolean;
	localGroup: number[];

	isGrid: boolean;
	isGridScaleAuto: boolean;
	gridScale: number;

	isMovingPurpose: boolean;
	// 생활패턴
	isTotallifestylePattern: 0 | 1;
	lifestylePattern: number[];
	// 시간대
	isSelectTime: 0 | 1;
	timeSlot: number[];
	gender: number[];
	ageGroup: number[];
	// 요일
	isSelectDay: 0 | 1;
	dayOfWeek: number[]; // 0(일요일) ~ 6(토요일) 형식으로 요일 선택
	analyzeOption: string | null;
};

type ModalOrButtonKey =
	| "analysisRange"
	| "dualAnalysis"
	| "timeSeries"
	| "visualization"
	| "regionAnalysis";

// data type
// grid, polygons, trip, text, scatter, d3
// 1. 행정구역별 단계구분도 : polygon, text
// 2. 격자별 단계구분도 : grid (time series)
// 3. 3D 막대 차트 : polygon, text, gridCell
// 4. 버블 차트 : scatter, text
// 5. 공간 벡처 분석 : d3
// 6. GIS 생활이동 분석 : trip, polygon, text

// import { Topology } from "topojson-specification"; 대체
type Topology = NonNullable<any>; // topoJson,

// FeatureCollection
type GeoJson = NonNullable<any>;

// polygon,text, grid 등 mapdata를 담은 객체
type MapData = {
	admData?: AdmData;
	gridData?: GridData;
	ODData?: ODData;
	ODTrip?: NonNullable<any>;
	[key: string]: NonNullable<any>;
};

type AdmData = {
	[key: string]: {
		count: number;
		center: Array<number>;
		maxCount: number;
		chartData: {
			[key: string]: number;
		};
	};
};

type gridData = NonNullable<any>;
type ODData = NonNullable<any>;

// text, grid, polygon
type Data = Array<{
	time: number;
	count: number;
	regionCode: number;
	// text, grid, scatter
	center: [number, number];
	// text,
	regionName: string;
	// polyChart
	chartData: { [key: string]: number };
}>;

type TripData = {
	originCD: number;
	desCD: number;
	count: number;
	timeOri: number;
	timeDes: number;

	// nextjs 에서 만들 듯
	path: Array<number[]>;
	timeSamps: number[];
};

// 여기부터 백엔드 체크
// 1. 행정구역별 단계구분도 : polygon, text
// db (regionInfo, geoJson, data) -> backend (geoJson, regionInfo+data = layers1) -> layers1
type MapDataPolygon = {
	//req: regionCode, time,options
	// + geoJson
	time: number;
	reqRegionCode: number; //요청에 대한 regionCode
	regionName: string;
	options: { [key: string]: string | number };
	layerData: {
		regionCode: number;
		regionName: string;
		count: { [key: string]: number };
		center: [number, number];
	}[];
};

////!!!!!!!!!!!! 시계열이라서
// 2. 격자별 단계구분도 : grid (time series)
type MapDataGrid = {
	time: number;
	regionCode: number;
	regionName: string;
	options: { [key: string]: string | number };
	layerData: {
		[key: UnixTimeStamp]: {
			// timestamp 별로 group
			time: UnixTimeStamp;
			count: { [key: string]: number };
			coord: [number, number]; //left-bottom
		}[];
	};
};
// 3. 3D 막대 차트 : polygon, text, gridCell
type MapDataPolyChart = {
	// + geoJson
	time: number;
	regionCode: number;
	regionName: string;
	options: { [key: string]: string | number };
	layerData: {
		regionCode: number; //polygon
		regionName: string; //text
		count: number; // text , polygon (color)
		center: [number, number]; //text , gridCell
		chartData: { [key: string]: number }; // gridCell, chart
	}[];
};

// 4. 버블 차트 : scatter, text
type MapDataBubble = {
	time: number;
	regionCode: number;
	regionName: string;
	options: { [key: string]: string | number };
	layerData: {
		regionCode: number;
		regionName: string; //text
		count: number; //text, polygon (color)
		center: [number, number]; //text, scatter
	}[];
};
// !!!!!! 3
// 5. 공간 벡처 분석 : d3
type MapDataD3 = {
	time: number;
	regionCode: number;
	regionName: string;
	options: { [key: string]: string | number };
	layerData: {
		// 시간
		[unixTimeStamp: number]: {
			regionCode: number;
			regionName: string;
			dowCd: number;
			isHoliday: boolean;
			center: [number, number];
			destinations: {
				regionCode: number;
				regionName: string;
				count: { [key: string]: string | number };
				center: [number, number];
			}[];
		};
	};
};
//!!!!!!!!!!!222 시계열이라서
// 6. GIS 생활이동 분석 : trip, polygon, text
type MapDataTrip = {
	time: number;
	regionCode: number;
	regionName: string;
	center: [number, number]; // trip
	options: { [key: string]: string | number };
	layerData: {
		regionCode: number; // polygon
		regionName: string; // text
		destinations: {
			regionCode: number; // polygon
			regionName: string; // text, trip
			count: number; //text, polygon(color)
			center: [number, number]; //text
			timeOri: number;
			timeDes: number;
		}[];
	}[];
};

type TripLayerData = {
	countRate: number;
	path: Array<number[]>;
	timeSamps: number[];
};

// geoJson or topoJson
//
type geoJson = {
	// key: 202404
	[key: string]: geoJson;
	// key: 202405
	[key: string]: geoJson;
};

type GisQueryParams = {
	layerType: number | string;
	from: number | string;
	to: number | string;
	regions: number[];
	timeCodes: string[];
};

type DetailOption = {
	gender: boolean;
	ageGroup: boolean;
	[key: string]: boolean;
};

type GisChart = {
	time: number;
	regionCode: number; //요청에 대한 regionCode
	regionName: string;
	options: { [key: string]: number[] | string[] | string | number };
	chartData: {
		[key: number]: { [key: string]: string | number }[];
	};
};
type GisChartData = {
	[key: string]: string | number | string[] | number[];
}[];

type TlChartData = {
	timestamp: string;
	count: number;
	[key: string]: string | number | string[] | number[];
};

// 생활인구 차트 데이터 타입
type AlpChartData = {
	timestamp: string;
	dowCd: number;
	isHoliday: boolean;
	RSDN_FEML_00: number;
	RSDN_FEML_10: number;
	RSDN_FEML_20: number;
	RSDN_FEML_30: number;
	RSDN_FEML_40: number;
	RSDN_FEML_50: number;
	RSDN_FEML_60: number;
	RSDN_FEML_70: number;
	RSDN_FEML_80: number;
	VIST_FEML_00: number;
	VIST_FEML_10: number;
	VIST_FEML_20: number;
	VIST_FEML_30: number;
	VIST_FEML_40: number;
	VIST_FEML_50: number;
	VIST_FEML_60: number;
	VIST_FEML_70: number;
	VIST_FEML_80: number;
	WKPLC_FEML_00: number;
	WKPLC_FEML_10: number;
	WKPLC_FEML_20: number;
	WKPLC_FEML_30: number;
	WKPLC_FEML_40: number;
	WKPLC_FEML_50: number;
	WKPLC_FEML_60: number;
	WKPLC_FEML_70: number;
	WKPLC_FEML_80: number;
	RSDN_MALE_00: number;
	RSDN_MALE_10: number;
	RSDN_MALE_20: number;
	RSDN_MALE_30: number;
	RSDN_MALE_40: number;
	RSDN_MALE_50: number;
	RSDN_MALE_60: number;
	RSDN_MALE_70: number;
	RSDN_MALE_80: number;
	VIST_MALE_00: number;
	VIST_MALE_10: number;
	VIST_MALE_20: number;
	VIST_MALE_30: number;
	VIST_MALE_40: number;
	VIST_MALE_50: number;
	VIST_MALE_60: number;
	VIST_MALE_70: number;
	VIST_MALE_80: number;
	WKPLC_MALE_00: number;
	WKPLC_MALE_10: number;
	WKPLC_MALE_20: number;
	WKPLC_MALE_30: number;
	WKPLC_MALE_40: number;
	WKPLC_MALE_50: number;
	WKPLC_MALE_60: number;
	WKPLC_MALE_70: number;
	WKPLC_MALE_80: number;
};

// 시계열 차트 타입
interface TransformedTimeSeriesData {
	구분: string;
	생활인구: number;
}

interface GroupedData {
	[key: number]: GroupedDataItem;
}

type GisTooltipInfo = {
	mapType: string;
	mapIdx: number;
	id: string | number;
	x: number;
	y: number;
	isActive: boolean;
	count: number;
	data: any;
};

type gridOptions = { value: 0 | 1 | 2; label: string; name: string; disabled?: boolean }[];
