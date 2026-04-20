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

import { useState, useRef, useEffect, useContext } from "react";
import { useShowToast } from "@/hooks/useToastShow";
import { menuList } from "@/constants/menu";
import BorderButton from "@/components/buttons/BorderButton";
import IconDownload from "@images/download.svg";
import IconDash from "@images/chartIcon/dash.svg";
import IconLabelTrue from "@images/chartIcon/labelOn.svg";
import IconLabelFalse from "@images/chartIcon/labelOff.svg";
import { exportAllDataToExcel, exportAllChartsToZip } from "@/utils/dataExport";
import ReportSpinner from "@/components/loading/ReportSpinner";
import { UserContext } from "@/context/UserProviderContainer";
import Dimmed from "@/components/modals/Dimmed";
import { useChartLabelStore } from "@/store/chartLabel";

interface SearchFilterDownloadProps {
	searchResult: SearchResult | undefined;
	pageName: string;
	subPageName: string | undefined;
}
interface DataDownloadProps {
	data: DataContainer;
}

export default function SearchFilterDownload({
	searchResult,
	pageName,
	subPageName,
}: SearchFilterDownloadProps) {
	const showToast = useShowToast();

	const chartLabelShow = useChartLabelStore(s=>s.chartLabel);
	const setChartLabelShow = useChartLabelStore((s) => s.setChartLabel);

	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const currentMenuName = menuList.find((menu) => menu.path === pageName)?.name;
	const currentSubmenuName = menuList
		.find((menu) => menu.path === pageName)
		?.subMenu?.find((menu) => menu.path === subPageName)?.name;
	const fileName = `${currentMenuName}_${currentSubmenuName}`;

	const [downloadLoading, setDownloadLoading] = useState(false);
	const [downloadExlLoading, setDownloadExlLoading] = useState(false);
	const [downloadPngLoading, setDownloadPngLoading] = useState(false);
	const allData = searchResult?.dataGroups.reduce<DataContainer[]>(
		(acc, cur) => [...acc, ...cur.data],
		[],
	);

	const formattedAllData = allData?.map((item)=>({
		...item,
		charts:item.charts.map((chart)=>{
			if("data" in chart){
				return {
					...chart,
					data:chart.data.map((dataItem)=>({
						...dataItem,
						indicate:dataItem.indicate.map((indicateItem)=>{
							const formattedIndicate:any={}
							Object.entries(indicateItem).forEach(([key,value])=>{
								formattedIndicate[key] = typeof value ==="number"?value.toLocaleString():value;
							});
							return formattedIndicate;
						})
					}))
				}
			}
			else{
				return {
					...chart,
					indicate: chart.indicate.map((indicateItem)=>{
						const formattedIndicate:any = {}
						Object.entries(indicateItem).forEach(([key,value])=>{
							formattedIndicate[key] = typeof value ==="number"?value.toLocaleString():value;
						});
						return formattedIndicate;
					})
				}
			}
		})
	}
))

	const onClickChartLabels = () => {
		setChartLabelShow(!chartLabelShow);
		if (!chartLabelShow) {
			showToast("레이블이 표시되었습니다.", "success", "middle");
		} else {
			showToast("레이블이 숨김처리 되었습니다.", "success", "middle");
		}
	};

	const downloadAllData = async () => {
		if (allData) {
			setDownloadLoading(true);
			setTimeout(async () => {
				await exportAllDataToExcel(allData, fileName);
				await exportAllChartsToZip(allData, fileName);
				setDownloadLoading(false);
			}, 0);
		}
	};

	const downloadExcel = async () => {
		// showToast("파일을 다운로드 중입니다.", "success", "middle");
		if (formattedAllData) {
			setDownloadExlLoading(true);
			setTimeout(async () => {
				await exportAllDataToExcel(formattedAllData, fileName);
				setDownloadExlLoading(false);
				setIsDropdownOpen(false);
			}, 0);
		}
	};
	const [clickDownload, setClickDownload] = useState(false);
	useEffect(() => {
		const downpng = async () => {
			const newData = searchResult?.dataGroups.reduce<DataContainer[]>(
				(acc, cur) => [...acc, ...cur.data],
				[],
			);
			if (newData) {
				setChartLabelShow(true);
				setDownloadPngLoading(true);
				setTimeout(async () => {
					await exportAllChartsToZip(newData, fileName);
					setDownloadPngLoading(false);
					setIsDropdownOpen(false);
				}, 500);
			}
		}
		downpng();
	}, [clickDownload])
	const downloadPng = async () => {
		setChartLabelShow(true);
		setClickDownload((prev) => !prev);
	};

	// const testAccount = JSON.parse(sessionStorage.getItem('TA')!);
	
	const toggleDropdown = () => {
		// if (testAccount === "N") {
			setIsDropdownOpen((prev) => !prev);
		// } else {
		// 	showToast("다운로드 권한이 없습니다", "info");
		// }
	};

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	return (
		<div className="flex items-center gap-3 self-end">
			<button onClick={onClickChartLabels}>
				{chartLabelShow ? <IconLabelTrue /> : <IconLabelFalse />}
			</button>
			<IconDash />
			<div className="relative hover:bg-gray-100" ref={dropdownRef}>
				<BorderButton
					title={`${currentMenuName} 분석 보고서 다운로드`}
					Icon={IconDownload}
					onClick={toggleDropdown}
				/>

				{/* 드롭다운 메뉴 */}
				{isDropdownOpen && (
					<div
						className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
						style={{ minWidth: "100%" }}
					>
						<ul className="py-1">
							<li>
								<button
									className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
									onClick={downloadPng}
								>
									{/* {downloadPngLoading ? "데이터를 다운로드 중입니다." : "데이터 다운로드 (.png)"} */}
									{downloadPngLoading ? (
										<div>
											<div>데이터를 다운로드 중입니다.</div>
											<ReportLoadingDimmed message="데이터를 다운로드 중입니다." />
										</div>
									) : (
										"데이터 다운로드 (.png)"
									)}
									{/* {downloadPngLoading ? (
										<div className="flex justify-between">
											데이터를 다운로드 중입니다. <ReportSpinner className="h-6 w-6" />
										</div>
									) : (
										"차트 이미지 다운로드 (.png)"
									)} */}
								</button>
							</li>
							<li>
								<button
									className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
									onClick={downloadExcel}
								>
									{/* {downloadExlLoading ? "데이터를 다운로드 중입니다." : "데이터 다운로드 (.xlsx)"} */}
									{downloadExlLoading ? (
										<div>
											<div>데이터를 다운로드 중입니다.</div>
											<ReportLoadingDimmed message="데이터를 다운로드 중입니다." />
										</div>
									) : (
										"데이터 다운로드 (.xlsx)"
									)}
								</button>
							</li>
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}

const ReportLoadingDimmed = ({ message }: { message: string }) => {
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