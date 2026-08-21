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
