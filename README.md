# ⛳ 골프 캐디 어시스턴트

전국 골프장의 **실시간 바람 · 습도 · 낙뢰**를 읽어 라운딩 가부, 클럽 선택, 그리고 **공의 어느 지점을 때려야 하는지**까지 플레이어 실력에 맞춰 알려 주는 Vue 3 웹 애플리케이션.

기온만 보여 주는 일반 날씨 앱과 달리, 골프에서 실제로 스코어를 좌우하는 4가지 변수(풍속 · 풍향 · 습도 · 낙뢰)를 기준으로 판단합니다.

---

## 목차

1. [주요 기능](#주요-기능)
2. [기술 스택](#기술-스택)
3. [시작하기](#시작하기)
4. [폴더 구조](#폴더-구조)
5. [라우트 구성](#라우트-구성)
6. [아키텍처 — 데이터 흐름](#아키텍처--데이터-흐름)
7. [핵심 계산 로직](#핵심-계산-로직)
8. [Pinia 스토어 명세](#pinia-스토어-명세)
9. [컴포넌트 명세](#컴포넌트-명세)
10. [API 연동](#api-연동)
11. [디자인 시스템](#디자인-시스템)
12. [Vue 학습 포인트 매핑](#vue-학습-포인트-매핑)
13. [데이터 출처와 한계](#데이터-출처와-한계)
14. [개발 중 내린 주요 결정](#개발-중-내린-주요-결정)
15. [앞으로 확장할 것](#앞으로-확장할-것)

---

## 주요 기능

### 🎯 임팩트 포인트 가이드 (핵심 기능)

바람 방향과 세기를 분석해 **골프공의 어느 지점을 때려야 하는지**를 SVG 그림으로 보여 줍니다. 골프공 정면도 위에 타격 지점 크로스헤어와 바람 화살표를 겹쳐 그리고, 옆에는 예상 탄도 곡선을 함께 표시합니다. 홀 방향이나 플레이어 실력을 바꾸면 마커가 애니메이션으로 이동합니다.

**실력에 따라 조언이 달라집니다.** 같은 바람이라도 초급자에게 펀치샷을 권하면 미스샷만 늘어나기 때문입니다.

| 실력     | 타격 지점      | 조언 방식                                                                                  |
| -------- | -------------- | ------------------------------------------------------------------------------------------ |
| **초급** | 항상 중앙 고정 | 타점 조작을 권하지 않음. "바람은 스윙이 아니라 클럽으로 이깁니다" + 강풍 시 스탠스·그립 팁 |
| **중급** | 상하만 조절    | 맞바람 → 적도 위(펀치샷) / 뒷바람 → 적도 아래(하이 볼). 좌우는 타점 대신 **조준**으로 대응 |
| **상급** | 상하 + 좌우    | 오른쪽 바람 → 홀드 페이드, 왼쪽 바람 → 홀드 드로우. 비 + 맞바람이면 스팅어 제안            |

각 가이드는 타격 지점뿐 아니라 **볼 위치**(스탠스 기준), **스윙 팁**, **그렇게 치는 이유**를 함께 제공합니다.

### 🧮 클럽 추천 계산기

남은 거리를 바람 · 기온 · 노면 상태로 보정해 "실제로 몇 미터처럼 치는지"를 계산하고, 사용자가 입력해 둔 클럽별 캐리 거리와 비교해 클럽을 추천합니다. 보정 근거를 항목별로 모두 표시합니다.

```
150m → 148m처럼 칩니다 (−2m)
  뒷바람 2.6m/s   −4m
  기온 28℃        −1m
  젖은 노면        +3m
→ 🏌️ 7번 아이언 (145m) · 거리가 딱 맞습니다
```

### 🌅 마지막 티오프 시간

일몰까지 남은 시간으로 지금 출발하면 몇 홀까지 소화할 수 있는지 계산합니다. 홀당 15분(18홀 4시간 30분) 기준이며, **추가 API 호출 없이** 현재 날씨 응답에 이미 포함된 `sunrise` / `sunset` 값을 씁니다.

### 🔎 전국 골프장 찾기

54곳의 골프장을 시·도, 유형(대중제/회원제)으로 필터링하고 이름·지역으로 검색합니다. "+ 대시보드" 버튼으로 담으면 그 좌표의 실시간 날씨를 즉시 조회하며, 대시보드 구성은 `localStorage`에 저장돼 다음 방문에도 유지됩니다.

### 📍 코스 컨디션 대시보드

담아 둔 골프장별로 라운딩 판정(최적 / 주의 / 위험), 클럽 조언, 조준 조언, 추천 샷을 한눈에 보여 줍니다. 낙뢰 위험이 감지되면 상단에 대피 배너가 즉시 뜹니다.

### ⛈️ 경보 현황

위험 · 주의 등급 골프장만 모아 낙뢰 확률 내림차순으로 보여 주는 전용 페이지.

### 🌡️ 단위 전환

헤더의 버튼 하나로 섭씨 ↔ 화씨를 전환하며, 메인 · 상세 · 상태바 · 예보 목록의 모든 온도 표기가 동시에 바뀝니다. 단, **판정 로직은 항상 섭씨 원본으로 계산**합니다(표시용 변환과 계산용 원본의 분리).

---

## 기술 스택

| 구분       | 사용 기술                                 | 버전      | 용도                                              |
| ---------- | ----------------------------------------- | --------- | ------------------------------------------------- |
| 프레임워크 | Vue 3 (Composition API, `<script setup>`) | ^3.5.40   | UI 전반                                           |
| 라우팅     | Vue Router                                | ^5.2.0    | 페이지 라우팅, 동적 경로, Lazy Loading, Catch-all |
| 상태 관리  | Pinia                                     | ^4.0.2    | 전역 상태 4개 스토어                              |
| HTTP       | Axios                                     | ^1.19.0   | OpenWeatherMap 통신, 인터셉터                     |
| 빌드       | Vite                                      | ^8.1.5    | 개발 서버, 번들링, 환경변수                       |
| 포맷       | Prettier                                  | 3.9.5     | 코드 스타일                                       |
| 외부 API   | OpenWeatherMap                            | Free Plan | 현재 날씨 / 5일 예보 / 대기 오염                  |

> 차트 · 아이콘 · UI 라이브러리를 일절 쓰지 않았습니다. 골프공 그림과 탄도 곡선은 **인라인 SVG**로 직접 그렸고, 아이콘은 이모지입니다.

---

## 시작하기

### 1. 설치

```sh
npm install
```

### 2. API 키 설정

[OpenWeatherMap](https://openweathermap.org/api)에서 무료 API 키를 발급받은 뒤, 프로젝트 루트에 `.env` 파일을 만듭니다.

```sh
cp .env.example .env
```

```ini
# .env
VITE_OPENWEATHER_API_KEY=여기에_발급받은_키
```

- `.env`는 `.gitignore`에 등록되어 커밋되지 않습니다.
- 발급 직후에는 키 활성화까지 수십 분이 걸릴 수 있습니다(그동안 401 응답).
- ⚠️ 프런트엔드 앱의 키는 빌드 결과 JS에 포함되어 브라우저에서 확인 가능합니다. 실서비스라면 백엔드를 경유해야 합니다.

### 3. 실행

```sh
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run format   # Prettier 포맷팅
```

키가 없어도 앱은 동작합니다. 내장된 시드 데이터로 화면이 채워지고, 통신 실패 시 에러 메시지만 표시됩니다.

---

## 폴더 구조

```
weather-vue/
├── index.html                  # lang="ko", 메타 태그(SEO/og), 이모지 SVG 파비콘
├── .env                        # API 키 (gitignore 대상)
├── .env.example                # 키 발급 안내용 템플릿
├── vite.config.js              # @ → src 별칭
├── scripts/
│   └── convertGolfCourses.mjs  # 공공데이터 CSV → golfCourses.js 변환 스크립트
└── src/
    ├── main.js                 # createApp · Pinia · Router 주입
    ├── App.vue                 # 사이트 셸: sticky 헤더 + RouterView + 푸터
    │
    ├── api/
    │   └── weatherApi.js       # Axios 인스턴스 · 인터셉터 · 엔드포인트 3종
    │
    ├── router/
    │   └── index.js            # 라우트 정의 · Lazy Loading · Catch-all · 스크롤 동작
    │
    ├── stores/                 # Pinia (Options API 스타일)
    │   ├── weatherStore.js     # 골프장 날씨 데이터 · 대시보드 구성
    │   ├── caddyStore.js       # 홀 방향 · 플레이어 실력
    │   ├── configStore.js      # 온도 단위 설정
    │   └── bagStore.js         # 내 클럽별 비거리 (localStorage)
    │
    ├── utils/                  # 순수 함수 (화면과 무관한 계산)
    │   ├── caddy.js            # 바람 벡터 분해 · 라운딩 판정 · 클럽/조준 조언
    │   ├── impact.js           # 임팩트 지점 계산 (실력별 분기)
    │   ├── club.js             # 플레이 거리 보정 · 클럽 추천
    │   ├── teeTime.js          # 일몰 기준 잔여 홀 · 마지막 티오프
    │   └── weatherMapper.js    # OpenWeatherMap 응답 → 앱 내부 형식 변환
    │
    ├── composables/
    │   └── useDisplayTemp.js   # 온도 단위 변환 (여러 컴포넌트가 공유)
    │
    ├── data/
    │   ├── golfCourses.js      # 전국 골프장 54곳 디렉터리 (정적)
    │   └── mockCourses.js      # 날씨 초기값 · 모의 데이터 생성기
    │
    ├── components/exercise/    # 재사용 부품 (혼자서는 화면이 되지 않는 단위)
    │   ├── BaseDashboardCard.vue   # 박스 디자인 공통화 (slot 3종)
    │   ├── SearchBar.vue           # 검색 입력 (props/emits)
    │   ├── WeatherCard.vue         # 골프장 카드
    │   ├── CaddyControls.vue       # 홀 방향 · 실력 선택
    │   ├── StatusBar.vue           # 선택 골프장 요약
    │   ├── UnitToggler.vue         # 섭씨/화씨 토글
    │   ├── ImpactPointGuide.vue    # 골프공 SVG + 탄도 SVG
    │   ├── ClubBagEditor.vue       # 내 클럽 거리 입력표
    │   └── SiteFooter.vue          # 데이터 출처 · 한계 고지
    │
    ├── views/                  # 화면 단위 (라우트 하나 = 파일 하나)
    │   ├── WeatherHomeView.vue     # 히어로 + 2단 대시보드
    │   ├── CourseFinderView.vue    # 전국 골프장 찾기
    │   ├── WeatherDetailView.vue   # 골프장 상세 (관측 · 임팩트 · 예보)
    │   ├── ClubCalculatorView.vue  # 클럽 추천 계산기
    │   ├── WeatherAlertView.vue    # 경보 현황
    │   ├── WeatherAboutView.vue    # 서비스 소개
    │   └── NotFoundView.vue        # 404
    │
    └── assets/
        ├── base.css            # 디자인 토큰(CSS 변수) + 리셋
        └── main.css            # 페이지 셸 스타일
```

### 폴더를 이렇게 나눈 기준

| 폴더          | 담는 것     | 구별 기준                                                         |
| ------------- | ----------- | ----------------------------------------------------------------- |
| `components/` | 부품        | **혼자서는 화면이 될 수 없음** (검색창 하나가 페이지일 수는 없다) |
| `views/`      | 화면        | **주소 하나에 대응됨**                                            |
| `stores/`     | 전역 상태   | 여러 화면이 공유하고, 페이지를 옮겨도 유지돼야 함                 |
| `utils/`      | 순수 함수   | 화면도 데이터도 아닌 계산 규칙. `.vue`가 아니라 `.js`             |
| `data/`       | 정적 데이터 | 통신 없이 앱에 내장되는 값                                        |
| `api/`        | 통신        | URL · 키 · 헤더가 바뀌면 여기만 수정                              |

> **원칙: 둘 이상의 화면에서 쓰이는 순간 바깥으로 뺀다.** 라우터 도입으로 화면이 여러 개가 되면서 같은 데이터·같은 계산을 여러 View가 필요로 하게 됐고, 복사해 두면 규칙 하나 바꿀 때 여러 파일을 고쳐야 하므로 공용 계층으로 분리했습니다.

---

## 라우트 구성

| 경로               | 이름             | 컴포넌트           | 로딩 | 설명                                   |
| ------------------ | ---------------- | ------------------ | ---- | -------------------------------------- |
| `/`                | `home`           | WeatherHomeView    | 정적 | 히어로 + 대시보드                      |
| `/courses`         | `courses`        | CourseFinderView   | Lazy | 전국 골프장 찾기                       |
| `/weather/:cityId` | `weather-detail` | WeatherDetailView  | Lazy | 골프장 상세 (동적 경로, `props: true`) |
| `/club`            | `club`           | ClubCalculatorView | Lazy | 클럽 추천 계산기                       |
| `/alerts`          | `alerts`         | WeatherAlertView   | Lazy | 경보 현황                              |
| `/about`           | `about`          | WeatherAboutView   | Lazy | 서비스 소개                            |
| `/:pathMatch(.*)*` | `not-found`      | NotFoundView       | Lazy | Catch-all 404                          |

**적용한 라우터 기능**

- **Lazy Loading** — 첫 화면만 정적 import, 나머지는 `() => import(...)`로 진입 시점에 내려받습니다. 빌드하면 View마다 별도 청크로 분리되는 것을 확인할 수 있습니다.
- **동적 경로 + props** — `props: true`로 `:cityId`를 컴포넌트 props로 받습니다.
- **Catch-all** — 정의되지 않은 모든 주소를 404 페이지로.
- **scrollBehavior** — 페이지 이동 시 항상 맨 위에서 시작, 뒤로 가기는 이전 위치 복원.

> `:cityId`라는 파라미터 이름은 초기에 "지역" 단위로 개발했던 흔적입니다. 지금은 골프장 id가 들어갑니다.

---

## 아키텍처 — 데이터 흐름

```
[사용자 조작]
     │
     ▼
┌──────────────┐   props ↓ / emits ↑    ┌─────────────────┐
│  View (화면)  │ ◄────────────────────► │ Component (부품) │
└──────┬───────┘                        └─────────────────┘
       │ 스토어 구독 / 액션 호출
       ▼
┌──────────────────────────────────────────────┐
│ Pinia Store  (weather · caddy · config · bag)│
└──────┬─────────────────────────┬─────────────┘
       │ 액션이 호출              │ state를 넘겨 계산
       ▼                         ▼
┌────────────────┐        ┌──────────────────┐
│ api/weatherApi │        │ utils/ (순수함수) │
│  (Axios)       │        │ caddy · impact   │
└──────┬─────────┘        │ club · teeTime   │
       │                  └──────────────────┘
       ▼
┌────────────────────┐
│ utils/weatherMapper│  OpenWeatherMap 응답 → 앱 내부 형식
└────────────────────┘
       │
       ▼
  [ 스토어 state 갱신 → computed 재계산 → 화면 리렌더 ]
```

**각 계층의 책임**

1. **api** — 통신만 한다. 어떤 화면이 부르는지 모른다.
2. **weatherMapper** — 외부 API 형식과 내부 형식 사이의 방어벽. API 응답 구조가 바뀌어도 이 파일만 고치면 화면 코드는 그대로다.
3. **stores** — 상태를 보관하고, 그 상태를 바꾸는 방법(액션)을 정한다. 화면은 통신 방법을 몰라도 된다.
4. **utils** — 상태를 받아 계산만 한다. Vue에 의존하지 않아 노드로 단독 테스트가 가능하다.
5. **views / components** — 그리기만 한다.

**부모-자식 통신 규칙**은 끝까지 단방향을 유지합니다.

```vue
<!-- 부모가 값을 내려주고(props), 자식은 요청만 올려보낸다(emits) -->
<SearchBar :query="searchQuery" @update-query="onUpdateQuery" />
<WeatherCard :course="course" @select-card="..." @click-detail="..." @remove-card="..." />
<CaddyControls :hole-deg="caddyStore.holeDeg" @update:hole-deg="caddyStore.setHoleDeg" />
```

자식은 값을 직접 바꾸지 않고 "바꿔 주세요"라고 알리기만 합니다. 실제 변경은 부모나 스토어 액션이 담당하므로, 값이 이상할 때 추적할 지점이 하나입니다.

---

## 핵심 계산 로직

### 1. 바람 벡터 분해 — `utils/caddy.js`

모든 골프 조언의 출발점입니다. OpenWeatherMap의 `wind.deg`는 **바람이 불어오는 방향**(기상 표준)이라 홀 진행 방향과 그대로 비교할 수 있습니다.

```js
export const getWindVector = (course, holeDeg) => {
  const diff = ((course.windDeg - holeDeg + 540) % 360) - 180 // -180 ~ 180
  const rad = (diff * Math.PI) / 180
  return {
    diff,
    head: course.windSpeed * Math.cos(rad), // + 맞바람 / − 뒷바람
    side: course.windSpeed * Math.sin(rad), // + 오른쪽에서 붐 / − 왼쪽에서 붐
  }
}
```

이 두 성분(`head`, `side`)에 **실력별 민감도**를 곱해 모든 조언을 만듭니다. 탄도가 높은 초보일수록 바람의 영향을 크게 받기 때문입니다.

| 실력 | 민감도 |
| ---- | ------ |
| 초급 | 1.3    |
| 중급 | 1.0    |
| 상급 | 0.8    |

### 2. 클럽 조언

3m/s 맞바람 = 1클럽으로 환산하며, 최대 ±3클럽으로 제한합니다.

```js
const step = Math.max(-3, Math.min(3, Math.round((head * sensitivity) / 3)))
// step ≥ 1 → "맞바람! 평소보다 N클럽 길게 잡으세요."
// step ≤ -1 → "뒷바람! 평소보다 N클럽 짧게 잡으세요."
```

### 3. 라운딩 판정 — `judgePlay()`

우선순위대로 검사해 첫 번째로 걸리는 조건을 반환합니다.

| 순위 | 조건                    | 등급    | 메시지           |
| ---- | ----------------------- | ------- | ---------------- |
| 1    | 낙뢰 ≥ 50%              | 🔴 위험 | 즉시 카트로 대피 |
| 2    | 풍속 ≥ 12m/s 또는 눈    | 🔴 위험 | 강풍/악천후      |
| 3    | 낙뢰 ≥ 20%              | 🟡 주의 | 그늘집 근처 대기 |
| 4    | 비 또는 뇌우            | 🟡 주의 | 우천 장비        |
| 5    | 안개                    | 🟡 주의 | 시야 확보        |
| 6    | 기온 ≥ 30℃ & 습도 ≥ 70% | 🟡 주의 | 온열질환         |
| —    | 그 외                   | 🟢 최적 | 자신 있게        |

> 초기에는 3·4번이 `낙뢰 ≥ 20 || 비`로 묶여 있었습니다. 실제 API 데이터를 붙이자 **낙뢰 0%인 비 오는 날에 "낙뢰 확률 0% · 그늘집에서 대기하세요"** 라는 엉뚱한 문구가 나와 분리했습니다. 모의 데이터에서는 비와 낙뢰가 항상 함께 다녀서 드러나지 않던 버그입니다.

### 4. 임팩트 지점 — `utils/impact.js`

좌표계는 공 정면 기준 −1 ~ 1입니다.

```
        y = +1 (적도 위)
             │
x = -1 ──────┼────── x = +1
(안쪽 면)     │      (바깥쪽 면)
        y = -1 (적도 아래)
```

| 상황 (실력 보정 후)    | 타격 지점   | 샷 이름            | 볼 위치                     |
| ---------------------- | ----------- | ------------------ | --------------------------- |
| 맞바람 ≥ 5m/s          | `y = +0.45` | 펀치샷             | 스탠스 중앙보다 공 한 개 뒤 |
| 맞바람 2.5~5           | `y = +0.25` | 낮은 탄도          | 공 반 개 뒤                 |
| 뒷바람 ≥ 5m/s          | `y = -0.35` | 하이 볼            | 공 한 개 앞                 |
| 뒷바람 2.5~5           | `y = -0.20` | 살짝 높은 탄도     | 공 반 개 앞                 |
| 옆바람 ≥ 3m/s (상급만) | `x = ±0.30` | 홀드 페이드/드로우 | —                           |

초급은 위 표와 무관하게 항상 `(0, 0)`입니다.

### 5. 플레이 거리 보정 — `utils/club.js`

| 요소               | 계수                             |
| ------------------ | -------------------------------- |
| 맞바람             | 1m/s 당 +1.5%                    |
| 뒷바람             | 1m/s 당 −1.0%                    |
| 기온               | 20℃ 기준, 1℃ 낮아질 때마다 +0.1% |
| 젖은 노면(비/뇌우) | +2% (런 감소분)                  |

### 6. 티오프 계산 — `utils/teeTime.js`

```js
MINUTES_PER_HOLE = 15   // 18홀 = 4시간 30분
BUFFER_MINUTES = 15     // 해 지기 전 여유

playableHoles = clamp(floor((일몰까지 남은 분 − 15) / 15), 0, 18)
lastTeeOff(holes) = 일몰 − (holes × 15 + 15)분
```

### 7. 낙뢰 확률 추정 — `utils/weatherMapper.js`

OpenWeatherMap 무료 플랜에는 낙뢰 항목이 없습니다. 날씨 상태 코드와 강수확률(`pop`)로 추정합니다.

```js
if (id >= 200 && id < 300) return Math.max(80, pop * 100) // 뇌우
if (id >= 500 && id < 600) return pop * 50 // 비
return pop * 15
```

---

## Pinia 스토어 명세

### `useWeatherStore` — 날씨 데이터 · 대시보드 구성

| 구분    | 이름                                            | 설명                                                  |
| ------- | ----------------------------------------------- | ----------------------------------------------------- |
| state   | `courses`                                       | 대시보드에 담긴 골프장 + 날씨 배열                    |
|         | `isLoading` / `error`                           | 통신 상태                                             |
|         | `lastUpdated` / `source`                        | 갱신 시각, `'mock'` \| `'live'`                       |
| getters | `courseById(id)`                                | 인자를 받는 getter (함수를 반환하는 형태)             |
|         | `dashboardIds` / `isOnDashboard(id)`            | 대시보드 구성 조회                                    |
|         | `isLive` / `lastUpdatedText` / `lightningCount` | 표시·집계용                                           |
| actions | `fetchLiveWeather()`                            | 담긴 전체 골프장을 `Promise.all`로 동시 조회          |
|         | `fetchCourseWeather(id)`                        | 1곳만 조회 (대시보드에 없어도 전체 디렉터리에서 검색) |
|         | `addCourse(id)` / `removeCourse(id)`            | 구성 변경 + localStorage 저장 + 즉시 조회             |
|         | `resetDashboard()`                              | 기본 10곳으로 복구                                    |
|         | `refreshMockWeather()`                          | 통신 없이 랜덤 갱신 (watch 동작 확인용)               |

통신 실패 시 **기존 데이터를 유지한 채 에러 메시지만** 남깁니다. 화면이 빈 채로 남지 않습니다.

### `useCaddyStore` — 라운딩 조건

| 구분    | 이름                                                                       |
| ------- | -------------------------------------------------------------------------- |
| state   | `holeDeg` (0/90/180/270), `playerLevel` (`beginner` \| `amateur` \| `pro`) |
| getters | `windSensitivity`, `holeText`(8방위 한글), `levelText`                     |
| actions | `setHoleDeg()`, `setPlayerLevel()`                                         |

### `useConfigStore` — 온도 단위

| 구분    | 이름                                                      |
| ------- | --------------------------------------------------------- |
| state   | `unit` (`'celsius'` \| `'fahrenheit'`)                    |
| getters | `unitSymbol`(℃/℉), `unitLabel`(섭씨/화씨), `isFahrenheit` |
| actions | `toggleUnit()`, `setUnit()`                               |

### `useBagStore` — 내 클럽 거리

| 구분    | 이름                                          |
| ------- | --------------------------------------------- |
| state   | `clubs` (11개 클럽 기본값, localStorage 복원) |
| getters | `sortedClubs`, `longest`, `shortest`          |
| actions | `setDistance()`, `resetBag()`, `persist()`    |

---

## 컴포넌트 명세

| 컴포넌트            | props                          | emits                                        | 특징                                              |
| ------------------- | ------------------------------ | -------------------------------------------- | ------------------------------------------------- |
| `BaseDashboardCard` | `icon`, `title`                | —                                            | **슬롯 3종**: 기본, `#meta`(헤더 우측), `#footer` |
| `SearchBar`         | `query`                        | `update-query`                               | `v-model` 대신 명시적 props/emits                 |
| `WeatherCard`       | `course`                       | `select-card`, `click-detail`, `remove-card` | 카드 객체 전체를 올려보냄                         |
| `CaddyControls`     | `hole-deg`, `player-level`     | `update:hole-deg`, `update:player-level`     | 이벤트를 스토어 액션에 직결                       |
| `StatusBar`         | `selected-course`, `hole-text` | —                                            | 낙뢰 시 배경색 전환                               |
| `UnitToggler`       | —                              | —                                            | **props 없이 스토어 직접 구독**                   |
| `ImpactPointGuide`  | `guide`, `compact`             | —                                            | SVG 2개 (공 정면도 + 탄도)                        |
| `ClubBagEditor`     | —                              | —                                            | 스토어 직접 구독 + localStorage                   |
| `SiteFooter`        | —                              | —                                            | 데이터 출처 · 한계 고지                           |

### 슬롯 패턴 — `BaseDashboardCard`

검색 박스, 조건 설정, 카드 목록이 모두 **같은 흰 카드 디자인**을 씁니다. 액자를 하나 만들어 두고 내용물만 갈아 끼우는 구조입니다.

```vue
<BaseDashboardCard icon="🔍" title="골프장 검색">
  <SearchBar :query="searchQuery" @update-query="onUpdateQuery" />
</BaseDashboardCard>
```

여기서 `searchQuery`는 **부모(View)의 변수**입니다. 슬롯에 넣은 내용물은 부모 스코프에서 컴파일되므로, `BaseDashboardCard`는 자기 안에 무엇이 들었는지 전혀 모른 채 어떤 내용물이든 받을 수 있습니다.

### 스타일 격리

모든 컴포넌트가 자기 `<style scoped>`만 가집니다. 색상은 직접 쓰지 않고 CSS 변수만 참조합니다.

> ⚠️ scoped 스타일은 자식 컴포넌트 내부까지 적용되지 않습니다. 초기에 카드 배지 색상을 부모에 정의해 두어 **색이 아예 먹지 않던 버그**가 있었고, 분리 과정에서 각 컴포넌트 안으로 옮겨 해결했습니다.

---

## API 연동

### Axios 인스턴스 — `api/weatherApi.js`

```js
const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
  params: { appid: API_KEY, units: 'metric', lang: 'kr' }, // 매 요청 자동 첨부
})
```

### 사용 엔드포인트

| 함수                          | 엔드포인트       | 얻는 것                                             |
| ----------------------------- | ---------------- | --------------------------------------------------- |
| `getCurrentWeather(lat, lon)` | `/weather`       | 기온, 풍속, **풍향**, 습도, 상태코드, **일출·일몰** |
| `getForecast(lat, lon, cnt)`  | `/forecast`      | 3시간 단위 예보 (티타임 추천)                       |
| `getAirPollution(lat, lon)`   | `/air_pollution` | AQI, PM10, PM2.5                                    |

상세 페이지에서는 세 가지를 `Promise.all`로 동시에 요청합니다.

### 인터셉터

- **요청 전** — API 키 존재 여부를 확인해 원인을 알기 쉬운 에러로 바꿉니다.
- **응답 에러** — 상태 코드를 사람이 읽을 문장으로 변환해 `error.friendlyMessage`에 담습니다.

| 상태 | 메시지                                                            |
| ---- | ----------------------------------------------------------------- |
| 401  | API 키가 유효하지 않습니다 (발급 후 활성화까지 수십 분 소요 가능) |
| 429  | 호출 횟수 제한 초과                                               |
| 기타 | `통신 실패: {원본 메시지}`                                        |

`alert()` 대신 화면 안의 에러 박스로 표시합니다.

---

## 디자인 시스템

`assets/base.css`에 CSS 변수로 토큰을 모아 두어, **한 줄만 바꾸면 전체 색이 바뀝니다.**

```css
:root {
  --c-primary: #14e954;        /* 포인트 색 */
  --c-primary-soft: #e8f0fe;
  --c-page / --c-surface / --c-surface-soft;
  --c-border / --c-border-strong;
  --c-text / --c-text-sub;
  --c-good / --c-caution / --c-danger  (+ 각 -bg);
  --radius / --radius-lg / --shadow;
  --site-width: 1100px;
}
```

- 한국어 가독성을 위해 `word-break: keep-all` (어절 단위 줄바꿈)
- 반응형 분기: **900px**(대시보드 2단 → 1단), **700px**(헤더 내비 줄바꿈), **560px**(단위 라벨 숨김, 그림 세로 배치)
- 다크모드 CSS는 제거했습니다(라이트 전용 디자인에서 배경만 검게 바뀌어 깨졌기 때문)

---

## Vue 학습 포인트 매핑

이 프로젝트는 수업 과제 단계를 따라 확장되었습니다. 각 개념이 어디에 쓰였는지 정리하면 다음과 같습니다.

| 단계 | 개념                                                 | 적용 위치                                        |
| ---- | ---------------------------------------------------- | ------------------------------------------------ |
| 1    | `ref` / `computed` / `watch` / `watchEffect`         | 검색 필터, 집계, 낙뢰 감지 배너                  |
| 2    | 컴포넌트 분리, `props` / `emits`, `<style scoped>`   | `components/exercise/` 전체                      |
| 3    | `slot` (기본 · 이름 있는 슬롯)                       | `BaseDashboardCard`                              |
| 4    | Vue Router (동적 경로, Lazy Loading, Catch-all)      | `router/index.js`, `views/`                      |
| 5    | Pinia (state / getters / actions)                    | `stores/` 4개                                    |
| 6    | Axios (인스턴스, 인터셉터, `async/await`)            | `api/weatherApi.js`                              |
| 확장 | Composable, 순수 함수 분리, SVG 시각화, localStorage | `composables/`, `utils/`, `ImpactPointGuide.vue` |

**반응성 체인의 실제 예** — "기상 정보 갱신" 버튼 한 번의 파급:

```
클릭 → 스토어 courses 재할당 (state 변경 감지)
  → filteredCourseList 재계산 (computed 의존성 추적)
  → judgePlay / getImpactGuide 재실행
  → lightningCount 변경 → watch 발화 → 대피 배너 갱신
  → 화면 리렌더 (카드 전체 + SVG 마커 이동)
```

우리가 직접 "화면을 다시 그려라"라고 명령하는 코드는 한 줄도 없습니다.

---

## 데이터 출처와 한계

프로젝트에서 **추정치와 실측치를 구분해 UI에 명시**하고 있습니다.

| 항목                                  | 출처                           | 한계                                                         |
| ------------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| 기온 · 풍속 · 풍향 · 습도 · 일출/일몰 | OpenWeatherMap Current Weather | 무료 플랜 격자 보간 값                                       |
| 3시간 단위 예보                       | OpenWeatherMap 5 Day Forecast  | —                                                            |
| 대기질(PM10, PM2.5)                   | OpenWeatherMap Air Pollution   | —                                                            |
| **낙뢰 확률**                         | 직접 추정                      | 무료 플랜에 항목이 없어 **상태 코드 + 강수확률로 추정**한 값 |
| **골프장 정보**                       | 공개된 골프장 현황 자료        | 좌표는 **시·군·구 단위 근사치**. 코스 내 홀 위치가 아님      |
| **임팩트 가이드**                     | 골프 일반 이론 기반 자체 규칙  | **단순화된 교육용** 자료. 실제 스윙 교습을 대체하지 않음     |

### 골프장 데이터를 정적 JSON으로 택한 이유

조사 결과 다음과 같은 제약이 있었습니다.

- 골프장 전용 상용 API([Golf Intelligence](https://golfintelligence.com/), [golfapi.io](https://golfapi.io/))는 해외 코스 위주 + 유료
- [카카오 로컬 REST API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)는 무료지만 브라우저 직접 호출 시 CORS 제약이 보고됨
- 국내 골프장 정보는 [공공데이터포털](https://www.data.go.kr/data/15118920/fileData.do)에 파일 데이터로 공개

→ **키·CORS·요금 문제가 없고 오프라인에서도 동작하는** 정적 내장 방식을 선택했습니다. 공식 데이터로 교체하려면 CSV를 받아 아래 스크립트를 실행하면 됩니다.

```sh
node scripts/convertGolfCourses.mjs data/golf-raw.csv > src/data/golfCourses.generated.js
```

---

## 개발 중 내린 주요 결정

| 결정                                  | 이유                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| 표시용 온도 변환과 계산용 원본 분리   | 화씨로 바꿨다고 "고온다습 주의"가 모든 곳에 뜨면 안 되므로, 판정은 항상 섭씨 원본으로 |
| 컴포저블 → Pinia 스토어로 승격        | 값을 바꾸는 경로가 액션으로 한정되고, DevTools에서 변경 이력 추적 가능                |
| 계산 로직을 `utils/` 순수 함수로 분리 | 화면이 3개로 늘어나며 같은 계산이 필요해짐. Vue 없이 노드로 단독 검증 가능            |
| `data/mockCourses.js`를 폴백으로 유지 | API 키가 없거나 통신이 실패해도 앱이 빈 화면이 되지 않음                              |
| 대시보드 구성을 localStorage에 저장   | 사용자가 담아 둔 골프장이 새로고침으로 사라지면 무의미                                |
| 인라인 SVG로 직접 그림                | 차트 라이브러리를 쓰기엔 과하고, 골프공+탄도는 표준 차트가 아님                       |

### 검증 방식

- 순수 함수는 노드 스크립트로 **무풍/강풍/맞바람/뒷바람/옆바람 × 초급/중급/상급 = 18조합**을 전수 확인
- 화면은 헤드리스 크롬으로 전 라우트를 실제 렌더링해 확인
- 빌드 시 Lazy Loading 청크가 View별로 분리되는지 확인

> 참고: macOS의 헤드리스 크롬은 창을 **최소 500px**로 강제합니다. 390px로 스크린샷을 찍으면 500px 페이지가 잘린 이미지가 나와 오버플로로 오인하기 쉽습니다.

---

## 앞으로 확장할 것

- **주간 티타임 히트맵** — 이미 붙인 예보 API를 요일 × 시간대 격자로 확장 (추가 비용 거의 없음)
- **라운딩 준비물 체크리스트** — 날씨 기반 자동 생성 (우산 / 방한 / 자외선 / 벌레기피제)
- **스코어 기록 · 핸디캡 계산** — localStorage 기반 개인 통계
- **지도 표시** — 카카오맵 JS SDK(브라우저 전용이라 CORS 제약 없음)로 골프장 마커
- **배포** — Netlify / Vercel 권장. 환경변수를 대시보드에서 주입할 수 있어 GitHub Pages보다 키 관리가 안전
- **PWA** — 골프장은 통신이 불안정한 곳이 많아 오프라인 캐시가 실용적

---

## 라이선스 · 고지

학습 목적으로 제작한 프로젝트입니다. 날씨 데이터는 OpenWeatherMap의 이용 약관을 따릅니다. 임팩트 가이드를 포함한 모든 골프 조언은 참고용이며, 낙뢰 경보 시에는 앱의 판단과 무관하게 **즉시 안전한 장소로 대피**하시기 바랍니다.
