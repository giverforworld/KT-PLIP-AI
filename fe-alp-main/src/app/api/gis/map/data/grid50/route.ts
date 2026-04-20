import { NextResponse } from "next/server";
import { getMapData } from "@/libs/dev/getFileFromPublic";
import { serverUrl } from "@/constants/path";
import apiClient from "@/libs/apiClient";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const { layerType, from, to, regions, timeCodes, dayOfWeek, gender, ageGroup, lifestylePattern } =
		getQueryParams(url);

	if (!serverUrl) return NextResponse.json({ ok: false, msg: "no server url" });
	if (!from || !to || !regions)
		return NextResponse.json({ ok: false, msg: "Not included from, to, regions" });

	if (layerType === "fpop") {
		const queryProps = {
			// layerType: "1",
			regions,
			from,
			to,
			gender,
			ageGroup,
			timeCodes,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/fpop?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message) return NextResponse.json({ ok: false, res });
		if (res.length === 0)
			return NextResponse.json({ ok: false, res: "no data", dataFromServer: res });
		return NextResponse.json({ ok: true, res, dataType: "fpop" });
	} else if (layerType === "alpGrid50") {
		const queryProps = {
			// gridType: 1,
			regions,
			from,
			to,
			timeCodes,
			// lifestylePattern,
			gender,
			ageGroup,
		};
		const params = makeBEQueryParams(queryProps);
		const reqUrl = `${serverUrl}/gis/alp/grid?${params.toString()}`;
		const res = await apiClient.get(reqUrl).then((response) => response.data);
		if (res?.message) return NextResponse.json({ ok: false, res });
		if (res.length === 0)
			return NextResponse.json({ ok: false, res: "no data", dataFromServer: res });
		return NextResponse.json({ ok: true, res, dataType: "alpGrid50" });
	}

	return NextResponse.json({ ok: false, res: "!grid50", code: 400 });
}

const getQueryParams: any = (url: URL) => {
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
