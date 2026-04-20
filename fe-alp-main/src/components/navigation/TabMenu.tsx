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
import * as React from "react";
import { usePathname } from "next/navigation";
import { menuList } from "@/constants/menu";
import Tab from "../tabs/Tab";
import TabItem from "../tabs/TabItem";
import { useShowToast } from "@/hooks/useToastShow";
import { UserContext } from "@/context/UserProviderContainer";

export default function TabMenu() {
	const pathname = usePathname();
	const rootRoute = pathname.split("/")[1];
	const endRoute = pathname.split("/").pop();

	const context = React.useContext(UserContext);
	if (!context) {
		throw new Error("GIScontainer must be used within a UserProderContainer");
	}
	const { user } = context;

	const showToast = useShowToast();

	const handleLinkByAuth = () => {
		showToast("프리미엄 회원만 이용 가능합니다", "info");
	};
	const subMenu = menuList.find((menu) => menu.path === rootRoute)?.subMenu;
	if (!subMenu || subMenu?.length === 0) return null;
	return (
		<div className="py-4">
			<Tab>
				{user &&
					subMenu?.map((sub) => {
						const hasAccess = user && !(sub.alpAuthCd && !sub.alpAuthCd.includes(user.alpAuthCd));
						const href = hasAccess ? `/${rootRoute}/${sub.path}` : "#";
						const isActive = hasAccess && sub.path === endRoute ? true : false;
						const handleClick = hasAccess ? undefined : handleLinkByAuth;
						return (
							<TabItem
								key={sub.path}
								href={href}
								isActive={isActive}
								scroll={false}
								onClick={handleClick}
							>
								{sub.name}
							</TabItem>
						);
					})}
			</Tab>
		</div>
	);
}
