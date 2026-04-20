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

interface RegionAddRaaButtonProps {
	onClick: () => void;
	isInflowRaa: boolean;
}

export default function RegionAddRaaButton({
	onClick,
	isInflowRaa,
}: Readonly<RegionAddRaaButtonProps>) {
	return (
		<div className="flex h-[48px]">
			<button
				className="flex h-full w-full items-center justify-center text-gray-400 hover:border-gray-400 hover:text-black"
				onClick={onClick}
			>
				<span>+ {isInflowRaa ? "출발" : "도착"}지역추가 (최대 4개)</span>
			</button>
		</div>
	);
}
