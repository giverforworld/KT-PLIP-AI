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
import IconAddFolder from "@images/addFolder.svg";
import IconTrash from "@images/trash.svg";
import { usePathname } from "next/navigation";
import { extractPageInfo } from "@/utils/validate";
import { PATHS } from "@/constants/path";

interface BookmarkDropdownProps {
	setOpenMyBookmarkModal: Dispatch<SetStateAction<boolean>>;
	setOpenDeleteBookmarkModal: Dispatch<SetStateAction<boolean>>;
}

export default function BookmarkDropdown({
	setOpenMyBookmarkModal,
	setOpenDeleteBookmarkModal,
}: BookmarkDropdownProps) {
	const pathname = usePathname();
	const { pageName, subPageName } = extractPageInfo(pathname);
	const dropdownList = [
		{
			text: "현재 폴더에서 북마크 삭제",
			Icon: IconTrash,
			onClick: () => setOpenDeleteBookmarkModal(true),
		},
		{ text: "다른 폴더에 담기", Icon: IconAddFolder, onClick: () => setOpenMyBookmarkModal(true) },
	];

	return (
		<div className="absolute right-0 z-20 rounded-lg border bg-white shadow-xl">
			<ul>
				{dropdownList.map((item, index) => (
					<li
						key={index}
						className="flex cursor-pointer items-center gap-2 p-3 hover:bg-whiteGray"
						onClick={item.onClick}
					>
						<item.Icon />
						<span className="mr-2 whitespace-nowrap text-sm">{item.text}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
