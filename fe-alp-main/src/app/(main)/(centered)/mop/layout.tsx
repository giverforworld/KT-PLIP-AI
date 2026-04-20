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

import SearchContainer from "@/containers/common/search/SearchContainer";

export default function MopLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<SearchContainer />
			<div className="mx-auto w-9/12 max-w-[1280px] grow py-6">{children}</div>
		</>
	);
}
