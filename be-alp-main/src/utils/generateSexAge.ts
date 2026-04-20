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

export function generateSexAge(isLlp?: boolean): Record<string, any> {
  //개발용
  // const ageStartRange = isLlp ? 10 : 0;
  // const ageEndRange = isLlp ? 70 : 80;
  //kt용
  const ageStartRange = isLlp ? 0 : 0;
  const ageEndRange = 80;
  const fields: Record<string, any> = {};

  // Generate male population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `m${i.toString().padStart(2, "0")}`;
    fields[key] = {
      sum: {
        field: isLlp
          ? `MALE_${i.toString().padStart(2, "0")}_POPUL_NUM`
          : `M${i.toString().padStart(2, "0")}`,
      },
    };
  }

  // Generate female population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `f${i.toString().padStart(2, "0")}`;
    fields[key] = {
      sum: {
        field: isLlp
          ? `FEML_${i.toString().padStart(2, "0")}_POPUL_NUM`
          : `F${i.toString().padStart(2, "0")}`,
      },
    };
  }

  // Add total fields
  fields["total"] = { sum: { field: isLlp ? "TOT_POPUL_NUM" : "TOT" } };
  fields["total_male"] = { sum: { field: isLlp ? "MALE_POPUL_NUM" : "MTOT" } };
  fields["total_female"] = {
    sum: { field: isLlp ? "FEML_POPUL_NUM" : "FTOT" },
  };

  return fields;
}

export function generateFieldSexAge(
  isSum: boolean = true,
  isGen: boolean = true
): Record<string, any> {
  const ageStartRange = 0;
  const ageEndRange = 80;
  const gap = isGen ? 10 : 5;
  const fields: Record<string, any> = {};

  // Generate male population fields
  for (let i = ageStartRange; i <= ageEndRange; i += gap) {
    const key = `MALE_${i.toString().padStart(2, "0")}`;
    fields[key] = {
      [isSum ? "sum" : "avg"]: {
        field: `MALE_${i.toString().padStart(2, "0")}_POPUL_NUM`,
      },
    };
  }

  // Generate female population fields
  for (let i = ageStartRange; i <= ageEndRange; i += gap) {
    const key = `FEML_${i.toString().padStart(2, "0")}`;
    fields[key] = {
      [isSum ? "sum" : "avg"]: {
        field: `FEML_${i.toString().padStart(2, "0")}_POPUL_NUM`,
      },
    };
  }
  // Add total fields
  fields["total"] = { sum: { field: "TOT" } };
  fields["total_male"] = { sum: { field: "MTOT" } };
  fields["total_female"] = { sum: { field: "FTOT" } };
  return fields;
}
export function generateCalcSexAge(
  isSum: boolean = true,
  isGen: boolean = false
): Record<string, any> {
  const ageStartRange = 0;
  const ageEndRange = 80;
  const gap = isGen ? 10 : 5;
  const fields: Record<string, any> = {};

  // Generate male population fields
  for (let i = ageStartRange; i <= ageEndRange; i += gap) {
    const key = `M${i.toString().padStart(2, "0")}`;
    fields[key] = {
      [isSum ? "sum" : "avg"]: {
        field: `M${i.toString().padStart(2, "0")}`,
      },
    };
  }

  // Generate female population fields
  for (let i = ageStartRange; i <= ageEndRange; i += gap) {
    const key = `F${i.toString().padStart(2, "0")}`;
    fields[key] = {
      [isSum ? "sum" : "avg"]: {
        field: `F${i.toString().padStart(2, "0")}`,
      },
    };
  }

  return fields;
}
export function generatePatternSexAge(): Record<string, any> {
  const ageStartRange = 0;
  const ageEndRange = 80;
  const fields: Record<string, any> = {};

  const patterns = ["RSDN", "VIST", "WKPLC"];

  // Generate male population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `m${i.toString().padStart(2, "0")}`;
    const populationSum = patterns
      .map((category) => {
        `doc['${category}_MALE_${i.toString().padStart(2, "0")}_POPUL_NUM']`;
      })
      .join(" + ");
    fields[key] = {
      sum: { field: populationSum },
    };
  }

  // Generate female population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `f${i.toString().padStart(2, "0")}`;
    const populationSum = patterns
      .map((category) => {
        `doc['${category}_FEML_${i.toString().padStart(2, "0")}_POPUL_NUM']`;
      })
      .join(" + ");
    fields[key] = {
      sum: { field: populationSum },
    };
  }

  // Add total fields
  fields["total"] = { sum: { field: "TOT_POPUL_NUM" } };
  fields["total_male"] = { sum: { field: "MALE_POPUL_NUM" } };
  fields["total_female"] = { sum: { field: "FEML_POPUL_NUM" } };

  return fields;
}

export function generateFornNat(isSum: boolean = true): Record<string, any> {
  const fields: Record<string, any> = {};

  const fornNat = [
    "CHN",
    "VNM",
    "USA",
    "THA",
    "UZB",
    "NPL",
    "IDN",
    "RUS",
    "MMR",
    "PHL",
    "KHM",
    "KAZ",
    "LKA",
    "MNG",
    "BGD",
    "JPN",
    "CAN",
    "IND",
    "PAK",
    "FRA",
  ];

  // Generate male population fields
  fornNat.forEach(
    (nat) =>
      (fields[nat] = {
        [isSum ? "sum" : "avg"]: {
          field: `${nat}_POPUL_NUM`,
        },
      })
  );

  // Add total fields
  fields["total"] = { sum: { field: "TOT_POPUL_NUM" } };
  return fields;
}
export function generateResidSexAge(): Record<string, any> {
  const ageStartRange = 0;
  const ageEndRange = 80;
  const fields: Record<string, any> = {};

  // Generate male population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `m${i.toString().padStart(2, "0")}`;
    fields[key] = {
      sum: {
        field: `MALE_${i.toString().padStart(2, "0")}_POPUL_NUM`,
      },
    };
  }

  // Generate female population fields
  for (let i = ageStartRange; i <= ageEndRange; i += 5) {
    const key = `f${i.toString().padStart(2, "0")}`;
    fields[key] = {
      sum: {
        field: `FEML_${i.toString().padStart(2, "0")}_POPUL_NUM`,
      },
    };
  }

  // Add total fields
  fields["total"] = { sum: { field: "TOT_POPUL_NUM" } };
  fields["total_male"] = { sum: { field: "MALE_TOT_POPUL_NUM" } };
  fields["total_female"] = {
    sum: { field: "FEML_TOT_POPUL_NUM" },
  };

  return fields;
}
