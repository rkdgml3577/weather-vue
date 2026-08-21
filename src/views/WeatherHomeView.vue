<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import CaddyControls from '@/components/exercise/CaddyControls.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'
import { courseList, refreshWeather } from '@/data/mockCourses'
import { useCaddyStore } from '@/stores/caddyStore'
import { judgePlay, degToText } from '@/utils/caddy'

/* Programmatic Navigation 용 라우터 인스턴스 */
const router = useRouter()

/* 페이지를 이동해도 유지되는 라운딩 조건 (Pinia 스토어) */
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
      ? courseList.value
      : courseList.value.filter((c) => c.name.includes(searchQuery.value))
  return base.map((course) => ({
    ...course,
    play: judgePlay(course, caddyStore.holeDeg, caddyStore.windSensitivity),
  }))
})

/* ===== 집계 computed ===== */
const lightningCount = computed(() => courseList.value.filter((c) => c.lightning >= 50).length)
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

/* ===== 자식(SearchBar)이 올려보낸 update-query 처리 ===== */
const onUpdateQuery = (value) => {
  searchQuery.value = value
}

/* ===== 자식(WeatherCard)이 올려보낸 select-card 처리 ===== */
const onSelectCard = (course) => {
  selectedCourseInfo.value = courseList.value.find((c) => c.id === course.id)
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

      <button class="refresh-btn" @click="refreshWeather">🔄 기상 정보 갱신</button>

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
.no-result {
  padding: 28px 20px;
  border-radius: var(--radius);
  background: var(--c-surface-soft);
  text-align: center;
  font-size: 13px;
  color: var(--c-text-sub);
}
</style>
