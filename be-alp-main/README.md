# alp-backend

## 폴더 구조

be-alp
│  .gitignore
│  Dockerfile
│  env
│  env.dev
│  package.json
│  README.md
│  tsconfig.json
│  
├─.github
│  └─workflows
│          ci.yml
│
├─src
│  │  app.ts
│  │  
│  ├─config
│  │      config.ts
│  │      opensearchClient.ts
│  │      swagger.ts
│  │
│  ├─controller
│  │      alp.ts
│  │      gis.ts
│  │      holiday.ts
│  │
│  ├─helpers
│  │      convertDate.ts
│  │      convertNM.ts
│  │
│  ├─router
│  │      alp.ts
│  │      gis.ts
│  │      holiday.ts
│  │
│  ├─service
│  │  │  alp.ts
│  │  │  gis.ts
│  │  │  holidays.ts
│  │  │
│  │  ├─alp
│  │  │      comparePeriodAggs.ts
│  │  │      searchSummary.ts
│  │  │      statusService.ts
│  │  │
│  │  └─gis
│  │          gridService.ts
│  │
│  ├─swagger
│  │      holiday.swagger.yaml
│  │
│  └─utils
│      │  generateAgeScript.ts
│      │  generateSexScript.ts
│      │  holidays.ts
│      │  makeQueryFilter.ts
│      │  regionInfoCache.ts
│      │
│      ├─chart
│      │  │  regionAggregation.ts
│      │  │
│      │  └─transform
│      │          comparePeriod.ts
│      │          searchSummary.ts
│      │          timeData.ts
│      │
│      └─gis
│              transformGrid.ts
│
└─types
        chart.d.ts
        gis.d.ts
        opensearch.d.ts
        test.js
