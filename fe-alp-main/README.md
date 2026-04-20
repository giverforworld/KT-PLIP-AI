# ALP FrontEnd Project Guide

<br>

> 해당 문서를 편하게 보시려면, `VsCode` 에서 본 파일명을 우클릭 하신 뒤,
> `Open Preview` 버튼을 눌러 확인하시길 바랍니다.

<br>

목차

[1. 개발환경 세팅](#1-개발환경-세팅)

[2. 디렉터리 구조](#2-디렉토리-구조)

<br>
<br>

## 1. 개발환경 세팅

### 준비할 파일 목록

1. git
2. node.js 설치파일 (v20.16.0 이상의 LTS 버전)
3. yarn 설치파일
4. VsCode(Visual Studio Code) 설치파일
5. VsCode Extensions (EsLint, Prettier 등)
6. 프로젝트 소스코드
7. Chrome 브라우저 설치파일
8. Chrome 브라우저 확장 프로그램 (React Developer Tools 등)

<br>

### 설치 방법

1. node.js 설치

- 먼저 node.js를 설치해주세요. node.js가 잘 설치되었는지 확인하시려면 Windows Powershell 또는 cmd을 켜시고 다음과 같이 입력하시길 바랍니다.

```sh
  node --version
```

- node가 설치되어 있다면 node의 패키지 매니저인 `npm` 역시 설치되어 있어야 합니다. `npm`은 node.js가 설치되면 함께 설치됩니다. 잘 설치되었는지 버전을 확인해주세요.

```sh
  npm --version
```

<br>

2. yarn 설치

- yarn은 NPM 대신 사용할 node/자바스크립트 패키지 매니저입니다. NPM 대비 속도 및 보안성에서 더 우수하며, yarn offline mirror를 통한 오프라인 설치를 위해 본 프로젝트에서는 yarn을 사용합니다.
- yarn 설치 파일을 실행하여 설치해주세요. 상기와 동일하게 yarn이 잘 설치되었는지 powershell 또는 cmd에서 yarn의 버전을 확인해주세요.

```sh
  yarn --version
```

<br>

3. VsCode 설치

- 본 프로젝트에서는 IDE로 Visual Studio Code를 사용합니다.

<br>

4. VsCode Extension 설치 (Offline)

- 오프라인 설치 방법
  1. 좌측 하단 → 설정(톱니바퀴 아이콘) 클릭
  2. Command Pallete... 클릭 (Ctrl + Shift + P)
  3. 'Install from VSIX' 검색 후 클릭
  4. 원하는 vsix 파일 (확장 프로그램 설치 파일) 선택

<br>

5. 소스코드 설치 (Offline)

- git을 통해 소스코드를 클론한 후, "npm_packages_offline_cache" 디렉토리를 루트 디렉토리에 복사한 뒤 다음과 같이 입력합니다.

```sh
yarn install --offline (패키지 설치시)
```

<br>

6. 소스코드 파일 실행

- VsCode 사이드 바 Explorer에 디렉토리가 제대로 나타나는지 확인하세요. node_modules, public, src 등 폴더가 보여야 정상적으로 설치된 것입니다.
- Terminal 패널에 다음과 같이 입력하세요. 구동이 시작되고 브라우저에 `localhost:3000`에 프로젝트가 열립니다.

<br>

```sh
yarn dev
```

`yarn dev`: 개발 모드에서 Next.js 애플리케이션을 실행하며, 코드 변경 시 자동으로 페이지를 리로드합니다.

<br>

```sh
yarn build
```

`yarn build`: 애플리케이션을 프로덕션 모드로 빌드합니다. 빌드 결과물은 .next 디렉토리에 저장됩니다.

<br>

```sh
yarn start
```

`yarn start`: 빌드된 애플리케이션을 프로덕션 모드에서 실행합니다.

<br>
<br>

## 2. 디렉토리 구조

Next.js 14 버전으로 작성된 현 프로젝트는 App router를 사용합니다. `public`, `src`, `npm_packages_offline_cache` 디렉토리 및 설정 파일들로 구성되어 있으며, 아래의 내용과 같이 정리됩니다.
<br>

```
fe-alp
│  .dockerignore
│  .env
│  .env.development
│  .eslintrc.json
│  .gitignore
│  .prettierignore
│  .prettierrc.json
│  .yarnrc
│  Dockerfile
│  next.config.mjs
│  package-lock.json
│  package.json
│  postcss.config.mjs
│  README.md
│  tailwind.config.ts
│  tsconfig.json
│
├─.github
│  └─workflows
│          ci.yml
│
├─public
│  ├─fonts
│  ├─images
│  └─maps
└─src
    ├─app
    │  ├─ layout.tsx
    │  ├─ (main)
    │  │  ├─ layout.tsx
    │  │  └─ page.tsx
    │  ├─api
    │  │  ├─ hello
    │  │  │  └─ route.ts
    │  └─api-doc
    │      ├─ page.tsx
    │      └─ react-swagger.tsx
    ├─components
    ├─constants
    ├─containers
    ├─context
    ├─hooks
    ├─libs
    ├─services
    ├─styles
    ├─types
    └─utils

```

<br>

1. `public` Directory

- images, font 등 정적 파일을 관리합니다.

<br>

2. `src` 디렉토리

- 자세한 설명은 아래의 별도 챕터에서 확인해주세요.

<br>

3. `npm_packages_offline_cache` 디렉토리

- `.yarnrc`에서 설정한 offline mirror 디렉토리입니다.
- offline mirror는 패키지 레지스트리의 미러 역할을 하기 때문에, 인터넷에 연결하는 대신 offline mirror에서 패키지를 받아오도록 할 수 있습니다. 패키지 매니저는 디렉토리 내부의 tgz 파일의 압축을 풀어서 node_modules에 추가합니다.

<br>

## SRC Directory

1. `app` Directory

- 라우팅 관련 파일만 정의합니다.
- 그 외 page.tsx 안에서 보여줄 컨텐츠들은 `containers` 폴더에 정의하고, page.tsx에서 import로 가져와서 사용합니다.
- `api` 디렉토리는 백엔드 엔드포인트를 생성합니다.
- `api-doc`내부 page.tsx는 `api`에서 생성된 api 목록들을 swagger UI로 보여줍니다. 예를 들어, http://localhost:3000/api-doc 으로 접속하면, `api` 디렉토리의 api route가 반영된 swagger UI를 확인할 수 있습니다. (route.ts 파일에서 swagger 주석 작성이 필요합니다.)

<br>

2. `components` Directory

- 각종 공통 `UI` 요소들을 사전에 정의하여, 조립할 수 있게 만들어 놓은 요소들의 모음입니다.
- `components`디렉토리의 컴포넌트들은 특정 context를 포함하지 않고, 어디서든 재사용 가능할 수 있도록 구현합니다.

<br>

3. `constants` Directory

- 반복적으로 활용되는 상수들을 모아놓는 디렉토리입니다.

<br>

4. `containers` Directory

- `app` 디렉토리에서 정의된 페이지에서 사용될 컴포넌트들 입니다.
- 페이지에서 불러오는 가장 상위 container는 서버 컨테이너(컴포넌트)로 활용하고, **_그 하위의 컴포넌트부터 클라이언트 컴포넌트로 사용하도록 합니다._**

<br>

5. `context` Directory

- 클라이언트 사이드 전역 상태 관리에 관한 파일들을 모아놓는 디렉토리입니다.

<br>

6. `hooks` Directory

- `hooks` 디렉토리 내부의 `queries` 디렉토리에는, 현 프로젝트에서 사용하는 서버 사이드 상태 관리 라이브러리 `react-query`관련 hook들을 모아둡니다. `Backend`와 통신할 `API` 목록들을 `services` directory로부터 import 해오고, `react-query`를 통하여 화면에 뿌리거나, 생성/업데이트 해줄 데이터를 핸들링하게 됩니다.

<br>

7. `libs` Directory

- 외부 라이브러리 관련 디렉토리입니다.

<br>

8. `services` Directory

- `hooks`디렉토리의 `queries`에서 사용할 `API` 목록을 정의합니다. 되도록 `queries` 내부 폴더/파일명과 매칭되도록 합니다.

<br>

9. `styles` Directory

- 전역 스타일링이 필요할 경우, styles 내부 `globals.css` 파일에 작성할 수 있습니다.
- 기본적으로 `taliwindCSS`를 사용하며, global colors, font style, theme 등 전역으로 사용될 스타일은 되도록 `tailwind.config.ts`에 정의하도록 합니다.

<br>

10. `types` Directory

- 타입스크립트 전용 type들을 적어놓은 디렉토리입니다.

<br>

11. `utils` Directory

- 자주 사용되는 유용한 함수들을 모아둔 디렉토리입니다.

12. 기타1