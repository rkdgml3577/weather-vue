import axios from 'axios'

/* ===== OpenWeatherMap 통신 계층 =====
 * 컴포넌트는 이 파일의 함수만 호출한다.
 * URL·키·공통 파라미터가 바뀌어도 여기만 고치면 된다.
 */
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

/* 공통 설정을 담은 axios 인스턴스 */
const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
  params: {
    appid: API_KEY, // 요청마다 자동으로 붙는다
    units: 'metric', // 섭씨 · m/s
    lang: 'kr', // 한글 설명
  },
})

/* 요청 직전에 키 존재 여부를 확인해 원인을 알기 쉬운 에러로 바꿔 준다 */
weatherApi.interceptors.request.use((config) => {
  if (!API_KEY) {
    return Promise.reject(new Error('.env 파일에 VITE_OPENWEATHER_API_KEY가 없습니다.'))
  }
  return config
})

/* 응답에서 껍데기를 벗겨 data만 넘긴다 */
weatherApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // 4xx/5xx·타임아웃·오프라인이 모두 이 경로로 들어온다
    const status = error.response?.status
    const message = error.response?.data?.message ?? error.message
    error.friendlyMessage =
      status === 401
        ? 'API 키가 유효하지 않습니다. (발급 후 활성화까지 수십 분 걸릴 수 있습니다)'
        : status === 429
          ? '호출 횟수 제한을 초과했습니다. 잠시 후 다시 시도하세요.'
          : `통신 실패: ${message}`
    return Promise.reject(error)
  },
)

/* ① 현재 날씨 (기온·풍속·풍향·습도) */
export const getCurrentWeather = async (lat, lon) => {
  const { data } = await weatherApi.get('/weather', { params: { lat, lon } })
  return data
}

/* ② 5일/3시간 예보 — 티타임 추천에 사용 */
export const getForecast = async (lat, lon, cnt = 8) => {
  const { data } = await weatherApi.get('/forecast', { params: { lat, lon, cnt } })
  return data
}

/* ③ 대기 오염 (미세먼지) — 야외 스포츠 판단에 사용 */
export const getAirPollution = async (lat, lon) => {
  const { data } = await weatherApi.get('/air_pollution', { params: { lat, lon } })
  return data
}
