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

// import MopPreset1 from "@images/gis/mop_preset1.png";
// import PresetCommon from "@images/gis/preset_common.png";
// import MopPreset2 from "@images/gis/mop_preset2.png";
// import MopPreset3 from "@images/gis/mop_preset3.png";
// import MopPreset4 from "@images/gis/mop_preset4.png";
// import MopPreset5 from "@images/gis/mop_preset5.png";
// import AlpPreset1 from "@images/gis/alp_preset1.png";
// import AlpPreset2 from "@images/gis/alp_preset2.png";
// import AlpPreset3 from "@images/gis/alp_preset3.png";
// import AlpPreset4 from "@images/gis/alp_preset4.png";
// import AlpPreset5 from "@images/gis/alp_preset5.png";
// import AlpPreset6 from "@images/gis/alp_preset6.png";
// import LlpPreset1 from "@images/gis/llp_preset1.png";
// import LlpPreset2 from "@images/gis/llp_preset2.png";
// import LlpPreset3 from "@images/gis/llp_preset3.png";

export const genderFilter: Filter = {
	key: "analyzeGender",
	category: "성별",
	labels: ["남성", "여성"],
};

export const domesticFilter: Filter = {
	key: "analyzeDomestic",
	category: "내·외국인",
	labels: ["내국인", "외국인"],
};

export const localFilter: Filter = {
	key: "localFilter",
	category: "내·외지인",
	labels: ["내지인", "외지인"],
};

export const dayOfWeek0Filter: Filter = {
	category: "요일",
	labels: ["전체", "월", "화", "수", "목", "금", "토", "일"],
};

export const dayOfWeek1Filter: Filter = {
	category: "요일",
	labels: ["전체", "평일", "휴일"],
};

export const age0Filter: Filter = {
	key: "analyzeAgeGroup",
	category: "연령",
	labels: [
		"전체",
		"10세 미만",
		"10-14세",
		"15-19세",
		"20-24세",
		"25-29세",
		"30-34세",
		"35-39세",
		"40-44세",
		"45-49세",
		"50-54세",
		"55-59세",
		"60-64세",
		"65-69세",
		"70-74세",
		"75-79세",
		"80세 이상",
	],
};
export const age1Filter: Filter = {
	key: "analyzeAgeGroup",
	category: "연령",
	labels: [
		"전체",
		"10대 미만",
		"10대",
		"20대",
		"30대",
		"40대",
		"50대",
		"60대",
		"70대",
		"80대 이상",
	],
};

export const time0Filter: Filter = {
	category: "시간대",
	labels: [
		"전체",
		"한밤 0~3시",
		"새벽 3~6시",
		"아침 6~9시",
		"늦은오전 9~12시",
		"이른오후 12~15시",
		"늦은오후 15시~18시",
		"저녁 18시~21시",
		"늦은밤 21시~24시",
	],
};

export const time1Filter: Filter = {
	category: "시간대",
	labels: [
		"전체",
		"00시",
		"01시",
		"02시",
		"03시",
		"04시",
		"05시",
		"06시",
		"07시",
		"08시",
		"09시",
		"10시",
		"11시",
		"12시",
		"13시",
		"14시",
		"15시",
		"16시",
		"17시",
		"18시",
		"19시",
		"20시",
		"21시",
		"22시",
		"23시",
	],
};

export const pattern0Filter: Filter = {
	key: "analyzeLifestylePattern",
	category: "생활패턴",
	labels: ["거주인구", "직장인구", "방문인구"],
};

export const pattern1Filter: Filter = {
	key: "analyzeLifestylePattern",
	category: "생활패턴",
	labels: ["상주인구(거주+직장)", "비상주인구(방문)"],
};

export const ReferenceRegionFilter: Filter = {
	key: "inOutFlow",
	category: "기준지역",
	labels: ["기준지역으로 유입", "기준지역으로 유출"],
};

export const movingPurposeFilter: Filter = {
	key: "movingPurposeGroup",
	category: "이동목적",
	labels: ["전체", "귀가", "출근", "학교", "쇼핑(레저)", "관광", "병원", "기타"],
};

export const movingVehicleFilter: Filter = {
	key: "movingVehicleGroup",
	category: "이동수단",
	labels: ["전체", "차량", "노선버스", "지하철", "도보", "고속버스", "기차", "항공", "기타"],
};

export function createRankFilters(filters: Filter[]): Filter[] {
	return [...filters, genderFilter, age1Filter];
}

export const gisPreset = [
	{
		type: "basic",
		title: "우리지역에서 유출하는 인구가\n가장 많은 상위 10개 지역은?",
		option: ["유출", "행정구역"],
		image: "mop_preset1",
		settingsOption: {
			analysisType: 1,
			visualizeOption: 1,
			isMovingPurpose: true,
			maps: [
				{
					isGrid: false,
					isVectorAnalysis: false,
					visualizeOption: 1,
					inOutFlow: false,
				},
			],
		},
	},
	{
		type: "basic",
		title: "오전 6-9시에 우리지역으로 유입하는\n상위 10개 지역은 어디일까?",
		option: ["유입", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			visualizeOption: 0,
			maps: [
				{
					isGrid: false,
					timeSlot: [7, 8, 9, 10],
					inOutFlow: true,
					isVectorAnalysis: true,
				},
			],
		},
	},
	{
		type: "basic",
		title: "3040이 출근목적으로\n우리지역에서 이동하는\n주요 지역 지역은 어디일까?",
		option: ["유출", "행정구역"],
		image: "mop_preset2",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			maps: [
				{
					movingPurposeGroup: [2],
					ageGroup: [4, 5],
					isGrid: false,
					inOutFlow: false,
				},
			],
		},
	},
	{
		type: "basic",
		title: "오후 7-9시에 우리지역으로 유입하는\n상위 10개 지역은 어디일까?",
		option: ["유입", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			visualizeOption: 0,
			maps: [
				{
					isGrid: false,
					gender: [0, 1],
					domesticGroup: [0, 1],
					inOutFlow: true,
					isVectorAnalysis: true,
					timeSlot: [20, 21, 22],
				},
			],
		},
	},
	{
		type: "basic",
		title: "어디에 사람이\n가장 많이 몰릴까?",
		option: ["격자"],
		image: "alp_preset1",
		settingsOption: {
			analysisType: 0,
			isGrid: true,
			gridScale: 0.25,
			isGridScaleAuto: false,
			maps: [{ lifestylePattern: [0, 1, 2] }],
		},
	},
	{
		type: "basic",
		title: "오후 12시-5시, 방문인구가\n가장 많이 몰리는 곳은 어디일까?",
		option: ["생활패턴", "격자"],
		image: "alp_preset4",
		settingsOption: {
			analysisType: 0,
			isGrid: true,
			gridScale: 0.25,
			isGridScaleAuto: false,
			maps: [
				{
					lifestylePattern: [2],
					timeSlot: [1, 2, 3, 4, 5, 6],
				},
			],
		},
	},
	{
		type: "basic",
		title: "인구감소지역 간\n체류인구를 비교해보면?",
		option: ["인구감소지역", "행정구역"],
		image: "llp_preset1",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 1,
			maps: [
				{
					localGroup: [0, 1],
					gender: [0, 1],
				},
			],
		},
	},
	{
		type: "basic",
		title: "우리지역에 체류하는 인구가\n가장 많이 유입된 10개 지역은?",
		option: ["유입지역", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 0,
			visualizeOption: 1,
			maps: [
				{
					isGrid: false,
					isVectorAnalysis: false,
					localGroup: [0, 1],
					gender: [0, 1],
				},
			],
		},
	},
];
export const MopAnalysis = [
	{
		type: "basic",
		title: "우리지역에서 유출하는 인구가 가장 많은 상위 10개 지역은?",
		option: ["유출", "행정구역"],
		image: "mop_preset1",
		settingsOption: {
			analysisType: 1,
			visualizeOption: 1,
			isMovingPurpose: true,
			maps: [
				{
					isGrid: false,
					domesticGroup: [0, 1],
					isVectorAnalysis: false,
					visualizeOption: 1,
					gender: [0, 1],
					inOutFlow: false,
				},
				{
					isGrid: false,
					domesticGroup: [0, 1],
					isVectorAnalysis: false,
					visualizeOption: 1,
					gender: [0, 1],
					inOutFlow: false,
				},
			],
		},
	},
	{
		type: "basic",
		title: "주말에 우리지역으로 유입하는 상위 10개 지역은 어디일까?",
		option: ["유입", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			visualizeOption: 0,
			maps: [
				{
					isGrid: false,
					dayOfWeek: [6, 7],
					gender: [0, 1],
					domesticGroup: [0, 1],
					inOutFlow: true,
					isVectorAnalysis: true,
				},
				{
					isGrid: false,
					dayOfWeek: [6, 7],
					gender: [0, 1],
					domesticGroup: [0, 1],
					inOutFlow: true,
					isVectorAnalysis: true,
				},
			],
		},
	},
	{
		type: "basic",
		title: "3040이 출근목적으로 이동하는 상위 10개 지역은 어디일까?",
		option: ["유출", "행정구역"],
		image: "mop_preset2",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			maps: [
				{
					movingPurposeGroup: [2],
					ageGroup: [4, 5],
					gender: [0, 1],
					domesticGroup: [0, 1],
					isGrid: false,
					inOutFlow: false,
				},
				{
					movingPurposeGroup: [2],
					ageGroup: [4, 5],
					gender: [0, 1],
					domesticGroup: [0, 1],
					isGrid: false,
					inOutFlow: false,
				},
			],
		},
	},
	// {
	// 	type: "dual",
	// 	title: "오전 7-9시 우리지역에서 나가는 인구와 들어오는 인구를 비교해보면?",
	// 	option: ["유입", "유출", "격자", "듀얼"],
	// 	image: "mop_preset3",
	// 	settingsOption: {
	// 		isDual: true,
	// 		analysisType: 1,
	// 		isMovingPurpose: true,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				gender: [0, 1],
	// 				timeSlot: [8, 9, 10],
	// 				domesticGroup: [0, 1],
	// 				isGrid: true,
	// 				inOutFlow: true,
	// 				isSelectTime: 1,
	// 			},
	// 			{
	// 				gender: [0, 1],
	// 				timeSlot: [8, 9, 10],
	// 				domesticGroup: [0, 1],
	// 				isGrid: true,
	// 				inOutFlow: false,
	// 				isSelectTime: 1,
	// 			},
	// 		],
	// 	},
	// },
	// {
	// 	type: "dual",
	// 	title: "유출인구가 더 많이 이용하는 이동수단은 대중교통일까, 차량일까?",
	// 	option: ["유출", "이동수단", "격자", "듀얼"],
	// 	image: "mop_preset4",
	// 	settingsOption: {
	// 		isDual: true,
	// 		analysisType: 1,
	// 		isMovingPurpose: false,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				gender: [0, 1],
	// 				domesticGroup: [0, 1],
	// 				isGrid: true,
	// 				inOutFlow: false,
	// 				movingVehicleGroup: [2, 3],
	// 			},
	// 			{
	// 				gender: [0, 1],
	// 				domesticGroup: [0, 1],
	// 				isGrid: true,
	// 				inOutFlow: false,
	// 				movingVehicleGroup: [1],
	// 			},
	// 		],
	// 	},
	// },
	{
		type: "basic",
		title: "시간의 흐름에 따른 유입인구의 변화는?",
		option: ["격자", "시계열"],
		image: "mop_preset5",
		settingsOption: {
			analysisType: 1,
			isMovingPurpose: true,
			isTimeLine: true,
			maps: [
				{
					gender: [0, 1],
					domesticGroup: [0, 1],
					isGrid: true,
					inOutFlow: true,
				},
				{
					gender: [0, 1],
					domesticGroup: [0, 1],
					isGrid: true,
					inOutFlow: true,
				},
			],
		},
	},
];

export const AlpAnalysis = [
	{
		type: "basic",
		title: "어디에 사람이 가장 많이 몰릴까?",
		option: ["격자"],
		image: "alp_preset1",
		settingsOption: {
			analysisType: 0,
			maps: [
				{ isGrid: true, lifestylePattern: [0, 1, 2] },
				{ isGrid: true, lifestylePattern: [0, 1, 2] },
			],
		},
	},
	// {
	// 	type: "dual",
	// 	title: "오후 2시 성별 생활인구의 차이는?",
	// 	option: ["격자", "듀얼", "성별"],
	// 	image: "alp_preset2",
	// 	settingsOption: {
	// 		analysisType: 0,
	// 		isDual: true,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				isGrid: true,
	// 				isSelectTime: 1,
	// 				timeSlot: [15],
	// 				gender: [0],
	// 				isPerAge: 0,
	// 				ageGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	// 				lifestylePattern: [0, 1, 2],
	// 			},
	// 			{
	// 				isGrid: true,
	// 				isSelectTime: 1,
	// 				timeSlot: [15],
	// 				gender: [1],
	// 				isPerAge: 0,
	// 				ageGroup: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
	// 				lifestylePattern: [0, 1, 2],
	// 			},
	// 		],
	// 	},
	// },
	// {
	// 	type: "dual",
	// 	title: "저녁 9시 2030과 4050이 많이 몰리는 곳은 다를까?",
	// 	option: ["격자", "듀얼", "연령별"],
	// 	image: "alp_preset3",
	// 	settingsOption: {
	// 		analysisType: 0,
	// 		isDual: true,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				isGrid: true,
	// 				isSelectTime: 1,
	// 				timeSlot: [22],
	// 				gender: [0, 1],
	// 				ageGroup: [3, 4],
	// 				lifestylePattern: [0, 1, 2],
	// 			},
	// 			{
	// 				isGrid: true,
	// 				isSelectTime: 1,
	// 				timeSlot: [22],
	// 				gender: [0, 1],
	// 				ageGroup: [5, 6],
	// 				lifestylePattern: [0, 1, 2],
	// 			},
	// 		],
	// 	},
	// },
	{
		type: "basic",
		title: "주말 방문인구가 가장 많이 몰리는 곳은 어디일까?",
		option: ["격자"],
		image: "alp_preset4",
		settingsOption: {
			analysisType: 0,
			maps: [
				{
					isGrid: true,
					isSelectDay: 0,
					dayOfWeek: [6, 7],
					lifestylePattern: [2],
				},
				{
					isGrid: true,
					isSelectDay: 0,
					dayOfWeek: [6, 7],
					lifestylePattern: [2],
				},
			],
		},
	},
	{
		type: "basic",
		title: "외국인 생활인구는 어디 지역에 많을까?",
		option: ["행정구역", "외국인"],
		image: "alp_preset5",
		settingsOption: {
			analysisType: 0,
			isNative: false,
			maps: [
				{ isGrid: false, lifestylePattern: [0, 1, 2] },
				{ isGrid: false, lifestylePattern: [0, 1, 2] },
			],
		},
	},
	{
		type: "basic",
		title: "시간의 흐름에 따른 생활인구의 변화는?",
		option: ["격자", "시계열"],
		image: "alp_preset6",
		settingsOption: {
			analysisType: 0,
			isTimeLine: true,
			maps: [
				{ isGrid: true, lifestylePattern: [0, 1, 2] },
				{ isGrid: true, lifestylePattern: [0, 1, 2] },
			],
		},
	},
];

export const LlpAnalysis = [
	{
		type: "basic",
		title: "우리지역에 체류하는 인구가 가장 많이 유입된 10개 지역은?",
		option: ["유입지역", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 0,
			visualizeOption: 1,
			maps: [
				{
					isGrid: false,
					isVectorAnalysis: false,
					localGroup: [0, 1],
					gender: [0, 1],
				},
				{
					isGrid: false,
					isVectorAnalysis: false,
					localGroup: [0, 1],
					gender: [0, 1],
				},
			],
		},
	},
	{
		type: "basic",
		title: "주말에 우리지역에 체류한 인구가 가장 많이 유입된 10개 지역은?",
		option: ["유입지역", "행정구역"],
		image: "preset_common",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 0,
			visualizeOption: 1,
			maps: [
				{
					isGrid: false,
					isVectorAnalysis: false,
					dayOfWeek: [6, 7],
					localGroup: [0, 1],
					gender: [0, 1],
				},
				{
					isGrid: false,
					isVectorAnalysis: false,
					dayOfWeek: [6, 7],
					localGroup: [0, 1],
					gender: [0, 1],
				},
			],
		},
	},
	{
		type: "basic",
		title: "체류인구를 인구감소지역과 비교해보면?",
		option: ["인구감소지역", "행정구역"],
		image: "llp_preset1",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 1,
			maps: [
				{
					localGroup: [0, 1],
					gender: [0, 1],
				},
				{
					localGroup: [0, 1],
					gender: [0, 1],
				},
			],
		},
	},
	// {
	// 	type: "dual",
	// 	title: "체류인구의 성별 유입지를 비교해보면?",
	// 	option: ["유입지역", "행정구역", "듀얼"],
	// 	image: "llp_preset2",
	// 	settingsOption: {
	// 		analysisType: 2,
	// 		analysisSubType: 0,
	// 		visualizeOption: 0,
	// 		isDual: true,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				isGrid: false,
	// 				isVectorAnalysis: true,
	// 				gender: [0],
	// 				localGroup: [0, 1],
	// 			},
	// 			{
	// 				isGrid: false,
	// 				isVectorAnalysis: true,
	// 				gender: [1],
	// 				localGroup: [0, 1],
	// 			},
	// 		],
	// 	},
	// 	// tooltip: "선택한 지역과 관계없이 인구감소지역의 체류인구를 보여줍니다.",
	// },
	{
		type: "basic",
		title: "5060의 체류인구를 인구감소지역과 비교해보면?",
		option: ["인구감소지역", "행정구역"],
		image: "llp_preset3",
		settingsOption: {
			analysisType: 2,
			analysisSubType: 1,
			maps: [
				{
					localGroup: [0, 1],
					ageGroup: [6, 7],
					gender: [0, 1],
				},
				{
					localGroup: [0, 1],
					ageGroup: [6, 7],
					gender: [0, 1],
				},
			],
		},
		// tooltip: "선택한 지역과 관계없이 인구감소지역의 체류인구를 보여줍니다.",
	},
	// {
	// 	type: "dual",
	// 	title: "인구감소지역에서 2030과 5060이 많이 체류하는 곳을 비교해보면? ",
	// 	option: ["인구감소지역", "행정구역", "듀얼"],
	// 	image: "llp_preset2",
	// 	settingsOption: {
	// 		analysisType: 2,
	// 		analysisSubType: 1,
	// 		visualizeOption: 0,
	// 		isDual: true,
	// 		isDualModalOpen: true,
	// 		maps: [
	// 			{
	// 				isGrid: false,
	// 				isVectorAnalysis: true,
	// 				ageGroup: [3, 4],
	// 				localGroup: [0, 1],
	// 				gender: [0, 1],
	// 			},
	// 			{
	// 				isGrid: false,
	// 				isVectorAnalysis: true,
	// 				ageGroup: [6, 7],
	// 				localGroup: [0, 1],
	// 				gender: [0, 1],
	// 			},
	// 		],
	// 	},
	// 	// tooltip: "선택한 지역과 관계없이 인구감소지역의 체류인구를 보여줍니다.",
	// },
];
