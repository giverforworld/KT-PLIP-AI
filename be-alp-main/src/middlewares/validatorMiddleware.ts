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

import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationRules } from "./validators";

export const createValidationMiddleware = (paramsName: string) => {
  const rules = validationRules[paramsName];

  if (!rules) {
    throw new Error(`Validation rules for API '${paramsName}' not found.`);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(rules.map((rule) => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return; // 명시적으로 반환
    }

    next();
  };
};
