import { defineStore } from 'pinia'
import { createDashboardCourses, randomizeWeather, PLACEHOLDER_WEATHER } from '@/data/mockCourses'
import { DEFAULT_DASHBOARD_IDS, findGolfCourse } from '@/data/golfCourses'
import { getCurrentWeather } from '@/api/weatherApi'
import { mapCurrentWeather } from '@/utils/weatherMapper'

const STORAGE_KEY = 'caddy.dashboard.courses'

/* 대시보드에 담을 수 있는 골프장 최대 개수.
 * 실시간 조회가 한 번에 이 수만큼 동시 요청되므로 무한정 늘리지 않는다. */
export const MAX_DASHBOARD_COURSES = 20

/* 대시보드 구성은 브라우저에 저장해 다음 방문에도 유지한다 */
const loadDashboardIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(saved) && saved.length > 0) {
      /* 저장된 값이 한도를 넘더라도 앞에서부터 20곳만 복원한다 */
      return saved.filter((id) => findGolfCourse(id)).slice(0, MAX_DASHBOARD_COURSES)
    }
  } catch {
    /* 손상된 값이면 기본값으로 되돌린다 */
  }
  return DEFAULT_DASHBOARD_IDS
}

const saveDashboardIds = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* 저장 실패(사생활 보호 모드 등)는 무시하고 진행 */
  }
}

/* ===== 날씨 데이터 스토어 =====
 * 화면(View)은 통신 방법을 몰라도 되고, 이 스토어의 state만 바라본다.
 */
export const useWeatherStore = defineStore('weather', {
  state: () => ({
    courses: createDashboardCourses(loadDashboardIds()),
    isLoading: false,
    error: '',
    lastUpdated: null,
    source: 'mock', // 'mock' | 'live'
  }),

  getters: {
    /* 인자를 받는 getter는 함수를 반환하는 방식으로 만든다 */
    courseById: (state) => (id) => state.courses.find((c) => c.id === id),

    dashboardIds: (state) => state.courses.map((c) => c.id),

    isOnDashboard: (state) => (id) => state.courses.some((c) => c.id === id),

    /* 담은 개수 / 한도 */
    courseCount: (state) => state.courses.length,
    maxCourses: () => MAX_DASHBOARD_COURSES,
    isFull: (state) => state.courses.length >= MAX_DASHBOARD_COURSES,
    remainingSlots: (state) => Math.max(0, MAX_DASHBOARD_COURSES - state.courses.length),

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
     * 대시보드의 모든 골프장을 Promise.all로 동시에 요청한다. */
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

    /* ===== 골프장 1곳의 최신 날씨 =====
     * 대시보드에 없는 골프장도 조회할 수 있도록 전체 디렉터리에서 찾는다.
     * 상세 페이지 진입 시 사용. */
    async fetchCourseWeather(courseId) {
      const target = this.courseById(courseId) ?? findGolfCourse(courseId)
      if (!target) return null

      try {
        const data = await getCurrentWeather(target.lat, target.lon)
        const merged = { ...target, ...PLACEHOLDER_WEATHER, ...mapCurrentWeather(data) }

        /* 대시보드에 있는 골프장이면 목록도 함께 갱신한다 */
        if (this.isOnDashboard(courseId)) {
          this.courses = this.courses.map((c) => (c.id === courseId ? { ...c, ...merged } : c))
          this.lastUpdated = Date.now()
        }
        return merged
      } catch (error) {
        this.error = error.friendlyMessage ?? error.message ?? '알 수 없는 오류'
        console.error('[weatherStore] 단일 골프장 조회 실패:', error)
        return null
      }
    },

    /* ===== 대시보드 구성 변경 ===== */
    /* 결과를 { ok, reason, course } 로 돌려준다. 알림 문구는 화면에서 결정한다. */
    async addCourse(courseId) {
      if (this.isOnDashboard(courseId)) {
        return { ok: false, reason: 'duplicate' }
      }
      const info = findGolfCourse(courseId)
      if (!info) {
        return { ok: false, reason: 'not-found' }
      }
      /* 한도 초과 — 담지 않고 알린다 */
      if (this.isFull) {
        return { ok: false, reason: 'full', max: MAX_DASHBOARD_COURSES }
      }

      this.courses = [...this.courses, { ...info, ...PLACEHOLDER_WEATHER }]
      saveDashboardIds(this.dashboardIds)
      await this.fetchCourseWeather(courseId)
      return { ok: true, course: info }
    },

    removeCourse(courseId) {
      const target = this.courseById(courseId)
      this.courses = this.courses.filter((c) => c.id !== courseId)
      saveDashboardIds(this.dashboardIds)
      return target ?? null
    },

    resetDashboard() {
      this.courses = createDashboardCourses(DEFAULT_DASHBOARD_IDS)
      saveDashboardIds(this.dashboardIds)
      this.source = 'mock'
    },

    /* ===== 골프장 1곳만 모의 갱신 (통신 없음) =====
     * 상세 화면이 모의 모드로 열렸을 때 '조회 전' 자리표시자 대신 값을 채운다. */
    mockCourseWeather(courseId) {
      const base = this.courseById(courseId) ?? findGolfCourse(courseId)
      if (!base) return null

      const mocked = randomizeWeather([{ ...PLACEHOLDER_WEATHER, ...base }])[0]
      mocked.description = '모의 데이터'

      if (this.isOnDashboard(courseId)) {
        this.courses = this.courses.map((c) => (c.id === courseId ? { ...c, ...mocked } : c))
        this.lastUpdated = Date.now()
      }
      return mocked
    },

    /* ===== 모의 데이터 갱신 (통신 없음) ===== */
    refreshMockWeather() {
      this.courses = randomizeWeather(this.courses)
      this.source = 'mock'
      this.lastUpdated = Date.now()
    },
  },
})
