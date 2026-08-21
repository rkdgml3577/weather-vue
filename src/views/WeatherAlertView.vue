<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { courseList, refreshWeather } from '@/data/mockCourses'
import { useCaddyStore } from '@/stores/caddyStore'
import { judgePlay } from '@/utils/caddy'

/* 추가 View: 위험/주의 지역만 모아 보는 경보 현황 페이지 */
const caddyStore = useCaddyStore()

const alertList = computed(() =>
  courseList.value
    .map((course) => ({
      ...course,
      play: judgePlay(course, caddyStore.holeDeg, caddyStore.windSensitivity),
    }))
    .filter((c) => c.play.level !== 'good')
    .sort((a, b) => b.lightning - a.lightning),
)

const dangerCount = computed(() => alertList.value.filter((c) => c.play.level === 'danger').length)
</script>

<template>
  <div class="alert-view">
    <BaseDashboardCard icon="⛈️" title="낙뢰 · 기상 경보 현황">
      <template #meta>🔴 위험 {{ dangerCount }}곳 / 전체 {{ alertList.length }}곳</template>

      <button class="refresh-btn" @click="refreshWeather">🔄 기상 정보 갱신</button>

      <ul v-if="alertList.length > 0" class="alert-list">
        <li
          v-for="course in alertList"
          :key="course.id"
          class="alert-row"
          :class="course.play.className"
        >
          <RouterLink class="alert-link" :to="`/weather/${course.id}`">
            <span class="alert-name">{{ course.play.icon }} {{ course.name }}</span>
            <span class="alert-detail">
              ⚡{{ course.lightning }}% · 🌬️{{ course.windSpeed }}m/s · 💧{{ course.humidity }}%
            </span>
          </RouterLink>
          <p class="alert-msg">{{ course.play.message }}</p>
        </li>
      </ul>
      <p v-else class="no-alert">🟢 현재 경보가 발효된 지역이 없습니다. 좋은 라운딩 되세요!</p>

      <template #footer>
        <RouterLink class="link-btn" to="/">대시보드 홈으로 이동</RouterLink>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.refresh-btn {
  width: 100%;
  padding: 9px;
  margin-bottom: 12px;
  border: 1px dashed var(--c-border-strong);
  border-radius: 8px;
  background: var(--c-surface);
  color: var(--c-text-sub);
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
}
.refresh-btn:hover {
  border-color: var(--c-primary);
  background: var(--c-primary-soft);
  color: var(--c-primary);
}
.alert-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.alert-row {
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: var(--radius);
  border: 1px solid transparent;
}
.alert-row:last-child {
  margin-bottom: 0;
}
.play-caution {
  background: var(--c-caution-bg);
  border-color: #f3dfbb;
}
.play-danger {
  background: var(--c-danger-bg);
  border-color: #f5c6c2;
}
.alert-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: inherit;
}
.alert-link:hover .alert-name {
  text-decoration: underline;
}
.alert-name {
  font-size: 15px;
  font-weight: 700;
}
.alert-detail {
  font-size: 11px;
  color: var(--c-text-sub);
}
.alert-msg {
  margin: 4px 0 0;
  font-size: 12px;
}
.no-alert {
  padding: 28px 20px;
  border-radius: var(--radius);
  background: var(--c-good-bg);
  color: var(--c-good);
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}
.link-btn {
  display: block;
  padding: 10px;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
}
.link-btn:hover {
  background: var(--c-primary-dark);
}
</style>
