<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { findCourseById } from '@/data/mockCourses'
import { useCaddyStore } from '@/stores/caddyStore'
import { useDisplayTemp } from '@/composables/useDisplayTemp'
import { judgePlay, degToText } from '@/utils/caddy'

/* 동적 경로 /weather/:cityId 의 파라미터를 props로 받는다 (router의 props: true) */
const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const caddyStore = useCaddyStore()

const course = ref(null)

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => course.value?.temp)

/* Mount 시점에 cityId로 Mock Data에서 도시 객체를 선택 */
onMounted(() => {
  course.value = findCourseById(props.cityId) ?? null
  console.log('[onMounted] cityId:', props.cityId, '→', course.value?.name ?? '조회 실패')
})

const play = computed(() =>
  course.value ? judgePlay(course.value, caddyStore.holeDeg, caddyStore.windSensitivity) : null,
)

const goHome = () => router.push('/')
</script>

<template>
  <div class="detail-view">
    <BaseDashboardCard v-if="course" icon="📊" title="지역별 상세 기상 관측 정보">
      <template #meta>{{ course.id }}</template>

      <h3 class="course-name">📍 {{ course.name }} · {{ course.course }}</h3>
      <p class="region">{{ course.region }}</p>

      <dl class="observe-list">
        <div class="observe-row">
          <dt>실시간 기온</dt>
          <dd>{{ displayTemp }}{{ unitSymbol }}</dd>
        </div>
        <div class="observe-row">
          <dt>기상 현황</dt>
          <dd>{{ course.status }}</dd>
        </div>
        <div class="observe-row">
          <dt>대기 습도</dt>
          <dd>{{ course.humidity }}%</dd>
        </div>
        <div class="observe-row">
          <dt>현재 풍속</dt>
          <dd>{{ course.windSpeed }}m/s</dd>
        </div>
        <div class="observe-row">
          <dt>풍향</dt>
          <dd>{{ degToText(course.windDeg) }}풍 ({{ course.windDeg }}°)</dd>
        </div>
        <div class="observe-row" :class="{ alert: course.lightning >= 50 }">
          <dt>낙뢰 확률</dt>
          <dd>{{ course.lightning }}%</dd>
        </div>
      </dl>

      <div class="advice-box">
        <p class="advice-head">
          <span class="badge" :class="play.className">{{ play.icon }} {{ play.label }}</span>
          <span class="condition">
            홀 방향 {{ caddyStore.holeText }}쪽 · {{ caddyStore.levelText }}
          </span>
        </p>
        <p class="advice">⛳ {{ play.message }}</p>
        <p class="advice club">🏌️ {{ play.club.text }}</p>
        <p v-if="play.aim" class="advice">🎯 {{ play.aim }}</p>
        <p class="advice">💧 {{ play.humidityAdvice }}</p>
      </div>

      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>

    <!-- 존재하지 않는 cityId로 접근한 경우 -->
    <BaseDashboardCard v-else icon="❓" title="조회할 수 없는 지역">
      <p class="empty">'{{ cityId }}' 코드에 해당하는 관측 지역이 없습니다.</p>
      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.course-name {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 700;
}
.region {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--c-text-sub);
}
.observe-list {
  margin: 0 0 14px;
  padding: 6px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-surface-soft);
}
.observe-row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--c-border);
}
.observe-row:last-child {
  border-bottom: none;
}
.observe-row dt {
  color: var(--c-text-sub);
}
.observe-row dd {
  margin: 0;
  font-weight: 700;
}
.observe-row.alert dd {
  color: var(--c-danger);
}
.advice-box {
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: var(--c-primary-soft);
}
.advice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 8px;
}
.condition {
  font-size: 11px;
  color: var(--c-text-sub);
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
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
.empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--c-text-sub);
}
.back-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}
.back-btn:hover {
  background: var(--c-primary-dark);
}
</style>
