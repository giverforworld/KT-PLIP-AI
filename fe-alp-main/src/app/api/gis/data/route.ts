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

import { NextResponse } from "next/server";
import {
	Alp_District_PeriodDual_Chart,
	AlpOriginChart,
	Alp_District_DowDual_Chart,
	Alp_District_TimeDual_Chart,
	gisTimeSeriesDayChart,
	gisTimeSeriesTimeChart,
	Alp_District_Sex_Chart,
	Alp_District_Age_Chart,
	Alp_District_LifeStyle_Chart,
	Alp_District_LifeStyle_Foreign_Chart,
} from "@/constants/dummy/gisChartDummy";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	try {
		const dummyMap: Record<string, SearchResult> = {
			"gis-timeseries-day": gisTimeSeriesDayChart,
			"gis-timeseries-time": gisTimeSeriesTimeChart,
			"gis-alp-origin": AlpOriginChart,
			"gis-alp-district-period-dual": Alp_District_PeriodDual_Chart,
			"gis-alp-district-dow-dual": Alp_District_DowDual_Chart,
			"gis-alp-district-time-dual": Alp_District_TimeDual_Chart,
			"gis-alp-district-sex": Alp_District_Sex_Chart,
			"gis-alp-district-age": Alp_District_Age_Chart,
			"gis-alp-district-lifestyle": Alp_District_LifeStyle_Chart,
			"gis-alp-district-lifestyle-foreign": Alp_District_LifeStyle_Foreign_Chart,
		};

		const dummy: SearchResult = dummyMap[`gis-${id}`] || {
			searchSummary: [],
			statSummary: [],
			dataGroups: [],
		};

		return NextResponse.json({ ok: true, result: dummy }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ ok: false, error: error }, { status: 500 });
	}
}
