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

import HelperText, { helperTextList } from "@/components/text/HelperText";

interface ContentHeaderProps {
	title: string;
	textAlign?: "text-left" | "text-center";
}

/**
 * 검은색 배경의 타이틀 헤더
 * @param {ContentHeaderProps} ContentHeaderProps
 * @returns {React.JSX.Element} div
 */
export default function ContentHeader({ title, textAlign = "text-left" }: ContentHeaderProps) {
	return (
		<>
			<div className="relative flex items-center gap-3 rounded-md bg-blackSecondary px-3 py-2">
				<h2 className={`w-full text-xl text-white ${textAlign}`}>{title}</h2>
			</div>
			{helperTextList[title] && <HelperText text={helperTextList[title]} />}
		</>
	);
}
