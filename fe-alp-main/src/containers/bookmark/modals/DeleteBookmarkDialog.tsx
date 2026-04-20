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
import { QueryObserverResult, RefetchOptions, useQueryClient } from "@tanstack/react-query";
import Dialog from "@/components/modals/Dialog";
import useUpdateData from "@/hooks/queries/useMutateData";
import { usePathname } from "next/navigation";
import { extractPageInfo } from "@/utils/validate";
import { useShowToast } from "@/hooks/useToastShow";
import { PATHS } from "@/constants/path";
import { useBookmarkDataStore } from "@/store/bookmarkData";
import { useSearchResultStore } from "@/store/searchResult";

interface DeleteBookmarkDialogProps {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	setDropdown: Dispatch<SetStateAction<boolean>>;
	bookmarkGroupList: BookmarkGroupList | undefined;
	selectedData: DataContainer;
	searchQueryParams: CommonSearchQueryParams | MopSearchQueryParams | MopFlowSearchQueryParams;
	setUpdatedData: Dispatch<SetStateAction<DataContainer>>;
	refetch: (options?: RefetchOptions) => Promise<QueryObserverResult>;
}

export default function DeleteBookmarkDialog({
	open,
	setOpen,
	setDropdown,
	bookmarkGroupList,
	selectedData,
	searchQueryParams,
	setUpdatedData,
	refetch,
}: DeleteBookmarkDialogProps) {
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);
	const resetBookmark = useBookmarkDataStore((s) => s.resetBookmarkData);
	const queryClient = useQueryClient();
    const searchResult = useSearchResultStore((s) => s.searchResult);
	const showToast = useShowToast();

	const { useDeleteBookmark } = useUpdateData();
	const { mutate } = useDeleteBookmark();

	const handleDeleteBookmark = () => {
		let groupIds = selectedData.bookmarkedGroupIds || [];
		// 북마크 관리의 특정 북마크 페이지일 경우에 해당 북마크id에 해당하는 북마크만 삭제
		if (groupIds.length === 0 && pageName === PATHS.BOOKMARK) {
			groupIds = [subPageName];
		}
		// TO_BE_CHECKED: mutate
		const data: BookmarkParams = {
			groupIds: groupIds,
			page: pageName,
			subPage: subPageName,
			options: searchQueryParams,
			dataId: selectedData.dataId!,
		};
		mutate(
			{ bookmarkData: data, bookmarkGroupList: bookmarkGroupList! },
			{
				onSuccess: (res) => {
					if (res.ok) {
						refetch();
						delete selectedData.dataId;
						delete selectedData.bookmarkedGroupIds;

						// setUpdatedData({ ...selectedData, isBookmarked: false });
						setOpen(false);
						setDropdown(false);
						if (pageName === PATHS.BOOKMARK) resetBookmark();
						else {
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
											if (chart.id === selectedData.id)
											{
												delete chart.dataId;
												delete chart.bookmarkedGroupIds;
												return {
													...chart,
													isBookmarked: false,
													bookmarkedGroupIds: [],
												};
											}
											else return chart;
										}),
									}));
									return {
										...oldData,
										dataGroups: updated,
									};
								},
							);
						}
					}
				},
				onError: (e: any) => {
					showToast("북마크 삭제에 문제가 발생했습니다. 다시 시도해주세요.", "error", "middle");
				},
			},
		);
	};
	return (
		<Dialog
			type="confirm"
			open={open}
			setOpen={setOpen}
			title="북마크 삭제"
			text="선택한 북마크를 현재 폴더에서 삭제하시겠습니까?"
			subText="한번 삭제한 북마크는 다시 복구할 수 없습니다."
			onYes={() => {
				handleDeleteBookmark();
			}}
			onNo={() => {
				setOpen(false);
			}}
		/>
	);
}
