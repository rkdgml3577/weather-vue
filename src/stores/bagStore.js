import { defineStore } from 'pinia'
import { DEFAULT_BAG } from '@/utils/club'

const STORAGE_KEY = 'caddy.myBag'

/* 저장된 클럽 거리를 불러온다 (없거나 손상됐으면 기본 세트) */
const loadBag = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(saved) && saved.length > 0) return saved
  } catch {
    /* 무시하고 기본값 사용 */
  }
  return DEFAULT_BAG.map((c) => ({ ...c }))
}

/* ===== 내 클럽 거리 스토어 =====
 * 사람마다 비거리가 다르므로 사용자가 직접 입력한 값을 브라우저에 저장해 둔다.
 */
export const useBagStore = defineStore('bag', {
  state: () => ({
    clubs: loadBag(),
  }),

  getters: {
    /* 거리 내림차순 정렬본 */
    sortedClubs: (state) => [...state.clubs].sort((a, b) => b.distance - a.distance),

    longest: (state) => Math.max(...state.clubs.map((c) => c.distance)),
    shortest: (state) => Math.min(...state.clubs.map((c) => c.distance)),
  },

  actions: {
    setDistance(clubId, distance) {
      const value = Math.max(0, Math.min(400, Number(distance) || 0))
      this.clubs = this.clubs.map((c) => (c.id === clubId ? { ...c, distance: value } : c))
      this.persist()
    },

    resetBag() {
      this.clubs = DEFAULT_BAG.map((c) => ({ ...c }))
      this.persist()
    },

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.clubs))
      } catch {
        /* 저장 실패는 무시 */
      }
    },
  },
})
