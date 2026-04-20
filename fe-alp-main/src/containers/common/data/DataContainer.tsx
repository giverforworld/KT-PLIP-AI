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

import { usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import ShadowBox from "@/components/boxes/ShadowBox";
import DataHeader from "./DataHeader";
import DataSummary from "./DataSummary";
import ChartContainer from "../chart/ChartContainer";
import PopulationDeclineRisk from "@/containers/alp/comparative-analysis/PopulationDeclineRisk";

interface DataContainerProps {
	data: DataContainer[];
	isReport?: boolean;
	chartHeight?: number;
	hasBookmark?: boolean;
	regionInfo?: Record<string, RegionInfo>;
}

export default function DataContainer({
	data,
	isReport,
	chartHeight,
	hasBookmark = true,
	regionInfo,
}: Readonly<DataContainerProps>) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];

	return (
		<>
			{rootRoute !== PATHS.GIS ? (
				<div className={`col-span-2 flex flex-col gap-6`}>
					{data?.map((item, index) => (
						<div
							key={index}
							id={item.title}
							className={`report-contents ${isReport ? "py-1" : ""} last:pb-12`}
						>
							<ShadowBox>
								<div className="flex flex-col gap-4">
									<DataHeader data={item} isReport={isReport} hasBookmark={hasBookmark} />

									<div className="summarychart-container grid grid-cols-2 gap-4">
										{item.summary ? <DataSummary data={item} isReport={isReport} /> : ""}
										{item.title === "지방소멸위험지수" && item.summary ? <PopulationDeclineRisk data={item.summary} /> : ""}
										{item.charts && item.charts.length > 0 ? (
											<ChartContainer data={item} isReport={isReport} regionInfo={regionInfo} />
										) : (
											<div className="col-span-2 text-center">데이터가 존재하지 않습니다.</div>
										)}
									</div>
								</div>
							</ShadowBox>
						</div>
					))}
				</div>
			) : (
				<>
					{data.map((item, index) =>
						item.charts && item.charts.length > 0 ? (
							<ChartContainer key={item.title} data={item} {...{ chartHeight }} />
						) : (
							<div key={index} className="col-span-2 text-center">
								데이터가 존재하지 않습니다.
							</div>
						),
					)}
				</>
			)}
		</>
	);
}
