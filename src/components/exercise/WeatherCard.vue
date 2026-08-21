<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { useDisplayTemp } from '@/composables/useDisplayTemp'

const props = defineProps({
  course: Object,
})

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => props.course.temp)

/* 카드 선택(select-card) / 상세보기(click-detail) / 대시보드에서 빼기를 부모에게 전달 */
const emit = defineEmits(['select-card', 'click-detail', 'remove-card'])

const onSelect = () => {
  emit('select-card', props.course)
}

const onDetail = (e) => {
  e.stopPropagation()
  emit('click-detail', props.course)
}

const onRemove = (e) => {
  e.stopPropagation()
  emit('remove-card', props.course)
}
</script>

<template>
  <article class="entry" :class="course.play.className" @click="onSelect">
    <!-- 항목 머리: 골프장 이름과 소재지 -->
    <header class="entry-head">
      <div class="head-text">
        <h3 class="course-name">{{ course.name }}</h3>
        <p class="course-place label">{{ course.region }} {{ course.city }}</p>
      </div>
      <div class="head-btns">
        <button class="link-btn" @click="onDetail">상세 기록</button>
        <button class="icon-btn" title="노트에서 빼기" @click="onRemove">
          <AppIcon name="close" :size="13" />
        </button>
      </div>
    </header>

    <!-- 관측값: 야드지북의 수치 표 -->
    <dl class="reading">
      <div class="reading-row">
        <dt class="label">TEMP</dt>
        <dd class="num">{{ displayTemp }}{{ unitSymbol }}</dd>
      </div>
      <div class="reading-row">
        <dt class="label">WIND</dt>
        <dd class="num">{{ course.windSpeed }}<small>m/s</small></dd>
      </div>
      <div class="reading-row">
        <dt class="label">HUMID</dt>
        <dd class="num">{{ course.humidity }}<small>%</small></dd>
      </div>
      <div class="reading-row" :class="{ alert: course.lightning >= 50 }">
        <dt class="label">LTNG</dt>
        <dd class="num">{{ course.lightning }}<small>%</small></dd>
      </div>
    </dl>

    <p class="wind-line">
      <AppIcon name="wind" :size="14" />
      {{ course.play.windText }} · {{ course.status }}
    </p>

    <!-- 라운딩 판정 도장 -->
    <p class="verdict">
      <span class="stamp">{{ course.play.label }}</span>
      <span v-if="course.play.club.step >= 1" class="tag">맞바람</span>
      <span v-else-if="course.play.club.step <= -1" class="tag">뒷바람</span>
    </p>

    <p class="play-msg">{{ course.play.message }}</p>

    <!-- 캐디가 적어 넣은 조언 -->
    <div class="note">
      <p class="hand note-club">{{ course.play.club.text }}</p>
      <p v-if="course.play.aim" class="note-line">{{ course.play.aim }}</p>
      <p class="note-line">{{ course.play.humidityAdvice }}</p>
      <p v-if="course.impact" class="note-shot">
        <span class="label">SHOT</span>
        <strong>{{ course.impact.shotName }}</strong> · {{ course.impact.zoneLabel }}
      </p>
    </div>
  </article>
</template>

<style scoped>
/* ===== 코스 카드 : 눌리는 덩어리 ===== */
.entry {
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--c-paper);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    transform 0.22s var(--ease),
    box-shadow 0.22s var(--ease);
}
.entry:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lift);
}
.entry:active {
  transform: translateY(-1px) scale(0.99);
}

/* ===== 머리 ===== */
.entry-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.head-text {
  min-width: 0;
}
.course-name {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.25;
}
.course-place {
  margin: 3px 0 0;
  font-size: 11px;
}
.head-btns {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.link-btn {
  padding: 7px 13px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  color: var(--c-ink);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.link-btn:hover {
  background: var(--c-deep);
  color: var(--c-paper);
}
.link-btn:active {
  transform: scale(0.92);
}
.icon-btn {
  display: flex;
  padding: 7px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  color: var(--c-ink-faint);
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.icon-btn:hover {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.icon-btn:active {
  transform: scale(0.88);
}

/* ===== 수치 타일 : 벤토 안의 작은 벤토 ===== */
.reading {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 0 0 14px;
}
.reading-row {
  padding: 12px 6px 11px;
  border-radius: var(--radius-sm);
  background: var(--c-paper-alt);
  text-align: center;
}
.reading-row dt {
  font-size: 10px;
  letter-spacing: 0.04em;
}
.reading-row dd {
  margin: 3px 0 0;
  font-size: 24px;
  line-height: 1.1;
  color: var(--c-ink);
}
.reading-row dd small {
  margin-left: 1px;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-ink-faint);
}
/* 낙뢰 위험은 타일째 붉게 */
.reading-row.alert {
  background: var(--c-danger-bg);
}
.reading-row.alert dt,
.reading-row.alert dd,
.reading-row.alert dd small {
  color: var(--c-danger);
}

.wind-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-soft);
}

/* ===== 판정 배지 ===== */
.verdict {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
}
.stamp {
  padding: 6px 13px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.play-good .stamp {
  background: var(--c-good);
  color: #fff;
}
.play-caution .stamp {
  background: var(--c-caution);
  color: #fff;
}
.play-danger .stamp {
  background: var(--c-danger);
  color: #fff;
}
.tag {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--c-paper-alt);
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-soft);
}
.play-msg {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--c-ink-soft);
}

/* ===== 캐디 메모 타일 ===== */
.note {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-accent-soft);
}
.note-club {
  margin: 0 0 6px;
  color: var(--c-accent-deep);
}
.note-line {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-soft);
}
.note-shot {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0 0;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--c-accent) 18%, transparent);
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-soft);
}
.note-shot strong {
  font-weight: 800;
  color: var(--c-accent-deep);
}
</style>
