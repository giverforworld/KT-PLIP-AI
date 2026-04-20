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

import { basePath } from "@/constants/path";
import { useQuery } from "@tanstack/react-query";

export default function useMapData() {
	const useTopoJson = () =>
		useQuery({
			queryKey: ["topoJson"],
			queryFn: () =>
				fetch(`${basePath}/api/gis/map`)
					.then((res) => res.json())
					.then((json) => json.result),
		});

	const useSggGeoJson = () =>
		useQuery({
			queryKey: ["sggGeoJson"],
			queryFn: () =>
				fetch(`${basePath}/api/gis/map?name=sggGeo`)
					.then((res) => res.json())
					.then((json) => json.result),
		});
	return { useTopoJson, useSggGeoJson };
}
