<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { computed } from 'vue'
import { IMPACT_CAPTION } from '@/utils/impact'

/* 임팩트 지점을 골프공 그림 위에 찍어 보여 준다.
 * 계산은 utils/impact.js가 하고, 이 컴포넌트는 그리기만 담당한다. */
const props = defineProps({
  guide: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})

/* ===== 골프공 정면도 ===== */
const BALL_CENTER = 100
const BALL_RADIUS = 74
const POINT_SCALE = 52 // -1~1 좌표를 픽셀로 늘리는 비율

/* 타격 지점 (SVG는 y축이 아래로 커지므로 부호를 뒤집는다) */
const markerX = computed(() => BALL_CENTER + props.guide.point.x * POINT_SCALE)
const markerY = computed(() => BALL_CENTER - props.guide.point.y * POINT_SCALE)

/* 딤플 패턴: 육각 배치를 흉내 낸 고정 좌표 */
const dimples = computed(() => {
  const list = []
  for (let row = -3; row <= 3; row++) {
    for (let col = -3; col <= 3; col++) {
      const x = BALL_CENTER + col * 19 + (row % 2 === 0 ? 0 : 9.5)
      const y = BALL_CENTER + row * 18
      const dist = Math.hypot(x - BALL_CENTER, y - BALL_CENTER)
      if (dist < BALL_RADIUS - 9) list.push({ x, y })
    }
  }
  return list
})

/* ===== 바람 화살표 =====
 * head > 0 이면 타깃 쪽(위)에서 불어오고, side > 0 이면 오른쪽에서 불어온다.
 * 화살표는 "바람이 불어 가는 방향"을 향한다. */
const windArrow = computed(() => {
  const { head, side } = props.guide.wind
  const magnitude = Math.hypot(head, side)
  if (magnitude < 0.8) return null

  const ux = -side / magnitude
  const uy = head / magnitude
  return {
    x1: BALL_CENTER - ux * 96,
    y1: BALL_CENTER - uy * 96,
    x2: BALL_CENTER - ux * 84 + ux * 26,
    y2: BALL_CENTER - uy * 84 + uy * 26,
  }
})

/* ===== 탄도 미리보기 ===== */
const TRACK = { left: 16, right: 204, ground: 104 }

const trajectory = computed(() => {
  const apex = 84 * props.guide.apexRatio
  const controlY = TRACK.ground - apex * 2
  // 맞바람일수록 정점 이후 급격히 떨어지도록 정점을 앞쪽에 둔다
  const controlX =
    TRACK.left + (TRACK.right - TRACK.left) * (props.guide.apex === 'low' ? 0.58 : 0.5)
  return `M ${TRACK.left} ${TRACK.ground} Q ${controlX} ${controlY} ${TRACK.right} ${TRACK.ground}`
})

const curveText = computed(
  () =>
    ({
      draw: '↖ 드로우 (왼쪽으로 감김)',
      fade: '↗ 페이드 (오른쪽으로 감김)',
      straight: '— 스트레이트',
    })[props.guide.curve],
)

const apexText = computed(
  () => ({ low: '낮은 탄도', mid: '보통 탄도', high: '높은 탄도' })[props.guide.apex],
)
</script>

<template>
  <div class="impact-guide" :class="{ compact }">
    <div class="diagrams">
      <!-- 골프공 정면도 -->
      <figure class="diagram">
        <svg viewBox="0 0 200 200" role="img" aria-label="골프공 임팩트 지점">
          <defs>
            <radialGradient id="ballShade" cx="38%" cy="32%" r="72%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="70%" stop-color="#f7f9fc" />
              <stop offset="100%" stop-color="#dfe5ee" />
            </radialGradient>
            <marker id="windHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--c-accent)" />
            </marker>
          </defs>

          <circle
            :cx="BALL_CENTER"
            :cy="BALL_CENTER"
            :r="BALL_RADIUS"
            fill="url(#ballShade)"
            stroke="none"
          />

          <circle
            v-for="(d, i) in dimples"
            :key="i"
            :cx="d.x"
            :cy="d.y"
            r="4.2"
            fill="none"
            stroke="#d7dee8"
            stroke-width="1"
          />

          <!-- 3×3 보조 그리드 -->
          <g class="grid">
            <line :x1="BALL_CENTER - 25" y1="30" :x2="BALL_CENTER - 25" y2="170" />
            <line :x1="BALL_CENTER + 25" y1="30" :x2="BALL_CENTER + 25" y2="170" />
            <line x1="30" :y1="BALL_CENTER - 25" x2="170" :y2="BALL_CENTER - 25" />
            <line x1="30" :y1="BALL_CENTER + 25" x2="170" :y2="BALL_CENTER + 25" />
          </g>

          <!-- 적도선 -->
          <line x1="26" :y1="BALL_CENTER" x2="174" :y2="BALL_CENTER" class="equator" />

          <!-- 바람 화살표 -->
          <line
            v-if="windArrow"
            :x1="windArrow.x1"
            :y1="windArrow.y1"
            :x2="windArrow.x2"
            :y2="windArrow.y2"
            class="wind-arrow"
            marker-end="url(#windHead)"
          />

          <!-- 타격 지점 -->
          <g class="marker" :style="{ transform: `translate(${markerX}px, ${markerY}px)` }">
            <circle r="21" class="marker-halo" />
            <circle r="13" class="marker-ring" />
            <line x1="-19" y1="0" x2="19" y2="0" class="marker-cross" />
            <line x1="0" y1="-19" x2="0" y2="19" class="marker-cross" />
            <circle r="3.5" class="marker-dot" />
          </g>
        </svg>
        <figcaption>타격 지점 · {{ guide.zoneLabel }}</figcaption>
      </figure>

      <!-- 예상 탄도 -->
      <figure class="diagram">
        <svg viewBox="0 0 220 120" role="img" aria-label="예상 탄도">
          <line
            :x1="TRACK.left"
            :y1="TRACK.ground"
            :x2="TRACK.right"
            :y2="TRACK.ground"
            class="ground"
          />
          <path :d="trajectory" class="track" />
          <circle :cx="TRACK.left" :cy="TRACK.ground - 3" r="4" class="tee-ball" />
          <text :x="TRACK.left" y="117" class="track-label">티</text>
          <text :x="TRACK.right" y="117" class="track-label" text-anchor="end">그린</text>
        </svg>
        <figcaption>{{ apexText }} · {{ curveText }}</figcaption>
      </figure>
    </div>

    <div v-if="!compact" class="guide-text">
      <p class="shot-name"><AppIcon name="target" :size="16" /> {{ guide.shotName }}</p>
      <dl class="tip-list">
        <div class="tip-row">
          <dt>볼 위치</dt>
          <dd>{{ guide.ballPosition }}</dd>
        </div>
        <div class="tip-row">
          <dt>스윙</dt>
          <dd>{{ guide.swingTip }}</dd>
        </div>
        <div v-if="guide.aimHint" class="tip-row">
          <dt>조준</dt>
          <dd>{{ guide.aimHint }}</dd>
        </div>
      </dl>
      <p class="reason">{{ guide.reason }}</p>
      <p class="level-note"><AppIcon name="info" :size="13" /> {{ guide.levelNote }}</p>
      <p class="caption">{{ IMPACT_CAPTION }}</p>
    </div>
  </div>
</template>

<style scoped>
.impact-guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 그림 타일 ===== */
.diagrams {
  display: grid;
  grid-template-columns: minmax(0, 230px) minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  max-width: 580px;
}
.diagram {
  margin: 0;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
}
.diagram svg {
  display: block;
  width: 100%;
  height: auto;
}
.diagram figcaption {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-soft);
  text-align: center;
}

/* 공 위 보조선 */
.grid line {
  stroke: var(--c-rule-strong);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
.equator {
  stroke: var(--c-ink-faint);
  stroke-width: 1.4;
}

/* 바람 */
.wind-arrow {
  stroke: var(--c-accent);
  stroke-width: 4;
  stroke-linecap: round;
}

/* 타격 지점 */
.marker {
  transition: transform 0.5s var(--ease);
}
.marker-halo {
  fill: var(--c-danger);
  opacity: 0.14;
}
.marker-ring {
  fill: none;
  stroke: var(--c-danger);
  stroke-width: 2.6;
  stroke-dasharray: 5 4;
}
.marker-cross {
  stroke: var(--c-danger);
  stroke-width: 2;
}
.marker-dot {
  fill: var(--c-danger);
}

/* 탄도 */
.ground {
  stroke: var(--c-rule-strong);
  stroke-width: 2;
}
.track {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 3.4;
  stroke-linecap: round;
}
.tee-ball {
  fill: var(--c-ink);
}
.track-label {
  font-size: 9px;
  font-weight: 700;
  fill: var(--c-ink-faint);
}

/* ===== 설명 ===== */
.shot-name {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.035em;
  color: var(--c-ink);
}
.shot-name :deep(svg) {
  color: var(--c-accent);
  stroke-width: 2.2;
}
.tip-list {
  margin: 0 0 14px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
}
.tip-row {
  display: flex;
  gap: 12px;
  padding: 5px 0;
  font-size: 14px;
  font-weight: 600;
}
.tip-row dt {
  flex-shrink: 0;
  width: 54px;
  font-weight: 700;
  color: var(--c-ink-faint);
}
.tip-row dd {
  margin: 0;
}
.reason {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.75;
  color: var(--c-ink-soft);
}
.level-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--c-caution-bg);
  color: var(--c-caution);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
}
.caption {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.7;
  color: var(--c-ink-faint);
}

@media (max-width: 560px) {
  .diagrams {
    grid-template-columns: 1fr;
  }
}
</style>
