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

import { useSetRecoilState } from "recoil";
import { generateUniqueId } from "@/utils/generate";
import { useRef } from "react";
import { useToastStore } from "@/store/toast";

export const useShowToast = () => {
	const setToasts = useToastStore((s)=>s.addToast)
	const toastTracker = useRef<{[key:string]:boolean}>({});

	return (
		message: string,
		type: ToastType,
		position: ToastPosition = "middle",
		callback?: () => void,
	) => {
		if(toastTracker.current[message]){
			return;
		}
		toastTracker.current[message] = true;

		const id = generateUniqueId();
		setToasts({ id, message, type, position, callback });

		setTimeout(()=>{
			delete toastTracker.current[message];
		},3000);
	};
};
