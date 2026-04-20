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

import { query, ValidationChain } from "express-validator";

// 공통 검증 규칙 정의
const commonValidators = {
  date: (field: string): ValidationChain =>
    query(field)
      .isString()
      .isLength({ min: 6, max: 8 })
      .withMessage(`${field} must be a string with length 6 or 8.`),

  boolean: (field: string): ValidationChain =>
    query(field)
      .isString()
      .isIn(["true", "false"])
      .withMessage(`${field} must be 'true' or 'false'.`),

  string: (field: string, min = 1, max = 255): ValidationChain =>
    query(field)
      .isString()
      .isLength({ min, max })
      .withMessage(
        `${field} must be a string between ${min} and ${max} characters.`
      ),

  number: (field: string): ValidationChain =>
    query(field).isNumeric().withMessage(`${field} must be a number.`),

  array: (field: string, itemType: "string" | "number"): ValidationChain =>
    query(field)
      .custom((value) => {
        if (!Array.isArray(value))
          throw new Error(`${field} must be an array.`);
        if (
          itemType === "string" &&
          !value.every((v) => typeof v === "string")
        ) {
          throw new Error(`All items in ${field} must be strings.`);
        }
        if (itemType === "number" && !value.every((v) => !isNaN(Number(v)))) {
          throw new Error(`All items in ${field} must be numbers.`);
        }
        return true;
      })
      .withMessage(`${field} must be an array of ${itemType}s.`),
  numericStringArray: (field: string): ValidationChain =>
    query(field)
      .custom((value) => {
        // 단일 값이면 배열로 변환
        const values = Array.isArray(value) ? value : [value];

        // 배열의 모든 값이 숫자로 구성된 문자열인지 확인
        if (!values.every((v) => typeof v === "string" && /^\d+$/.test(v))) {
          throw new Error(
            `${field} must be an array of strings that represent numbers.`
          );
        }

        return true;
      })
      .withMessage(`${field} must be an array of numeric strings.`),
};

// API별 검증 규칙 정의
export const validationRules: Record<string, ValidationChain[]> = {
  defaultParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
  ],
  dateParams: [commonValidators.date("start"), commonValidators.date("end")],
  dataParams: [commonValidators.date("start")],
  dashboardsParams: [commonValidators.date("start")],
  reportParams: [
    commonValidators.date("start"),
    commonValidators.string("region"),
  ],
  RankParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.numericStringArray("patterns"),
    commonValidators.numericStringArray("gender"),
    commonValidators.numericStringArray("day"),
    commonValidators.boolean("isGen"),
    commonValidators.numericStringArray("age"),
  ],
  MopParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.boolean("includeSame"),
  ],
  MopFlowParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.string("region"),
    commonValidators.numericStringArray("flowRegions").optional(),
    commonValidators.boolean("isInflow"),
  ],
  MopMoveParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.boolean("isInflow"),
    commonValidators.numericStringArray("moveCd"),
    commonValidators.boolean("includeSame"),
  ],
  MopMoveFlowParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.string("region"),
    commonValidators.numericStringArray("flowRegions").optional(),
    commonValidators.numericStringArray("moveCd"),
    commonValidators.boolean("isInflow"),
  ],
  MopRankParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.boolean("isInflow"),
    commonValidators.boolean("includeSame"),
    commonValidators.boolean("isPurpose"),
    commonValidators.numericStringArray("moveCd"),
    commonValidators.numericStringArray("gender"),
    commonValidators.numericStringArray("day"),
    commonValidators.boolean("isGen"),
    commonValidators.numericStringArray("age"),
  ],
  LlpRankParams: [
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.numericStringArray("stayDay").optional(),
    commonValidators.numericStringArray("gender"),
    commonValidators.numericStringArray("day").optional(),
    commonValidators.boolean("isGen"),
    commonValidators.numericStringArray("age"),
  ],
  GisAlpParams: [
    commonValidators.number("spaceType"),
    commonValidators.date("start"),
    commonValidators.date("end"),
    commonValidators.numericStringArray("regions"),
    commonValidators.numericStringArray("gender"),
    commonValidators.numericStringArray("age"),
    commonValidators.numericStringArray("timezn"),
    commonValidators.numericStringArray("patterns").optional(),
  ],
};

export function isValidMonth(value: string) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}
export function isValidDay(value: string) {
  return typeof value === "string" && /^\d{8}$/.test(value);
}
