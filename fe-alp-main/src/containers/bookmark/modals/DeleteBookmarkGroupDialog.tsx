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

import { Dispatch, SetStateAction } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import Dialog from "@/components/modals/Dialog";
import useUpdateData from "@/hooks/queries/useMutateData";

interface DeleteBookmarkGroupDialogProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	selectedGroup: BookmarkGroup | null;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function DeleteBookmarkGroupDialog({
	open,
	setOpen,
	selectedGroup,
	refetch,
}: DeleteBookmarkGroupDialogProps) {
	const { useDeleteBookmarkGroup } = useUpdateData();
	const { mutate } = useDeleteBookmarkGroup();

	if (!selectedGroup) return null;

	const handleDeleteGroup = () => {
		mutate(selectedGroup.groupId, {
			onSuccess: (res) => {
				if (res.ok) {
					refetch();
					setOpen(false);
				}
			},
			onError: (e: any) => {
				// console.log(e);
			},
		});
	};
	return (
		<Dialog
			type="confirm"
			open={open}
			setOpen={setOpen}
			title="북마크 폴더 삭제"
			text="선택한 폴더를 삭제하시겠습니까?"
			subText="한번 삭제한 폴더는 다시 복구할 수 없습니다."
			onYes={() => {
				handleDeleteGroup();
			}}
			onNo={() => {
				setOpen(false);
			}}
		/>
	);
}
