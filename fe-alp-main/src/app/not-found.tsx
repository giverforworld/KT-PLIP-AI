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

import { PATHS } from "@/constants/path";
import Link from "next/link";

export function NotFoundPage() {
	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<h1 className="text-[120px] font-bold">404</h1>
			<p className="mt-2 text-center text-[40px]">
				찾을 수 없는 페이지입니다.
				<br />
				요청하신 페이지가 사라졌거나, 잘못된 경로를 이용하셨어요 :)
			</p>
			<Link className="mt-8 border-2 border-white px-20 py-2 text-[30px]" href={`/${PATHS.DAS}`}>
				홈으로 이동하기
			</Link>
		</div>
	);
}

export default NotFoundPage;
