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

type RankParams = {
  start: string;
  end: string;
  regionArray: string[];
  patternArray: string[];
  sexArray: string[];
  dayArray: number[];
  isGen: boolean;
  ageArray: string[];
};
type AlpRankParams = {
  start: string;
  end: string;
  regionArray: string[];
  patternArray: number[];
  sexArray: string[];
  dayArray: number[];
  isGen: boolean;
  ageArray: string[];
};
type MopRankParams = {
  start: string;
  end: string;
  regionArray: string[];
  isInflow: boolean;
  includeSame: boolean;
  isPurpose: boolean;
  moveCdArray: number[];
  sexArray: string[];
  dayArray: number[];
  isGen: boolean;
  ageArray: string[];
};
type MopParams = {
  start: string;
  end: string;
  regionArray: string[];
  includeSame: boolean;
};

type MopFlowParams = {
  start: string;
  end: string;
  region: string;
  regionArray: string[];
  isInflow: boolean;
};

type MopMoveParams = {
  start: string;
  end: string;
  regionArray: string[];
  isInflow: boolean;
  moveCdArray: number[];
  includeSame: boolean;
  isPurpose: boolean;
};
type MopMoveFlowParams = {
  start: string;
  end: string;
  region: string;
  regionArray: string[];
  isInflow: boolean;
  moveCdArray: number[];
  isPurpose: boolean;
  includeSame: boolean;
};
type LlpParams = {
  start: string;
  end: string;
  regionArray: string[];
};
type LlpRankParams = {
  start: string;
  end: string;
  regionArray: string[];
  stayDayArray: number[];
  sexArray: string[];
  dayArray: number[];
  isGen: boolean;
  ageArray: string[];
};
type AlpParams = {
  start: string;
  end: string;
  regionArray: string[];
};
type ParamsOptions =
  | MopParams
  | MopFlowParams
  | MopMoveParams
  | MopMoveFlowParams
  | AlpParams
  | LlpParams;
