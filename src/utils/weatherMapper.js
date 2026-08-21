/* ===== OpenWeatherMap 응답 → 앱 내부 형식 변환 =====
 * 외부 API의 형태가 바뀌어도 이 파일만 고치면 화면 코드는 그대로 둘 수 있다. */

/* 날씨 상태 코드(weather[0].id) → 앱에서 쓰는 한글 상태
 * https://openweathermap.org/weather-conditions */
export const toKoreanStatus = (id) => {
  if (id >= 200 && id < 300) return '뇌우'
  if (id >= 300 && id < 600) return '비'
  if (id >= 600 && id < 700) return '눈'
  if (id >= 700 && id < 800) return '안개'
  if (id === 800) return '맑음'
  if (id <= 802) return '구름'
  return '흐림'
}

/* 무료 플랜에는 낙뢰 확률 항목이 없어서 상태 코드 + 강수확률(pop)로 추정한다.
 * 2xx(뇌우)면 매우 높게, 비면 강수확률에 비례, 그 외는 낮게 잡는다. */
export const estimateLightning = (id, pop = 0) => {
  if (id >= 200 && id < 300) return Math.max(80, Math.round(pop * 100))
  if (id >= 500 && id < 600) return Math.round(pop * 50)
  return Math.round(pop * 15)
}

/* 현재 날씨 응답 → course 객체에 덮어쓸 필드 */
export const mapCurrentWeather = (data) => ({
  temp: Math.round(data.main.temp),
  status: toKoreanStatus(data.weather[0].id),
  description: data.weather[0].description,
  windSpeed: Math.round(data.wind.speed * 10) / 10,
  windDeg: Math.round(data.wind.deg ?? 0),
  humidity: data.main.humidity,
  lightning: estimateLightning(data.weather[0].id),
  observedAt: data.dt * 1000,
  /* 일출·일몰은 티오프 가능 시간 계산에 쓴다 (추가 API 호출 불필요) */
  sunrise: data.sys?.sunrise ? data.sys.sunrise * 1000 : null,
  sunset: data.sys?.sunset ? data.sys.sunset * 1000 : null,
  timezone: data.timezone ?? 32400,
})

/* 대기 오염 응답 → 미세먼지 요약 */
const AQI_TEXT = { 1: '좋음', 2: '양호', 3: '보통', 4: '나쁨', 5: '매우 나쁨' }

export const mapAirPollution = (data) => {
  const item = data.list[0]
  return {
    aqi: item.main.aqi,
    aqiText: AQI_TEXT[item.main.aqi] ?? '-',
    pm10: Math.round(item.components.pm10),
    pm25: Math.round(item.components.pm2_5),
  }
}

/* 예보 응답 → 3시간 단위 슬롯 배열 (티타임 후보) */
export const mapForecast = (data, count = 6) =>
  data.list.slice(0, count).map((item) => {
    const at = new Date(item.dt * 1000)
    return {
      at: item.dt * 1000,
      timeText: `${at.getMonth() + 1}/${at.getDate()} ${String(at.getHours()).padStart(2, '0')}시`,
      temp: Math.round(item.main.temp),
      status: toKoreanStatus(item.weather[0].id),
      description: item.weather[0].description,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      windDeg: Math.round(item.wind.deg ?? 0),
      humidity: item.main.humidity,
      pop: Math.round((item.pop ?? 0) * 100),
      lightning: estimateLightning(item.weather[0].id, item.pop ?? 0),
    }
  })
