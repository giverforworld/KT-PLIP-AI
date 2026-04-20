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

import { useState } from "react";
import InputWrapper from "./InputWrapper";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormTrigger,
} from "react-hook-form";

interface BaseSelectboxProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  // options:
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  trigger: UseFormTrigger<T>;
}

export default function BaseSelectbox<T extends Record<string, any>>({
  name,
  label,
  // options,
  register,
  errors,
  trigger,
}: BaseSelectboxProps<T>) {
  const [isTouched, setIsTouched] = useState(false);

  const handleBlur = () => {
    setIsTouched(true);
    trigger(name);
  };

  return (
    <InputWrapper label={label} name={name}>
      <select
        id={name}
        className="w-full h-full px-2 border rounded-lg text-sm"
        {...register(name, {
          onBlur: handleBlur,
          onChange: () => {
            if (isTouched) {
              trigger(name);
            }
          },
        })}
      >
        <option>test</option>
        {/* {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))} */}
      </select>
    </InputWrapper>
  );
}
