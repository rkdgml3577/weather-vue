/* ===== 일몰 기준 티오프 계산 (순수 함수) =====
 * OpenWeatherMap 현재 날씨 응답에 이미 sunrise/sunset이 들어 있어
 * 추가 API 호출 없이 "지금 나가면 몇 홀까지 돌 수 있는지"를 계산할 수 있다.
 */

/* 1홀 소요 시간(분). 18홀 4시간 30분 = 홀당 15분 */
export const MINUTES_PER_HOLE = 15
/* 해가 완전히 지기 전에 마쳐야 하므로 남겨 두는 여유 */
export const BUFFER_MINUTES = 15

/* 일몰까지 남은 분 (음수면 이미 해가 짐) */
export const getMinutesUntilSunset = (nowMs, sunsetMs) => {
  if (!sunsetMs) return null
  return Math.floor((sunsetMs - nowMs) / 60000)
}

/* 지금 출발하면 소화 가능한 홀 수 (0 ~ 18) */
export const getPlayableHoles = (nowMs, sunsetMs) => {
  const remaining = getMinutesUntilSunset(nowMs, sunsetMs)
  if (remaining === null) return null
  const holes = Math.floor((remaining - BUFFER_MINUTES) / MINUTES_PER_HOLE)
  return Math.max(0, Math.min(18, holes))
}

/* 해당 홀 수를 마치려면 늦어도 언제 티오프해야 하는지 (ms) */
export const getLastTeeOff = (sunsetMs, holes = 18) => {
  if (!sunsetMs) return null
  return sunsetMs - (holes * MINUTES_PER_HOLE + BUFFER_MINUTES) * 60000
}

/* 시각 표기 (브라우저 로컬 타임존 기준) */
export const formatClock = (ms) =>
  ms ? new Date(ms).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'

/* 화면에 바로 쓸 수 있는 요약 */
export const getTeeTimeSummary = (course, nowMs = Date.now()) => {
  const sunsetMs = course?.sunset ?? null
  if (!sunsetMs) return null

  const holes = getPlayableHoles(nowMs, sunsetMs)
  const minutesLeft = getMinutesUntilSunset(nowMs, sunsetMs)

  return {
    sunsetText: formatClock(sunsetMs),
    sunriseText: formatClock(course.sunrise),
    minutesLeft,
    playableHoles: holes,
    /* 18홀 · 9홀 각각의 마지막 티오프 */
    lastTeeOff18: formatClock(getLastTeeOff(sunsetMs, 18)),
    lastTeeOff9: formatClock(getLastTeeOff(sunsetMs, 9)),
    /* 2시간도 안 남았으면 경고 */
    isTight: minutesLeft !== null && minutesLeft < 120,
    isOver: minutesLeft !== null && minutesLeft <= BUFFER_MINUTES,
    message:
      holes === null
        ? ''
        : holes === 0
          ? '오늘은 라운딩을 시작하기에 늦었습니다.'
          : holes >= 18
            ? '지금 출발하면 18홀 모두 소화할 수 있습니다.'
            : `지금 출발하면 약 ${holes}홀까지 가능합니다.`,
  }
}
