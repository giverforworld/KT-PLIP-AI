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

import { useMutation } from "@tanstack/react-query";
import {
	createBookmark,
	createBookmarkGroup,
	deleteBookmark,
	deleteBookmarkGroup,
	moveBookmark,
	updateBookmarkGroup,
} from "@/services/mutateData";

/**
 * @returns {useMutation}
 */
export default function useUpdateData() {
	const useCreateBookmarkGroup = () => {
		return useMutation({
			mutationFn: (formData: FormData) => createBookmarkGroup(formData),
		});
	};

	const useUpdateBookmarkGroup = (groupId?: string) => {
		return useMutation({
			mutationFn: (formData: FormData) => {
				if(!groupId){
					return Promise.reject("groupId is required");
				}
				return updateBookmarkGroup(groupId, formData);
			},
		});
	};

	const useDeleteBookmarkGroup = () => {
		return useMutation({
			mutationFn: (groupId: string) => deleteBookmarkGroup(groupId),
		});
	};
	const useCreateBookmark = () => {
		return useMutation({
			mutationFn: (bookmarkData: BookmarkParams) => createBookmark(bookmarkData),
		});
	};
	const useDeleteBookmark = () => {
		return useMutation({
			mutationFn: (deleteBookmarkData: DeleteBookmarkData) => deleteBookmark(deleteBookmarkData),
		});
	};
	const useMoveBookmark = () => {
		return useMutation({
			mutationFn: (moveBookmarkData: MoveBookmarkParams) => moveBookmark(moveBookmarkData),
		});
	};
	return {
		useCreateBookmarkGroup,
		useUpdateBookmarkGroup,
		useDeleteBookmarkGroup,
		useCreateBookmark,
		useDeleteBookmark,
		useMoveBookmark,
	};
}
