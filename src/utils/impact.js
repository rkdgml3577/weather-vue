import { getWindVector, getAimAdvice } from '@/utils/caddy'

/* ===== 임팩트 포인트 가이드 (순수 함수) =====
 * "몇 클럽 길게"에서 한 걸음 더 나아가, 공의 어느 지점을 노려야 하는지를 좌표로 돌려준다.
 *
 * 좌표계: 공 정면 기준 -1 ~ 1
 *   x  -1(안쪽/타깃 왼쪽 면) ← 0(중앙) → +1(바깥쪽/타깃 오른쪽 면)
 *   y  -1(적도 아래) ← 0(적도) → +1(적도 위)
 *
 * ⚠️ 실력에 따라 조언을 달리한다.
 *    초급자에게 펀치샷·기어이펙트를 권하면 미스샷만 늘어나므로,
 *    초급은 "중앙 정타 + 클럽 교체"만 안내한다.
 */

export const IMPACT_CAPTION =
  '단순화된 교육용 가이드입니다. 좌우 지점은 클럽 페이스의 기어 이펙트를 공 기준으로 옮겨 표현한 것으로, 실제 스윙 교습을 대체하지 않습니다.'

/* 판정 임계값 (m/s, 실력 보정이 적용된 값 기준) */
const HEAD_STRONG = 5
const HEAD_MILD = 2.5
const SIDE_MEANINGFUL = 3

/* 탄도 높이 → 궤적 그리기용 비율 */
const APEX_RATIO = { low: 0.34, mid: 0.56, high: 0.8 }

/* 좌표 → 한글 위치 이름 */
const toZoneLabel = (x, y) => {
  const vertical = y > 0.15 ? '적도 위쪽' : y < -0.15 ? '적도 아래쪽' : '적도(중앙)'
  const horizontal = x > 0.15 ? '바깥쪽 면' : x < -0.15 ? '안쪽 면' : '중앙'
  return `${vertical} · ${horizontal}`
}

/* 초급: 타점 고정, 클럽으로만 대응 */
const beginnerGuide = (head, isWindy, isWet) => {
  const reason =
    head >= HEAD_MILD
      ? `맞바람에서 세게 치면 스핀이 늘어 공이 더 밀립니다. 클럽을 길게 잡고 평소 스윙을 하세요.`
      : head <= -HEAD_MILD
        ? `뒷바람은 공을 밀어 주지만 그만큼 런도 늘어납니다. 짧은 클럽으로 여유를 두세요.`
        : `바람 영향이 크지 않습니다. 타점 걱정 없이 중앙을 정확히 맞히는 데 집중하세요.`

  return {
    point: { x: 0, y: 0 },
    shotName: '중앙 정타',
    ballPosition: '평소 볼 위치 그대로',
    swingTip: isWindy
      ? '스탠스를 한 뼘 넓히고 그립을 1인치 짧게 잡으세요.'
      : '평소 리듬 그대로, 힘을 빼고 스윙하세요.',
    apex: 'mid',
    curve: 'straight',
    levelNote: '초급자는 타점을 일부러 바꾸지 마세요. 바람은 스윙이 아니라 클럽으로 이깁니다.',
    reason: isWet ? `${reason} 비로 젖은 상태라 정타가 더 중요합니다.` : reason,
  }
}

/* 상하 타점 (중급 이상 공통) */
const getVertical = (head) => {
  if (head >= HEAD_STRONG) {
    return {
      y: 0.45,
      apex: 'low',
      name: '펀치샷',
      ballPosition: '스탠스 중앙보다 공 한 개 뒤',
      swingTip: '3/4 백스윙, 피니시를 어깨 높이로 낮게 마무리하세요.',
      why: '강한 맞바람을 뚫으려면 탄도를 낮춰 바람에 노출되는 시간을 줄여야 합니다.',
    }
  }
  if (head >= HEAD_MILD) {
    return {
      y: 0.25,
      apex: 'low',
      name: '낮은 탄도',
      ballPosition: '공 반 개 뒤',
      swingTip: '평소보다 피니시를 조금 낮게 가져가세요.',
      why: '약한 맞바람이라 탄도만 살짝 눌러도 충분합니다.',
    }
  }
  if (head <= -HEAD_STRONG) {
    return {
      y: -0.35,
      apex: 'high',
      name: '하이 볼',
      ballPosition: '스탠스 중앙보다 공 한 개 앞',
      swingTip: '체중을 오른발에 남기고 쓸어 올리듯 치세요.',
      why: '강한 뒷바람은 높이 띄울수록 더 많이 태워 보낼 수 있습니다.',
    }
  }
  if (head <= -HEAD_MILD) {
    return {
      y: -0.2,
      apex: 'mid',
      name: '살짝 높은 탄도',
      ballPosition: '공 반 개 앞',
      swingTip: '평소 스윙에서 피니시만 조금 높게.',
      why: '약한 뒷바람을 태워 캐리를 늘립니다.',
    }
  }
  return {
    y: 0,
    apex: 'mid',
    name: '스탠다드',
    ballPosition: '평소 볼 위치 그대로',
    swingTip: '평소 리듬대로 중앙을 정확히 맞히세요.',
    why: '바람의 앞뒤 성분이 약해 탄도를 조작할 이유가 없습니다.',
  }
}

/* 좌우 커브 (상급 전용) */
const getHorizontal = (side) => {
  if (side >= SIDE_MEANINGFUL) {
    return {
      x: 0.3,
      curve: 'fade',
      name: '홀드 페이드',
      why: '오른쪽에서 부는 바람에 공이 왼쪽으로 밀립니다. 바람을 맞서는 페이드로 상쇄하세요.',
    }
  }
  if (side <= -SIDE_MEANINGFUL) {
    return {
      x: -0.3,
      curve: 'draw',
      name: '홀드 드로우',
      why: '왼쪽에서 부는 바람에 공이 오른쪽으로 밀립니다. 드로우로 버텨 주세요.',
    }
  }
  return { x: 0, curve: 'straight', name: '', why: '' }
}

/* ===== 메인 진입점 ===== */
export const getImpactGuide = (course, holeDeg, playerLevel, sensitivity) => {
  const { head: rawHead, side: rawSide } = getWindVector(course, holeDeg)
  const head = rawHead * sensitivity
  const side = rawSide * sensitivity

  const isWindy = course.windSpeed >= 8
  const isWet = course.status === '비' || course.status === '뇌우' || course.humidity >= 85

  let guide

  if (playerLevel === 'beginner') {
    guide = beginnerGuide(head, isWindy, isWet)
  } else {
    const vertical = getVertical(head)
    // 중급은 상하만, 상급은 좌우 커브까지
    const horizontal =
      playerLevel === 'pro' ? getHorizontal(side) : { x: 0, curve: 'straight', name: '', why: '' }

    /* 위아래 조작이 없으면 커브 이름만, 둘 다 있으면 합쳐서 부른다 */
    const shotName = !horizontal.name
      ? vertical.name
      : vertical.name === '스탠다드'
        ? horizontal.name
        : `${vertical.name.replace('샷', '')} ${horizontal.name.replace('홀드 ', '')}`.trim()

    guide = {
      point: { x: horizontal.x, y: vertical.y },
      shotName,
      ballPosition: vertical.ballPosition,
      swingTip: vertical.swingTip,
      apex: vertical.apex,
      curve: horizontal.curve,
      levelNote:
        playerLevel === 'pro'
          ? '상급자 기준입니다. 좌우 커브는 페이스 타점(토우·힐)으로 만들어집니다.'
          : '중급자는 상하 탄도까지만 조절하고, 좌우는 타점 대신 조준으로 대응하세요.',
      reason: [vertical.why, horizontal.why].filter(Boolean).join(' '),
    }

    // 젖은 상태에서는 스핀이 튀므로 상급자에게 스팅어를 제안
    if (isWet && playerLevel === 'pro' && head >= HEAD_MILD) {
      guide.shotName = '스팅어'
      guide.swingTip = '스핀을 죽여 낮게 깔아 치세요. 페이스를 덮지 말고 손이 앞선 임팩트로.'
    }
  }

  return {
    ...guide,
    zoneLabel: toZoneLabel(guide.point.x, guide.point.y),
    apexRatio: APEX_RATIO[guide.apex],
    /* 중급 이하에서 좌우 바람은 조준으로 대응한다 (기존 캐디 조언 재사용) */
    aimHint: playerLevel === 'pro' ? '' : getAimAdvice(course, holeDeg, sensitivity),
    /* SVG 바람 화살표용 원본 성분 */
    wind: { head, side, speed: course.windSpeed },
  }
}
