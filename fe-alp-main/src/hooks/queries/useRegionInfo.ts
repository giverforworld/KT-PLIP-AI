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

import { getGisRegionInfo, getRegionInfo } from "@/services/server/getRegionInfo";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";

/**
 * @returns {useQuery}
 */

export default function useRegionInfo() {
	const useRegionInfoQuery = (start: string) => {
		return useQuery({
			queryKey: ["regionInfo", start],
			queryFn: () => getRegionInfo(start),
		});
	};
	
	const useGisRegionInfoQuery = (start: string) => {
		return useQuery({
			queryKey: ["regionInfo", start],
			queryFn: () => getGisRegionInfo(start),
		});
	};
	return {
		useRegionInfoQuery,
		useGisRegionInfoQuery
	};
}
