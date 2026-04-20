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

import type { Metadata } from "next";
import QueryProvider from "@/context/QueryProvider";
import { basePath } from "@/constants/path";
import RouterLogger from "@/components/log/RouterLogger"
import "@/styles/globals.css";
import Toast from "@/components/modals/Toast";

export const metadata: Metadata = {
	title: "생활이동분석솔루션",
	description: "생활이동분석솔루션",
	// TO_BE_CHECKED favicon
	icons: {
		icon: `${basePath}/images/logo/KT_favicon.ico`,
	},
	openGraph: {
		title: "생활이동분석솔루션",
		description: "생활이동분석솔루션",
		// siteName: "",
		// url: "https://",
		images: { url: `${basePath}/images/logo/logo_plip.png`, alt: "생활이동분석솔루션" },
		type: "website",
		locale: "kr_KR",
	},
	// keywords: [],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="kr_KR">
			<body className="flex h-[100vh] w-full flex-col overflow-hidden font-pretendard text-black">
					<RouterLogger />
					<QueryProvider>{children}</QueryProvider>
					<Toast/>
			</body>
		</html>
	);
}
