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
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getChartIcon } from "@/utils/chartUtils";
import IconMenu from "@images/menu.svg";

interface BookmarkedDataListProps {
	bookmarkedData: BookmarkGroupData[] | null;
	setBookmarkedData: Dispatch<SetStateAction<BookmarkGroupData[]>>;
}

export default function BookmarkedDataList({
	bookmarkedData,
	setBookmarkedData,
}: BookmarkedDataListProps) {
	const handleOnDragEnd = (result: DropResult) => {
		if (!bookmarkedData) return;

		const { destination, source } = result;
		if (!destination) return; // 드래그 취소된 경우

		// 순서 변경
		const updatedItems = Array.from(bookmarkedData);
		const [reorderedItem] = updatedItems.splice(source.index, 1);
		updatedItems.splice(destination.index, 0, reorderedItem);

		setBookmarkedData(updatedItems);
	};

	if (!bookmarkedData || bookmarkedData.length === 0) return null;

	return (
		<>
			<div className="mb-1 flex items-center gap-2">
				<h4 className="font-semibold">순서편집</h4>
				<span className="text-xs text-textGray">북마크 {bookmarkedData.length}개</span>
			</div>
			<DragDropContext onDragEnd={handleOnDragEnd}>
				<Droppable droppableId="droppable-list">
					{(provided) => (
						<ul
							{...provided.droppableProps}
							ref={provided.innerRef}
							className="custom-scrollbar mb-4 flex max-h-[400px] flex-col gap-2 overflow-y-auto pr-3" // 스크롤을 여기에서만 처리
						>
							{bookmarkedData.map((item, index) => {
								const ChartIcon = getChartIcon(item.chartName);
								return (
									<Draggable key={item.dataId} draggableId={item.dataId} index={index}>
										{(provided) => (
											<li
												ref={provided.innerRef}
												{...provided.draggableProps}
												className="flex items-center justify-between gap-4"
											>
												<div className="flex w-full items-center gap-2 rounded-lg border border-boxGray bg-white p-3 text-sm font-semibold">
													<ChartIcon />
													{item.dataTitle}
												</div>
												<div className="cursor-grab" {...provided.dragHandleProps}>
													<IconMenu />
												</div>
											</li>
										)}
									</Draggable>
								);
							})}
							{provided.placeholder}
						</ul>
					)}
				</Droppable>
			</DragDropContext>
		</>
	);
}
