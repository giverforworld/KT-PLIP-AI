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

import axios from "axios";
import { basePath } from "@/constants/path";

export const revalidate = 1;

export const getGisChartData = async (
	isNative: boolean,
	start: number,
	end: number,
	regions: number[],
	isSelectTime: 0 | 1,
	timezn: number[],
): Promise<AlpChartData[] | undefined> => {
	const body = { isNative, start, end, regions, isSelectTime, timezn };

	const { data } = await axios.post(`${basePath}/api/gis/chart`, body);
	if (data.ok) return data.result;
};
