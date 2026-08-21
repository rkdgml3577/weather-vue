import { defineStore } from 'pinia'
import { createMockCourses, randomizeWeather } from '@/data/mockCourses'
import { getCurrentWeather } from '@/api/weatherApi'
import { mapCurrentWeather } from '@/utils/weatherMapper'

/* ===== 날씨 데이터 스토어 =====
 * 화면(View)은 통신 방법을 몰라도 되고, 이 스토어의 state만 바라본다.
 */
export const useWeatherStore = defineStore('weather', {
  state: () => ({
    courses: createMockCourses(),
    isLoading: false,
    error: '',
    lastUpdated: null,
    source: 'mock', // 'mock' | 'live'
  }),

  getters: {
    /* 인자를 받는 getter는 함수를 반환하는 방식으로 만든다 */
    courseById: (state) => (id) => state.courses.find((c) => c.id === id),

    isLive: (state) => state.source === 'live',

    lastUpdatedText: (state) =>
      state.lastUpdated
        ? new Date(state.lastUpdated).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : '',

    lightningCount: (state) => state.courses.filter((c) => c.lightning >= 50).length,
  },

  actions: {
    /* ===== 실시간 날씨 불러오기 (Axios) =====
     * 10개 지역을 Promise.all로 동시에 요청한다. */
    async fetchLiveWeather() {
      this.isLoading = true
      this.error = ''
      try {
        const responses = await Promise.all(
          this.courses.map((c) => getCurrentWeather(c.lat, c.lon)),
        )
        this.courses = this.courses.map((course, i) => ({
          ...course,
          ...mapCurrentWeather(responses[i]),
        }))
        this.source = 'live'
        this.lastUpdated = Date.now()
      } catch (error) {
        // 통신 실패 시 기존 데이터는 그대로 두고 메시지만 남긴다
        this.error = error.friendlyMessage ?? error.message ?? '알 수 없는 오류'
        console.error('[weatherStore] 실시간 날씨 조회 실패:', error)
      } finally {
        this.isLoading = false
      }
    },

    /* ===== 특정 지역 1곳만 최신화 (상세 페이지 진입 시) ===== */
    async fetchCourseWeather(cityId) {
      const target = this.courses.find((c) => c.id === cityId)
      if (!target) return null

      try {
        const data = await getCurrentWeather(target.lat, target.lon)
        const mapped = mapCurrentWeather(data)
        this.courses = this.courses.map((c) => (c.id === cityId ? { ...c, ...mapped } : c))
        this.lastUpdated = Date.now()
        return this.courseById(cityId)
      } catch (error) {
        this.error = error.friendlyMessage ?? error.message ?? '알 수 없는 오류'
        console.error('[weatherStore] 단일 지역 조회 실패:', error)
        return null
      }
    },

    /* ===== 모의 데이터 갱신 (통신 없음) ===== */
    refreshMockWeather() {
      this.courses = randomizeWeather(this.courses)
      this.source = 'mock'
      this.lastUpdated = Date.now()
    },
  },
})
