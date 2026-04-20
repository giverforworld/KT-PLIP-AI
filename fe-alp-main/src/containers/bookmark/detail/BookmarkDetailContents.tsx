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

import { usePathname } from "next/navigation";
import Link from "next/link";
import HelperText from "@/components/text/HelperText";
import IconBookmarkOn from "@images/bookmark_on.svg";
import DataContainer from "@/containers/common/data/DataContainer";
import { useBookmarkDataStore } from "@/store/bookmarkData";

export default function BookmarkDetailContents() {
	const pathname = usePathname();
	const bookmarkData = useBookmarkDataStore((s) => s.bookmarkData);

	// useEffect(() => {
	// 	console.log("BookmarkDetailContents resetBookmarkGroup pathname=");
	// 	console.log(pathname);
	// 	resetBookmark();
	// }, [pathname, resetBookmark]);
	if (!bookmarkData) return null;
	// TO-BE-CHECKED 원래 isReport true였음
	// <DataContainer data={bookmarkData.data} isReport={true} />;
	return (
		<div className="mx-auto w-9/12 max-w-[1280px] grow py-6">
			{bookmarkData.data.length === 0 ? (
				<div className="flex h-full w-full items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="text-textGray">
							<IconBookmarkOn width={40} height={40} />
						</div>
						<p className="text-center">
							등록된 북마크가 없습니다.
							<br />
							분석된 데이터의 [북마크] 아이콘을 눌러 데이터를 저장하세요.
						</p>
						<div className="mt-6 flex w-full flex-col items-center gap-6 border-t py-6">
							<p className="font-semibold text-primary">분석된 데이터 보러가기</p>
							<ul className="flex items-center gap-8">
								<Link href={`/mop`}>
									<li className="rounded-3xl border border-primary bg-primary-light px-8 py-2 font-semibold text-primary">
										생활이동
									</li>
								</Link>
								<Link href={`/alp`}>
									<li className="rounded-3xl border border-primary bg-primary-light px-8 py-2 font-semibold text-primary">
										생활인구
									</li>
								</Link>
								<Link href={`/llp`}>
									<li className="rounded-3xl border border-primary bg-primary-light px-8 py-2 font-semibold text-primary">
										체류인구
									</li>
								</Link>
							</ul>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					<HelperText text="북마크 아이콘을 눌러 북마크를 삭제하거나 다른 폴더에 추가할 수 있습니다." />
					<DataContainer data={bookmarkData.data} isReport={false} />
				</div>
			)}
		</div>
	);
}
