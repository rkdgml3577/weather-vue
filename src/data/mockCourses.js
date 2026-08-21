import { findGolfCourse } from '@/data/golfCourses'

/* ===== 날씨 초기값 · 모의 데이터 =====
 * 실시간 API 응답이 도착하기 전에 화면을 채워 두는 값이자,
 * 통신 실패 시에도 앱이 동작하도록 하는 폴백이다.
 *
 * windDeg   : 바람이 "불어오는" 방향(기상 표준). 0=북, 90=동, 180=남, 270=서
 * lightning : 낙뢰 확률(%) — 무료 플랜에 항목이 없어 상태코드로 추정하는 값
 */
export const PLACEHOLDER_WEATHER = {
  temp: 20,
  status: '맑음',
  description: '조회 전',
  windSpeed: 0,
  windDeg: 0,
  humidity: 50,
  lightning: 0,
  sunrise: null,
  sunset: null,
  timezone: 32400, // KST
}

/* 골프장 id 목록 → 대시보드에 올릴 카드 객체 배열 */
export const createDashboardCourses = (ids) =>
  ids
    .map((id) => findGolfCourse(id))
    .filter(Boolean)
    .map((course) => ({ ...course, ...PLACEHOLDER_WEATHER }))

/* ===== 모의 기상 갱신(시뮬레이션) =====
 * API 호출 없이 watch/computed 동작을 확인할 때 사용한다. */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const randomizeWeather = (courses) =>
  courses.map((c) => ({
    ...c,
    temp: rand(5, 33),
    windSpeed: rand(0, 15),
    windDeg: rand(0, 7) * 45,
    humidity: rand(35, 95),
    lightning: rand(0, 100) < 30 ? rand(50, 90) : rand(0, 30),
  }))

/* ===== 모의 예보 · 대기질 =====
 * 상세 화면도 "모의 데이터" 모드를 그대로 따르도록,
 * 통신 없이 3시간 단위 예보와 대기질을 만들어 준다.
 * 형태는 utils/weatherMapper 의 mapForecast · mapAirPollution 결과와 동일하다. */
const STATUS_POOL = ['맑음', '구름', '흐림', '비']

export const createMockForecast = (course, count = 6) => {
  const base = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const at = base + (i + 1) * 3 * 60 * 60 * 1000
    const date = new Date(at)
    const status = STATUS_POOL[rand(0, STATUS_POOL.length - 1)]
    const pop = status === '비' ? rand(50, 90) : rand(0, 30)

    return {
      at,
      timeText: `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}시`,
      /* 현재 기온을 기준으로 ±3℃ 안에서 흔들리게 */
      temp: (course?.temp ?? 20) + rand(-3, 3),
      status,
      description: `${status} (모의)`,
      windSpeed: rand(0, 12),
      windDeg: rand(0, 7) * 45,
      humidity: rand(40, 95),
      pop,
      lightning: pop >= 70 ? rand(50, 80) : rand(0, 20),
    }
  })
}

const AQI_TEXT = { 1: '좋음', 2: '양호', 3: '보통', 4: '나쁨', 5: '매우 나쁨' }

export const createMockAir = () => {
  const aqi = rand(1, 4)
  return {
    aqi,
    aqiText: AQI_TEXT[aqi],
    pm10: aqi * rand(12, 22),
    pm25: aqi * rand(7, 14),
  }
}
