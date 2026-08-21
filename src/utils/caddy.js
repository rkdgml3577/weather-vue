/* ===== 캐디 조언 계산 로직 (순수 함수) =====
 * View가 여러 개로 나뉘어도 같은 계산을 쓰도록 컴포넌트 밖으로 분리했다. */

/* 3m/s 맞바람 당 1클럽 보정 */
const CLUB_PER_MS = 3

/* 실력별 바람 민감도: 탄도가 높은 초보일수록 바람 영향을 크게 받는다 */
export const LEVEL_SENSITIVITY = {
  beginner: 1.3,
  amateur: 1.0,
  pro: 0.8,
}

export const LEVEL_TEXT = {
  beginner: '초급',
  amateur: '중급',
  pro: '상급',
}

/* 풍향(deg) → 8방위 텍스트 */
const DIR_TEXT = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
export const degToText = (deg) => DIR_TEXT[Math.round((deg % 360) / 45) % 8]

/* 홀 방향 대비 바람 성분
 * head : + 맞바람 / - 뒷바람 (m/s)
 * side : + 오른쪽에서 불어옴 / - 왼쪽에서 불어옴 (m/s) */
export const getWindVector = (course, holeDeg) => {
  const diff = ((course.windDeg - holeDeg + 540) % 360) - 180 // -180 ~ 180
  const rad = (diff * Math.PI) / 180
  return { diff, head: course.windSpeed * Math.cos(rad), side: course.windSpeed * Math.sin(rad) }
}

/* 클럽 조언 (맞바람/뒷바람) */
export const getClubAdvice = (course, holeDeg, sensitivity) => {
  const { head } = getWindVector(course, holeDeg)
  const step = Math.max(-3, Math.min(3, Math.round((head * sensitivity) / CLUB_PER_MS)))

  if (step >= 1) return { step, text: `맞바람! 평소보다 ${step}클럽 길게 잡으세요.` }
  if (step <= -1) return { step, text: `뒷바람! 평소보다 ${Math.abs(step)}클럽 짧게 잡으세요.` }
  return { step, text: '바람 영향 미미, 평소 클럽 그대로.' }
}

/* 조준 조언 (옆바람) */
export const getAimAdvice = (course, holeDeg, sensitivity) => {
  const { side } = getWindVector(course, holeDeg)
  const steps = Math.round(Math.abs(side) * sensitivity * 1.2)
  if (steps < 1) return ''
  return side > 0
    ? `오른쪽에서 부는 옆바람, 깃대 오른쪽 ${steps}걸음 조준.`
    : `왼쪽에서 부는 옆바람, 깃대 왼쪽 ${steps}걸음 조준.`
}

/* 습도 조언 */
export const getHumidityAdvice = (course) => {
  if (course.humidity >= 85) return '습도 매우 높음 · 젖은 러프 플라이어 주의, 그립 수건 필수.'
  if (course.humidity >= 70) return '습도 높음 · 그립이 미끄러울 수 있어요.'
  if (course.humidity <= 40) return '건조함 · 런이 많이 발생하니 짧게 떨어뜨리세요.'
  return '습도 적정 · 평소 감각대로.'
}

/* 종합 판정 */
export const judgePlay = (course, holeDeg, sensitivity) => {
  const base = {
    club: getClubAdvice(course, holeDeg, sensitivity),
    aim: getAimAdvice(course, holeDeg, sensitivity),
    humidityAdvice: getHumidityAdvice(course),
    windText: `${degToText(course.windDeg)}풍 ${course.windSpeed}m/s`,
  }

  // 낙뢰 → 최우선 위험
  if (course.lightning >= 50) {
    return {
      ...base,
      level: 'danger',
      label: '플레이 중단',
      className: 'play-danger',
      message: `낙뢰 확률 ${course.lightning}%! 즉시 카트로 대피하세요.`,
    }
  }
  // 강풍/악천후 → 위험
  if (course.windSpeed >= 12 || course.status === '눈') {
    return {
      ...base,
      level: 'danger',
      label: '라운딩 위험',
      className: 'play-danger',
      message: '강풍/악천후로 정상적인 샷이 어렵습니다.',
    }
  }
  // 낙뢰 가능성 → 주의
  if (course.lightning >= 20) {
    return {
      ...base,
      level: 'caution',
      label: '라운딩 주의',
      className: 'play-caution',
      message: `낙뢰 확률 ${course.lightning}% · 그늘집 근처에서 상황을 지켜보세요.`,
    }
  }
  // 우천 → 주의
  if (course.status === '비' || course.status === '뇌우') {
    return {
      ...base,
      level: 'caution',
      label: '라운딩 주의',
      className: 'play-caution',
      message: '비로 그립과 라이가 젖습니다. 우천 장비를 챙기세요.',
    }
  }
  // 안개 → 주의
  if (course.status === '안개') {
    return {
      ...base,
      level: 'caution',
      label: '라운딩 주의',
      className: 'play-caution',
      message: '시야 확보가 어렵습니다. 앞 팀 위치를 꼭 확인하세요.',
    }
  }
  // 고온다습 → 주의
  if (course.temp >= 30 && course.humidity >= 70) {
    return {
      ...base,
      level: 'caution',
      label: '라운딩 주의',
      className: 'play-caution',
      message: '고온다습, 온열질환 주의! 수분 자주 보충하세요.',
    }
  }
  return {
    ...base,
    level: 'good',
    label: '라운딩 최적',
    className: 'play-good',
    message: '컨디션 좋은 날! 자신 있게 치세요.',
  }
}
