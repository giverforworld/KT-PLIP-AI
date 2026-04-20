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

import { PATHS } from "./path";

export interface MenuItem {
	name: string;
	path: string;
	alpAuthCd?: AlpAuthCd[];
	subMenu?: MenuItem[];
	isShow?: boolean;
}

export const menuList: MenuItem[] = [
	{
		name: "종합현황분석",
		path: PATHS.DAS,
		alpAuthCd: ["2", "3", "4"],
	},
	{
		name: "북마크 관리",
		path: PATHS.BOOKMARK,
		alpAuthCd: ["2", "3"],
		isShow: false,
	},
	{
		name: "GIS분석",
		path: PATHS.GIS,
		alpAuthCd: ["2", "3"],
		subMenu: [
			{
				name: "생활이동",
				path: "MOP",
			},
			{
				name: "생활인구",
				path: "ALP",
			},
			{
				name: "체류인구",
				path: "LLP",
				subMenu: [
					{
						name: "유입인구분석",
						path: "INFLOW",
					},
					{
						name: "인구감소지역 비교",
						path: "DCRS",
					},
				],
			},
			{
				name: "유동인구",
				path: "FLP",
			},
		],
	},
	{
		name: "생활이동",
		path: PATHS.MOP,
		alpAuthCd: ["2", "3"],
		subMenu: [
			{
				name: "생활이동현황",
				path: PATHS.STATUS,
			},
			{
				name: "이동목적분석",
				path: PATHS.PURPOSE,
			},
			{
				name: "이동수단분석",
				path: PATHS.TRANS,
			},
			{
				name: "랭킹분석",
				path: PATHS.RANK_ANALYSIS,
				alpAuthCd: ["2"],
			},
		],
	},
	{
		name: "생활인구",
		path: PATHS.ALP,
		alpAuthCd: ["2", "3"],
		subMenu: [
			{
				name: "생활인구현황",
				path: PATHS.STATUS,
			},
			{
				name: "생활패턴분석",
				path: PATHS.PATTERN,
			},
			{
				name: "주민/생활 비교분석",
				path: PATHS.COMP_ANALYSIS,
			},
			{
				name: "랭킹분석",
				path: PATHS.RANK_ANALYSIS,
				alpAuthCd: ["2"],
			},
		],
	},
	{
		name: "체류인구",
		path: PATHS.LLP,
		alpAuthCd: ["2", "3"],
		subMenu: [
			{
				name: "체류인구현황",
				path: PATHS.STATUS,
			},
			{
				name: "체류인구특성",
				path: PATHS.TRAITS,
			},
			{
				name: "랭킹분석",
				path: PATHS.RANK_ANALYSIS,
				alpAuthCd: ["2"],
			},
		],
	},
];

// 회원 등급에 따른 메뉴 표출
export const filterMenuByMembershipLevel = (
	menu: MenuItem[],
	userMembershipLevel: AlpAuthCd | undefined,
): MenuItem[] | undefined => {
	return userMembershipLevel
		? menu
				.filter((item) => {
					if (item.isShow === false) return false;
					return true;
					// if (!item.alpAuthCd || item.alpAuthCd.length === 0) return true;
					// return item.alpAuthCd.includes(userMembershipLevel);
				})
				.map((item) => ({
					...item,
					subMenu: item.subMenu
						? item.subMenu.filter((subItem) => {
								if (subItem.isShow === false) return false;
								if (!subItem.alpAuthCd || subItem.alpAuthCd.length === 0) return true;
								return subItem.alpAuthCd.includes(userMembershipLevel);
							})
						: undefined,
				}))
		: undefined;
};
