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
import Checkbox from "@/components/forms/Checkbox";
import { useShowToast } from "@/hooks/useToastShow";

interface BookmarkPopupGroupListProps {
	bookmarkGroupList: BookmarkGroupList | undefined;
	checkedGroupIds: string[];
	setCheckedGroupIds: Dispatch<SetStateAction<string[]>>;
}

export default function BookmarkPopupGroupList({
	bookmarkGroupList,
	checkedGroupIds,
	setCheckedGroupIds,
}: BookmarkPopupGroupListProps) {
	const showToast = useShowToast();

	const handleCheckbox = (groupId: string) => {
		const isCheckedId = checkedGroupIds.some((id) => id === groupId);

		const dataLength =
			bookmarkGroupList?.data.find((item) => item.groupId === groupId)?.data.length ?? 0;
		if (!isCheckedId && dataLength >= 20)
			showToast("북마크는 최대 20개까지 생성 가능합니다.", "warning", "middle");
		else
			setCheckedGroupIds((currentIds) => {
				if (isCheckedId) {
					return currentIds.filter((id) => id !== groupId);
				} else {
					return [...currentIds, groupId];
				}
			});
	};

	return (
		<ul className="mb-5 mt-4 flex w-[400px] flex-col items-center gap-2">
			{bookmarkGroupList?.data.map((item) => {
				const checked = checkedGroupIds.some((id) => id === item.groupId);
				return (
					<li
						key={item.groupId}
						className={`flex w-full cursor-pointer select-none justify-between rounded-lg border p-3 ${checked ? "border-primary bg-primary-light hover:bg-primary-light" : "border-boxGray hover:bg-whiteGray"} `}
						onClick={() => handleCheckbox(item.groupId)}
					>
						<span>
							<Checkbox
								id={item.groupId}
								label={item.groupName}
								checked={checked}
								// onChange={() => handleCheckbox(item.groupId)}
							/>
						</span>
						<span className="text-sm">{item.data.length}개 지표</span>
					</li>
				);
			})}
		</ul>
	);
}
