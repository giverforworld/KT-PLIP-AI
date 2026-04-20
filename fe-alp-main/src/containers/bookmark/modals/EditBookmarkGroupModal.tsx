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
import BaseModal from "@/components/modals/BaseModal";
import EditGroupFormContainer from "../forms/EditGroupFormContainer";

interface EditBookmarkGroupModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	userId: string;
	selectedGroup: BookmarkGroup | null;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function EditBookmarkGroupModal({
	open,
	setOpen,
	userId,
	selectedGroup,
	refetch,
}: EditBookmarkGroupModalProps) {
	return (
		<BaseModal open={open} setOpen={setOpen} title="북마크 편집하기" width="w-auto" scroll={false}>
			<EditGroupFormContainer
				userId={userId}
				selectedGroup={selectedGroup}
				setOpenEditGroupModal={setOpen}
				refetch={refetch}
			/>
		</BaseModal>
	);
}
