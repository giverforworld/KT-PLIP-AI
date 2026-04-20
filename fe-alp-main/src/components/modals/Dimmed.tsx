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

interface DimmedProps {
	children: React.ReactNode;
}

export default function Dimmed({ children }: DimmedProps) {
	return (
		<div className="fixed inset-0 left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black bg-opacity-50">
			{children}
		</div>
	);
}
