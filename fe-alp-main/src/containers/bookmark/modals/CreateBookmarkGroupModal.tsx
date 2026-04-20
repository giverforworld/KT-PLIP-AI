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
import CreateGroupFormContainer from "../forms/CreateGroupFormContainer";

interface CreateBookmarkGroupModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	userId: string;
	groupLength: number;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function CreateBookmarkGroupModal({
	open,
	setOpen,
	userId,
	groupLength,
	refetch,
}: CreateBookmarkGroupModalProps) {
	return (
		<BaseModal open={open} setOpen={setOpen} title="새 폴더 만들기" width="w-auto">
			<CreateGroupFormContainer
				userId={userId}
				groupLength={groupLength}
				setOpenCreateGroupModal={setOpen}
				refetch={refetch}
			/>
		</BaseModal>
	);
}
