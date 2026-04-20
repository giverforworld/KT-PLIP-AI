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

import TabMenu from "@/components/navigation/TabMenu";
import Drawer from "@/components/drawer/Drawer";
import AssistButtonGroup from "@/containers/common/data/AssistButtonGroup";

export default async function CenteredLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="custom-scrollbar flex grow flex-col overflow-y-auto">
			<div className="m-auto w-9/12 max-w-[1280px]">
				<TabMenu />
			</div>

			<div className="grow">{children}</div>

			<AssistButtonGroup />
			<Drawer />
		</main>
	);
}
