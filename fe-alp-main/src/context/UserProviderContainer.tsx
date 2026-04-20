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

import useUser from "@/hooks/queries/useUser";
import * as React from "react";

interface UserProviderContainerProps {
	children: React.ReactNode;
}

interface UserProviderContextProps {
	user: User | null;
}

export const UserContext = React.createContext<UserProviderContextProps | null>(null);

export default function UserProviderContainer({ children }: UserProviderContainerProps) {
	const { useUserQuery } = useUser();
	const { data: user, isLoading: isLoadingUser } = useUserQuery();

	if (isLoadingUser) {
		// console.log("isLoadingUser null");
		return <></>;
	}

	return <UserContext.Provider value={{ user: user || null }}>{children}</UserContext.Provider>;
}
