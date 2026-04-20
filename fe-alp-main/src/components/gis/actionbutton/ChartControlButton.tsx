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

"use client";
import * as React from "react";
import ActivePlayButton from "@images/gis/active_play.svg";
import InActivePlayButton from "@images/gis/inactive_play.svg";
import ActivePlay2Button from "@images/gis/active_play2.svg";
import InActivePlay2Button from "@images/gis/inactive_play2.svg";
import ActivePlay3Button from "@images/gis/active_play3.svg";
import InActivePlay3Button from "@images/gis/inactive_play3.svg";
import ActivePauseButton from "@images/gis/active_pause.svg";
import InActivePauseButton from "@images/gis/inactive_pause.svg";
import { useTimeSeriesStatusStore } from "@/store/gis/timeSeriesStatus";

export default function ChartControlButton() {
	const timeStatus = useTimeSeriesStatusStore(s=>s.timeSeriesStatus);
	const setTimeStatus = useTimeSeriesStatusStore((s) => s.setTimeSeriesStatus);
	const handlePlay = (speed: 1 | 2 | 3) => {
		setTimeStatus((prev) => ({
			...prev,
			playStatus: speed,
		}));
	};

	const handlePause = () => {
		setTimeStatus((prev) => ({
			...prev,
			playStatus: 0,
		}));
	};

	const Tooltip = ({ text }: { text: string }) => {
		return (
			<span className="invisible absolute bottom-full left-1/2 z-10 mb-1 w-fit min-w-10 -translate-x-1/2 whitespace-nowrap rounded bg-black px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
				{text}
			</span>
		);
	};

	return (
		<div className="flex gap-4">
			<button onClick={() => handlePlay(1)} className="group relative">
				{timeStatus.playStatus === 1 ? <ActivePlayButton /> : <InActivePlayButton />}
				<Tooltip text="재생" />
			</button>
			<button onClick={handlePause} className="group relative">
				{timeStatus.playStatus === 0 ? <ActivePauseButton /> : <InActivePauseButton />}
				<Tooltip text="정지" />
			</button>
			<button onClick={() => handlePlay(2)} className="group relative">
				<Tooltip text="2배속" />
				{timeStatus.playStatus === 2 ? <ActivePlay2Button /> : <InActivePlay2Button />}
			</button>
			<button onClick={() => handlePlay(3)} className="group relative">
				<Tooltip text="3배속" />
				{timeStatus.playStatus === 3 ? <ActivePlay3Button /> : <InActivePlay3Button />}
			</button>
		</div>
	);
}
