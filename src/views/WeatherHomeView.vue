<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import CaddyControls from '@/components/exercise/CaddyControls.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { judgePlay, degToText } from '@/utils/caddy'
import { getImpactGuide } from '@/utils/impact'
import { toast } from '@/composables/useToast'

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
      : weatherStore.courses.filter((c) =>
          `${c.name}${c.region}${c.city}`.includes(searchQuery.value.trim()),
        )
  return base.map((course) => ({
    ...course,
    play: judgePlay(course, caddyStore.holeDeg, caddyStore.windSensitivity),
    /* 카드에는 추천 샷 이름만 한 줄로 보여 준다 (상세 페이지에 전체 그림) */
    impact: getImpactGuide(
      course,
      caddyStore.holeDeg,
      caddyStore.playerLevel,
      caddyStore.windSensitivity,
    ),
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
      evacuateMsg.value = `낙뢰 위험 지역 ${n}곳! 즉시 카트로 대피하세요!`
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

/* ===== 자식(WeatherCard)이 올려보낸 remove-card 처리 ===== */
const onRemoveCard = async (course) => {
  const ok = await toast.confirm(
    `${course.name}을(를) 대시보드에서 빼시겠습니까?`,
    '대시보드에서 빼기',
  )
  if (!ok) return

  weatherStore.removeCourse(course.id)
  if (selectedCourseInfo.value?.id === course.id) selectedCourseInfo.value = null
  toast.info(`${course.name}을(를) 대시보드에서 뺐습니다.`)
}
</script>

<template>
  <div class="home-view">
    <!-- 노트 속표지 -->
    <section class="cover">
      <p class="cover-stamp label">WIND · HUMIDITY · LIGHTNING</p>
      <h2 class="cover-title">오늘, 어떻게 쳐야 할까</h2>
      <p class="cover-desc">
        전국 골프장의 실시간 기상을 받아 라운딩 가부와 클럽 선택은 물론,
        <strong>공의 어느 지점을 때려야 하는지</strong>까지 실력에 맞춰 적어 드립니다.
      </p>
      <div class="cover-cta">
        <RouterLink class="cta primary" to="/courses">
          <AppIcon name="search" :size="14" /> 골프장 찾기
        </RouterLink>
        <RouterLink class="cta" to="/club">
          <AppIcon name="calculator" :size="14" /> 클럽 계산기
        </RouterLink>
      </div>
    </section>

    <!-- watch가 감지한 낙뢰 대피 경보 -->
    <p v-if="evacuateMsg" class="evacuate-banner">
      <AppIcon name="alert" :size="16" /> {{ evacuateMsg }}
    </p>

    <div class="dashboard-grid">
      <!-- 좌측: 검색 · 조건 (데스크톱에서는 스크롤을 따라온다) -->
      <aside class="side-column">
        <!-- 공통 박스에 SearchBar를 슬롯으로 주입 -->
        <BaseDashboardCard icon="search" title="골프장 검색" index="No.01">
          <SearchBar :query="searchQuery" @update-query="onUpdateQuery" />
        </BaseDashboardCard>

        <!-- 공통 박스에 CaddyControls를 슬롯으로 주입 -->
        <BaseDashboardCard icon="club" title="라운딩 조건" index="No.02">
          <!-- 자식이 올려보낸 이벤트를 스토어 action으로 처리 -->
          <CaddyControls
            :hole-deg="caddyStore.holeDeg"
            :player-level="caddyStore.playerLevel"
            @update:hole-deg="caddyStore.setHoleDeg"
            @update:player-level="caddyStore.setPlayerLevel"
          />
        </BaseDashboardCard>

        <StatusBar :selected-course="selectedCourseInfo" :hole-text="caddyStore.holeText" />
      </aside>

      <!-- 우측: 코스 목록 -->
      <BaseDashboardCard class="main-column" icon="pin" title="코스 컨디션" index="No.03">
        <template #meta>
          {{ weatherStore.courseCount }}/{{ weatherStore.maxCourses }}곳 · HEADWIND
          {{ headwindCount }} · RISK {{ dangerCount }}
        </template>

        <!-- 데이터 출처 표시 + 갱신 버튼 -->
        <div class="source-bar">
          <span class="source-badge" :class="weatherStore.isLive ? 'live' : 'mock'">
            {{ weatherStore.isLive ? 'LIVE 실시간 관측' : 'MOCK 모의 데이터' }}
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
            {{ weatherStore.isLoading ? '불러오는 중...' : '실시간 날씨 불러오기' }}
          </button>
          <button
            class="refresh-btn"
            :disabled="weatherStore.isLoading"
            @click="weatherStore.refreshMockWeather()"
          >
            모의 갱신
          </button>
        </div>

        <p v-if="weatherStore.error" class="error-msg">
          <AppIcon name="alert" :size="14" /> {{ weatherStore.error }}
        </p>

        <div v-if="filteredCourseList.length > 0" class="card-grid">
          <WeatherCard
            v-for="course in filteredCourseList"
            :key="course.id"
            :course="course"
            @select-card="onSelectCard"
            @click-detail="onClickDetail"
            @remove-card="onRemoveCard"
          />
        </div>
        <p v-else class="no-result">'{{ searchQuery }}'와(과) 일치하는 골프장이 없습니다.</p>

        <template #footer>
          <RouterLink class="add-more" to="/courses">
            <AppIcon name="plus" :size="14" /> 다른 골프장 담기
          </RouterLink>
        </template>
      </BaseDashboardCard>
    </div>
  </div>
</template>

<style scoped>
/* ===== 히어로 : 짙은 덩어리 하나로 시선 고정 ===== */
.cover {
  padding: 44px 40px 46px;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, var(--c-deep) 0%, var(--c-deep-2) 100%);
  color: #fff;
  box-shadow: var(--shadow);
}
.cover-stamp {
  margin: 0 0 14px;
  color: var(--c-accent);
  letter-spacing: 0.12em;
}
.cover-title {
  margin: 0 0 14px;
  font-size: 46px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.045em;
}
.cover-desc {
  margin: 0 0 26px;
  max-width: 560px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.66);
}
.cover-desc strong {
  color: #fff;
  font-weight: 800;
}
.cover-cta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.cta:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
.cta:active {
  transform: scale(0.96);
}
.cta.primary {
  background: var(--c-accent);
  box-shadow: 0 8px 20px -8px var(--c-accent);
}
.cta.primary:hover {
  background: #00b366;
}

/* ===== 낙뢰 경보 ===== */
.evacuate-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  background: var(--c-danger);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  box-shadow: var(--shadow);
}

/* ===== 2단 벤토 그리드 ===== */
.dashboard-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.side-column {
  position: sticky;
  top: 92px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* ===== 데이터 출처 바 ===== */
.source-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.source-badge {
  padding: 6px 13px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.source-badge.live {
  background: var(--c-accent-soft);
  color: var(--c-accent-deep);
}
.source-badge.mock {
  background: var(--c-paper-alt);
  color: var(--c-ink-faint);
}
.updated {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-faint);
}

/* ===== 갱신 버튼 : 눌리는 맛 ===== */
.btn-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.fetch-btn,
.refresh-btn {
  padding: 15px;
  border: none;
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    box-shadow 0.18s var(--ease);
}
.fetch-btn {
  flex: 2;
  background: var(--c-accent);
  color: #fff;
  box-shadow: 0 8px 18px -10px var(--c-accent);
}
.fetch-btn:hover:not(:disabled) {
  background: #00b366;
  box-shadow: 0 12px 24px -10px var(--c-accent);
}
.refresh-btn {
  flex: 1;
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
}
.refresh-btn:hover:not(:disabled) {
  background: var(--c-rule);
  color: var(--c-ink);
}
.fetch-btn:active:not(:disabled),
.refresh-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.fetch-btn:disabled,
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

/* ===== 담기 · 빈 결과 ===== */
.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.add-more:hover {
  background: var(--c-accent-soft);
  color: var(--c-accent-deep);
}
.add-more:active {
  transform: scale(0.98);
}
.no-result {
  padding: 48px 24px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

/* 좁은 화면에서는 1단으로 접는다 */
@media (max-width: 940px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .side-column {
    position: static;
  }
  .cover {
    padding: 30px 22px 32px;
  }
  .cover-title {
    font-size: 32px;
  }
  .cover-desc {
    font-size: 15px;
  }
}
</style>
