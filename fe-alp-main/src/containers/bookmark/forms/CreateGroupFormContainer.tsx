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

import { Dispatch, SetStateAction, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import useUpdateData from "@/hooks/queries/useMutateData";
import BaseButton from "@/components/buttons/BaseButton";
import CreateGroupForm from "./CreateGroupForm";
import { convertToFormData } from "@/utils/form";
import { dateFormat } from "@/utils/date";
import { bookmarkSchema } from "@/utils/yupSchema";

interface CreateGroupFormContainerProps {
	userId: string;
	groupLength: number;
	setOpenCreateGroupModal: Dispatch<SetStateAction<boolean>>;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

interface CreateGroupFormInputs {
	groupName: string;
	description?: string;
}

export default function CreateGroupFormContainer({
	userId,
	groupLength,
	setOpenCreateGroupModal,
	refetch,
}: CreateGroupFormContainerProps) {
	const initialGroupName = dateFormat(new Date(), "yyyy.MM.dd HH:mm");
	const methods = useForm<CreateGroupFormInputs>({
		resolver: yupResolver(bookmarkSchema),
		defaultValues: { groupName: initialGroupName },
		mode: "onChange",
	});
	const { useCreateBookmarkGroup } = useUpdateData();
	const { mutate } = useCreateBookmarkGroup();

	const [isDisabled, setIsDisabled] = useState(false);

	const onSubmit = (data: CreateGroupFormInputs) => {
		setIsDisabled(true);
		const formData = convertToFormData(data);
		mutate(formData, {
			onSuccess: (res) => {
				if (res.ok) {
					refetch();
					setOpenCreateGroupModal(false);
					methods.reset(); // 폼 초기화하여 버튼
				}
			},
			onError: (e: any) => {
				// console.log(e);
			},
			onSettled: () => {
				setIsDisabled(false);
			},
		});
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="w-[400px]">
				<CreateGroupForm />
				<BaseButton
					type="submit"
					title="완료하기"
					fullWidth
					disabled={!methods.formState.isValid || isDisabled}
				/>
			</form>
		</FormProvider>
	);
}
