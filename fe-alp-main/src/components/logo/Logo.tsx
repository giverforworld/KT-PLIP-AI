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

import Image from "next/image";
import { basePath } from "@/constants/path";

export default function Logo({ width, height }: { width?: number; height?: number }) {
	return (
		<Image
			src={`${basePath}/images/logo/logo_plip.png`}
			alt="로고"
			width={194}
			height={50}
			unoptimized={true}
		/>
	);
}
