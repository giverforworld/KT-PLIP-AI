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

import IconHome from "@images/home.svg";
import IconPlay from "@images/play.svg";
import IconPause from "@images/pause.svg";
import { useThemeStore } from "@/store/theme";

interface RegMapControlButtonsProps {
	isPlay: boolean;
	setIsPlay: React.Dispatch<React.SetStateAction<boolean>>;
	getInitialStatus: () => void;
	userInfo: any;
}
export default function RegMapControlButtons({
	isPlay,
	setIsPlay,
	getInitialStatus,
	userInfo
}: RegMapControlButtonsProps) {
	const theme = useThemeStore((s)=> s.theme);
	return (
		<>
			<div
				className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md bg-tabGray text-[#444444] dark:bg-black dark:text-[#818181]"
				onClick={getInitialStatus}
			>
				<IconHome />
			</div>
			{userInfo.baseInfo.toString().length !== 5 && <div
				className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-md bg-tabGray text-[#444444] dark:bg-black dark:text-[#818181]"
				onClick={(event) => {
					event?.stopPropagation();
					setIsPlay((prev) => !prev);
				}}
			>
				<div className="selected-none">
					{!isPlay ? (
						theme === "dark" ? (
							<IconPlay />
						) : (
							<IconPlay />
						)
					) : theme === "dark" ? (
						<IconPause />
					) : (
						<IconPause />
					)}
				</div>
			</div>}
		</>
	);
}
