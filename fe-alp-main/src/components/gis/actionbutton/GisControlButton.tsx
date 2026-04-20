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

interface GisControlButtonProps {
	fullWidth?: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	isActive?: boolean;
}

export default function GisControlButton({
	fullWidth,
	onClick,
	icon,
	label,
	isActive,
}: Readonly<GisControlButtonProps>) {
	return (
		<button
			className={`${fullWidth ? "w-full" : ""} relative z-10 flex h-fit w-fit min-w-24 items-center justify-start break-keep rounded-md border p-2 text-sm font-semibold ${
				isActive
					? "border-primary bg-primary-light text-primary"
					: "bg-white/80 text-black backdrop-blur-[80px]"
			}`}
			onClick={onClick}
		>
			<span className="mr-2">{icon}</span> {label}
		</button>
	);
}
