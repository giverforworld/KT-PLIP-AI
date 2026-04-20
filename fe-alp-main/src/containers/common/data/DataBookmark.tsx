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

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PATHS } from "@/constants/path";
import { useShowToast } from "@/hooks/useToastShow";
import useUser from "@/hooks/queries/useUser";
import useGetData from "@/hooks/queries/useGetData";
import SquareButton from "@/components/buttons/SquareButton";
import IconBookmark from "@images/bookmark.svg";
import IconBookmarkOn from "@images/bookmark_on.svg";

import BookmarkDropdown from "@/containers/common/data/BookmarkDropdown";
import MyBookmarkGroupModal from "@/containers/bookmark/modals/MyBookmarkGroupModal";
import DeleteBookmarkDialog from "@/containers/bookmark/modals/DeleteBookmarkDialog";
import useUpdateData from "@/hooks/queries/useMutateData";
import {
	generateMopFlowSearchQueryParams,
	generateMopSearchQueryParams,
	generateSearchQueryParams,
} from "@/utils/generate";
import { extractPageInfo } from "@/utils/validate";
import { useSearchFilterStore } from "@/store/searchFilter";
import { useSearchResultStore } from "@/store/searchResult";
import { useQueryClient } from "@tanstack/react-query";

interface DataBookmarkProps {
	data: DataContainer;
}

export default function DataBookmark({ data }: DataBookmarkProps) {
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);
	const searchFilter = useSearchFilterStore((s) => s.filter);

	const { useUserQuery } = useUser();
	const { data: user } = useUserQuery();
	const userId = user?.userId;
	// const userId = user.userId;

	const { useBookmarkGroupListQuery } = useGetData();
	const { data: bookmarkGroupList, refetch } = useBookmarkGroupListQuery();
	const [openBookmarkDropdown, setOpenBoomarkDropdown] = useState(false);
	const [openMyBookmarkModal, setOpenMyBookmarkModal] = useState(false);
	const [openDeleteBookmarkModal, setOpenDeleteBookmarkModal] = useState(false);

	// 최신 북마크 상태 유지 위해 useQuery 캐시 직접 수정
	const queryClient = useQueryClient();
	const searchResult = useSearchResultStore((s) => s.searchResult);

	//북마크 완료되면 아이콘 변경해서 보이게
	const [updatedData, setUpdatedData] = useState<DataContainer>({
		...data,
		isBookmarked: pageName === PATHS.BOOKMARK ? true : data.isBookmarked,
	});

	useEffect(() => {
		if (data) {
			setUpdatedData({
				...data,
				isBookmarked: pageName === PATHS.BOOKMARK ? true : data.isBookmarked,
			});
		}
	}, [data]);
	let searchQueryParams =
		pageName === PATHS.MOP
			? searchFilter.isFlow
				? generateMopFlowSearchQueryParams(searchFilter, pathname)
				: generateMopSearchQueryParams(searchFilter, pathname)
			: generateSearchQueryParams(searchFilter);

	const showToast = useShowToast();

	const { useCreateBookmark } = useUpdateData();
	const { mutate } = useCreateBookmark();

	const handleBookmark = () => {
		if (pageName === PATHS.BOOKMARK || updatedData.isBookmarked) {
			setOpenBoomarkDropdown((prev) => !prev);
		} else if (
			bookmarkGroupList?.data.find((group) => group.groupId === "group-01") !== undefined &&
			bookmarkGroupList?.data.find((group) => group.groupId === "group-01")!.data.length >= 20
		) {
			showToast("북마크는 최대 20개까지 생성 가능합니다.", "warning", "middle");
		} else {
			const dataId = data.id + "-" + Date.now();
			const newData: BookmarkParams = {
				groupIds: ["group-01"],
				page: pageName,
				subPage: subPageName,
				options: searchQueryParams,
				order:
					bookmarkGroupList?.data.find((group) => group.groupId === "group-01") !== undefined
						? bookmarkGroupList.data.find((group) => group.groupId === "group-01")!.data.length
						: 0,
				dataId: dataId,
				data: data,
			};
			//TO_BE_CHECKED: mutate;
			mutate(newData, {
				onSuccess: (res) => {
					if (res.ok) {
						refetch();
						showToast("임시보관함에 담았습니다.", "success", "middle", () =>
							setOpenMyBookmarkModal(true),
						);
						const newGroups = data.bookmarkedGroupIds
							? [...data.bookmarkedGroupIds, "group-01"]
							: ["group-01"];
						// setUpdatedData({
						// 	...data,
						// 	isBookmarked: true,
						// 	dataId: dataId,
						// 	bookmarkedGroupIds: newGroups,
						// });

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
										return chart.id === newData.dataId.split("-")[0]
											? {
													...chart,
													dataId: newData.dataId,
													isBookmarked: true,
													bookmarkedGroupIds: newGroups,
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
						// setOpenMyBookmarkModal(false);
					}
				},
				onError: (e: any) => {
					// console.log(e);
					showToast("북마크 생성에 문제가 발생했습니다. 다시 시도해주세요.", "error", "middle");
				},
			});
		}
	};
	if (userId)
		return (
			<div className="relative">
				<SquareButton
					Icon={updatedData.isBookmarked ? IconBookmarkOn : IconBookmark}
					className={
						updatedData.isBookmarked
							? "border-none bg-primary-light text-primary hover:bg-primary-light"
							: ""
					}
					ariaLabel="북마크"
					onClick={handleBookmark}
				/>

				{openBookmarkDropdown && (
					<BookmarkDropdown
						setOpenMyBookmarkModal={setOpenMyBookmarkModal}
						setOpenDeleteBookmarkModal={setOpenDeleteBookmarkModal}
					/>
				)}

				<MyBookmarkGroupModal
					open={openMyBookmarkModal}
					setOpen={setOpenMyBookmarkModal}
					setDropdown={setOpenBoomarkDropdown}
					bookmarkGroupList={bookmarkGroupList}
					selectedData={updatedData}
					searchQueryParams={searchQueryParams}
					setUpdatedData={setUpdatedData}
					userId={userId}
					refetch={refetch}
				/>
				<DeleteBookmarkDialog
					open={openDeleteBookmarkModal}
					setOpen={setOpenDeleteBookmarkModal}
					setDropdown={setOpenBoomarkDropdown}
					bookmarkGroupList={bookmarkGroupList}
					selectedData={updatedData}
					searchQueryParams={searchQueryParams}
					setUpdatedData={setUpdatedData}
					refetch={refetch}
				/>
			</div>
		);
}
