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

import path from "path";
import fs from "fs";
// dev-local data

export function getMapData(name: string) {
	const filePath = path.join(process.cwd(), "public", "maps", "data", name);

	try {
		const file = fs.readFileSync(filePath, "utf8");
		return JSON.parse(file);
	} catch (error) {
		console.error(`File not found: ${filePath}`);
		return {}; // 파일을 찾을 수 없으면 빈 객체 반환
	}
}
