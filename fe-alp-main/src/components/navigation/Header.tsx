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
import { useEffect, useState, useContext } from "react";
import { filterMenuByMembershipLevel, menuList } from "@/constants/menu";
import { basePath, PATHS } from "@/constants/path";
import useUser from "@/hooks/queries/useUser";
import Link from "next/link";
import Logo from "../logo/Logo";
import IconLogout from "@images/logout.svg";
import { useShowToast } from "@/hooks/useToastShow";
import { UserContext } from "@/context/UserProviderContainer";
import axios from "axios";

export default function Header() {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("Header must be used within a UserProderContainer");
	}
	const { user } = context;
	// const { userId, alpAuthCd } = user;

	const { useLogout } = useUser();
	const { mutate, isPending } = useLogout();

	// const filteredMenuList = filterMenuByMembershipLevel(menuList, user?.alpAuthCd);

	const [mainEl, setMainEl] = useState<HTMLElement | null>(null);

	const handleLogout = async () => {
		const { data } = await axios.get(`${basePath}/api/auth/url-map`);
		// console.log("hadle log out response ---> ", data);
		if (data.ok) mutate(data.url.bdipUrl);
	};

	const showToast = useShowToast();

	const handleLinkByAuth = () => {
		showToast("스탠다드, 프리미엄 회원만 이용 가능합니다", "info");
	};

	useEffect(() => {
		const mainElement = document.querySelector("main");
		setMainEl(mainElement);
	}, []);

	// useEffect(() => {
	// 	if ((!isLoading || !isFetching) && mainEl) {
	// 		mainEl.scrollTo(0, 0);
	// 	}
	// }, [isLoading, isFetching, mainEl]);

	return (
		<header className="flex flex-col border-b border-stroke px-[50px] py-4">
			{/* 프로필 정보 */}
			{user && (
				<div className="flex items-end justify-center gap-1 self-end">
					<span className="text-sm">
						<strong>{user.userId}</strong>님
					</span>
					<button onClick={() => handleLogout()} disabled={isPending}>
						<IconLogout />
					</button>
				</div>
			)}

			<div className="flex items-center justify-between">
				{/* Navigation */}
				<nav className="flex items-center gap-6">
					<Link href={`/${PATHS.DAS}`}>
						<Logo />
					</Link>

					{/* 구매 상품에 따른 메뉴 표출 */}
					<ul className="flex h-full items-center">
						{menuList
							.filter((item) => {
								if (item.isShow === false) return false;
								return true;
							})
							.map((menu) => (
								<li key={menu.path}>
									{user && menu.alpAuthCd?.includes(user.alpAuthCd) ? (
										<Link
											href={`/${menu.path}`}
											className={`flex h-full w-full items-center justify-center px-5 py-4 text-xl font-semibold ${
												menu.path === rootRoute ||
												(rootRoute === PATHS.BOOKMARK && menu.path === PATHS.DAS)
													? "text-primary"
													: ""
											}`}
										>
											{menu.name}
										</Link>
									) : (
										<button
											className={`flex h-full w-full items-center justify-center px-5 py-4 text-xl font-semibold ${
												menu.path === rootRoute ||
												(rootRoute === PATHS.BOOKMARK && menu.path === PATHS.DAS)
													? "text-primary"
													: ""
											}`}
											onClick={handleLinkByAuth}
										>
											{menu.name}
										</button>
									)}
								</li>
							))}
					</ul>
				</nav>
			</div>
		</header>
	);
}
