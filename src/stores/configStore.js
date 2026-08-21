import { defineStore } from 'pinia'

/* ===== 앱 전역 환경 설정 스토어 =====
 * state   : 단위 저장 변수
 * getters : 현재 단위에 맞는 기호/이름
 * actions : 단위 토글
 */
export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 'celsius' | 'fahrenheit'
  }),

  getters: {
    /* 현재 단위 상태에 맞는 기호 (℃ / ℉) */
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),

    /* 화면 표기용 한글 이름 */
    unitLabel: (state) => (state.unit === 'celsius' ? '섭씨' : '화씨'),

    /* 조건 분기를 짧게 쓰기 위한 보조 getter */
    isFahrenheit: (state) => state.unit === 'fahrenheit',
  },

  actions: {
    /* 'celsius' ↔ 'fahrenheit' 토글(스위칭) */
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
    },

    /* 특정 단위로 직접 지정 */
    setUnit(unit) {
      if (unit === 'celsius' || unit === 'fahrenheit') {
        this.unit = unit
      }
    },
  },
})
