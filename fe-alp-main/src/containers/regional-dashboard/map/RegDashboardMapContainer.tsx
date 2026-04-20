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

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useGetData from "@/hooks/queries/useGetData";
import { topoToGeo } from "@/libs/dev/topoJsonHandler";

import RegDashboardMap from "./RegDashboardMap";
import { mergeSgg } from "../proto/functions/mergeSgg";
import { groupedSgg } from "../proto/constants/groupedRegions";
import Dimmed from "@/components/modals/Dimmed";
import ReportSpinner from "@/components/loading/ReportSpinner";

interface RegDashboardMapContainerProps {
	regionInfo: Record<string, RegionInfo>;
	userInfo: User;
	displayRegionSidoCode: string;
	setSelectedRegion: Dispatch<
		SetStateAction<{ regionname: string; regioncode: string; sggName: string }>
	>;
	selectedDate:string;
}

export default function RegDashboardMapContainer({
	regionInfo,
	userInfo,
	displayRegionSidoCode,
	setSelectedRegion,
	selectedDate,
}: RegDashboardMapContainerProps) {
	const [sggState, setSggState] = useState<any>();
	const [sggGeoState, setSggGeoState] = useState<any>();
	const [sggInfoState, setSggInfoState] = useState<any>();
	const [admState, setAdmState] = useState<any>();

	useEffect(() => {
		setSggState(null)
		setAdmState(null)
		setSggGeoState(null)
		setSggInfoState(null)
	}, [selectedDate])
	const { useGeometry } = useGetData();
	const { data: topoJson } = useGeometry(selectedDate);
	
	useEffect(() => {
		if (topoJson) {
			let newTopoJsonSgg = {
				...topoJson,
				objects: { 
					...topoJson.objects, 
					data : { 
						...topoJson.objects.data,
						geometries: topoJson.objects.data.geometries
						.filter((item:any) => item.properties.REGION_CD.length === 5)
						.map((item:any) => {
							if (item.properties.REGION_CD === "36110") item.properties.REGION_NM = '세종특별자치시 세종시';
							const [SIDO_NM, SGG_NM] = item.properties.REGION_NM.split(' ');
							const SGG_CD = item.properties.REGION_CD;
							const SIDO_CD = item.properties.REGION_CD.substring(0, 2);
							return { ...item, properties: {SIDO_NM, SGG_NM, SGG_CD, SIDO_CD} };
						})
					}
				}
			}
			setSggState(newTopoJsonSgg);
			let newTopoJsonAdm = {
				...topoJson,
				objects: { 
					...topoJson.objects, 
					data : { 
						...topoJson.objects.data,
						geometries: topoJson.objects.data.geometries
						.filter((item:any) => item.properties.REGION_CD.length === 8)
						.map((item:any) => {
							if (item.properties.REGION_CD === "36110550") item.properties.REGION_NM = '세종특별자치시 세종시 고운동';
							else if (item.properties.REGION_CD === "36110340") item.properties.REGION_NM = '세종특별자치시 세종시 금남면';
							else if (item.properties.REGION_CD === "36110556") item.properties.REGION_NM = '세종특별자치시 세종시 반곡동';
							else if (item.properties.REGION_CD === "36110390") item.properties.REGION_NM = '세종특별자치시 세종시 소정면';
							else if (item.properties.REGION_CD === "36110530") item.properties.REGION_NM = '세종특별자치시 세종시 아름동';
							else if (item.properties.REGION_CD === "36110320") item.properties.REGION_NM = '세종특별자치시 세종시 연동면';
							else if (item.properties.REGION_CD === "36110360") item.properties.REGION_NM = '세종특별자치시 세종시 연서면';
							else if (item.properties.REGION_CD === "36110350") item.properties.REGION_NM = '세종특별자치시 세종시 장군면';
							else if (item.properties.REGION_CD === "36110380") item.properties.REGION_NM = '세종특별자치시 세종시 전동면';
							else if (item.properties.REGION_CD === "36110370") item.properties.REGION_NM = '세종특별자치시 세종시 전의면';
							else if (item.properties.REGION_CD === "36110250") item.properties.REGION_NM = '세종특별자치시 세종시 조치원읍';
							else if (item.properties.REGION_CD === "36110580") item.properties.REGION_NM = '세종특별자치시 세종시 다정동';
							else if (item.properties.REGION_CD === "36110570") item.properties.REGION_NM = '세종특별자치시 세종시 대평동';
							else if (item.properties.REGION_CD === "36110523") item.properties.REGION_NM = '세종특별자치시 세종시 어진동';
							else if (item.properties.REGION_CD === "36110560") item.properties.REGION_NM = '세종특별자치시 세종시 보람동';
							else if (item.properties.REGION_CD === "36110330") item.properties.REGION_NM = '세종특별자치시 세종시 부강면';
							else if (item.properties.REGION_CD === "36110518") item.properties.REGION_NM = '세종특별자치시 세종시 나성동';
							else if (item.properties.REGION_CD === "36110540") item.properties.REGION_NM = '세종특별자치시 세종시 종촌동';
							else if (item.properties.REGION_CD === "36110510") item.properties.REGION_NM = '세종특별자치시 세종시 한솔동';
							else if (item.properties.REGION_CD === "36110525") item.properties.REGION_NM = '세종특별자치시 세종시 해밀동';
							else if (item.properties.REGION_CD === "36110515") item.properties.REGION_NM = '세종특별자치시 세종시 새롬동';
							else if (item.properties.REGION_CD === "36110520") item.properties.REGION_NM = '세종특별자치시 세종시 도담동';
							else if (item.properties.REGION_CD === "36110555") item.properties.REGION_NM = '세종특별자치시 세종시 소담동';
							else if (item.properties.REGION_CD === "36110310") item.properties.REGION_NM = '세종특별자치시 세종시 연기면';
							const HEMD_CD = item.properties.REGION_CD;
							const SIDO_CD = item.properties.REGION_CD.substring(0, 2);
							const SGG_CD = item.properties.REGION_CD.substring(0, 5);
							const RI_CD = "00";
							const [SIDO_NM, SGG_NM, HEMD_NM] = item.properties.REGION_NM.split(' ');
							return { ...item, properties: {HEMD_CD, HEMD_NM, RI_CD, SIDO_NM, SGG_NM, SGG_CD, SIDO_CD} };
						})
					}
				}
			}
			setAdmState(newTopoJsonAdm);
		}
	}, [topoJson])

	useEffect(() => {
		const sggGeo = topoToGeo({
			regionCode: displayRegionSidoCode === '51' && Number(selectedDate) < 202307 
			? 42 
			: displayRegionSidoCode === '52' && Number(selectedDate) < 202403 
			? 45 
			: Number(displayRegionSidoCode),
			topoJson: sggState,
		});
		setSggGeoState(sggGeo);
	}, [sggState, displayRegionSidoCode]);

	useEffect(() => {
		const obj =
			sggGeoState && admState && regionInfo && mergeSgg(sggGeoState, admState, groupedSgg, regionInfo);
		
		const sggInfo =
		obj?.updatedRegionInfo &&
		Object.entries(obj.updatedRegionInfo)
		.map(([key, val]): any => {
			if (key.toString().slice(0, 2) === (displayRegionSidoCode === '51' && Number(selectedDate) < 202307 
				? '42' 
				: displayRegionSidoCode === '52' && Number(selectedDate) < 202403 
				? '45' 
				: displayRegionSidoCode) && key.length <= 5) return val;
		})
		.filter(Boolean);
		
		setSggInfoState(sggInfo);
	}, [sggGeoState, admState, displayRegionSidoCode])

	return (
		<>
			{admState && sggGeoState && sggInfoState && topoJson ? (
				<RegDashboardMap
					{...{
						userInfo,
						geoJson: sggGeoState,
						topoJson: admState,
						regionInfo,
						sggInfo: sggInfoState,
						setSelectedRegion,
						displayRegionSidoCode: displayRegionSidoCode === '51' && Number(selectedDate) < 202307 
							? '42' 
							: displayRegionSidoCode === '52' && Number(selectedDate) < 202403 
							? '45' 
							: displayRegionSidoCode,
						selectedDate,
					}}
				/>
			)
			: <RegDasLoadingDimmed  message="데이터를 불러오는 중입니다." />
		}
		</>
	);
}
export const RegDasLoadingDimmed = ({ message }: { message: string }) => {
	return (
		<Dimmed>
			<div className="flex flex-col items-center justify-center pt-2 text-xl font-bold text-white">
				<ReportSpinner />
				<span className="mt-6">{message}</span>
				<span>잠시만 기다려 주세요.</span>
			</div>
		</Dimmed>
	);
};
