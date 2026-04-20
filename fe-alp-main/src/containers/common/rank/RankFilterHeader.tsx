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

import ButtonGroup from "@/components/buttons/ButtonGroup";
import BaseButton from "@/components/buttons/BaseButton";
import HelperText from "@/components/text/HelperText";
import IconReset from "@images/reset.svg";

interface RankFilterHeaderProps {
	resetFilter: () => void;
	applyFilter: () => void;
}

export default function RankFilterHeader({ resetFilter, applyFilter }: RankFilterHeaderProps) {
	return (
		<h3 className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<span className="font-semibold">필터 설정</span>
				<HelperText text="항목을 선택하지 않으면 전체에 대한 분석이 제공됩니다." />
			</div>
			<ButtonGroup>
				<BaseButton title="초기화" color="outlined" Icon={IconReset} onClick={resetFilter} />
				<BaseButton title="적용하기" onClick={applyFilter} />
			</ButtonGroup>
		</h3>
	);
}
