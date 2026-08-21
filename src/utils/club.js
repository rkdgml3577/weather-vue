import { getWindVector } from '@/utils/caddy'

/* ===== 클럽 추천 계산 (순수 함수) =====
 * 남은 거리를 바람·기온·노면 상태로 보정해 "실제로 몇 미터처럼 치는지"를 구하고,
 * 사용자의 클럽별 캐리 거리와 비교해 클럽을 골라 준다.
 */

/* 보정 계수 */
const HEADWIND_PER_MS = 0.015 // 맞바람 1m/s 당 +1.5%
const TAILWIND_PER_MS = 0.01 // 뒷바람 1m/s 당 -1.0%
const TEMP_BASE = 20 // 기준 기온(℃)
const TEMP_PER_DEGREE = 0.001 // 1℃ 낮아질 때마다 +0.1%
const WET_PENALTY = 0.02 // 비/젖은 페어웨이는 런이 죽으므로 +2%

/* 기본 클럽 세트 (사용자가 수정하면 localStorage에 저장된다) */
export const DEFAULT_BAG = [
  { id: 'driver', name: '드라이버', distance: 220 },
  { id: 'wood3', name: '3번 우드', distance: 200 },
  { id: 'util5', name: '5번 유틸', distance: 180 },
  { id: 'iron5', name: '5번 아이언', distance: 165 },
  { id: 'iron6', name: '6번 아이언', distance: 155 },
  { id: 'iron7', name: '7번 아이언', distance: 145 },
  { id: 'iron8', name: '8번 아이언', distance: 133 },
  { id: 'iron9', name: '9번 아이언', distance: 120 },
  { id: 'pw', name: '피칭 웨지', distance: 105 },
  { id: 'aw', name: '52° 웨지', distance: 90 },
  { id: 'sw', name: '56° 웨지', distance: 75 },
]

/* ===== 실제 플레이 거리 =====
 * 어떤 항목이 몇 미터를 더하고 뺐는지 breakdown으로 함께 돌려준다(화면에 근거를 보여주기 위함). */
export const getPlaysLikeDistance = (distance, course, holeDeg, sensitivity) => {
  const base = Number(distance) || 0
  if (base <= 0) return { playsLike: 0, breakdown: [] }

  const { head } = getWindVector(course, holeDeg)
  const effHead = head * sensitivity

  const windRate = effHead >= 0 ? effHead * HEADWIND_PER_MS : effHead * TAILWIND_PER_MS
  const tempRate = (TEMP_BASE - course.temp) * TEMP_PER_DEGREE
  const wetRate = course.status === '비' || course.status === '뇌우' ? WET_PENALTY : 0

  const windDelta = Math.round(base * windRate)
  const tempDelta = Math.round(base * tempRate)
  const wetDelta = Math.round(base * wetRate)

  const breakdown = [
    {
      label:
        effHead >= 0
          ? `맞바람 ${effHead.toFixed(1)}m/s`
          : `뒷바람 ${Math.abs(effHead).toFixed(1)}m/s`,
      delta: windDelta,
    },
    { label: `기온 ${course.temp}℃`, delta: tempDelta },
  ]
  if (wetDelta !== 0) breakdown.push({ label: '젖은 노면', delta: wetDelta })

  return {
    playsLike: Math.max(1, base + windDelta + tempDelta + wetDelta),
    breakdown: breakdown.filter((b) => b.delta !== 0),
  }
}

/* ===== 클럽 선택 ===== */
export const recommendClub = (playsLike, bag) => {
  if (!playsLike || !bag?.length) return null

  /* 거리 내림차순으로 정렬해 두고 가장 가까운 클럽을 찾는다 */
  const sorted = [...bag].filter((c) => c.distance > 0).sort((a, b) => b.distance - a.distance)
  if (sorted.length === 0) return null

  const best = sorted.reduce((closest, club) =>
    Math.abs(club.distance - playsLike) < Math.abs(closest.distance - playsLike) ? club : closest,
  )

  const index = sorted.indexOf(best)
  const gap = playsLike - best.distance

  /* 남은 거리가 클럽 거리보다 길면 한 클럽 위, 짧으면 한 클럽 아래를 대안으로 */
  const alternative = gap > 0 ? (sorted[index - 1] ?? null) : (sorted[index + 1] ?? null)

  const note =
    Math.abs(gap) <= 3
      ? '거리가 딱 맞습니다. 평소 스윙으로 치세요.'
      : gap > 0
        ? `${gap}m 부족합니다. 한 클럽 길게 잡거나 스윙을 조금 크게 가져가세요.`
        : `${Math.abs(gap)}m 남습니다. 그립을 짧게 잡아 거리를 죽이세요.`

  return { best, alternative, gap, note }
}
