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

const color = [
	"#0E3377",
	"#12429B",
	"#144AAD",
	"#1752C0",
	"#195AD2",
	"#1B62E4",
	"#2D6EE6",
	"#3F7BE8",
	"#5287EB",
	"#6494ED",
	"#76A1EF",
	"#88ADF1",
	"#9BBAF3",
	"#ADC6F5",
	"#BFD3F7",
	"#D1E0FA",
	"#E4ECFC",
];

export const dashboardChartConfig: ChartConfig[] = [
	{
		name: "dashboardSidoAlp",
		title: "전국 시도별 생활인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color,
		isSingleTable: true,
		chartUnit: "명",
	},
	{
		name: "dashboardSidoLlp",
		title: "전국 시군구별 체류인구",
		type: ["bar", "table"],
		xlabel: "구분",
		color,
		isSingleTable: true,
		chartUnit: "명",
	},
	{
		name: "dashboardSidoMop",
		title: "전국 시도별 생활이동량 비교",
		type: ["bar", "table"],
		xlabel: "구분",
		color,
		isSingleTable: true,
		chartUnit: "명",
	},
	{
		name: "dashboardSidoScatterData",
		title: "전국 시도별 인구 유입 및 유출 변화 분석",
		type: ["scatter", "table"],
		xlabel: "구분",
		color: ["#3C8FED"],
		chartUnit: "%",
		isSingleTable: true,
	},
];
