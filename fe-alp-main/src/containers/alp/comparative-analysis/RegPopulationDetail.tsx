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

import RoundedBox from "@/components/boxes/RoundedBox";
import DataGroup from "@/containers/common/data/DataGroup";
import RegPopulationSummary from "./RegPopulationSummary";
import _ from "lodash";

interface RegPopulationDetailProps {
	data: any;
	textData: any;
}

export default function RegPopulationDetail({ data, textData }: RegPopulationDetailProps) {
	let dataGroup: any = [];
	const dataArr = _.cloneDeep(data);
	dataArr[3].charts.push(data[4].charts[0]);
	dataArr[2].summary = dataArr[2].summary[0];
	dataArr[3].summary = [dataArr[3].summary[0], dataArr[4].summary[0]];
	dataArr.pop();

	dataArr.map((item:any) => {
		dataGroup.push({title: item.title, data: [item]})
	})
	return (
		<div className="flex flex-col gap-4">
			<RoundedBox border>
				<RegPopulationSummary data={textData} />
			</RoundedBox>
			{dataGroup.map((datas:any, index:any) => (
				<DataGroup key={index} data={datas} />
			))}
		</div>
	);
}
