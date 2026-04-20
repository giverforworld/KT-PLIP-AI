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

type GisAlpParams = {
  regionArray: string[];
  start: string;
  end: string;
  gender: number;
  ageArray: number[];
  timeznArray: number[];
  patterns?: string[];
};
type GisAlpGridParams = {
  regionArray: string[];
  start: string;
  end: string;
  gender: number;
  ageArray: number[];
  timeznArray: number[];
};
type GisAlpChartParams = {
  regionArray: string[];
  start: string;
  end: string;
  gender: number;
  ageArray: number[];
  patterns?: string[];
};
type GisLlpParams = {
  start: string;
  end: string;
  // dayArray: number[];
  gender: number;
  ageArray: number[];
  isIn: number;
  region?: string;
};
type GisMopParams = {
  spaceType: number;
  regionArray: string[];
  start: string;
  end: string;
  timeznArray: number[];
  isPurpose: boolean;
  gender: number;
  ageArray: number[];
  isInflow?: boolean;
};
type GisMopTimeParams = {
  spaceType: number;
  regionArray: string[];
  start: string;
  end: string;
  isPurpose: boolean;
  gender: number;
  ageArray: number[];
  isInflow?: boolean;
};
type GisMopGridParams = {
  spaceType: number;
  regionArray: string[];
  start: string;
  end: string;
  // dayArray: number[];
  timeznArray: number[];
  isPurpose: boolean;
  gender: number; 
  ageArray: number[];
  isInflow?: boolean;
};
type GisMopChartParams = {
  regionArray: string[];
  start: string;
  end: string;
  isPurpose: boolean;
  gender: number;
  ageArray: number[];
  isInflow?: boolean;
};

type GisFpopParams = {
  regionArray: string[];
  start: string;
  end: string;
  gender: number;
  ageArray: number[];
  timeznArray: number[];
};
type GisAlpParamsOptions = {
  start: string;
  end: string;
  regionArray: string[];
  timeznArray: number[];
};
type GisChartParamsOptions = {
  isNative: boolean;
  start: string;
  end: string;
  regionArray: string[];
  timeznArray: number[];
};
type GisMopParamsOptions = {
  isInflow: boolean;
  isPurpose: boolean;
  start: string;
  end: string;
  regionArray: string[];
  timeznArray: number[];
};
// 여기부터 백엔드 체크
// 1. 행정구역별 단계구분도 : polygon, text
// db (regionInfo, geoJson, data) -> backend (geoJson, regionInfo+data = layers1) -> layers1
type Layers1 = {
  //req: regionCode, time,options
  // + geoJson
  time: number;
  reqRegionCode: number; //요청에 대한 regionCode
  regionName: string;
  options: { [key: string]: any };
  layerData: {
    regionCode: number;
    regionName: string;
    count: { [key: string]: number };
    center: [number, number];
  }[];
};

type MapPolygonData = {
  time: number;
  regionCode: number; // 기준지
  regionName: string;
  center?: [number, number];
  options: { [key: string]: any };
  layerData: {
    //timestamp
    [key: number]: {
      regionCode: number; // polygon 기준지
      regionName: string; // text
      center?: [number, number];
      count: { [key: string]: number };
    }[];
  };
};

////!!!!!!!!!!!! 시계열이라서
// 2. 격자별 단계구분도 : grid (time series)
type MapDataGrid = {
  time: number;
  regionCode: number;
  regionName: string;
  options: { [key: string]: any };
  layerData: {
    [key: number]: {
      //UnixTimeStamp
      [key: number]: {
        //cellsize별 1:[], 0.5:[], 0.25:[]
        //UnixTimeStamp
        // timestamp 별로 group
        time: number;
        count: { [key: string]: string | number };
        coord: [number, number]; //left-bottom
      }[];
    };
  };
};

// 3. 3D 막대 차트 : polygon, text, gridCell
type Layers3 = {
  // + geoJson
  time: number;
  regionCode: number;
  regionName: string;
  options: { [key: string]: any };
  layerData: {
    regionCode: number; //polygon
    regionName: string; //text
    count: number; // text , polygon (color)
    center: [number, number]; //text , gridCell
    chartData: { [key: string]: number }; // gridCell, chart
  }[];
};

// 4. 버블 차트 : scatter, text
type Layers4 = {
  time: number;
  regionCode: number;
  regionName: string;
  options: { [key: string]: any };
  layerData: {
    regionCode: number;
    regionName: string; //text
    count: number; //text, polygon (color)
    center: [number, number]; //text, scatter
  }[];
};
// !!!!!! 3
// 5. 공간 벡처 분석 : d3
type MapDataD3 = {
  time: number;
  regionCode: number;
  regionName: string;
  options: { [key: string]: any };
  layerData: {
    //timestamp
    [key: number]: {
      regionCode: number; //기준지
      regionName: string;
      center: [number, number];
      destinations: {
        //유입유출지
        regionCode: number;
        regionName: string;
        count: { [key: string]: string | number };
        center: [number, number];
      }[];
    };
  };
};

//!!!!!!!!!!!222 시계열이라서
// 6. GIS 생활이동 분석 : trip, polygon, text
type MapDataTrip = {
  time: number;
  regionCode: number; // 기준지
  regionName: string;
  center: [number, number]; // trip
  options: { [key: string]: any };
  layerData: {
    //timestamp
    [key: number]: {
      regionCode: number; // polygon 기준지
      regionName: string; // text
      destinations: {
        regionCode: number; // polygon 도착지
        regionName: string; // text, trip
        count: { [key: string]: string | number }; //text, polygon(color)
        center: [number, number]; //text
        timeOri: number;
        timeDes: number;
      }[];
    };
  };
};

//5 + 6
type MapMopData = {
  time: number;
  regionCode: number; // 기준지
  regionName: string;
  center?: [number, number]; // trip
  options: { [key: string]: any };
  layerData: {
    //timestamp
    [key: number]: {
      regionCode: number; // polygon 기준지
      regionName: string; // text
      center?: [number, number]; //D3
      destinations: {
        regionCode: number; // polygon 도착지
        regionName: string;
        count: { [key: string]: string | number }; //text, polygon(color)
        center: [number, number]; //text
        timeOri?: number; // trip
        timeDes?: number; // trip
      }[];
    };
  };
};

type TripLayerData = {
  countRate: number;
  path: Array<number[]>;
  timeSamps: number[];
};

// geoJson or topoJson
//
type geoJson = {
  // key: 202404
  [key: string]: geoJson;
  // key: 202405
  [key: string]: geoJson;
};

type GisChart = {
  time: number;
  regionCode: number; //요청에 대한 regionCode
  regionName: string;
  options: { [key: string]: any };
  chartData: {
    //timestamp : 값
    [key: number]: { [key: string]: string | number };
  };
};
type GisMopChart = {
  time: number;
  regionCode: number; //요청에 대한 regionCode
  regionName: string;
  options: { [key: string]: any };
  chartData: {
    //timestamp : 값
    [key: number]: { count: { [key: string]: string | number } };
  };
};
