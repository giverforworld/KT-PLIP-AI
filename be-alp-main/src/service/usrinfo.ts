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

import client from "@/config/opensearchClient"

export async function usrinfoLoadToOpenSearch(logData: any) {
    const { BASE_YMD } = logData;

    if (!BASE_YMD) {
        throw new Error("Missing 'BASE_YMD' field")
    }

    try {
        const response = await client.index({
            index: "page_loads_alp",
            body: {
                ...logData
            }
        });
    } catch (error) {
        console.error("Failed:", (error as Error).message);
        throw error;
    }
}