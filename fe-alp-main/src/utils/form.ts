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

/**
 * 객체 데이터를 FormData로 변환하는 함수
 * @param {T} data
 * @returns {FormData}
 */
export const convertToFormData = <T extends Record<string, any>>(data: T) => {
	const formData = new FormData();

	Object.keys(data).forEach((key) => {
		const value = data[key];

		if (value !== undefined && value !== null) {
			if (typeof value === "object")
				formData.append(key, JSON.stringify(value)); //객체나 배열이면 JSON.stringify
			else formData.append(key, value);
		}
	});

	return formData;
};
