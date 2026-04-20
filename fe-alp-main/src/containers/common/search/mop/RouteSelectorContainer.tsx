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

import { Dispatch, SetStateAction, useState } from "react";
import InputWrapper from "@/components/forms/InputWrapper";
import IconChange from "@images/change.svg";
import IconClose from "@images/close_md.svg";
import RegionSelector from "../selectors/RegionSelector";
import RegionAddRaaButton from "./RegionAddRaaButton";
import { generateUniqueId } from "@/utils/generate";
import { hasEmptyObject, isEmptyObject } from "@/utils/validate";

interface RouteSelectorContainerProps {
	routeRegionSelectors: string[];
	setRouteRegionSelectors: Dispatch<SetStateAction<string[] | null>>;
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	regionInfo: Record<string, RegionInfo>;
	pageName: string;
}

export default function RouteSelectorContainer({
	routeRegionSelectors,
	setRouteRegionSelectors,
	searchFilterState,
	setSearchFilterState,
	regionInfo,
	pageName,
}: RouteSelectorContainerProps) {
	const {
		displayRegions: regions,
		routeDisplayRegions: routeRegions,
		isInflowRaa,
	} = searchFilterState;

	const isSggEmpty = Object.values(regions[0].sgg).every((value) => value === "");
	const isAdmEmpty = Object.values(regions[0].adm).every((value) => value === "");

	let maxRegionSelectorCnt = 4;

	const [openSelectorId, setOpenSelectorId] = useState<string | null>(null);

	const addRegionSelectorMop = () => {
		if (routeRegionSelectors.length < maxRegionSelectorCnt) {
			const newId = generateUniqueId();
			setRouteRegionSelectors([...routeRegionSelectors, newId]);
			setSearchFilterState((prev) => ({
				...prev,
				routeDisplayRegions: [
					...routeRegions,
					{
						sido: { name: "", code: "" },
						sgg: { name: "", code: "" },
						adm: { name: "", code: "" },
					},
				],
			}));
		}
	};

	const removeRegionSelectorMop = (id: string) => {
		if (routeRegionSelectors.length > 1) {
			setRouteRegionSelectors(routeRegionSelectors.filter((selectorId) => selectorId !== id));
			setSearchFilterState((prev) => ({
				...prev,
				routeDisplayRegions: routeRegions.filter((_, index) => routeRegionSelectors[index] !== id),
			}));
		}
	};

	const updateRegionMop = (id: string, region: Region) => {
		const index = routeRegionSelectors.indexOf(id);
		const updatedrouteRegions = [...routeRegions];
		updatedrouteRegions[index] = region;
		setSearchFilterState((prev) => ({
			...prev,
			routeDisplayRegions: updatedrouteRegions,
		}));
	};

	const resetRegionMop = (id: string, index: number) => {
		if (routeRegionSelectors.length === 1) {
			setSearchFilterState((prev) => ({
				...prev,
				routeDisplayRegions: [
					{
						sido: { name: "", code: "" },
						sgg: { name: "", code: "" },
						adm: { name: "", code: "" },
					},
				],
			}));
		} else {
			const updatedrouteRegions = routeRegions.filter((_, idx) => routeRegionSelectors[idx] !== id);
			setSearchFilterState((prev) => ({ ...prev, routeDisplayRegions: updatedrouteRegions }));
			removeRegionSelectorMop(id);
		}
	};

	return (
		<div className="flex w-full gap-4">
			{/* 기준지역 */}
			<div className={`w-1/2 ${isInflowRaa ? "order-2" : "order-0"}`}>
				<h2 className="flex h-[40px] items-center font-semibold">
					{isInflowRaa ? (
						<>
							<span>도착지역</span>(<span className="text-chartFocus">기준지역</span>)
						</>
					) : (
						<>
							<span>출발지역</span>(<span className="text-chartFocus">기준지역</span>)
						</>
					)}
				</h2>
				<div className="region-item flex h-[48px] items-center rounded-md bg-boxGray p-4 text-textGray">
					<p>
						{regions[0]?.sido?.name} {regions[0]?.sgg?.name} {regions[0]?.adm?.name}
					</p>
				</div>
			</div>

			{/* 전환버튼 */}
			<div className="order-1 mt-[40px] flex cursor-pointer">
				<IconChange
					onClick={() =>
						setSearchFilterState((prev) => ({
							...prev,
							isInflowRaa: !prev.isInflowRaa,
						}))
					}
				/>
			</div>

			{/* 비교지역*/}
			<div className={`flex w-1/2 flex-col gap-2 ${isInflowRaa ? "order-0" : "order-2"}`}>
				{routeRegionSelectors?.map((id, index) => {
					return (
						<div key={id}>
							{index === 0 ? (
								<InputWrapper
									label={isInflowRaa ? "출발지역" : "도착지역"}
									name={`region_${index}`}
								>
									<RouteSelectorWrapper>
										<RegionSelector
											id={id}
											region={routeRegions[index]}
											updateRegion={(region) => updateRegionMop(id, region)}
											isOpen={openSelectorId === id}
											setOpenSelectorId={setOpenSelectorId}
											regionInfo={regionInfo}
											pageName={pageName}
											isSggRender={!isSggEmpty}
											isAdmRender={!isAdmEmpty}
										/>
										{isEmptyObject(routeRegions[index]) || (
											<RouteSelectorCloseButton onClick={() => resetRegionMop(id, index)} />
										)}
									</RouteSelectorWrapper>
								</InputWrapper>
							) : (
								<RouteSelectorWrapper>
									<RegionSelector
										id={id}
										region={routeRegions[index]}
										updateRegion={(region) => updateRegionMop(id, region)}
										isOpen={openSelectorId === id}
										setOpenSelectorId={setOpenSelectorId}
										regionInfo={regionInfo}
										isSggRender={!isSggEmpty}
										isAdmRender={!isAdmEmpty}
									/>
									<RouteSelectorCloseButton onClick={() => resetRegionMop(id, index)} />
								</RouteSelectorWrapper>
							)}
						</div>
					);
				})}

				{/* 출발지/도착지 지역 선택 버튼 */}
				{!hasEmptyObject(routeRegions) && routeRegionSelectors.length < maxRegionSelectorCnt && (
					<RegionAddRaaButton onClick={addRegionSelectorMop} isInflowRaa={isInflowRaa} />
				)}
			</div>
		</div>
	);
}

const RouteSelectorWrapper = ({ children }: { children: React.ReactNode }) => {
	return <div className="flex h-[48px] w-full gap-2">{children}</div>;
};

const RouteSelectorCloseButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<div className="flex items-center">
			<button className="rounded-md bg-white p-1 text-[#959595]" onClick={onClick}>
				<IconClose />
			</button>
		</div>
	);
};
