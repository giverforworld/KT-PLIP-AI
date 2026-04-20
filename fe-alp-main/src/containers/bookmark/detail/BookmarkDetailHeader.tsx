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

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useUser from "@/hooks/queries/useUser";
import useGetData from "@/hooks/queries/useGetData";
import Breadcrumb from "@/components/navigation/BreadCrumb";
import ButtonGroup from "@/components/buttons/ButtonGroup";
import BaseButton from "@/components/buttons/BaseButton";
import Spinner from "@/components/loading/Spinner";
import IconEditFolder from "@images/editFolder.svg";
import IconPrint from "@images/print.svg";
import EditBookmarkGroupModal from "../modals/EditBookmarkGroupModal";
import { ExportReportToPdf } from "@/utils/dataExport";
import { user } from "@/constants/dummy/user";
import { useBookmarkGroupStore } from "@/store/bookmarkGroup";
import { useBookmarkDataStore } from "@/store/bookmarkData";

export default function BookmarkDetailHeader() {
	const { id } = useParams();
	const groupId = Array.isArray(id) ? id[0] : id;

	const { useUserQuery } = useUser();
	const { data: user } = useUserQuery();
	const userId = user?.userId;
	// const userId = user.userId;
	const { useBookmarkGroupQueryById } = useGetData();
	const {
		data: bookmarkDataById,
		isLoading,
		refetch,
	} = useBookmarkGroupQueryById(userId!, groupId!);
	const [openEditGroupModal, setOpenEditGroupModal] = useState(false);

	const bookmarkGroup = useBookmarkGroupStore((s) => s.bookmarkGroup);
	const setBookmarkGroup = useBookmarkGroupStore((s) => s.setBookmarkGroup);
	const resetBookmarkGroup = useBookmarkGroupStore((s) => s.resetBookmarkGroup);

	const bookmarkData = useBookmarkDataStore((s) => s.bookmarkData);
	const setBookmarkData = useBookmarkDataStore((s) => s.setBookmarkData);
	const resetBookmarkData = useBookmarkDataStore((s) => s.resetBookmarkData);

	useEffect(() => {
		// cleanup 함수 - 페이지 떠날 때 실행
		return ()=>{
			resetBookmarkGroup();
			resetBookmarkData();
		}
	}, []); //마운트/언마운트 시에만
	useEffect(() => {
		resetBookmarkGroup();
		resetBookmarkData();
	}, [groupId]);
	useEffect(() => {
		if (bookmarkDataById) {
			setBookmarkData(bookmarkDataById);
			const data = bookmarkDataById.data.map((item) => {
				return {
					order: item.order,
					dataId: item.dataId,
					dataTitle: item.title,
					chartName: item.charts[0].name,
					_id: item._id,
				};
			});
			setBookmarkGroup({
				groupId: bookmarkDataById.groupId,
				groupName: bookmarkDataById.groupName,
				description: bookmarkDataById.description,
				data: data,
			});
		}
		// if (
		// 	bookmarkDataById &&
		// 	(!bookmarkGroup || bookmarkGroup?.data.length !== bookmarkData?.data.length)
		// ) {

		// }
	}, [bookmarkDataById]);

	//데이터 변동 있을때 다시 refetch
	useEffect(() => {
		if (bookmarkDataById && !bookmarkData) {
			refetch();
		}
	}, [bookmarkData]);

	if (isLoading || !bookmarkDataById || !bookmarkGroup)
		return (
			<div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center">
				<Spinner />
				<p className="p-4 text-center">
					북마크 불러오는 중입니다.
					<br /> 잠시만 기다려 주세요.
				</p>
			</div>
		);

	if (userId)
		return (
			<div className="mx-auto w-9/12 max-w-[1280px] py-6">
				<Breadcrumb bookmarkGroup={bookmarkGroup} />
				<div className="flex items-end justify-between">
					<div id="report-title" className="flex w-full flex-col gap-2">
						<h2 className="text-3xl font-semibold">{bookmarkGroup.groupName}</h2>
						<p className="text-textGray">{bookmarkGroup.description}</p>
					</div>
					<div className="shrink-0">
						<ButtonGroup>
							{bookmarkGroup.groupName !== "임시보관함" && (
								<BaseButton
									title="폴더 편집"
									color="gray"
									Icon={IconEditFolder}
									onClick={() => setOpenEditGroupModal(true)}
								/>
							)}
							<BaseButton
								title="출력하기"
								color="black"
								Icon={IconPrint}
								onClick={() => ExportReportToPdf("북마크_" + bookmarkGroup.groupName)}
							/>
						</ButtonGroup>
					</div>
				</div>
				<EditBookmarkGroupModal
					open={openEditGroupModal}
					setOpen={setOpenEditGroupModal}
					userId={userId}
					selectedGroup={bookmarkGroup}
					refetch={refetch}
				/>
			</div>
		);
}
