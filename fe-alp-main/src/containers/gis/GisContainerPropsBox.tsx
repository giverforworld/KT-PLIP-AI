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

"use client"

import { useEffect, useState } from "react";
import GISContainerBox from "./GisContainerBox";
import useGetData from "@/hooks/queries/useGetData";

export default function GISContainerPropsBox() {
    const { useDataInfoQuery } = useGetData();
    const { data: dataInfo, isLoading } = useDataInfoQuery();
    const [ startEnd, setStartEnd ] = useState<[{START: string, END: string}]>();

    useEffect(() => {
        if (dataInfo) {
            setStartEnd(dataInfo.data.data);
        }
    }, [dataInfo]);

    return startEnd && <GISContainerBox startEnd={startEnd} />; 

}