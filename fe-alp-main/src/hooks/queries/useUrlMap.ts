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

import { getUrlMap } from "@/services/urlMap";
import { useQuery } from "@tanstack/react-query";

export default function useUrlMap() {
	/**
	 * 현재 config 데이터 가져오기
	 */
	const useUrlMapQuery = () =>
		useQuery({
			queryKey: ["urlMap"],
			queryFn: () => getUrlMap(),
		});

	return { useUrlMapQuery };
}
