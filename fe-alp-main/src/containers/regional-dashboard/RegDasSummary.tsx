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

import RoundedBox from "@/components/boxes/RoundedBox";
import { useThemeStore } from "@/store/theme";

interface RegDasSummaryProps {
	title: string;
	totalPopul: number;
	prevMonthChange: number;
	prevYearChange: number;
}

export default function Summary({
	title,
	totalPopul,
	prevMonthChange,
	prevYearChange,
}: Readonly<RegDasSummaryProps>) {
	const theme = useThemeStore((s)=> s.theme);
	const formatChange = (value: number) => {
		const sign = value > 0 ? "▲" : "▼";
		const color = value > 0 ? "text-primary" : "text-blue";
		return (
			<span className={`font-semibold ${color}`}>
				{Math.abs(value).toFixed(1)}% {sign}
			</span>
		);
	};

	return (
		<>
			<div className="mb-2 flex flex-wrap items-center justify-between gap-2 dark:text-white">
				<h3 className="font-bold">{title}</h3>
				<div className="text-xl font-bold">{Math.floor(totalPopul).toLocaleString()}</div>
			</div>
			<RoundedBox
				padding="p-2"
				bgColor="bg-whiteGray"
				darkMode={theme === "dark"}
				darkBgColor="bg-darkModeBoxGray"
			>
				<div className="flex flex-wrap items-center justify-between gap-2 dark:text-borderGray">
					<div className="flex gap-2 text-sm">
						<span>전월 대비</span>
						{prevMonthChange !== undefined ? formatChange(prevMonthChange) : "N/A"}
					</div>
					<div className="flex gap-2 text-sm">
						<span>전년 대비</span>
						{prevYearChange !== undefined ? formatChange(prevYearChange) : "N/A"}
					</div>
				</div>
			</RoundedBox>
		</>
	);
}
