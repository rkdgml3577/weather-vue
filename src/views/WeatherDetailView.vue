<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import ImpactPointGuide from '@/components/exercise/ImpactPointGuide.vue'
import CaddyControls from '@/components/exercise/CaddyControls.vue'
import { useWeatherStore } from '@/stores/weatherStore'
import { useCaddyStore } from '@/stores/caddyStore'
import { useConfigStore } from '@/stores/configStore'
import { useDisplayTemp, convertTemp } from '@/composables/useDisplayTemp'
import { getForecast, getAirPollution } from '@/api/weatherApi'
import { mapForecast, mapAirPollution } from '@/utils/weatherMapper'
import { judgePlay, degToText } from '@/utils/caddy'
import { getImpactGuide } from '@/utils/impact'
import { getTeeTimeSummary } from '@/utils/teeTime'
import { findGolfCourse } from '@/data/golfCourses'
import { createMockForecast, createMockAir } from '@/data/mockCourses'
import { toast } from '@/composables/useToast'

/* 동적 경로 /weather/:cityId 의 파라미터를 props로 받는다 (router의 props: true) */
const props = defineProps({
  cityId: { type: String, required: true },
})

const router = useRouter()
const weatherStore = useWeatherStore()
const caddyStore = useCaddyStore()
const configStore = useConfigStore()

const course = ref(null)
const forecast = ref([])
const air = ref(null)
const isLoading = ref(false)
const error = ref('')

/* 스토어의 단위 설정에 맞춰 변환된 온도 */
const { displayTemp, unitSymbol } = useDisplayTemp(() => course.value?.temp)

/* ===== 모의 데이터 모드 =====
 * 대시보드가 모의 데이터를 보고 있으면 상세도 통신 없이 모의 값으로 채운다.
 * (예전에는 상세만 몰래 실시간을 불러와 두 화면의 기준이 어긋났다) */
const loadMock = () => {
  error.value = ''
  /* 아직 한 번도 값이 채워지지 않았다면 이 골프장만 모의 값으로 채운다 */
  course.value = weatherStore.mockCourseWeather(props.cityId) ?? course.value
  forecast.value = createMockForecast(course.value, 6)
  air.value = createMockAir()
}

/* ===== 실시간 조회 : 현재 날씨 + 예보 + 대기오염 ===== */
const loadLive = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const [fetched, forecastData, airData] = await Promise.all([
      weatherStore.fetchCourseWeather(props.cityId),
      getForecast(course.value.lat, course.value.lon, 6),
      getAirPollution(course.value.lat, course.value.lon),
    ])
    course.value = fetched ?? course.value
    forecast.value = mapForecast(forecastData, 6)
    air.value = mapAirPollution(airData)
    return true
  } catch (err) {
    error.value = err.friendlyMessage ?? err.message
    console.error('[WeatherDetailView] 추가 정보 조회 실패:', err)
    return false
  } finally {
    isLoading.value = false
  }
}

/* Mount 시점에 cityId로 골프장을 선택하고, 현재 모드에 맞춰 채운다 */
onMounted(async () => {
  /* 대시보드에 없는 골프장이면 전체 디렉터리에서 찾는다 */
  course.value = weatherStore.courseById(props.cityId) ?? findGolfCourse(props.cityId) ?? null
  console.log('[onMounted] courseId:', props.cityId, '→', course.value?.name ?? '조회 실패')
  if (!course.value) return

  if (weatherStore.isLive) {
    await loadLive()
  } else {
    loadMock()
  }
})

/* 상세 화면에서 바로 모드를 바꿀 수 있다 */
const switchToLive = async () => {
  const ok = await loadLive()
  if (ok) toast.success(`${course.value.name}의 실시간 관측을 불러왔습니다.`)
  else toast.error(error.value || '실시간 관측을 불러오지 못했습니다.')
}

const switchToMock = () => {
  weatherStore.refreshMockWeather()
  course.value = weatherStore.courseById(props.cityId) ?? course.value
  loadMock()
  toast.info('모의 데이터로 전환했습니다. 통신 없이 화면 동작만 확인합니다.')
}

const play = computed(() =>
  course.value ? judgePlay(course.value, caddyStore.holeDeg, caddyStore.windSensitivity) : null,
)

/* 실력·홀 방향·바람이 바뀌면 임팩트 지점도 즉시 다시 계산된다 */
const impactGuide = computed(() =>
  course.value
    ? getImpactGuide(
        course.value,
        caddyStore.holeDeg,
        caddyStore.playerLevel,
        caddyStore.windSensitivity,
      )
    : null,
)

/* 일몰까지 남은 시간으로 소화 가능한 홀 수를 계산 (추가 API 호출 없음) */
const teeSummary = computed(() => (course.value ? getTeeTimeSummary(course.value) : null))

/* 예보 슬롯도 현재 날씨와 똑같은 기준으로 판정한다 */
const teeTimes = computed(() =>
  forecast.value.map((slot) => ({
    ...slot,
    play: judgePlay(slot, caddyStore.holeDeg, caddyStore.windSensitivity),
  })),
)

/* 추천 티타임: 가장 이른 '최적' 시간, 없으면 '주의' 중 첫 번째 */
const bestTeeTime = computed(
  () =>
    teeTimes.value.find((t) => t.play.level === 'good') ??
    teeTimes.value.find((t) => t.play.level === 'caution') ??
    null,
)

/* 예보 목록의 온도도 단위 설정을 따른다 */
const slotTemp = (temp) => convertTemp(temp, configStore.unit)

const goHome = () => router.push('/')
</script>

<template>
  <div class="detail-view">
    <BaseDashboardCard v-if="course" icon="chart" title="골프장 상세 기상 관측 정보">
      <template #meta>{{ course.id }}</template>

      <h3 class="course-name"><AppIcon name="pin" :size="16" /> {{ course.name }}</h3>
      <p class="region">
        {{ course.region }} {{ course.city }} · {{ course.holes }}홀 · {{ course.type }}
      </p>

      <!-- 데이터 출처 : 대시보드와 같은 모드를 따른다 -->
      <div class="source-row">
        <span class="source-badge" :class="weatherStore.isLive ? 'live' : 'mock'">
          {{ weatherStore.isLive ? 'LIVE 실시간 관측' : 'MOCK 모의 데이터' }}
        </span>
        <button
          v-if="!weatherStore.isLive"
          class="source-btn"
          :disabled="isLoading"
          @click="switchToLive"
        >
          {{ isLoading ? '불러오는 중...' : '실시간으로 보기' }}
        </button>
        <button v-else class="source-btn" @click="switchToMock">모의 데이터로 보기</button>
      </div>

      <dl class="observe-list">
        <div class="observe-row">
          <dt>실시간 기온</dt>
          <dd>{{ displayTemp }}{{ unitSymbol }}</dd>
        </div>
        <div class="observe-row">
          <dt>기상 현황</dt>
          <dd>{{ course.description ?? course.status }}</dd>
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
        <!-- 추가 API: 대기 오염 -->
        <div v-if="air" class="observe-row" :class="{ alert: air.aqi >= 4 }">
          <dt>대기질 (미세먼지)</dt>
          <dd>{{ air.aqiText }} · PM10 {{ air.pm10 }} / PM2.5 {{ air.pm25 }}</dd>
        </div>
      </dl>

      <div class="advice-box">
        <p class="advice-head">
          <span class="badge" :class="play.className">{{ play.label }}</span>
          <span class="condition">
            홀 방향 {{ caddyStore.holeText }}쪽 · {{ caddyStore.levelText }}
          </span>
        </p>
        <p class="advice">{{ play.message }}</p>
        <p class="advice club"><AppIcon name="club" :size="14" /> {{ play.club.text }}</p>
        <p v-if="play.aim" class="advice"><AppIcon name="target" :size="14" /> {{ play.aim }}</p>
        <p class="advice"><AppIcon name="droplet" :size="14" /> {{ play.humidityAdvice }}</p>
      </div>

      <!-- 일몰 기준 잔여 홀 (현재 날씨 응답의 sunset 활용) -->
      <section v-if="teeSummary" class="sun-section" :class="{ tight: teeSummary.isTight }">
        <p class="sun-head">
          <AppIcon name="sunset" :size="15" /> 일몰 {{ teeSummary.sunsetText }} ·
          <strong>{{ teeSummary.message }}</strong>
        </p>
        <p class="sun-sub">
          18홀 마지막 티오프 {{ teeSummary.lastTeeOff18 }} · 9홀 {{ teeSummary.lastTeeOff9 }}
          (홀당 15분 기준)
        </p>
      </section>

      <!-- 임팩트 포인트 가이드 -->
      <section class="impact-section">
        <div class="impact-head">
          <h4 class="section-title">
            <AppIcon name="club" :size="14" /> 어디를 쳐야 하나 — 임팩트 포인트
          </h4>
          <span class="level-chip">{{ caddyStore.levelText }} 기준</span>
        </div>

        <!-- 조건을 이 화면에서 바로 바꿔 볼 수 있게 컨트롤을 함께 둔다 -->
        <CaddyControls
          :hole-deg="caddyStore.holeDeg"
          :player-level="caddyStore.playerLevel"
          @update:hole-deg="caddyStore.setHoleDeg"
          @update:player-level="caddyStore.setPlayerLevel"
        />

        <ImpactPointGuide v-if="impactGuide" :guide="impactGuide" />
      </section>

      <!-- 추가 API: 3시간 단위 예보 → 티타임 추천 -->
      <section class="forecast-section">
        <h4 class="forecast-title">
          <AppIcon name="clock" :size="14" /> 티타임 추천 (3시간 단위{{
            weatherStore.isLive ? ' 예보' : ' 모의 예보'
          }})
        </h4>

        <p v-if="isLoading" class="hint">
          <AppIcon name="loader" :size="13" /> 예보와 대기질 정보를 불러오는 중...
        </p>
        <p v-else-if="error" class="error-msg"><AppIcon name="alert" :size="14" /> {{ error }}</p>

        <template v-else-if="teeTimes.length > 0">
          <p v-if="bestTeeTime" class="best-tee">
            <AppIcon name="thumb" :size="14" /> <strong>{{ bestTeeTime.timeText }}</strong> 티오프를
            추천합니다 ·
            {{ bestTeeTime.play.label }}
          </p>
          <p v-else class="best-tee warn">
            <AppIcon name="frown" :size="14" /> 향후 18시간 내 추천할 만한 시간대가 없습니다.
          </p>

          <ul class="tee-list">
            <li
              v-for="slot in teeTimes"
              :key="slot.at"
              class="tee-row"
              :class="slot.play.className"
            >
              <span class="tee-time">{{ slot.timeText }}</span>
              <span class="tee-info">
                {{ slot.description }} · {{ slotTemp(slot.temp) }}{{ unitSymbol }} · WIND
                {{ slot.windSpeed }}m/s · RAIN {{ slot.pop }}%
              </span>
            </li>
          </ul>
        </template>
      </section>

      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>

    <!-- 존재하지 않는 cityId로 접근한 경우 -->
    <BaseDashboardCard v-else icon="help" title="조회할 수 없는 골프장">
      <p class="empty">'{{ cityId }}' 코드에 해당하는 관측 지역이 없습니다.</p>
      <template #footer>
        <button class="back-btn" @click="goHome">← 메인 대시보드로 돌아가기</button>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.course-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.course-name :deep(svg) {
  color: var(--c-accent);
  stroke-width: 2.2;
}
.source-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
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
.source-btn {
  padding: 6px 13px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-deep);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.source-btn:hover:not(:disabled) {
  background: var(--c-deep-2);
}
.source-btn:active:not(:disabled) {
  transform: scale(0.94);
}
.source-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.region {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

/* ===== 관측값 타일 ===== */
.observe-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin: 0 0 16px;
}
.observe-row {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
}
.observe-row dt {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-faint);
}
.observe-row dd {
  margin: 4px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
/* 대기질 타일만 값이 길다 — 2칸을 쓰고 글자를 줄인다 (v-if라 항상 7번째) */
.observe-row:nth-child(7) {
  grid-column: span 2;
}
.observe-row:nth-child(7) dd {
  font-size: 17px;
}
.observe-row.alert {
  background: var(--c-danger-bg);
}
.observe-row.alert dt,
.observe-row.alert dd {
  color: var(--c-danger);
}

/* ===== 캐디 조언 ===== */
.advice-box {
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--c-accent-soft);
}
.advice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 0 12px;
}
.condition {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-soft);
}
.badge {
  padding: 7px 15px;
  border-radius: var(--radius-pill);
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}
.play-good {
  background: var(--c-good);
}
.play-caution {
  background: var(--c-caution);
}
.play-danger {
  background: var(--c-danger);
}
.advice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--c-ink-soft);
}
.advice:last-child {
  margin-bottom: 0;
}
.advice.club {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-accent-deep);
}
.advice :deep(svg) {
  margin-top: 3px;
  flex-shrink: 0;
}

/* ===== 일몰 ===== */
.sun-section {
  margin-top: 16px;
  padding: 18px 20px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
}
.sun-section.tight {
  background: var(--c-caution-bg);
}
.sun-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
}
.sun-head strong {
  font-weight: 800;
}
.sun-sub {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-faint);
}

/* ===== 섹션 공통 ===== */
.impact-section,
.forecast-section {
  margin-top: 28px;
}
.impact-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.section-title,
.forecast-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.impact-head .section-title {
  margin: 0;
}
.section-title :deep(svg),
.forecast-title :deep(svg) {
  color: var(--c-accent);
  stroke-width: 2.2;
}
.level-chip {
  padding: 6px 13px;
  border-radius: var(--radius-pill);
  background: var(--c-deep);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

/* ===== 예보 ===== */
.hint,
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 700;
}
.hint {
  background: var(--c-paper-alt);
  color: var(--c-ink-soft);
}
.error-msg {
  background: var(--c-danger-bg);
  color: var(--c-danger);
}
.best-tee {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 16px 18px;
  border-radius: var(--radius);
  background: var(--c-good-bg);
  color: var(--c-accent-deep);
  font-size: 15px;
  font-weight: 700;
}
.best-tee strong {
  font-weight: 800;
}
.best-tee.warn {
  background: var(--c-caution-bg);
  color: var(--c-caution);
}
.tee-list {
  display: grid;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.tee-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--c-paper-alt);
  font-size: 13px;
}
.tee-row.play-good {
  background: var(--c-good-bg);
}
.tee-row.play-caution {
  background: var(--c-caution-bg);
}
.tee-row.play-danger {
  background: var(--c-danger-bg);
}
.tee-time {
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.tee-info {
  font-weight: 600;
  color: var(--c-ink-soft);
  text-align: right;
}

/* ===== 기타 ===== */
.empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-ink-faint);
}
.back-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--c-deep);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease),
    background 0.18s var(--ease);
}
.back-btn:hover {
  background: var(--c-deep-2);
}
.back-btn:active {
  transform: scale(0.98);
}

@media (max-width: 560px) {
  .course-name {
    font-size: 26px;
  }
}
</style>
