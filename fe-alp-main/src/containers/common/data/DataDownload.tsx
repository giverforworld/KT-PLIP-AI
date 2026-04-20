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

import SquareButton from "@/components/buttons/SquareButton";
import IconDownload from "@images/download.svg";
import { exportChartsToPng, exportChartDataToExcel } from "@/utils/dataExport";
import { useShowToast } from "@/hooks/useToastShow";
import { useChartLabelStore } from "@/store/chartLabel";

interface DataDownloadProps {
	data: DataContainer;
}

export default function DataDownload({ data }: DataDownloadProps) {
	const showToast = useShowToast();

	const chartLabelShow = useChartLabelStore(s=>s.chartLabel);
	const setChartLabelShow = useChartLabelStore((s) => s.setChartLabel);
	
	// 다운로드 권한 테스트
	// const testAccount = JSON.parse(sessionStorage.getItem('TA')!);
	
	const downloadData = () => {
		// if (testAccount === "N") {
			setChartLabelShow(true);
			setTimeout(async () => {
			exportChartsToPng(data);
			exportChartDataToExcel(data);
			}, 500);
		// } else {
		// 	showToast("다운로드 권한이 없습니다", "info");
		// }
	};

	return <SquareButton Icon={IconDownload} ariaLabel="다운로드" onClick={downloadData} />;
}
