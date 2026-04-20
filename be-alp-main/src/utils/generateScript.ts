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

//popu_num 필드 모두 합
export function getAllPopulSumScript() {
  const script = {
    popul_sum: {
      scripted_metric: {
        init_script: "state.total = 0.0;",
        map_script: `
              List excludedFields = ["TOT_POPUL_NUM", "FEML_POPUL_NUM", "MALE_POPUL_NUM"];

              for (entry in params._source.entrySet()) {
                String fieldName = entry.getKey();
                if (fieldName.endsWith("_POPUL_NUM") && !excludedFields.contains(fieldName)) {
                  state.total += entry.getValue() == null ? 0.0 : entry.getValue();
                }
              }
            `,
        combine_script: "return state.total;",
        reduce_script: `
              double total_population = 0.0;
              for (s in states) {
                total_population += s;
              }
              return total_population;
            `,
      },
    },
  };
  return script;
}

//popul_num 들어가는 필드 평균
export function getAllPopulAvgScript() {
  const script = {
    popul_avg: {
      scripted_metric: {
        init_script: "state.total = 0.0; state.doc_count = 0;",
        map_script: `
            for (entry in params._source.entrySet()) {
              if (entry.getKey().endsWith("_POPUL_NUM")) {
                state.total += entry.getValue() == null ? 0.0 : entry.getValue();
              }
            }
            state.doc_count += 1;
          `,
        combine_script: "return state;",
        reduce_script: `
            double total_population = 0.0;
            long total_count = 0;
  
            for (s in states) {
              total_population += s.total;
              total_count += s.doc_count;
            }
  
            return total_count > 0 ? total_population / total_count : 0.0;
          `,
      },
    },
  };
  return script;
}

export function getPatternsPopulAvgScript(patterns: string[]) {
  const script = {
    popul_avg: {
      scripted_metric: {
        init_script: "state.total = 0.0; state.doc_count = 0;",
        map_script: `
            def excludedFields = ["TOT_POPUL_NUM", "FEML_POPUL_NUM", "MALE_POPUL_NUM", 
                                 "RSDN_MALE_POPUL_NUM", "RSDN_FEML_POPUL_NUM",
                                  "WKPLC_MALE_POPUL_NUM", "WKPLC_FEML_POPUL_NUM",
                                  "VIST_MALE_POPUL_NUM", "VIST_FEML_POPUL_NUM"];
            for (entry in params._source.entrySet()) {
                String fieldName = entry.getKey();
                boolean isSelected = false;
                
                // Check if field contains any of the selected types and ends with "_POPUL_NUM"
                for (type in params.selectedTypes) {
                  if (fieldName.contains(type) && fieldName.endsWith("_POPUL_NUM") && !excludedFields.contains(fieldName)) {
                    isSelected = true;
                    break;
                 }
                }

                if (isSelected) {
                state.total += entry.getValue() == null ? 0.0 : entry.getValue();
                }
            }
            state.doc_count += 1;
            `,
        combine_script: "return state;",
        reduce_script: `
              double total_population = 0.0;
              long total_count = 0;
    
              for (s in states) {
                total_population += s.total;
                total_count += s.doc_count;
              }
    
              return total_count > 0 ? total_population / total_count : 0.0;
            `,
        params: {
          selectedTypes: patterns,
        },
      },
    },
  };
  return script;
}

export function getPopulSexAgeSumScript(isCell: boolean) {
  const script = {
    popul_sum: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: isCell ? "popul_10_to_10_sum_script" : "popul_5_to_10_sum_script",
        },
        combine_script: `return state;`,
        reduce_script: `
          Map result = new HashMap();
        
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              result[entry.getKey()] = result.getOrDefault(entry.getKey(), 0.0) + entry.getValue();
            }
          }
        
          return result;
        `,
      },
    },
  };
  return script;
}

export function getSelectedSexAgeFilterScript(
  gender: number,
  ageArray: number[],
  isCell: boolean
) {
  const sexArray =
    gender === 0 ? ["MALE"] : gender === 1 ? ["FEML"] : ["MALE", "FEML"];
  const ageRanges = splitAgeRanges(ageArray);

  const script = {
    popul_sum: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: isCell
            ? "selected_sex_age_popul_10_sum_script"
            : "selected_sex_age_popul_5_sum_script",
          params: {
            selectedGenders: sexArray,
            selectedAges: ageRanges,
          },
        },
        combine_script: `return state;`,
        reduce_script: `
          double totalSum = 0.0;

          // 모든 상태(states)에서 필드별 값을 합산하여 전체 총합 계산
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              totalSum += entry.getValue();
            }
          }
          
          return totalSum;
        `,
      },
    },
  };
  return script;
}

function splitAgeRanges(ageRanges: number[]): string[] {
  const result: string[] = [];

  for (let i = 0; i < ageRanges.length; i++) {
    const start = ageRanges[i];
    const end = i + 1 < ageRanges.length ? ageRanges[i + 1] : start + 5;

    // 5세 단위로 나누기
    for (let age = start; age < end; age += 5) {
      result.push(age < 10 ? `0${age}` : `${age}`);
    }
  }

  return result;
}
const ageGenMap = [
  { label: "10세 미만", ages: ["00"] },
  { label: "10대", ages: ["10", "15"] },
  { label: "20대", ages: ["20", "25"] },
  { label: "30대", ages: ["30", "35"] },
  { label: "40대", ages: ["40", "45"] },
  { label: "50대", ages: ["50", "55"] },
  { label: "60대", ages: ["60", "65"] },
  { label: "70대", ages: ["70", "75"] },
  { label: "80세 이상", ages: ["80"] },
];

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
const sex = ["MALE", "FEML"];

export function generateAgeScript() {
  const aggs: Record<string, object> = {};
  const ageObj: Record<string, string[]> = {
    "10세 미만": ["00"],
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

    ageObj[ages].forEach((age) => {
      scriptParts.push(`doc['MALE_${age}_POPUL_NUM'].value`);
      scriptParts.push(`doc['FEML_${age}_POPUL_NUM'].value`);
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

//성연령별
export function generateSexAgeMapScript(isGen: boolean = true): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    sex.forEach((gender) => {
      const fields =
        ages
          .map((age) => `doc['${gender}_${age}_POPUL_NUM']`)
          .join(".size() > 0 && ") + ".size() > 0";

      // 연령대별 및 성별 인구수를 합산하는 스크립트 추가
      script += `
        if (${fields}) {
          if (!state.populationSums.containsKey('${gender}_${label}')) {
            state.populationSums['${gender}_${label}'] = 0.0;
          }
          state.populationSums['${gender}_${label}'] += (${ages
        .map((age) => `doc['${gender}_${age}_POPUL_NUM'].value`)
        .join(" + ")});
        }
      `;
    });
  });
  return script;
}

//연령별
export function generateAgeMapScript(isGen: boolean = true): string {
  let script = `
    if (state.populationSums == null) {
      state.populationSums = [:];
    }
  `;

  // 연령대별로 인구수 합산
  (isGen ? ageGenMap : ageMap).forEach(({ label, ages }) => {
    // 성별 및 연령대별 필드를 설정
    const fields =
      ages
        .map((age) =>
          sex
            .map((gender) => `doc['${gender}_${age}_POPUL_NUM']`)
            .join(".size() > 0 && ")
        )
        .join(".size() > 0 && ") + ".size() > 0";

    script += `
          if (${fields}) {
            if (!state.populationSums.containsKey('${label}')) {
              state.populationSums['${label}'] = 0.0;
            }
            state.populationSums['${label}'] += (${ages
      .map((age) =>
        sex
          .map((gender) => `doc['${gender}_${age}_POPUL_NUM'].value`)
          .join(" + ")
      )
      .join(" + ")});
          }
        `;
  });

  return script;
}

//선택된 성, 연령 필드 합
export function generateSexAgeSumScript(
  selectedSex: string[],
  selectedAges: string[],
  isGen: boolean
) {
  //개발용
  const ageMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10"],
    "15": ["15"],
    "20": ["20"],
    "25": ["25"],
    "30": ["30"],
    "35": ["35"],
    "40": ["40"],
    "45": ["45"],
    "50": ["50"],
    "55": ["55"],
    "60": ["60"],
    "65": ["65"],
    "70": ["70"],
    "75": ["75"],
    "80": ["80"],
  };
  const ageGenMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10", "15"],
    "20": ["20", "25"],
    "30": ["30", "35"],
    "40": ["40", "45"],
    "50": ["50", "55"],
    "60": ["60", "65"],
    "70": ["70", "75"],
    "80": ["80"],
  };
  let aggs: Record<string, object> = {};
  const ages = isGen ? ageGenMap : ageMap;

  const scriptParts: string[] = [];
  // 선택된 나이 그룹 순회
  selectedAges.forEach((ageGroup) => {
    if (ages[ageGroup] === undefined) {
      throw new Error(`Invalid age group: ${ageGroup}`);
    }

    // 선택된 성별에 따라 스크립트 생성

    ages[ageGroup].forEach((age) => {
      selectedSex.forEach((sex) => {
        scriptParts.push(
          `(doc.containsKey('${sex}_${age}_POPUL_NUM') && doc['${sex}_${age}_POPUL_NUM'].size() > 0 ? doc['${sex}_${age}_POPUL_NUM'].value : 0.0)`
        );
      });
    });
  });
  // 집계 스크립트 생성

  aggs = {
    sum: {
      script: {
        source: scriptParts.join(" + "), // 모든 스크립트를 합침
        lang: "painless",
      },
    },
  };

  return aggs;
}
export function generateSexAgeSumFields(
  selectedSex: string[],
  selectedAges: string[],
  isGen: boolean
): Record<string, any> {
  const ageStartRange = 0;
  const ageEndRange = 80;
  const gap = isGen ? 10 : 5;
  const fields: Record<string, any> = {};
  const ageMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10"],
    "15": ["15"],
    "20": ["20"],
    "25": ["25"],
    "30": ["30"],
    "35": ["35"],
    "40": ["40"],
    "45": ["45"],
    "50": ["50"],
    "55": ["55"],
    "60": ["60"],
    "65": ["65"],
    "70": ["70"],
    "75": ["75"],
    "80": ["80"],
  };
  const ageGenMap: Record<string, string[]> = {
    "00": ["00"],
    "10": ["10", "15"],
    "20": ["20", "25"],
    "30": ["30", "35"],
    "40": ["40", "45"],
    "50": ["50", "55"],
    "60": ["60", "65"],
    "70": ["70", "75"],
    "80": ["80"],
  };
  const ages = isGen ? ageGenMap : ageMap;
  // 선택된 성별과 연령대에 대한 필드 생성
  selectedSex.forEach((sex) => {
    selectedAges.forEach((ageGroup) => {
      ages[ageGroup].forEach((age) => {
        const key = `${sex}_${age}`;
        fields[key] = {
          sum: {
            field: `${key}_POPUL_NUM`,
          },
        };
      });
    });
  });

  return fields;
}

export function getSelectedSexAgeMovFilterScript(
  gender: number,
  ageArray: number[]
) {
  const sexFilter =
    gender === 0
      ? { field: "SEX_DIV_CD", value: 1 }
      : gender === 1
      ? { field: "SEX_DIV_CD", value: 2 }
      : null;
  const ageRanges = splitAgeRanges(ageArray);

  const script = {
    popul_sum: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: "selected_tot_popul_num_sum_script",
          params: {
            selectedGenders: sexFilter,
            selectedAges: ageRanges,
          },
        },
        combine_script: `return state;`,
        reduce_script: `
          double totalSum = 0.0;

          // 모든 상태(states)에서 필드별 값을 합산하여 전체 총합 계산
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              totalSum += entry.getValue();
            }
          }
          
          return totalSum;
        `,
      },
    },
  };
  return script;
}

export function getSelectedSexAgeFilterScriptAvg(
  gender: number,
  ageArray: number[],
) {
  const sexArray =
    gender === 0 ? ["M"] : gender === 1 ? ["F"] : ["M", "F"];
  const ageRanges = splitAgeRanges(ageArray);

  const script = {
    popul_avg: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: "selected_sexage_10_sum_script",
          params: {
            selectedGenders: sexArray,
            selectedAges: ageArray,
          },
        },
        combine_script: `return state;`,
        reduce_script: `
          double totalSum = 0.0;
          int totalCount = 0;

          // 모든 상태(states)에서 필드별 값을 합산하여 전체 총합 계산
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              totalSum += entry.getValue();
              totalCount++;
            }
          }
          
          return totalCount > 0 ? totalSum / totalCount : 0.0;
        `,
      },
    },
  };
  return script;
}

export function getSelectedSexAgeFilterScriptSum(
  gender: number,
  ageArray: number[],
) {
  const sexArray =
    gender === 0 ? ["M"] : gender === 1 ? ["F"] : ["M", "F"];
  const ageRanges = splitAgeRanges(ageArray);

  const script = {
    popul_sum: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: "selected_sexage_10_sum_script",
          params: {
            selectedGenders: sexArray,
            selectedAges: ageArray,
          },
        },
        combine_script: `return state;`,
        reduce_script: `
          double totalSum = 0.0;

          // 모든 상태(states)에서 필드별 값을 합산하여 전체 총합 계산
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              totalSum += entry.getValue();
            }
          }
          
          return totalSum;
        `,
      },
    },
  };
  return script;
}

export function getSelectedSex_AgeFilterScriptAvg(
  gender: number,
  ageArray: number[],
) {
  const sexArray =
    gender === 0 ? ["MALE"] : gender === 1 ? ["FEML"] : ["MALE", "FEML"];
  const ageRanges = splitAgeRanges(ageArray);

  const script = {
    popul_avg: {
      scripted_metric: {
        init_script:
          "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: "selected_sex_age_popul_10_sum_script",
          params: {
            selectedGenders: sexArray,
            selectedAges: ageArray,
          },
        },
        combine_script: `return state;`,
        reduce_script: `
          double totalSum = 0.0;
          int totalCount = 0;

          // 모든 상태(states)에서 필드별 값을 합산하여 전체 총합 계산
          for (s in states) {
            for (entry in s.populationSums.entrySet()) {
              totalSum += entry.getValue();
              totalCount++;
            }
          }
          
          return totalCount > 0 ? totalSum / totalCount : 0.0;
        `,
      },
    },
  };
  return script;
}

export function getSelectedSex_5AgeFilterScriptAvg(
  patterns: string[],
  gender: number,
  ageArray: number[],
) {
  const sexArray = gender === 0 ? ["MALE"] : gender === 1 ? ["FEML"] : ["MALE", "FEML"];

  const script = {
    popul_avg: {
      scripted_metric: {
        init_script:
        "state.populationSums = new HashMap(); state.doc_count = 0;",
        map_script: {
          id: "selected_patterns_popul_cate_5_sum_script",
          params: {
            selectedGenders: sexArray,
            selectedAges: ageArray,
            selectedTypes: patterns,
          },
        },
        combine_script: `return state;`,
        reduce_script:`
          double totalSum = 0.0;
          int totalCount = 0;

          for (s in states) {
            for (entry in s.populationsSums.entrySet()) {
              totalSum += entry.getvalue();
              totalCount++;
            }
          }
            return totalCount > 0 ? totalSum / totalCount : 0.0;
        `,
      },
    },
  };
  return script;
}