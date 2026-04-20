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

import { useFormContext } from "react-hook-form";
import BaseInput from "@/components/forms/BaseInput";
import BaseTextarea from "@/components/forms/BaseTextarea";

export default function EditGroupForm() {
	const {
		register,
		formState: { errors },
		trigger,
	} = useFormContext();

	return (
		<>
			<BaseInput
				type="text"
				placeholder="폴더명을 입력해주세요."
				label="폴더명"
				name="groupName"
				register={register}
				errors={errors}
				trigger={trigger}
			/>
			<BaseTextarea
				placeholder="폴더 설명을 입력해주세요."
				label="폴더 설명"
				name="description"
				register={register}
				errors={errors}
				trigger={trigger}
			/>
		</>
	);
}
