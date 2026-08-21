<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { judgePlay } from '@/utils/caddy'

/* 추가 View: 위험/주의 지역만 모아 보는 경보 현황 페이지 */
const weatherStore = useWeatherStore()
const caddyStore = useCaddyStore()

const alertList = computed(() =>
  weatherStore.courses
    .map((course) => ({
      ...course,
      play: judgePlay(course, caddyStore.holeDeg, caddyStore.windSensitivity),
    }))
    .filter((c) => c.play.level !== 'good')
    .sort((a, b) => b.lightning - a.lightning),
)

/* 이 페이지로 바로 들어와도 실시간 데이터를 한 번 불러온다 */
onMounted(() => {
  if (!weatherStore.isLive) weatherStore.fetchLiveWeather()
})

const dangerCount = computed(() => alertList.value.filter((c) => c.play.level === 'danger').length)
</script>

<template>
  <div class="alert-view">
    <BaseDashboardCard icon="rain" title="낙뢰 · 기상 경보 현황">
      <template #meta>위험 {{ dangerCount }}곳 / 전체 {{ alertList.length }}곳</template>

      <button
        class="refresh-btn"
        :disabled="weatherStore.isLoading"
        @click="weatherStore.fetchLiveWeather()"
      >
        {{ weatherStore.isLoading ? '불러오는 중...' : '실시간 날씨 다시 불러오기' }}
      </button>
      <p v-if="weatherStore.error" class="error-msg">
        <AppIcon name="alert" :size="14" /> {{ weatherStore.error }}
      </p>

      <ul v-if="alertList.length > 0" class="alert-list">
        <li
          v-for="course in alertList"
          :key="course.id"
          class="alert-row"
          :class="course.play.className"
        >
          <RouterLink class="alert-link" :to="`/weather/${course.id}`">
            <span class="alert-name">{{ course.name }}</span>
            <span class="alert-detail">
              LTNG {{ course.lightning }}% · WIND {{ course.windSpeed }}m/s · HUM
              {{ course.humidity }}%
            </span>
          </RouterLink>
          <p class="alert-msg">{{ course.play.message }}</p>
        </li>
      </ul>
      <p v-else class="no-alert">현재 경보가 발효된 지역이 없습니다. 좋은 라운딩 되세요.</p>

      <template #footer>
        <RouterLink class="link-btn" to="/">대시보드 홈으로 이동</RouterLink>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.refresh-btn {
  width: 100%;
  padding: 16px;
  margin-bottom: 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  color: var(--c-ink);
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.refresh-btn:hover:not(:disabled) {
  background: var(--c-rule);
}
.refresh-btn:active:not(:disabled) {
  transform: scale(0.98);
}
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: var(--radius);
  background: var(--c-danger-bg);
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 700;
}
.alert-list {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.alert-row {
  padding: 18px 20px;
  border-radius: var(--radius);
  transition: transform 0.18s var(--ease);
}
.alert-row:hover {
  transform: translateY(-2px);
}
.play-caution {
  background: var(--c-caution-bg);
}
.play-danger {
  background: var(--c-danger-bg);
}
.alert-link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  color: inherit;
}
.alert-name {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--c-ink);
}
.alert-link:hover .alert-name {
  color: var(--c-accent-deep);
}
.alert-detail {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--c-ink-soft);
  text-align: right;
}
.alert-msg {
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-soft);
}
.no-alert {
  padding: 48px 24px;
  border-radius: var(--radius);
  background: var(--c-good-bg);
  color: var(--c-accent-deep);
  text-align: center;
  font-size: 16px;
  font-weight: 800;
}
.link-btn {
  display: block;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-deep);
  color: #fff;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  transition: transform 0.18s var(--ease);
}
.link-btn:hover {
  background: var(--c-deep-2);
  color: #fff;
}
.link-btn:active {
  transform: scale(0.98);
}
</style>
