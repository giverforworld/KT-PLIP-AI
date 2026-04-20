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

"use client";

import { useState } from "react";
import useUser from "@/hooks/queries/useUser";
import useGetData from "@/hooks/queries/useGetData";
import Breadcrumb from "@/components/navigation/BreadCrumb";
import BaseButton from "@/components/buttons/BaseButton";
import Spinner from "@/components/loading/Spinner";
import IconPlus from "@images/plus.svg";
import BookmarkGroupList from "./BookmarkGroupList";
import CreateBookmarkGroupModal from "./modals/CreateBookmarkGroupModal";
import { user } from "@/constants/dummy/user";
import { useShowToast } from "@/hooks/useToastShow";

export default function BookmarkContents() {
	const { useUserQuery } = useUser();
	const { data: user } = useUserQuery();
	const userId = user?.userId;
	// const userId = user.userId;

	const { useBookmarkGroupListQuery } = useGetData();
	const { data: bookmarkGroupList, isLoading, refetch } = useBookmarkGroupListQuery();
	const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);

	const showToast = useShowToast();

	const createHandle = () => {
		if (bookmarkGroupList && bookmarkGroupList.data.length > 5) {
			showToast("북마크는 최대 5개까지 생성 가능합니다", "info");
		} else setOpenCreateGroupModal(true);
	};

	if (isLoading)
		return (
			<div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-whiteGray">
				<Spinner />
				<p className="p-4 text-center">
					북마크 불러오는 중입니다.
					<br /> 잠시만 기다려 주세요.
				</p>
			</div>
		);
	if (userId)
		return (
			<div className="custom-scrollbar h-full overflow-y-auto bg-whiteGray">
				<div className="mx-auto w-9/12 max-w-[1280px] grow py-6">
					<Breadcrumb />
					<div className="mb-8 flex items-center justify-between">
						<h3 className="text-3xl font-semibold">북마크 관리</h3>
						<BaseButton
							title="새 폴더 만들기"
							color="semiblack"
							Icon={IconPlus}
							onClick={() => createHandle()}
						/>
					</div>
					<BookmarkGroupList
						userId={userId}
						bookmarkGroupList={bookmarkGroupList}
						refetch={refetch}
					/>

					<CreateBookmarkGroupModal
						open={openCreateGroupModal}
						setOpen={setOpenCreateGroupModal}
						userId={userId}
						groupLength={bookmarkGroupList?.data.length ?? 0}
						refetch={refetch}
					/>
				</div>
			</div>
		);
}
