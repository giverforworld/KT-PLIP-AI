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

import GisSpinner from "@/components/loading/GisSpinner";

export default function GisDataLoading() {
	return (
		<div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-50">
			<GisSpinner />
			<p className="p-4 text-center text-lg font-semibold text-white">
				데이터를 불러오는 중입니다.
				<br /> 잠시만 기다려 주세요.
			</p>
		</div>
	);
}
