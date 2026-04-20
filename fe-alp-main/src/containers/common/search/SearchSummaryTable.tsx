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
import Spinner from "@/components/loading/Spinner";
import IconArrowOD from "@images/arrow_od.svg";
import { extractPageInfo } from "@/utils/validate";

interface SearchSummaryTableProps {
	data: SearchSummary[] | undefined;
	isSearchSummaryLoading: boolean;
	activeTabKey: DataSummaryKeys;
	searchFilter: MopSearchFilter & MopFlowSearchFilter;
}

export default function SearchSummaryTable({
	data,
	activeTabKey,
	isSearchSummaryLoading,
	searchFilter,
}: SearchSummaryTableProps) {
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);

	const getRegionLabel = (regionType: string) => {
		const { isFlow, isInflowRca, isInflowRaa } = searchFilter;

		if (pageName === PATHS.MOP && subPageName !== PATHS.RANK_ANALYSIS && isFlow) {
			return (
				<div className="flex items-center justify-center gap-1">
					{isFlow ? (
						<span>{isInflowRaa ? `출발지역${regionType}` : "기준지역"}</span>
					) : (
						<span>{isInflowRca ? `출발지역${regionType}` : "기준지역"}</span>
					)}
					<IconArrowOD />
					{isFlow ? (
						<span>{isInflowRaa ? "기준지역" : `도착지역${regionType}`}</span>
					) : (
						<span>{isInflowRca ? "기준지역" : `도착지역${regionType}`}</span>
					)}
				</div>
			);
		}
		return `${regionType === "A" ? "기준지역 A" : `비교지역 ${regionType}`}`;
	};

	return (
		<div className="mt-3">
			<table className="w-full border-collapse text-sm">
				<caption className="hidden">지역분석표</caption>
				<colgroup>
					<col className="w-1/5" />
					<col className="w-1/5" />
					<col className="w-1/5" />
					<col className="w-1/5" />
					<col className="w-1/5" />
				</colgroup>
				<thead>
					<tr>
						<th scope="col" className="border-b bg-whiteGray py-2">
							구분
						</th>
						{["A", "B", "C", "D"].map((regionType, index) => (
							<th
								key={regionType}
								scope="col"
								className={`border-b bg-whiteGray py-2 ${index === 0 ? "text-primary" : ""}`}
							>
								{getRegionLabel(regionType)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{isSearchSummaryLoading ? (
						<tr>
							<td
								colSpan={5}
								className="border-b-[0.5px] border-extraLightGray bg-white p-1 text-center"
							>
								<Spinner />
							</td>
						</tr>
					) : (
						data?.map((item, itemIndex) => {
							return (
								<tr key={item.title}>
									<th
										scope="row"
										className="border-b-[0.5px] border-extraLightGray bg-whiteGray p-1.5 pl-2 text-left font-medium"
									>
										{item.title}
									</th>
									{Array.from({ length: 4 }).map((_, index) => {
										const val = item.data[index]?.value;
										const value = typeof val === "object" && val !== null ? val[activeTabKey] : val;
										return (
											<td
												key={index}
												className={`border-b-[0.5px] border-extraLightGray bg-white p-1 ${itemIndex === 0 ? "text-center font-semibold" : "text-right font-medium"} ${
													item.type === "variance" && value !== "-"
														? typeof value === "number" && Math.sign(value) === 1
															? "text-primary"
															: "text-blue"
														: "text-black"
												}`}
											>
												{value || ""}
												{value && value !== "-" ? item.unit : ""}
											</td>
										);
									})}
								</tr>
							);
						})
					)}
				</tbody>
			</table>
		</div>
	);
}
