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
import { getMapData } from "@/libs/dev/getFileFromPublic";
import { serverUrl } from "@/constants/path";
import apiClient from "@/libs/apiClient";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const {
		name,
		layerType,
		from,
		to,
		regions,
		isNative,
		timeCodes,
		inOutFlow,
		isMovingPurpose,
		dayOfWeek,
		lifestylePattern,
		domesticGroup,
		localGroup,
		isTimeLine,
		gender,
		ageGroup,
	} = getQueryParams(url);

	if (!serverUrl) return NextResponse.json({ ok: false, msg: "no server url" });
	if (!from || !to || !regions)
		return NextResponse.json({ ok: false, msg: "Not included from, to, regions" });
	if (layerType === "adm") {
		const queryProps = {
			layerType: "0",
			regions,
			from,
			to,
			gender,
			ageGroup,
			timeCodes,
			lifestylePattern,
			// dayOfWeek,
			// domesticGroup,
			// isNative,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/alp?${params.toString()}`;

		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "gridLP" && isTimeLine === "false") {
		const queryProps = {
			layerType: "1",
			// gridType: 0,
			regions,
			from,
			to,
			timeCodes,
			lifestylePattern,
			gender,
			ageGroup,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/alp?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message) return NextResponse.json({ ok: false, res });
		if (res.length === 0)
			return NextResponse.json({ ok: false, res: "no data", dataFromServer: res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "gridLP" && isTimeLine === "true") {
		const queryProps = {
			regions,
			from,
			to,
			gender,
			ageGroup,
			lifestylePattern,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/alp/gridTimeSeries?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "gridLM" && isTimeLine === "false") {
		const queryProps = {
			layerType: 1,
			from,
			to,
			regions,
			timeCodes,
			inOutFlow,
			isMovingPurpose,
			gender,
			ageGroup,
			isNative,
		};

		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/mop?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "gridLM" && isTimeLine === "true") {
		const queryProps = {
			layerType: 1,
			from,
			to,
			regions,
			timeCodes,
			inOutFlow,
			isMovingPurpose,
			gender,
			ageGroup,
			isNative,
		};

		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/mop/timeSeries?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	// if (layerType === "gridLM" && isTimeLine === "true") {
	// 	const inflowQueryProps = {
	// 		layerType: 1,
	// 		from,
	// 		to,
	// 		regions,
	// 		timeCodes,
	// 		isMovingPurpose,
	// 		gender,
	// 		ageGroup,
	// 		isNative,
	// 		inOutFlow: true,
	// 	};
	// 	const inflowParams = makeBEQueryParams(inflowQueryProps);
	// 	const inflowReqUrl = `${serverUrl}/gis/mop/timeSeries?${inflowParams.toString()}`;
	// 	const outflowQueryProps = {
	// 		layerType: 1,
	// 		from,
	// 		to,
	// 		regions,
	// 		timeCodes,
	// 		isMovingPurpose,
	// 		gender,
	// 		ageGroup,
	// 		isNative,
	// 		inOutFlow: false,
	// 	};
	// 	const outflowParams = makeBEQueryParams(outflowQueryProps);
	// 	const outflowReqUrl = `${serverUrl}/gis/mop/timeSeries?${outflowParams.toString()}`;
	// 	const [inflow, outflow] = await Promise.all([
	// 		apiClient.get(inflowReqUrl).then((response) => response.data),
	// 		apiClient.get(outflowReqUrl).then((response) => response.data),
	// 	]);
	// 	return NextResponse.json({ ok: true, res: { inflow, outflow } });
	// }
	if (layerType === "vector") {
		const queryProps = {
			layerType: 0,
			from,
			to,
			regions,
			timeCodes,
			isMovingPurpose,
			gender,
			ageGroup,
			isNative,
			inOutFlow,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/mop?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "llpInflow" || layerType === "admLlp") {
		const queryProps = {
			from,
			to,
			region: regions,
			gender,
			ageGroup,
			localGroup, //false 로 해야만 나옴 241212 기준
		};
		if(regions.length <= 2){
			return NextResponse.json({ ok: false, res:{message:"Llp-error1"} });
		}
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/llp/flow?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "trip" && isTimeLine === "false") {
		const queryProps = {
			layerType: 0,
			regions,
			from,
			to,
			timeCodes,
			isMovingPurpose,
			gender,
			ageGroup,
			isNative,
			inOutFlow,
		};

		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/mop?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (layerType === "trip" && isTimeLine === "true") {
		const queryProps = {
			layerType: 0,
			from,
			to,
			regions,
			// timeCodes,
			isMovingPurpose,
			gender,
			ageGroup,
			// isNative,
			inOutFlow,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/mop/timeSeries?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	// if (layerType === "trip" && isTimeLine === "true") {
	// 	const inflowQueryProps = {
	// 		layerType: 0,
	// 		from,
	// 		to,
	// 		regions,
	// 		dayOfWeek,
	// 		timeCodes,
	// 		isMovingPurpose,
	// 		gender,
	// 		ageGroup,
	// 		isNative,
	// 		inOutFlow,
	// 	};
	// 	const inflowParams = makeBEQueryParams(inflowQueryProps);
	// 	const inflowReqUrl = `${serverUrl}/gis/mop/timeSeries?${inflowParams.toString()}`;
	// 	const outflowParams = makeBEQueryParams({
	// 		layerType: 0,
	// 		from,
	// 		to,
	// 		regions,
	// 		dayOfWeek,
	// 		timeCodes,
	// 		isMovingPurpose,
	// 		gender,
	// 		ageGroup,
	// 		isNative,
	// 		inOutFlow: false,
	// 	});
	// 	const outflowReqUrl = `${serverUrl}/gis/mop/timeSeries?${outflowParams.toString()}`;
	// 	const [inflow, outflow] = await Promise.all([
	// 		// fetch(inflowReqUrl).then((res) => res.json()),
	// 		// fetch(outflowReqUrl).then((res) => res.json()),
	// 		apiClient.get(inflowReqUrl).then((res) => res.data),
	// 		apiClient.get(outflowReqUrl).then((res) => res.data),
	// 	]);
	// 	return NextResponse.json({ ok: true, res: { inflow, outflow } });
	// }

	if (layerType === "depopul") {
		const queryProps = {
			from,
			to,
			gender,
			ageGroup,
			localGroup: localGroup.length === 2 ? 2 : localGroup,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/llp/depopul?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message || res.length === 0) return NextResponse.json({ ok: false, res });
		return NextResponse.json({ ok: true, res });
	}
	if (!name) return NextResponse.json({ ok: false, res: "no name for dummy data" });

	const res = getMapData(name + ".json");

	return NextResponse.json({ ok: true, res });
}

const getQueryParams = (url: URL) => {
	const params: { [key: string]: any } = {};
	url.searchParams.forEach((value, key) => {
		// 쉼표가 포함된 경우 자동으로 배열로 변환
		params[key] = value.includes(",") ? value.split(",") : value;
	});
	return params;
};

type ParamsBEQP = {
	from: number;
	to: number;
	regions?: Array<string | number>;
	timeCodes?: Array<string | number>;
	inOutFlow?: boolean;
	isMovingPurpose?: boolean;
	[key: string]: any;
};
function makeBEQueryParams({
	layerType,
	from,
	to,
	region,
	regions,
	timeCodes,
	inOutFlow,
	isMovingPurpose,
	dayOfWeek,
	lifestylePattern,
	domesticGroup,
	isNative,
	mopCd,
	gender,
	ageGroup,
	localGroup,
	gridType,
}: ParamsBEQP) {
	const params = new URLSearchParams();
	// 단일 값 또는 배열을 자동으로 처리하는 함수
	const appendParam = (key: string, value: any) => {
		if (Array.isArray(value)) {
			value.forEach((v) => params.append(key, v.toString()));
		} else if (value !== undefined && value !== null) {
			params.append(key, value.toString());
		}
	};

	// 파라미터 추가
	appendParam("spaceType", layerType);
	appendParam("gridType", gridType);
	appendParam("start", from);
	appendParam("end", to);
	appendParam("regions", regions);
	appendParam("region", region);
	appendParam("timezn", timeCodes);
	appendParam("day", dayOfWeek);
	appendParam("patterns", lifestylePattern);
	appendParam("isInflow", inOutFlow);
	appendParam("isNative", isNative);
	appendParam("isPurpose", isMovingPurpose);
	appendParam("mopCd", mopCd);
	appendParam("gender", gender);
	appendParam("age", ageGroup);
	appendParam("isIn", localGroup);

	// domesticGroup 처리
	// if (domesticGroup !== undefined) {
	// 	params.append("isNative", domesticGroup === "0" ? "true" : "false");
	// }

	return params;
}
