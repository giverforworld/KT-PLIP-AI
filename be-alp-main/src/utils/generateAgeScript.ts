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

const ageMap = [
  { label: "10세 미만", ages: ["00"] },
  { label: "10세", ages: ["10"] },
  { label: "15세", ages: ["15"] },
  { label: "20세", ages: ["20"] },
  { label: "25세", ages: ["25"] },
  { label: "30세", ages: ["30"] },
  { label: "35세", ages: ["35"] },
  { label: "40세", ages: ["40"] },
  { label: "45세", ages: ["45"] },
  { label: "50세", ages: ["50"] },
  { label: "55세", ages: ["55"] },
  { label: "60세", ages: ["60"] },
  { label: "65세", ages: ["65"] },
  { label: "70세", ages: ["70"] },
  { label: "75세", ages: ["75"] },
  { label: "80세 이상", ages: ["80"] },
];

const ageGenMap = [
  { label: "10대 미만", ages: ["00"] },
  { label: "10대", ages: ["10", "15"] },
  { label: "20대", ages: ["20", "25"] },
  { label: "30대", ages: ["30", "35"] },
  { label: "40대", ages: ["40", "45"] },
  { label: "50대", ages: ["50", "55"] },
  { label: "60대", ages: ["60", "65"] },
  { label: "70대", ages: ["70", "75"] },
  { label: "80대", ages: ["80"] },
];
const ageUniqueMap = [
  { label: "10세 미만", ages: ["00", "05"] },
  { label: "10세", ages: ["10"] },
  { label: "15세", ages: ["15"] },
  { label: "20세", ages: ["20"] },
  { label: "25세", ages: ["25"] },
  { label: "30세", ages: ["30"] },
  { label: "35세", ages: ["35"] },
  { label: "40세", ages: ["40"] },
  { label: "45세", ages: ["45"] },
  { label: "50세", ages: ["50"] },
  { label: "55세", ages: ["55"] },
  { label: "60세", ages: ["60"] },
  { label: "65세", ages: ["65"] },
  { label: "70세", ages: ["70"] },
  { label: "75세", ages: ["75"] },
  { label: "80세 이상", ages: ["80"] },
];

const ageUniqueGenMap = [
  { label: "10대 미만", ages: ["00", "05"] },
  { label: "10대", ages: ["10", "15"] },
  { label: "20대", ages: ["20", "25"] },
  { label: "30대", ages: ["30", "35"] },
  { label: "40대", ages: ["40", "45"] },
  { label: "50대", ages: ["50", "55"] },
  { label: "60대", ages: ["60", "65"] },
  { label: "70대", ages: ["70", "75"] },
  { label: "80대", ages: ["80"] },
];

const sex = ["MALE", "FEML"];
const patterns = ["RSDN", "VIST", "WKPLC"];

export function generateAgeScript() {
  const aggs: Record<string, object> = {};
  const ageObj: Record<string, string[]> = {
    "10세 미만": ["00", "05"],
    "10세": ["10"],
    "15세": ["15"],
    "20세": ["20"],
    "25세": ["25"],
    "30세": ["30"],
    "35세": ["35"],
    "40세": ["40"],
    "45세": ["45"],
    "50세": ["50"],
    "55세": ["55"],
    "60세": ["60"],
    "65세": ["65"],
    "70세": ["70"],
    "75세": ["75"],
    "80대 이상": ["80"],
  };

  Object.keys(ageObj).forEach((ages) => {
    const scriptParts: string[] = [];

    // 각 패턴에 대해 스크립트 생성
    patterns.forEach((pattern) => {
      ageObj[ages].forEach((age) => {
        scriptParts.push(`doc['${pattern}_MALE_${age}_POPUL_NUM'].value`);
        scriptParts.push(`doc['${pattern}_FEML_${age}_POPUL_NUM'].value`);
      });
    });

    // 집계 스크립트 생성
    aggs[`${ages}`] = {
      sum: {
        script: {
          source: scriptParts.join(" + "), // 모든 스크립트를 합침
          lang: "painless",
        },
      },
    };
  });

  return aggs;
}

//유니크 생활인구 연령대별
export function generateAgeMapScript(isGen: boolean = true): string {
  // 초기화 코드
  let script = `
    if (state.age_groups == null) {
      state.age_groups = [:];
    }
  `;

  // 각 연령대와 카테고리별로 인구수를 합산하는 코드를 생성
  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    script += `
      state.age_groups['${label}'] = state.age_groups.getOrDefault('${label}', 0);
    `;

    patterns.forEach((category) => {
      const populationSum = ages
        .map(
          (age) =>
            `doc['${category}_MALE_${age}_POPUL_NUM'].size() > 0 ? doc['${category}_MALE_${age}_POPUL_NUM'].value : 0` +
            ` + doc['${category}_FEML_${age}_POPUL_NUM'].size() > 0 ? doc['${category}_FEML_${age}_POPUL_NUM'].value : 0`
        )
        .join(" + ");

      script += `
        state.age_groups['${label}'] += (${populationSum});
      `;
    });
  });
  return script;
}

export function generateAgeSumMapScript(isGen: boolean = true): string {
  let script = `
    if (state.age_groups == null) {
      state.age_groups = [:];
    }
  `;

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((category) => {
      const maleFields =
        ages
          .map((age) => `doc['${category}_MALE_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";
      const femaleFields =
        ages
          .map((age) => `doc['${category}_FEML_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";

      // 연령대별 인구수를 합산하는 스크립트 추가
      script += `
        if (${maleFields} && ${femaleFields}) {
          if (!state.age_groups.containsKey('${label}')) {
            state.age_groups['${label}'] = 0;
          }
          state.age_groups['${label}'] += (${ages
        .map(
          (age) =>
            `doc['${category}_MALE_${age}_POPUL_NUM'].value + doc['${category}_FEML_${age}_POPUL_NUM'].value`
        )
        .join(" + ")});
        }
      `;
    });
  });

  return script;
}

//성연령대별 합
export function generateUniqueSexAgeSumMapScript(
  isGen: boolean = true
): string {
  let script = `
    if (state.male_age_groups == null) {
      state.male_age_groups = [:];
    }
    if (state.female_age_groups == null) {
      state.female_age_groups = [:];
    }
  `;

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((category) => {
      const maleFields =
        ages
          .map((age) => `doc['${category}_MALE_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";
      const femaleFields =
        ages
          .map((age) => `doc['${category}_FEML_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";

      // 연령대별 및 성별 인구수를 합산하는 스크립트 추가
      script += `
        if (${maleFields}) {
          if (!state.male_age_groups.containsKey('${label}')) {
            state.male_age_groups['${label}'] = 0.0;
          }
          state.male_age_groups['${label}'] += (${ages
        .map((age) => `doc['${category}_MALE_${age}_POPUL_NUM'].value`)
        .join(" + ")});
        }
        if (${femaleFields}) {
          if (!state.female_age_groups.containsKey('${label}')) {
            state.female_age_groups['${label}'] = 0.0;
          }
          state.female_age_groups['${label}'] += (${ages
        .map((age) => `doc['${category}_FEML_${age}_POPUL_NUM'].value`)
        .join(" + ")});
        }
      `;
    });
  });

  return script;
}
export function generateSexAgeSumMapScript(isGen: boolean = true): string {
  let script = `
    if (state.male_age_groups == null) {
      state.male_age_groups = [:];
    }
    if (state.female_age_groups == null) {
      state.female_age_groups = [:];
    }
  `;

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((category) => {
      const maleFields =
        ages
          .map((age) => `doc['${category}_MALE_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";
      const femaleFields =
        ages
          .map((age) => `doc['${category}_FEML_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";

      // 연령대별 및 성별 인구수를 합산하는 스크립트 추가
      script += `
        if (${maleFields}) {
          if (!state.male_age_groups.containsKey('${label}')) {
            state.male_age_groups['${label}'] = 0.0;
          }
          state.male_age_groups['${label}'] += (${ages
        .map((age) => `doc['${category}_MALE_${age}_POPUL_NUM'].value`)
        .join(" + ")});
        }
        if (${femaleFields}) {
          if (!state.female_age_groups.containsKey('${label}')) {
            state.female_age_groups['${label}'] = 0.0;
          }
          state.female_age_groups['${label}'] += (${ages
        .map((age) => `doc['${category}_FEML_${age}_POPUL_NUM'].value`)
        .join(" + ")});
        }
      `;
    });
  });

  return script;
}

//패턴별, 성연령대별 합
export function generatePatternSexAgeSumMapScript(
  isUnique: boolean,
  isGen: boolean = true
): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((category) =>
      sex.forEach((gender) => {
        const fields =
          ages
            .map((age) => `doc['${category}_${gender}_${age}_POPUL_NUM']`)
            .join(".size() > 0 && ") + ".size() > 0";

        // 연령대별 및 성별 인구수를 합산하는 스크립트 추가
        script += `
        if (${fields}) {
          if (!state.populationSums.containsKey('${category}_${gender}_${label}')) {
            state.populationSums['${category}_${gender}_${label}'] = 0.0;
          }
          state.populationSums['${category}_${gender}_${label}'] += (${ages
          .map((age) => `doc['${category}_${gender}_${age}_POPUL_NUM'].value`)
          .join(" + ")});
        }
      `;
      })
    );
  });
  return script;
}

//패턴별 성별
export function generatePatternSexMapScript(
  isUnique: boolean,
  isGen: boolean = true
): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  const ages = isGen ? ageGenMap : ageMap;

  patterns.forEach((category) => {
    sex.forEach((gender) => {
      const fields =
        ages
          .map(({ ages }) =>
            ages
              .map((age) => `doc['${category}_${gender}_${age}_POPUL_NUM']`)
              .join(".size() > 0 && ")
          )
          .join(".size() > 0 && ") + ".size() > 0";

      script += `
        if (${fields}) {
          if (!state.populationSums.containsKey('${category}_${gender}')) {
            state.populationSums['${category}_${gender}'] = 0.0;
          }
          state.populationSums['${category}_${gender}'] += (${ages
        .map(({ ages }) =>
          ages
            .map((age) => `doc['${category}_${gender}_${age}_POPUL_NUM'].value`)
            .join(" + ")
        )
        .join(" + ")});
        }
      `;
    });
  });

  return script;
}

//패턴별 연령대별
export function generatePatternAgeMapScript(
  isUnique: boolean,
  isGen: boolean = true
): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  const ages = isGen ? ageGenMap : ageMap;

  patterns.forEach((category) => {
    // 연령대별로 인구수 합산
    ages.forEach(({ label, ages }) => {
      // 성별 및 연령대별 필드를 설정
      const fields =
        ages
          .map((age) =>
            sex
              .map((gender) => `doc['${category}_${gender}_${age}_POPUL_NUM']`)
              .join(".size() > 0 && ")
          )
          .join(".size() > 0 && ") + ".size() > 0";

      script += `
          if (${fields}) {
            if (!state.populationSums.containsKey('${category}_${label}')) {
              state.populationSums['${category}_${label}'] = 0.0;
            }
            state.populationSums['${category}_${label}'] += (${ages
        .map((age) =>
          sex
            .map(
              (gender) => `doc['${category}_${gender}_${age}_POPUL_NUM'].value`
            )
            .join(" + ")
        )
        .join(" + ")});
          }
        `;
    });
  });

  return script;
}

export function generatePatternsScript(isGen: boolean = true): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  // 모든 키를 미리 초기화
  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((pattern) => {
      sex.forEach((gender) => {
        const key = `${pattern}_${gender}_${label.substring(0, 2)}`;
        script += `
          if (!state.populationSums.containsKey('${key}')) {
            state.populationSums['${key}'] = 0;
          }
        `;
      });
    });
  });

  // 필드 합산 로직 (필드 존재 확인 제거)
  const patternScriptParts: string[] = [];

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    patterns.forEach((pattern) => {
      sex.forEach((gender) => {
        const key = `${pattern}_${gender}_${label.substring(0, 2)}`;
        patternScriptParts.push(`
          state.populationSums['${key}'] += ${ages
          .map(
            (age) =>
              `doc['${pattern}_${gender}_${
                age === "00" ? "0" : age
              }_POPUL_NUM'].value`
          )
          .join(" + ")};
        `);
      });
    });
  });

  // patternScriptParts 배열을 스크립트에 결합
  script += patternScriptParts.join("\n");
  script += ` state.doc_count += 1;`;

  return script;
}
