<script setup>
import { useDisplayTemp } from '@/composables/useDisplayTemp'

const props = defineProps({
  course: Object,
})

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => props.course.temp)

/* 카드 선택(select-card) / 상세보기(click-detail)를 부모에게 전달 */
const emit = defineEmits(['select-card', 'click-detail'])

const onSelect = () => {
  emit('select-card', props.course)
}

const onDetail = (e) => {
  e.stopPropagation()
  emit('click-detail', props.course)
}
</script>

<template>
  <div class="course-card" @click="onSelect">
    <div class="card-head">
      <span class="course-name">{{ course.name }}</span>
      <button class="detail-btn" @click="onDetail">상세보기</button>
    </div>

    <p class="course-weather">{{ course.status }} · {{ displayTemp }}{{ unitSymbol }}</p>

    <!-- 영향 변수 4종 -->
    <ul class="factor-list">
      <li>🌬️ 바람 {{ course.play.windText }}</li>
      <li>💧 습도 {{ course.humidity }}%</li>
      <li :class="{ 'factor-alert': course.lightning >= 50 }">⚡ 낙뢰 {{ course.lightning }}%</li>
    </ul>

    <!-- 라운딩 판정 배지 -->
    <span class="badge" :class="course.play.className">
      {{ course.play.icon }} {{ course.play.label }}
    </span>
    <span v-if="course.play.club.step >= 1" class="badge badge-head">🌬️ 맞바람</span>
    <span v-else-if="course.play.club.step <= -1" class="badge badge-tail">🍃 뒷바람</span>

    <p class="play-msg">⛳ {{ course.play.message }}</p>

    <!-- 캐디 조언 -->
    <div class="advice-box">
      <p class="advice club">🏌️ {{ course.play.club.text }}</p>
      <p v-if="course.play.aim" class="advice">🎯 {{ course.play.aim }}</p>
      <p class="advice">💧 {{ course.play.humidityAdvice }}</p>
    </div>
  </div>
</template>

<style scoped>
.course-card {
  padding: 14px;
  margin-bottom: 10px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.15s;
}
.course-card:last-child {
  margin-bottom: 0;
}
.course-card:hover {
  border-color: var(--c-primary);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.course-name {
  font-size: 16px;
  font-weight: 700;
}
.course-weather {
  margin: 2px 0 10px;
  font-size: 13px;
  color: var(--c-text-sub);
}
.factor-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  list-style: none;
  padding: 8px 10px;
  margin: 0 0 10px;
  border-radius: 8px;
  background: var(--c-surface-soft);
  font-size: 12px;
  color: var(--c-text-sub);
}
.factor-alert {
  color: var(--c-danger);
  font-weight: 700;
}
.badge {
  display: inline-block;
  margin-right: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.badge-head {
  background: var(--c-caution-bg);
  color: var(--c-caution);
}
.badge-tail {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}
.play-good {
  background: var(--c-good-bg);
  color: var(--c-good);
}
.play-caution {
  background: var(--c-caution-bg);
  color: var(--c-caution);
}
.play-danger {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.play-msg {
  margin: 10px 0 8px;
  font-size: 13px;
}
.advice-box {
  padding: 10px 12px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface-soft);
}
.advice {
  margin: 0 0 4px;
  font-size: 13px;
}
.advice:last-child {
  margin-bottom: 0;
}
.advice.club {
  font-weight: 700;
}
.detail-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--c-border-strong);
  border-radius: 8px;
  background: var(--c-surface);
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}
.detail-btn:hover {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: #fff;
}
</style>
