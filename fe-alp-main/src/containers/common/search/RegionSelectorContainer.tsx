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
import { useState, Dispatch, SetStateAction } from "react";
import { getDefaultRegion } from "@/context/defaultValues";
import { PATHS } from "@/constants/path";
import InputWrapper from "@/components/forms/InputWrapper";
import RegionSelector from "./selectors/RegionSelector";
import RegionAddButton from "./RegionAddButton";
import IconClose from "@images/close_md.svg";
import { generateUniqueId } from "@/utils/generate";

interface RegionSelectorContainerProps {
	regionSelectors: string[];
	setRegionSelectors: Dispatch<SetStateAction<string[] | null>>;
	searchFilterState: SearchFilterState;
	setSearchFilterState: Dispatch<SetStateAction<SearchFilterState>>;
	regionInfo: Record<string, RegionInfo>;
	mopAnalysis?: MopAnalysis;
	hasAddRegionButton?: boolean;
	isSggRender?: boolean;
	isAdmRender?: boolean;
	labelColor?: string;
}

export default function RegionSelectorContainer({
	regionSelectors,
	setRegionSelectors,
	searchFilterState,
	setSearchFilterState,
	regionInfo,
	mopAnalysis,
	hasAddRegionButton = true,
	isSggRender = true,
	isAdmRender = true,
	labelColor,
}: Readonly<RegionSelectorContainerProps>) {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/")[2];

	const { displayRegions: regions, isFlow } = searchFilterState;

	let maxRegionSelectorCnt = 4; // 지역 비교는 기준 지역 포함 4개까지 가능

	const [openSelectorId, setOpenSelectorId] = useState<string | null>(null);

	const addRegionSelector = () => {
		if (regionSelectors.length < maxRegionSelectorCnt) {
			const newId = generateUniqueId();
			setRegionSelectors([...regionSelectors, newId]);
			setSearchFilterState((prev) => ({
				...prev,
				displayRegions: [
					...regions,
					{
						sido: { name: "", code: "" },
						sgg: { name: "", code: "" },
						adm: { name: "", code: "" },
					},
				],
			}));
		}
	};

	const removeRegionSelector = (id: string) => {
		if (regionSelectors.length > 1) {
			setRegionSelectors(regionSelectors.filter((selectorId) => selectorId !== id));
			setSearchFilterState((prev) => ({
				...prev,
				displayRegions: regions.filter((_, index) => regionSelectors[index] !== id),
			}));
		}
	};

	const updateOpenSelectorId = (id: string | null) => {
		setOpenSelectorId(id);
	};

	const updateRegion = (id: string, region: Region) => {
		const index = regionSelectors.indexOf(id);
		const updatedRegions = [...regions];
		updatedRegions[index] = region;
		setSearchFilterState((prev) => ({ ...prev, displayRegions: updatedRegions }));
	};

	const resetRegion = (id: string, index: number) => {
		if (index === 0) {
			const defaultRegion = getDefaultRegion();
			const updatedRegions = [defaultRegion, ...regions.slice(1)];
			setSearchFilterState((prev) => ({ ...prev, displayRegions: updatedRegions }));
		} else {
			const updatedRegions = regions.filter((_, index) => regionSelectors[index] !== id);
			setSearchFilterState((prev) => ({ ...prev, displayRegions: updatedRegions }));
			removeRegionSelector(id);
		}
	};

	const getRegionLabel = (index: number) => {
		const labels = Array.from(
			{ length: maxRegionSelectorCnt },
			(_, i) => `비교지역 ${String.fromCharCode(66 + i)}`, // 65 = 대문자 'B'의 ASCII 코드 값
		);
		if (index === 0) {
			return isFlow ? "기준지역" : "기준지역 A";
		} else {
			return labels[index - 1];
		}
	};

	const hasToggleButton =
		rootRoute === PATHS.MOP &&
		[PATHS.TRANS, PATHS.PURPOSE, PATHS.RANK_ANALYSIS].includes(endRoute) &&
		!mopAnalysis?.mopRaa;

	return (
		<>
			{regionSelectors.map((id, index) => {
				return rootRoute !== PATHS.MOP ? (
					<div key={id} className="relative">
						<InputWrapper
							label={getRegionLabel(index)}
							name={`region_${index}`}
							labelColor={labelColor}
						>
							<RegionSelector
								id={id}
								region={regions[index]}
								updateRegion={(region) => updateRegion(id, region)}
								isOpen={openSelectorId === id}
								setOpenSelectorId={updateOpenSelectorId}
								regionInfo={regionInfo}
								pageName={rootRoute}
								isSggRender={isSggRender}
								isAdmRender={isAdmRender}
							/>
						</InputWrapper>
						{index > 0 && (
							<button
								onClick={() => resetRegion(id, index)}
								className="absolute right-0 top-1 flex items-center justify-center rounded-md bg-white p-1 text-[#959595]"
							>
								<IconClose />
							</button>
						)}
					</div>
				) : (
					!(mopAnalysis?.mopRaa && index !== 0) && (
						<div key={id} className="relative">
							<InputWrapper
								label={getRegionLabel(index)}
								name={`region_${index}`}
								labelColor={`${mopAnalysis?.mopRaa ? "text-primary" : ""}`}
								toggleLabels={hasToggleButton && index === 0 ? ["출발", "도착"] : undefined}
								onToggle={() =>
									setSearchFilterState((prev) => ({ ...prev, isInflowRca: !prev.isInflowRca }))
								}
								hasInfo={hasToggleButton && (index === 0 || index === 1)}
								message={
									index === 0
										? `출발지역 선택시 기준지역에서 출발하는 이동을 분석합니다.\n도착지역 선택시 기준지역으로 도착하는 이동을 분석합니다.`
										: `출도착 여부가 기준지역과 동일하게 설정됩니다.`
								}
							>
								<RegionSelector
									id={id}
									region={regions[index]}
									updateRegion={(region) => updateRegion(id, region)}
									isOpen={openSelectorId === id}
									setOpenSelectorId={updateOpenSelectorId}
									regionInfo={regionInfo}
									isSggRender={isSggRender}
									isAdmRender={isAdmRender}
								/>
							</InputWrapper>
							{mopAnalysis?.mopRca && index > 0 && (
								<button
									onClick={() => resetRegion(id, index)}
									className="absolute right-0 top-1 flex items-center justify-center rounded-md bg-white p-1 text-[#959595]"
								>
									<IconClose />
								</button>
							)}
						</div>
					)
				);
			})}

			{/* 비교 지역 추가 버튼 */}
			{hasAddRegionButton && regionSelectors.length < maxRegionSelectorCnt && (
				<RegionAddButton onClick={addRegionSelector} />
			)}
		</>
	);
}
