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

"use client";

import { usePathname } from "next/navigation";
import AccordionBox from "@/components/boxes/AccordionBox";
import MopGuide from "../guide/MopGuide";
import AlpGuide from "../guide/AlpGuide";
import LlpGuide from "../guide/LlpGuide";
import { extractPageInfo } from "@/utils/validate";

export type GuideProps = {
	title: string;
	children?: React.ReactNode;
	Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
};

export default function GuideList() {
	const pathname = usePathname();
	const { pageName } = extractPageInfo(pathname);

	const getGuide = (type: string) => {
		switch (type) {
			case "mop":
				return <MopGuide />;
			case "alp":
				return <AlpGuide />;
			case "llp":
				return <LlpGuide />;
		}
	};

	return <div className="flex flex-col overflow-hidden">{getGuide(pageName)}</div>;
}

export const GuideListWrapper = ({ title, Icon, children }: GuideProps) => {
	return (
		<li>
			<AccordionBox title={title} bgColor="bg-white" border={false} Icon={Icon}>
				<div className="mt-4 border-t pt-4 leading-7 text-textGray">{children}</div>
			</AccordionBox>
		</li>
	);
};
