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

import InputWrapper from "@/components/forms/InputWrapper";
import IconPlus from "@images/plus.svg";

interface RegionAddButtonProps {
	onClick: () => void;
}

export default function RegionAddButton({ onClick }: Readonly<RegionAddButtonProps>) {
	return (
		<div className="flex">
			<InputWrapper label="" name="">
				<button
					className="flex h-full w-full items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-black"
					onClick={onClick}
				>
					<IconPlus />
					<span>비교지역추가</span>
				</button>
			</InputWrapper>
		</div>
	);
}
