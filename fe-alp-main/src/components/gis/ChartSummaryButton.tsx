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

import ActiveChartSummarybutton from "@images/gis/active_chart_summary_button.svg";
import InactiveChartSummarybutton from "@images/gis/inactive_chart_summary_button.svg";
import GisControlButton from "./actionbutton/GisControlButton";

interface ChartSummaryButtonProps {
	isActive: boolean;
	onClick: () => void;
}

export function ChartSummaryButton({ isActive, onClick }: Readonly<ChartSummaryButtonProps>) {
	return (
		<GisControlButton
			onClick={onClick}
			icon={isActive ? <ActiveChartSummarybutton /> : <InactiveChartSummarybutton />}
			label="차트요약"
			isActive={isActive}
		/>
	);
}
