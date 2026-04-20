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

import React, { useState, useRef, useEffect } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { FaChevronDown } from "react-icons/fa";
import { ko } from "date-fns/locale";
import { addDays, differenceInDays, isSameMonth, startOfMonth, endOfMonth } from "date-fns";
import { formatDateRangeOrString, numberToDate } from "@/libs/gisOptionFunc";
import useOutsideClick from "@/hooks/useOutsideClick";
import { format } from "date-fns";
import { changeDateToString } from "@/utils/date";
import { useDateRangeStore } from "@/store/dateRange";

interface RangeCalendarProps {
	mapIdx?: 0 | 1;
	onConfirm?: (range: { startDate: Date; endDate: Date }) => void;
	maxDate?: Date;
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	tempSettings?: GisSettings;
	setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
	setDate: any;
	isFop?: boolean;
}

export default function RangeCalendar({
	mapIdx = 0,
	onConfirm,
	maxDate = new Date(),
	gisSettings,
	setGisSettings,
	tempSettings,
	setTempSettings,
	setDate,
	isFop,
}: Readonly<RangeCalendarProps>) {
	// 기간조회 일수 변경
	const MAX_RANGE_DAYS = tempSettings?.isGrid ? 0 : 6;
	// const MAX_RANGE_DAYS = tempSettings?.isGrid ? 1 : 6;

	// const [initialState, setInitialState] = useState([
	// 	{
	// 		startDate:
	// 			numberToDate(
	// 				tempSettings ? tempSettings.maps[mapIdx].startDate : gisSettings.maps[mapIdx].startDate,
	// 			) || new Date(),
	// 		endDate:
	// 			numberToDate(
	// 				tempSettings ? tempSettings.maps[mapIdx].endDate : gisSettings.maps[mapIdx].endDate,
	// 			) || undefined,
	// 		key: "selection",
	// 	},
	// ]);

	const end = JSON.parse(sessionStorage.getItem("info")!).endDate.slice(0, 6);
	const dateRange = useDateRangeStore((s)=> s.dateRange);
	
	const [tempState, setTempState] = useState([
		{
			startDate: numberToDate(Number(end + `01`)),
			endDate: numberToDate(Number(end + `07`)),
			key: "selection",
		},
	]);
	const [confirmedState, setConfirmedState] = useState([
		{
			startDate: numberToDate(Number(end + `01`)),
			endDate: numberToDate(Number(end + `07`)),
			key: "selection",
		},
	]);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	useOutsideClick(wrapperRef, () => setShowDatePicker(false));

	// useEffect(() => {
	// 	if (!tempSettings?.isGrid || tempSettings.analysisType === 0) {
	// 		setTempState([{
	// 			startDate: numberToDate(Number(end+`01`)),
	// 			endDate: numberToDate(Number(end+`07`)),
	// 			key: "selection"
	// 		}])
	// 		setConfirmedState([{
	// 			startDate: numberToDate(Number(end+`01`)),
	// 			endDate: numberToDate(Number(end+`07`)),
	// 			key: "selection"
	// 		}])
	// 	} else {
	// 		setTempState([{
	// 			startDate: numberToDate(Number(end+`01`)),
	// 			endDate: numberToDate(Number(end+`01`)),
	// 			key: "selection"
	// 		}])
	// 		setConfirmedState([{
	// 			startDate: numberToDate(Number(end+`01`)),
	// 			endDate: numberToDate(Number(end+`01`)),
	// 			key: "selection"
	// 		}])
	// 	}
	// }, []);

	useEffect(() => {
		if (setTempSettings && tempSettings && !tempSettings?.isGrid) {
			setTempState([
				{
					startDate: numberToDate(Number(end + `01`)),
					endDate: numberToDate(Number(end + `07`)),
					key: "selection",
				},
			]);
			let newMaps: any = [...tempSettings.maps];
			newMaps[0] = { ...newMaps[0], startDate: Number(end + `01`), endDate: Number(end + `07`) };
			newMaps[1] = { ...newMaps[1], startDate: Number(end + `01`), endDate: Number(end + `07`) };
			setTempSettings((prev) => ({ ...prev, maps: newMaps }));
		}
		if (setTempSettings && tempSettings?.isGrid) {
			setTempState([
				{
					// 기간조회 일수 변경
					startDate: numberToDate(Number(end + `01`)),
					endDate: numberToDate(Number(end + `01`)),
					// endDate: numberToDate(Number(end+`02`)),
					key: "selection",
				},
			]);
			let newMaps: any = [...tempSettings.maps];
			newMaps[0] = { ...newMaps[0], startDate: Number(end + `01`), endDate: Number(end + `01`) };
			newMaps[1] = { ...newMaps[1], startDate: Number(end + `01`), endDate: Number(end + `01`) };
			// newMaps[0] = {...newMaps[0], startDate: Number(end+`01`), endDate: Number(end+`02`)};
			// newMaps[1] = {...newMaps[1], startDate: Number(end+`01`), endDate: Number(end+`02`)};
			setTempSettings((prev) => ({ ...prev, maps: newMaps }));
		}
	}, [tempSettings?.isGrid]);

	// 🟢 초기 상태 설정을 위한 useEffect
	// useEffect(() => {
	// 	const date =
	// 		numberToDate(
	// 			tempSettings ? tempSettings.maps[mapIdx].startDate : gisSettings.maps[mapIdx].startDate,
	// 		) || new Date();

	// 	const updatedState = [
	// 		{
	// 			startDate: date,
	// 			endDate: addDays(date, MAX_RANGE_DAYS),
	// 			key: "selection",
	// 		},
	// 	];

	// 	setInitialState(updatedState);
	// 	setConfirmedState(updatedState);
	// 	setTempState(updatedState);

	// 	setTempSettings &&
	// 		setTempSettings((prev) => ({
	// 			...prev,
	// 			maps: prev.maps.map((map, index) =>
	// 				index === mapIdx
	// 					? {
	// 							...map,
	// 							startDate: changeDateToString(updatedState[0].startDate),
	// 							endDate: changeDateToString(updatedState[0].endDate),
	// 						}
	// 					: { ...map },
	// 			),
	// 		}));
	// }, [tempSettings?.maps[mapIdx].dateType, tempSettings?.isGrid, MAX_RANGE_DAYS, mapIdx]);

	const handleInputClick = () => {
		setShowDatePicker(!showDatePicker);
	};

	const handleDateChange = (ranges: RangeKeyDict) => {
		const { startDate, endDate } = ranges.selection;
		if (startDate && endDate && !tempSettings?.isGrid) {
			if (!isSameMonth(startDate, endDate)) {
				const adjustedEndDate =
					differenceInDays(endDate, startDate) > 0 ? endOfMonth(startDate) : startOfMonth(endDate);
				setTempState([
					{
						startDate: startDate,
						endDate: adjustedEndDate,
						key: "selection",
					},
				]);
			} else if (differenceInDays(endDate, startDate) > MAX_RANGE_DAYS) {
				setTempState([
					{
						startDate: startDate,
						endDate: addDays(startDate, MAX_RANGE_DAYS),
						key: "selection",
					},
				]);
			} else {
				setTempState([
					{
						startDate: startDate,
						endDate: endDate,
						key: "selection",
					},
				]);
			}
		} else if ((startDate && endDate && tempSettings?.isGrid) || (startDate && !endDate)) {
			setTempState([
				{
					startDate: startDate,
					// 기간조회 일수 변경
					endDate: startDate,
					// endDate: new Date(Number(startDate.getFullYear), Number(startDate.getMonth)-1, 2),
					key: "selection",
				},
			]);
		}
	};

	const handleConfirm = () => {
		const { startDate, endDate } = tempState[0];
		setConfirmedState(tempState);

		if (tempSettings) {
			setTempSettings?.((prev) => {
				const clonedMaps = structuredClone(prev.maps);
				clonedMaps[mapIdx] = {
					...clonedMaps[mapIdx],
					startDate: parseInt(format(startDate, "yyyyMMdd")),
					endDate: parseInt(format(endDate, "yyyyMMdd")),
				};

				if (gisSettings.isDual) {
					clonedMaps[1] = { ...gisSettings.maps[1] };
				}

				return {
					...prev,
					maps: clonedMaps,
					regionCode: prev.regionCode.toString().slice(0, 2) === '51' && Number(changeDateToString(startDate).toString().slice(0, 6)) < 202307
						? Number('42'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '52' && Number(changeDateToString(startDate).toString().slice(0, 6)) < 202403
						? Number('45'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '42' && Number(changeDateToString(startDate).toString().slice(0, 6)) > 202306
						? Number('51'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '45' && Number(changeDateToString(startDate).toString().slice(0, 6)) > 202402
						? Number('52'+prev.regionCode.toString().slice(2))
						: prev.regionCode
				};
			});
		} else {
			if (setTempSettings)
				setTempSettings((prev) => ({
					...prev,
					maps: prev.maps.map((map, index) =>
						index === mapIdx
							? {
								...map,
								startDate: parseInt(format(startDate, "yyyyMMdd")),
								endDate: parseInt(format(endDate, "yyyyMMdd")),
							}
							: { ...map },
					),
					regionCode: prev.regionCode.toString().slice(0, 2) === '51' && Number(changeDateToString(startDate).toString().slice(0, 6)) < 202307
						? Number('42'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '52' && Number(changeDateToString(startDate).toString().slice(0, 6)) < 202403
						? Number('45'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '42' && Number(changeDateToString(startDate).toString().slice(0, 6)) > 202306
						? Number('51'+prev.regionCode.toString().slice(2))
						: prev.regionCode.toString().slice(0, 2) === '45' && Number(changeDateToString(startDate).toString().slice(0, 6)) > 202402
						? Number('52'+prev.regionCode.toString().slice(2))
						: prev.regionCode
				}));
		}

		if (onConfirm) {
			onConfirm({
				startDate: startDate,
				endDate: endDate,
			});
		}
		setDate(startDate);
		setShowDatePicker(false);
	};

	//격자50일때 최대 조회 가능 범위 1개월
	const getFopMonth = (date: Date): Date => {
		let year = date.getFullYear();
		let month = date.getMonth();
		// month -= 2;
		if (month <= 0) {
			year -= 1;
			month += 12;
		}
		return new Date(year, month, 1);
	};

	return (
		<div ref={wrapperRef} className="relative mt-4 w-full">
			<button
				className="flex w-full cursor-default items-center justify-between rounded-sm border p-2"
				onClick={handleInputClick}
			>
				<input
					type="text"
					// value={formatDateRangeOrString(tempState[0].startDate, tempState[0].endDate)}
					value={`${format(tempState[0].startDate, "yyyy.MM.dd")} - ${format(tempState[0].endDate, "yyyy.MM.dd")}`}
					readOnly
					className="w-full cursor-pointer outline-none"
					placeholder="기간 선택"
				/>
				<FaChevronDown className="w-9 text-gray-500" />
			</button>

			{showDatePicker && (
				<div className="z-50 mt-0.5 w-full rounded bg-white">
					<div className="z-50 flex w-auto flex-col rounded-sm border border-[#e5e7eb]">
						<DateRange
							className="rounded-sm"
							locale={ko}
							editableDateInputs={true}
							onChange={handleDateChange}
							moveRangeOnFirstSelection={false}
							showDateDisplay={false}
							ranges={tempState}
							months={1}
							direction="horizontal"
							rangeColors={["#D63457"]}
							minDate={isFop || tempSettings?.gridScale === 0.05
								? getFopMonth(dateRange.maxDate)
								: dateRange.minDate}
							maxDate={dateRange.maxDate}
						/>
						<div className="flex w-full items-center justify-between border-t border-[#E4E8EE] bg-white p-2">
							<span className="text-sm font-medium text-[#999999]">
								{`기간 선택은 같은 월 내에서 최대 ${MAX_RANGE_DAYS + 1}일까지 가능합니다.`}
							</span>
							<button
								className="rounded-lg bg-[#D63457] px-3 py-1 text-white"
								onClick={handleConfirm}
							>
								확인
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
