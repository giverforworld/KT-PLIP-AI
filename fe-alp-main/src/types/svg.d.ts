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

// SVG 파일을 React 컴포넌트로 불러올 수 있도록 .svg 파일을 React의 FC 타입으로 처리
declare module "*.svg" {
  const svg: React.FC<React.SVGProps<SVGSVGElement>>;
  export default svg;
}
