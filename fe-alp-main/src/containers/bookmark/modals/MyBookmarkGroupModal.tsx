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
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import TextButton from "@/components/buttons/TextButton";
import BaseModal from "@/components/modals/BaseModal";
import BookmarkPopupGroupList from "../BookmarkPopupGroupList";
import BaseButton from "@/components/buttons/BaseButton";
import IconPlus from "@images/plus.svg";
import CreateBookmarkGroupModal from "@/containers/bookmark/modals/CreateBookmarkGroupModal";
import { useShowToast } from "@/hooks/useToastShow";
import useUpdateData from "@/hooks/queries/useMutateData";
import { usePathname } from "next/navigation";
import { extractPageInfo } from "@/utils/validate";
import { PATHS } from "@/constants/path";
import { useBookmarkDataStore } from "@/store/bookmarkData";
import { useSearchResultStore } from "@/store/searchResult";

interface MyBookmarkGroupModalProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setDropdown: Dispatch<SetStateAction<boolean>>;
	bookmarkGroupList: BookmarkGroupList | undefined;
	selectedData: DataContainer;
	searchQueryParams: CommonSearchQueryParams | MopSearchQueryParams | MopFlowSearchQueryParams;
	setUpdatedData: Dispatch<SetStateAction<DataContainer>>;
	userId: string;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function MyBookmarkGroupModal({
	open,
	setOpen,
	setDropdown,
	bookmarkGroupList,
	selectedData,
	searchQueryParams,
	setUpdatedData,
	userId,
	refetch,
}: MyBookmarkGroupModalProps) {
	const [openCreateGroupModal, setOpenCreateGroupModal] = useState(false);
	const [checkedGroupIds, setCheckedGroupIds] = useState<string[]>([]);

	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);
	const resetBookmark = useBookmarkDataStore((s) => s.resetBookmarkData);
	const queryClient = useQueryClient();
	const searchResult = useSearchResultStore((s) => s.searchResult);	

	const showToast = useShowToast();

	const createHandle = () => {
		if (bookmarkGroupList && bookmarkGroupList.data.length > 5) {
			showToast("북마크는 최대 5개까지 생성 가능합니다", "info");
		} else setOpenCreateGroupModal(true);
	};
	const { useMoveBookmark } = useUpdateData();
	const { mutate } = useMoveBookmark();
	const handleClick = () => {
		if (checkedGroupIds.length === 0)
			showToast("북마크 폴더를 하나 이상 선택해주세요.", "error", "middle");
		else {
			// mutate: 북마크 폴더 이동 로직
			setOpen(false);
			// 북마크 페이지에는 searchQueryParams 데이터 없음
			let newData: BookmarkParams;
			if (pageName !== PATHS.BOOKMARK)
				newData = {
					groupIds: selectedData.bookmarkedGroupIds!,
					page: pageName,
					subPage: subPageName,
					options: searchQueryParams,
					order:
						bookmarkGroupList?.data.find((group) => group.groupId === "group-01") !== undefined
							? bookmarkGroupList.data.find((group) => group.groupId === "group-01")!.data.length -
								1
							: 0,
					dataId: selectedData.dataId!,
					data: selectedData,
				};
			else {
				const groupIds: string[] = [];
				bookmarkGroupList!.data.forEach((group) =>
					group.data.forEach((chart) => {
						if (chart.dataId === selectedData.dataId) groupIds.push(group.groupId);
					}),
				);
				newData = {
					groupIds: groupIds,
					page: pageName,
					subPage: subPageName,
					options: selectedData.options!,
					dataId: selectedData.dataId!,
					data: { ...selectedData, bookmarkedGroupIds: groupIds },
				};
			}
			//TO_BE_CHECKED: mutate;
			mutate(
				{
					bookmarkData: newData,
					checkedGroupIds: checkedGroupIds,
					bookmarkGroupList: bookmarkGroupList!,
				},
				{
					onSuccess: (res) => {
						if (res.ok) {
							refetch();
							const isDeleted = newData.groupIds.filter(
								(id) => !checkedGroupIds.includes(id)
							)
							// 
							if (pageName === PATHS.BOOKMARK) {
								if (isDeleted.length > 0 && isDeleted.includes(selectedData.bookmarkedGroupIds![0]) ) {
									resetBookmark();
								}
							}
							// queryClient.removeQueries({ queryKey: ["bookmarkGroupData", userId] });
							if (pageName !== PATHS.BOOKMARK) {
								// useQuery 캐시 직접 수정
								queryClient.setQueryData(
									[
										"searchResult",
										searchResult.queryState.searchQueryParams,
										searchResult.queryState.pathname,
									],
									(oldData: SearchResult) => {
										const updated = oldData.dataGroups.map((dataGroup) => ({
											...dataGroup,
											data: dataGroup.data.map((chart) => {
												// chartId 매칭 확인
												return chart.dataId === newData.dataId
													? {
															...chart,
															isBookmarked: true,
															bookmarkedGroupIds: checkedGroupIds,
														}
													: chart;
											}),
										}));
										return {
											...oldData,
											dataGroups: updated,
										};
									},
								);
								// setUpdatedData({ ...selectedData, bookmarkedGroupIds: checkedGroupIds });
							}
							setOpen(false);
							setDropdown(false);
						}
					},
					onError: (e: any) => {
						showToast("북마크 이동에 문제가 발생했습니다. 다시 시도해주세요.", "error", "middle");
					},
				},
			);
		}
	};

	useEffect(() => {
		if (selectedData.bookmarkedGroupIds && bookmarkGroupList) {
			// 해당 북마크가 포함된 북마크 그룹Ids
			/* 북마크 폴더 페이지에서는 selectedData.bookmarkedGroupIds는 해당 북마크 폴더만 있음
				-> 해당 북마크가 포함된 북마크 그룹 Ids를 groupList에서 찾아야 함

				지표 페이지에서는 해당 북마크가 포함된 정보가 selectedData.bookmarkedGroupIds에 있음
			*/
			if (pageName === PATHS.BOOKMARK) {
				const groupIds: string[] = [];
				bookmarkGroupList.data.forEach((group) =>
					group.data.forEach((chart) => {
						if (chart.dataId === selectedData.dataId) groupIds.push(group.groupId);
					}),
				);

				setCheckedGroupIds(groupIds);
			} else {
				setCheckedGroupIds(selectedData.bookmarkedGroupIds);
			}
		}
	}, [selectedData, bookmarkGroupList]);

	return (
		<>
			<BaseModal open={open} setOpen={setOpen} title="내 북마크" width="w-auto">
				<TextButton title="새 폴더 만들기" Icon={IconPlus} onClick={() => createHandle()} />
				<BookmarkPopupGroupList
					bookmarkGroupList={bookmarkGroupList}
					checkedGroupIds={checkedGroupIds}
					setCheckedGroupIds={setCheckedGroupIds}
				/>
				<BaseButton type="submit" title="완료하기" fullWidth onClick={handleClick} />
			</BaseModal>

			<CreateBookmarkGroupModal
				open={openCreateGroupModal}
				setOpen={setOpenCreateGroupModal}
				userId={userId}
				groupLength={bookmarkGroupList?.data.length ?? 0}
				refetch={refetch}
			/>
		</>
	);
}
