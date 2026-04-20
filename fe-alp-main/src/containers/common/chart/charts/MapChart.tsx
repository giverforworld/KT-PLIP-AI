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

import LlpStatusMap from "@/containers/llp/status/LlpStatusMap";
import ArrowUp from "@images/chartIcon/llpArrowUp.svg";
import ArrowDown from "@images/chartIcon/llpArrowDown.svg";
import { useSearchResultStore } from "@/store/searchResult";

interface DashboardContentsProps {
	regionInfo?: Record<string, RegionInfo>;
	data: any;
}
type MapChartProps = Readonly<ChartContext> & DashboardContentsProps;

export default function MapChart({ regionInfo, data, ...rest }: MapChartProps) {
	const header = ["순위 시군구", "배수", "전년대비 증감"];
	const searchResult = useSearchResultStore(s=>s.searchResult);
	const { statSummary } = searchResult.data;

	return (
		<div className="flex h-[480px] items-start justify-between">
			<div className="mr-2 w-2/5">
				<LlpStatusMap regionInfo={regionInfo} data={data.data[0]} statSummary={statSummary} />
			</div>
			{statSummary.length > 1 ? (
				<div className="mt-1 flex max-h-[450px] w-3/5 flex-col">
					<div
						className={`grid border-collapse grid-cols-${header.length} gap-2 rounded-md bg-tableGray p-2 text-sm font-bold text-textGray`}
					>
						{header.map((title, index) => (
							<div key={index} className={`flex ${index > 0 ? "ml-auto text-right" : "ml-2"}`}>
								<p>{title}</p>
							</div>
						))}
					</div>

					<div className="custom-scrollbar grow overflow-x-auto">
						{statSummary.map((summary, index) => {
							const matchingItem = data.data[1]?.indicate.find(
								(item: any) => item.구분 === summary.regionName,
							);
							const { sggCode, 구분, ...rest } = matchingItem || {};

							const columns = Array.from({ length: header.length - 1 }).map((_, idx) => {
								const [key, value] = Object.entries(rest)[idx] || [];

								if (idx === 1) {
									if (typeof value === "number") {
										const color = value > 0 ? "#DD1413" : value < 0 ? "#599AEF" : "inherit";
										const SvgIcon =
											value > 0 ? (
												<ArrowUp className="ml-1" />
											) : value < 0 ? (
												<ArrowDown className="ml-1" />
											) : null;

										return (
											<div key={idx} className="p-2 text-right">
												<div style={{ color }} className="flex items-center justify-end">
													<span>{value}</span>
													{SvgIcon}
												</div>
											</div>
										);
									}

									return (
										<div key={idx} className="p-2 text-right">
											<div>-</div>
										</div>
									);
								}

								return (
									<div key={idx} className="p-2 text-right">
										<div>
											{typeof value === "string" || typeof value === "number" ? value : "-"}
										</div>
									</div>
								);
							});
							return (
								<div
									key={index}
									className={`m-1 grid grid-cols-${header.length} gap-2 rounded-md border border-borderGray text-sm`}
								>
									<div className="flex items-center text-center">
										<div
											className={`m-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-tableGray p-2 text-center text-black`}
										>
											<p>{index + 1}</p>
										</div>
										<p className="ml-2">{구분 || summary.regionName}</p>
									</div>
									{columns}
								</div>
							);
						})}
					</div>
				</div>
			) : (
				<div className="mt-1 flex max-h-[450px] w-3/5 flex-col">
					<div
						className={`grid border-collapse grid-cols-${header.length} gap-2 rounded-md bg-tableGray p-2 text-sm font-bold text-textGray`}
					>
						{header.map((title, index) => (
							<div key={index} className={`flex ${index > 0 ? "ml-auto text-right" : "ml-2"}`}>
								<p>{title}</p>
							</div>
						))}
					</div>

					<div className="custom-scrollbar grow overflow-x-auto">
						{(() => {
							// 기준 지역 찾기
							const referenceRegion = statSummary[0].regionName;

							// 기준 지역의 인덱스를 찾음
							const referenceIndex = data.data[1].indicate.findIndex(
								(item: any) => item.구분 === referenceRegion,
							);

							// 기준 지역이 없을 경우 전체 데이터를 반환 (Fallback 처리)
							if (referenceIndex === -1) {
								return data.data[1].indicate.map((item: any, index: number) => (
									<div
										key={index}
										className={`m-1 grid grid-cols-${Object.keys(item).length} gap-2 rounded-md border border-borderGray text-sm`}
									>
										{/* 기존 렌더링 로직 */}
									</div>
								));
							}

							// 기준 지역 주변 데이터를 가져옴
							const totalItems = 10; // 총 표시할 데이터 개수
							let start = Math.max(0, referenceIndex - 3); // 기본적으로 기준 지역 앞 4개
							let end = Math.min(data.data[1].indicate.length, referenceIndex + 6); // 기본적으로 기준 지역 뒤 5개

							// 기준 지역 주변 데이터가 10개가 되도록 조정
							const itemsBefore = referenceIndex - start;
							const itemsAfter = end - referenceIndex - 1;
							const deficit = totalItems - (itemsBefore + itemsAfter + 1);

							if (deficit > 0) {
								// 앞쪽 부족분을 채움
								if (start > 0) {
									start = Math.max(0, start - deficit);
								} else {
									// 뒤쪽 부족분을 채움
									end = Math.min(data.data[1].indicate.length, end + deficit);
								}
							}

							const displayedData = data.data[1].indicate.slice(start, end);

							return displayedData.map((item: any, index: number) => {
								const { sggCode, 구분, ...rest } = item;

								return (
									<div
										key={index}
										className={`m-1 grid grid-cols-${Object.keys(rest).length + 1} gap-2 rounded-md border border-borderGray text-sm ${
											statSummary[0].regionName === item.구분
												? "border-white bg-tableBlue bg-opacity-20 text-tableBlue"
												: ""
										}`}
									>
										<div className="flex items-center text-center">
											<div
												className={`m-1.5 flex h-6 w-6 items-center justify-center rounded-md p-2 text-center ${
													statSummary[0].regionName === item.구분
														? "bg-white font-semibold text-tableBlue"
														: "bg-tableGray text-black"
												}`}
											>
												<p>{index + 1}</p>
											</div>
											<p className="ml-2">{item.구분} </p>
										</div>

										{Object.entries(rest).map(([key, value], idx) => (
											<div
												key={idx}
												className={`p-2 ${typeof value === "number" ? "text-right" : ""}`}
											>
												<p
													className={`flex items-center justify-end ${
														idx === 1 && typeof value === "number"
															? value > 0
																? "text-[#DD1413]" // 높은 값일 때
																: value < 0
																	? "text-[#599AEF]" // 낮은 값일 때
																	: ""
															: ""
													}`}
												>
													{/* 값 렌더링 */}
													{typeof value === "string" || typeof value === "number" ? value : "-"}
													{/* 두 번째 키일 경우에만 SVG 추가 */}
													{idx === 1 && typeof value === "number" && (
														<span className="ml-2">
															{value > 0 ? <ArrowUp /> : value < 0 ? <ArrowDown /> : null}
														</span>
													)}
												</p>
											</div>
										))}
									</div>
								);
							});
						})()}
					</div>
				</div>
			)}
		</div>
	);
}
