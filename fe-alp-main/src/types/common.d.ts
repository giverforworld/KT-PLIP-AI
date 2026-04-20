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

type Region = {
	sido: { name: string; code: string };
	sgg: { name: string; code: string };
	adm: { name: string; code: string };
};

type RegionInfo = {
	name: string;
	sidoCode: string;
	sidoName?: string;
	center: number[];
	sggCode?: string;
	sggName?: string;
	admCode?: string;
	admName?: string;
};

type SidoInfo = {
	name: string;
	sidoCode: string;
	sidoName: string;
	center: number[];
};

// 종합현황 대시보드
type DashboardResult = {
	info: DashboardInfoData[];
	data: DataContainer[];
};

type DashboardMapTabKey = "alp" | "llp" | "mopInflow" | "mopOutflow";
type DashboardInfoData = {
	sidoCode: string;
	data: {
		key: DashboardMapTabKey;
		value: number;
		prevMonthComparison: number;
		prevYearComparison: number;
	}[];
};

// 지역별 대시보드
type RegDasResult = {
	data: DataGroup[];
};

type RegDashboardMapStatus = {
	depth: number;
	currentRegionCode: number;
	defaultRegionCode: number;
};

// 리포트
type ReportResult = {
	regionName: string;
	summary: ReportSummary[];
	mop: DataContainer[];
	alp: DataContainer[];
	llp: DataContainer[];
};

type ReportSummary = {
	title: string;
	data: {
		name: string;
		data: string;
	}[];
};

// 북마크
type BookmarkGroupList = {
	// userId: string;
	data: BookmarkGroup[];
};
type BookmarkGroup = {
	groupId: string;
	groupName: string;
	description: string;
	data: BookmarkGroupData[];
};
type BookmarkGroupData = {
	order: number;
	dataId: string;
	dataTitle: string;
	chartName: string;
	_id?: string;
};

type BookmarkDataList = {
	userId: string;
	data: BookmarkData[];
};
type BookmarkData = {
	groupId: string;
	groupName: string;
	description: string;
	data: BookmarkDataCharts[];
};
type BookmarkDataCharts = DataContainer & {
	dataId: string;
	order: number;
};
type BookmarkParams = {
	groupIds: string[];
	page: string;
	subPage: string;
	options: CommonSearchQueryParams | MopSearchQueryParams | MopFlowSearchQueryParams;
	order?: number;
	dataId: string;
	data?: DataContainer;
};
type DeleteBookmarkData = {
	bookmarkData: BookmarkParams;
	bookmarkGroupList: BookmarkGroupList;
};
type MoveBookmarkParams = {
	bookmarkData: BookmarkParams;
	checkedGroupIds: string[];
	bookmarkGroupList: BookmarkGroupList;
};

type Filter = {
	key?: string;
	category: string;
	labels: string[];
};

type RankFilterToggle = {
	move: MoveFilterType | null;
	date: DateFilterType | null;
	age: AgeFilterType | null;
};

//zustand

type Toast = {
	id: string;
	message: string;
	type: ToastType;
	position: ToastPosition;
	callback?: () => void;
};
type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition = "right" | "middle";
type ToastStore = {
	toasts: Toast[];
	addToast: (toast: Toast) => void;
	removeToast: (id: string) => void;
	clear: () => void;
};
type Theme = "light" | "dark";
type ThemeState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	initTheme: () => void;
}