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

import { useEffect, useState } from "react";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import Link from "next/link";
import IconClock from "@images/clock.svg";
import IconEdit from "@images/edit.svg";
import IconTrash from "@images/trash.svg";
import EditBookmarkGroupModal from "./modals/EditBookmarkGroupModal";
import DeleteBookmarkGroupDialog from "./modals/DeleteBookmarkGroupDialog";
import { useBookmarkGroupStore } from "@/store/bookmarkGroup";

interface BookmarkGroupListProps {
	userId: string;
	bookmarkGroupList: BookmarkGroupList | undefined;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function BookmarkGroupList({
	userId,
	bookmarkGroupList,
	refetch,
}: BookmarkGroupListProps) {
	const [openEditGroupModal, setOpenEditGroupModal] = useState(false);
	const [openDeleteGroupModal, setOpenDeleteGroupModal] = useState(false);

	const selectedGroup = useBookmarkGroupStore(s=>s.bookmarkGroup);
	const setSelectedGroup = useBookmarkGroupStore((s) => s.setBookmarkGroup);
	// const resetBookmark = useBookmarkGroupStore(s=>s.resetBookmarkGroup);
	// useEffect(() => {
	// 	resetBookmark();
	// }, [selectedGroup, resetBookmark]);

	// 북마크 편집 됐을때 북마크 데이터 새로 호출
	useEffect(() => {
		if (selectedGroup) refetch();
	}, [selectedGroup]);
	const column = [
		{ name: "폴더명", width: "w-3/12", align: "justify-left" },
		{ name: "폴더 설명", width: "w-5/12", align: "justify-left" },
		{ name: "북마크 수", width: "w-2/12", align: "justify-center" },
		{ name: "편집", width: "w-1/12", align: "justify-center" },
		{ name: "삭제", width: "w-1/12", align: "justify-center" },
	];

	return (
		<>
			<ul className="flex flex-col gap-4">
				<li className="justify-betwee flex px-4">
					{column.map((item, index) => (
						<div
							key={index}
							className={`${column[index].width} ${column[index].align} flex items-center font-semibold text-textGray`}
						>
							{item.name}
						</div>
					))}
				</li>
				{bookmarkGroupList?.data.map((item, itemIndex) => {
					return (
						<Link
							key={item.groupId}
							href={`/bookmark/${item.groupId}`}
							onClick={() => {
								setSelectedGroup(item);
							}}
						>
							<li className="flex h-[70px] cursor-pointer items-center justify-between rounded-lg border border-extraLightGray bg-white px-4 shadow-sm">
								{column.map((_, columnIndex) => {
									return (
										<div
											key={columnIndex}
											className={`${column[columnIndex].width} ${column[columnIndex].align} flex items-center`}
										>
											{columnIndex === 0 && (
												<div className="flex items-center gap-3">
													{item.groupName === "임시보관함" ? (
														<IconClock />
													) : (
														<span className="h-[24px] w-[24px] rounded-md bg-tabGray text-center font-semibold leading-[24px]">
															{itemIndex}
														</span>
													)}
													<span className="font-semibold">{item.groupName}</span>
												</div>
											)}
											{columnIndex === 1 && <span>{item.description}</span>}
											{columnIndex === 2 && <span>{item.data.length}개</span>}
											{columnIndex === 3 && item.groupName !== "임시보관함" && (
												<IconWrapper
													onClick={(e) => {
														e.preventDefault();
														setSelectedGroup(item);
														setOpenEditGroupModal(true);
													}}
												>
													<IconEdit />
												</IconWrapper>
											)}
											{columnIndex === 4 && item.groupName !== "임시보관함" && (
												<IconWrapper
													onClick={(e) => {
														e.preventDefault();
														setSelectedGroup(item);
														setOpenDeleteGroupModal(true);
													}}
												>
													<IconTrash />
												</IconWrapper>
											)}
										</div>
									);
								})}
							</li>
						</Link>
					);
				})}
			</ul>

			{/* 북마크 편집 팝업 */}
			<EditBookmarkGroupModal
				open={openEditGroupModal}
				setOpen={setOpenEditGroupModal}
				userId={userId}
				selectedGroup={selectedGroup}
				refetch={refetch}
			/>

			{/* 북마크 폴더 삭제 팝업 */}
			<DeleteBookmarkGroupDialog
				open={openDeleteGroupModal}
				setOpen={setOpenDeleteGroupModal}
				selectedGroup={selectedGroup}
				refetch={refetch}
			/>
		</>
	);
}

const IconWrapper = ({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: (e: React.MouseEvent<HTMLElement>) => void;
}) => {
	return (
		<button className="rounded-lg border-2 border-[#f1f1f1] bg-[#fcfcfc] p-1.5" onClick={onClick}>
			{children}
		</button>
	);
};
