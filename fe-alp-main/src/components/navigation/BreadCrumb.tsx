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

import { useParams, usePathname } from "next/navigation";
import { PATHS } from "@/constants/path";
import { menuList } from "@/constants/menu";
import Link from "next/link";
import IconArrow from "@images/arrow.svg";

/**
 * Breadcrumb
 * 마지막 링크를 제외한 다른 링크들은 고정된 경로, 마지막 항목만 뒤로 가기 방식으로 이동
 * 북마크 관리에서 개별 북마크 페이지 일 경우에는 해당 북마크 폴더명 표출
 * @returns {React.JSX.Element}
 */

interface BreadcrumbProps {
	bookmarkGroup?: BookmarkGroup;
}
export default function Breadcrumb({ bookmarkGroup }: BreadcrumbProps) {
	const params = useParams();
	const { id } = params || {};
	const pathname = usePathname();
	const pathnames = pathname.split("/").slice(1);
	const das = menuList.find((menu) => menu.path === PATHS.DAS);

	return (
		<ul className="mb-4 flex items-center gap-1">
			{/* 북마크 페이지의 경우 맨 앞에 대시보드 링크 추가 */}
			{pathnames[0] === PATHS.BOOKMARK && (
				<li className="flex items-center">
					<Link href={`/${das?.path}`}>
						<span className="text-textLightGray">{das?.name}</span>
					</Link>
					<IconArrow className="rotate-90 text-textLightGray" />
				</li>
			)}

			{pathnames.map((pathname, index) => {
				const menu = menuList.find((menu) => menu.path === pathname);
				const href = `/${menu?.path}`;
				const name = menu?.name || bookmarkGroup?.groupName || id;

				return (
					<li key={pathname} className="flex items-center">
						{index === pathnames.length - 2 ? (
							<span
								onClick={() => window.history.back()}
								className="cursor-pointer text-textLightGray"
							>
								{name}
							</span>
						) : menu ? (
							<Link href={href}>
								<span
									className={
										index === pathnames.length - 1
											? "text-lg font-semibold text-primary"
											: "text-textLightGray"
									}
								>
									{name}
								</span>
							</Link>
						) : (
							<span
								className={
									index === pathnames.length - 1
										? "text-lg font-semibold text-primary"
										: "text-textLightGray"
								}
							>
								{name}
							</span>
						)}
						{index < pathnames.length - 1 && <IconArrow className="rotate-90 text-textLightGray" />}
					</li>
				);
			})}
		</ul>
	);
}
