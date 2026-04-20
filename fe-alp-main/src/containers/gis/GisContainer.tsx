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

"use client";
import * as React from "react";
import { MapViewState } from "deck.gl";
import { initialGisSettings, initialViewState } from "@/constants/gis";
import useGisData from "@/hooks/queries/useGisData";
import GISMain from "./GISMain";
import GisAnalysisContainer from "./GisAnalysisContainer";
import DeckGLContainer from "./DeckGLContainer";
import { UserContext } from "@/context/UserProviderContainer";
import { filterRegionInfo } from "@/services/filterRegionInfo";
import { changeStrToDate } from "@/utils/date";
import { useShowToast } from "@/hooks/useToastShow";
import { useDateRangeStore } from "@/store/dateRange";

interface GIScontainerProps {
	regionInfo: Record<string, RegionInfo>;
	rangeDate: { startDate: string; endDate: string };
}

export default function GIScontainer({ regionInfo }: Readonly<GIScontainerProps>) {
	// KT용
	const context = React.useContext(UserContext);
	if (!context) {
		throw new Error("GIScontainer must be used within a UserProderContainer");
	}
	const { user } = context;
	const baseInfo: { name: string; code: string } = user!.baseRegion.sgg;
	const filteredInfo = filterRegionInfo(regionInfo, user!.baseInfo, user!.apdInfo);

	const [viewState, setViewState] = React.useState<MapViewState>(initialViewState);
	const getFirstDayOfEndDate = (date: string): string => {
		const year = date.slice(0, 4);
		const month = date.slice(4, 6);
		return `${year}${month}01`;
	};

	const endDate = JSON.parse(sessionStorage.getItem("info")!).endDate.slice(0, 6);
	const minMaxDate = JSON.parse(sessionStorage.getItem("info")!);

	const setDateRange = useDateRangeStore(s=> s.setDateRange)
	let newMaps: any = [...initialGisSettings.maps];
	newMaps[0] = { ...newMaps[0], startDate: Number(endDate), endDate: Number(endDate) };
	newMaps[1] = { ...newMaps[1], startDate: Number(endDate), endDate: Number(endDate) };
	const [gisSettings, setGisSettings] = React.useState<GisSettings>({
		...initialGisSettings,
		regionName: baseInfo.name,
		regionCode: Number(baseInfo.code),
		regionNameArr: [baseInfo.name],
		regionCodeArr: [Number(baseInfo.code)],
		maps: newMaps,
	});

	const onApplySettings = (next:GisSettings)=>{
		setGisSettings(next);
	}

	const isFirstRender = React.useRef(true);
	const { useGeometry, useMapData, useGisMapData, useGrid50Data } = useGisData();
	const { data: sggGeo } = useGeometry(gisSettings.maps[0].startDate.toString().slice(0, 6), "sgg");
	const { data: sidoGeo } = useGeometry(gisSettings.maps[0].startDate.toString().slice(0, 6), "sido");
	const { data: admGeo, isLoading: isLoadingGeoJson } = useGeometry(gisSettings.maps[0].startDate.toString().slice(0, 6), "adm");
	// const { data: sggGeo } = useGeometry(endDate, "sgg");
	// const { data: sidoGeo } = useGeometry(endDate, "sido");
	// const { data: admGeo, isLoading: isLoadingGeoJson } = useGeometry(endDate, "adm");
	const { data: serverMapData, isLoading: isLoadingData } = useMapData(
		gisSettings,
		0,
		isFirstRender,
	);
	const { data: serverMapData2, isLoading: isLoadingData2 } = useMapData(
		gisSettings,
		1,
		isFirstRender,
	);
	const { data: serverGrid50Data, isLoading: isLoadingGrid50Data } = useGrid50Data(
		gisSettings,
		isFirstRender,
	);
	const mapData = React.useMemo(() => ({ sidoGeo, sggGeo, admGeo }), [sidoGeo, sggGeo, admGeo]);

	const [mapData1, setMapData1] = React.useState(serverMapData);
	const [grid50Data, setGrid50Data] = React.useState(serverGrid50Data);
	const showToast = useShowToast();
	React.useEffect(() => {
		
		if (serverMapData?.res === 1) {
			showToast("격자50 분석은 읍면동을 지정해야 합니다", "info");
			return;
		}
		if (serverGrid50Data?.res === 1) {
			showToast("격자50 분석은 읍면동을 지정해야 합니다", "info");
			return;
		}
		if (serverGrid50Data?.res === 2) {
			showToast("유동인구 분석은 읍면동을 지정해야 합니다", "info");
			return;
		}
		else {
			// console.log('serverMapData',serverMapData);
			// console.log('regionInfo',regionInfo);
			
			// 기준지역 유입
			if (serverMapData?.res.inflow) {
				if (serverMapData?.res.inflow[0].regionCode.toString().slice(0, 2) === '42') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res.inflow[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('51'+serverMapData?.res.inflow[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res.inflow[0].center = item.center;
						}
						else if (serverMapData?.res.inflow[0].regionCode.toString().length === 8 && item.admCode) {
							if ('51'+serverMapData?.res.inflow[0].regionCode.toString().slice(2) === item.admCode.toString())
								serverMapData.res.inflow[0].center = item.center;
						}
					})
					let destinations = serverMapData?.res.inflow[0].layerData[serverMapData.res.inflow[0].time].destinations;
					destinations.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res.inflow[0].regionCode.toString().length === 5 && item.sggCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
							}
							else if (serverMapData?.res.inflow[0].regionCode.toString().length === 8 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
				else if (serverMapData?.res.inflow[0].regionCode.toString().slice(0, 2) === '45') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res.inflow[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('52'+serverMapData?.res.inflow[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res.inflow[0].center = item.center;
						}
						else if (serverMapData?.res.inflow[0].regionCode.toString().length === 8 && item.admCode) {
							if ('52'+serverMapData?.res.inflow[0].regionCode.toString().slice(2) === item.admCode.toString())
								serverMapData.res.inflow[0].center = item.center;
						}
					})
					let destinations = serverMapData?.res.inflow[0].layerData[serverMapData.res.inflow[0].time].destinations;
					destinations.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res.inflow[0].regionCode.toString().length === 5 && item.sggCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
							}
							else if (serverMapData?.res.inflow[0].regionCode.toString().length === 8 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
						
					})
				}
			}
			// 기준지역 유출
			else if (serverMapData?.res.outflow) {
				if (serverMapData?.res.outflow[0].regionCode.toString().slice(0, 2) === '42') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res.outflow[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('51'+serverMapData?.res.outflow[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res.outflow[0].center = item.center;
						}
						else if (serverMapData?.res.outflow[0].regionCode.toString().length === 8 && item.admCode) {
							if ('51'+serverMapData?.res.outflow[0].regionCode.toString().slice(2) === item.admCode.toString())
								serverMapData.res.outflow[0].center = item.center;
						}
					})
					let destinations = serverMapData?.res.outflow[0].layerData[serverMapData.res.outflow[0].time].destinations;
					destinations.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res.outflow[0].regionCode.toString().length === 5 && item.sggCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
							}
							else if (serverMapData?.res.outflow[0].regionCode.toString().length === 8 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '51'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
				else if (serverMapData?.res.outflow[0].regionCode.toString().slice(0, 2) === '45') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res.outflow[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('52'+serverMapData?.res.outflow[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res.outflow[0].center = item.center;
						}
						else if (serverMapData?.res.outflow[0].regionCode.toString().length === 8 && item.admCode) {
							if ('52'+serverMapData?.res.outflow[0].regionCode.toString().slice(2) === item.admCode.toString())
								serverMapData.res.outflow[0].center = item.center;
						}
					})
					let destinations = serverMapData?.res.outflow[0].layerData[serverMapData.res.outflow[0].time].destinations;
					destinations.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res.outflow[0].regionCode.toString().length === 5 && item.sggCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
							}
							else if (serverMapData?.res.outflow[0].regionCode.toString().length === 8 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
			}
			// 생활인구
			else if (serverMapData?.dataType === 'adm') {
				if (serverMapData?.res[0].options.regionArray[0].toString().slice(0, 2) === '42') {
					// Array.from(Object.values(regionInfo)).map((item:any) => {
					// 	if (item.admCode) {
					// 		if (serverMapData?.res[0].options.regionArray[0].toString().slice(2) === item.admCode.toString().slice(2))
					// 		serverMapData.res[0].center = item.center;
					// })
					let lists = serverMapData?.res[0].layerData[serverMapData.res[0].time];
					lists.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res[0].options.regionArray[0].toString().length === 5 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
				else if (serverMapData?.res[0].options.regionArray[0].toString().slice(0, 2) === '45') {
					// Array.from(Object.values(regionInfo)).map((item:any) => {
					// 	if (item.admCode) {
					// 		if (serverMapData?.res[0].options.regionArray[0].toString().slice(2) === item.admCode.toString().slice(2))
					// 		serverMapData.res[0].center = item.center;
					// })
					let lists = serverMapData?.res[0].layerData[serverMapData.res[0].time];
					lists.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res[0].options.regionArray[0].toString().length === 5 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
			}
			// 체류인구
			else if (serverMapData?.dataType === 'llpInflow') {
				if (serverMapData.res.message && serverMapData.res.message === "Llp-error1") {
					showToast("체류인구 분석은 시군구를 지정해야 합니다", "info");
					return;
				}
				if (serverMapData?.res[0].regionCode.toString().slice(0, 2) === '42') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('51'+serverMapData?.res[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res[0].center = item.center;
						}
						else if (serverMapData?.res[0].regionCode.toString().length === 8 && item.admCode) {
							if ('51'+serverMapData?.res[0].regionCode.toString().slice(2) === item.admCode.toString())
							serverMapData.res[0].center = item.center;
						}
					})
					let destinations = serverMapData?.res[0].layerData[serverMapData.res[0].time].destinations;
					destinations.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res[0].regionCode.toString().length === 5 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
				else if (serverMapData?.res[0].regionCode.toString().slice(0, 2) === '45') {
					Array.from(Object.values(regionInfo)).map((item:any) => {
						if (serverMapData?.res[0].regionCode.toString().length === 5 && item.sggCode) {
							if ('52'+serverMapData?.res[0].regionCode.toString().slice(2) === item.sggCode.toString())
							serverMapData.res[0].center = item.center;
						}
						else if (serverMapData?.res[0].regionCode.toString().length === 8 && item.admCode) {
							if ('52'+serverMapData?.res[0].regionCode.toString().slice(2) === item.admCode.toString())
							serverMapData.res[0].center = item.center;
						}
					})
					let lists = serverMapData?.res[0].layerData[serverMapData.res[0].time];
					lists.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (serverMapData?.res[0].regionCode.toString().length === 5 && item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
			}
			// 체류인구 인구감소지역
			else if (serverMapData?.dataType === 'depopul') {
				// Array.from(Object.values(regionInfo)).map((item:any) => {
				// 	if (item.sggCode) {
				// 		if ('51'+serverMapData?.res[0].regionCode.toString().slice(2) === item.sggCode.toString())
				// 		serverMapData.res[0].center = item.center;
				// 		else if ('52'+serverMapData?.res[0].regionCode.toString().slice(2) === item.sggCode.toString())
				// 		serverMapData.res[0].center = item.center;
				// 	}
				// 	else if (item.admCode) {
				// 		if ('51'+serverMapData?.res[0].regionCode.toString().slice(2) === item.admCode.toString())
				// 		serverMapData.res[0].center = item.center;
				// 		else if ('52'+serverMapData?.res[0].regionCode.toString().slice(2) === item.admCode.toString())
				// 		serverMapData.res[0].center = item.center;
				// 	}
				// })
				if (serverMapData.res.message && serverMapData.res.message === 'Llp-error1') {
					setMapData1(serverMapData);
					return ;
				} else {
					let lists = serverMapData?.res[0].layerData[serverMapData.res[0].time];
					lists.map((el:any) => {
						Array.from(Object.values(regionInfo)).map((item:any) => {
							if (item.sggCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
								else if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.sggCode.toString()) {
									el.center = item.center;
								}
							}
							else if (item.admCode) {
								if (el.regionCode.toString().slice(0, 2) === '42' && '51'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
								else if (el.regionCode.toString().slice(0, 2) === '45' && '52'+el.regionCode.toString().slice(2) === item.admCode.toString()) {
									el.center = item.center;
								}
							}
						})
					})
				}
			}
			
			// setMapData1(serverMapData);
			if (serverGrid50Data?.res !== "!grid50") {
				setGrid50Data(serverGrid50Data);
			} else {
				setMapData1(serverMapData);

			}
		}
	}, [serverMapData, serverGrid50Data]);

	//최초 렌더링 여부를 추적하는 ref
	// Calculate loading state based on memoized settings
	const isLoadingMapData = React.useMemo(() => {
		if (gisSettings.isGridScaleAuto) {
			return isLoadingGeoJson || isLoadingData || isLoadingGrid50Data;
		}
		return isLoadingGeoJson || isLoadingData;
	}, [gisSettings, isLoadingGeoJson, isLoadingData, isLoadingGrid50Data]);

	// // KT용
	// React.useEffect(() => {
	// 	if (user) {
	// 		const baseInfo: { name: string; code: string } = user.baseRegion.sgg;
	// 		setGisSettings({
	// 			...gisSettings,
	// 			regionName: baseInfo.name,
	// 			regionCode: Number(baseInfo.code),
	// 			regionNameArr: [baseInfo.name],
	// 			regionCodeArr: [Number(baseInfo.code)],
	// 		});
	// 		const info = filterRegionInfo(regionInfo, user.baseInfo, user.apdInfo);
	// 		setFilteredInfo(info);
	// 	}
	// }, [user]);
	React.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
		}
		setDateRange({
			minDate: changeStrToDate(minMaxDate.startDate),
			maxDate: changeStrToDate(minMaxDate.endDate),
		});
	}, []);
	return (
		<div className={`relative flex h-[calc(100vh-109px)] justify-between bg-gray-500`}>
			{gisSettings.isMainModalOpen && (
				<GISMain {...{ regionInfo: filteredInfo, gisSettings, setGisSettings }} />
			)}
			<div className="flex justify-between"></div>
			<GisAnalysisContainer
				{...{
					isLoading: isLoadingMapData || isLoadingGrid50Data,
					viewState,
					regionInfo: filteredInfo,
					gisSettings, // Use memoized settings
					setGisSettings,
					onApplySettings,
					// rangeDate,
				}}
			/>
			<div className="fixed flex h-[calc(100vh-109px)] w-full">
				<div className="relative flex-1">
					<DeckGLContainer
						{...{
							viewState,
							setViewState,
							gisSettings, // Use memoized settings
							mapIdx: 0,
							mapData,
							isLoading: isLoadingMapData,
							serverMapData: mapData1,
							serverGrid50Data: grid50Data,
						}}
					/>
				</div>

				{gisSettings.isDual && (
					<>
						<div className="h-full border-2 border-white"></div>
						<div className="relative flex-1">
							<DeckGLContainer
								{...{
									viewState,
									setViewState,
									gisSettings, // Use memoized settings
									mapIdx: 1,
									mapData,
									isLoading: isLoadingData2,
									serverMapData: serverMapData2,
									serverGrid50Data: grid50Data,
								}}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
