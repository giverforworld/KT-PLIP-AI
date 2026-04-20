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

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import useUpdateData from "@/hooks/queries/useMutateData";
import BaseButton from "@/components/buttons/BaseButton";
import EditGroupForm from "./EditGroupForm";
import BookmarkedDataList from "../BookmarkedDataList";
import { convertToFormData } from "@/utils/form";
import { bookmarkSchema } from "@/utils/yupSchema";
import { useShowToast } from "@/hooks/useToastShow";

interface EditGroupFormContainerProps {
	userId: string;
	selectedGroup: BookmarkGroup | null;
	setOpenEditGroupModal: Dispatch<SetStateAction<boolean>>;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

interface EditGroupFormInputs {
	groupName: string;
	description?: string;
}

export default function EditGroupFormContainer({
	userId,
	selectedGroup,
	setOpenEditGroupModal,
	refetch,
}: EditGroupFormContainerProps) {
	const [bookmarkedData, setBookmarkedData] = useState<BookmarkGroupData[]>(
		selectedGroup?.data ?? [],
	);

	const methods = useForm<EditGroupFormInputs>({
		resolver: yupResolver(bookmarkSchema),
		defaultValues: {
			groupName: selectedGroup?.groupName,
			description: selectedGroup?.description,
		},
		mode: "onChange",
	});
	const showToast = useShowToast();

	const { useUpdateBookmarkGroup } = useUpdateData();
	// const { mutate } = selectedGroup?.groupId
	// 	? // eslint-disable-next-line react-hooks/rules-of-hooks
	// 		useUpdateBookmarkGroup(selectedGroup?.groupId)
	// 	: { mutate: () => {} };
	const {mutate} = useUpdateBookmarkGroup(selectedGroup?.groupId ?? "");

	useEffect(() => {
		if (selectedGroup) setBookmarkedData(selectedGroup.data);
	}, [selectedGroup]);

	const onSubmit = (data: EditGroupFormInputs) => {
		// 원래 북마크 selectedGroup.data -> 순서변경된 북마크 bookmarkedData 비교해서 변경된 항목만 찾기
		if(!selectedGroup?.groupId) return;
		const updatedItems = getUpdatedOrderList(selectedGroup!.data, bookmarkedData);

		const formData = convertToFormData({ ...data, data: updatedItems });
		mutate(formData, {
			onSuccess: (res) => {
				if (res.ok) {
					refetch();
					setOpenEditGroupModal(false);
				}
			},
			onError: (e: any) => {
				// console.log(e);
				showToast("북마크 편집에 문제가 발생했습니다. 다시 시도해주세요.", "error", "middle");
			},
		});
	};

	const getUpdatedOrderList = (original: BookmarkGroupData[], updated: BookmarkGroupData[]) => {
		const updatedItems: BookmarkGroupData[] = [];
		updated.forEach((item, newIndex) => {
			const originalItem = original.find((org) => org.dataId === item.dataId);

			//원래 데이터와 order 값이 다르면 업데이트 리스트에 추가
			if (!originalItem || originalItem.order !== newIndex) {
				updatedItems.push({ ...item, order: newIndex });
			}
		});
		return updatedItems;
	};
	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className="w-[450px]">
				<EditGroupForm />
				<BookmarkedDataList bookmarkedData={bookmarkedData} setBookmarkedData={setBookmarkedData} />
				<BaseButton
					type="submit"
					title="완료하기"
					fullWidth
					disabled={!methods.formState.isValid || methods.formState.isSubmitting}
				/>
			</form>
		</FormProvider>
	);
}
