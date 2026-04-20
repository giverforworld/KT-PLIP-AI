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

import { MenuToggleButton } from "@/components/gis/MenuToggleButton";
import GisOptionContainer from "./GisOptionContainer";

interface GisSideBarProps {
	mapIdx?: 0 | 1;
	position?: "left" | "right";
	gisSettings: GisSettings;
	setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
	onApplySettings: (next:GisSettings)=>void;
}

export default function GisSideBar({
	mapIdx = 0,
	position = "left",
	gisSettings,
	setGisSettings,
	onApplySettings,
}: Readonly<GisSideBarProps>) {
	const isSideBarVisible = gisSettings.maps[mapIdx]?.isSideBar;

	const handleToggle = () => {
		setGisSettings((prev) => ({
			...prev,
			maps: prev.maps.map((map, index) =>
				index === mapIdx ? { ...map, isSideBar: !map.isSideBar } : { ...map },
			),
		}));
	};
	return (
		<div
			className={`${mapIdx === 0 ? "absolute" : "relative"} flex h-full items-center justify-center`}
		>
			{position === "right" && (
				<MenuToggleButton position={position} gisSettings={gisSettings} onClick={handleToggle} />
			)}

			{isSideBarVisible ? (
				<>
					<GisOptionContainer
						{...{
							mapIdx: position === "left" ? 0 : 1,
							gisSettings,
							setGisSettings,
							onApplySettings,
						}}
					/>
					{position === "left" && (
						<MenuToggleButton
							position={position}
							gisSettings={gisSettings}
							onClick={handleToggle}
						/>
					)}
				</>
			) : (
				position === "left" && (
					<MenuToggleButton position={position} gisSettings={gisSettings} onClick={handleToggle} />
				)
			)}
		</div>
	);
}
