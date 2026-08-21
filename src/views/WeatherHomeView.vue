<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import CaddyControls from '@/components/exercise/CaddyControls.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { judgePlay, degToText } from '@/utils/caddy'

/* Programmatic Navigation 용 라우터 인스턴스 */
const router = useRouter()

/* 날씨 데이터 · 라운딩 조건 스토어 */
const weatherStore = useWeatherStore()
const caddyStore = useCaddyStore()

/* 이 화면에서만 쓰는 반응형 상태 */
const searchQuery = ref('')
const selectedCourseInfo = ref(null)
const clickCount = ref(0)
const evacuateMsg = ref('')

/* ===== 검색 필터 + 판정 부착 (computed) ===== */
const filteredCourseList = computed(() => {
  const base =
    searchQuery.value === ''
      ? weatherStore.courses
      : weatherStore.courses.filter((c) => c.name.includes(searchQuery.value))
  return base.map((course) => ({
    ...course,
    play: judgePlay(course, caddyStore.holeDeg, caddyStore.windSensitivity),
  }))
})

/* ===== 집계 computed ===== */
const lightningCount = computed(() => weatherStore.lightningCount)
const headwindCount = computed(
  () => filteredCourseList.value.filter((c) => c.play.club.step >= 1).length,
)
const dangerCount = computed(
  () => filteredCourseList.value.filter((c) => c.play.level === 'danger').length,
)

/* ===== watch: 낙뢰 감지 → 즉시 대피 알림 ===== */
watch(
  lightningCount,
  (n, prev) => {
    if (n > 0) {
      evacuateMsg.value = `⛈️ 낙뢰 위험 지역 ${n}곳! 즉시 카트로 대피하세요!`
      console.log(`[watch] 낙뢰 경보: ${prev ?? 0}곳 → ${n}곳`)
    } else {
      evacuateMsg.value = ''
    }
  },
  { immediate: true },
)

/* ===== watch: 선택 지역 ===== */
watch(selectedCourseInfo, (newVal, oldVal) => {
  console.log('[watch] 선택 지역:', oldVal?.name ?? '없음', '→', newVal?.name)
})

/* ===== watch: 홀 방향 변경 ===== */
watch(
  () => caddyStore.holeDeg,
  (deg) => {
    console.log(
      `[watch] 홀 방향 변경: ${degToText(deg)}쪽(${deg}°) · 맞바람 홀 ${headwindCount.value}곳`,
    )
  },
)

/* ===== watch: 클릭 누적 ===== */
watch(clickCount, (n) => {
  console.log('[watch] 카드 클릭 누적:', n, '회')
})

/* ===== watchEffect: 검색어 ===== */
watchEffect(() => {
  console.log('[watchEffect] 검색어:', searchQuery.value || '(비어있음)')
})

/* ===== 첫 진입 시 실시간 날씨를 한 번 불러온다 ===== */
onMounted(() => {
  if (!weatherStore.isLive) weatherStore.fetchLiveWeather()
})

/* ===== 자식(SearchBar)이 올려보낸 update-query 처리 ===== */
const onUpdateQuery = (value) => {
  searchQuery.value = value
}

/* ===== 실시간 데이터를 받아오면 선택된 카드 정보도 갱신 ===== */
watch(
  () => weatherStore.lastUpdated,
  () => {
    if (selectedCourseInfo.value) {
      selectedCourseInfo.value = weatherStore.courseById(selectedCourseInfo.value.id) ?? null
    }
  },
)

/* ===== 자식(WeatherCard)이 올려보낸 select-card 처리 ===== */
const onSelectCard = (course) => {
  selectedCourseInfo.value = weatherStore.courseById(course.id)
  clickCount.value++
}

/* ===== 자식(WeatherCard)이 올려보낸 click-detail 처리 =====
 * alert() 대신 Programmatic Navigation 으로 상세 페이지 이동 */
const onClickDetail = (course) => {
  router.push(`/weather/${course.id}`)
}
</script>

<template>
  <div class="home-view">
    <!-- watch가 감지한 낙뢰 대피 경보 -->
    <p v-if="evacuateMsg" class="evacuate-banner">{{ evacuateMsg }}</p>

    <!-- 공통 박스에 SearchBar를 슬롯으로 주입 -->
    <BaseDashboardCard icon="🔍" title="지역 검색 (한글 즉시 동기화)">
      <SearchBar :query="searchQuery" @update-query="onUpdateQuery" />
    </BaseDashboardCard>

    <!-- 공통 박스에 CaddyControls를 슬롯으로 주입 -->
    <BaseDashboardCard icon="🏌️" title="라운딩 조건 설정">
      <!-- 자식이 올려보낸 이벤트를 스토어 action으로 처리 -->
      <CaddyControls
        :hole-deg="caddyStore.holeDeg"
        :player-level="caddyStore.playerLevel"
        @update:hole-deg="caddyStore.setHoleDeg"
        @update:player-level="caddyStore.setPlayerLevel"
      />
    </BaseDashboardCard>

    <!-- 공통 박스에 WeatherCard 목록을 슬롯으로 주입 -->
    <BaseDashboardCard icon="📍" title="지역별 코스 컨디션">
      <template #meta>
        🌬️ 맞바람 {{ headwindCount }}곳 · 🔴 위험 {{ dangerCount }}곳 · 클릭 {{ clickCount }}회
      </template>

      <!-- 데이터 출처 표시 + 갱신 버튼 -->
      <div class="source-bar">
        <span class="source-badge" :class="weatherStore.isLive ? 'live' : 'mock'">
          {{ weatherStore.isLive ? '🌐 실시간 관측' : '🧪 모의 데이터' }}
        </span>
        <span v-if="weatherStore.lastUpdatedText" class="updated">
          {{ weatherStore.lastUpdatedText }} 기준
        </span>
      </div>

      <div class="btn-row">
        <button
          class="fetch-btn"
          :disabled="weatherStore.isLoading"
          @click="weatherStore.fetchLiveWeather()"
        >
          {{ weatherStore.isLoading ? '⏳ 불러오는 중...' : '🌐 실시간 날씨 불러오기' }}
        </button>
        <button
          class="refresh-btn"
          :disabled="weatherStore.isLoading"
          @click="weatherStore.refreshMockWeather()"
        >
          🎲 모의 갱신
        </button>
      </div>

      <p v-if="weatherStore.error" class="error-msg">⚠️ {{ weatherStore.error }}</p>

      <template v-if="filteredCourseList.length > 0">
        <WeatherCard
          v-for="course in filteredCourseList"
          :key="course.id"
          :course="course"
          @select-card="onSelectCard"
          @click-detail="onClickDetail"
        />
      </template>
      <p v-else class="no-result">'{{ searchQuery }}'와(과) 일치하는 지역이 없습니다.</p>

      <template #footer>
        <StatusBar :selected-course="selectedCourseInfo" :hole-text="caddyStore.holeText" />
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.evacuate-banner {
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid var(--c-danger);
  border-radius: var(--radius);
  background: var(--c-danger-bg);
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 700;
}
.source-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.source-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.source-badge.live {
  background: var(--c-primary-soft);
  color: var(--c-primary);
}
.source-badge.mock {
  background: var(--c-surface-soft);
  color: var(--c-text-sub);
}
.updated {
  font-size: 11px;
  color: var(--c-text-sub);
}
.btn-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.fetch-btn {
  flex: 2;
  padding: 9px;
  border: none;
  border-radius: 8px;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}
.fetch-btn:hover:not(:disabled) {
  background: var(--c-primary-dark);
}
.fetch-btn:disabled,
.refresh-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.error-msg {
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid var(--c-danger);
  border-radius: 8px;
  background: var(--c-danger-bg);
  color: var(--c-danger);
  font-size: 12px;
}
.refresh-btn {
  flex: 1;
  padding: 9px;
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
.no-result {
  padding: 28px 20px;
  border-radius: var(--radius);
  background: var(--c-surface-soft);
  text-align: center;
  font-size: 13px;
  color: var(--c-text-sub);
}
</style>
