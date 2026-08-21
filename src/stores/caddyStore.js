import { defineStore } from 'pinia'
import { LEVEL_SENSITIVITY, LEVEL_TEXT, degToText } from '@/utils/caddy'

/* ===== 추가 스토어: 라운딩 조건 =====
 * 홀 방향/플레이어 실력은 여러 View가 함께 쓰고 페이지를 옮겨도 유지돼야 하므로
 * composable 대신 Pinia 스토어로 승격시켰다.
 */
export const useCaddyStore = defineStore('caddy', {
  state: () => ({
    holeDeg: 0, // 홀(타겟) 진행 방향 0=북, 90=동, 180=남, 270=서
    playerLevel: 'amateur', // beginner | amateur | pro
  }),

  getters: {
    /* 실력별 바람 민감도: 탄도가 높은 초보일수록 바람 영향이 크다 */
    windSensitivity: (state) => LEVEL_SENSITIVITY[state.playerLevel] ?? 1.0,

    /* 홀 방향을 8방위 한글로 */
    holeText: (state) => degToText(state.holeDeg),

    /* 실력 한글 표기 */
    levelText: (state) => LEVEL_TEXT[state.playerLevel] ?? '',
  },

  actions: {
    setHoleDeg(deg) {
      this.holeDeg = deg
    },
    setPlayerLevel(level) {
      this.playerLevel = level
    },
  },
})
