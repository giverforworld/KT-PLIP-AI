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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUser, logout } from "@/services/user";
import { loginUrl } from "@/constants/path";

export default function useUser() {
	/**
	 * 현재 유저의 세션 데이터 가져오기
	 */
	const useUserQuery = () =>
		useQuery({
			queryKey: ["user"],
			queryFn: () => getUser(),
		});

	/**
	 * 로그아웃
	 */
	const useLogout = () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (url: string) => logout(url),
			onSuccess: (data) => {
				if (data.ok) {
					alert("로그아웃 처리되었습니다.");
					queryClient.setQueryData(["user"], null);
					window.location.href = data.url;
				} else {
					console.error("Logout failed:", data.message || "Unknown error");
				}
			},
			onError: (error) => {
				console.error("An error occurred during logout:", error);
			},
		});
	};

	return { useUserQuery, useLogout };
}
