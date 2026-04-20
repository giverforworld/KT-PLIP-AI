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

/**
 * 현재 ConfigMap 데이터 가져오기
 */
export const getUrlMap = async (): Promise<any | undefined> => {
	const { data } = await axios.get(`${basePath}/api/auth/url-map`);
	if (data.ok) return data.url;
};
