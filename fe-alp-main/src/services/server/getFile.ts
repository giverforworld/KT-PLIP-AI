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

export function getMapProperties(name: string) {
	const filePath = path.join(process.cwd(), "public", "maps", "properties", name);
	const file = fs.readFileSync(filePath, "utf8");
	return JSON.parse(file);
}

export function getMap(name: string) {
	const filePath = path.join(process.cwd(), "public", "maps", name);
	const file = fs.readFileSync(filePath, "utf8");
	return JSON.parse(file);
}

export function saveJson(data: any, filename = "output.json") {
	const filePath = path.join(process.cwd(), "public", filename);
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
