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
import ContentHeader from "@/components/text/ContentHeader";
import DataContainer from "./DataContainer";
import LlpIcon from "@images/chartIcon/llpNoneIcon.svg";

interface DataGroupProps {
	data: DataGroup;
	chartHeight?: number;
	regionInfo?: Record<string, RegionInfo>;
}

export default function DataGroup({ data, chartHeight, regionInfo }: Readonly<DataGroupProps>) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	// console.log(data);
	return (
		<div className="flex h-inherit w-full flex-col gap-6">
			{rootRoute !== PATHS.GIS &&
			(data.title === "랭킹분석" ||
				(data.data[1] ? data.data[1] : data.data[0]).charts.filter((item: any) =>
					item.indicate ? item.indicate.length > 0 : item.data?.length !== 0,
				).length > 0) ? (
				<>
					<ContentHeader title={data.title} />
					<DataContainer data={data.data} regionInfo={regionInfo} />
				</>
			) : rootRoute !== PATHS.GIS ? (
				<div className="col-span-2 text-center">
					<div className="relative">
						<div className="h-[200px] rounded-lg bg-gray-200 opacity-50" />

						<div
							className={
								"absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center text-base font-semibold text-filterDarkGray"
							}
						>
							<LlpIcon className={"filterDarkGray"} />
							<p className="mt-2">생활이동 데이터가 1명 미만입니다.</p>
						</div>
					</div>
				</div>
			) : (
				<DataContainer data={data.data} {...{ chartHeight }} />
			)}
		</div>
	);
}
