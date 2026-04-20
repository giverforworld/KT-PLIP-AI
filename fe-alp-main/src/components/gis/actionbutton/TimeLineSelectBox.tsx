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

import * as React from "react";
import { FaChevronDown } from "react-icons/fa";
import { time1Filter } from "@/utils/filter";
import { RadioButton } from "@/components/buttons/RadioButton";

interface TimeLineSelectBoxProps {
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
}

export default function TimeLineSelectBox({
	gisSettings,
	setGisSettings,
}: Readonly<TimeLineSelectBoxProps>) {
	const wrapperRef = React.useRef<HTMLDivElement>(null);
	const [showRegionSelect, setShowTimeLineSelect] = React.useState(false);
	const selectedSidoRadioRef = React.useRef<HTMLInputElement | null>(null);
	const [tempRegion, setTempRegion] = React.useState<string>("");

	// 모달 외부 클릭 시 닫기
	const handleClickOutside = (event: MouseEvent) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
			setShowTimeLineSelect(false);
		}
	};

	React.useEffect(() => {
		if (showRegionSelect) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showRegionSelect]);

	const handleInputClick = () => {
		setShowTimeLineSelect(!showRegionSelect);
	};

	const handleRegionChange = (key: any, value: any) => {
		const timeLineInfo = time1Filter.labels[key];
		if (timeLineInfo) {
			setTempRegion(timeLineInfo);

			// Immediately update gisSettings when an item is selected
			setGisSettings((prev) => ({
				...prev,
				timeLine: Number(key),
			}));
			setShowTimeLineSelect(false); // Close the dropdown after selection
		} else {
			console.error(`No region info found for code: ${key}`);
		}
	};

	return (
		<div ref={wrapperRef} className="relative mt-4 w-full">
			<button
				className="flex w-full cursor-default items-center justify-between rounded-sm border p-2"
				onClick={handleInputClick}
			>
				<input
					type="text"
					value={tempRegion || time1Filter.labels[0]}
					readOnly
					className="w-full cursor-pointer outline-none"
					placeholder="시간대 선택"
				/>
				<FaChevronDown className="w-9 text-gray-500" />
			</button>
			{showRegionSelect && (
				<div className="custom-scrollbar absolute left-0 top-full z-50 mt-0.5 flex h-80 w-full flex-col rounded-md border border-[#e5e7eb] bg-white">
					<div className="custom-scrollbar flex h-80 w-full overflow-y-auto bg-white">
						<ul className={`custom-scrollbar h-inherit w-full overflow-y-auto`}>
							{Object.entries(time1Filter.labels).map(([key, value], index, array) => {
								const isLastItem = index === array.length - 1;
								return (
									<li
										key={key}
										className={`${
											!isLastItem ? "border-b border-[#e5e7eb]" : ""
										} p-2 hover:bg-[#F3F3F3]`}
									>
										<RadioButton
											id={key}
											name={key}
											label={value}
											value={key}
											checked={tempRegion == value}
											onChange={() => handleRegionChange(key, value)}
											ref={key === tempRegion ? selectedSidoRadioRef : null}
										/>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
