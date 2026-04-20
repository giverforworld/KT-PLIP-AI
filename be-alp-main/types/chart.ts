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

const chart = [
  {
    title: "대분류",
    data: [
      {
        title: "차트제목",
        summary: "차트요약",
        charts: [
          //BaseChartData | MergedChartData
          /* 
                    {
                        regionName?: string;
                        name: string;
                        indicate: Record<string, string | number>[];
                    }
                    {
                        name: string;
                        data: { 
                                regionName: string; 
                                indicate: Record<string, string | number>[] 
                            }[];
                    }         
                    */
          {
            regionName: "지역명 - 단일 차트일 경우",
            name: "차트ID값",
            indicate: [
              //차트 데이터 - 라인차트, 바차트
              { 구분: "x축", "y축(생활인구)": "값" },
              { 구분: "x축", y축: "값" },
            ],
          },
        ],
      },
      {
        title: "차트제목",
        summary: "차트요약",
        charts: [
          //평균, 누적, 유니크 있을 경우 OR 한 블럭 내에 두개 차트 OR N개 차트
          {
            regionName: "지역명 - 단일 차트일 경우 or 비교지역 N개 차트",
            name: "차트ID값",
            indicate: [
              //차트 데이터
              { 구분: "x축", y축key: "값" },
              { 구분: "x축", y축key: "값" },
            ],
          },
          {
            regionName: "지역명 - 단일 차트일 경우",
            name: "차트ID값",
            indicate: [
              //차트 데이터
              { 구분: "x축", y축: "값" },
              { 구분: "x축", y축: "값" },
            ],
          },
        ],
      },
      {
        title: "그룹라인 차트제목",
        summary: "차트요약",
        charts: [
          {
            name: "차트ID값",
            indicate: [
              //차트 데이터
              { 구분: "x축", "y축범례1(지역명)": "값", y축범례2: "값" },
              { 구분: "x축", y축범례1: "값", y축범례2: "값" },
            ],
          },
        ],
      },
      {
        title: "그룹 바 차트제목",
        summary: "차트요약",
        charts: [
          {
            name: "차트ID값",
            indicate: [
              //차트 데이터
              { 구분: "x축(지역명)그룹", y축범례1: "값", y축범례2: "값" },
              { 구분: "x축(지역명)그룹", y축범례1: "값", y축범례2: "값" },
            ],
          },
        ],
      },
      {
        title: "스택 바 차트제목",
        summary: "차트요약",
        charts: [
          {
            name: "차트ID값",
            indicate: [
              //차트 데이터
              { 구분: "x축", "y축범례1(스택값1)": "값", y축범례2: "값" },
              { 구분: "x축", y축범례1: "값", y축범례2: "값" },
            ],
          },
        ],
      },
      {
        title: "그룹스택 바 차트제목",
        summary: "차트요약",
        charts: [
          {
            name: "차트ID값",
            data: [
              {
                regionName: "지역명",
                indicate: [
                  //차트 데이터
                  {
                    구분: "x축(바이름-평일)",
                    "y축범례1(스택값1)": "값",
                    y축범례2: "값",
                  },
                  {
                    구분: "x축(바이름-휴일)",
                    y축범례1: "값",
                    y축범례2: "값",
                  },
                ],
              },
              {
                regionName: "지역명",
                indicate: [
                  //차트 데이터
                  { 구분: "x축", "y축범례1(스택값1)": "값", y축범례2: "값" },
                  { 구분: "x축", y축범례1: "값", y축범례2: "값" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
